import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, FileText, Calendar, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-8 text-white">Please login to view reports.</div>
    }

    // Fetch reports summary
    const { data: reports } = await supabase
        .from('ads_reports')
        .select('id, title, created_at, updated_at, status, total_spent, currency')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        My Reports
                    </h1>
                    <p className="text-slate-400 text-lg">History of saved analyses.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports?.map((report) => (
                        <Link href={`/dashboard/reports/${report.id}`} key={report.id} className="block group">
                            <Card className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-all hover:bg-slate-800/80 cursor-pointer h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 mb-2">
                                            <FileText size={24} />
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <CardTitle className="text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1" title={report.title}>
                                        {report.title || 'Untitled Report'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-500" />
                                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {report.total_spent !== null && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={14} className="text-slate-500" />
                                                <span className="font-mono text-slate-200">
                                                    {report.currency} {report.total_spent?.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center text-xs font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                        VIEW ANALYSIS <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {(!reports || reports.length === 0) && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-lg">
                            <p className="text-slate-500 mb-4">No saved reports found.</p>
                            <Link href="/dashboard" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                                Create New Analysis
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
