"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ClipboardPaste,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  Youtube,
  Instagram,
  Video,
  Facebook,
  Twitter,
  Linkedin,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { detectPlatform, DetectedPlatformInfo } from "@/lib/extractor/url-detector";
import { ExtractedMediaInfo } from "@/lib/extractor/ytdlp";

interface HeroSectionProps {
  onFetchSuccess: (data: ExtractedMediaInfo) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedPlatformPreset?: string;
}

const SAMPLE_LINKS = [
  { label: "YouTube 4K Demo", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", platform: "youtube" },
  { label: "Instagram Reel", url: "https://www.instagram.com/reel/C3bExample123/", platform: "instagram" },
  { label: "TikTok HD", url: "https://www.tiktok.com/@creator/video/7200000000000000000", platform: "tiktok" },
  { label: "Facebook Reel", url: "https://www.facebook.com/reel/102030405060", platform: "facebook" },
];

export function HeroSection({
  onFetchSuccess,
  isLoading,
  setIsLoading,
  selectedPlatformPreset,
}: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [detected, setDetected] = useState<DetectedPlatformInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  useEffect(() => {
    if (selectedPlatformPreset) {
      const match = SAMPLE_LINKS.find((s) => s.platform === selectedPlatformPreset);
      if (match) {
        setUrl(match.url);
      }
    }
  }, [selectedPlatformPreset]);

  useEffect(() => {
    if (url.trim()) {
      const info = detectPlatform(url);
      setDetected(info);
      setErrorMessage(null);
    } else {
      setDetected(null);
      setErrorMessage(null);
    }
  }, [url]);

  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.warn("Clipboard access denied:", err);
    }
  };

  const handleClear = () => {
    setUrl("");
    setDetected(null);
    setErrorMessage(null);
  };

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setErrorMessage("Please enter or paste a video link first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/fetch-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to process video link. Please verify the URL.");
      }

      onFetchSuccess(json.data);
      // Smooth scroll to result
      setTimeout(() => {
        const resultElem = document.getElementById("download-results");
        if (resultElem) {
          resultElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlatformIcon = (iconName?: string) => {
    switch (iconName) {
      case "Youtube":
        return <Youtube className="w-5 h-5 text-red-500" />;
      case "Instagram":
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case "Video":
        return <Video className="w-5 h-5 text-cyan-400" />;
      case "Facebook":
        return <Facebook className="w-5 h-5 text-blue-500" />;
      case "Twitter":
        return <Twitter className="w-5 h-5 text-zinc-900 dark:text-white" />;
      case "Linkedin":
        return <Linkedin className="w-5 h-5 text-blue-600" />;
      default:
        return <Globe className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Next-Gen Multi-Platform Video & Audio Downloader</span>
        </div>

        {/* Dynamic H1 Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15] mb-6">
          Download High Quality Videos from{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x">
            Instagram, YouTube & Facebook
          </span>{" "}
          instantly.
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto mb-8 sm:mb-10 font-normal">
          Save Reels, Shorts, 4K Videos, TikToks (No Watermark), and MP3 audio at maximum speed. No software required, 100% free.
        </p>

        {/* Main URL Input Box Form */}
        <form onSubmit={handleFetch} className="relative max-w-3xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-zinc-900/90 border-2 border-indigo-500/30 dark:border-indigo-500/30 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl transition-all duration-300">
            
            {/* Input & Prefix Icon */}
            <div className="flex items-center w-full px-3 py-1.5 sm:py-2">
              <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 transition-all">
                {detected && detected.isValid ? (
                  renderPlatformIcon(detected.iconName)
                ) : (
                  <Search className="w-4 h-4 text-zinc-400" />
                )}
              </div>

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video link from YouTube, Instagram, TikTok, FB, X..."
                className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none font-medium"
              />

              {/* Detected Platform Tag if recognized */}
              {detected && detected.isValid && (
                <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${detected.badgeColor} ml-2 whitespace-nowrap animate-fade-in`}>
                  <span>{detected.displayName}</span>
                </div>
              )}

              {/* Clear button */}
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear input"
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Paste button */}
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ml-2"
                title="Paste from clipboard"
              >
                {pasteSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Pasted</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </>
                )}
              </button>
            </div>

            {/* Fetch Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[150px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Fetch Video</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 max-w-xl mx-auto flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Quick Sample Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <span className="font-medium">Try Sample:</span>
          {SAMPLE_LINKS.map((sample) => (
            <button
              key={sample.label}
              onClick={() => {
                setUrl(sample.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-all cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
