"use client"

import { useState } from "react"
import { CompanyDNAForm } from "@/components/company-dna-form"
import { PricingContent } from "@/components/pricing-content"
import { signout } from '@/app/login/actions'
import { User, Building2, BadgeDollarSign, CreditCard, ArrowUpRight, LogOut, Ban, Plus, ChevronDown, Brain, History, Users2 } from "lucide-react"
import { UnifiedTeam } from '@/components/profile/UnifiedTeam'
import { AuditLogsList } from '@/components/profile/audit-logs-list'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface OrchestratorTabsProps {
    company: any
    activeAgents?: string[] | null
    userProfile?: any
    mode?: any
}

export function OrchestratorTabs({ company, activeAgents, userProfile }: OrchestratorTabsProps) {
    const [activeTab, setActiveTab] = useState<"profile" | "company" | "pricing" | "billing" | "support" | "team" | "history">("profile")
    // State
    const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD')

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                {/* Tabs Header */}
                <div className="flex items-center gap-1 bg-[#171717] p-1 rounded-lg border border-white/10 w-fit flex-wrap">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "profile"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <User size={16} />
                        Profile
                    </button>

                    <button
                        onClick={() => setActiveTab("company")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "company"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Building2 size={16} />
                        Company
                    </button>

                    {userProfile?.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab("team")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "team"
                                ? "bg-[#2a2a2a] text-white shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Users2 size={16} />
                            Team
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "history"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <History size={16} />
                        Logs
                    </button>

                    <button
                        onClick={() => setActiveTab("pricing")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "pricing"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <BadgeDollarSign size={16} />
                        Plans
                    </button>
                    <button
                        onClick={() => setActiveTab("billing")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "billing"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <CreditCard size={16} />
                        Billing
                    </button>
                    <button
                        onClick={() => setActiveTab("support")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "support"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <ArrowUpRight size={16} />
                        Support
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <form action={signout}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 transition-all"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </form>
                </div>
            </div>

            {activeTab === "profile" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CompanyDNAForm company={company} userProfile={userProfile} mode="profile" />
                </div>
            )}

            {activeTab === "history" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#171717] border border-white/10 rounded-xl p-6 h-[calc(100vh-140px)] flex flex-col">
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
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CompanyDNAForm company={company} userProfile={userProfile} mode="company" />
                </div>
            )}

            {activeTab === "team" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#171717] border border-white/10 rounded-xl p-6">
                    <UnifiedTeam initialActiveAgents={activeAgents} readOnly={userProfile?.role !== 'admin'} />
                </div>
            )}

            {activeTab === "pricing" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#171717] border border-white/10 rounded-xl p-6">
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
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5 min-h-[400px]">
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
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5 h-[400px]">
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
