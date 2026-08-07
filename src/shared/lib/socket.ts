import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';

type Listener = { event: string; handler: (...args: any[]) => void };

/**
 * Singleton class to manage Socket.IO connections.
 * It queues listeners if they are registered before the socket connects,
 * ensuring no events are missed on initial load or reconnects.
 */
class AgentSocket {
  private ws: Socket | null = null;
  private pendingListeners: Listener[] = [];

  connect(token: string) {
    if (this.ws?.connected) return;

    this.ws = io(`${env.VITE_WS_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    this.ws.on('connect', () => {
      if (import.meta.env.DEV) console.log('[Socket] Connected');
      this.ws?.emit('chat:rejoin_rooms');

      // Re-bind listeners on reconnect to avoid duplicate handlers from accumulating
      this.pendingListeners.forEach(({ event, handler }) => {
        this.ws?.off(event, handler);
        this.ws?.on(event, handler);
      });
    });

    this.pendingListeners.forEach(({ event, handler }) => {
      this.ws?.on(event, handler);
    });

    this.ws.on('disconnect', () => {
      if (import.meta.env.DEV) console.log('[Socket] Disconnected');
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
    }
    this.pendingListeners = [];
  }

  on(event: string, handler: (...args: any[]) => void) {
      // Prevent registering duplicate handlers, especially in React StrictMode
    const alreadyExists = this.pendingListeners.some(
      (l) => l.event === event && l.handler === handler
    );
    if (!alreadyExists) {
      this.pendingListeners.push({ event, handler });
    }
    this.ws?.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    this.pendingListeners = this.pendingListeners.filter(
      (l) => !(l.event === event && (!handler || l.handler === handler))
    );
    this.ws?.off(event, handler);
  }

  emit(event: string, data?: any) {
    if (import.meta.env.DEV) console.log(`[Socket] Emit: ${event}`, data);
    if (!this.ws?.connected) {
      if (import.meta.env.DEV) console.warn('[Socket] Cannot emit - not connected!');
    }
    this.ws?.emit(event, data);
  }
}

export const socketInstance = new AgentSocket();
