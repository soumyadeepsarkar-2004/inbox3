import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

// Layout Components
import { AppShell, TopNav } from './components/layout'

// Feature Components
import SendMessage from './components/SendMessage'
import Inbox, { type ProcessedMessage } from './components/Inbox'
import ContactsList from './components/ContactsList'
import NotificationSystem from './components/NotificationSystem'
import GroupList from './components/GroupList'
import GroupChat from './components/GroupChat'
import CreateGroupModal from './components/CreateGroupModal'
import JoinGroupModal from './components/JoinGroupModal'
import WalletModal from './components/WalletModal'
import SettingsPanel from './components/SettingsPanel'
import QRCodeModal from './components/QRCodeModal'
import ConnectionStatus from './components/ConnectionStatus'

import { useKeyboardShortcuts, ShortcutsModal, DEFAULT_SHORTCUTS } from './components/KeyboardShortcuts'
import ExportChat from './components/ExportChat'
import { useDrafts, DraftsModal } from './components/DraftManager'
import ComponentShowcase from './components/ComponentShowcase'
import PerformanceDashboard from './components/PerformanceDashboard'
import ProfileEditor from './components/ProfileEditor'
import { CallInterface, IncomingCallModal } from './components/CallInterface'
import { profileManager, type UserProfile } from './lib/profileManager'
import { getRealtimeService, type RealtimeMessage } from './lib/realtime'
import { getWebRTCService, type CallSignal, type CallType } from './lib/webrtc'
import { getSignalingService } from './lib/signaling'
import { useNotifications } from './lib/notifications'
import { aptos, CONTRACT_ADDRESS, NETWORK } from './config'
import { Button, Card, SkipLink, Avatar, Modal } from './components/ui'
import './App.css'

type AppView = 'dm' | 'groups' | 'showcase'

function App() {
    const { account, connected, connect, disconnect, wallets, signAndSubmitTransaction, network } = useWallet()
    const [hasInbox, setHasInbox] = useState(false)
    const [loading, setLoading] = useState(false)
    const [networkError, setNetworkError] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [lastMessageSent, setLastMessageSent] = useState(0)
    const [realtimeEnabled] = useState(true)
    const { notifications, addNotification, dismissNotification } = useNotifications()

    // Group Chat State
    const [currentView, setCurrentView] = useState<AppView>('dm')
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
    const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false)
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
    const [walletModalMode, setWalletModalMode] = useState<'wallet' | 'social'>('wallet')
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
        return false
    })
    const [groupsRefreshKey, setGroupsRefreshKey] = useState(0)
    const [loadedMessages, setLoadedMessages] = useState<ProcessedMessage[]>([])
    const [selectedRecipient, setSelectedRecipient] = useState('')

    // Modal & Drawer States
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)
    const [isDraftsOpen, setIsDraftsOpen] = useState(false)
    const [isContactsOpen, setIsContactsOpen] = useState(false)
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
    const [isExportOpen, setIsExportOpen] = useState(false)
    const [isPerformanceOpen, setIsPerformanceOpen] = useState(false)
    const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    // Calling State
    const [isCallActive, setIsCallActive] = useState(false)
    const [activeCallType, setActiveCallType] = useState<CallType>('voice')
    const [callRecipient, setCallRecipient] = useState('')
    const [incomingCall, setIncomingCall] = useState<CallSignal | null>(null)
    const [isIncomingCallOpen, setIsIncomingCallOpen] = useState(false)

    // Real-time network latency (measured against Aptos RPC)
    const [networkLatencyMs, setNetworkLatencyMs] = useState<number | null>(null)
    const [latencyStatus, setLatencyStatus] = useState<'measuring' | 'good' | 'ok' | 'slow'>('measuring')

    // Hooks
    const { removeDraft, getAllDrafts } = useDrafts()
    const drafts = getAllDrafts()

    // Refresh callback
    const refreshInbox = useCallback(() => {
        console.log('Triggering inbox refresh')
        setRefreshKey(prev => prev + 1)
    }, [])

    // Keyboard shortcuts
    const shortcuts = useMemo(() => [
        ...DEFAULT_SHORTCUTS.map(s => ({
            ...s,
            action: () => {
                switch (s.key) {
                    case 's':
                        setIsSettingsOpen(true)
                        break
                    case 'g':
                        setCurrentView('groups')
                        break
                    case 'd':
                        setCurrentView('dm')
                        break
                    case '?':
                        setIsShortcutsOpen(true)
                        break
                    case 'r':
                        refreshInbox()
                        break
                    case 'Escape':
                        setIsSettingsOpen(false)
                        setIsQRModalOpen(false)
                        setIsShortcutsOpen(false)
                        setIsExportOpen(false)
                        setIsDraftsOpen(false)
                        break
                }
            }
        }))
    ], [refreshInbox])

    useKeyboardShortcuts(shortcuts, connected)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
        localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    }, [darkMode])

    const toggleDarkMode = () => setDarkMode(!darkMode)

    const handleRealtimeEvent = useCallback((event: RealtimeMessage) => {
        console.log('Real-time event received:', event)

        if (event.type === 'message_received') {
            addNotification({
                type: 'info',
                message: `Message received from ${event.sender.slice(0, 6)}...${event.sender.slice(-4)}`,
                duration: 5000
            })
        } else if (event.type === 'message_sent') {
            addNotification({
                type: 'success',
                message: `Message sent to ${event.recipient.slice(0, 6)}...${event.recipient.slice(-4)}`,
                duration: 3000
            })
        }

        refreshInbox()
    }, [refreshInbox, addNotification])

    const handleMessageSent = useCallback(() => {
        refreshInbox()
        setLastMessageSent(Date.now())
    }, [refreshInbox])

    const handleMessageSentAndReset = useCallback(() => {
        handleMessageSent()
        setSelectedRecipient('')
    }, [handleMessageSent])

    const handleSelectContact = useCallback((address: string) => {
        setSelectedRecipient(address)
        setCurrentView('dm')
        setIsContactsOpen(false)
    }, [])

    useEffect(() => {
        const checkNetwork = async () => {
            if (connected && network) {
                const currentNetwork = network.name.toLowerCase()
                const requiredNetwork = NETWORK.toLowerCase()

                if (currentNetwork !== requiredNetwork) {
                    setNetworkError(`Wrong Network! You are on ${network.name}. Please switch to ${NETWORK}.`)
                } else {
                    setNetworkError(null)
                }
            }
        }
        checkNetwork()
    }, [connected, network])

    const checkInboxExists = useCallback(async () => {
        if (!account) return
        try {
            const response = await aptos.view({
                payload: {
                    function: `${CONTRACT_ADDRESS}::Inbox3::inbox_exists`,
                    functionArguments: [account.address.toString()]
                }
            })

            if (response && Array.isArray(response) && response.length > 0) {
                setHasInbox(response[0] as boolean)
            } else {
                setHasInbox(false)
            }
        } catch (error) {
            console.error('Error checking inbox:', error)
            setHasInbox(false)
        }
    }, [account])

    const fetchUserProfile = useCallback(() => {
        if (account?.address) {
            const profile = profileManager.getProfile(account.address.toString())
            setUserProfile(profile)
        }
    }, [account])

    useEffect(() => {
        if (connected && account) {
            checkInboxExists()
            fetchUserProfile()
        }
    }, [connected, account, checkInboxExists, fetchUserProfile])

    useEffect(() => {
        if (connected && account && realtimeEnabled) {
            const realtimeService = getRealtimeService(CONTRACT_ADDRESS)
            realtimeService.subscribe(account.address.toString(), handleRealtimeEvent)

            return () => {
                realtimeService.unsubscribe(account.address.toString())
            }
        }
    }, [connected, account, realtimeEnabled, handleRealtimeEvent])

    // Connect signaling service when wallet connects
    useEffect(() => {
        if (connected && account) {
            const signaling = getSignalingService()
            signaling.connect(account.address.toString())
            // Wire incoming signals to WebRTC handler
            const webrtc = getWebRTCService()
            webrtc.setLocalAddress(account.address.toString())
            webrtc.setCallbacks(
                (session) => {
                    if (session.state === 'ended' || session.state === 'failed') {
                        setIsCallActive(false)
                        setCallRecipient('')
                    }
                },
                () => { } // remote stream handled in CallInterface
            )
        }
    }, [connected, account])

    // Measure real network latency to Aptos RPC
    useEffect(() => {
        if (!connected) return
        const measureLatency = async () => {
            try {
                const start = performance.now()
                await aptos.view({
                    payload: {
                        function: `0x1::chain_id::get`,
                        functionArguments: []
                    }
                })
                const ms = Math.round(performance.now() - start)
                setNetworkLatencyMs(ms)
                setLatencyStatus(ms < 200 ? 'good' : ms < 600 ? 'ok' : 'slow')
            } catch {
                // ignore measurement failures
            }
        }
        measureLatency()
        const interval = setInterval(measureLatency, 30000)
        return () => clearInterval(interval)
    }, [connected])

    useEffect(() => {
        if (connected && account) {
            const recentMessageSent = Date.now() - lastMessageSent < 120000 // 2 mins
            const refreshInterval = recentMessageSent ? 5000 : 30000 // 5s if active, 30s otherwise

            const interval = setInterval(() => {
                refreshInbox()
                checkInboxExists()
            }, refreshInterval)

            return () => clearInterval(interval)
        }
    }, [connected, account, refreshInbox, checkInboxExists, lastMessageSent])

    const createInbox = async () => {
        if (!account) return
        setLoading(true)
        try {
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${CONTRACT_ADDRESS}::Inbox3::create_inbox`,
                    typeArguments: [],
                    functionArguments: []
                }
            })

            await aptos.waitForTransaction({ transactionHash: response.hash })
            setHasInbox(true)
            addNotification({ type: 'success', message: 'Inbox created successfully!' })
        } catch (error) {
            console.error('Error creating inbox:', error)
            addNotification({ type: 'error', message: 'Failed to create inbox' })
        } finally {
            setLoading(false)
        }
    }

    // ===== CALLING FUNCTIONS =====
    const startVoiceCall = (recipient: string) => {
        if (!recipient || recipient.trim().length < 5) {
            addNotification({ type: 'error', message: 'Please select a valid recipient to call' });
            return;
        }
        setCallRecipient(recipient);
        setActiveCallType('voice');
        setIsCallActive(true);
        addNotification({ type: 'info', message: `Starting voice call to ${recipient.slice(0, 8)}...` });
    };

    const startVideoCall = (recipient: string) => {
        if (!recipient || recipient.trim().length < 5) {
            addNotification({ type: 'error', message: 'Please select a valid recipient to call' });
            return;
        }
        setCallRecipient(recipient);
        setActiveCallType('video');
        setIsCallActive(true);
        addNotification({ type: 'info', message: `Starting video call to ${recipient.slice(0, 8)}...` });
    };

    const handleAcceptCall = () => {
        setIsIncomingCallOpen(false);
        if (incomingCall) {
            setCallRecipient(incomingCall.from);
            setActiveCallType(incomingCall.callType);
            setIsCallActive(true);
        }
    };

    const handleRejectCall = () => {
        if (incomingCall) {
            const webrtc = getWebRTCService();
            webrtc.rejectCall(incomingCall);
        }
        setIsIncomingCallOpen(false);
        setIncomingCall(null);
    };

    const handleEndCall = () => {
        setIsCallActive(false);
        setCallRecipient('');
    };

    // ===== NAVIGATION & CONTEXT (SIDEBAR - 25%) =====
    const sidebarContent = (
        <div className="flex flex-col h-full overflow-hidden bg-(--bg-card)">
            {/* Dashboard Stats (Live) */}
            <div className="px-4 py-4 grid grid-cols-2 gap-3 border-b border-(--border-color)/50">
                <div className="bg-(--bg-secondary)/50 p-3 rounded-2xl border border-(--border-color)/30 group hover:border-(--primary-brand)/30 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 -mr-2 -mt-2 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <span className="text-[9px] font-black uppercase text-(--text-muted) tracking-widest block mb-1">Messages</span>
                    <span className="text-xl font-black text-(--text-primary) tracking-tighter">
                        {loadedMessages.length}
                    </span>
                </div>
                <div className="bg-(--bg-secondary)/50 p-3 rounded-2xl border border-(--border-color)/30 group hover:border-green-500/30 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 -mr-2 -mt-2 bg-green-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <span className="text-[9px] font-black uppercase text-(--text-muted) tracking-widest block mb-1">Network</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-green-600 uppercase">Active</span>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="p-4">
                <div className="flex p-1.5 bg-(--bg-secondary) rounded-2xl border border-(--border-color)/40">
                    <button
                        onClick={() => setCurrentView('dm')}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === 'dm'
                            ? 'bg-white dark:bg-(--bg-card) text-(--primary-brand) shadow-xl shadow-indigo-500/5 border border-indigo-500/10'
                            : 'text-(--text-muted) hover:text-(--text-primary)'}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Messages
                    </button>
                    <button
                        onClick={() => setCurrentView('groups')}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === 'groups'
                            ? 'bg-white dark:bg-(--bg-card) text-(--primary-brand) shadow-xl shadow-indigo-500/5 border border-indigo-500/10'
                            : 'text-(--text-muted) hover:text-(--text-primary)'}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                        Groups
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                {currentView === 'dm' ? (
                    <Inbox
                        refreshKey={refreshKey}
                        onMessages={setLoadedMessages}
                        onSelectContact={handleSelectContact}
                    />
                ) : (
                    <GroupList
                        contractAddress={CONTRACT_ADDRESS}
                        onSelectGroup={setSelectedGroup}
                        onCreateGroup={() => setIsCreateGroupModalOpen(true)}
                        onJoinGroup={() => setIsJoinGroupModalOpen(true)}
                        refreshTrigger={groupsRefreshKey}
                        compact={true}
                    />
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-(--border-color) flex flex-col gap-2">
                <button
                    onClick={() => setIsPerformanceOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-(--bg-secondary) text-(--text-secondary) hover:text-(--primary-brand) hover:bg-(--primary-brand-light) transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                    Performance Metrics
                </button>
                <ConnectionStatus compact={false} />
            </div>
        </div>
    )


    // ===== PROFILE & UTILITIES (RIGHT PANE - 25%) =====
    const rightPaneContent = (
        <div className="flex flex-col h-full bg-[#FBF8F3] dark:bg-(--bg-main) p-6 gap-8 overflow-y-auto custom-scrollbar">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-(--text-primary)">Profile</h2>
                <div className="relative group">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                        </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-(--bg-card) border border-(--border-color) rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                        <button
                            onClick={() => setIsProfileEditorOpen(true)}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-(--text-primary) hover:bg-(--bg-secondary) flex items-center gap-3"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Profile
                        </button>
                        <button
                            onClick={disconnect}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-(--bg-card) rounded-3xl p-6 text-center shadow-sm border border-(--border-color)/50">
                <div className="flex justify-center mb-6">
                    <Avatar
                        address={account?.address?.toString() || ''}
                        src={userProfile?.avatar ? `https://gateway.pinata.cloud/ipfs/${userProfile.avatar}` : undefined}
                        size="xl"
                        status="online"
                        showStatus={true}
                    />
                </div>
                <h3 className="text-xl font-bold text-(--text-primary) tracking-tight">
                    {account?.address?.toString().slice(0, 8)}...{account?.address?.toString().slice(-6)}
                </h3>
                <p className="text-md font-medium text-[#A78BFA] mt-1">
                    @{userProfile?.username || 'inbox3user'}
                </p>

                {/* Profile Action Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => startVoiceCall(selectedRecipient || '')}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${selectedRecipient && selectedRecipient.trim().length > 5
                            ? 'bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white border-green-200 dark:border-green-500/30 shadow-lg shadow-green-500/10'
                            : 'bg-gray-50 dark:bg-(--bg-secondary) text-(--text-muted) border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-100'
                            }`}
                        title={selectedRecipient ? 'Start Voice Call' : 'Select a contact first'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => startVideoCall(selectedRecipient || '')}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${selectedRecipient && selectedRecipient.trim().length > 5
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white border-indigo-200 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                            : 'bg-gray-50 dark:bg-(--bg-secondary) text-(--text-muted) border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-100'
                            }`}
                        title={selectedRecipient ? 'Start Video Call' : 'Select a contact first'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setSelectedRecipient(' ')}
                        className="w-12 h-12 rounded-full bg-gray-50 dark:bg-(--bg-secondary) text-(--text-muted) flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsExportOpen(true)}
                        className="w-12 h-12 rounded-full bg-gray-50 dark:bg-(--bg-secondary) text-(--text-muted) flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h3 className="text-[11px] font-black text-(--text-muted) uppercase tracking-[0.2em] px-1">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsContactsOpen(true)}
                        className="p-5 bg-white dark:bg-(--bg-card) border border-(--border-color)/50 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all w-full"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-(--bg-secondary) text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        </div>
                        <span className="text-xs font-bold text-(--text-primary)">Contacts</span>
                    </button>

                    <button
                        onClick={() => setIsQRModalOpen(true)}
                        className="p-5 bg-white dark:bg-(--bg-card) border border-(--border-color)/50 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all w-full"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-(--bg-secondary) text-(--text-muted) flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /></svg>
                        </div>
                        <span className="text-xs font-bold text-(--text-primary)">QR Code</span>
                    </button>
                </div>
            </div>

            {/* Settings Button (Bottom) */}
            <div className="mt-auto pt-4">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full py-3 bg-white dark:bg-(--bg-card) border border-(--border-color)/50 rounded-xl text-sm font-semibold text-(--text-primary) hover:border-indigo-500/50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2.5 shadow-sm"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                </button>
            </div>

            {/* Network Vitals */}
            <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Protocol Status</h4>
                            <p className="text-sm font-bold tracking-tight uppercase">{NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase opacity-60">Latency</span>
                            <span className={`text-xs font-black ${latencyStatus === 'good' ? 'text-green-300' :
                                latencyStatus === 'ok' ? 'text-yellow-300' :
                                    latencyStatus === 'slow' ? 'text-red-300' : 'text-white/60'
                                }`}>
                                {networkLatencyMs !== null ? `${networkLatencyMs} ms` : '—'}
                            </span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-700 ${latencyStatus === 'good' ? 'bg-green-400 w-[90%]' :
                                    latencyStatus === 'ok' ? 'bg-yellow-400 w-[60%]' :
                                        latencyStatus === 'slow' ? 'bg-red-400 w-[30%]' : 'bg-white/20 w-[10%] animate-pulse'
                                    }`}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase opacity-60">Status</span>
                            <span className="text-xs font-black italic uppercase">
                                {latencyStatus === 'measuring' ? 'Pinging...' :
                                    latencyStatus === 'good' ? 'Optimal' :
                                        latencyStatus === 'ok' ? 'Moderate' : 'High Latency'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )


    const topNavContent = (
        <TopNav
            logo={
                <div className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 bg-(--primary-brand)/20 blur-lg rounded-full group-hover:bg-(--primary-brand)/30 transition-all" />
                        <img src="/favicon.png" alt="Inbox3" className="w-9 h-9 rounded-xl shadow-md relative z-10 border border-white/10" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-(--text-primary)">
                        Inbox<span className="text-(--primary-brand)">3</span>
                    </span>
                </div>
            }

            right={
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsShortcutsOpen(true)}
                        className="p-2.5 rounded-xl text-(--text-muted) hover:bg-(--bg-secondary) hover:text-(--primary-brand) transition-all group"
                        title="Keyboard Shortcuts (Ctrl+K)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-12 transition-transform">
                            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" />
                            <path d="M3 18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3z" />
                        </svg>
                    </button>

                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 rounded-xl bg-(--bg-card) border border-(--border-color) text-(--text-primary) hover:border-(--primary-brand) transition-all shadow-sm group active:scale-95"
                    >
                        {darkMode ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-45 transition-transform"><circle cx="12" cy="12" r="5" /><path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" /></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-rotate-12 transition-transform"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>

                    <button
                        onClick={disconnect}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Disconnect
                    </button>
                </div>
            }
        />
    )

    // ===== MAIN RENDER LOGIC =====
    if (!connected) {
        const filteredWallets = wallets.filter(w => {
            const isSocial = w.name.toLowerCase().includes('google') ||
                w.name.toLowerCase().includes('apple') ||
                w.name.toLowerCase().includes('keyless') ||
                w.name.toLowerCase().includes('continue')
            return walletModalMode === 'social' ? isSocial : !isSocial
        })

        return (
            <div className="hero-container bg-(--bg-main)">
                <WalletModal
                    isOpen={isWalletModalOpen}
                    onClose={() => setIsWalletModalOpen(false)}
                    wallets={filteredWallets}
                    onConnect={connect}
                    title={walletModalMode === 'social' ? 'Sign in with Social' : 'Connect Wallet'}
                />

                <div className="absolute top-6 right-6 z-60">
                    <button onClick={toggleDarkMode} className="p-3 rounded-full bento-card text-(--text-primary)">
                        {darkMode ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><path d="M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" /></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                </div>

                <div className="hero-left flex items-center justify-center p-6">
                    <div className="w-full max-w-sm text-center">
                        <div className="mb-12">
                            <img src="/logo.png" alt="Inbox3" className="w-24 mx-auto mb-8 shadow-sm rounded-2xl" />
                            <h1 className="text-4xl font-extrabold text-(--text-primary) tracking-tight mb-3">Inbox3</h1>
                            <p className="text-(--text-muted) text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                                Your decentralized home for secure communication.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => { setWalletModalMode('wallet'); setIsWalletModalOpen(true); }}
                                className="w-full py-4! rounded-2xl! font-bold bg-[#FF6B35]! text-white! shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                            >
                                Connect Wallet
                            </Button>
                            <Button
                                onClick={() => { setWalletModalMode('social'); setIsWalletModalOpen(true); }}
                                variant="outline"
                                className="w-full py-4! rounded-2xl! font-bold border-gray-200! dark:border-white/10! text-(--text-primary)! hover:bg-gray-50! dark:hover:bg-white/5! transition-all"
                            >
                                Social Sign-in
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="hero-right bg-(--bg-secondary)/30 backdrop-blur-xl border-l border-(--border-color)/50 flex items-center justify-center p-12">
                    <div className="max-w-lg text-center">
                        <h2 className="text-5xl font-black text-(--text-primary) tracking-tighter mb-6 leading-tight">
                            Private. Secure.<br />
                            <span className="bg-linear-to-r from-(--primary-brand) to-purple-500 bg-clip-text text-transparent font-black">Decentralized.</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bento-card text-left space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
                                <h3 className="font-bold text-(--text-primary)">E2E Encrypted</h3>
                                <p className="text-xs text-(--text-secondary) leading-relaxed">Your data belongs to you. Only the recipient can decrypt messages.</p>
                            </div>
                            <div className="p-6 bento-card text-left space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg></div>
                                <h3 className="font-bold text-(--text-primary)">Blockchain Powered</h3>
                                <p className="text-xs text-(--text-secondary) leading-relaxed">Built on Aptos for high speed and decentralized verification.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-(--bg-main)">
                <div className="w-20 h-20 border-4 border-(--primary-brand) border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-2xl font-black text-(--text-primary) animate-pulse">Initializing Workspace...</h2>
            </div>
        )
    }

    if (!hasInbox) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-24">
                <Card className="p-12 text-center bento-card space-y-8">
                    <div className="w-24 h-24 bg-(--primary-brand-light) rounded-3xl flex items-center justify-center mx-auto text-(--primary-brand)"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
                    <h1 className="text-4xl font-black tracking-tighter">Setup Required</h1>
                    <p className="text-lg text-(--text-secondary)">Your account does not have a decentralized inbox yet. Initializing one will allow you to participate in private messaging.</p>
                    <Button onClick={createInbox} loading={loading} className="w-full py-5! text-xl font-bold rounded-2xl! shadow-xl shadow-(--primary-brand)/20">Initialize My Inbox</Button>
                </Card>
            </div>
        )
    }

    return (
        <>
            <SkipLink targetId="main-content" />
            <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />

            {networkError && (
                <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-xs font-bold z-100 animate-slide-down">
                    {networkError}
                </div>
            )}

            <AppShell
                topNav={topNavContent}
                sidebar={sidebarContent}
                rightPane={rightPaneContent}
            >
                <div className="flex-1 flex flex-col min-h-0">
                    <main className="flex-1 flex flex-col min-h-0" id="main-content">
                        {currentView === 'dm' && (
                            <div className="h-full flex flex-col overflow-hidden">
                                {selectedRecipient && selectedRecipient.trim().length > 5 ? (
                                    <div className="flex-1 flex flex-col min-h-0 bg-(--bg-main)/30">
                                        <div className="px-5 py-3 border-b border-(--border-color)/30 bg-(--bg-card)/40 backdrop-blur-md flex justify-between items-center transition-all shrink-0">
                                            <div className="flex items-center gap-3">
                                                <Avatar address={selectedRecipient} size="sm" status="online" />
                                                <div className="min-w-0">
                                                    <h3 className="text-xs font-black text-(--text-primary) uppercase tracking-wide">
                                                        {selectedRecipient.slice(0, 10)}...{selectedRecipient.slice(-8)}
                                                    </h3>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedRecipient('')}
                                                className="p-1.5 rounded-lg hover:bg-black/5 hover:dark:bg-white/5 text-(--text-muted) hover:text-orange-500 transition-all active:scale-90"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-hidden flex flex-col">
                                            <Inbox
                                                refreshKey={refreshKey}
                                                filterBySender={selectedRecipient}
                                                displayMode="conversation"
                                                onMessages={setLoadedMessages}
                                            />
                                        </div>

                                        <div className="bg-(--bg-card)/30 backdrop-blur-md">
                                            <SendMessage
                                                contractAddress={CONTRACT_ADDRESS}
                                                onMessageSent={handleMessageSentAndReset}
                                                onClose={() => setSelectedRecipient('')}
                                                initialRecipient={selectedRecipient}
                                            />
                                        </div>
                                    </div>
                                ) : selectedRecipient === ' ' ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-(--bg-main)/50">
                                        <div className="w-full max-w-2xl">
                                            <SendMessage
                                                contractAddress={CONTRACT_ADDRESS}
                                                onMessageSent={handleMessageSentAndReset}
                                                onClose={() => setSelectedRecipient('')}
                                                initialRecipient=""
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center p-8">
                                        <div className="text-center max-w-sm w-full">
                                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-2xl font-bold text-(--text-primary) mb-2 tracking-tight">No conversation selected</h2>
                                            <p className="text-sm text-(--text-muted) mb-6">Choose a contact from the sidebar or start a new message</p>
                                            <Button
                                                onClick={() => setSelectedRecipient(' ')}
                                                className="rounded-xl! px-6! py-2.5! bg-(--primary-brand)! text-white! font-semibold text-sm!"
                                            >
                                                New Message
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentView === 'groups' && (
                            <div className="h-full flex flex-col overflow-hidden">
                                {selectedGroup ? (
                                    <GroupChat groupAddr={selectedGroup} contractAddress={CONTRACT_ADDRESS} onBack={() => setSelectedGroup(null)} />
                                ) : (
                                    <div className="h-full flex items-center justify-center p-8 bg-(--bg-main)">
                                        <div className="text-center max-w-lg w-full">
                                            {/* Modern Icon Container */}
                                            <div className="relative inline-block mb-8">
                                                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                                                <div className="relative w-24 h-24 rounded-4xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/10 border border-white/10">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                        <circle cx="9" cy="7" r="4" />
                                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <h2 className="text-3xl font-bold text-(--text-primary) mb-3 tracking-tight">
                                                Decentralized Groups
                                            </h2>
                                            <p className="text-(--text-secondary) mb-8 text-base font-normal max-w-sm mx-auto leading-relaxed">
                                                Secure, community-owned communication spaces powered by blockchain technology.
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                                                <button
                                                    onClick={() => setIsJoinGroupModalOpen(true)}
                                                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) font-black text-[10px] uppercase tracking-[0.2em] hover:border-(--primary-brand) hover:bg-(--bg-card) transition-all shadow-sm"
                                                >
                                                    Join Group
                                                </button>
                                                <button
                                                    onClick={() => setIsCreateGroupModalOpen(true)}
                                                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all"
                                                >
                                                    + Create New
                                                </button>
                                            </div>

                                            <div className="mt-16 pt-8 border-t border-(--border-color)/50">
                                                <div className="flex items-center justify-center gap-6 opacity-60">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-(--text-muted) animate-pulse">Aptos Protocol Secured</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentView === 'showcase' && (
                            <div className="h-full overflow-y-auto custom-scrollbar bento-card p-10">
                                <ComponentShowcase />
                            </div>
                        )}
                    </main>
                </div>

                <Modal isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} title="Contacts Directory" size="md">
                    <div className="p-2"><ContactsList onSelectContact={handleSelectContact} /></div>
                </Modal>

                {isSettingsOpen && <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
                {isQRModalOpen && <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} address={account?.address?.toString() || ''} />}
                {isShortcutsOpen && <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} shortcuts={shortcuts} />}
                {isExportOpen && <ExportChat isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} messages={loadedMessages} chatName={currentView === 'dm' ? 'Direct Messages' : selectedGroup || 'Group Chat'} />}
                {isDraftsOpen && <DraftsModal isOpen={isDraftsOpen} onClose={() => setIsDraftsOpen(false)} drafts={drafts} onDeleteDraft={removeDraft} onSelectDraft={(d) => d.recipient && setSelectedRecipient(d.recipient)} />}

                <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} contractAddress={CONTRACT_ADDRESS} onGroupCreated={() => setGroupsRefreshKey(prev => prev + 1)} />
                <JoinGroupModal isOpen={isJoinGroupModalOpen} onClose={() => setIsJoinGroupModalOpen(false)} contractAddress={CONTRACT_ADDRESS} onGroupJoined={() => setGroupsRefreshKey(prev => prev + 1)} />
                <PerformanceDashboard isOpen={isPerformanceOpen} onClose={() => setIsPerformanceOpen(false)} />
                <Modal isOpen={isProfileEditorOpen} onClose={() => { setIsProfileEditorOpen(false); fetchUserProfile(); }} title="Profile Settings" size="lg">
                    <div className="p-6"><ProfileEditor /></div>
                </Modal>

                {/* Voice/Video Calling Interface */}
                <CallInterface
                    isOpen={isCallActive}
                    onClose={handleEndCall}
                    remoteAddress={callRecipient}
                    localAddress={account?.address?.toString() || ''}
                    callType={activeCallType}
                    isIncoming={isIncomingCallOpen}
                    incomingSignal={incomingCall || undefined}
                />

                {/* Incoming Call Modal */}
                <IncomingCallModal
                    isOpen={isIncomingCallOpen && !isCallActive}
                    signal={incomingCall}
                    onAccept={handleAcceptCall}
                    onReject={handleRejectCall}
                />
            </AppShell>
        </>
    )
}

export default App
