import { NextRequest, NextResponse } from "next/server";
import { createDownloadStream, sanitizeFilename } from "@/lib/ffmpeg/processor";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { Readable } from "stream";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // Allow sufficient time for merging high-res videos

function nodeReadableToWebReadable(nodeStream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      nodeStream.on("end", () => {
        controller.close();
      });
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

// Ensure ASCII-only safe filename for standard header to prevent ByteString character code > 255 errors
function toSafeAsciiFilename(filename: string, ext: string = "mp4"): string {
  const base = filename.replace(/\.[^/.]+$/, "");
  const asciiOnly = base.replace(/[^\x20-\x7E]/g, "_").replace(/["\\/]/g, "").trim().slice(0, 60);
  return `${asciiOnly || "media_download"}.${ext}`;
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, 50, 60);

    if (!rateLimit.allowed) {
      return new NextResponse("Rate limit exceeded. Please wait a few seconds.", {
        status: 429,
        headers: { "Retry-After": rateLimit.resetSeconds.toString() },
      });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const formatId = searchParams.get("format_id") || "best";
    const isAudio = searchParams.get("is_audio") === "true";
    const bitrate = searchParams.get("bitrate") || "320k";
    const title = searchParams.get("title") || "video";
    const ext = searchParams.get("ext") || (isAudio ? "mp3" : "mp4");

    if (!url) {
      return new NextResponse("Missing required 'url' parameter.", { status: 400 });
    }

    const { stream, filename, contentType, fileSize, cleanup } = await createDownloadStream({
      url,
      formatId,
      isAudioOnly: isAudio,
      audioBitrate: bitrate,
      title,
      ext,
    });

    const webStream = nodeReadableToWebReadable(stream);
    const safeAsciiName = toSafeAsciiFilename(filename, ext);
    const encodedUtf8Name = encodeURIComponent(filename);

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeAsciiName}"; filename*=UTF-8''${encodedUtf8Name}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Accept-Ranges": "bytes",
    };

    if (fileSize && fileSize > 0) {
      headers["Content-Length"] = fileSize.toString();
    }

    const response = new NextResponse(webStream, {
      status: 200,
      headers,
    });

    req.signal.addEventListener("abort", () => {
      cleanup?.();
    });

    return response;
  } catch (error: any) {
    console.error("Download streaming error:", error);
    return new NextResponse(`Download error: ${error.message || "Failed to process stream"}`, {
      status: 500,
    });
  }
}
