import React from 'react'
import { Avatar } from './Avatar'

interface ListItemProps {
    avatarAddress: string
    title: string
    subtitle?: string
    timestamp?: string | number
    unreadCount?: number
    isActive?: boolean
    onClick?: () => void
    status?: 'online' | 'offline' | 'away'
    direction?: 'sent' | 'received'
}

export const ListItem: React.FC<ListItemProps> = ({
    avatarAddress,
    title,
    subtitle,
    timestamp,
    unreadCount = 0,
    isActive = false,
    onClick,
    status,
    direction
}) => {
    const formatTimestamp = (ts?: string | number) => {
        if (!ts) return ''
        const date = new Date(ts)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div
            onClick={onClick}
            className={`
        flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 rounded-xl
        ${isActive
                    ? 'bg-card shadow-md border border-primary/20'
                    : 'bg-transparent hover:bg-card hover:shadow-sm border border-transparent'
                }
      `}
        >
            <div className="relative shrink-0">
                <Avatar address={avatarAddress} size="sm" status={status} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {title}
                    </h4>
                    {timestamp && (
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                            {formatTimestamp(timestamp)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                    {subtitle && (
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {direction === 'sent' && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground shrink-0">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            )}
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {(() => {
                                    const sub = subtitle.toLowerCase();
                                    if (sub.includes('![gif]')) return 'ðŸŽ¬ GIF';
                                    if (sub.includes('![') || /\.(jpg|jpeg|png|gif|webp|svg)/i.test(sub)) return 'ðŸ“¸ Photo';
                                    if (sub.includes('[video:') || /\.(mp4|webm|ogg|mov|quicktime)/i.test(sub)) return 'ðŸŽ¥ Video';
                                    if (sub.includes('[file:') || sub.includes('](')) return 'ðŸ“„ Document';
                                    return subtitle;
                                })()}
                            </p>
                        </div>
                    )}
                    {unreadCount > 0 && (
                        <div className="shrink-0">
                            <div className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
                                {unreadCount}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

