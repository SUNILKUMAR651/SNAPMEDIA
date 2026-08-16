import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { Readable, PassThrough } from "stream";
import { getYtDlpPath, getYtDlpCookieArgs, getYtDlpProxyArgs } from "../extractor/ytdlp";

export interface StreamProcessingOptions {
  url: string;
  formatId?: string;
  isAudioOnly?: boolean;
  audioBitrate?: string; // e.g. "320k", "128k"
  title?: string;
  ext?: string;
}

export interface StreamResult {
  stream: Readable;
  filename: string;
  contentType: string;
  fileSize?: number;
  filePath?: string;
  cleanup?: () => void;
}

export function getFfmpegPath(): string {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }

  const directPaths = [
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "C:\\Users\\sunil\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe",
    "C:\\Users\\sunil\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe",
    "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
  ];

  for (const p of directPaths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }

  return "ffmpeg";
}

/**
 * Sanitize filename to avoid header injection or invalid characters across Windows/Unix
 */
export function sanitizeFilename(rawTitle: string, ext: string = "mp4"): string {
  const sanitized = String(rawTitle || "downloaded_video")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return `${sanitized || "download"}.${ext}`;
}

/**
 * Periodic cleanup of old temporary files
 */
function cleanupOldTempFiles() {
  try {
    const tmpDir = os.tmpdir();
    const now = Date.now();
    const files = fs.readdirSync(tmpDir);
    for (const file of files) {
      if (file.startsWith("snapmedia_")) {
        const filePath = path.join(tmpDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > 15 * 60 * 1000) {
            fs.unlinkSync(filePath);
          }
        } catch {}
      }
    }
  } catch {}
}

/**
 * Downloads the video/audio to a temporary file with FFmpeg merging and faststart,
 * then returns a readable file stream with exact size and auto-cleanup.
 */
export async function createDownloadStream(options: StreamProcessingOptions): Promise<StreamResult> {
  const {
    url,
    formatId = "best",
    isAudioOnly = false,
    audioBitrate = "320k",
    title = "media",
    ext = isAudioOnly ? "mp3" : "mp4",
  } = options;

  cleanupOldTempFiles();

  const ytdlpPath = getYtDlpPath();
  const ffmpegPath = getFfmpegPath();
  const filename = sanitizeFilename(title, ext);
  const contentType = isAudioOnly ? "audio/mpeg" : "video/mp4";

  const randomId = Math.random().toString(36).substring(2, 8);
  const tempBase = path.join(os.tmpdir(), `snapmedia_${Date.now()}_${randomId}`);
  const tempOutputFile = `${tempBase}.${ext}`;

  const baseArgs: string[] = [
    "--no-playlist",
    "--no-warnings",
    "--no-check-certificates",
    "--socket-timeout", "40",
    "--geo-bypass",
    ...getYtDlpCookieArgs(),
    ...getYtDlpProxyArgs(),
    "--extractor-args", "youtube:player_client=android,web,ios;player_skip=configs",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  ];

  if (ffmpegPath && ffmpegPath !== "ffmpeg") {
    const ffmpegDir = path.dirname(ffmpegPath);
    baseArgs.push("--ffmpeg-location", ffmpegDir);
  }

  if (isAudioOnly) {
    baseArgs.push(
      "-x",
      "--audio-format", "mp3",
      "--audio-quality", audioBitrate === "320k" ? "0" : "5",
      "-o", tempOutputFile,
      url
    );
  } else {
    // Determine video format
    let formatFilter = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best";

    const heightMatch = String(formatId).match(/(\d{3,4})p?/);
    if (heightMatch && heightMatch[1]) {
      const h = parseInt(heightMatch[1], 10);
      formatFilter = `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`;
    } else if (formatId && formatId !== "best" && !formatId.includes("/")) {
      formatFilter = `${formatId}+bestaudio/best[format_id=${formatId}]/best`;
    }

    baseArgs.push(
      "-f", formatFilter,
      "--merge-output-format", "mp4",
      "--postprocessor-args", "ffmpeg:-movflags +faststart",
      "-o", tempOutputFile,
      url
    );
  }

  return new Promise((resolve, reject) => {
    let stderrData = "";
    let childProcess: ChildProcess | null = null;

    try {
      childProcess = spawn(ytdlpPath, baseArgs);

      childProcess.stderr?.on("data", (chunk: Buffer) => {
        stderrData += chunk.toString();
      });

      childProcess.on("error", (err) => {
        try { if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile); } catch {}
        reject(new Error(`Failed to start yt-dlp downloader: ${err.message}`));
      });

      childProcess.on("close", (code) => {
        // Look for the output file
        let actualFile = tempOutputFile;
        if (!fs.existsSync(actualFile)) {
          // Check if extension variation was generated (e.g. .mp4 / .mkv / .webm)
          const dir = path.dirname(tempOutputFile);
          const baseName = path.basename(tempBase);
          const found = fs.readdirSync(dir).find((f) => f.startsWith(baseName));
          if (found) {
            actualFile = path.join(dir, found);
          }
        }

        if (fs.existsSync(actualFile)) {
          const stats = fs.statSync(actualFile);
          if (stats.size > 0) {
            const stream = fs.createReadStream(actualFile);
            let cleaned = false;
            const cleanup = () => {
              if (cleaned) return;
              cleaned = true;
              try {
                if (fs.existsSync(actualFile)) fs.unlinkSync(actualFile);
              } catch {}
            };

            stream.on("close", cleanup);
            stream.on("end", cleanup);
            stream.on("error", cleanup);

            return resolve({
              stream,
              filename,
              contentType,
              fileSize: stats.size,
              filePath: actualFile,
              cleanup,
            });
          }
        }

        console.error("yt-dlp download failed. Exit code:", code, "Stderr:", stderrData);
        reject(new Error(`Download engine error: ${stderrData.slice(-300) || "Could not generate file"}`));
      });
    } catch (e: any) {
      reject(new Error(`Downloader execution exception: ${e.message}`));
    }
  });
}
