import { useState, useEffect, type ReactNode } from 'react'
import { LayoutContext, useLayout } from './LayoutContext'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// BREAKPOINT HOOK
// ============================================
function useBreakpoints() {
    const [breakpoint, setBreakpoint] = useState({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
    })

    useEffect(() => {
        const checkBreakpoint = () => {
            const width = window.innerWidth
            setBreakpoint({
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
            })
        }

        checkBreakpoint()
        window.addEventListener('resize', checkBreakpoint)
        return () => window.removeEventListener('resize', checkBreakpoint)
    }, [])

    return breakpoint
}

// ============================================
// APP SHELL PROPS
// ============================================
interface AppShellProps {
    topNav: ReactNode
    sidebar?: ReactNode
    children: ReactNode
    rightPane?: ReactNode
}

// ============================================
// APP SHELL COMPONENT
// ============================================
export function AppShell({ topNav, sidebar, children, rightPane }: AppShellProps) {
    const { isMobile, isTablet, isDesktop } = useBreakpoints()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [rightPaneOpen, setRightPaneOpen] = useState(true)

    // Auto-close sidebar on mobile when navigating
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false)
        }
    }, [isMobile])

    // Show right pane by default on desktop
    useEffect(() => {
        setRightPaneOpen(isDesktop || isTablet)
    }, [isDesktop, isTablet])

    return (
        <LayoutContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                rightPaneOpen,
                setRightPaneOpen,
                isMobile,
                isTablet,
                isDesktop,
            }}
        >
            <div className="app-shell relative">
                {/* Dynamic Background Glows */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <motion.div
                        animate={{
                            x: [0, 60, -30, 0],
                            y: [0, -80, 50, 0],
                            scale: [1, 1.25, 0.85, 1],
                            rotate: [0, 90, 180, 360]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[-10%] left-[10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-purple-600/10 blur-[130px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, -50, 70, 0],
                            y: [0, 60, -70, 0],
                            scale: [1, 0.9, 1.2, 1],
                            rotate: [360, 270, 90, 0]
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className="absolute bottom-[-10%] right-[10%] w-[55vw] h-[55vw] max-w-[700px] rounded-full blur-[150px]"
                        style={{ background: 'rgba(255, 107, 53, 0.08)' }}
                    />
                    <motion.div
                        animate={{
                            x: [0, 40, -50, 0],
                            y: [0, 50, -60, 0],
                            scale: [1, 1.15, 0.8, 1]
                        }}
                        transition={{
                            duration: 22,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 4
                        }}
                        className="absolute top-[30%] right-[25%] w-[40vw] h-[40vw] max-w-[500px] rounded-full bg-indigo-500/10 blur-[120px]"
                    />
                </div>

                {/* Fixed Top Navigation */}
                <header className="app-shell__topnav z-10 relative">
                    {topNav}
                </header>
 
                {/* Main Layout Container - CSS Grid Implementation */}
                <div className="app-shell__grid z-10 relative">
                    {/* Left Pane - Navigation & Inbox (3 cols) */}
                    <motion.aside
                        initial={isDesktop ? { x: -20, opacity: 0 } : false}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`app-shell__left-pane ${isMobile && !sidebarOpen ? 'hidden' : ''} ${isMobile ? 'app-shell__left-pane--mobile-overlay' : ''}`}
                    >
                        {sidebar}
                    </motion.aside>

                    {/* Center Pane - Main Content (6 cols) */}
                    <main className="app-shell__center-pane" id="main-content">
                        <AnimatePresence mode="wait">
                            <motion.div
                                className="app-shell__content-scroller"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {/* Right Pane - Utilities (3 cols) */}
                    <motion.aside
                        initial={isDesktop ? { x: 20, opacity: 0 } : false}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        className={`app-shell__right-pane ${!rightPaneOpen && !isDesktop ? 'hidden' : ''}`}
                    >
                        {rightPane}
                    </motion.aside>
                </div>

                {/* Mobile Tablet Navigation Bar (Optional/Custom) */}
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="app-shell__mobile-overlay"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </LayoutContext.Provider>
    )
}

// ============================================
// TOP NAV COMPONENT
// ============================================
interface TopNavProps {
    logo?: ReactNode
    center?: ReactNode
    right?: ReactNode
}

export function TopNav({ logo, center, right }: TopNavProps) {
    const { setSidebarOpen, sidebarOpen, isMobile } = useLayout()

    return (
        <div className="topnav">
            <div className="topnav__left">
                {isMobile && (
                    <button
                        className="topnav__menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={sidebarOpen}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {sidebarOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            )}
                        </svg>
                    </button>
                )}
                {logo}
            </div>
            <div className="topnav__center">
                {center}
            </div>
            <div className="topnav__right">
                {right}
            </div>
        </div>
    )
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
interface SidebarProps {
    children: ReactNode
    header?: ReactNode
    footer?: ReactNode
}

export function Sidebar({ children, header, footer }: SidebarProps) {
    return (
        <div className="sidebar">
            {header && <div className="sidebar__header">{header}</div>}
            <nav className="sidebar__content">{children}</nav>
            {footer && <div className="sidebar__footer">{footer}</div>}
        </div>
    )
}

interface SidebarItemProps {
    icon?: ReactNode
    label: string
    badge?: number | string
    active?: boolean
    onClick?: () => void
}

export function SidebarItem({ icon, label, badge, active, onClick }: SidebarItemProps) {
    return (
        <button
            className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
        >
            {icon && <span className="sidebar__item-icon">{icon}</span>}
            <span className="sidebar__item-label">{label}</span>
            {badge !== undefined && (
                <span className="sidebar__item-badge">{badge}</span>
            )}
        </button>
    )
}

// ============================================
// PANE COMPONENTS
// ============================================
interface PaneProps {
    children: ReactNode
    className?: string
    header?: ReactNode
    padding?: boolean
}

export function CenterPane({ children, className = '', header, padding = true }: PaneProps) {
    return (
        <div className={`center-pane ${className}`}>
            {header && <div className="center-pane__header">{header}</div>}
            <div className={`center-pane__content ${padding ? 'center-pane__content--padded' : ''}`}>
                {children}
            </div>
        </div>
    )
}

export function RightPane({ children, className = '', header, padding = true }: PaneProps) {
    return (
        <div className={`right-pane ${className}`}>
            {header && <div className="right-pane__header">{header}</div>}
            <div className={`right-pane__content ${padding ? 'right-pane__content--padded' : ''}`}>
                {children}
            </div>
        </div>
    )
}

// ============================================
// PANEL CARD - For content sections
// ============================================
interface PanelCardProps {
    children: ReactNode
    title?: string
    icon?: ReactNode
    action?: ReactNode
    className?: string
}

export function PanelCard({ children, title, icon, action, className = '' }: PanelCardProps) {
    return (
        <div className={`panel-card ${className}`}>
            {(title || action) && (
                <div className="panel-card__header">
                    <div className="panel-card__title">
                        {icon && <span className="panel-card__icon">{icon}</span>}
                        {title && <h2>{title}</h2>}
                    </div>
                    {action && <div className="panel-card__action">{action}</div>}
                </div>
            )}
            <div className="panel-card__body">
                {children}
            </div>
        </div>
    )
}

export default AppShell
