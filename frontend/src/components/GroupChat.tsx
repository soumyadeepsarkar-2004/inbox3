import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { uploadToPinata, getFromPinata, uploadFile } from '../lib/ipfs'
import { getRealtimeService, type RealtimeMessage } from '../lib/realtime'
import { aptos } from '../config'
import type { ReplyTarget } from '../types/reply'
import { Card } from './ui'
import { useMetrics } from './PerformanceDashboard'
import { MessageBubble, type MessageData } from './MessageBubble'
import ChatComposer from './ChatComposer'

const textDecoder = new TextDecoder()

const normalizeAddress = (addr: string) => {
    if (!addr) return addr
    const clean = addr.trim().startsWith('0x') ? addr.trim().slice(2) : addr.trim()
    return '0x' + clean.padStart(64, '0')
}

const hexToUtf8 = (hex: string): string => {
    let result = ''
    for (let i = 0; i < hex.length; i += 2) {
        const byte = hex.slice(i, i + 2)
        result += String.fromCharCode(parseInt(byte, 16))
    }
    return result
}

const decodeVectorLike = (value: unknown): string => {
    if (!value) return ''
    if (typeof value === 'string') {
        if (value.startsWith('0x')) {
            return hexToUtf8(value.slice(2))
        }
        return value
    }
    if (Array.isArray(value)) {
        return textDecoder.decode(new Uint8Array(value))
    }
    if (value instanceof Uint8Array) {
        return textDecoder.decode(value)
    }
    if (value instanceof ArrayBuffer) {
        return textDecoder.decode(new Uint8Array(value))
    }
    return String(value)
}

interface GroupChatProps {
    contractAddress: string
    groupAddr: string
    onBack: () => void
}

interface GroupMessage {
    id: string
    sender: string
    content: string
    timestamp: number
    isSelf: boolean
    type?: 'text' | 'audio'
    parentId?: string | null
}

interface RawGroupMessage {
    sender: string
    cid: unknown
    timestamp: string
    parent_id?: unknown
    parentId?: unknown
}

/**
 * Group Chat Component
 * Uses CSS variables for theme compatibility
 */
export default function GroupChat({ contractAddress, groupAddr, onBack }: GroupChatProps) {
    const { account, signAndSubmitTransaction } = useWallet()
    const [messages, setMessages] = useState<GroupMessage[]>([])
    const [sending, setSending] = useState(false)
    const { incrementMessagesSent, addDataUsage } = useMetrics()
    const [groupName, setGroupName] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [copyStatus, setCopyStatus] = useState<string | null>(null)
    const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    const createMessageId = useCallback((sender: string, timestampSeconds: number, index: number) => {
        return `group-${sender}-${timestampSeconds}-${index}`
    }, [])

    const copyToClipboard = useCallback((text: string) => {
        if (!navigator?.clipboard) return
        navigator.clipboard.writeText(text)
            .then(() => setCopyStatus('Copied!'))
            .catch(() => setCopyStatus('Failed'))
        setTimeout(() => setCopyStatus(null), 2000)
    }, [])

    const fetchGroupInfo = useCallback(async () => {
        try {
            const response = await aptos.view({
                payload: {
                    function: `${contractAddress}::Inbox3::get_group_info`,
                    functionArguments: [groupAddr]
                }
            })
            setGroupName(response[0] as string)
        } catch (error) {
            console.error('Error fetching group info:', error)
        }
    }, [contractAddress, groupAddr])

    const fetchMessages = useCallback(async () => {
        if (!account) return
        try {
            const response = await aptos.view({
                payload: {
                    function: `${contractAddress}::Inbox3::get_group_messages`,
                    functionArguments: [groupAddr]
                }
            })

            const rawMessages = response[0] as RawGroupMessage[]
            const processedMessages = await Promise.all(
                rawMessages.map(async (msg, index: number) => {
                    let content = 'Loading...'
                    let type: 'text' | 'audio' = 'text'
                    let parentId: string | null = null

                    try {
                        const cidString = decodeVectorLike(msg.cid)
                        const data = await getFromPinata(cidString)
                        addDataUsage(new Blob([JSON.stringify(data)]).size)
                        content = data.content
                        type = data.type || 'text'
                        const chainParentId = decodeVectorLike(msg.parent_id ?? msg.parentId)
                        parentId = data.parentId ?? (chainParentId || null)
                    } catch (error) {
                        console.error('Error loading message content:', error)
                        content = 'Failed to load message'
                    }

                    const timestampSeconds = parseInt(msg.timestamp)
                    const messageId = createMessageId(msg.sender, timestampSeconds, index)
                    return {
                        id: messageId,
                        sender: msg.sender,
                        content,
                        timestamp: timestampSeconds * 1000,
                        isSelf: msg.sender === account.address?.toString(),
                        type,
                        parentId
                    }
                })
            )

            setMessages(processedMessages)
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }, [account, contractAddress, groupAddr, createMessageId])

    // Initial fetch and realtime subscription
    useEffect(() => {
        if (!groupAddr || !account) return

        fetchGroupInfo()
        fetchMessages()

        const realtimeService = getRealtimeService(contractAddress)
        const handleRealtimeEvent = (event: RealtimeMessage) => {
            if (event.recipient === groupAddr || event.sender === groupAddr) {
                fetchMessages()
            }
        }

        realtimeService.subscribe(account.address.toString(), handleRealtimeEvent)
        const interval = setInterval(fetchMessages, 5000)

        return () => {
            clearInterval(interval)
            realtimeService.unsubscribe(account.address.toString())
        }
    }, [groupAddr, account, contractAddress, fetchGroupInfo, fetchMessages])

    const messageLookup = useMemo(() => {
        const map = new Map<string, GroupMessage>()
        messages.forEach((msg) => map.set(msg.id, msg))
        return map
    }, [messages])

    const handleSendMessage = useCallback(async (content: string) => {
        if (!content.trim() || !account) return
        setSending(true)
        try {
            const cid = await uploadToPinata(content, account.address.toString(), 'text', replyTarget?.id)
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::send_group_message`,
                    typeArguments: [],
                    functionArguments: [normalizeAddress(groupAddr), Array.from(new TextEncoder().encode(cid))]
                }
            })
            await aptos.waitForTransaction({ transactionHash: response.hash })
            incrementMessagesSent()
            await fetchMessages()
            setTimeout(scrollToBottom, 100)
            setReplyTarget(null)
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }, [account, contractAddress, groupAddr, replyTarget, signAndSubmitTransaction, incrementMessagesSent, fetchMessages, scrollToBottom])

    const handleSendAudio = useCallback(async (audioBlob: Blob) => {
        if (!account) return
        setSending(true)
        try {
            const audioCid = await uploadFile(audioBlob)
            const audioUrl = `https://gateway.pinata.cloud/ipfs/${audioCid}`
            const metadataCid = await uploadToPinata(audioUrl, account.address.toString(), 'audio', replyTarget?.id)

            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::send_group_message`,
                    typeArguments: [],
                    functionArguments: [normalizeAddress(groupAddr), Array.from(new TextEncoder().encode(metadataCid))]
                }
            })
            await aptos.waitForTransaction({ transactionHash: response.hash })
            incrementMessagesSent()
            await fetchMessages()
            setTimeout(scrollToBottom, 100)
            setReplyTarget(null)
        } catch (error) {
            console.error('Audio send error:', error)
        } finally {
            setSending(false)
        }
    }, [account, contractAddress, groupAddr, replyTarget, signAndSubmitTransaction, incrementMessagesSent, fetchMessages, scrollToBottom])

    return (
        <Card className="relative flex flex-col h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-(--border-color) bg-(--bg-card)">
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-(--text-muted) hover:bg-(--bg-secondary) transition-colors"
                    aria-label="Go back"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-(--text-primary) text-base truncate">
                        {groupName || 'Loading...'}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-(--success-green) rounded-full" />
                        <p className="text-xs text-(--text-muted)">
                            {groupAddr.slice(0, 8)}...{groupAddr.slice(-6)}
                        </p>
                        <button
                            onClick={() => copyToClipboard(groupAddr)}
                            className="text-(--text-muted) hover:text-(--primary-brand) transition-colors"
                            title="Copy address"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Copy Toast */}
            {copyStatus && (
                <div className="absolute top-16 right-4 bg-(--bg-secondary) text-(--text-primary) text-xs px-3 py-1.5 rounded-lg shadow-lg border border-(--border-color) z-10 animate-scale-in">
                    ✓ {copyStatus}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-(--bg-main)">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
                        <div className="w-16 h-16 rounded-2xl bg-(--bg-secondary) flex items-center justify-center border border-dashed border-(--border-color)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-(--text-muted)">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-(--text-muted)">No messages in this group yet</p>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.map((msg) => {
                            const parentMessage = msg.parentId ? messageLookup.get(msg.parentId) : null

                            const messageData: MessageData = {
                                id: msg.id,
                                sender: msg.sender,
                                content: msg.content,
                                timestamp: msg.timestamp,
                                isMe: msg.isSelf,
                                type: msg.type,
                                parentId: msg.parentId
                            }

                            const parentMessageData: MessageData | null = parentMessage ? {
                                id: parentMessage.id,
                                sender: parentMessage.sender,
                                content: parentMessage.content,
                                timestamp: parentMessage.timestamp,
                                isMe: parentMessage.isSelf,
                                type: parentMessage.type
                            } : null

                            const isHighlighted = replyTarget?.id === msg.id

                            return (
                                <div
                                    key={msg.id}
                                    className={`transition-all duration-300 rounded-xl ${isHighlighted ? 'bg-(--primary-brand-light) p-2 -mx-2' : ''
                                        }`}
                                >
                                    <MessageBubble
                                        message={messageData}
                                        onReply={(target) => setReplyTarget({
                                            id: target.id as string,
                                            sender: target.sender,
                                            snippet: target.snippet
                                        })}
                                        parentMessage={parentMessageData}
                                        showAvatar={true}
                                    />
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Composer */}
            <ChatComposer
                onSend={handleSendMessage}
                onSendAudio={handleSendAudio}
                replyTarget={replyTarget}
                onCancelReply={() => setReplyTarget(null)}
                disabled={sending}
                placeholder="Type a message..."
            />
        </Card>
    )
}
