import { ArrowUpRight } from 'lucide-react'
import { CompanyDNADialog } from '@/components/company-dna-dialog'
import { getCompanyDNA } from '@/actions/company-actions'

export async function DashboardHeader() {
    const company = await getCompanyDNA()

    return (
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/10 shrink-0 bg-black">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-0.5 rounded flex items-center gap-2">
                    <span>⚠️</span> This platform and all agents are in beta.
                </div>
            </div>
            <div className="flex gap-3 text-xs font-bold tracking-wider">
                <button className="px-4 py-2 border border-white/20 rounded hover:bg-white/5 transition-colors flex items-center gap-2 text-white">
                    <span className="mb-0.5">🏠</span> DASHBOARD
                </button>

                <CompanyDNADialog company={company}>
                    <button className="px-4 py-2 border border-white/20 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                        <span className="mb-0.5">🏢</span> COMPANY DNA
                    </button>
                </CompanyDNADialog>

                <button className="px-4 py-2 border border-white/20 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                    SUPPORT <ArrowUpRight size={14} />
                </button>
            </div>
        </div>
    )
}
