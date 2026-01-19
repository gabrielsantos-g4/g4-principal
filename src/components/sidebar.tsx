import { createClient } from '@/lib/supabase'
import { SidebarWrapper } from './sidebar-wrapper'
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

    // 2. Get Profile Data
    const { data: profile } = await supabase
        .from('main_profiles')
        .select(`
            name,
            role,
            avatar_url,
            main_empresas (
                name
            )
        `)
        .eq('id', user?.id)
        .single()

    const companies = profile?.main_empresas
    const companyInfo = Array.isArray(companies) ? companies[0] : companies
    const companyName = companyInfo?.name || 'My Company'
    const userName = profile?.name || user?.email || 'User'
    const userRole = profile?.role || 'User'
    const userAvatar = profile?.avatar_url || '/gabriel-santos.png'

    return (
        <SidebarWrapper>
            {/* Navigation (Client Component) */}
            <SidebarNav
                agents={AGENTS}
                user={{
                    name: userName,
                    role: userRole,
                    avatar: userAvatar,
                    companyName: companyName
                }}
            />
        </SidebarWrapper>
    )
}
