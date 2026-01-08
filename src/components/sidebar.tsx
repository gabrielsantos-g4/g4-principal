import { createClient } from '@/lib/supabase'
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

    return (
        <aside className="w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col h-screen fixed left-0 top-0 text-white font-sans">
            {/* Header / Platform Title */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight">g4</span>
                    <span className="text-[10px] leading-tight text-gray-400 font-medium uppercase tracking-wider">
                        MULTI-B2B <br /> AI AGENT PLATFORM
                    </span>
                </div>
            </div>

            {/* Navigation (Client Component) */}
            <SidebarNav agents={AGENTS} />

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-800">
                <form action={signout}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </form>
            </div>
        </aside>
    )
}
