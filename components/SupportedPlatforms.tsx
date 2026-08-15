import React from "react";
import { Youtube, Instagram, Video, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";

interface SupportedPlatformsProps {
  onSelectPlatform: (platform: string) => void;
}

export function SupportedPlatforms({ onSelectPlatform }: SupportedPlatformsProps) {
  const platforms = [
    {
      id: "youtube",
      name: "YouTube",
      types: "Shorts, 4K Videos, 1080p, MP3",
      icon: Youtube,
      color: "from-red-500 to-rose-600",
      textColor: "text-red-500",
    },
    {
      id: "instagram",
      name: "Instagram",
      types: "Reels, Stories, Carousels, IGTV",
      icon: Instagram,
      color: "from-pink-500 via-purple-500 to-amber-500",
      textColor: "text-pink-500",
    },
    {
      id: "tiktok",
      name: "TikTok",
      types: "HD Videos (No Watermark), Audio",
      icon: Video,
      color: "from-cyan-400 to-blue-600",
      textColor: "text-cyan-400",
    },
    {
      id: "facebook",
      name: "Facebook",
      types: "Watch, Public Reels, Private HD/SD",
      icon: Facebook,
      color: "from-blue-600 to-indigo-700",
      textColor: "text-blue-500",
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      types: "Tweets with Videos, GIFs to MP4",
      icon: Twitter,
      color: "from-zinc-700 to-zinc-900",
      textColor: "text-zinc-900 dark:text-white",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      types: "Feed Videos, Keynote Clips",
      icon: Linkedin,
      color: "from-blue-700 to-blue-900",
      textColor: "text-blue-600",
    },
  ];

  return (
    <section className="py-16 bg-zinc-50/70 dark:bg-zinc-950/70 border-y border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
            Supported Networks
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            All Major Platforms in One Tool
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className="flex flex-col items-center p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 hover:shadow-lg hover:-translate-y-1 transition-all text-center group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform mb-3`}
              >
                <p.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                {p.name}
              </span>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-tight">
                {p.types}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
