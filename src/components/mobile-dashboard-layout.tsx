'use client'

import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Layout } from 'lucide-react'
import { useSidebar } from '@/components/providers/sidebar-provider'

interface MobileDashboardLayoutProps {
    children: React.ReactNode
    rightSidebar: React.ReactNode
}

export function MobileDashboardLayout({ children, rightSidebar }: MobileDashboardLayoutProps) {
    const { isRightSidebarCollapsed } = useSidebar()
    const [sidebarWidth, setSidebarWidth] = useState(400)
    const [isResizing, setIsResizing] = useState(false)

    const startResizing = React.useCallback(() => {
        setIsResizing(true)
    }, [])

    const stopResizing = React.useCallback(() => {
        setIsResizing(false)
    }, [])

    const resize = React.useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - mouseMoveEvent.clientX
            if (newWidth > 300 && newWidth < 800) {
                setSidebarWidth(newWidth)
            }
        }
    }, [isResizing])

    React.useEffect(() => {
        window.addEventListener("mousemove", resize)
        window.addEventListener("mouseup", stopResizing)
        return () => {
            window.removeEventListener("mousemove", resize)
            window.removeEventListener("mouseup", stopResizing)
        }
    }, [resize, stopResizing])

    return (
        <div className="flex flex-1 min-h-0 relative w-full select-none">
            {/* Desktop View: Side by Side */}
            <div className="hidden md:flex w-full h-full">
                <div className="flex-1 min-w-0 overflow-y-auto h-full p-4 md:p-6">
                    {children}
                </div>

                {/* Resize Handle */}
                <div
                    className={`w-1 cursor-col-resize hover:bg-[#1C73E8] transition-colors z-50 flex-shrink-0 ${isResizing ? 'bg-[#1C73E8]' : 'bg-transparent'}`}
                    onMouseDown={startResizing}
                />

                <div
                    style={{ width: isRightSidebarCollapsed ? 60 : sidebarWidth }}
                    className={`flex-shrink-0 relative ${isResizing ? '' : 'transition-[width] duration-300 ease-in-out'}`}
                >
                    {rightSidebar}
                </div>
            </div>

            {/* Mobile View: Tabs */}
            <div className="md:hidden flex flex-col w-full h-full absolute inset-0">
                <Tabs defaultValue="content" className="flex-1 flex flex-col h-full">
                    {/* Top Navigation Tabs */}
                    <TabsList className="grid w-full grid-cols-2 rounded-none bg-[#0c0c0c] p-0 h-12 border-b border-white/10 z-50 shrink-0">
                        <TabsTrigger
                            value="content"
                            className="rounded-none h-full border-r border-white/5 data-[state=active]:bg-white/5 data-[state=active]:text-[#1C73E8] text-slate-400 gap-2 data-[state=active]:border-b-2 data-[state=active]:border-b-[#1C73E8]"
                        >
                            <Layout className="w-4 h-4" />
                            <span className="text-xs font-medium">Content</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="chat"
                            className="rounded-none h-full data-[state=active]:bg-white/5 data-[state=active]:text-[#1C73E8] text-slate-400 gap-2 data-[state=active]:border-b-2 data-[state=active]:border-b-[#1C73E8]"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-medium">Chat</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-hidden relative">
                        <TabsContent value="content" className="h-full mt-0 data-[state=active]:flex flex-col bg-slate-950 p-4 overflow-y-auto">
                            {children}
                        </TabsContent>
                        <TabsContent value="chat" className="h-full mt-0 bg-black border-l border-white/10 relative z-30">
                            {rightSidebar}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
