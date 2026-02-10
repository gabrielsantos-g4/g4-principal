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
            job_title,
            avatar_url,
            active_agents,
            email,
            main_empresas (
                name,
                team_order
            )
        `)
        .eq('id', user?.id)
        .single()

    const companies = profile?.main_empresas
    const companyData = Array.isArray(companies) ? companies[0] : companies
    const teamOrder = companyData?.team_order || []

    // 3. Fetch all human members of the company (to show in sidebar if reordered)
    const { data: humanMembers } = await supabaseAdmin
        .from('main_profiles')
        .select('id, name, role, job_title, avatar_url, has_messaging_access, email')
        .eq('empresa_id', profile?.empresa_id)

    // 4. Identify the Principal Orchestrator (Admin/Owner)
    // We take the first admin or owner found in the members list
    const principalMember = humanMembers?.sort((a, b) => {
        // Owner/Admin priority
        const aPri = (a.role === 'admin' || a.role === 'owner') ? 0 : 1;
        const bPri = (b.role === 'admin' || b.role === 'owner') ? 0 : 1;
        if (aPri !== bPri) return aPri - bPri;
        // Then by ID (created_at would be better but ID works for stable priority)
        return a.id.localeCompare(b.id);
    })[0];

    const orchestrator = principalMember || profile;

    const companyName = companyData?.name || 'My Company'
    const userName = orchestrator?.name || 'User'
    const userRole = orchestrator?.job_title || ((orchestrator?.role === 'admin' || orchestrator?.role === 'owner') ? 'Principal Orchestrator' : 'Member')
    const userAvatar = orchestrator?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`

    let activeAgents = profile?.active_agents || null

    // RBAC: If not admin/owner, inherit agents from Admin
    const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'
    if (!isAdmin && profile?.empresa_id) {
        const { data: adminProfile } = await supabaseAdmin
            .from('main_profiles')
            .select('active_agents')
            .eq('empresa_id', profile.empresa_id)
            .in('role', ['admin', 'owner'])
            .limit(1)
            .maybeSingle()

        if (adminProfile?.active_agents) {
            activeAgents = adminProfile.active_agents
        }
    }

    return (
        <SidebarWrapper>
            {/* Navigation (Client Component) */}
            <SidebarNav
                agents={AGENTS}
                activeAgents={activeAgents}
                teamOrder={teamOrder}
                humanMembers={humanMembers || []}
                user={{
                    id: orchestrator?.id || '',
                    name: userName,
                    role: userRole,
                    avatar: userAvatar,
                    companyName: companyName,
                    email: orchestrator?.email || ''
                }}
                loggedUser={{
                    id: profile?.id || '',
                    name: profile?.name || '',
                    role: profile?.role || ''
                }}
            />
        </SidebarWrapper>
    )
}
