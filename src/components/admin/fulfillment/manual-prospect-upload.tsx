'use client'

import { useState, useCallback } from "react"
import { uploadProspects } from "@/actions/admin/fulfillment-actions"
import { Loader2, Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { cn } from "@/lib/utils"

interface ManualProspectUploadProps {
    empresaId: string
}

export function ManualProspectUpload({ empresaId }: ManualProspectUploadProps) {
    const [isPending, setIsPending] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const parseFile = async (file: File) => {
        setError(null)
        setParsedData([])

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const json = XLSX.utils.sheet_to_json(sheet)

                if (json.length === 0) {
                    setError("File appears to be empty")
                    return
                }

                // Map and sanitize the data
                const sanitizedData = json.map((row: any) => {
                    const findValue = (...keys: string[]) => {
                        for (const k of keys) {
                            if (row[k] !== undefined && row[k] !== null && row[k] !== "") return String(row[k]).trim()
                        }
                        return null
                    }

                    return {
                        company_name: findValue('company_name', 'Company Name', 'Empresa', 'Nome da Empresa'),
                        decisor_name: findValue('decisor_name', 'Decisor Name', 'Decisor', 'Nome do Decisor', 'Name', 'Nome'),
                        role: findValue('role', 'Role', 'Cargo'),
                        phone_1: findValue('phone_1', 'Phone 1', 'Phone', 'Telefone 1', 'Telefone', 'Mobile', 'Celular'),
                        phone_2: findValue('phone_2', 'Phone 2', 'Telefone 2'),
                        email_1: findValue('email_1', 'Email 1', 'Email', 'E-mail'),
                        email_2: findValue('email_2', 'Email 2'),
                        linkedin_profile: findValue('linkedin_profile', 'LinkedIn Profile', 'LinkedIn', 'Perfil LinkedIn', 'Url', 'URL'),
                        status: 'Pending'
                    }
                })

                // Filter out completely empty rows
                const validRows = sanitizedData.filter(row =>
                    row.company_name || row.decisor_name || row.email_1 || row.linkedin_profile
                )

                if (validRows.length === 0) {
                    setError("No valid rows found. Please check your column headers.")
                    return
                }

                setParsedData(validRows)
            } catch (err) {
                console.error(err)
                setError("Failed to parse file. Make sure it's a valid Excel or CSV.")
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            setFile(droppedFile)
            parseFile(droppedFile)
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            parseFile(selectedFile)
        }
    }

    const handleUpload = async () => {
        if (!parsedData.length) return

        setIsPending(true)
        const res = await uploadProspects(empresaId, parsedData)
        setIsPending(false)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(`Successfully uploaded ${res.success ? res.count : 0} prospects`)
            setFile(null)
            setParsedData([])
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/50">Upload Excel or CSV</h3>
                <p className="text-xs text-gray-500">
                    Supported formats: .xlsx, .xls, .csv. First row must be headers.
                </p>
                <p className="text-xs text-gray-500 font-mono">
                    Expected Headers: company_name, decisor_name, role, email_1, email_2, phone_1, phone_2, linkedin_profile
                </p>
            </div>

            <div
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                    dragActive ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 bg-white/5",
                    file ? "border-green-500/50 bg-green-500/5" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleChange}
                />

                {!file ? (
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white/20" />
                        <span className="text-sm font-medium text-white/70">Click to upload or drag and drop</span>
                        <span className="text-xs text-white/30">MAX. 5MB</span>
                    </label>
                ) : (
                    <div className="flex flex-col items-center gap-2 relative">
                        <FileSpreadsheet className="w-8 h-8 text-green-500" />
                        <span className="text-sm font-medium text-white">{file.name}</span>
                        <span className="text-xs text-white/50">{(file.size / 1024).toFixed(1)} KB</span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setFile(null)
                                setParsedData([])
                            }}
                            className="absolute -top-2 -right-2 bg-red-500/20 text-red-500 p-1 rounded-full hover:bg-red-500/40"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {parsedData.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-white">Ready to upload <span className="font-bold text-white">{parsedData.length}</span> rows</span>
                        </div>
                        <span className="text-xs text-white/30 font-mono">
                            Columns: {Object.keys(parsedData[0] || {}).join(', ')}
                        </span>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Execute Upload"}
                    </button>
                </div>
            )}
        </div>
    )
}
