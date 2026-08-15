import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { Readable, PassThrough } from "stream";
import { getYtDlpPath } from "../extractor/ytdlp";

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
  cleanup?: () => void;
}

export function getFfmpegPath(): string {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }

  const directPaths = [
    "C:\\Users\\sunil\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe",
    "C:\\Users\\sunil\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe",
    "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
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
  const sanitized = rawTitle
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return `${sanitized || "downloaded_video"}.${ext}`;
}

/**
 * Creates a streaming download directly executing yt-dlp piped via stdout
 */
export function createDownloadStream(options: StreamProcessingOptions): StreamResult {
  const { url, formatId = "best", isAudioOnly = false, audioBitrate = "320k", title = "media", ext = isAudioOnly ? "mp3" : "mp4" } = options;

  const ytdlpPath = getYtDlpPath();
  const ffmpegPath = getFfmpegPath();
  const filename = sanitizeFilename(title, ext);
  const contentType = isAudioOnly ? "audio/mpeg" : "video/mp4";

  const passThrough = new PassThrough();

  const args: string[] = [
    "-o", "-", // Stream stdout directly
    "--no-playlist",
    "--no-warnings",
    "--no-check-certificates",
    "--socket-timeout", "35",
    "--geo-bypass",
    "--extractor-args", "youtube:player_client=mweb,ios,android,web,tv",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  ];

  if (ffmpegPath && ffmpegPath !== "ffmpeg") {
    const ffmpegDir = path.dirname(ffmpegPath);
    args.push("--ffmpeg-location", ffmpegDir);
  }

  if (isAudioOnly) {
    args.push(
      "-x",
      "--audio-format", "mp3",
      "--audio-quality", audioBitrate === "320k" ? "0" : "5",
      url
    );
  } else {
    if (formatId && formatId !== "best" && !formatId.includes("+") && formatId !== "bestvideo+bestaudio/best") {
      args.push("-f", `${formatId}[ext=mp4]+bestaudio[ext=m4a]/${formatId}+bestaudio/best[ext=mp4]/best`);
    } else {
      args.push("-f", "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best");
    }
    args.push("--merge-output-format", "mp4");
    args.push(url);
  }

  let child: ChildProcess | null = null;

  try {
    child = spawn(ytdlpPath, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (child.stdout) {
      child.stdout.pipe(passThrough);
    }

    child.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.includes("ERROR:")) {
        console.error("yt-dlp stream error:", text);
      }
    });

    child.on("error", (err) => {
      console.warn("Child process error on download stream:", err.message);
      if (!passThrough.writableEnded) {
        passThrough.end();
      }
    });

    child.on("close", (code) => {
      if (code !== 0) {
        console.warn(`yt-dlp stream closed with exit code ${code}`);
      }
      if (!passThrough.writableEnded) {
        passThrough.end();
      }
    });
  } catch (spawnErr) {
    console.error("Failed to spawn downloader process:", spawnErr);
    passThrough.end();
  }

  const cleanup = () => {
    if (child && !child.killed) {
      try {
        child.kill("SIGTERM");
      } catch (e) {
        // ignore
      }
    }
  };

  return {
    stream: passThrough,
    filename,
    contentType,
    cleanup,
  };
}
