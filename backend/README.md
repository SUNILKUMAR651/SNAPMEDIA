# SnapMedia Backend (Render Deployment Guide)

Standalone Node.js Express backend engine powered by `yt-dlp` and `FFmpeg`.

---

## 🚀 How to Deploy on Render (Step-by-Step)

### Option 1: Render Web Service (Docker Environment - Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **"New +"** -> **"Web Service"**.
2. Connect your GitHub repository: `https://github.com/SUNILKUMAR651/SNAPMEDIA`.
3. In settings:
   - **Name:** `snapmedia-backend`
   - **Root Directory:** `backend`
   - **Language / Environment:** `Docker` (or choose Dockerfile)
   - **Dockerfile Path:** `./Dockerfile` (or `backend/Dockerfile`)
   - **Plan:** Free (or Starter)
4. Click **"Deploy Web Service"**.
5. Once deployed, Render will provide your live URL (e.g. `https://snapmedia-backend.onrender.com`).

---

## 📡 API Endpoints

- **Health Check:** `GET /api/health`
- **Metadata Extraction:** `POST /api/fetch-info` (Body: `{ "url": "https://..." }`)
- **Direct Stream Download:** `GET /api/download?url=...&format_id=...&is_audio=false`
