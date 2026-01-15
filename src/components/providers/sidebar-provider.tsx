'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
    isCollapsed: boolean
    toggleSidebar: () => void
    isRightSidebarCollapsed: boolean
    toggleRightSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false)

    const toggleSidebar = () => setIsCollapsed(prev => !prev)
    const toggleRightSidebar = () => setIsRightSidebarCollapsed(prev => !prev)

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, isRightSidebarCollapsed, toggleRightSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}
