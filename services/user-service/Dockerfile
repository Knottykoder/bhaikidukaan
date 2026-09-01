# ============================================
# User Service — Multi-stage Docker Build
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY services/user-service ./services/user-service
COPY proto ./proto

# Install dependencies
RUN npm ci --workspace=@bhaikidukaan/user-service --include-workspace-root

# Build TypeScript
RUN npm run build --workspace=@bhaikidukaan/user-service

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files and dependencies
COPY package.json package-lock.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY proto ./proto
COPY services/user-service/package.json ./services/user-service/
COPY --from=builder /app/services/user-service/dist ./services/user-service/dist

# Install production dependencies only
RUN npm ci --workspace=@bhaikidukaan/user-service --include-workspace-root --omit=dev

EXPOSE 50051

CMD ["node", "services/user-service/dist/server.js"]
