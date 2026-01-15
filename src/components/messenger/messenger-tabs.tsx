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
    const currentTab = routes.find(r => r.value === pathname)?.value || routes[0].value

    return (
        <div className="pb-6">
            <Tabs
                value={currentTab}
                className="w-full"
                onValueChange={(value) => router.push(value)}
            >
                <TabsList className="bg-[#171717] border border-white/10 p-1 rounded-lg h-auto flex-wrap justify-start w-fit">
                    {routes.map((route) => (
                        <TabsTrigger
                            key={route.value}
                            value={route.value}
                            className={cn(
                                "data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2",
                                currentTab === route.value ? "text-white" : ""
                            )}
                        >
                            <route.icon className="h-4 w-4" />
                            {route.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    )
}
