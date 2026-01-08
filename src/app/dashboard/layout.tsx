import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex">
            <Sidebar />
            <main className="flex-1 ml-64 bg-slate-950">
                {children}
            </main>
        </div>
    )
}
