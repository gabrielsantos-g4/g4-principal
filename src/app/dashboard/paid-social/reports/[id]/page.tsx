import { createClient } from '@/lib/supabase'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch full report payload
    const { data: report, error } = await supabase
        .from('ads_reports')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !report) {
        notFound()
    }

    // The payload column contains the exact AdsReportData structure
    const reportData = report.payload

    return <DashboardClient initialData={reportData} />
}
