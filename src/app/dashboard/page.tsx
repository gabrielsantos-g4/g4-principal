import { AgentsOverview } from "@/components/dashboard/agents-overview"
import { DashboardHeader } from "@/components/dashboard-header"
import { createClient, createAdminClient } from "@/lib/supabase"

export default async function DashboardPage() {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    let userName = ''
    if (user) {
        const { data: profile } = await supabaseAdmin
            .from('main_profiles')
            .select('name')
            .eq('id', user.id)
            .single()
        userName = profile?.name || user.user_metadata?.name || user.email || ''
    }

    return (
        <div className="flex flex-col h-full bg-[#09090b]">
            <DashboardHeader />
            <div className="flex-1 overflow-y-auto">
                <AgentsOverview userName={userName} />
            </div>
        </div>
    )
}
