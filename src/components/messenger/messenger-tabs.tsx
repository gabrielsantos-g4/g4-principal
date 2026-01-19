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
            label: "Overview",
            icon: LayoutDashboard,
        },
        {
            value: "/dashboard/messenger/campaigns",
            label: "Campaigns",
            icon: Megaphone,
        },
        {
            value: "/dashboard/messenger/conversations",
            label: "Conversations",
            icon: MessageSquare,
        },
        {
            value: "/dashboard/messenger/storage",
            label: "Storage",
            icon: Database,
        },
        {
            value: "/dashboard/messenger/instances",
            label: "Instances",
            icon: Smartphone,
        },
        {
            value: "/dashboard/messenger/contacts",
            label: "Contacts",
            icon: Users,
        },
        {
            value: "/dashboard/messenger/settings",
            label: "Settings",
            icon: Settings,
        },
    ]

    // Determine current tab value based on pathname
    // If exact match doesn't exist, try to match by prefix for nested routes
    const currentTab = routes.find(r => r.value === pathname)?.value ||
        routes.find(r => pathname.startsWith(r.value) && r.value !== "/dashboard/messenger")?.value ||
        "/dashboard/messenger"

    return (
        <div className="pb-6">
            <Tabs
                value={currentTab}
                className="w-full"
                onValueChange={(value) => router.push(value)}
            >
                <div className="w-full overflow-x-auto no-scrollbar border-b border-white/10">
                    <TabsList className="bg-transparent p-0 h-auto flex w-max justify-start space-x-2 px-4 py-2">
                        {routes.map((route) => (
                            <TabsTrigger
                                key={route.value}
                                value={route.value}
                                className={cn(
                                    "rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 border border-transparent",
                                    currentTab === route.value
                                        ? "bg-white/10 text-white border-white/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            </Tabs>
        </div>
    )
}
