'use client'

import { useState, useEffect } from 'react'
import { getAuditLogs, AuditLogEntry } from '@/actions/audit' // We'll fix import path if needed
import { Loader2, History } from 'lucide-react'
import { format } from 'date-fns'

export function AuditLogsList() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true)
            const data = await getAuditLogs()
            setLogs(data)
            setLoading(false)
        }
        fetchLogs()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
        )
    }

    if (logs.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No history found.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border border-white/10 overflow-hidden bg-[#0c0c0c] h-full flex flex-col">
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-white/5 text-slate-400 font-medium sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-4 py-2 text-xs uppercase tracking-wider w-[20%]">User</th>
                            <th className="px-4 py-2 text-xs uppercase tracking-wider w-[20%]">Action</th>
                            <th className="px-4 py-2 text-xs uppercase tracking-wider w-[40%]">Details</th>
                            <th className="px-4 py-2 text-xs uppercase tracking-wider text-right w-[20%]">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-white text-xs">{log.user?.name}</div>
                                        <span className="text-[10px] text-slate-600 hidden group-hover:inline-block">({log.user?.email})</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="text-slate-300 text-xs font-medium bg-white/5 px-1.5 py-0.5 rounded w-fit border border-white/5">
                                        {formatAction(log.action)}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="text-xs text-slate-400 truncate" title={JSON.stringify(log.details)}>
                                        {formatDetails(log.action, log.details)}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-right text-slate-500 whitespace-nowrap text-xs">
                                    {format(new Date(log.created_at), 'EEE, dd/MM/yyyy HH:mm')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function formatAction(action: string) {
    // Map standard actions to readable text
    const map: Record<string, string> = {
        'USER_CREATED': 'Created User',
        'USER_UPDATED': 'Updated User',
        'USER_DELETED': 'Deleted User',
        'LEAD_CREATED': 'Created Lead',
        'LEAD_UPDATED': 'Updated Lead',
        'LEAD_DELETED': 'Deleted Lead',
        'OPPORTUNITY_UPDATED': 'Updated Opportunity',
        'LEADS_TRANSFERRED': 'Transferred Leads',
        'COMPANY_UPDATED': 'Updated Company DNA',
    }
    return map[action] || action
}

function formatDetails(action: string, details: any) {
    if (!details) return ''

    // User Actions
    if (action === 'USER_CREATED') {
        return `Created user ${details.target_email || ''}`
    }
    if (action === 'USER_UPDATED') {
        const changes = Object.keys(details.changes || {}).join(', ')
        return `Updated user ${details.target_email || 'profile'}: ${changes}`
    }
    if (action === 'USER_DELETED') {
        return `Deleted user ${details.target_email || ''}`
    }

    // Lead Actions
    if (action === 'LEAD_CREATED') {
        return `Created new lead: ${details.name || 'Unknown'}`
    }
    if (action === 'LEAD_DELETED') {
        return `Deleted lead "${details.name || 'Unknown'}" (ID: ${details.lead_id})`
    }
    if (action === 'LEAD_UPDATED') {
        const updates = details.updates || {}
        const keys = Object.keys(updates)
        const name = details.name || `Lead #${details.lead_id}`

        if (keys.includes('status')) {
            const oldStatus = details.old_status ? ` from "${details.old_status}"` : ''
            return `Updated lead "${name}" status${oldStatus} to "${updates.status}"`
        }
        if (keys.includes('custom_field')) {
            return `Updated lead "${name}" category to "${updates.custom_field}"`
        }

        return `Updated lead "${name}": ${keys.join(', ')}`
    }

    if (action === 'OPPORTUNITY_UPDATED') {
        const updates = details.updates || {}
        const keys = Object.keys(updates)
        const name = details.name || `Lead #${details.lead_id}`
        return `Updated opportunity "${name}" fields: ${keys.join(', ')}`
    }

    if (action === 'LEADS_TRANSFERRED') {
        return `Transferred ${details.count} leads (${details.from} -> ${details.to})`
    }

    // Generic Fallback
    if (details.target_email) return `Target: ${details.target_email}`
    if (details.target_name) return `Target: ${details.target_name}`

    return JSON.stringify(details).replace(/["{}]/g, '').replace(/,/g, ', ').substring(0, 50)
}
