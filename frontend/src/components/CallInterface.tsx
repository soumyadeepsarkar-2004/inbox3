import { useState, useEffect, useRef, useCallback } from 'react';
import { getWebRTCService, type CallSession, type CallSignal, type CallType } from '../lib/webrtc';
import { getFromPinata } from '../lib/ipfs';

interface CallInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    remoteAddress: string;
    localAddress: string;
    callType: CallType;
    isIncoming?: boolean;
    incomingSignal?: CallSignal;
}

export function CallInterface({
    isOpen,
    onClose,
    remoteAddress,
    localAddress,
    callType,
    isIncoming = false,
    incomingSignal
}: CallInterfaceProps) {
    const [session, setSession] = useState<CallSession | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const webrtcService = getWebRTCService();

    // Poll for incoming signals
    const pollForSignals = useCallback(async () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(`call_signal_${localAddress}_`));

        for (const key of keys) {
            const cid = localStorage.getItem(key);
            if (cid) {
                try {
                    const signal = await getFromPinata(cid) as unknown as CallSignal;
                    if (signal && signal.to === localAddress && Date.now() < (signal as unknown as { expiry: number }).expiry) {
                        await webrtcService.handleSignal(signal);
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    console.error('Error processing signal:', error);
                }
            }
        }
    }, [localAddress, webrtcService]);

    useEffect(() => {
        if (!isOpen) return;

        webrtcService.setLocalAddress(localAddress);
        webrtcService.setCallbacks(
            (updatedSession) => {
                setSession(updatedSession);

                switch (updatedSession.state) {
                    case 'calling':
                        setConnectionStatus('Calling...');
                        break;
                    case 'ringing':
                        setConnectionStatus('Ringing...');
                        break;
                    case 'connected':
                        setConnectionStatus('Connected');
                        break;
                    case 'ended':
                        setConnectionStatus('Call ended');
                        setTimeout(onClose, 2000);
                        break;
                    case 'failed':
                        setConnectionStatus('Connection failed');
                        setTimeout(onClose, 2000);
                        break;
                }
            },
            (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            }
        );

        // Start or accept call
        if (isIncoming && incomingSignal) {
            webrtcService.acceptCall(incomingSignal);
        } else {
            webrtcService.startCall(remoteAddress, callType);
        }

        // Poll for signals
        const signalPollInterval = setInterval(pollForSignals, 1000);

        return () => {
            clearInterval(signalPollInterval);
        };
    }, [isOpen, localAddress, remoteAddress, callType, isIncoming, incomingSignal, webrtcService, onClose, pollForSignals]);

    // Update local video
    useEffect(() => {
        if (session?.localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = session.localStream;
        }
    }, [session?.localStream]);

    // Call duration timer
    useEffect(() => {
        if (session?.state === 'connected') {
            const interval = setInterval(() => {
                setCallDuration(Math.floor((Date.now() - session.startTime) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [session?.state, session?.startTime]);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMute = () => {
        const muted = webrtcService.toggleMute();
        setIsMuted(muted);
    };

    const handleVideoToggle = () => {
        const off = webrtcService.toggleVideo();
        setIsVideoOff(off);
    };

    const handleEndCall = () => {
        webrtcService.endCall();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-linear-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                        {remoteAddress.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-white font-black text-lg tracking-tight">
                            {remoteAddress.slice(0, 8)}...{remoteAddress.slice(-6)}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${session?.state === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                            <p className="text-white/60 text-sm font-bold">{connectionStatus}</p>
                        </div>
                    </div>
                </div>

                {session?.state === 'connected' && (
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <span className="text-white font-mono font-bold text-lg">{formatDuration(callDuration)}</span>
                    </div>
                )}
            </div>

            {/* Video Area */}
            <div className="flex-1 relative overflow-hidden">
                {callType === 'video' ? (
                    <>
                        {/* Remote Video (Full Screen) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />

                        {/* Local Video (Picture in Picture) */}
                        <div className="absolute bottom-6 right-6 w-40 h-56 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/50 bg-black">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                            />
                            {isVideoOff && (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* No video from remote placeholder */}
                        {!remoteVideoRef.current?.srcObject && (
                            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl">
                                            {remoteAddress.slice(2, 4).toUpperCase()}
                                        </div>
                                    </div>
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Waiting for video...</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Voice Call UI */
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-900/50 via-purple-900/50 to-black">
                        <div className="text-center">
                            {/* Animated waveform background */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={`ping-${i}`}
                                            className="absolute w-40 h-40 rounded-full border-2 border-indigo-500/30 animate-ping"
                                            style={{ animationDelay: `${i * 0.5}s`, animationDuration: '2s' }}
                                        />
                                    ))}
                                </div>

                                <div className="relative w-40 h-40 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
                                    <span className="text-white font-black text-5xl">
                                        {remoteAddress.slice(2, 4).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-white font-black text-2xl tracking-tight mb-2">
                                {remoteAddress.slice(0, 12)}...{remoteAddress.slice(-8)}
                            </h2>
                            <p className="text-white/60 text-lg font-bold">{connectionStatus}</p>

                            {session?.state === 'connected' && (
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    {/* Audio Visualizer */}
                                    <div className="flex items-end gap-1 h-8">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={`vis-left-${i}`}
                                                className="w-1 bg-indigo-400 rounded-full animate-pulse"
                                                style={{
                                                    height: `${20 + (i * 15)}%`,
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white font-mono text-2xl font-bold">{formatDuration(callDuration)}</span>
                                    <div className="flex items-end gap-1 h-8">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={`vis-right-${i}`}
                                                className="w-1 bg-indigo-400 rounded-full animate-pulse"
                                                style={{
                                                    height: `${20 + (i * 15)}%`,
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hidden audio element for voice call */}
                        <audio ref={remoteVideoRef as unknown as React.RefObject<HTMLAudioElement | null>} autoPlay />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-8 bg-linear-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-center gap-6">
                    {/* Mute Button */}
                    <button
                        onClick={handleMute}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        {isMuted ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>

                    {/* Video Toggle (only for video calls) */}
                    {callType === 'video' && (
                        <button
                            onClick={handleVideoToggle}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isVideoOff
                                ? 'bg-red-500 text-white'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {isVideoOff ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        onClick={handleEndCall}
                        className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-500/30 hover:bg-red-600 hover:scale-105 transition-all"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            <line x1="23" y1="1" x2="1" y2="23" strokeWidth="3" />
                        </svg>
                    </button>

                    {/* Speaker Button */}
                    <button
                        className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Incoming Call Modal
interface IncomingCallProps {
    isOpen: boolean;
    signal: CallSignal | null;
    onAccept: () => void;
    onReject: () => void;
}

export function IncomingCallModal({ isOpen, signal, onAccept, onReject }: IncomingCallProps) {
    if (!isOpen || !signal) return null;

    return (
        <div className="fixed inset-0 z-99 bg-black/80 backdrop-blur-xl flex items-center justify-center animate-fade-in">
            <div className="bg-linear-to-br from-gray-900 to-black rounded-[3rem] p-10 border border-white/10 shadow-2xl max-w-sm w-full mx-4 animate-scale-in">
                {/* Animated rings */}
                <div className="relative flex items-center justify-center mb-8">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={`incoming-ping-${i}`}
                            className="absolute w-32 h-32 rounded-full border-2 border-indigo-500/30 animate-ping"
                            style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.5s' }}
                        />
                    ))}
                    <div className="w-28 h-28 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                        <span className="text-white font-black text-3xl">
                            {signal.from.slice(2, 4).toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-white font-black text-xl tracking-tight mb-2">Incoming {signal.callType === 'video' ? 'Video' : 'Voice'} Call</h2>
                    <p className="text-white/60 text-sm font-mono">
                        {signal.from.slice(0, 10)}...{signal.from.slice(-8)}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-8">
                    {/* Reject */}
                    <button
                        onClick={onReject}
                        className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/30 hover:bg-red-600 hover:scale-110 transition-all"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Accept */}
                    <button
                        onClick={onAccept}
                        className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all animate-pulse"
                    >
                        {signal.callType === 'video' ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CallInterface;
