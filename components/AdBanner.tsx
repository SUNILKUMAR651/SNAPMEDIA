import React from "react";
import { Sparkles, Shield, ArrowUpRight } from "lucide-react";

interface AdBannerProps {
  position?: "top" | "middle" | "bottom";
}

export function AdBanner({ position = "middle" }: AdBannerProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 my-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/40 border border-indigo-500/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        
        {/* Sponsored Label */}
        <span className="absolute top-2 right-3 text-[9px] uppercase tracking-wider font-bold text-zinc-600 dark:text-zinc-300">
          Sponsored Partner
        </span>

        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-sm text-zinc-900 dark:text-white">
              <span>FastVPN Pro • Unlimited Streaming & Privacy</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-extrabold">
                85% OFF
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
              Bypass geo-restrictions, hide your IP, and stream 4K videos with zero buffering.
            </p>
          </div>
        </div>

        <a
          href="https://nordvpn.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all"
        >
          <span>Claim Deal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
