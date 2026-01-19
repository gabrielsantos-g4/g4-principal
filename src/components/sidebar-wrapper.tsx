'use client'

import { useState, useEffect } from 'react'
import { Sidebar as SidebarIcon, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/providers/sidebar-provider'

import { usePathname } from 'next/navigation'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const { isCollapsed, toggleSidebar } = useSidebar()
    const pathname = usePathname()

    // Auto-close sidebar on navigation (mobile)
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <>
            {/* Mobile Header / Toggle (Only visible on mobile) */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden fixed top-3 z-[110] text-white hover:bg-white/10 ${isOpen ? 'right-4' : 'left-3'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <SidebarIcon className="w-6 h-6" />}
            </Button>

            {/* Sidebar Container */}
            <aside className={`
                bg-[#171717] border-r border-[#1F1F1F] flex flex-col h-dvh fixed left-0 top-0 text-white font-sans z-[100] transition-all duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                ${isCollapsed ? 'w-[60px]' : 'w-64'}
            `}>
                {/* Desktop Collapse Toggle */}
                <div className={`hidden md:flex items-center h-16 px-4 border-b border-[#1F1F1F] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <span className="font-bold text-lg tracking-tight">g4</span>
                            <span className="text-[9px] leading-tight text-gray-400 font-medium uppercase tracking-wider">
                                MULTI-B2B AI AGENT PLATFORM
                            </span>
                        </div>
                    )}

                    <button
                        onClick={toggleSidebar}
                        className={`text-gray-400 hover:text-white transition-colors ${isCollapsed ? '' : ''}`}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <SidebarIcon size={20} />
                    </button>
                </div>

                {/* Content - Hidden when collapsed */}
                <div className={`flex-1 min-h-0 flex flex-col transition-opacity duration-200`}>
                    {children}
                </div>

                {/* Collapsed State Placeholder (if needed, but user said "no content") */}

            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}

