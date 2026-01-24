import { Sidebar } from '@/components/sidebar'
import { DashboardShell } from '@/components/dashboard-shell'
import { MainContent } from '@/components/main-content'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardShell>
            <div className="min-h-screen bg-[#09090b]">
                <Sidebar />
                <MainContent>
                    {children}
                </MainContent>
            </div>
        </DashboardShell>
    )
}

