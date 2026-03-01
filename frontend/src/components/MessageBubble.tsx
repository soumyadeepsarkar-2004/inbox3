import React, { useState, useRef } from 'react';
import { Avatar } from './ui/Avatar';

export interface MessageData {
    id: string | number;
    sender: string;
    content: string;
    timestamp: number;
    isMe: boolean;
    type?: 'text' | 'audio';
    parentId?: string | null;
    cid?: string;
    onChainRead?: boolean;
}

export interface ReplyTarget {
    id: string | number;
    sender: string;
    snippet: string;
}

interface MessageBubbleProps {
    message: MessageData;
    onReply?: (target: ReplyTarget) => void;
    parentMessage?: MessageData | null;
    showAvatar?: boolean;
}

/**
 * Unified Message Bubble Component
 * Uses CSS variables for full theme (light/dark) support
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    onReply,
    parentMessage,
    showAvatar = true
}) => {
    const [imageError, setImageError] = useState<Record<string, boolean>>({});
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const truncateSnippet = (text: string, maxLength = 60) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
    };

    const formatTimestamp = (ts: number) => {
        const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getReplySnippet = () => {
        if (message.type === 'audio') return '🎤 Voice Message';
        if (message.content.includes('![')) return '📷 Photo';
        if (message.content.includes('[Video:')) return '🎬 Video';
        return message.content;
    };

    // === AUDIO PLAYER ===
    const renderAudioPlayer = (audioUrl: string) => {
        const cidMatch = audioUrl.match(/ipfs\/([a-zA-Z0-9]+)/);
        const cid = cidMatch ? cidMatch[1] : null;

        const primaryUrl = cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : audioUrl;
        const fallbackUrls = cid ? [
            `https://cloudflare-ipfs.com/ipfs/${cid}`,
            `https://ipfs.io/ipfs/${cid}`,
            `https://dweb.link/ipfs/${cid}`
        ] : [];

        const togglePlay = () => {
            if (audioRef.current) {
                if (audioPlaying) {
                    audioRef.current.pause();
                } else {
                    audioRef.current.play();
                }
                setAudioPlaying(!audioPlaying);
            }
        };

        // Waveform bars for visualization
        const waveformBars = Array.from({ length: 18 }, (_, i) => {
            const heights = [12, 20, 8, 24, 16, 28, 12, 20, 24, 16, 28, 12, 8, 20, 16, 24, 12, 20];
            return heights[i % heights.length];
        });

        return (
            <div className="flex items-center gap-3 min-w-[220px]">
                {/* Play/Pause Button */}
                <button
                    type="button"
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-(--primary-brand) text-white shadow-md hover:opacity-90"
                >
                    {audioPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Waveform Visualization */}
                <div className="flex-1 flex items-center gap-[2px]">
                    {waveformBars.map((height, i) => (
                        <div
                            key={i}
                            className={`w-[3px] rounded-full ${message.isMe ? 'bg-white/60' : 'bg-(--primary-brand)/40'}`}
                            style={{ height: `${height}px` }}
                        />
                    ))}
                </div>

                {/* Duration */}
                <span className={`text-[11px] font-medium ${message.isMe ? 'text-white/70' : 'text-(--text-muted)'}`}>
                    0:00
                </span>

                {/* Hidden Audio Element */}
                <audio
                    ref={audioRef}
                    preload="metadata"
                    onEnded={() => setAudioPlaying(false)}
                    onError={() => {
                        if (audioRef.current && fallbackUrls.length > 0) {
                            audioRef.current.src = fallbackUrls[0];
                        }
                    }}
                >
                    <source src={primaryUrl} type="audio/webm" />
                    <source src={primaryUrl} type="audio/mpeg" />
                    <source src={primaryUrl} type="audio/wav" />
                    {fallbackUrls.map((url, i) => (
                        <source key={i} src={url} type="audio/webm" />
                    ))}
                </audio>
            </div>
        );
    };

    // === RICH CONTENT PARSER ===
    const renderContent = () => {
        const content = message.content || '';
        if (message.type === 'audio') {
            return renderAudioPlayer(content);
        }
        return renderRichContent(content);
    };

    const renderRichContent = (content: string) => {
        const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
        const videoRegex = /\[Video: (.*?)\]\((.*?)\)/g;
        const fileRegex = /\[(.*?)\]\((.*?)\)/g;

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        const allMatches: { type: 'image' | 'video' | 'file', start: number, end: number, label: string, url: string }[] = [];

        imageRegex.lastIndex = 0;
        videoRegex.lastIndex = 0;
        fileRegex.lastIndex = 0;

        let match: RegExpExecArray | null;

        while ((match = imageRegex.exec(content)) !== null) {
            allMatches.push({ type: 'image', start: match.index, end: match.index + match[0].length, label: match[1], url: match[2] });
        }

        while ((match = videoRegex.exec(content)) !== null) {
            allMatches.push({ type: 'video', start: match.index, end: match.index + match[0].length, label: match[1], url: match[2] });
        }

        while ((match = fileRegex.exec(content)) !== null) {
            if (allMatches.some(am => am.start <= match!.index && am.end >= match!.index + match![0].length)) continue;

            const url = match[2].toLowerCase();
            const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(url) || /\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(match[1]);
            const isVideo = /\.(mp4|webm|ogg|mov)/i.test(url);

            if (isImage) {
                allMatches.push({ type: 'image', start: match.index, end: match.index + match[0].length, label: match[1], url: match[2] });
            } else if (isVideo) {
                allMatches.push({ type: 'video', start: match.index, end: match.index + match[0].length, label: match[1], url: match[2] });
            } else {
                allMatches.push({ type: 'file', start: match.index, end: match.index + match[0].length, label: match[1], url: match[2] });
            }
        }

        allMatches.sort((a, b) => a.start - b.start);

        allMatches.forEach((item, i) => {
            if (item.start > lastIndex) {
                const textContent = content.substring(lastIndex, item.start).trim();
                if (textContent) {
                    elements.push(
                        <p key={`text-${i}`} className="text-sm leading-relaxed whitespace-pre-wrap">
                            {textContent}
                        </p>
                    );
                }
            }

            if (item.type === 'image') {
                elements.push(renderImage(item.url, item.label, i));
            } else if (item.type === 'video') {
                elements.push(renderVideo(item.url, i));
            } else {
                elements.push(renderFile(item.url, item.label, i));
            }

            lastIndex = item.end;
        });

        if (lastIndex < content.length) {
            const remainingText = content.substring(lastIndex).trim();
            if (remainingText) {
                elements.push(
                    <p key="text-last" className="text-sm leading-relaxed whitespace-pre-wrap">
                        {remainingText}
                    </p>
                );
            }
        }

        return elements.length > 0 ? elements : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        );
    };

    // === IMAGE RENDERER ===
    const renderImage = (url: string, label: string, key: number) => {
        const cidMatch = url.match(/ipfs\/([a-zA-Z0-9]+)/);
        const cid = cidMatch ? cidMatch[1] : null;

        const handleError = () => {
            if (cid && !imageError[url]) {
                setImageError(prev => ({ ...prev, [url]: true }));
            }
        };

        const imgSrc = imageError[url] && cid ? `https://cloudflare-ipfs.com/ipfs/${cid}` : url;

        return (
            <div key={`img-${key}`} className="mt-2 rounded-xl overflow-hidden">
                <img
                    src={imgSrc}
                    alt={label || 'Image'}
                    className="max-w-full max-h-[280px] w-auto h-auto object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                    onError={handleError}
                    loading="lazy"
                />
            </div>
        );
    };

    // === VIDEO RENDERER ===
    const renderVideo = (url: string, key: number) => (
        <div key={`video-${key}`} className="mt-2 rounded-xl overflow-hidden bg-black">
            <video
                src={url}
                controls
                playsInline
                className="max-w-full max-h-[280px] w-full"
            />
        </div>
    );

    // === FILE RENDERER ===
    const renderFile = (url: string, label: string, key: number) => (
        <a
            key={`file-${key}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 mt-2 p-3 rounded-xl transition-colors ${message.isMe
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-(--bg-secondary) hover:bg-(--bg-tertiary)'
                }`}
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${message.isMe ? 'bg-white/20' : 'bg-(--primary-brand)/10'
                }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={message.isMe ? 'text-white' : 'text-(--primary-brand)'}>
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{label || 'Document'}</p>
                <p className={`text-xs ${message.isMe ? 'text-white/60' : 'text-(--text-muted)'}`}>Tap to download</p>
            </div>
        </a>
    );

    return (
        <div
            className={`flex flex-col ${message.isMe ? 'items-end' : 'items-start'} group`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Reply Context */}
            {parentMessage && (
                <div className={`mb-2 max-w-[80%] px-3 py-2 rounded-xl border-l-2 bg-(--bg-secondary) border-(--primary-brand)/40`}>
                    <p className="text-xs font-medium text-(--text-muted)">
                        ↩ {parentMessage.sender.slice(0, 6)}...
                    </p>
                    <p className="text-sm text-(--text-secondary) truncate mt-0.5">
                        {truncateSnippet(parentMessage.content)}
                    </p>
                </div>
            )}

            {/* Message Row */}
            <div className={`flex items-end gap-2.5 max-w-[75%] ${message.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {showAvatar && !message.isMe && (
                    <Avatar address={message.sender} size="sm" />
                )}

                {/* Bubble Container */}
                <div className="relative">
                    {/* Hover Action Menu */}
                    {onReply && (
                        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            } ${message.isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                            <button
                                type="button"
                                onClick={() => onReply({
                                    id: message.id,
                                    sender: message.sender,
                                    snippet: getReplySnippet()
                                })}
                                className="w-7 h-7 rounded-full bg-(--bg-card) shadow-sm border border-(--border-color) flex items-center justify-center text-(--text-muted) hover:text-(--primary-brand) transition-colors"
                                title="Reply"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 17 4 12 9 7" />
                                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Message Bubble */}
                    <div
                        className={`px-4 py-2.5 transition-all ${message.isMe
                            ? 'bg-gradient-to-br from-(--primary-brand) to-(--primary-brand-dark) text-white rounded-2xl rounded-br-md shadow-md'
                            : 'bg-(--bg-secondary) text-(--text-primary) rounded-2xl rounded-bl-md'
                            }`}
                        style={{
                            minWidth: message.type === 'audio' ? '260px' : '48px',
                        }}
                    >
                        {renderContent()}
                    </div>

                    {/* Metadata Row */}
                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-(--text-muted)">
                            {formatTimestamp(message.timestamp)}
                        </span>
                        {message.isMe && (
                            <div className="flex items-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={message.onChainRead ? 'text-(--primary-brand)' : 'text-(--text-muted)'}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {message.onChainRead && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-(--primary-brand) -ml-2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default MessageBubble;
