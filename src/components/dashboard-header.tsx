import { ArrowUpRight, Calendar } from 'lucide-react'
import { HeaderTools } from '@/components/header-tools'

import { createClient, createAdminClient } from '@/lib/supabase'


export async function DashboardHeader({ centerContent }: { centerContent?: React.ReactNode } = {}) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    let userProfile = null
    if (user) {
        const { data } = await supabaseAdmin
            .from('main_profiles')
            .select('id, role')
            .eq('id', user.id)
            .single()
        userProfile = data
    }

    return (
        <div className="hidden md:flex items-center justify-between h-16 pl-8 pr-3 border-b border-white/10 shrink-0 bg-[#171717] sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-0.5 rounded flex items-center gap-2">
                    <span>⚠️</span> This platform and all agents are in beta.
                </div>
            </div>
            <div className="flex items-center gap-6">
                {centerContent}
                <div className="flex gap-3 text-xs font-bold tracking-wider items-center">
                    <HeaderTools userProfile={userProfile} />
                </div>
            </div>
        </div>
    )
}
