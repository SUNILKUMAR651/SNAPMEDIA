import { NextRequest, NextResponse } from "next/server";
import { extractMediaInfo } from "@/lib/extractor/ytdlp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { detectPlatform } from "@/lib/extractor/url-detector";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, 40, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit reached. Please wait a few seconds before trying again.",
          resetInSeconds: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.resetSeconds.toString(),
            "X-RateLimit-Limit": rateLimit.totalLimit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || !body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid video URL in the request body." },
        { status: 400 }
      );
    }

    const rawUrl = body.url.trim();
    const platformInfo = detectPlatform(rawUrl);

    if (!platformInfo.isValid && !/^https?:\/\//i.test(rawUrl)) {
      return NextResponse.json(
        {
          error: "Invalid link format. Please paste a full link from YouTube, Instagram, Facebook, TikTok, X, or LinkedIn.",
        },
        { status: 422 }
      );
    }

    const mediaInfo = await extractMediaInfo(rawUrl);

    return NextResponse.json(
      {
        success: true,
        data: mediaInfo,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error("Error in /api/fetch-info:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to extract media information. The video might be private or restricted.",
      },
      { status: 500 }
    );
  }
}
