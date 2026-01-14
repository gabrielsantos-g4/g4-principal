import { createClient } from '@/lib/supabase'
import { SidebarWrapper } from './sidebar-wrapper'
import { signout } from '@/app/login/actions'
import { LogOut, LayoutDashboard, FileText, User } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AGENTS } from '@/lib/agents'
import { SidebarNav } from './sidebar-nav'
import { UserProfileMenu } from './user-profile-menu'

export async function Sidebar() {
    const supabase = await createClient()

    // 1. Get Session User
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
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
        <SidebarWrapper>
            {/* Header / Platform Title */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight">g4</span>
                    <span className="text-[10px] leading-tight text-gray-400 font-medium uppercase tracking-wider">
                        MULTI-B2B AI AGENT PLATFORM
                    </span>
                </div>
            </div>

            {/* Navigation (Client Component) */}
            <SidebarNav agents={AGENTS} />

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800">
                <UserProfileMenu
                    userName={userName}
                    companyName={companyName}
                    initials={initials}
                />
            </div>
        </SidebarWrapper>
    )
}
