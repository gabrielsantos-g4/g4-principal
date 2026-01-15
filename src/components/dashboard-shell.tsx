'use client'

import { SidebarProvider } from '@/components/providers/sidebar-provider'

export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    )
}
