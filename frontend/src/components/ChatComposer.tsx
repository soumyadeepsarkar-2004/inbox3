import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import FileUpload from './FileUpload';
import GiphyPicker from './GiphyPicker';
import { Spinner } from './ui';
import type { ReplyTarget } from '../types/reply';

interface AttachedFile {
    url: string;
    type: 'image' | 'file' | 'video';
    name: string;
    id: string;
}

interface ChatComposerProps {
    onSend: (content: string, attachments?: AttachedFile[]) => Promise<void>;
    onSendAudio: (audioBlob: Blob) => Promise<void>;
    replyTarget?: ReplyTarget | null;
    onCancelReply?: () => void;
    disabled?: boolean;
    placeholder?: string;
    showFileUpload?: boolean;
    showGiphy?: boolean;
}

/**
 * Unified Chat Composer Component
 * Used by both Group Chat and Direct Message (Inbox) views
 * Provides consistent input styling, recording, and attachment handling
 */
export const ChatComposer: React.FC<ChatComposerProps> = ({
    onSend,
    onSendAudio,
    replyTarget,
    onCancelReply,
    disabled = false,
    placeholder = 'Type a message...',
    showFileUpload = true,
    showGiphy = true
}) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showGiphyPicker, setShowGiphyPicker] = useState(false);
    const [selectedGif, setSelectedGif] = useState<string | null>(null);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Recording timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setRecordingTime(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        if (!navigator?.mediaDevices?.getUserMedia) {
            alert('Audio recording is not supported in this browser');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            const options = { mimeType: 'audio/webm;codecs=opus' };
            let mediaRecorder: MediaRecorder;

            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mediaRecorder = new MediaRecorder(stream, options);
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            } else {
                mediaRecorder = new MediaRecorder(stream);
            }

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                stream.getTracks().forEach(track => track.stop());

                setSending(true);
                try {
                    await onSendAudio(audioBlob);
                } catch (error) {
                    console.error('Failed to send audio:', error);
                    alert('Failed to send audio message');
                } finally {
                    setSending(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasContent = message.trim() || selectedGif || attachedFiles.length > 0;
        if (!hasContent || sending || disabled) return;

        setSending(true);
        try {
            let finalContent = message;

            if (selectedGif) {
                finalContent = finalContent ? `${finalContent}\n![GIF](${selectedGif})` : `![GIF](${selectedGif})`;
            }

            await onSend(finalContent, attachedFiles);

            // Reset state
            setMessage('');
            setSelectedGif(null);
            setAttachedFiles([]);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const removeAttachment = (id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id));
    };

    const canSend = (message.trim() || selectedGif || attachedFiles.length > 0) && !disabled && !sending && !isRecording;

    return (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4">
            {/* Reply Context */}
            {replyTarget && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Replying to {replyTarget.sender.slice(0, 8)}...
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate mt-0.5">
                            {replyTarget.snippet}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Attachments Preview */}
            {(selectedGif || attachedFiles.length > 0) && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {selectedGif && (
                        <div className="relative group">
                            <img src={selectedGif} className="h-20 w-auto rounded-lg border border-orange-500/30 shadow-sm" alt="GIF" />
                            <button
                                type="button"
                                onClick={() => setSelectedGif(null)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                    {attachedFiles.map(file => {
                        const isImg = file.type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)/i.test(file.name);
                        const isVid = file.type === 'video' || /\.(mp4|webm|ogg|mov)/i.test(file.name);
                        return (
                            <div key={file.id} className="relative group">
                                {isImg ? (
                                    <img src={file.url} className="h-20 w-auto rounded-lg border border-orange-500/30 shadow-sm object-cover" alt={file.name} />
                                ) : isVid ? (
                                    <div className="h-20 aspect-video rounded-lg bg-black/20 border border-orange-500/30 flex items-center justify-center relative overflow-hidden">
                                        <video src={file.url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-20 w-20 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                                        <span className="text-[8px] font-bold truncate w-full text-center mt-1 text-gray-500">{file.name}</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(file.id)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Giphy Picker */}
            {showGiphyPicker && (
                <div className="mb-3">
                    <GiphyPicker
                        onSelect={(url) => {
                            setSelectedGif(url);
                            setShowGiphyPicker(false);
                        }}
                        onClose={() => setShowGiphyPicker(false)}
                    />
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
                {/* Text Input Container */}
                <div className="flex-1 relative bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? '🎤 Recording audio...' : placeholder}
                        disabled={disabled || sending || isRecording}
                        rows={1}
                        className="w-full px-4 py-3 pr-24 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none text-[15px] leading-relaxed"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                    />

                    {/* Inline Actions */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <EmojiPicker onSelect={(emoji) => setMessage(prev => prev + emoji)} position="top" />
                        {showFileUpload && (
                            <FileUpload
                                disabled={disabled || sending || isRecording}
                                onFileUploaded={async (url, type, fileName) => {
                                    setAttachedFiles(prev => [...prev, {
                                        url,
                                        type: type as 'image' | 'file' | 'video',
                                        name: fileName,
                                        id: Math.random().toString(36).substr(2, 9)
                                    }]);
                                }}
                            />
                        )}
                        {showGiphy && (
                            <button
                                type="button"
                                onClick={() => setShowGiphyPicker(!showGiphyPicker)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${showGiphyPicker
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                GIF
                            </button>
                        )}
                    </div>
                </div>

                {/* Record Button */}
                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={disabled || sending}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-wide transition-all min-w-[56px] h-[48px] ${isRecording
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    {isRecording ? (
                        <>
                            <div className="w-2 h-2 bg-white rounded-full" />
                            <span className="hidden sm:inline">{formatTime(recordingTime)}</span>
                        </>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    )}
                </button>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!canSend}
                    className={`flex items-center justify-center px-5 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-wide transition-all h-[48px] ${canSend
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:scale-95'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {sending ? (
                        <Spinner size="xs" />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    )}
                </button>
            </form>

            {/* Recording Status */}
            {isRecording && (
                <div className="mt-2 flex items-center gap-2 px-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-red-500">Recording... {formatTime(recordingTime)}</span>
                    <span className="text-xs text-gray-400">Tap again to stop and send</span>
                </div>
            )}
        </div>
    );
};

export default ChatComposer;
