'use client'

import { useSidebar } from '@/components/providers/sidebar-provider'

export function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar()

    return (
        <main className={`h-screen overflow-hidden bg-slate-950 transition-all duration-300 ${isCollapsed ? 'ml-0 md:ml-[60px]' : 'ml-0 md:ml-64'}`}>
            {children}
        </main>
    )
}
