import React from "react";
import {
  Zap,
  ShieldCheck,
  Sparkles,
  Layers,
  Infinity,
  Smartphone,
  Music2,
  Video,
} from "lucide-react";

export function FeatureHighlights() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Engine",
      desc: "Powered by multithreaded chunk streaming to deliver the highest download speed available.",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: Sparkles,
      title: "No Watermark HD",
      desc: "Download TikTok videos and Instagram Reels without annoying platform watermarks in original quality.",
      color: "text-pink-500 bg-pink-500/10",
    },
    {
      icon: Video,
      title: "Up to 4K / 1080p Full HD",
      desc: "Supports all video resolutions including 4K UHD, 2K QHD, 1080p 60fps, 720p, and 480p.",
      color: "text-indigo-500 bg-indigo-500/10",
    },
    {
      icon: Music2,
      title: "High Bitrate MP3 Extraction",
      desc: "Extract studio-quality 320kbps and 128kbps MP3 audio from any video with one click.",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      icon: Infinity,
      title: "100% Free & Unlimited",
      desc: "No registration required, no subscription limits, and zero daily caps on video downloads.",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: Smartphone,
      title: "Cross-Platform Support",
      desc: "Works seamlessly across iOS Safari, Android Chrome, Windows, Mac, and Linux browsers.",
      color: "text-cyan-500 bg-cyan-500/10",
    },
  ];

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
          Why Choose SnapMedia
        </h2>
        <p className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Built for Speed, Quality & Simplicity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat) => (
          <div
            key={feat.title}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feat.color}`}
            >
              <feat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {feat.title}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
