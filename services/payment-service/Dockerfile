# ============================================
# Payment Service — Multi-stage Docker Build
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY services/payment-service ./services/payment-service
COPY proto ./proto

# Install dependencies
RUN npm ci --workspace=@bhaikidukaan/payment-service --include-workspace-root

# Build TypeScript
RUN npm run build --workspace=@bhaikidukaan/payment-service

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files and dependencies
COPY package.json package-lock.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY proto ./proto
COPY services/payment-service/package.json ./services/payment-service/
COPY --from=builder /app/services/payment-service/dist ./services/payment-service/dist

# Install production dependencies only
RUN npm ci --workspace=@bhaikidukaan/payment-service --include-workspace-root --omit=dev

EXPOSE 50054

CMD ["node", "services/payment-service/dist/server.js"]
