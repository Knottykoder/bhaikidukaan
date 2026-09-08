/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@bhaikidukaan/proto-gen': path.resolve(__dirname, '../packages/proto-gen/src'),
    },
  },
  optimizeDeps: {
    include: ['@connectrpc/connect', '@connectrpc/connect-web', '@bufbuild/protobuf'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/stores/cartStore.ts',
        'src/stores/authStore.ts',
        'src/stores/productStore.ts',
        'src/stores/authModalStore.ts',
        'src/store/index.ts',
        'src/store/slices/uiSlice.ts',
        'src/components/BrandTrustBar.tsx',
        'src/components/Footer.tsx',
        'src/components/FlashSaleBanner.tsx',
        'src/components/ProductCard.tsx',
        'src/components/CartDrawer.tsx',
        'src/components/Navbar.tsx',
        'src/pages/Home.tsx',
        'src/pages/ProductDetail.tsx',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
