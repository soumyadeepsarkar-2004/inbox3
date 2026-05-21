import { useState, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos, CONTRACT_ADDRESS } from '../config';
import { upload, getFromPinata, type ResolvedMessageData } from './ipfs';

interface OnChainMessage {
    id: number;
    sender: string;
    cid: string;
    timestamp: number;
    read: boolean;
}
import { useMetrics } from '../components/PerformanceDashboard';

export interface ProcessedMessage {
    sender: string;
    content: string;
    timestamp: number;
    read: boolean;
    onChainRead?: boolean;
    id: string;
    onChainId?: number;
    cid: string;
    type?: 'text' | 'audio';
    plain?: string;
    direction: 'sent' | 'received';
}

export function useInbox() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [messages, setMessages] = useState<ProcessedMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const { incrementMessagesSent, addDataUsage } = useMetrics();

    const loadMessages = useCallback(async () => {
        if (!account) return;
        setLoading(true);
        try {
            const [inboxRes, outboxRes] = await Promise.all([
                aptos.view({
                    payload: {
                        function: `${CONTRACT_ADDRESS}::Inbox3::inbox_of`,
                        functionArguments: [account.address.toString(), "1000", "0"],
                    },
                }),
                aptos.view({
                    payload: {
                        function: `${CONTRACT_ADDRESS}::Inbox3::outbox_of`,
                        functionArguments: [account.address.toString(), "1000", "0"],
                    },
                }).catch(() => [[]])
            ]);

            const rawReceived = (inboxRes[0] as OnChainMessage[]).map(m => ({ ...m, direction: 'received' as const }));
            const rawSent = (outboxRes[0] as OnChainMessage[]).map(m => ({ ...m, direction: 'sent' as const }));
            const combined = [...rawReceived, ...rawSent];

            const processed = await Promise.all(
                combined.map(async (m) => {
                    const cached = localStorage.getItem(`ipfs-${m.cid}`);
                    let data: ResolvedMessageData;
                    if (cached) {
                        try { data = JSON.parse(cached); } catch { data = { content: cached }; }
                    } else {
                        data = await getFromPinata(m.cid);
                        addDataUsage(new Blob([JSON.stringify(data)]).size);
                    }

                    return {
                        ...m,
                        id: m.cid,
                        onChainId: m.id,
                        content: data.content,
                        type: ('type' in data && data.type) || 'text',
                        direction: m.direction,
                        read: m.direction === 'sent' ? true : (m.read || localStorage.getItem(`read_${m.cid}`) === 'true'),
                    };
                })
            );

            setMessages(processed.sort((a, b) => b.timestamp - a.timestamp));
        } catch (e) {
            console.error('Failed to load messages:', e);
        } finally {
            setLoading(false);
        }
    }, [account, addDataUsage]);

    const sendMessage = useCallback(async (recipient: string, content: string) => {
        if (!account) return;

        const messageData = {
            sender: account.address.toString(),
            content,
            timestamp: Date.now(),
            type: 'text'
        };

        const cid = await upload(JSON.stringify(messageData));
        const response = await signAndSubmitTransaction({
            data: {
                function: `${CONTRACT_ADDRESS}::Inbox3::send_message`,
                typeArguments: [],
                functionArguments: [recipient, Array.from(new TextEncoder().encode(cid))]
            }
        });

        incrementMessagesSent();
        // Background wait
        aptos.waitForTransaction({ transactionHash: response.hash });
        return response;
    }, [account, signAndSubmitTransaction, incrementMessagesSent]);

    return { messages, loading, loadMessages, sendMessage };
}
