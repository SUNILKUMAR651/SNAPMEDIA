import React from "react";
import { DownloadCloud, Heart, Shield, FileText, Lock, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-base text-zinc-900 dark:text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 text-white">
                <DownloadCloud className="w-4 h-4" />
              </div>
              <span>SnapMedia PRO</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xs">
              The fastest and most reliable social media video downloader and audio converter. Free forever, no watermark, and no registration required.
            </p>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs mb-4">
              Online Downloaders
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#youtube" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  YouTube Video & 4K Downloader
                </a>
              </li>
              <li>
                <a href="#instagram" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Instagram Reels & Stories Downloader
                </a>
              </li>
              <li>
                <a href="#tiktok" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  TikTok No Watermark Saver
                </a>
              </li>
              <li>
                <a href="#facebook" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Facebook Watch & Reel Video Downloader
                </a>
              </li>
              <li>
                <a href="#twitter" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  X / Twitter Video Downloader
                </a>
              </li>
            </ul>
          </div>

          {/* Audio & Utilities */}
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs mb-4">
              Audio & Converters
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  YouTube to MP3 Converter (320kbps)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  TikTok Sound / Audio Extractor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Instagram Audio Downloader
                </a>
              </li>
              <li>
                <a href="/api/health" target="_blank" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  API Health Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs mb-4">
              Legal & Policies
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  DMCA Compliance & Takedown
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy & Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-zinc-600 dark:text-zinc-300">
          <p className="max-w-2xl">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Disclaimer:</span> SnapMedia is an independent tool and is not affiliated, endorsed, or partnered with YouTube, Instagram, Meta, TikTok, or ByteDance. All trademarks and logos belong to their respective owners. Users are solely responsible for respecting intellectual property rights.
          </p>

          <p className="shrink-0 flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} SnapMedia PRO. All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
