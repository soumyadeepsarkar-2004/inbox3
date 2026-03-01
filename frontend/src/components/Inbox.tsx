import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos, CONTRACT_ADDRESS } from '../config';
import { ListItem } from './ui/ListItem';
import { getFromPinata } from '../lib/ipfs';
import { useMetrics } from './PerformanceDashboard';
import { ChatConversation } from './ChatConversation';

interface Message {
  id: number;
  sender: string;
  cid: string;
  timestamp: number;
  read: boolean;
}

export interface ProcessedMessage {
  sender: string;
  content: string;
  timestamp: number;
  read: boolean;
  onChainRead?: boolean;
  id: string; // React component stable ID
  onChainId?: number;
  cid: string;
  type?: 'text' | 'audio';
  plain?: string;
  direction: 'sent' | 'received';
}

interface InboxProps {
  refreshKey?: number;
  onMessages?: (messages: ProcessedMessage[]) => void;
  onSelectContact?: (address: string) => void;
  filterBySender?: string;
  displayMode?: 'list' | 'conversation';
}

export default function Inbox({ refreshKey, onMessages, onSelectContact, filterBySender, displayMode = 'list' }: InboxProps) {
  const { account } = useWallet();
  const [msgs, setMsgs] = useState<ProcessedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { incrementMessagesReceived, addDataUsage } = useMetrics();

  const load = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      // 1. Fetch Received Messages
      const inboxRes = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::Inbox3::inbox_of`,
          functionArguments: [account.address.toString(), "1000", "0"],
        },
      });

      // 2. Fetch Sent Messages
      let rawSent: (Message & { direction: 'sent' })[] = [];
      try {
        const outboxRes = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::Inbox3::outbox_of`,
            functionArguments: [account.address.toString(), "1000", "0"],
          },
        });
        rawSent = (outboxRes[0] as Message[]).map(m => ({ ...m, direction: 'sent' as const }));
      } catch (e) {
        console.warn('Outbox function not found...', e);
      }

      const rawReceived = (inboxRes[0] as unknown as (Message & { id: number, read: boolean })[]).map(m => ({ ...m, direction: 'received' as const }));

      const combined = [...rawReceived, ...rawSent];

      const processed = await Promise.all(
        combined.map(async (m) => {
          try {
            const data = await getFromPinata(m.cid);
            addDataUsage(new Blob([JSON.stringify(data)]).size);

            // For sent messages, we can check if they were read by the recipient
            let onChainRead = m.read;
            if (m.direction === 'sent' && filterBySender) {
              try {
                const statusRes = await aptos.view({
                  payload: {
                    function: `${CONTRACT_ADDRESS}::Inbox3::is_cid_read`,
                    functionArguments: [filterBySender, m.cid]
                  }
                });
                onChainRead = !!statusRes[0];
              } catch (e) {
                console.warn('Could not check remote read status', e);
              }
            }

            return {
              ...m,
              id: m.cid, // Stable ID for react unique keys
              onChainId: m.id, // The actual ID from Move
              content: data.content,
              type: data.type || 'text',
              plain: data.content,
              direction: m.direction,
              onChainRead: onChainRead,
              read: m.direction === 'sent' ? true : (m.read || localStorage.getItem(`read_${m.cid}`) === 'true'),
              isExpiredMock: data.content.includes('previous session') || data.content.includes('no longer cached'),
            };
          } catch {
            return {
              ...m,
              id: m.cid,
              onChainId: m.id,
              content: 'Message temporarily unavailable (IPFS Syncing)',
              direction: m.direction,
              read: true,
              isExpiredMock: true,
            };
          }
        })
      );

      // Filter out expired mock messages for a clean inbox
      const validMessages = processed.filter(m => !m.isExpiredMock);
      const sorted = validMessages.sort((a, b) => b.timestamp - a.timestamp);

      // Update Message Received Metric
      const savedCount = localStorage.getItem('inbox3_last_received_count') || '0';
      const currentReceivedCount = rawReceived.length;
      if (currentReceivedCount > parseInt(savedCount)) {
        const diff = currentReceivedCount - parseInt(savedCount);
        for (let i = 0; i < diff; i++) incrementMessagesReceived();
        localStorage.setItem('inbox3_last_received_count', currentReceivedCount.toString());
      }

      // Filter by type (All, Unread, Sent) - implemented in render
      setMsgs(processed); // Keep processed messages for rendering
      onMessages?.(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [account, filterBySender, onMessages, addDataUsage, incrementMessagesReceived]);

  useEffect(() => {
    load();
    if (displayMode === 'conversation') {
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [load, refreshKey, displayMode]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'received' | 'sent'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter messages for Sidebar (Activity List)
  const groupedMsgs = displayMode === 'list' ? (() => {
    let filtered = msgs;

    // Apply Filter By Recipient (if any)
    if (filterBySender) {
      filtered = filtered.filter(m => m.sender === filterBySender);
    }

    // Apply Tab Filter
    if (activeFilter === 'unread') {
      filtered = filtered.filter(m => m.direction === 'received' && !m.read);
    } else if (activeFilter === 'received') {
      filtered = filtered.filter(m => m.direction === 'received');
    } else if (activeFilter === 'sent') {
      filtered = filtered.filter(m => m.direction === 'sent');
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.sender.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
      );
    }

    const groups: Record<string, ProcessedMessage> = {};
    filtered.forEach(m => {
      if (!groups[m.sender] || m.timestamp > groups[m.sender].timestamp) {
        groups[m.sender] = m;
      }
    });
    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  })() : [];

  // Messages for ChatConversation
  const conversationMsgs = useMemo(() => {
    if (displayMode !== 'conversation') return [];
    const filtered = msgs.filter(m => m.sender === filterBySender);
    return [...filtered].reverse();
  }, [msgs, filterBySender, displayMode]);


  const markAllAsRead = useCallback(() => {
    msgs.forEach(m => {
      if (m.direction === 'received' && !m.read) {
        localStorage.setItem(`read_${m.cid}`, 'true');
      }
    });
    load();
  }, [msgs, load]);

  if (displayMode === 'conversation') {
    return <ChatConversation messages={conversationMsgs} loading={loading} onRefresh={load} contactAddress={filterBySender} />;
  }


  if (loading && msgs.length === 0) {
    return (
      <div className="space-y-2 px-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-(--bg-secondary)/20 rounded-xl animate-pulse border border-(--border-color)/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="messages-container animate-fade-in flex flex-col h-full">
      {/* Header with Search and Filters */}
      <div className="px-3 mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--primary-brand) transition-colors z-10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search protocol stream..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-(--bg-secondary)/50 border border-(--border-color)/40 rounded-xl text-xs font-bold focus:bg-white dark:focus:bg-(--bg-card) focus:border-(--primary-brand)/50 focus:ring-4 focus:ring-(--primary-brand)/10 outline-none transition-all placeholder:text-(--text-muted)/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-(--text-muted) hover:text-(--text-primary) transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {!searchQuery && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-focus-within:opacity-0 transition-opacity hidden sm:block">
              <span className="text-[9px] font-black text-(--text-muted) border border-(--border-color)/40 px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-black/20">/</span>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'received', label: 'Inbox' },
            { id: 'sent', label: 'Sent' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeFilter === filter.id
                ? 'bg-(--primary-brand) text-white shadow-md shadow-indigo-500/20'
                : 'bg-(--bg-secondary)/50 text-(--text-muted) hover:text-(--text-primary)'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear unread if any */}
      {msgs.some(m => m.direction === 'received' && !m.read) && (
        <div className="px-2 mb-3">
          <button
            onClick={markAllAsRead}
            className="text-xs font-medium text-(--primary-brand) hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
        {groupedMsgs.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-(--bg-secondary) flex items-center justify-center text-(--text-muted) mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <p className="text-sm text-(--text-muted)">No messages yet</p>
            <p className="text-xs text-(--text-muted) mt-1">Start a conversation</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {groupedMsgs.map((m) => (
              <ListItem
                key={m.cid}
                avatarAddress={m.sender}
                title={`${m.sender.slice(0, 8)}...${m.sender.slice(-6)}`}
                subtitle={m.content}
                timestamp={m.timestamp * 1000}
                unreadCount={m.direction === 'received' && !m.read ? 1 : 0}
                isActive={filterBySender === m.sender}
                direction={m.direction}
                onClick={() => onSelectContact?.(m.sender)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

