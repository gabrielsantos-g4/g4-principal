'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/dashboard/file-upload'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function ReportView() {
    const [loading, setLoading] = useState(false)
    const [reportGenerated, setReportGenerated] = useState(false)

    const handleFileSelect = async (file: File) => {
        setLoading(true)
        // Simulate upload/processing
        setTimeout(() => {
            setLoading(false)
            setReportGenerated(true)
        }, 2000)
    }

    if (reportGenerated) {
        return (
            <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete</h3>
                <p className="text-slate-400 mb-6">Your organic report is ready to view.</p>
                <div className="p-8 border border-white/10 rounded-lg bg-white/5 inline-block">
                    <p className="text-lg text-slate-300">Placeholder for Report Dashboard</p>
                    <p className="text-sm text-slate-500 mt-2">(Charts and stats would appear here)</p>
                </div>
                <div className="mt-8">
                    <button
                        onClick={() => setReportGenerated(false)}
                        className="text-[#1C73E8] hover:underline"
                    >
                        Upload another file
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-10">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-lg bg-white/5">
                    <Loader2 className="w-10 h-10 text-[#1C73E8] animate-spin mb-4" />
                    <p className="text-gray-300">Analyzing organic data...</p>
                </div>
            ) : (
                <div className="h-[60vh] flex items-center justify-center">
                    <FileUpload onFileSelect={handleFileSelect} loading={loading} />
                </div>
            )}
        </div>
    )
}
