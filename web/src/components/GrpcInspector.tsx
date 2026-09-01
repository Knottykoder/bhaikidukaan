import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronDown, ChevronUp, Terminal, CheckCircle2, AlertCircle, Clock, Zap, X } from 'lucide-react';
import { subscribeTelemetry, telemetryLogs, GrpcCallLog } from '../api/client.js';

export const GrpcInspector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<GrpcCallLog[]>(telemetryLogs);
  const [activeLog, setActiveLog] = useState<GrpcCallLog | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTelemetry((newLog) => {
      setLogs([...telemetryLogs]);
    });
    return unsubscribe;
  }, []);

  const latestLog = logs[0];

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
      {/* Floating Indicator Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 9999,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 15px rgba(99, 102, 241, 0.2)',
          color: '#e2e8f0',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'flex',
            height: 10,
            width: 10,
          }}
        >
          <span
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              borderRadius: '50%',
              background: '#10b981',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              borderRadius: '50%',
              height: 10,
              width: 10,
              background: '#10b981',
            }}
          />
        </span>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          gRPC Live Stream
        </span>

        {latestLog && (
          <span
            style={{
              fontSize: '0.75rem',
              color: '#818cf8',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '2px 8px',
              borderRadius: 6,
            }}
          >
            {latestLog.service.split('.').pop()}::{latestLog.method} ({latestLog.durationMs}ms)
          </span>
        )}

        {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </motion.button>

      {/* Drawer / Inspector Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 20,
              width: 'min(580px, 92vw)',
              height: '520px',
              background: '#0d1117',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 16,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              zIndex: 1000,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(22, 27, 38, 0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={18} color="#818cf8" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                  gRPC & Protobuf RPC Inspector
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  HTTP/2 Connect
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content: Split Log list & Detail */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Log List */}
              <div
                style={{
                  width: '45%',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  overflowY: 'auto',
                  padding: '8px 0',
                }}
              >
                {logs.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    Interact with the app to see live gRPC RPC telemetry here...
                  </div>
                ) : (
                  logs.map((log) => {
                    const isSelected = activeLog?.id === log.id;
                    return (
                      <div
                        key={log.id}
                        onClick={() => setActiveLog(log)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              color: log.status === 'OK' ? '#34d399' : '#f87171',
                            }}
                          >
                            {log.method}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                            {log.durationMs}ms
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                          {log.service.split('.').pop()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right JSON Viewer */}
              <div style={{ flex: 1, padding: 14, overflowY: 'auto', background: '#0a0d14' }}>
                {activeLog || latestLog ? (
                  (() => {
                    const l = activeLog || latestLog;
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                            RPC: {l.service}::{l.method}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: l.status === 'OK' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: l.status === 'OK' ? '#34d399' : '#f87171',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {l.status} ({l.durationMs}ms)
                          </span>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>
                            Request Payload (Protobuf message)
                          </div>
                          <pre
                            style={{
                              background: '#131822',
                              padding: 10,
                              borderRadius: 8,
                              fontSize: '0.75rem',
                              color: '#cbd5e1',
                              fontFamily: 'var(--font-mono)',
                              overflowX: 'auto',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            {JSON.stringify(l.request, null, 2)}
                          </pre>
                        </div>

                        {l.response && (
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>
                              Response Payload
                            </div>
                            <pre
                              style={{
                                background: '#131822',
                                padding: 10,
                                borderRadius: 8,
                                fontSize: '0.75rem',
                                color: '#86efac',
                                fontFamily: 'var(--font-mono)',
                                overflowX: 'auto',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              {JSON.stringify(l.response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Select an RPC method on the left to inspect binary frames & payload metadata.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
