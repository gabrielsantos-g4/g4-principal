"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Smartphone,
    Users,
    Megaphone,
    MessageSquare,
    Settings,
    Database,
} from "lucide-react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/messenger",
        color: "text-sky-500",
    },
    {
        label: "WhatsApp",
        icon: Smartphone,
        href: "/dashboard/messenger/instances",
        color: "text-violet-500",
    },
    {
        label: "Contacts",
        icon: Users,
        href: "/dashboard/messenger/contacts",
        color: "text-pink-700",
    },
    {
        label: "Campaigns",
        icon: Megaphone,
        href: "/dashboard/messenger/campaigns",
        color: "text-orange-700",
    },
    {
        label: "Conversations",
        icon: MessageSquare,
        href: "/dashboard/messenger/conversations",
        color: "text-emerald-500",
    },
    {
        label: "Storage",
        icon: Database,
        href: "/dashboard/messenger/storage",
        color: "text-indigo-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/messenger/settings",
    },
];

export function MessengerSidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111] border-r border-white/10">
            <div className="px-3 py-2 flex-1">
                <div className="pl-3 mb-14">
                    <h1 className="text-xl font-bold text-white">
                        Messenger
                    </h1>
                    <p className="text-xs text-gray-400">Campaign Manager</p>
                </div>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-gray-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
