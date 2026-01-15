import { ArrowUpRight, Building2 } from 'lucide-react'
import { CompanyDNADialog } from '@/components/company-dna-dialog'
import { getCompanyDNA } from '@/actions/company-actions'
import { HeaderTools } from '@/components/header-tools'
import { HeaderWorkflows } from '@/components/header-workflows'

export async function DashboardHeader() {
    const company = await getCompanyDNA()

    return (
        <div className="hidden md:flex justify-between items-center h-16 px-8 border-b border-white/10 shrink-0 bg-[#171717]">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-0.5 rounded flex items-center gap-2">
                    <span>⚠️</span> This platform and all agents are in beta.
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex gap-3 text-xs font-bold tracking-wider items-center">
                    <HeaderWorkflows />
                    <HeaderTools />
                    <CompanyDNADialog company={company}>
                        <button className="p-2 border border-white/20 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center h-9 w-9" title="Company DNA">
                            <Building2 size={16} />
                        </button>
                    </CompanyDNADialog>
                </div>
            </div>
        </div>
    )
}
