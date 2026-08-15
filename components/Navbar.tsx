"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  DownloadCloud,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles,
  Zap,
  Youtube,
  Instagram,
  Video,
  Facebook,
  ExternalLink,
} from "lucide-react";

interface NavbarProps {
  onSelectPlatformFilter?: (platform: string) => void;
}

export function Navbar({ onSelectPlatformFilter }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "YouTube", id: "youtube", icon: Youtube, color: "text-red-500" },
    { name: "Instagram Reels", id: "instagram", icon: Instagram, color: "text-pink-500" },
    { name: "TikTok", id: "tiktok", icon: Video, color: "text-cyan-400" },
    { name: "Facebook", id: "facebook", icon: Facebook, color: "text-blue-500" },
    { name: "How it Works", id: "how-it-works", isScroll: true },
    { name: "FAQ", id: "faq", isScroll: true },
  ];

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    if (link.isScroll) {
      const element = document.getElementById(link.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (onSelectPlatformFilter) {
      onSelectPlatformFilter(link.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="group flex items-center gap-2.5 font-bold text-lg tracking-tight text-zinc-900 dark:text-white"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <DownloadCloud className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-zinc-950 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 leading-none font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-800 dark:from-white dark:via-indigo-200 dark:to-zinc-200">
                SnapMedia
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-medium tracking-wide">
                Universal HD Downloader
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              {link.icon && <link.icon className={`w-3.5 h-3.5 ${link.color}`} />}
              {link.name}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Engine Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Engines Active</span>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left"
            >
              {link.icon && <link.icon className={`w-4 h-4 ${link.color}`} />}
              {link.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
