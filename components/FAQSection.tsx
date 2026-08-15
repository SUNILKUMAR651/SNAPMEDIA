"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Is SnapMedia completely free to use?",
    answer:
      "Yes, SnapMedia is 100% free with unlimited downloads. You do not need to register an account, sign up for a subscription, or install third-party plugins.",
  },
  {
    question: "How can I download Instagram Reels & TikTok without watermarks?",
    answer:
      "Simply copy the URL of the Instagram Reel or TikTok video, paste it into our search bar, and click 'Fetch Video'. Our media engine automatically pulls the original direct source file without any platform watermark stamps.",
  },
  {
    question: "What video resolutions are available for download?",
    answer:
      "We support all source qualities provided by the platforms, including 4K Ultra HD (2160p), 2K (1440p), Full HD (1080p 60fps), HD (720p), SD (480p), and high bitrate MP3 audio (320kbps and 128kbps).",
  },
  {
    question: "Where are the downloaded videos saved on my phone or PC?",
    answer:
      "Videos and MP3s are saved directly to your default browser 'Downloads' folder. On iPhones (iOS), files can be accessed via the Files app or Safari Downloads manager. On Android, check your Gallery or Downloads app.",
  },
  {
    question: "Does this downloader store or track my downloaded videos?",
    answer:
      "No. We prioritize your privacy. All media streams are fetched on-the-fly and piped directly to your device. We do not store copies of your videos, personal data, or download logs on our servers.",
  },
  {
    question: "Can I convert YouTube and Facebook videos directly into MP3 music files?",
    answer:
      "Yes! After pasting any video link, switch to the 'Audio (MP3)' tab on the result card and click 'Extract MP3' to get crystal-clear 320kbps audio.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-500/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={faq.question}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-4 ${
                    isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
