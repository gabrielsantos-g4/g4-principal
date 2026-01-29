export const dynamic = 'force-dynamic'

import { AGENTS } from '@/lib/agents'
import { DashboardHeader } from '@/components/dashboard-header'
import { RightSidebar } from '@/components/right-sidebar'
import { redirect } from 'next/navigation'
import { getProspects } from '@/actions/outreach-actions'
import { getDemands } from '@/actions/outreach/get-demands'
import { ProspectsGrid } from '@/components/outreach/prospects-grid'
import { createClient } from '@/lib/supabase'

import { getICP } from '@/actions/outreach-icp-actions'
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

import { MobileDashboardLayout } from '@/components/mobile-dashboard-layout'
import { OrganicSocialDashboard } from '@/components/organic-social/organic-social-dashboard'
import { SeoDashboard } from '@/components/organic-search/seo-dashboard'
import { StrategyOverviewDashboard } from '@/components/strategy/strategy-overview-dashboard'
import { NotesScratchpad } from '@/components/common/notes-scratchpad'
import { PaidSocialDashboard } from '@/components/paid-social/paid-social-dashboard'

interface AgentPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function AgentPage({ params, searchParams }: AgentPageProps & { searchParams: Promise<{ chatId?: string, competitorId?: string }> }) {
    const { slug } = await params
    const { chatId, competitorId } = await searchParams
    const agent = AGENTS.find(a => a.slug === slug)
    // Debug: Force Rebuild 12345
    const isOrchestrator = slug === 'orchestrator'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Agent-specific data fetching
    const isOutreach = slug === 'outreach'
    const isAudience = slug === 'audience-channels'
    const isCrm = slug === 'crm'
    const isSupport = slug === 'customer-support'
    const isDesign = slug === 'design-video'
    const isCompetitors = slug === 'competitors-analysis'
    const isBi = slug === 'bi-data-analysis'

    // Get company_id (Needed for all agents)
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id, active_agents, name, avatar_url')
        .eq('id', user?.id)
        .single()

    const companyId = profile?.empresa_id

    if (isOrchestrator) {
        const company = await getCompanyDNA()

        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <div className="flex-1 w-full h-full overflow-y-auto bg-black p-8">
                    <OrchestratorTabs company={company} activeAgents={profile?.active_agents || null} userProfile={profile} />
                </div>
            </div>
        )
    }

    if (!agent) {
        redirect('/dashboard')
    }

    let outreachData = null
    let outreachDemands: any[] = []
    let hasICP = false
    let audienceChats: any[] = []
    let competitors: any[] = []
    let selectedCompetitor: any = null

    if (isOutreach) {
        // Parallel fetching for performance
        const [prospects, icp, demands] = await Promise.all([
            getProspects(),
            getICP(),
            getDemands()
        ])
        outreachData = prospects
        outreachDemands = demands
        hasICP = !!icp
    }

    if (isAudience) {
        audienceChats = await getChats()
    }

    if (isBi) {
        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <OrganicSocialDashboard />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (slug === 'organic-search') {
        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <SeoDashboard />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isCrm) {
        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <CrmDashboard agent={agent} />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isSupport) {
        const trainings = await getTrainings()

        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <div className="flex-1 w-full h-full overflow-hidden">
                        <SupportDashboard agent={agent} trainings={trainings} companyId={companyId} />
                    </div>
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isDesign) {
        const designRequests = await getDesignRequests()

        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <div className="flex-1 min-w-0 overflow-y-auto bg-black p-6">
                        <DesignVideoTabs initialRequests={designRequests} />
                    </div>
                </MobileDashboardLayout>
            </div>
        )
    }
    if (slug === 'paid-social') {
        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <div className="flex-1 w-full h-full overflow-hidden">
                        <PaidSocialDashboard />
                    </div>
                </MobileDashboardLayout>
            </div>
        )
    }

    if (slug === 'strategy-overview') {
        const initiatives = await getInitiatives()

        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <StrategyOverviewDashboard agent={agent} initialCards={initiatives} />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (slug === 'ceo-positioning') {
        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <BrianDashboard agent={agent} />
                </MobileDashboardLayout>
            </div>
        )
    }

    if (isCompetitors) {
        return (
            <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
                <DashboardHeader />
                <MobileDashboardLayout
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
                    <div className="flex flex-1 md:flex-row flex-col h-full bg-black">
                        {/* Competitor List (Left Sidebar) */}
                        <div className="w-full md:w-80 border-r border-white/10 md:h-full flex-none">
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

    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            <DashboardHeader />

            <MobileDashboardLayout
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
                        {/* On Mobile, Content tab shows List. Chat tab shows RightSidebar (which handles the chat UI) */}
                    </div>
                ) : (
                    // Default View (Outreach, etc)
                    <div className="flex-1 min-w-0 overflow-y-auto bg-black p-6 flex flex-col h-full">


                        {/* Conditional Content based on Agent */}
                        {isOutreach ? (
                            <OutreachTabs
                                initialIcp={hasICP ? await getICP() : null}
                                initialProspects={outreachData || []}
                                initialDemands={outreachDemands || []}
                            />
                        ) : (
                            // Default Print View for other agents
                            <div className="w-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                                {agent.printUrl ? (
                                    <img
                                        src={agent.printUrl}
                                        alt={`${agent.role} Preview`}
                                        className="w-full h-auto object-cover"
                                    />
                                ) : (
                                    <div className="h-96 w-full flex items-center justify-center bg-white/5 text-gray-400">
                                        No preview available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </MobileDashboardLayout>
        </div>
    )
}
