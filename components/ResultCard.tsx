"use client";

import React, { useState } from "react";
import {
  Download,
  Film,
  Music,
  CheckCircle2,
  Share2,
  ExternalLink,
  Sparkles,
  Clock,
  User,
  ShieldCheck,
  Zap,
  Eye,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { ExtractedMediaInfo, MediaFormat } from "@/lib/extractor/ytdlp";

interface ResultCardProps {
  data: ExtractedMediaInfo;
  onReset?: () => void;
}

export function ResultCard({ data, onReset }: ResultCardProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio" | "cover">("video");
  const [downloadingFormatId, setDownloadingFormatId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [completedFormatId, setCompletedFormatId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = (format: MediaFormat, isAudio: boolean = false) => {
    setDownloadingFormatId(format.id);
    setDownloadProgress(10);
    setCompletedFormatId(null);

    // Build the streaming download URL with query params
    const downloadEndpoint = `/api/download?url=${encodeURIComponent(data.originalUrl)}&format_id=${encodeURIComponent(
      format.id
    )}&is_audio=${isAudio}&title=${encodeURIComponent(data.title)}&ext=${format.ext}`;

    // Animated download progress feedback
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    // Trigger browser download via invisible link
    const link = document.createElement("a");
    link.href = downloadEndpoint;
    link.setAttribute("download", `${data.title}.${format.ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      setCompletedFormatId(format.id);
      setTimeout(() => {
        setDownloadingFormatId(null);
        setDownloadProgress(0);
      }, 3000);
    }, 1500);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(data.originalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getQualityBadge = (fmt: MediaFormat, idx: number) => {
    const q = fmt.quality.toLowerCase();
    if (q.includes("2160") || q.includes("4k")) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
          4K UHD
        </span>
      );
    }
    if (q.includes("1440") || q.includes("2k")) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
          2K QHD
        </span>
      );
    }
    if (q.includes("1080")) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
          FULL HD
        </span>
      );
    }
    if (idx === 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          BEST
        </span>
      );
    }
    return null;
  };

  return (
    <div
      id="download-results"
      className="max-w-4xl mx-auto px-4 sm:px-6 my-12 animate-fade-in-up"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl backdrop-blur-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Card Header & Video Meta */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Thumbnail Preview */}
            <div className="relative w-full md:w-72 aspect-video md:aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-950 shadow-md group shrink-0">
              <img
                src={data.thumbnail}
                alt={data.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";
                }}
              />
              {/* Duration badge */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{data.durationFormatted}</span>
              </div>
              {/* Platform tag */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{data.platform}</span>
              </div>
            </div>

            {/* Video Details */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                  {data.title}
                </h3>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>{data.uploader}</span>
                  </div>
                  {data.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{data.viewCount.toLocaleString()} views</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>All High Quality Streams Available</span>
                  </div>
                </div>
              </div>

              {/* Share and Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Source</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 sm:px-8 pt-4 pb-2 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "video"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Video Qualities (MP4)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20">
              {data.formats.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "audio"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Audio (MP3)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20">
              {data.audioFormats.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("cover")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "cover"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Thumbnail HD</span>
          </button>
        </div>

        {/* Tab Content Formats List */}
        <div className="p-6 sm:p-8">
          {activeTab === "video" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider px-2 mb-2">
                <span>Resolution & Quality</span>
                <span className="hidden sm:inline">File Size</span>
                <span>Download Video</span>
              </div>

              {data.formats.map((fmt, idx) => {
                const isDownloading = downloadingFormatId === fmt.id;
                const isCompleted = completedFormatId === fmt.id;
                const badge = getQualityBadge(fmt, idx);

                return (
                  <div
                    key={`${fmt.id}-${idx}`}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/50 transition-all group"
                  >
                    {/* Quality Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                        MP4
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                            {fmt.quality}
                          </span>
                          {badge}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                          {fmt.resolution && <span>{fmt.resolution}</span>}
                          <span className="sm:hidden">• {fmt.fileSize || "Auto"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Size tag (desktop) */}
                    <div className="hidden sm:block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {fmt.fileSize || "Auto"}
                    </div>

                    {/* Download Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(fmt, false)}
                        disabled={isDownloading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isDownloading
                            ? "bg-indigo-600 text-white opacity-90"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Saved</span>
                          </>
                        ) : isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{downloadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider px-2 mb-2">
                <span>Audio Bitrate & Quality</span>
                <span className="hidden sm:inline">Approx Size</span>
                <span>Download Audio</span>
              </div>

              {data.audioFormats.map((afmt, idx) => {
                const isDownloading = downloadingFormatId === afmt.id;
                const isCompleted = completedFormatId === afmt.id;

                return (
                  <div
                    key={`${afmt.id}-${idx}`}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-xs">
                        MP3
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                            {afmt.quality}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-300 sm:hidden">
                          {afmt.fileSize || "Auto"}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {afmt.fileSize || "Auto"}
                    </div>

                    <button
                      onClick={() => handleDownload(afmt, true)}
                      disabled={isDownloading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isDownloading
                          ? "bg-purple-600 text-white opacity-90"
                          : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Saved</span>
                        </>
                      ) : isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{downloadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Music className="w-4 h-4" />
                          <span>Extract MP3</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "cover" && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="relative max-w-md rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 mb-4">
                <img src={data.thumbnail} alt="Cover HD" className="w-full h-auto object-cover" />
              </div>
              <a
                href={data.thumbnail}
                target="_blank"
                rel="noopener noreferrer"
                download="thumbnail.jpg"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res Thumbnail</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-6 sm:px-8 py-3.5 bg-zinc-100/60 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Automatic stream merging enabled (FFmpeg Pro Engine)
          </span>
          <span>100% Virus-Free & Safe</span>
        </div>
      </div>
    </div>
  );
}
