/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback } from 'react'
import { NETWORK } from '../config'

interface PerformanceMetrics {
    totalMessages: number
    messagesSent: number
    messagesReceived: number
    groupsJoined: number
    averageResponseTime: number
    mostActiveDay: string
    totalDataUsed: number
    uptime: number
    messageHistory: number[] // Timestamps of all messages
}

interface PerformanceDashboardProps {
    isOpen?: boolean
    onClose?: () => void
    standalone?: boolean
}

export default function PerformanceDashboard({ isOpen, onClose, standalone = false }: PerformanceDashboardProps) {
    const [sessionStart] = useState(Date.now())
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        totalMessages: 0,
        messagesSent: 0,
        messagesReceived: 0,
        groupsJoined: 0,
        averageResponseTime: 0,
        mostActiveDay: 'Monday',
        totalDataUsed: 0,
        uptime: 0,
        messageHistory: []
    })

    // Update uptime every second for a dynamic feel
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                uptime: Date.now() - sessionStart
            }))
        }, 1000)
        return () => clearInterval(interval)
    }, [sessionStart])

    const loadMetrics = useCallback(() => {
        const saved = localStorage.getItem('inbox3_metrics')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setMetrics(prev => ({
                    ...parsed,
                    uptime: prev.uptime // Preserve current session uptime
                }))
            } catch (e) {
                console.error('Failed to parse metrics', e)
            }
        }
    }, [])

    useEffect(() => {
        if (isOpen || standalone) {
            loadMetrics()
        }
    }, [isOpen, standalone, loadMetrics])

    // Update metrics when storage changes (e.g. from another component)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'inbox3_metrics') {
                loadMetrics()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        // Interval fallback for same-window updates
        const interval = setInterval(loadMetrics, 2000)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [loadMetrics])

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatUptime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}d ${hours % 24}h`
        if (hours > 0) return `${hours}h ${minutes % 60}m`
        return `${minutes}m`
    }

    if (!standalone && !isOpen) return null

    const stats = [
        {
            label: 'Total Messages',
            value: metrics.totalMessages.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
            color: 'blue'
        },
        {
            label: 'Messages Sent',
            value: metrics.messagesSent.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
            ),
            color: 'green'
        },
        {
            label: 'Messages Received',
            value: metrics.messagesReceived.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
            ),
            color: 'purple'
        },
        {
            label: 'Groups Joined',
            value: metrics.groupsJoined.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: 'orange'
        },
        {
            label: 'Avg. Response Time',
            value: `${metrics.averageResponseTime}m`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            color: 'pink'
        },
        {
            label: 'Data Used',
            value: formatBytes(metrics.totalDataUsed),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
            ),
            color: 'cyan'
        }
    ]

    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
    }

    if (standalone) {
        return (
            <div className="p-6 flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-x-10 gap-y-8">
                    {stats.slice(0, 4).map((stat, index) => (
                        <div key={index} className="group cursor-default relative">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-muted) mb-2.5 group-hover:text-(--primary-brand) transition-colors whitespace-nowrap">
                                {stat.label.split(' ').length > 1 ? stat.label.split(' ')[1] : stat.label}
                            </p>
                            <div className="flex items-end gap-1.5">
                                <span className="text-2xl font-black text-(--text-primary) tracking-tight leading-none">
                                    {stat.value}
                                </span>
                                <span className="text-[8px] font-black text-(--text-muted) uppercase tracking-tighter opacity-30 mb-0.5">Units</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-(--border-color)/40 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 blur-[3px] opacity-40" />
                        </div>
                        <span className="text-[9px] font-black text-(--text-secondary) uppercase tracking-[0.15em]">System Active</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-(--bg-secondary) border border-(--border-color) shadow-inner flex items-center">
                        <span className="text-[9px] font-bold font-mono text-(--primary-brand) uppercase tracking-wider">{NETWORK}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 animate-fade-in backdrop-blur-sm">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-(--border-color)/50">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/10 bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                            Performance <span className="text-purple-200">Intelligence</span>
                        </h2>
                        <p className="text-sm font-medium opacity-80 mt-1 tracking-wide">Real-time protocol analytics and metrics</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="relative z-10 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center group"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-90 transition-transform">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="p-6 bg-white dark:bg-(--bg-card) rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group border border-(--border-color)/50 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[0]}`}></div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3.5 rounded-2xl ${colorClasses[stat.color as keyof typeof colorClasses]} shadow-lg shadow-current/10`}>
                                        {stat.icon}
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-(--text-muted)">{stat.label}</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black text-(--text-primary) tracking-tighter">{stat.value}</p>
                                    <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-tighter opacity-40">Live</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Protocol Analytics (Activity Chart) */}
                        <div className="p-8 bg-white dark:bg-(--bg-card) rounded-[2.5rem] border border-(--border-color)/50 shadow-sm relative overflow-hidden group">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-(--text-muted) mb-8 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                Protocol Activity Flow
                            </h3>

                            <div className="flex items-end justify-between h-40 gap-2 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                                    const count = metrics.messageHistory?.filter(ts => new Date(ts).getDay() === i).length || 0;
                                    const max = Math.max(...[0, 1, 2, 3, 4, 5, 6].map(d => metrics.messageHistory?.filter(ts => new Date(ts).getDay() === d).length || 0), 1);
                                    const height = (count / max) * 100;
                                    return (
                                        <div key={day} className="flex-1 flex flex-col items-center gap-2 group/bar">
                                            <div className="w-full relative">
                                                <div
                                                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg transition-all duration-1000 ease-out group-hover/bar:bg-indigo-400"
                                                    style={{ height: `${Math.max(height, 5)}%` }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        {count} msgs
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-(--text-muted) uppercase">{day}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick Insights */}
                        <div className="p-8 bg-white dark:bg-(--bg-card) rounded-[2.5rem] border border-(--border-color)/50 shadow-sm">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-(--text-muted) mb-6 flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-purple-500">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                                Network Insights
                            </h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-(--bg-secondary)/40 rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest">Most Active Day</span>
                                        <span className="text-lg font-black text-(--text-primary) tracking-tight">{metrics.mostActiveDay}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xs">
                                        {metrics.mostActiveDay.slice(0, 1)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-(--bg-secondary)/40 rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest">Protocol Uptime</span>
                                        <span className="text-lg font-black text-(--text-primary) tracking-tight">{formatUptime(metrics.uptime)}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-(--bg-secondary)/40 rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest">Efficiency Ratio</span>
                                        <span className="text-lg font-black text-(--text-primary) tracking-tight">
                                            {metrics.messagesReceived > 0
                                                ? (metrics.messagesSent / metrics.messagesReceived).toFixed(2)
                                                : '1.00'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg uppercase">Optimal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {onClose && (
                    <div className="p-6 border-t border-(--border-color) bg-(--bg-secondary) flex items-center justify-between">
                        <p className="text-xs text-(--text-muted)">
                            Last updated: {new Date().toLocaleString()}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-(--primary-brand) text-white rounded-xl font-medium hover:bg-(--primary-brand-hover) transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Hook for tracking metrics
export function useMetrics() {
    const [sessionStart] = useState(Date.now())
    const [metrics, setMetrics] = useState<PerformanceMetrics>(() => {
        const saved = localStorage.getItem('inbox3_metrics')
        const defaults: PerformanceMetrics = {
            totalMessages: 0,
            messagesSent: 0,
            messagesReceived: 0,
            groupsJoined: 0,
            averageResponseTime: 0,
            mostActiveDay: 'Monday',
            totalDataUsed: 0,
            uptime: 0,
            messageHistory: []
        }
        if (saved) {
            try {
                return { ...defaults, ...JSON.parse(saved), uptime: 0 }
            } catch (e) {
                console.error('Failed to parse saved metrics', e)
            }
        }
        return defaults
    })

    // Update uptime duration
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                uptime: Date.now() - sessionStart
            }))
        }, 1000) // Update every second for accuracy in the hook
        return () => clearInterval(interval)
    }, [sessionStart])

    const loadMetrics = useCallback(() => {
        const saved = localStorage.getItem('inbox3_metrics')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setMetrics(prev => ({
                    ...parsed,
                    uptime: prev.uptime // Preserve current session uptime
                }))
            } catch (e) {
                console.error('Failed to sync metrics', e)
            }
        }
    }, [])

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'inbox3_metrics') {
                loadMetrics()
            }
        }
        window.addEventListener('storage', handleStorageChange)

        // Polling fallback
        const interval = setInterval(loadMetrics, 2000)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [loadMetrics])

    const calculateMostActiveDay = (history: number[]): string => {
        if (history.length === 0) return 'None'
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const counts: Record<string, number> = {}
        history.forEach(ts => {
            const day = days[new Date(ts).getDay()]
            counts[day] = (counts[day] || 0) + 1
        })
        return Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a)[0]
    }

    const incrementMessagesSent = useCallback(() => {
        const current: PerformanceMetrics = JSON.parse(localStorage.getItem('inbox3_metrics') || '{}')
        const now = Date.now()
        const history = [...(current.messageHistory || []), now]
        const updated: PerformanceMetrics = {
            ...current,
            messagesSent: (current.messagesSent || 0) + 1,
            totalMessages: (current.totalMessages || 0) + 1,
            messageHistory: history,
            mostActiveDay: calculateMostActiveDay(history)
        }
        localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
        setMetrics(prev => ({ ...prev, ...updated }))
        window.dispatchEvent(new StorageEvent('storage', { key: 'inbox3_metrics' }))
    }, [])

    const incrementMessagesReceived = useCallback(() => {
        const current: PerformanceMetrics = JSON.parse(localStorage.getItem('inbox3_metrics') || '{}')
        const now = Date.now()
        const history = [...(current.messageHistory || []), now]
        const updated: PerformanceMetrics = {
            ...current,
            messagesReceived: (current.messagesReceived || 0) + 1,
            totalMessages: (current.totalMessages || 0) + 1,
            messageHistory: history,
            mostActiveDay: calculateMostActiveDay(history)
        }
        localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
        setMetrics(prev => ({ ...prev, ...updated }))
        window.dispatchEvent(new StorageEvent('storage', { key: 'inbox3_metrics' }))
    }, [])

    const incrementGroupsJoined = useCallback(() => {
        const current = JSON.parse(localStorage.getItem('inbox3_metrics') || '{}')
        const updated = {
            ...current,
            groupsJoined: (current.groupsJoined || 0) + 1
        }
        localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
        setMetrics(prev => ({ ...prev, ...updated }))
        window.dispatchEvent(new StorageEvent('storage', { key: 'inbox3_metrics' }))
    }, [])

    const addDataUsage = useCallback((bytes: number) => {
        const current = JSON.parse(localStorage.getItem('inbox3_metrics') || '{}')
        const updated = {
            ...current,
            totalDataUsed: (current.totalDataUsed || 0) + bytes
        }
        localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
        setMetrics(prev => ({ ...prev, ...updated }))
        window.dispatchEvent(new StorageEvent('storage', { key: 'inbox3_metrics' }))
    }, [])

    return {
        metrics,
        incrementMessagesSent,
        incrementMessagesReceived,
        incrementGroupsJoined,
        addDataUsage
    }
}
