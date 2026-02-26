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
            has_messaging_access,
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
    const userRole = orchestrator?.job_title || ((orchestrator?.role === 'admin' || orchestrator?.role === 'owner') ? 'Orchestrador, Principal' : 'Member')
    const userAvatar = orchestrator?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`

    // RBAC: Each user sees only their own assigned agents.
    // Admins/owners with null active_agents see ALL agents.
    // Members always respect their own active_agents (empty list = see nothing).
    const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'
    const activeAgents = isAdmin
        ? (profile?.active_agents || null)
        : (profile?.active_agents ?? [])

    // Messaging access: admins always have it; members only if the flag is set.
    const hasMessagingAccess = isAdmin || !!((profile as any)?.has_messaging_access)

    // Sidebar human members visibility:
    // Admins see all human members.
    // Members only see themselves (they should not see other colleagues in their sidebar).
    const visibleHumanMembers = isAdmin
        ? (humanMembers || [])
        : (humanMembers || []).filter(m => m.id === profile?.id)

    // Fetch dynamic WA instance for "Jess" (customer support agent) override
    const { data: waInstance } = await supabaseAdmin
        .from('instance_wa_chaterly')
        .select('agent_name, avatar')
        .eq('empresa', profile?.empresa_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

    const dynamicAgents = AGENTS.map(agent => {
        if (agent.id === 'customer-jess') {
            return {
                ...agent,
                name: waInstance?.agent_name && waInstance.agent_name.trim() !== '' ? waInstance.agent_name : agent.name,
                avatar: waInstance?.avatar && waInstance.avatar.trim() !== '' ? waInstance.avatar : agent.avatar
            }
        }
        return agent
    })

    return (
        <SidebarWrapper>
            {/* Navigation (Client Component) */}
            <SidebarNav
                agents={dynamicAgents}
                activeAgents={activeAgents}
                teamOrder={teamOrder}
                humanMembers={visibleHumanMembers}
                hasMessagingAccess={hasMessagingAccess}
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
