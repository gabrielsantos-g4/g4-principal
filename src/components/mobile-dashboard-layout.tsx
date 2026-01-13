'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Layout } from 'lucide-react'

interface MobileDashboardLayoutProps {
    children: React.ReactNode
    rightSidebar: React.ReactNode
}

export function MobileDashboardLayout({ children, rightSidebar }: MobileDashboardLayoutProps) {
    return (
        <div className="flex flex-1 min-h-0 relative w-full">
            {/* Desktop View: Side by Side */}
            <div className="hidden md:flex w-full h-full">
                {children}
                {rightSidebar}
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
                        <TabsContent value="content" className="h-full mt-0 data-[state=active]:flex flex-col bg-slate-950">
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
