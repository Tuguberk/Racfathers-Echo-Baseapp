# ---------- Base ----------
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
# Native addon build deps for node-gyp (only during install)
RUN apk add --no-cache --virtual .gyp python3 make g++
WORKDIR /app

# Install deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Remove build deps
RUN apk del .gyp

# ---------- Builder ----------
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before build
RUN npx prisma generate

# Increase V8 heap (2GB) so Node doesn’t crash early
ENV NODE_OPTIONS="--max-old-space-size=2048"
# Reduce Next/SWC concurrency (fewer parallel workers → less RAM)
ENV SWC_WORKER_COUNT=1

# Build Next (will produce .next/standalone because of output:'standalone')
RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# ---------- Runner ----------
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nextjs

# App assets
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
# Optional but often useful:
COPY --from=builder /app/prisma ./prisma

# Next runtime files
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
# server.js is produced by standalone build
CMD HOSTNAME="0.0.0.0" node server.js
