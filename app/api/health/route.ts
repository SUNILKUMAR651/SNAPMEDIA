import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function GET() {
  const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";
  const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";

  let ytdlpVersion: string | null = null;
  let ffmpegVersion: string | null = null;

  try {
    const { stdout } = await execAsync(`${ytdlpPath} --version`);
    ytdlpVersion = stdout.trim();
  } catch (e) {
    ytdlpVersion = "not-installed (using fallback simulation)";
  }

  try {
    const { stdout } = await execAsync(`${ffmpegPath} -version`);
    const match = stdout.match(/ffmpeg version ([^\s]+)/i);
    ffmpegVersion = match ? match[1] : "installed";
  } catch (e) {
    ffmpegVersion = "not-installed (using fallback simulation)";
  }

  return NextResponse.json({
    status: "online",
    timestamp: new Date().toISOString(),
    engine: {
      ytdlp: ytdlpVersion,
      ffmpeg: ffmpegVersion,
      dockerReady: true,
    },
    supportedPlatforms: [
      "YouTube (Shorts, 1080p, 4K, MP3)",
      "Instagram (Reels, Stories, Carousels, Posts)",
      "TikTok (HD No Watermark)",
      "Facebook (Watch, Reels, Private HD/SD)",
      "Twitter / X (MP4 HD)",
      "LinkedIn (Video Posts)",
      "Threads & Pinterest",
    ],
  });
}
