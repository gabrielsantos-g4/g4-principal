"use client"

import { useState, useEffect } from "react"
import { CompanyDNAForm } from "@/components/company-dna-form"
import { PricingContent } from "@/components/pricing-content"
import { signout } from '@/app/login/actions'
import { User, Building2, BadgeDollarSign, CreditCard, ArrowUpRight, LogOut, Ban, Plus, ChevronDown, Brain, History, Users2, MessageSquare } from "lucide-react"
import { UnifiedTeam } from '@/components/profile/UnifiedTeam'
import { AuditLogsList } from '@/components/profile/audit-logs-list'
import { useSearchParams } from "next/navigation"

import { OmnichannelInbox } from "../support/omnichannel/omnichannel-inbox"
import { DashboardCard } from "../layout/dashboard-card"

import { AGENTS } from "@/lib/agents"
import { getMessagingUsers } from "@/actions/users/get-messaging-users"

interface OrchestratorTabsProps {
    company: any
    activeAgents?: string[] | null
    userProfile?: any
    mode?: any
    crmSettings?: any
}

export function OrchestratorTabs({ company, activeAgents, userProfile, crmSettings }: OrchestratorTabsProps) {
    const searchParams = useSearchParams()

    // Determine default tab based on permissions
    // If no tab param, default to 'chats' if enabled, else 'company'
    const tabParam = searchParams.get('tab')
    const activeTab = tabParam || (userProfile?.has_messaging_access ? 'chats' : 'company')

    // State
    const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD')

    // Inbox state
    const [selectedInboxId, setSelectedInboxId] = useState<string>(userProfile?.id)
    const [accessibleInboxes, setAccessibleInboxes] = useState<any[]>([])

    // Build accessible inboxes list
    useEffect(() => {
        const buildInboxes = async () => {
            const inboxes = []

            if (!userProfile) return

            // 1. Current User (Always first)
            inboxes.push({
                id: userProfile.id,
                name: userProfile.name + " (You)",
                avatar: userProfile.avatar_url,
                type: 'human'
            })

            // 2. Add agents validation logic here if needed, or other users
            // For now, simpler implementation as per standardized plan focus on layout

            setAccessibleInboxes(inboxes)

            // Fetch messaging users if admin - to implement later if specific agent inbox access is needed
            // For now standard behavior
        }

        buildInboxes()
    }, [userProfile, activeAgents])

    return (
        <div className="w-full h-full flex flex-col">
            {/* NO TABS HEADER HERE - Controlled via URL from Header/Sidebar */}

            {activeTab === "chats" && userProfile?.has_messaging_access && (
                <div className="flex-1 h-full overflow-hidden">
                    <DashboardCard>
                        <OmnichannelInbox
                            targetUserId={selectedInboxId}
                            targetUser={accessibleInboxes.find(i => i.id === selectedInboxId)}
                            viewerProfile={userProfile}
                            accessibleInboxes={accessibleInboxes}
                            onInboxChange={setSelectedInboxId}
                            crmSettings={crmSettings}
                        />
                    </DashboardCard>
                </div>
            )}

            {activeTab === "history" && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#171717] border border-white/10 rounded-xl p-6 flex flex-col">
                    <div className="mb-4 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-white">Activity Log</h3>
                                <p className="text-sm text-slate-400">View recent actions performed by your team.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <AuditLogsList />
                    </div>
                </div>
            )}

            {activeTab === "company" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-y-auto">
                    <CompanyDNAForm company={company} userProfile={userProfile} mode="company" />
                </div>
            )}

            {activeTab === "team" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#171717] border border-white/10 rounded-xl p-6 h-full overflow-y-auto">
                    <UnifiedTeam initialActiveAgents={activeAgents} readOnly={userProfile?.role !== 'admin'} />
                </div>
            )}

            {activeTab === "pricing" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#171717] border border-white/10 rounded-xl p-6 h-full overflow-y-auto">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white">PLANS & PRICING</h1>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">Manage your subscription</p>
                        </div>
                        <div className="flex bg-white/10 rounded-lg p-1 gap-1">
                            <button
                                onClick={() => setCurrency('USD')}
                                className={`p-1.5 rounded-md transition-all ${currency === 'USD' ? 'bg-[#1C73E8] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                title="USD"
                            >
                                🇺🇸
                            </button>
                            <button
                                onClick={() => setCurrency('BRL')}
                                className={`p-1.5 rounded-md transition-all ${currency === 'BRL' ? 'bg-[#1C73E8] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                title="BRL"
                            >
                                🇧🇷
                            </button>
                        </div>
                    </div>
                    <PricingContent currency={currency} />
                </div>
            )}

            {activeTab === "billing" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5 min-h-[400px] h-full">
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <CreditCard size={48} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Billing Page</h3>
                        <p className="text-gray-400 mb-6">
                            Manage your payment methods, view invoices, and update billing information in our secure portal.
                        </p>
                    </div>

                    <div className="w-full pt-12 mt-12 border-t border-white/5">
                        <div className="flex flex-col items-center gap-2">
                            <h4 className="text-sm font-bold text-red-500 flex items-center gap-2">
                                <Ban size={16} />
                                Danger Zone
                            </h4>
                            <button className="text-xs text-red-400/60 hover:text-red-400 hover:underline transition-colors">
                                Deactivate my account permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "support" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5 h-full">
                    <ArrowUpRight size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Need Help?</h3>
                    <p className="text-gray-400 max-w-md mb-6">
                        We are here to assist you with any questions or issues.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="mailto:gabriel@startg4.com"
                            className="bg-[#1C73E8] text-white px-6 py-2 rounded-lg hover:bg-[#1557b0] transition-colors font-medium"
                        >
                            Email Support
                        </a>
                        <a
                            href="https://calendly.com/gabriel_santos/30-min"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/5"
                        >
                            Schedule a call
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
