'use client'

import { useState, useEffect } from 'react'
import { Sidebar, X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { usePathname } from 'next/navigation'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Auto-close sidebar on navigation
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
                {isOpen ? <X className="w-6 h-6" /> : <Sidebar className="w-6 h-6" />}
            </Button>

            {/* Sidebar Container */}
            <aside className={`
                w-full md:w-64 bg-[#0c0c0c] border-r border-[#1F1F1F] flex flex-col h-screen fixed left-0 top-0 text-white font-sans z-[100] transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {children}

                {/* Mobile: Collapse Button (User asked for a collapse button) */}
                {/* On desktop it's always open. On mobile this allows closing besides the toggle. */}
                <div className="md:hidden absolute top-4 right-4">
                    {/* The X button in the toggle handles this actually. */}
                </div>
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
