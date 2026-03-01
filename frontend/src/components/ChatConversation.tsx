import React, { useEffect, useRef, useMemo } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos, CONTRACT_ADDRESS } from '../config';
import { Spinner, Avatar } from './ui';
import { MessageBubble, type MessageData, type ReplyTarget } from './MessageBubble';
import type { ProcessedMessage } from './Inbox';

interface ChatConversationProps {
    messages: ProcessedMessage[];
    loading: boolean;
    onReply?: (target: ReplyTarget) => void;
    replyTarget?: ReplyTarget | null;
    onRefresh?: () => void;
    contactAddress?: string;
}


/**
 * Chat Conversation View
 * Uses CSS variables for theme compatibility
 */
export const ChatConversation: React.FC<ChatConversationProps> = ({
    messages,
    loading,
    onReply,
    replyTarget,
    onRefresh,
    contactAddress
}) => {
    const { signAndSubmitTransaction, account } = useWallet();
    const scrollRef = useRef<HTMLDivElement>(null);
    const markReadProcessed = useRef<Set<string>>(new Set());

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Message lookup for parent references
    const messageLookup = useMemo(() => {
        const map = new Map<string | number, MessageData>();
        messages.forEach(msg => {
            map.set(msg.onChainId || msg.id, {
                id: msg.onChainId || msg.id,
                sender: msg.sender,
                content: msg.content,
                timestamp: msg.timestamp,
                isMe: msg.direction === 'sent',
                type: msg.type,
                cid: msg.cid,
                onChainRead: msg.onChainRead
            });
        });
        return map;
    }, [messages]);

    // Handle marking as read on the blockchain
    useEffect(() => {
        if (!account || messages.length === 0) return;

        const unreadToMark = messages.filter(m =>
            m.direction === 'received' &&
            !m.onChainRead &&
            m.onChainId !== undefined &&
            !markReadProcessed.current.has(`${m.onChainId}`)
        );

        if (unreadToMark.length > 0) {
            const markAsRead = async () => {
                try {
                    // Mark them locally so we don't spam requests
                    unreadToMark.forEach(m => markReadProcessed.current.add(`${m.onChainId}`));

                    // We can only mark one at a time with the current contract function
                    // In a production app, we'd batch these
                    await Promise.all(unreadToMark.map(async (m) => {
                        try {
                            const response = await signAndSubmitTransaction({
                                data: {
                                    function: `${CONTRACT_ADDRESS}::Inbox3::mark_read`,
                                    typeArguments: [],
                                    functionArguments: [m.onChainId]
                                }
                            });
                            await aptos.waitForTransaction({ transactionHash: response.hash });
                        } catch (e) {
                            console.error('Error marking message read:', e);
                        }
                    }));

                    onRefresh?.();
                } catch (error) {
                    console.error('Batch read error:', error);
                }
            };
            markAsRead();
        }
    }, [messages, account, signAndSubmitTransaction, onRefresh]);

    // Loading State
    if (loading && messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 bg-(--bg-card)">
                <Spinner size="md" />
                <p className="text-sm text-(--text-muted)">Loading messages...</p>
            </div>
        );
    }

    // Empty State
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 bg-(--bg-card)">
                <div className="w-16 h-16 rounded-2xl bg-(--bg-secondary) flex items-center justify-center border border-(--border-color)">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-(--text-muted)">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="text-base font-medium text-(--text-primary)">No messages yet</p>
                    <p className="text-sm text-(--text-muted) mt-1">Send a message to start the conversation</p>
                </div>
            </div>
        );
    }

    // Get first other party address for header
    const otherAddress = contactAddress || messages.find(m => m.direction === 'received')?.sender || messages[0]?.sender;

    return (
        <div className="flex flex-col h-full bg-(--bg-card)">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-color)">
                <div className="flex items-center gap-3">
                    <Avatar address={otherAddress || ''} size="sm" status="online" />
                    <div>
                        <h3 className="text-sm font-semibold text-(--text-primary)">
                            {otherAddress ? `${otherAddress.slice(0, 8)}...${otherAddress.slice(-6)}` : 'Chat'}
                        </h3>
                        <p className="text-xs text-(--text-muted)">@ Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4"
            >
                <div className="max-w-3xl mx-auto space-y-3">

                    {messages.map((m) => {
                        const messageData: MessageData = {
                            id: m.id,
                            sender: m.sender,
                            content: m.content,
                            timestamp: m.timestamp,
                            isMe: m.direction === 'sent',
                            type: m.type,
                            cid: m.cid
                        };

                        const parentMessage = m.plain?.includes('parentId:')
                            ? messageLookup.get(m.plain.split('parentId:')[1]?.trim())
                            : null;

                        const isHighlighted = replyTarget?.id === m.id;

                        return (
                            <div
                                key={m.id}
                                className={`w-full flex flex-col transition-all duration-300 rounded-xl ${isHighlighted
                                    ? 'bg-(--primary-brand-light) -mx-2 px-2 py-2'
                                    : ''
                                    }`}
                            >
                                <MessageBubble
                                    message={messageData}
                                    onReply={onReply}
                                    parentMessage={parentMessage}
                                    showAvatar={true}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChatConversation;

