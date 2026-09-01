import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const services = [
  { name: 'USER-SERVICE   ', path: 'services/user-service/dist/server.js' },
  { name: 'PRODUCT-SERVICE', path: 'services/product-service/dist/server.js' },
  { name: 'ORDER-SERVICE  ', path: 'services/order-service/dist/server.js' },
  { name: 'PAYMENT-SERVICE', path: 'services/payment-service/dist/server.js' },
  { name: 'API-GATEWAY    ', path: 'services/gateway/dist/server.js' },
];

console.log('🚀 Starting all BhaiKiDukaan microservices & API Gateway...');

const processes = [];

services.forEach(({ name, path: servicePath }) => {
  const fullPath = path.resolve(ROOT_DIR, servicePath);
  const child = spawn('node', [fullPath], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
    env: { ...process.env },
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  child.on('exit', (code) => {
    console.log(`[${name}] Exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error(`💥 Critical service ${name} crashed! Exiting container.`);
      process.exit(code || 1);
    }
  });

  processes.push(child);
});

// Handle graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, stopping all services...`);
  processes.forEach((p) => p.kill('SIGTERM'));
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
