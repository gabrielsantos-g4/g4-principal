'use client'

import React, { useCallback, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onFileSelect: (file: File) => void
    loading?: boolean
    error?: string | null
}

export function FileUpload({ onFileSelect, loading = false, error = null }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0])
        }
    }, [onFileSelect])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0])
        }
    }, [onFileSelect])

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl"
            >
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-8">


                        <div
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
                                dragActive ? "border-[#1C73E8] bg-slate-800/50" : "border-slate-700 bg-slate-900 hover:bg-slate-800/30",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => !loading && document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".csv"
                                onChange={handleChange}
                                disabled={loading}
                            />

                            {loading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-10 h-10 text-[#1C73E8] animate-spin" />
                                    <p className="text-sm text-slate-400 font-medium">Processing File...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center gap-4 text-red-500">
                                    <AlertCircle className="w-10 h-10" />
                                    <p className="font-medium text-center px-4">{error}</p>
                                    <p className="text-xs text-slate-500">Click to try again</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 rounded-full bg-slate-800 border border-slate-700">
                                        <FileText className="w-8 h-8 text-[#1C73E8]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-200 font-medium text-lg">
                                            Drop CSV File
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                            <Upload className="w-4 h-4" />
                            <span>Supports LinkedIn Ads Export CSV</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
