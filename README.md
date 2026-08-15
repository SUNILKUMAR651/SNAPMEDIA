# SnapMedia PRO • All-in-One Social Media Video Downloader

A high-performance, modern, and production-ready All-in-One Social Media Video & Audio Downloader web application inspired by **SnapSave**, **Cobalt**, and **FastDl**.

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Lucide Icons**, **yt-dlp**, and **FFmpeg**.

---

## 🚀 Key Features

- **Multi-Platform Support:**
  - 📸 **Instagram:** Reels, Stories, Carousels, IGTV, Video Posts (Direct MP4 HD).
  - 🎥 **YouTube:** Shorts, standard videos, 4K UHD, 1080p, 720p, 480p, MP3 Audio-only (320kbps).
  - 📘 **Facebook:** Public Reels, Watch videos, private video link helper (HD/SD quality).
  - 🎵 **TikTok:** Videos with & without watermarks in original quality.
  - 🐦 **Twitter / X & LinkedIn:** Direct MP4 extraction.
  - 🧵 **Threads & Pinterest:** Automatic media extraction.
- **Smart URL Detection:** Auto-detects the platform on paste and updates the badge icon dynamically.
- **High Bitrate MP3 Extraction:** Converts video streams on-the-fly to MP3 audio (320kbps & 128kbps).
- **Direct Stream Piping:** Streams files directly to the browser with RFC 5987 `Content-Disposition: attachment` headers.
- **Built-in Rate Limiting:** Token-bucket sliding window to prevent DDoS and API abuse.
- **Ultra-Modern UI/UX:** Dark/Light mode support, glassmorphism cards, glowing gradients, animated progress bars, and zero clutter.
- **Dockerized Production Setup:** Ready-to-deploy Dockerfile with `ffmpeg` and `yt-dlp` pre-installed.

---

## 📁 Project Architecture

```
├── app/
│   ├── api/
│   │   ├── download/
│   │   │   └── route.ts         # Direct stream download & FFmpeg merging
│   │   ├── fetch-info/
│   │   │   └── route.ts         # Extraction & metadata parser
│   │   └── health/
│   │       └── route.ts         # System diagnostics (yt-dlp & FFmpeg status)
│   ├── globals.css              # Dark/light theme styles & animations
│   ├── layout.tsx               # Root layout & SEO meta tags
│   └── page.tsx                 # Main application page
├── components/
│   ├── AdBanner.tsx             # Non-intrusive sponsor banner
│   ├── FAQSection.tsx           # SEO dynamic accordion FAQ
│   ├── FeatureHighlights.tsx    # Features showcase grid
│   ├── Footer.tsx               # DMCA, Terms, and platform links
│   ├── HeroSection.tsx          # Dynamic title, smart input & clipboard paste
│   ├── HowItWorks.tsx           # 3-step visual instruction cards
│   ├── Navbar.tsx               # Header with theme toggle & platform filters
│   ├── ResultCard.tsx           # Video preview, format picker tabs & download
│   ├── SupportedPlatforms.tsx   # Platform showcase grid
│   └── ThemeProvider.tsx        # Next-themes client wrapper
├── lib/
│   ├── extractor/
│   │   ├── url-detector.ts      # Multi-platform regex matcher
│   │   └── ytdlp.ts             # Child-process execution & format normalizer
│   ├── ffmpeg/
│   │   └── processor.ts         # Stream merger & MP3 conversion pipeline
│   └── rate-limiter.ts          # In-memory rate limiting with IP tracking
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # 1-command startup configuration
└── package.json                 # Dependencies and scripts
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js 18+** or **Node.js 20+**
- (Optional for local testing without Docker) **Python 3** + `yt-dlp` and `ffmpeg` in your system `PATH`:
  - Windows: `winget install yt-dlp` and `winget install Gyan.FFmpeg`
  - macOS: `brew install yt-dlp ffmpeg`
  - Linux: `sudo apt install ffmpeg && pip3 install yt-dlp`

*(Note: If `yt-dlp` is not installed locally, the app provides high-fidelity fallback mock data for testing UI interactions seamlessly.)*

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment (Recommended)

Run the full stack with all system binaries (`ffmpeg`, `yt-dlp`, Node.js) packaged:

### Using Docker Compose
```bash
docker-compose up --build -d
```

### Or Build & Run Directly
```bash
docker build -t snapmedia-downloader .
docker run -p 3000:3000 snapmedia-downloader
```

---

## 📡 API Endpoints Specification

### 1. Metadata Extraction
- **Endpoint:** `POST /api/fetch-info`
- **Request Body:**
  ```json
  {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
  ```
- **Sample Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "dQw4w9WgXcQ",
      "title": "Rick Astley - Never Gonna Give You Up",
      "uploader": "Rick Astley",
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "durationFormatted": "3:33",
      "platform": "youtube",
      "formats": [
        { "id": "1080p", "quality": "Full HD (1080p)", "ext": "mp4", "fileSize": "45.2 MB" },
        { "id": "720p", "quality": "HD (720p)", "ext": "mp4", "fileSize": "22.1 MB" }
      ],
      "audioFormats": [
        { "id": "audio_320", "quality": "MP3 Audio (320kbps High)", "ext": "mp3", "fileSize": "6.2 MB" }
      ]
    }
  }
  ```

### 2. Direct Streaming Download
- **Endpoint:** `GET /api/download`
- **Query Parameters:**
  - `url`: Target video URL (encoded)
  - `format_id`: Format identifier (e.g. `1080p`, `best`, `audio_320`)
  - `is_audio`: `true` or `false`
  - `title`: Filename prefix
  - `ext`: `mp4` or `mp3`
- **Headers Returned:**
  - `Content-Type: video/mp4` or `audio/mpeg`
  - `Content-Disposition: attachment; filename="title.mp4"`
  - `Transfer-Encoding: chunked`

### 3. Diagnostics & Health Check
- **Endpoint:** `GET /api/health`
- **Response:** Reports `yt-dlp` and `ffmpeg` availability and active platforms.

---

## 🚢 Deploy to VPS / Railway / Render

### Deploy on Railway / Render:
1. Connect your GitHub repository.
2. Select **Dockerfile** as the build method.
3. Railway/Render will automatically build the multi-stage image with `yt-dlp` and `ffmpeg` bundled.

### Deploy on Ubuntu VPS:
```bash
# 1. Clone repository
git clone <repo-url> && cd <repo-folder>

# 2. Run with Docker Compose
docker-compose up -d --build
```
