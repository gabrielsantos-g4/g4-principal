"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    LayoutDashboard,
    MessageSquare,
    Megaphone,
    Database,
    Smartphone,
    Users,
    Settings
} from "lucide-react"

export function MessengerTabs() {
    const pathname = usePathname()
    const router = useRouter()

    const routes = [
        {
            value: "/dashboard/messenger",
            label: "Visão Geral",
            icon: LayoutDashboard,
        },
        {
            value: "/dashboard/messenger/campaigns",
            label: "Campanhas",
            icon: Megaphone,
        },
        {
            value: "/dashboard/messenger/conversations",
            label: "Conversas",
            icon: MessageSquare,
        },
        {
            value: "/dashboard/messenger/storage",
            label: "Arquivos",
            icon: Database,
        },
        {
            value: "/dashboard/messenger/instances",
            label: "Instâncias",
            icon: Smartphone,
        },
        {
            value: "/dashboard/messenger/contacts",
            label: "Contatos",
            icon: Users,
        },
        {
            value: "/dashboard/messenger/settings",
            label: "Configurações",
            icon: Settings,
        },
    ]

    // Determine current tab value based on pathname
    // If exact match fails, try prefix matching for sub-routes if needed, but here structure is flat-ish.
    const currentTab = routes.find(r => r.value === pathname)?.value || routes[0].value

    return (
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex h-14 items-center px-4">
                <Tabs
                    value={currentTab}
                    className="w-full"
                    onValueChange={(value) => router.push(value)}
                >
                    <TabsList className="bg-transparent border-none p-0 h-14 w-full justify-start gap-2">
                        {routes.map((route) => (
                            <TabsTrigger
                                key={route.value}
                                value={route.value}
                                className={cn(
                                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#1C73E8] data-[state=active]:text-[#1C73E8] rounded-none h-full px-4 text-gray-400 hover:text-gray-200 transaction-colors flex items-center gap-2",
                                    currentTab === route.value ? "text-[#1C73E8]" : ""
                                )}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
        </div>
    )
}
