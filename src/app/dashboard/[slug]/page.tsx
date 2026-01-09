import { AGENTS } from '@/lib/agents'
import { DashboardHeader } from '@/components/dashboard-header'
import { RightSidebar } from '@/components/right-sidebar'
import { redirect } from 'next/navigation'
import { getProspects } from '@/actions/outreach-actions'
import { ProspectsGrid } from '@/components/outreach/prospects-grid'
import { createClient } from '@/lib/supabase'

import { getICP } from '@/actions/outreach-icp-actions'
import { ICPForm } from '@/components/outreach/icp-form'

interface AgentPageProps {
    params: Promise<{
        slug: string
    }>
}

// ... imports
import { getChats } from '@/actions/audience-actions'
import { ChatList } from '@/components/audience/chat-list'

export default async function AgentPage({ params, searchParams }: AgentPageProps & { searchParams: Promise<{ chatId?: string }> }) {
    const { slug } = await params
    const { chatId } = await searchParams
    const agent = AGENTS.find(a => a.slug === slug)

    if (!agent) {
        redirect('/dashboard')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Agent-specific data fetching
    const isOutreach = slug === 'outreach'
    const isAudience = slug === 'audience-channels'

    let outreachData = null
    let hasICP = false
    let audienceChats = []

    if (isOutreach) {
        // Parallel fetching for performance
        const [prospects, icp] = await Promise.all([
            getProspects(),
            getICP()
        ])
        outreachData = prospects
        hasICP = !!icp
    }

    if (isAudience) {
        audienceChats = await getChats()
    }

    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            <DashboardHeader />

            <div className="flex flex-1 min-h-0">
                {/* Custom Layout for Audience: Left Sidebar for Chats, Right Sidebar becomes current chat */}
                {isAudience ? (
                    <div className="flex-1 flex min-w-0">
                        {/* Left List */}
                        <ChatList chats={audienceChats || []} />

                        {/* Center/Main Area acting as Empty State if no chat, or hidden on mobile if chat active? 
                            Actually, user said "Right side is the sidebar chat". 
                            So if a chat is selected, the RightSidebar handles the conversation.
                            What should be in the middle? 
                            User: "Do lado esquerdo, que é o centro da tela, vamos colocar os CHATS criados."
                            Wait. User said "Left side, which is the center of the screen".
                            And "Conversations ... we keep in the sidebar you created".
                            
                            If I put ChatList in the "center", what is on the "right"? RightSidebar.
                            So:
                            [ SidebarNav (Fixed) ] [ ChatList (Main Content) ] [ RightSidebar (Chat/Conversation) ]
                            
                            If that's the case:
                            DashboardLayout has SidebarNav.
                            Page has Main Content.
                            Inside Page:
                            If Audience -> Render ChatList as the main content.
                            RightSidebar -> Is already fixed on the right.
                        */}
                        <div className="flex-1 bg-black p-8 flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden mb-4">
                                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover grayscale" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Select a chat</h3>
                            <p className="max-w-xs text-sm">Choose a conversation from the list to start working with {agent.name}.</p>
                        </div>
                    </div>
                ) : (
                    // Default View (Outreach, etc)
                    <div className="flex-1 min-w-0 overflow-y-auto bg-black p-6 flex flex-col">
                        <h1 className="text-2xl font-bold mb-4 text-center"> {agent.role} Dashboard</h1>

                        {/* Conditional Content based on Agent */}
                        {isOutreach ? (
                            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8">
                                {/* Always show Form. Key forces reset when data loads/changes */}
                                <ICPForm
                                    key={hasICP ? 'edit' : 'create'}
                                    initialData={hasICP ? (await getICP()) : null}
                                />

                                {hasICP && (
                                    <>
                                        <div className="border-t border-white/10 my-4" />
                                        <div className="mb-4 flex items-center justify-between">
                                            <p className="text-gray-400 text-sm">Manage your prospecting list and track engagement.</p>
                                        </div>
                                        <ProspectsGrid data={outreachData || []} />
                                    </>
                                )}
                            </div>
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

                {/* Right Sidebar with Agent Context */}
                <RightSidebar
                    key={slug + (chatId || '')} // Re-mount if chat changes
                    userId={user?.id}
                    userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                    agent={{
                        name: agent.name,
                        avatarUrl: agent.avatar,
                        role: agent.role,
                        externalUrl: agent.externalUrl,
                        slug: agent.slug
                    }}
                    initialChatId={isAudience ? chatId : undefined}
                />
            </div>
        </div>
    )
}
