export type SupportedPlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "pinterest"
  | "threads"
  | "general";

export interface DetectedPlatformInfo {
  platform: SupportedPlatform;
  displayName: string;
  badgeColor: string;
  iconName: string;
  isValid: boolean;
  normalizedUrl: string;
}

const PLATFORM_PATTERNS: Array<{
  platform: SupportedPlatform;
  displayName: string;
  badgeColor: string;
  iconName: string;
  regex: RegExp;
}> = [
  {
    platform: "youtube",
    displayName: "YouTube",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    iconName: "Youtube",
    regex: /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/|live\/)|youtu\.be\/)([\w-]{11})/i,
  },
  {
    platform: "instagram",
    displayName: "Instagram",
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    iconName: "Instagram",
    regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels|tv|stories)\/([^/?#&]+)/i,
  },
  {
    platform: "tiktok",
    displayName: "TikTok",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    iconName: "Video",
    regex: /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\/(?:@[\w.-]+\/video\/\d+|[\w.-]+)/i,
  },
  {
    platform: "facebook",
    displayName: "Facebook",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    iconName: "Facebook",
    regex: /(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.watch|fb\.com)\/(?:watch\/?\?v=\d+|reel\/\d+|[\w.-]+\/videos\/\d+|\?v=\d+|share\/[vr]\/[\w-]+)/i,
  },
  {
    platform: "twitter",
    displayName: "X / Twitter",
    badgeColor: "bg-neutral-800/10 text-neutral-300 border-neutral-700/20 dark:bg-white/10 dark:text-white",
    iconName: "Twitter",
    regex: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/i,
  },
  {
    platform: "linkedin",
    displayName: "LinkedIn",
    badgeColor: "bg-blue-600/10 text-blue-400 border-blue-600/20",
    iconName: "Linkedin",
    regex: /(?:https?:\/\/)?(?:[\w]+\.)?linkedin\.com\/(?:posts|feed\/update|embed)\/([\w:-]+)/i,
  },
  {
    platform: "pinterest",
    displayName: "Pinterest",
    badgeColor: "bg-rose-600/10 text-rose-500 border-rose-600/20",
    iconName: "Pin",
    regex: /(?:https?:\/\/)?(?:[\w]+\.)?pinterest\.(?:com|[\w.]+)\/(?:pin\/\d+|sent\/\?id=\d+)/i,
  },
  {
    platform: "threads",
    displayName: "Threads",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    iconName: "MessageCircle",
    regex: /(?:https?:\/\/)?(?:www\.)?threads\.net\/(?:@[\w.-]+\/post\/[\w-]+)/i,
  },
];

export function detectPlatform(rawUrl: string): DetectedPlatformInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      platform: "general",
      displayName: "Generic Link",
      badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      iconName: "Globe",
      isValid: false,
      normalizedUrl: "",
    };
  }

  const trimmed = rawUrl.trim();
  let normalizedUrl = trimmed;

  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  for (const item of PLATFORM_PATTERNS) {
    if (item.regex.test(normalizedUrl) || item.regex.test(trimmed)) {
      return {
        platform: item.platform,
        displayName: item.displayName,
        badgeColor: item.badgeColor,
        iconName: item.iconName,
        isValid: true,
        normalizedUrl,
      };
    }
  }

  // Basic URL structure check for generic sites
  const isValidUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(trimmed);

  return {
    platform: "general",
    displayName: isValidUrl ? "Direct Media Link" : "Invalid URL",
    badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    iconName: "Globe",
    isValid: isValidUrl,
    normalizedUrl: isValidUrl ? normalizedUrl : trimmed,
  };
}
