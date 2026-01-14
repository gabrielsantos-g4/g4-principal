"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateContactSubscription } from "@/actions/messenger/contacts-actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SubscriptionBadgeProps {
    contactId: string
    initialStatus: boolean
}

export function SubscriptionBadge({ contactId, initialStatus }: SubscriptionBadgeProps) {
    const [status, setStatus] = useState(initialStatus)
    const [isPending, startTransition] = useTransition()

    const handleUpdate = (newStatus: boolean) => {
        if (newStatus === status) return

        // Optimistic update
        setStatus(newStatus)

        startTransition(async () => {
            const result = await updateContactSubscription(contactId, newStatus)
            if (result.error) {
                // Revert if failed
                setStatus(!newStatus)
                toast.error(result.error)
            } else {
                toast.success("Status atualizado!")
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
                {isPending ? (
                    <Badge variant="outline" className="opacity-50 cursor-wait">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        UPDATING
                    </Badge>
                ) : status ? (
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-950/20 hover:bg-green-900/40 cursor-pointer">
                        YES
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-red-500 border-red-500 bg-red-950/20 hover:bg-red-900/40 cursor-pointer">
                        NO
                    </Badge>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-white/10 text-white">
                <DropdownMenuItem onClick={() => handleUpdate(true)} className="text-green-500 hover:bg-white/10 hover:text-green-400">
                    YES (Subscribed)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdate(false)} className="text-red-500 hover:bg-white/10 hover:text-red-400">
                    NO (Unsubscribed)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
