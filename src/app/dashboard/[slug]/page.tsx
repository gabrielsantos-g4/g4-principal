import { AGENTS } from '@/lib/agents'
import { DashboardHeader } from '@/components/dashboard-header'
import { RightSidebar } from '@/components/right-sidebar'
import { redirect } from 'next/navigation'

interface AgentPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function AgentPage({ params }: AgentPageProps) {
    const { slug } = await params
    const agent = AGENTS.find(a => a.slug === slug)

    if (!agent) {
        redirect('/dashboard')
    }

    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            <DashboardHeader />

            <div className="flex flex-1 min-h-0">
                {/* Main Content (Mockup/Print) */}
                <div className="flex-1 overflow-y-auto bg-black p-6 flex flex-col items-center">
                    <h1 className="text-2xl font-bold mb-4">{agent.role} Dashboard</h1>
                    <div className="w-full max-w-5xl rounded-lg overflow-hidden border border-white/10 shadow-2xl">
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
                </div>

                {/* Right Sidebar with Agent Context */}
                <RightSidebar
                    key={slug}
                    agent={{
                        name: agent.name,
                        avatarUrl: agent.avatar,
                        role: agent.role,
                        externalUrl: agent.externalUrl
                    }}
                />
            </div>
        </div>
    )
}
