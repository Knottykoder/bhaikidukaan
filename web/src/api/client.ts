import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { UserService, ProductService, OrderService, PaymentService } from '@bhaikidukaan/proto-gen';

// Gateway Base URL (Env or default local port 4000)
const GATEWAY_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

// ----------------------------------------------------
// Live gRPC Telemetry Inspector Event Bus
// ----------------------------------------------------
export interface GrpcCallLog {
  id: string;
  timestamp: string;
  service: string;
  method: string;
  request: any;
  response?: any;
  error?: string;
  durationMs: number;
  status: 'OK' | 'ERROR' | 'PENDING';
  mode: 'LIVE_GRPC' | 'DEMO_MOCK';
}

type TelemetryListener = (log: GrpcCallLog) => void;
const listeners: Set<TelemetryListener> = new Set();
export const telemetryLogs: GrpcCallLog[] = [];

export function subscribeTelemetry(listener: TelemetryListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitTelemetry(log: GrpcCallLog) {
  telemetryLogs.unshift(log);
  if (telemetryLogs.length > 50) telemetryLogs.pop();
  listeners.forEach((l) => l(log));
}

// ----------------------------------------------------
// Real Connect-RPC Transport
// ----------------------------------------------------
export const transport = createConnectTransport({
  baseUrl: GATEWAY_URL,
  interceptors: [
    (next) => async (req) => {
      const startTime = performance.now();
      const token = localStorage.getItem('bkd_access_token');
      if (token) {
        req.header.set('Authorization', `Bearer ${token}`);
      }

      const logId = Math.random().toString(36).substring(2, 9);
      const serviceName = req.service.typeName;
      const methodName = req.method.name;

      emitTelemetry({
        id: logId,
        timestamp: new Date().toLocaleTimeString(),
        service: serviceName,
        method: methodName,
        request: req.message,
        durationMs: 0,
        status: 'PENDING',
        mode: 'LIVE_GRPC',
      });

      try {
        const res = await next(req);
        const duration = Math.round(performance.now() - startTime);

        emitTelemetry({
          id: logId,
          timestamp: new Date().toLocaleTimeString(),
          service: serviceName,
          method: methodName,
          request: req.message,
          response: res.message,
          durationMs: duration,
          status: 'OK',
          mode: 'LIVE_GRPC',
        });
        return res;
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        emitTelemetry({
          id: logId,
          timestamp: new Date().toLocaleTimeString(),
          service: serviceName,
          method: methodName,
          request: req.message,
          error: err.message || 'gRPC error',
          durationMs: duration,
          status: 'ERROR',
          mode: 'LIVE_GRPC',
        });
        throw err;
      }
    },
  ],
});

// Safe Client Factory with Module Interop Unwrapping
function createSafeClient(service: any, trans: any) {
  const svc =
    service?.UserService ||
    service?.ProductService ||
    service?.OrderService ||
    service?.PaymentService ||
    service?.default ||
    service;

  if (svc && svc.methods && typeof svc.methods === 'object') {
    try {
      return createClient(svc, trans);
    } catch (err) {
      console.warn('[Connect-RPC] Client creation warning:', err);
    }
  }
  return {};
}

// Live Connect Clients
export const userClient = createSafeClient(UserService, transport);
export const productClient = createSafeClient(ProductService, transport);
export const orderClient = createSafeClient(OrderService, transport);
export const paymentClient = createSafeClient(PaymentService, transport);
