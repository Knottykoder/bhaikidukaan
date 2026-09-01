# ============================================
# Web Frontend — Multi-stage Production Build
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY packages/proto-gen ./packages/proto-gen
COPY web ./web
COPY proto ./proto

# Install dependencies
RUN npm ci --workspace=@bhaikidukaan/web --include-workspace-root

# Build Vite SPA
RUN npm run build --workspace=@bhaikidukaan/web

# Stage 2: Nginx Web Server
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from builder stage
COPY --from=builder /app/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
