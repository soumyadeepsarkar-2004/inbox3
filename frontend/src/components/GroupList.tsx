import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { aptos } from '../config'
import { ListItem } from './ui/ListItem'

interface GroupListProps {
    contractAddress: string
    onSelectGroup: (groupAddr: string) => void
    onCreateGroup: () => void
    onJoinGroup: () => void
    refreshTrigger?: number
    compact?: boolean
}

export default function GroupList({ contractAddress, onSelectGroup, onCreateGroup, onJoinGroup, refreshTrigger, compact = false }: GroupListProps) {
    const { account } = useWallet()
    const [groups, setGroups] = useState<{ addr: string, name: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('');
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

    useEffect(() => {
        if (account) {
            fetchGroups()
        }
    }, [account, refreshTrigger])

    const fetchGroups = async () => {
        if (!account) return
        setLoading(true)
        try {
            // 1. Get list of group addresses for user
            const response = await aptos.view({
                payload: {
                    function: `${contractAddress}::Inbox3::get_user_groups`,
                    functionArguments: [account.address.toString()]
                }
            })

            if (!response || !Array.isArray(response) || response.length === 0) {
                setGroups([])
                return
            }

            const groupAddrs = response[0] as string[]

            // 2. Fetch details for each group
            const groupDetails = await Promise.all(groupAddrs.map(async (addr) => {
                try {
                    const details = await aptos.view({
                        payload: {
                            function: `${contractAddress}::Inbox3::get_group_info`,
                            functionArguments: [addr]
                        }
                    })

                    if (!details || !Array.isArray(details) || details.length === 0) {
                        return null
                    }

                    return {
                        addr,
                        name: details[0] as string
                    }
                } catch (e) {
                    console.error(`Failed to fetch info for group ${addr}`, e)
                    return null
                }
            }))

            setGroups(groupDetails.filter(g => g !== null) as { addr: string, name: string }[])
        } catch (error) {
            console.error('Error fetching groups:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            {!compact && (
                <div className="flex items-center justify-between mb-6 px-1">
                    <div>
                        <h3 className="text-xl font-black text-(--text-primary) tracking-tight uppercase">Squads</h3>
                        <p className="text-[9px] text-(--text-muted) font-black tracking-[0.2em] uppercase">Private collectives</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onJoinGroup}
                            className="px-3 py-1.5 rounded-lg border border-(--border-color) text-[10px] font-black uppercase tracking-widest text-(--text-secondary) hover:border-(--primary-brand) hover:text-(--primary-brand) transition-all"
                        >
                            Join
                        </button>
                        <button
                            onClick={onCreateGroup}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                        >
                            + New
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                </div>
            ) : (() => {
                const filteredGroups = groups.filter(g =>
                    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    g.addr.toLowerCase().includes(searchQuery.toLowerCase())
                );

                return (
                    <>
                        {/* Premium Search Bar */}
                        <div className="mb-6 relative group px-2">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-purple-500 transition-colors z-10">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search squads by name or hash..."
                                className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-(--bg-secondary)/40 border border-(--border-color)/40 rounded-2xl text-xs font-bold focus:bg-white dark:focus:bg-(--bg-card) focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-(--text-muted)/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-(--text-muted) hover:text-(--text-primary) transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                            {!searchQuery && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-focus-within:opacity-0 transition-opacity hidden sm:block">
                                    <span className="text-[9px] font-black text-(--text-muted) border border-(--border-color)/40 px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-black/20">/</span>
                                </div>
                            )}
                        </div>

                        {filteredGroups.length === 0 ? (
                            <div className="text-center py-12 px-6 bg-(--bg-secondary)/10 rounded-[2rem] border-2 border-dashed border-(--border-color)">
                                <div className="w-12 h-12 rounded-2xl bg-(--bg-secondary) flex items-center justify-center mx-auto mb-4 opacity-50">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-(--text-muted)">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                    </svg>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--text-muted) mb-4">
                                    {searchQuery ? 'No matching squads found' : 'No squads detected in registry'}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar px-1">
                                {filteredGroups.map((group) => (
                                    <div key={group.addr} className="animate-scale-in">
                                        <ListItem
                                            avatarAddress={group.addr}
                                            title={group.name}
                                            subtitle={group.addr}
                                            onClick={() => onSelectGroup(group.addr)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                );
            })()}
        </div>
    )
}
