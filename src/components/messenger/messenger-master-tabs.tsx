"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface MessengerMasterTabsProps {
    children: React.ReactNode
}

export function MessengerMasterTabs({ children }: MessengerMasterTabsProps) {
    const [activeTab, setActiveTab] = useState("whatsapp")

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-8 pt-6 pb-2">
                <TabsList className="bg-[#1a1a1a] border border-white/10 p-1 rounded-lg">
                    <TabsTrigger
                        value="email"
                        className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white px-6 transition-all"
                    >
                        Email
                    </TabsTrigger>
                    <TabsTrigger
                        value="whatsapp"
                        className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white px-6 transition-all"
                    >
                        WhatsApp
                    </TabsTrigger>
                    <TabsTrigger
                        value="linkedin"
                        className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white px-6 transition-all"
                    >
                        LinkedIn
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="email" className="flex-1 p-8 m-0 outline-none">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-gray-700">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold text-gray-200">Under development</h3>
                        <p className="mb-4 mt-2 text-sm text-gray-400">
                            Contact Gabriel at gabriel@startg4.com
                        </p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="flex-1 flex flex-col min-h-0 m-0 outline-none data-[state=active]:flex">
                {children}
            </TabsContent>

            <TabsContent value="linkedin" className="flex-1 p-8 m-0 outline-none">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-gray-700">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold text-gray-200">Under development</h3>
                        <p className="mb-4 mt-2 text-sm text-gray-400">
                            Contact Gabriel at gabriel@startg4.com
                        </p>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}
