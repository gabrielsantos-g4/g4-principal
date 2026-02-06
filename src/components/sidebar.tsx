import { createClient, createAdminClient } from '@/lib/supabase'
import { SidebarWrapper } from './sidebar-wrapper'
import { signout } from '@/app/login/actions'
import { LogOut, LayoutDashboard, FileText, User } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AGENTS } from '@/lib/agents'
import { SidebarNav } from './sidebar-nav'


export async function Sidebar() {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    // 1. Get Session User
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Get Profile Data
    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select(`
            id,
            empresa_id,
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
    let activeAgents = profile?.active_agents || null

    // RBAC: If member, inherit agents from Admin
    if (profile?.role === 'member' && profile?.empresa_id) {
        const { data: adminProfile } = await supabaseAdmin
            .from('main_profiles')
            .select('active_agents')
            .eq('empresa_id', profile.empresa_id)
            .in('role', ['admin', 'owner'])
            .limit(1)
            .maybeSingle()

        if (adminProfile?.active_agents) {
            console.log('[Sidebar] Inheriting agents from Admin:', adminProfile.active_agents)
            activeAgents = adminProfile.active_agents
        } else {
            console.log('[Sidebar] Admin has no active agents or Admin not found')
        }
    } else {
        console.log('[Sidebar] User is not member or no company. Role:', profile?.role)
    }

    console.log('[Sidebar] Final Active Agents:', activeAgents)

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
