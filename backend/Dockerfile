# --- STAGE 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for NestJS compilation)
RUN npm ci

# Copy source code files
COPY . .

# Generate Prisma client for database calls
RUN npx prisma generate

# Build production compiled JavaScript files
RUN npm run build

# --- STAGE 2: RUNNER ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built application and required production packages
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Automatically run prisma schema push to keep the PostgreSQL tables and pgvector updated on start, then run NestJS
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main"]
