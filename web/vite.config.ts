import { defineConfig } from 'vite';
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
});
