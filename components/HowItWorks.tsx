import React from "react";
import { Copy, Sparkles, Download, CheckCircle2, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Copy Media Link",
      desc: "Open YouTube, Instagram, TikTok, or Facebook and copy the link of any video, reel, or short.",
      icon: Copy,
      color: "from-blue-500 to-indigo-600",
    },
    {
      step: "02",
      title: "Paste in Input Bar",
      desc: "Paste the URL into our smart search box. Our engine automatically detects the platform & formats.",
      icon: Sparkles,
      color: "from-purple-500 to-pink-600",
    },
    {
      step: "03",
      title: "Select & Download",
      desc: "Choose between 4K/1080p Full HD video or 320kbps MP3 audio, then click Download to save instantly.",
      icon: Download,
      color: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
            Simple 3-Step Process
          </h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            How to Download Any Social Video
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none hover:-translate-y-1.5 transition-all duration-300 group"
            >
              {/* Step Pill */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-zinc-300 dark:text-zinc-700">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
