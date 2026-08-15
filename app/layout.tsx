import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "SnapMedia PRO • Free Social Media Video & Audio Downloader",
  description:
    "Download High Quality Videos, Reels, Shorts, and MP3 audio from Instagram, YouTube, TikTok, Facebook, Twitter, and LinkedIn. 100% Free, No Watermark, 4K & 1080p Full HD.",
  keywords: [
    "youtube downloader",
    "instagram reels downloader",
    "tiktok video without watermark",
    "facebook video download",
    "mp3 audio extractor",
    "4k video saver",
    "snapsave",
    "cobalt",
  ],
  authors: [{ name: "SnapMedia PRO" }],
  openGraph: {
    title: "SnapMedia PRO • Universal Social Media Video Downloader",
    description: "Save Instagram Reels, YouTube 4K, TikTok No Watermark & MP3s instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
