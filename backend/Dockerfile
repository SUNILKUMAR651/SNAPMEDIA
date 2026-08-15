# Render-ready Dockerfile for SnapMedia Backend Service
FROM node:20-bullseye-slim

# Install system dependencies (ffmpeg, python3, pip, curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install and update yt-dlp to the latest release
RUN pip3 install --no-cache-dir -U yt-dlp

WORKDIR /app

# Install npm dependencies
COPY package.json ./
RUN npm install --production

# Copy backend source code
COPY . .

ENV PORT=10000
ENV NODE_ENV=production
ENV YTDLP_PATH=/usr/local/bin/yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg

EXPOSE 10000

CMD ["node", "server.js"]
