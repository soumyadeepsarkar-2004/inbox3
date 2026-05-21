import { createContext, useContext } from 'react'

export interface LayoutContextType {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    rightPaneOpen: boolean
    setRightPaneOpen: (open: boolean) => void
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
}

export const LayoutContext = createContext<LayoutContextType | null>(null)

export function useLayout() {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useLayout must be used within AppShell')
    }
    return context
}
