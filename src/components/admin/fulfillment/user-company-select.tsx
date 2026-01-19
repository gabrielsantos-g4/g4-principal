'use client'

import { useState, useTransition, useEffect } from "react"
import { searchCompanies, CompanySearchResult } from "@/actions/admin/fulfillment-actions"
import { Loader2, Search, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserCompanySelectProps {
    onSelect: (company: CompanySearchResult) => void
}

export function UserCompanySelect({ onSelect }: UserCompanySelectProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<CompanySearchResult[]>([])
    const [isPending, startTransition] = useTransition()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    // Search function checks query length inside, or if empty returns defaults
    const performSearch = (term: string) => {
        startTransition(async () => {
            const data = await searchCompanies(term)
            setResults(data)
            setIsOpen(true)
        })
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (company: CompanySearchResult) => {
        setSelectedId(company.id)
        setQuery(company.name)
        setIsOpen(false)
        onSelect(company)
    }

    return (
        <div className="space-y-4 relative">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setSelectedId(null)
                    }}
                    onFocus={() => {
                        if (results.length === 0) {
                            performSearch("")
                        } else {
                            setIsOpen(true)
                        }
                    }}
                    placeholder="Type to search company..."
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-md pl-10 pr-10 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {isPending && (
                    <div className="absolute right-3 top-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {results.map((company) => (
                        <div
                            key={company.id}
                            onClick={() => handleSelect(company)}
                            className={cn(
                                "flex items-start justify-between p-3 cursor-pointer transition-all border-b border-white/5 last:border-0",
                                selectedId === company.id
                                    ? "bg-blue-500/10"
                                    : "hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="bg-white/5 p-2 rounded-md">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-none mb-1">{company.name}</h3>
                                    <div className="space-y-1">
                                        {company.users.map(u => (
                                            <div key={u.id} className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <User className="w-3 h-3" />
                                                <span>{u.email}</span>
                                            </div>
                                        ))}
                                        {company.users.length === 0 && (
                                            <span className="text-xs text-yellow-500">No users linked</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
