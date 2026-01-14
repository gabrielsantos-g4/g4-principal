"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { updateContactSubscription } from "@/actions/messenger/contacts-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SubscriptionBadgeProps {
    contactId: string
    initialStatus: boolean
}

export function SubscriptionBadge({ contactId, initialStatus }: SubscriptionBadgeProps) {
    const [status, setStatus] = useState(initialStatus)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        const newStatus = !status

        try {
            const result = await updateContactSubscription(contactId, newStatus)

            if (result.error) {
                toast.error(result.error)
            } else {
                setStatus(newStatus)
                toast.success(newStatus ? "Inskrito com sucesso" : "Desinscrito com sucesso")
            }
        } catch (error) {
            toast.error("Erro ao atualizar inscrição.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                "cursor-pointer hover:opacity-80 transition-all border-0",
                status ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
                isLoading && "opacity-50 cursor-not-allowed"
            )}
            onClick={!isLoading ? handleToggle : undefined}
        >
            {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : null}
            {status ? "Sim" : "Não"}
        </Badge>
    )
}
