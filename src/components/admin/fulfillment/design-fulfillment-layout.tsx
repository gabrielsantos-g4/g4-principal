'use client'

import { useState } from "react"
import { CompanySearchResult } from "@/actions/admin/fulfillment-actions"
import { UserCompanySelect } from "./user-company-select"
import { DesignFulfillmentGrid } from "./design-fulfillment-grid"
import { Building2, X } from "lucide-react"

export function DesignFulfillmentLayout() {
    const [selectedCompany, setSelectedCompany] = useState<CompanySearchResult | null>(null)

    const handleClearCompany = () => {
        setSelectedCompany(null)
    }

    return (
        <div className="flex flex-col h-full w-full">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Design Fulfillment</h1>
                <p className="text-gray-400">Manage design requests and delivery links for clients.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Left Column: Company Selection */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                            1. Select Client
                        </h2>

                        {selectedCompany ? (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 relative">
                                <button
                                    onClick={handleClearCompany}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-blue-500/20 p-2 rounded-md">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-blue-300 font-bold uppercase">Selected</div>
                                        <div className="font-bold text-white">{selectedCompany.name}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    ID: <span className="font-mono">{selectedCompany.id}</span>
                                </div>
                            </div>
                        ) : (
                            <UserCompanySelect onSelect={setSelectedCompany} />
                        )}
                    </div>
                </div>

                {/* Right Column: Grid Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111] border border-white/5 rounded-xl p-4 h-full min-h-[500px]">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                            2. Manage Requests
                        </h2>

                        {selectedCompany ? (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300 h-full flex flex-col">
                                <DesignFulfillmentGrid empresaId={selectedCompany.id} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-white/5 rounded-lg bg-white/[0.02]">
                                <div className="p-4 rounded-full bg-white/5 mb-3">
                                    <Building2 className="w-6 h-6 text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-300 mb-1">No Company Selected</h3>
                                <p className="text-sm text-gray-500 max-w-xs">
                                    Please select a client company from the left panel to view and manage their requests.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
