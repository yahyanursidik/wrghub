# Multi-stage Production Dockerfile for WargaHub
# Stage 1: Build Dependencies & Compile Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build project
COPY . .
ENV ASTRO_TELEMETRY_DISABLED=1
RUN node ./node_modules/astro/astro.js build

# Stage 2: Minimal Production Image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Copy only production dependencies and built distribution
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prod-server.mjs ./prod-server.mjs

EXPOSE 4321

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4321/api/health || exit 1

CMD ["node", "prod-server.mjs"]
