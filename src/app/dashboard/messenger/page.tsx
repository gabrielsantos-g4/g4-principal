import { getDashboardStats, getDashboardChartData, getRecentActivity } from "@/actions/messenger/dashboard-actions"
import { Overview } from "@/components/messenger/overview"
import { RecentActivity } from "@/components/messenger/recent-activity"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Users, Megaphone, CheckCheck } from "lucide-react"

export default async function MessengerDashboardPage() {
    const stats = await getDashboardStats()
    const chartData = await getDashboardChartData()
    const recentActivity = await getRecentActivity()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#1a1a1a] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Enviadas</CardTitle>
                        <Megaphone className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSent}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a1a] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Entregues</CardTitle>
                        <CheckCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats.delivered}</div>
                        <p className="text-xs text-gray-500">
                            {stats.deliveryRate.toFixed(1)}% taxa de entrega
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a1a] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Lidas</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">{stats.read}</div>
                        <p className="text-xs text-gray-500">
                            {stats.readRate.toFixed(1)}% taxa de leitura
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a1a] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Conversas Ativas</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">--</div>
                        <p className="text-xs text-gray-500">
                            Em breve
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-[#1a1a1a] border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Visão Geral</CardTitle>
                        <CardDescription className="text-gray-400">Desempenho dos disparos nos últimos 7 dias.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={chartData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-[#1a1a1a] border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                        <CardDescription className="text-gray-400">Últimas interações de mensagens.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity data={recentActivity} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
