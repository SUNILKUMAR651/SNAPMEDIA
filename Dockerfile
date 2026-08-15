# Multi-Stage Production Dockerfile for All-in-One Video Downloader
# Base image includes Node 20, Python 3, ffmpeg, and yt-dlp

FROM node:20-bullseye-slim AS base

# Install ffmpeg, python3, pip, curl, and certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install and update yt-dlp to latest release
RUN pip3 install --no-cache-dir -U yt-dlp

WORKDIR /app

# Dependencies Stage
FROM base AS deps
COPY package.json ./
RUN npm install

# Build Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV YTDLP_PATH=/usr/local/bin/yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/lib ./lib

EXPOSE 3000

CMD ["npm", "run", "start"]
