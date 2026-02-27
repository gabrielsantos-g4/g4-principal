export const dynamic = 'force-dynamic'

import { AGENTS } from '@/lib/agents'
import { DashboardHeader } from '@/components/dashboard-header'
import { RightSidebar } from '@/components/right-sidebar'
import { redirect } from 'next/navigation'
import { getProspects } from '@/actions/outreach-actions'
import { getDemands } from '@/actions/outreach/get-demands'
import { ProspectsGrid } from '@/components/outreach/prospects-grid'
import { createClient, createAdminClient } from '@/lib/supabase'

import { getICP, getSavedICPs } from '@/actions/outreach-icp-actions'
import { ICPForm } from '@/components/outreach/icp-form'
import { OutreachTabs } from '@/components/outreach/outreach-tabs'
import { getCompanyDNA } from '@/actions/company-actions'
import { OrchestratorTabs } from '@/components/orchestrator/orchestrator-tabs'

import { getChats } from '@/actions/audience-actions'
import { ChatList } from '@/components/audience/chat-list'

import { CrmDashboard } from '@/components/crm/crm-dashboard'
import { SupportDashboard } from '@/components/support/support-dashboard'
import { DesignVideoTabs } from '@/components/design/design-video-tabs'
import { BrianDashboard } from '@/components/strategy/brian-dashboard'
import { CompetitorList } from '@/components/competitors/competitor-list'
import { CompetitorForm } from '@/components/competitors/competitor-form'

import { getCompetitors, getCompetitor } from '@/actions/competitor-actions'
import { getTrainings } from '@/actions/training-actions'
import { getDesignRequests } from '@/actions/design-actions'
import { getInitiatives } from '@/actions/strategy-actions'
import { BiDashboard } from '@/components/bi/bi-dashboard'
import { getCrmSettings } from '@/actions/crm/get-crm-settings'

import { MobileDashboardLayout } from '@/components/mobile-dashboard-layout'
import { OrganicSocialDashboard } from '@/components/organic-social/organic-social-dashboard'
import { SeoDashboard } from '@/components/organic-search/seo-dashboard'
import { StrategyOverviewDashboard } from '@/components/strategy/strategy-overview-dashboard'
import { NotesScratchpad } from '@/components/common/notes-scratchpad'
import { PaidSocialDashboard } from '@/components/paid-social/paid-social-dashboard'
import { UserInboxDashboard } from '@/components/dashboard/user-inbox-dashboard'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { LandingPageEditor } from '@/components/landing-page/landing-page-editor'
import { getLandingPageContent } from '@/actions/landing-page-actions'

function InProgressResults() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm6.75-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v10.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V9.75zm6.75-3c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v13.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V6.75z" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">In Progress</p>
                <p className="text-xs text-slate-600 mt-1">Results will appear here as the agent delivers outputs</p>
            </div>
        </div>
    )
}

interface AgentPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function AgentPage({ params, searchParams }: AgentPageProps & { searchParams: Promise<{ chatId?: string, competitorId?: string, tab?: string, action?: string }> }) {
    const { slug } = await params
    const { chatId, competitorId, tab, action } = await searchParams
    const agent = AGENTS.find(a => a.slug === slug)
    // Debug: Force Rebuild 12345

    const isOrchestrator = !slug || slug === 'orchestrator'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isOutreach = slug === 'outreach'
    const isAudience = slug === 'jess-audience'
    const isBi = slug === 'emily-bi'

    // Declare variables at top scope
    let outreachData = null
    let outreachDemands: any[] = []
    let initialSavedIcps: any[] = []
    let icpData: any = null
    let hasICP = false
    let audienceChats: any[] = []
    let competitors: any[] = []
    let selectedCompetitor: any = null

    // Fetch data if needed based on the page
    if (isOrchestrator || isOutreach) {
        // We might want to show demands in orchestrator too, or just safely pass []
        // For now, let's keep fetching logic as is, but ensure variables exist.
        // If we want Orchestrator to have this data, we need to fetch it here or earlier.

        // Actually, looking at the code, fetching happens inside `if (isOutreach)`.
        // If isOrchestrator is true, these will remain empty arrays.
    }
    const isSupport = slug === 'customer-support'
    const isDesign = slug === 'design-video'
    const isCompetitors = slug === 'competitors-analysis'
    const isCrm = slug === 'crm'

    // Get company_id (Needed for all agents)
    const supabaseAdmin = await createAdminClient()
    let { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('id, empresa_id, active_agents, name, avatar_url, role, email, has_messaging_access')
        .eq('id', user?.id)
        .single()

    // RBAC: Each user sees only their own assigned agents.
    // Admins with null active_agents see ALL. Members always use their own list.
    const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'

    const companyId = profile?.empresa_id

    const { data: companyData } = companyId
        ? await supabaseAdmin.from('main_empresas').select('name').eq('id', companyId).single()
        : { data: null }

    const companyName = companyData?.name || 'Unknown Company'

    if (isOrchestrator) {
        // PERMISSION CHECK:
        // Only Admins/Owners can see the full Orchestrator Dashboard.
        // Members see a restricted message.
        if (profile?.role !== 'admin' && profile?.role !== 'owner') {
            return (
                <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center opacity-60">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Restricted Access</h3>
                        <p className="max-w-md text-sm text-gray-400">
                            The Orchestrator Dashboard is restricted to administrators.
                            Please contact your workspace owner for access.
                        </p>
                    </div>
                </div>
            )
        }

        const company = await getCompanyDNA()
        const crmSettings = await getCrmSettings(companyId)

        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <div className="flex-1 w-full h-full overflow-y-auto bg-black p-8">
                    <OrchestratorTabs
                        company={company}
                        activeAgents={profile?.active_agents || null}
                        userProfile={profile}
                        crmSettings={crmSettings}
                    />
                </div>
            </div>
        )
    }

    if (slug.startsWith('user-')) {
        const targetUserId = slug.replace('user-', '')
        const { data: targetProfile } = await supabaseAdmin
            .from('main_profiles')
            .select('id, name, role, avatar_url, has_messaging_access, active_agents, job_title')
            .eq('id', targetUserId)
            .single()

        // PERMISSION CHECK 1:
        // Only Admins can view other users' dashboards.
        // Members can only view their own.
        if (profile?.role !== 'admin' && profile?.id !== targetUserId) {
            return (
                <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center opacity-60">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Restricted Access</h3>
                        <p className="max-w-md text-sm text-gray-400">
                            You do not have permission to view {targetProfile?.name || 'this user'}'s inbox.
                        </p>
                    </div>
                </div>
            )
        }

        // PERMISSION CHECK 2:
        // Members viewing their own inbox must have messaging access enabled.
        const memberIsAdmin = profile?.role === 'admin' || profile?.role === 'owner'
        if (!memberIsAdmin && !profile?.has_messaging_access) {
            const firstName = (profile?.name || '').split(' ')[0] || 'there'
            return (
                <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center">
                        <h3 className="text-3xl font-medium text-white tracking-tight">
                            Hi {firstName}, what are we doing today?
                        </h3>
                        <p className="mt-3 text-sm text-slate-500">
                            Select an agent from the sidebar to get started.
                        </p>
                    </div>
                </div>
            )
        }

        if (!targetProfile) redirect('/dashboard')

        // If action=inbox requested, go directly to inbox
        if (action === 'inbox') {
            const crmSettings = await getCrmSettings(companyId)
            return (
                <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <UserInboxDashboard
                        user={user}
                        targetUser={targetProfile!}
                        companyId={slug === 'g4-start' ? 'e5e8020e-6246-444a-9c4c-70df62706346' : '0'}
                        crmSettings={crmSettings}
                        viewerProfile={profile}
                    />
                </div>
            )
        }

        // Default: show inline action selector
        const isAdminMember = targetProfile!.role === 'admin' || targetProfile!.role === 'owner'
        const memberActiveAgents: string[] | null = isAdminMember ? null : (targetProfile!.active_agents ?? [])
        const accessibleAgents = memberActiveAgents === null
            ? AGENTS
            : AGENTS.filter((a: any) => (memberActiveAgents as string[]).includes(a.id))
        const hasMessaging = isAdminMember || !!targetProfile!.has_messaging_access
        const avatarUrl = targetProfile!.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetProfile!.name)}&background=random`

        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                    {/* Header row: avatar + name + label */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img src={avatarUrl} alt={targetProfile!.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-white">{targetProfile!.name}</p>
                            <p className="text-xs text-slate-500">{(targetProfile as any).job_title || targetProfile!.role || 'Member'}</p>
                        </div>
                        <p className="ml-auto text-xs text-slate-500 font-semibold uppercase tracking-widest">What do you want to do?</p>
                    </div>

                    {/* Action grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {hasMessaging && (
                            <a
                                href={`/dashboard/${slug}?action=inbox`}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all group"
                            >
                                <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:border-blue-400/50 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">View conversations</p>
                                    <p className="text-xs text-slate-500 truncate">Open message inbox</p>
                                </div>
                            </a>
                        )}

                        {(accessibleAgents as any[]).map((ag: any) => (
                            <a
                                key={ag.id}
                                href={`/dashboard/${ag.slug}`}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/25 transition-all group"
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0 group-hover:border-white/30 transition-all">
                                    <img src={ag.avatar} alt={ag.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">{ag.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{ag.description}</p>
                                </div>
                            </a>
                        ))}

                        {!hasMessaging && accessibleAgents.length === 0 && (
                            <p className="text-xs text-slate-500 col-span-full py-4">This user has no accessible areas.</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (!agent) {
        redirect('/dashboard')
    }

    // RBAC: Guard direct URL access to agent dashboards.
    // Members with a restricted active_agents list cannot access unauthorized agents.
    if (!isAdmin && profile?.active_agents) {
        const permitted = profile.active_agents as string[]
        if (!permitted.includes(agent.id)) {
            return (
                <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center opacity-60">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Restricted Access</h3>
                        <p className="max-w-md text-sm text-gray-400">
                            You do not have permission to access this agent.
                            Please contact your administrator.
                        </p>
                    </div>
                </div>
            )
        }
    }

    if (isOutreach) {
        // Parallel fetching for performance
        const [prospects, icp, demands, savedIcps] = await Promise.all([
            getProspects(),
            getICP(),
            getDemands(),
            getSavedICPs()
        ])

        outreachData = prospects
        icpData = icp
        outreachDemands = demands
        initialSavedIcps = savedIcps
        hasICP = !!icp
    }

    if (isAudience) {
        audienceChats = await getChats()
    }

    if (isBi) {
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    <BiDashboard />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isCompetitors) {
        competitors = await getCompetitors()
        if (competitorId) {
            selectedCompetitor = await getCompetitor(competitorId)

            // Mock data for testing without database
            if (!selectedCompetitor && competitorId.startsWith('mock-')) {
                const mockCompetitors = [
                    {
                        id: 'mock-1',
                        user_id: 'mock-user',
                        name: 'Acme Corporation',
                        website: 'https://acme.com',
                        other_link: null,
                        instagram_profile: '@acmecorp',
                        linkedin_profile: '/company/acme',
                        youtube_channel: '/@acmechannel',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    {
                        id: 'mock-2',
                        user_id: 'mock-user',
                        name: 'TechCo Inc',
                        website: 'https://techco.io',
                        other_link: null,
                        instagram_profile: null,
                        linkedin_profile: '/company/techco',
                        youtube_channel: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]
                selectedCompetitor = mockCompetitors.find(c => c.id === competitorId) || null
            }
        }
    }



    if (slug === 'organic-social') {
        const organicSocialTabs = [
            { value: 'goal', label: 'Goal' },
            { value: 'planning', label: 'Planning' },
            { value: 'design', label: 'Design' },
            { value: 'publishing', label: 'Publishing' },
            { value: 'results', label: 'Results' }
        ]

        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader centerContent={<DashboardTabs tabs={organicSocialTabs} defaultValue="planning" />} />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    <OrganicSocialDashboard
                        activeTab={tab || 'planning'}
                        companyId={companyId || ''}
                        userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                    />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (slug === 'landing-page') {
        const savedContent = await getLandingPageContent(companyId)
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    <LandingPageEditor empresaId={companyId} initialContent={savedContent} />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (slug === 'organic-search' || slug === 'paid-search' || slug === 'utm-tracking') {
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center px-8">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 mb-1">
                            <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover grayscale opacity-60" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-300">{agent.name}</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs">This agent is currently under construction.</p>
                        </div>
                    </div>
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isCrm) {
        const crmTabs = [
            { value: 'pipeline', label: 'Pipeline' },
            { value: 'results', label: 'Results' }
        ]
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader centerContent={<DashboardTabs tabs={crmTabs} defaultValue="pipeline" />} />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    {tab === 'results' ? (
                        <InProgressResults />
                    ) : (
                        <CrmDashboard agent={agent} viewerProfile={profile} />
                    )}
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isSupport) {
        const trainings = await getTrainings()

        // Fetch wpp_name to use as the displayed name for the Jess agent
        const { data: empresaWpp } = await supabaseAdmin
            .from('main_empresas')
            .select('wpp_name')
            .eq('id', companyId)
            .single()

        // Override agent name with wpp_name if available
        const supportAgent = empresaWpp?.wpp_name && empresaWpp.wpp_name.trim() !== ''
            ? { ...agent, name: empresaWpp.wpp_name }
            : agent

        const supportTabs = [
            { value: 'omnichannel', label: 'Chats' },
            { value: 'training', label: 'Training' },
            { value: 'parameters', label: 'Parameters' },
            { value: 'connectors', label: 'Connections' },
            { value: 'results', label: 'Results' }
        ]

        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader centerContent={<DashboardTabs tabs={supportTabs} defaultValue="omnichannel" />} />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: supportAgent.name,
                                avatarUrl: supportAgent.avatar,
                                role: supportAgent.role,
                                externalUrl: supportAgent.externalUrl,
                                slug: supportAgent.slug,
                                description: supportAgent.description
                            }}
                        />
                    }
                >
                    <SupportDashboard
                        agent={supportAgent}
                        trainings={trainings}
                        companyId={companyId}
                        viewerProfile={profile}
                        crmSettings={await getCrmSettings(companyId)}
                        activeTab={tab || 'omnichannel'}
                    />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isDesign) {
        const designRequests = await getDesignRequests()

        const designTabs = [
            { value: 'design-request', label: 'Design Request' },
            { value: 'design-deliverables', label: 'Design Deliverables' },
            { value: 'video-request', label: 'Video Request' },
            { value: 'video-deliverables', label: 'Video Deliverables' },
            { value: 'results', label: 'Results' }
        ]

        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader centerContent={<DashboardTabs tabs={designTabs} defaultValue="design-request" />} />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    <DesignVideoTabs
                        initialRequests={designRequests}
                        company={profile ? { ...profile, ...await getCompanyDNA() } : null}
                        user={{
                            id: user?.id,
                            name: profile?.name || user?.email
                        }}
                        activeTab={tab || 'design-request'}
                    />
                </MobileDashboardLayout>
            </div>
        )
    }
    if (slug === 'paid-social') {
        const paidSocialTabs = [
            { value: 'setup', label: 'Setup' },
            { value: 'results', label: 'Results' },
            { value: 'import', label: 'Import data' },
            { value: 'settings', label: 'Settings' }
        ]
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader centerContent={<DashboardTabs tabs={paidSocialTabs} defaultValue="setup" />} />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    <PaidSocialDashboard initialTab={tab || 'setup'} />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (slug === 'strategy-overview') {
        const initiatives = await getInitiatives()
        const strategyTabs = [
            { value: 'overview', label: 'Overview' },
            { value: 'results', label: 'Results' }
        ]
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader centerContent={<DashboardTabs tabs={strategyTabs} defaultValue="overview" />} />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                            companyName={companyName}
                            userFullName={user?.user_metadata?.full_name || user?.user_metadata?.name || profile?.name || user?.email}
                        />
                    }
                >
                    {tab === 'results' ? <InProgressResults /> : <StrategyOverviewDashboard agent={agent} initialCards={initiatives} />}
                </MobileDashboardLayout>
            </div>
        )
    }

    if (slug === 'ceo-positioning') {
        const ceoTabs = [
            { value: 'overview', label: 'Overview' },
            { value: 'results', label: 'Results' }
        ]
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader centerContent={<DashboardTabs tabs={ceoTabs} defaultValue="overview" />} />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (chatId || '')}
                            userId={user?.id}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    {tab === 'results' ? <InProgressResults /> : <BrianDashboard agent={agent} />}
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isCompetitors) {
        return (
            <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
                    withCard={true}
                    rightSidebar={
                        <RightSidebar
                            key={slug + (competitorId || '')}
                            userId={user?.id}
                            companyId={companyId}
                            userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                            agent={{
                                name: agent.name,
                                avatarUrl: agent.avatar,
                                role: agent.role,
                                externalUrl: agent.externalUrl,
                                slug: agent.slug,
                                description: agent.description
                            }}
                        />
                    }
                >
                    <div className="flex flex-1 md:flex-row flex-col h-full bg-transparent">
                        {/* Competitor List (Left Sidebar) */}
                        <div className="w-full md:w-80 border-r border-white/10 md:h-full flex-none flex flex-col overflow-hidden">
                            <CompetitorList competitors={competitors} />
                        </div>

                        {/* Main Area - Form or Empty State */}
                        <div className="flex-1 md:h-full overflow-y-auto">
                            {selectedCompetitor ? (
                                <CompetitorForm competitor={selectedCompetitor} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                                    <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden mb-4">
                                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover grayscale" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Select a competitor</h3>
                                    <p className="max-w-xs text-sm">Choose a competitor from the list to start analyzing their presence.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </MobileDashboardLayout>
            </div>
        )
    }

    const defaultOutreachTab = (icpData || (outreachData && outreachData.length > 0)) ? 'leads' : 'targeting'
    const outreachTabs = [
        { value: 'targeting', label: 'Targeting (Demand)' },
        { value: 'leads', label: 'Leads List' },
        { value: 'results', label: 'Results' }
    ]

    return (
        <div className="h-full bg-black text-white font-sans flex flex-col overflow-hidden">
            <DashboardHeader centerContent={isOutreach ? <DashboardTabs tabs={outreachTabs} defaultValue={defaultOutreachTab} /> : undefined} />

            <MobileDashboardLayout
                withCard={true}
                rightSidebar={
                    <RightSidebar
                        key={slug + (chatId || '')} // Re-mount if chat changes
                        userId={user?.id}
                        companyId={companyId}
                        userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                        agent={{
                            name: agent.name,
                            avatarUrl: agent.avatar,
                            role: agent.role,
                            externalUrl: agent.externalUrl,
                            slug: agent.slug,
                            description: agent.description
                        }}
                        initialChatId={isAudience ? chatId : undefined}
                        companyName={companyName}
                        userFullName={user?.user_metadata?.full_name || user?.user_metadata?.name || profile?.name || user?.email}
                    />
                }
            >
                {/* Custom Layout for Audience: Left Sidebar for Chats, Right Sidebar becomes current chat (handled by logic but chat is RightSidebar essentially) */}
                {/* For Audience, the 'Content' tab should show the Chat List? The Chat tab shows the RightSidebar (Chat). Yes. */}
                {isAudience ? (
                    <div className="flex-1 flex flex-col md:flex-row min-w-0 h-full">
                        {/* Left List */}
                        <div className="w-full md:w-80 border-r border-white/10 h-full flex-none flex flex-col overflow-hidden">
                            <ChatList chats={audienceChats || []} />
                        </div>

                        {/* Center/Main Area - Notes */}
                        <div className="hidden md:flex flex-1 bg-black overflow-hidden relative">
                            <NotesScratchpad agentName={agent.name} />
                        </div>
                    </div>
                ) : tab === 'results' ? (
                    <InProgressResults />
                ) : (
                    // Default View (Outreach, etc)
                    <>
                        {isOutreach ? (
                            <OutreachTabs
                                initialIcp={icpData}
                                initialProspects={outreachData || []}
                                initialDemands={outreachDemands || []}
                                initialSavedIcps={initialSavedIcps || []}
                                activeTab={tab || defaultOutreachTab}
                            />
                        ) : (
                            // Default Print View for other agents
                            <div className="w-full h-full">
                                {agent.printUrl ? (
                                    <img
                                        src={agent.printUrl}
                                        alt={`${agent.role} Preview`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-sm">
                                        No preview available
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </MobileDashboardLayout>
        </div>
    )
}
