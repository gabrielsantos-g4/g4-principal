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

    // 2. Get Profile Data (Name, Company, Role)
    // Server-side fetch, secure, uses RLS policy we set up
    const { data: profile } = await supabase
        .from('main_profiles')
        .select(`
            name,
            role,
            main_empresas (
                name
            )
        `)
        .eq('id', user.id)
        .single()

    const companies = profile?.main_empresas
    const company = Array.isArray(companies) ? companies[0] : companies
    const companyName = company?.name || 'My Company'
    const userName = profile?.name || user.email || 'User'
    // Get initials for avatar
    const initials = userName.substring(0, 2).toUpperCase()

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

            {/* User Info */}
            <div className="px-6 py-4 border-b border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
                        {initials}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-white text-sm font-medium truncate" title={userName}>
                            {userName}
                        </h3>
                        <p className="text-gray-500 text-[10px] truncate" title={companyName}>
                            {companyName}
                        </p>
                    </div>
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
