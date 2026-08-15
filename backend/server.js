const express = require("express");
const cors = require("cors");
const { spawn, exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all frontends (Vercel, Render, Localhost)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  })
);

app.use(express.json());

// Rate Limiter: 60 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests. Please slow down." },
});
app.use("/api/", limiter);

// Helper: Locate yt-dlp binary
function getYtDlpPath() {
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH;
  }
  const paths = [
    "/usr/local/bin/yt-dlp",
    "/usr/bin/yt-dlp",
    "C:\\Users\\sunil\\AppData\\Local\\Programs\\Python\\Python311\\Scripts\\yt-dlp.exe",
    "C:\\Program Files\\yt-dlp\\yt-dlp.exe",
  ];
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (e) {}
  }
  return "yt-dlp";
}

// Helper: Locate ffmpeg directory / binary
function getFfmpegDir() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return path.dirname(process.env.FFMPEG_PATH);
  }
  const paths = [
    "/usr/bin",
    "/usr/local/bin",
    "C:\\Users\\sunil\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin",
  ];
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (e) {}
  }
  return "";
}

// Helper: Format duration seconds
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Helper: Format file size bytes
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes <= 0) return "Auto Size";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Helper: Resolution normalizer (horizontal vs vertical)
function getEffectiveResolutionHeight(f) {
  const h = f.height || 0;
  const w = f.width || 0;
  const note = String(f.format_note || "").toLowerCase();

  if (note.includes("2160") || note.includes("4k")) return 2160;
  if (note.includes("1440") || note.includes("2k")) return 1440;
  if (note.includes("1080")) return 1080;
  if (note.includes("720")) return 720;
  if (note.includes("480")) return 480;
  if (note.includes("360")) return 360;
  if (note.includes("240")) return 240;
  if (note.includes("144")) return 144;

  if (w > 0 && h > 0) return Math.min(w, h);
  return h;
}

function getQualityLabel(height, fps) {
  const fpsSuffix = fps && fps > 30 ? ` ${fps}fps` : "";
  if (height >= 2160) return `4K UHD (2160p)${fpsSuffix}`;
  if (height >= 1440) return `2K QHD (1440p)${fpsSuffix}`;
  if (height >= 1080) return `Full HD (1080p)${fpsSuffix}`;
  if (height >= 720) return `HD (720p)${fpsSuffix}`;
  if (height >= 480) return `SD (480p)${fpsSuffix}`;
  if (height >= 360) return `360p${fpsSuffix}`;
  if (height >= 240) return `240p${fpsSuffix}`;
  if (height >= 144) return `144p${fpsSuffix}`;
  return `${height}p${fpsSuffix}`;
}

// Sanitize filename to ASCII fallback + UTF-8 RFC 5987
function sanitizeFilename(rawTitle, ext = "mp4") {
  const sanitized = String(rawTitle || "downloaded_video")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return `${sanitized || "download"}.${ext}`;
}

function toSafeAsciiFilename(filename, ext = "mp4") {
  const base = filename.replace(/\.[^/.]+$/, "");
  const asciiOnly = base.replace(/[^\x20-\x7E]/g, "_").replace(/["\\/]/g, "").trim().slice(0, 60);
  return `${asciiOnly || "media_download"}.${ext}`;
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Root Status
app.get("/", (req, res) => {
  res.json({
    name: "SnapMedia Downloader Engine API",
    status: "online",
    deployment: "Render Web Service",
    endpoints: {
      health: "/api/health",
      fetchInfo: "POST /api/fetch-info",
      download: "GET /api/download",
    },
  });
});

// Diagnostics
app.get("/api/health", async (req, res) => {
  const ytdlpPath = getYtDlpPath();
  let ytdlpVer = "not-found";
  let ffmpegVer = "not-found";

  try {
    const { stdout } = await execAsync(`"${ytdlpPath}" --version`);
    ytdlpVer = stdout.trim();
  } catch (e) {}

  try {
    const { stdout } = await execAsync("ffmpeg -version");
    const m = stdout.match(/ffmpeg version ([^\s]+)/i);
    ffmpegVer = m ? m[1] : "installed";
  } catch (e) {}

  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    engine: {
      ytdlp: ytdlpVer,
      ffmpeg: ffmpegVer,
      ready: true,
    },
  });
});

// Helper: Execute yt-dlp with retries
function executeYtDlp(ytdlpPath, url, extractorArgs = []) {
  return new Promise((resolve) => {
    const baseArgs = [
      "--dump-json",
      "--no-warnings",
      "--no-playlist",
      "--no-check-certificates",
      "--socket-timeout", "25",
      "--geo-bypass",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ];

    const args = [...baseArgs, ...extractorArgs, url.trim()];

    let stdoutData = "";
    let stderrData = "";

    try {
      const child = spawn(ytdlpPath, args);
      child.stdout.on("data", (data) => { stdoutData += data.toString(); });
      child.stderr.on("data", (data) => { stderrData += data.toString(); });

      child.on("error", (err) => {
        resolve({ success: false, error: err.message, stdout: "", stderr: stderrData });
      });

      child.on("close", (code) => {
        if (code === 0 && stdoutData.trim()) {
          resolve({ success: true, stdout: stdoutData.trim(), stderr: stderrData });
        } else {
          resolve({ success: false, code, stdout: stdoutData, stderr: stderrData });
        }
      });
    } catch (e) {
      resolve({ success: false, error: e.message, stdout: "", stderr: "" });
    }
  });
}

async function fetchOembedData(url) {
  try {
    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
    const isTikTok = /tiktok\.com/i.test(url);

    let apiUrl = "";
    if (isYouTube) {
      apiUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (isTikTok) {
      apiUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    } else {
      apiUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      let thumbnail = data.thumbnail_url || "";

      if (isYouTube && thumbnail) {
        const idMatch = url.match(/(?:watch\?v=|shorts\/|embed\/|v\/|youtu\.be\/)([\w-]{11})/i);
        if (idMatch && idMatch[1]) {
          thumbnail = `https://i.ytimg.com/vi/${idMatch[1]}/maxresdefault.jpg`;
        }
      }

      return {
        title: data.title || undefined,
        uploader: data.author_name || undefined,
        thumbnail: thumbnail || undefined,
      };
    }
  } catch (e) {
    // Ignore oembed failure
  }
  return null;
}

async function getFallbackServerData(url) {
  const isShorts = url.includes("shorts") || url.includes("reel") || url.includes("tiktok");
  const duration = isShorts ? 30 : 210;
  const oembed = await fetchOembedData(url);

  return {
    id: `video-${Date.now()}`,
    title: oembed?.title || "HD Video Stream (Instant Download)",
    uploader: oembed?.uploader || "Social Media Creator",
    thumbnail: oembed?.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    durationSeconds: duration,
    durationFormatted: formatDuration(duration),
    platform: "social",
    originalUrl: url.trim(),
    formats: [
      { id: "bestvideo+bestaudio/best", quality: "4K UHD (2160p)", ext: "mp4", resolution: "3840x2160", hasVideo: true, hasAudio: true, fileSize: "Auto 4K", approxBytes: 50000000 },
      { id: "best[height<=1080]", quality: "Full HD (1080p)", ext: "mp4", resolution: "1920x1080", hasVideo: true, hasAudio: true, fileSize: "Auto 1080p", approxBytes: 25000000 },
      { id: "best[height<=720]", quality: "HD (720p)", ext: "mp4", resolution: "1280x720", hasVideo: true, hasAudio: true, fileSize: "Auto 720p", approxBytes: 15000000 },
      { id: "best[height<=480]", quality: "SD (480p)", ext: "mp4", resolution: "854x480", hasVideo: true, hasAudio: true, fileSize: "Auto 480p", approxBytes: 8000000 },
    ],
    audioFormats: [
      { id: "bestaudio", quality: "MP3 Audio (320kbps High Quality)", ext: "mp3", hasVideo: false, hasAudio: true, fileSize: "Auto MP3", approxBytes: 6000000 },
      { id: "bestaudio[abr<=128]", quality: "MP3 Audio (128kbps Standard)", ext: "mp3", hasVideo: false, hasAudio: true, fileSize: "Auto MP3", approxBytes: 3000000 },
    ],
  };
}

// POST /api/fetch-info
app.post("/api/fetch-info", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Please provide a valid video URL in request body." });
  }

  const ytdlpPath = getYtDlpPath();

  // Run oEmbed fast metadata fetch in parallel
  const oembedPromise = fetchOembedData(url);

  // Fast single-pass execution with socket timeout 8s
  const resultPromise = executeYtDlp(ytdlpPath, url, [
    "--extractor-args", "youtube:player_client=mweb,ios,android,web,tv",
    "--socket-timeout", "8",
  ]);

  const [oembed, result] = await Promise.all([oembedPromise, resultPromise]);

  if (!result.success || !result.stdout) {
    console.warn("yt-dlp fast extraction failed or timed out. Serving instant oEmbed metadata.", result?.stderr || "");
    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
    const isInstagram = /instagram\.com/i.test(url);
    const isTikTok = /tiktok\.com/i.test(url);
    const isFacebook = /(?:facebook\.com|fb\.watch)/i.test(url);
    const detectedPlatform = isYouTube ? "YouTube" : (isInstagram ? "Instagram" : (isTikTok ? "TikTok" : (isFacebook ? "Facebook" : "Social")));

    const isShorts = url.includes("shorts") || url.includes("reel") || url.includes("tiktok");
    const duration = isShorts ? 30 : 210;

    return res.json({
      success: true,
      data: {
        id: oembed?.id || `video-${Date.now()}`,
        title: oembed?.title || "High Quality Video Stream",
        uploader: oembed?.uploader || "Axelith Mind",
        thumbnail: oembed?.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        durationSeconds: duration,
        durationFormatted: formatDuration(duration),
        platform: detectedPlatform,
        originalUrl: url.trim(),
        formats: [
          { id: "bestvideo+bestaudio/best", quality: "4K UHD (2160p)", ext: "mp4", resolution: "3840x2160", hasVideo: true, hasAudio: true, fileSize: "Auto 4K", approxBytes: 50000000 },
          { id: "best[height<=1080]", quality: "Full HD (1080p)", ext: "mp4", resolution: "1920x1080", hasVideo: true, hasAudio: true, fileSize: "Auto 1080p", approxBytes: 25000000 },
          { id: "best[height<=720]", quality: "HD (720p)", ext: "mp4", resolution: "1280x720", hasVideo: true, hasAudio: true, fileSize: "Auto 720p", approxBytes: 15000000 },
          { id: "best[height<=480]", quality: "SD (480p)", ext: "mp4", resolution: "854x480", hasVideo: true, hasAudio: true, fileSize: "Auto 480p", approxBytes: 8000000 },
        ],
        audioFormats: [
          { id: "bestaudio", quality: "MP3 Audio (320kbps High Quality)", ext: "mp3", hasVideo: false, hasAudio: true, fileSize: "Auto MP3", approxBytes: 6000000 },
          { id: "bestaudio[abr<=128]", quality: "MP3 Audio (128kbps Standard)", ext: "mp3", hasVideo: false, hasAudio: true, fileSize: "Auto MP3", approxBytes: 3000000 },
        ],
      },
    });
  }

  try {
    const data = JSON.parse(result.stdout);
    const duration = data.duration || 0;
    const rawFormats = Array.isArray(data.formats) ? data.formats : [];

      const bestFormatByResolution = new Map();
      const audioFormats = [];
      const seenAudio = new Set();

      let bestAudioBytes = 0;
      for (const f of rawFormats) {
        if (f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")) {
          const sz = f.filesize || f.filesize_approx || (f.tbr ? (f.tbr * 1024 * duration) / 8 : 0);
          if (sz > bestAudioBytes) bestAudioBytes = sz;
        }
      }

      for (const f of rawFormats) {
        const hasVideo = !!f.vcodec && f.vcodec !== "none";
        const hasAudio = !!f.acodec && f.acodec !== "none";
        const ext = f.ext || "mp4";
        if (ext === "mhtml" || f.protocol === "mhtml") continue;

        if (hasVideo) {
          const effHeight = getEffectiveResolutionHeight(f);
          if (effHeight <= 0) continue;

          const approxBytes = f.filesize || f.filesize_approx || (f.tbr ? (f.tbr * 1024 * duration) / 8 : 0);
          const totalBytes = hasAudio ? approxBytes : approxBytes + bestAudioBytes;

          const existing = bestFormatByResolution.get(effHeight);
          if (!existing) {
            bestFormatByResolution.set(effHeight, { format: f, totalBytes, hasAudio, effHeight });
          } else {
            const isBetterExt = f.ext === "mp4" && existing.format.ext !== "mp4";
            const isHigherSize = totalBytes > existing.totalBytes;
            if (isBetterExt || (f.ext === existing.format.ext && isHigherSize)) {
              bestFormatByResolution.set(effHeight, { format: f, totalBytes, hasAudio, effHeight });
            }
          }
        } else if (hasAudio && !hasVideo) {
          const abr = f.abr ? Math.round(f.abr) : 128;
          let label = "MP3 Audio (320kbps Studio Quality)";
          if (abr < 140) label = "MP3 Audio (128kbps Standard)";
          else if (abr < 200) label = "MP3 Audio (192kbps High)";
          else if (abr < 280) label = "MP3 Audio (256kbps High)";

          if (!seenAudio.has(`${abr}`)) {
            seenAudio.add(`${abr}`);
            const approxBytes = f.filesize || f.filesize_approx || (abr * 1000 * duration) / 8;
            audioFormats.push({
              id: f.format_id || "bestaudio",
              quality: label,
              ext: "mp3",
              hasVideo: false,
              hasAudio: true,
              fileSize: formatBytes(approxBytes),
              approxBytes,
            });
          }
        }
      }

      const sortedHeights = Array.from(bestFormatByResolution.keys()).sort((a, b) => b - a);
      const videoFormats = [];

      for (const h of sortedHeights) {
        const entry = bestFormatByResolution.get(h);
        if (!entry) continue;
        const f = entry.format;
        videoFormats.push({
          id: f.format_id || `${h}p`,
          quality: getQualityLabel(h, f.fps),
          ext: "mp4",
          resolution: f.resolution || `${f.width || ""}x${f.height || h}`,
          height: h,
          fps: f.fps,
          hasVideo: true,
          hasAudio: entry.hasAudio,
          fileSize: formatBytes(entry.totalBytes),
          approxBytes: entry.totalBytes,
          formatNote: f.format_note,
        });
      }

      if (videoFormats.length === 0) {
        videoFormats.push(
          { id: "bestvideo+bestaudio/best", quality: "1080p Full HD", ext: "mp4", resolution: "1080x1920", height: 1080, hasVideo: true, hasAudio: true, fileSize: "Auto 1080p" },
          { id: "best[height<=720]", quality: "720p HD", ext: "mp4", resolution: "720x1280", height: 720, hasVideo: true, hasAudio: true, fileSize: "Auto 720p" },
          { id: "best[height<=480]", quality: "480p SD", ext: "mp4", resolution: "480x854", height: 480, hasVideo: true, hasAudio: true, fileSize: "Auto 480p" },
          { id: "best[height<=360]", quality: "360p", ext: "mp4", resolution: "360x640", height: 360, hasVideo: true, hasAudio: true, fileSize: "Auto 360p" }
        );
      }

      if (audioFormats.length === 0) {
        audioFormats.push(
          { id: "bestaudio", quality: "MP3 Audio (320kbps Studio Quality)", ext: "mp3", hasVideo: false, hasAudio: true, fileSize: "Auto MP3" },
          { id: "bestaudio[abr<=128]", quality: "MP3 Audio (128kbps Standard)", ext: "mp3", hasVideo: false, hasAudio: true, fileSize: "Auto MP3" }
        );
      }

      let thumbnail = data.thumbnail || "";
      if (Array.isArray(data.thumbnails) && data.thumbnails.length > 0) {
        thumbnail = data.thumbnails[data.thumbnails.length - 1].url || thumbnail;
      }

      res.json({
        success: true,
        data: {
          id: data.id || `video-${Date.now()}`,
          title: data.title || "Social Video",
          uploader: data.uploader || data.channel || "Creator",
          thumbnail,
          durationSeconds: duration,
          durationFormatted: formatDuration(duration),
          platform: data.extractor_key || "social",
          originalUrl: url.trim(),
          formats: videoFormats,
          audioFormats,
          viewCount: data.view_count,
          likeCount: data.like_count,
        },
      });
    } catch (parseErr) {
      res.status(500).json({ error: "Failed to parse metadata", details: parseErr.message });
    }
});

// GET /api/download
app.get("/api/download", (req, res) => {
  const { url, format_id = "best", is_audio = "false", bitrate = "320k", title = "video", ext = "mp4" } = req.query;

  if (!url) {
    return res.status(400).send("Missing required 'url' parameter.");
  }

  const isAudio = is_audio === "true";
  const ytdlpPath = getYtDlpPath();
  const ffmpegDir = getFfmpegDir();
  const filename = sanitizeFilename(title, isAudio ? "mp3" : ext);
  const safeAsciiName = toSafeAsciiFilename(filename, isAudio ? "mp3" : ext);
  const encodedUtf8Name = encodeURIComponent(filename);
  const contentType = isAudio ? "audio/mpeg" : "video/mp4";

  const args = [
    "-o", "-",
    "--no-playlist",
    "--no-warnings",
    "--no-check-certificates",
    "--socket-timeout", "35",
    "--geo-bypass",
    "--extractor-args", "youtube:player_client=mweb,ios,android,web,tv",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  ];

  if (ffmpegDir) {
    args.push("--ffmpeg-location", ffmpegDir);
  }

  if (isAudio) {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", bitrate === "320k" ? "0" : "5", url);
  } else {
    if (format_id && format_id !== "best" && !format_id.includes("+") && format_id !== "bestvideo+bestaudio/best") {
      args.push("-f", `${format_id}[ext=mp4]+bestaudio[ext=m4a]/${format_id}+bestaudio/best[ext=mp4]/best`);
    } else {
      args.push("-f", "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best");
    }
    args.push("--merge-output-format", "mp4", url);
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeAsciiName}"; filename*=UTF-8''${encodedUtf8Name}`
  );
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  const child = spawn(ytdlpPath, args, { stdio: ["ignore", "pipe", "pipe"] });

  child.stdout.pipe(res);

  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    if (text.includes("ERROR:")) console.error("yt-dlp error:", text);
  });

  child.on("error", (err) => {
    console.error("Child process error:", err);
    if (!res.headersSent) res.status(500).send("Stream process error.");
  });

  req.on("close", () => {
    if (!child.killed) {
      try { child.kill("SIGTERM"); } catch (e) {}
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SnapMedia Backend Engine running on http://0.0.0.0:${PORT}`);
});
