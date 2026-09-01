# ============================================
# API Gateway — Multi-stage Docker Build
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY services/gateway ./services/gateway
COPY proto ./proto

# Install dependencies
RUN npm ci --workspace=@bhaikidukaan/gateway --include-workspace-root

# Build TypeScript
RUN npm run build --workspace=@bhaikidukaan/gateway

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files and dependencies
COPY package.json package-lock.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY proto ./proto
COPY services/gateway/package.json ./services/gateway/
COPY --from=builder /app/services/gateway/dist ./services/gateway/dist

# Install production dependencies only
RUN npm ci --workspace=@bhaikidukaan/gateway --include-workspace-root --omit=dev

EXPOSE 4000

CMD ["node", "services/gateway/dist/server.js"]
