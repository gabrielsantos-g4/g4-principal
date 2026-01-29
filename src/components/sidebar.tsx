import { createClient } from '@/lib/supabase'
import { SidebarWrapper } from './sidebar-wrapper'
import { signout } from '@/app/login/actions'
import { LogOut, LayoutDashboard, FileText, User } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AGENTS } from '@/lib/agents'
import { SidebarNav } from './sidebar-nav'


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
            avatar_url,
            active_agents,
            main_empresas (
                name
            )
        `)
        .eq('id', user?.id)
        .single()

    const companies = profile?.main_empresas
    // Supabase can return an array or object depending on relation type, but typically object for M-1
    // We treat it safely
    const companyData = Array.isArray(companies) ? companies[0] : companies
    const companyName = companyData?.name || 'My Company'
    const userName = profile?.name || 'User'
    const userRole = profile?.role || 'User'
    const userAvatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`
    const activeAgents = profile?.active_agents || null

    return (
        <SidebarWrapper>
            {/* Navigation (Client Component) */}
            <SidebarNav
                agents={AGENTS}
                activeAgents={activeAgents}
                user={{
                    name: userName,
                    role: userRole,
                    avatar: userAvatar,
                    companyName: companyName,
                    email: user?.email || ''
                }}
            />
        </SidebarWrapper>
    )
}
