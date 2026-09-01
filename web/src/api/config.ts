// ============================================
// Centralized API Configuration
// Resolves VITE_API_URL dynamically for dev & production deployments
// ============================================

const rawUrl = (import.meta as any).env?.VITE_API_URL;

export const GATEWAY_URL = (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== ''
  ? rawUrl.trim()
  : 'http://localhost:4000'
).replace(/\/+$/, '');

export const API_BASE = `${GATEWAY_URL}/api`;
