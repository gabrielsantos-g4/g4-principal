"use client"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import { RecentActivityItem } from "@/actions/messenger/dashboard-actions"
import { CheckCheck, Check, Clock, Eye } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RecentActivityProps {
    data: RecentActivityItem[]
}

export function RecentActivity({ data }: RecentActivityProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[350px] items-center justify-center text-gray-500 bg-[#1a1a1a]/50 rounded-lg border border-white/10 border-dashed">
                <p>Nenhuma atividade recente.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.id} className="flex items-center p-3 bg-[#1a1a1a] rounded-lg border border-white/5 hover:bg-[#1a1a1a]/80 transition-colors">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-white/10 text-gray-200">
                            {item.contact_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{item.contact_name}</p>
                        <p className="text-xs text-gray-400">
                            {item.contact_phone}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {format(new Date(item.timestamp), "HH:mm", { locale: ptBR })}
                        </span>
                        {item.status === 'read' && <Eye className="h-4 w-4 text-purple-500" />}
                        {item.status === 'delivered' && <CheckCheck className="h-4 w-4 text-green-500" />}
                        {item.status === 'sent' && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                </div>
            ))}
        </div>
    )
}
