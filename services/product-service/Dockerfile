# ============================================
# Product Service — Multi-stage Docker Build
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY services/product-service ./services/product-service
COPY proto ./proto

# Install dependencies
RUN npm ci --workspace=@bhaikidukaan/product-service --include-workspace-root

# Build TypeScript
RUN npm run build --workspace=@bhaikidukaan/product-service

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files and dependencies
COPY package.json package-lock.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY proto ./proto
COPY services/product-service/package.json ./services/product-service/
COPY --from=builder /app/services/product-service/dist ./services/product-service/dist

# Install production dependencies only
RUN npm ci --workspace=@bhaikidukaan/product-service --include-workspace-root --omit=dev

EXPOSE 50052

CMD ["node", "services/product-service/dist/server.js"]
