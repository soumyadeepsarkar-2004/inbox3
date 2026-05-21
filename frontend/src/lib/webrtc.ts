/**
 * WebRTC Service for Peer-to-Peer Voice and Video Calling
 * Handles connection establishment, media streams, and call signaling.
 *
 * Signaling is transported via SignalingService (WebSocket relay).
 * Configure the relay: VITE_SIGNALING_SERVER_URL=wss://your-relay.example.com
 */

import { getSignalingService } from './signaling';

export type CallType = 'voice' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';

export interface CallSignal {
    type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end';
    from: string;
    to: string;
    callType: CallType;
    payload?: RTCSessionDescriptionInit | RTCIceCandidateInit | null;
    timestamp: number;
}

export interface CallSession {
    id: string;
    remoteAddress: string;
    callType: CallType;
    state: CallState;
    startTime: number;
    endTime?: number;
    localStream?: MediaStream;
    remoteStream?: MediaStream;
}

// STUN servers for NAT traversal (public Google STUN servers)
const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ]
};

type CallEventCallback = (session: CallSession) => void;

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private currentSession: CallSession | null = null;
    private pendingCandidates: RTCIceCandidateInit[] = [];

    private onCallStateChange: CallEventCallback | null = null;
    private onRemoteStream: ((stream: MediaStream) => void) | null = null;
    private localAddress: string = '';

    constructor() {
        // Wire up the signaling service to deliver incoming signals to this WebRTC service
        const signaling = getSignalingService();
        signaling.onSignal((signal: CallSignal) => {
            this.handleSignal(signal).catch(err =>
                console.error('[WebRTC] Error handling incoming signal:', err)
            );
        });
    }

    setLocalAddress(address: string) {
        this.localAddress = address;
    }

    setCallbacks(
        onCallStateChange: CallEventCallback,
        onRemoteStream: (stream: MediaStream) => void,
    ) {
        this.onCallStateChange = onCallStateChange;
        this.onRemoteStream = onRemoteStream;
    }

    private generateCallId(): string {
        return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private updateSession(updates: Partial<CallSession>) {
        if (this.currentSession) {
            this.currentSession = { ...this.currentSession, ...updates };
            this.onCallStateChange?.(this.currentSession);
        }
    }

    async startCall(remoteAddress: string, callType: CallType): Promise<void> {
        const signaling = getSignalingService();
        if (!signaling.isConfigured()) {
            throw new Error(
                'Calling requires a signaling server. ' +
                'Set VITE_SIGNALING_SERVER_URL in your .env file and restart. ' +
                'See /signaling-server/server.js for the relay server.'
            );
        }

        console.log(`[WebRTC] Starting ${callType} call to ${remoteAddress}`);

        try {
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: callType === 'video'
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

            this.currentSession = {
                id: this.generateCallId(),
                remoteAddress,
                callType,
                state: 'calling',
                startTime: Date.now(),
                localStream: this.localStream
            };
            this.onCallStateChange?.(this.currentSession);

            await this.createPeerConnection(remoteAddress, callType);

            this.localStream.getTracks().forEach(track => {
                if (this.peerConnection && this.localStream) {
                    this.peerConnection.addTrack(track, this.localStream);
                }
            });

            const offer = await this.peerConnection!.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: callType === 'video'
            });
            await this.peerConnection!.setLocalDescription(offer);

            // Notify the remote peer — call-request comes first so the UI can ring
            this.sendSignal({
                type: 'call-request',
                from: this.localAddress,
                to: remoteAddress,
                callType,
                timestamp: Date.now()
            });

            this.sendSignal({
                type: 'offer',
                from: this.localAddress,
                to: remoteAddress,
                callType,
                payload: offer,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('[WebRTC] Failed to start call:', error);
            this.updateSession({ state: 'failed' });
            this.cleanup();
            throw error;
        }
    }

    async acceptCall(signal: CallSignal): Promise<void> {
        console.log(`[WebRTC] Accepting ${signal.callType} call from ${signal.from}`);

        try {
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: signal.callType === 'video'
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

            this.currentSession = {
                id: this.generateCallId(),
                remoteAddress: signal.from,
                callType: signal.callType,
                state: 'connected',
                startTime: Date.now(),
                localStream: this.localStream
            };
            this.onCallStateChange?.(this.currentSession);

            await this.createPeerConnection(signal.from, signal.callType);

            this.localStream.getTracks().forEach(track => {
                if (this.peerConnection && this.localStream) {
                    this.peerConnection.addTrack(track, this.localStream);
                }
            });

            this.sendSignal({
                type: 'call-accept',
                from: this.localAddress,
                to: signal.from,
                callType: signal.callType,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('[WebRTC] Failed to accept call:', error);
            this.rejectCall(signal);
            throw error;
        }
    }

    rejectCall(signal: CallSignal): void {
        console.log(`[WebRTC] Rejecting call from ${signal.from}`);
        this.sendSignal({
            type: 'call-reject',
            from: this.localAddress,
            to: signal.from,
            callType: signal.callType,
            timestamp: Date.now()
        });
        this.cleanup();
    }

    endCall(): void {
        console.log('[WebRTC] Ending call');
        if (this.currentSession) {
            this.sendSignal({
                type: 'call-end',
                from: this.localAddress,
                to: this.currentSession.remoteAddress,
                callType: this.currentSession.callType,
                timestamp: Date.now()
            });
            this.updateSession({ state: 'ended', endTime: Date.now() });
        }
        this.cleanup();
    }

    async handleSignal(signal: CallSignal): Promise<void> {
        console.log(`[WebRTC] Received signal: ${signal.type} from ${signal.from}`);

        switch (signal.type) {
            case 'offer':
                if (this.peerConnection && signal.payload) {
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit)
                    );
                    for (const candidate of this.pendingCandidates) {
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    this.pendingCandidates = [];

                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);

                    this.sendSignal({
                        type: 'answer',
                        from: this.localAddress,
                        to: signal.from,
                        callType: signal.callType,
                        payload: answer,
                        timestamp: Date.now()
                    });
                }
                break;

            case 'answer':
                if (this.peerConnection && signal.payload) {
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit)
                    );
                    for (const candidate of this.pendingCandidates) {
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    this.pendingCandidates = [];
                    this.updateSession({ state: 'connected' });
                }
                break;

            case 'ice-candidate':
                if (signal.payload) {
                    if (this.peerConnection?.remoteDescription) {
                        await this.peerConnection.addIceCandidate(
                            new RTCIceCandidate(signal.payload as RTCIceCandidateInit)
                        );
                    } else {
                        this.pendingCandidates.push(signal.payload as RTCIceCandidateInit);
                    }
                }
                break;

            case 'call-accept':
                this.updateSession({ state: 'connected' });
                break;

            case 'call-reject':
                this.updateSession({ state: 'ended' });
                this.cleanup();
                break;

            case 'call-end':
                this.updateSession({ state: 'ended', endTime: Date.now() });
                this.cleanup();
                break;

            default:
                break;
        }
    }

    private async createPeerConnection(remoteAddress: string, callType: CallType): Promise<void> {
        this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal({
                    type: 'ice-candidate',
                    from: this.localAddress,
                    to: remoteAddress,
                    callType,
                    payload: event.candidate.toJSON(),
                    timestamp: Date.now()
                });
            }
        };

        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.updateSession({ remoteStream: this.remoteStream });
            this.onRemoteStream?.(this.remoteStream);
        };

        this.peerConnection.onconnectionstatechange = () => {
            switch (this.peerConnection?.connectionState) {
                case 'connected':
                    this.updateSession({ state: 'connected' });
                    break;
                case 'disconnected':
                case 'failed':
                    this.updateSession({ state: 'failed' });
                    this.cleanup();
                    break;
            }
        };
    }

    private sendSignal(signal: CallSignal): void {
        const signaling = getSignalingService();
        signaling.sendSignal(signal);
    }

    private cleanup(): void {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        this.remoteStream = null;
        this.pendingCandidates = [];
    }

    toggleMute(): boolean {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return !audioTrack.enabled;
            }
        }
        return false;
    }

    toggleVideo(): boolean {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                return !videoTrack.enabled;
            }
        }
        return false;
    }

    getCurrentSession(): CallSession | null {
        return this.currentSession;
    }

    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    getRemoteStream(): MediaStream | null {
        return this.remoteStream;
    }

    destroy(): void {
        this.endCall();
        this.onCallStateChange = null;
        this.onRemoteStream = null;
    }
}

// ─── Singleton ───────────────────────────────────────────────────────────────
let webrtcService: WebRTCService | null = null;

export function getWebRTCService(): WebRTCService {
    if (!webrtcService) {
        webrtcService = new WebRTCService();
    }
    return webrtcService;
}
