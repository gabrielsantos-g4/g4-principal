import { ArrowUpRight } from 'lucide-react'
import { CompanyDNADialog } from '@/components/company-dna-dialog'
import { getCompanyDNA } from '@/actions/company-actions'
import { createClient } from '@/lib/supabase'

export async function DashboardHeader() {
    const company = await getCompanyDNA()

    // 1. Get Session User
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Fallback or redirect if handled elsewhere (Sidebar handles main redirect)
        // redirect('/login') 
    }

    // 2. Get Profile Data
    const { data: profile } = await supabase
        .from('main_profiles')
        .select(`
            name,
            role,
            main_empresas (
                name
            )
        `)
        .eq('id', user?.id)
        .single()

    const companies = profile?.main_empresas
    const companyInfo = Array.isArray(companies) ? companies[0] : companies
    const companyName = companyInfo?.name || 'My Company'
    const userName = profile?.name || user?.email || 'User'
    const initials = userName.substring(0, 2).toUpperCase()

    return (
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/10 shrink-0 bg-black">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-0.5 rounded flex items-center gap-2">
                    <span>⚠️</span> This platform and all agents are in beta.
                </div>
            </div>
            <div className="flex items-center gap-6">
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

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
                        {initials}
                    </div>
                    <div className="overflow-hidden text-right">
                        <h3 className="text-white text-sm font-medium truncate leading-tight" title={userName}>
                            {userName}
                        </h3>
                        <p className="text-gray-500 text-[10px] truncate leading-tight" title={companyName}>
                            {companyName}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
