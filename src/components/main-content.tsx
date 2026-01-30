'use client'

import React, { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { useSidebar } from '@/components/providers/sidebar-provider'

export function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar()
    const mainRef = useRef<HTMLElement>(null)
    const pathname = usePathname()

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTop = 0
        }
    }, [pathname])

    return (
        <main ref={mainRef} className={`h-screen overflow-hidden bg-[#09090b] flex flex-col ${isCollapsed ? 'ml-0 md:ml-[60px]' : 'ml-0 md:ml-64'}`}>
            {children}
        </main>
    )
}
