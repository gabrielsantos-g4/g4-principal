'use client'

import { useEffect, useState, useTransition } from "react"
import { getDesignRequestsByCompany, DesignRequest, updateDesignRequestAdmin } from "@/actions/design-actions"
import { DesignHistoryList } from "@/components/design/design-history-list"
import { Loader2 } from "lucide-react"

interface DesignFulfillmentGridProps {
    empresaId: string
}

export function DesignFulfillmentGrid({ empresaId }: DesignFulfillmentGridProps) {
    const [requests, setRequests] = useState<DesignRequest[]>([])
    const [isPending, startTransition] = useTransition()

    const fetchRequests = () => {
        startTransition(async () => {
            const data = await getDesignRequestsByCompany(empresaId)
            // Cast to compatible type if needed, but DesignRequest type should match
            setRequests(data as any[])
        })
    }

    useEffect(() => {
        if (empresaId) {
            fetchRequests()
        }
    }, [empresaId])
    // ...
    // Skipping lines 30-48 ("if (isPending)..." to "header...") for context match?
    // Actually I'll match the whole file or just the Component Def if possible, but safer to replace imports and the return.
    // I'll try to replace imports then the return block.
    // Wait, replacing imports + component body needs correct StartLine/EndLine.
    // I'll just use multi_replace or do it in one go if I replace the whole file content?
    // The previous content is small (50 lines). I'll replace the whole file to be safe and clean.

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <h3 className="text-white font-bold">Requests</h3>
                <button
                    onClick={fetchRequests}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                    Refresh
                </button>
            </div>
            <div className="flex-1 min-h-0">
                <DesignHistoryList
                    requests={requests}
                    updateAction={updateDesignRequestAdmin}
                    onUpdate={fetchRequests}
                />
            </div>
        </div>
    )
}
