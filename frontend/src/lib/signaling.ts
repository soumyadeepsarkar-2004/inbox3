/**
 * WebRTC Signaling Service
 *
 * Uses a WebSocket relay server to exchange SDP offers/answers and ICE candidates
 * between peers identified by their Aptos wallet addresses.
 *
 * Configure the relay URL via:
 *   VITE_SIGNALING_SERVER_URL=wss://your-relay-server.example.com
 *
 * A compatible Node.js signaling server is provided in /signaling-server/.
 */

import type { CallSignal } from './webrtc';

export type SignalingState = 'disconnected' | 'connecting' | 'connected' | 'error';

type SignalHandler = (signal: CallSignal) => void;

export class SignalingService {
    private ws: WebSocket | null = null;
    private localAddress: string = '';
    private onSignalCallback: SignalHandler | null = null;
    private onStateChangeCallback: ((state: SignalingState) => void) | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    private readonly serverUrl: string;

    constructor() {
        this.serverUrl = (import.meta.env.VITE_SIGNALING_SERVER_URL as string | undefined) ?? '';
    }

    isConfigured(): boolean {
        return Boolean(this.serverUrl);
    }

    connect(localAddress: string): void {
        if (!this.serverUrl) {
            console.warn(
                '[Signaling] No signaling server configured. ' +
                'Set VITE_SIGNALING_SERVER_URL in your .env to enable voice/video calls.'
            );
            return;
        }

        this.localAddress = localAddress;
        this._openSocket();
    }

    private _openSocket(): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this._setState('connecting');
        const ws = new WebSocket(this.serverUrl);
        this.ws = ws;

        ws.onopen = () => {
            console.log('[Signaling] Connected to relay server');
            this.reconnectAttempts = 0;
            this._setState('connected');
            // Register this peer with the relay
            this._send({ type: 'register', address: this.localAddress });
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data as string);
                if (data.type === 'signal' && this.onSignalCallback) {
                    this.onSignalCallback(data.payload as CallSignal);
                }
            } catch (e) {
                console.error('[Signaling] Failed to parse message:', e);
            }
        };

        ws.onclose = () => {
            console.warn('[Signaling] Disconnected from relay server');
            this._setState('disconnected');
            this._scheduleReconnect();
        };

        ws.onerror = () => {
            console.error('[Signaling] WebSocket error');
            this._setState('error');
        };
    }

    sendSignal(signal: CallSignal): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('[Signaling] Cannot send signal — not connected to relay server');
            return;
        }
        this._send({ type: 'signal', to: signal.to, payload: signal });
    }

    onSignal(callback: SignalHandler): void {
        this.onSignalCallback = callback;
    }

    onStateChange(callback: (state: SignalingState) => void): void {
        this.onStateChangeCallback = callback;
    }

    disconnect(): void {
        this._clearReconnectTimer();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this._setState('disconnected');
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private _send(data: unknown): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    private _setState(state: SignalingState): void {
        this.onStateChangeCallback?.(state);
    }

    private _scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error('[Signaling] Max reconnect attempts reached. Giving up.');
            return;
        }
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000); // exponential back-off, max 30s
        this.reconnectAttempts++;
        console.log(`[Signaling] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
        this.reconnectTimer = setTimeout(() => this._openSocket(), delay);
    }

    private _clearReconnectTimer(): void {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}

// ─── Singleton ───────────────────────────────────────────────────────────────
let _signalingService: SignalingService | null = null;

export function getSignalingService(): SignalingService {
    if (!_signalingService) {
        _signalingService = new SignalingService();
    }
    return _signalingService;
}
