"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableMultiSelect, Option } from "@/components/ui/searchable-multi-select"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { getCrmSettings } from "@/actions/crm/get-crm-settings"
import { updateQualificationQuestions } from "@/actions/crm/update-qualification-questions"

interface Param {
    field: string
    criteria: string
    format: string
}

const COMMON_ROLES: Option[] = [
    { label: "CEO / Founder", value: "ceo_founder" },
    { label: "C-Level (CTO, COO, CFO)", value: "c_level" },
    { label: "VP / Director", value: "vp_director" },
    { label: "Manager", value: "manager" },
    { label: "Individual Contributor", value: "individual_contributor" }
]

export function QualificationParametersForm() {
    // Fixed size 4 for the 4 questions req
    const [params, setParams] = useState<Param[]>([
        { field: "", criteria: "", format: "" },
        { field: "", criteria: "", format: "" },
        { field: "", criteria: "", format: "" },
        { field: "", criteria: "", format: "" }
    ])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const settings = await getCrmSettings()
            if (settings.qualification_questions && settings.qualification_questions.length > 0) {
                const loaded = settings.qualification_questions
                const safeLoaded = loaded.map((item: any) => {
                    if (typeof item === 'string') return { field: item, criteria: '', format: '' }
                    return { ...item, format: item.format || '' } as Param
                })

                const padded = [
                    safeLoaded[0] || { field: "", criteria: "", format: "" },
                    safeLoaded[1] || { field: "", criteria: "", format: "" },
                    safeLoaded[2] || { field: "", criteria: "", format: "" },
                    safeLoaded[3] || { field: "", criteria: "", format: "" }
                ]
                setParams(padded)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (index: number, key: keyof Param, value: string) => {
        const newParams = [...params]
        // If changing criteria, reset format to avoid incompatible data
        if (key === 'criteria' && value !== newParams[index].criteria) {
            newParams[index] = { ...newParams[index], criteria: value, format: "" }
        } else {
            newParams[index] = { ...newParams[index], [key]: value }
        }
        setParams(newParams)
    }

    const handleFormatChange = (index: number, value: any) => {
        const newParams = [...params]
        // Store complex data as JSON string in the 'format' field
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value
        newParams[index] = { ...newParams[index], format: stringValue }
        setParams(newParams)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const validParams = params.filter(p => p.field.trim() !== "" || p.criteria.trim() !== "")
            const res = await updateQualificationQuestions(validParams)
            if (res.success) {
                toast.success("Qualification parameters updated")
            } else {
                toast.error("Failed to update parameters")
            }
        } catch (error) {
            toast.error("Error saving")
        } finally {
            setSaving(false)
        }
    }

    const renderFormatInput = (param: Param, index: number) => {
        const type = param.criteria

        // Helper to parse existing JSON or return defaults
        const getJson = (defaultVal: any) => {
            try {
                return param.format ? JSON.parse(param.format) : defaultVal
            } catch {
                return defaultVal
            }
        }

        if (type === "Numeric Range") {
            const values = getJson({ min: "", max: "" })
            return (
                <div className="flex gap-2">
                    <Input
                        placeholder="Min"
                        value={values.min}
                        onChange={(e) => handleFormatChange(index, { ...values, min: e.target.value })}
                        className="bg-zinc-900 border-white/10 text-white"
                        type="number"
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <Input
                        placeholder="Max"
                        value={values.max}
                        onChange={(e) => handleFormatChange(index, { ...values, max: e.target.value })}
                        className="bg-zinc-900 border-white/10 text-white"
                        type="number"
                    />
                </div>
            )
        }

        if (type === "Date Range") {
            const values = getJson({ start: "", end: "" })
            return (
                <div className="flex gap-2">
                    <Input
                        value={values.start}
                        onChange={(e) => handleFormatChange(index, { ...values, start: e.target.value })}
                        className="bg-zinc-900 border-white/10 text-white"
                        type="date"
                        placeholder="Start Date"
                    />
                    <span className="text-gray-500 self-center">to</span>
                    <Input
                        value={values.end}
                        onChange={(e) => handleFormatChange(index, { ...values, end: e.target.value })}
                        className="bg-zinc-900 border-white/10 text-white"
                        type="date"
                        placeholder="End Date"
                    />
                </div>
            )
        }

        if (type === "Role") {
            const values: string[] = getJson([]) // Array of valid role values
            return (
                <SearchableMultiSelect
                    options={COMMON_ROLES}
                    value={values}
                    onChange={(newValues) => handleFormatChange(index, newValues)}
                    placeholder="Select roles..."
                    onCreateOption={(newVal) => {
                        // In a real app we might add to COMMON_ROLES state, but for now just allow selecting it
                        // The component handles custom values if we update options, but for simple storage:
                        // We can just treat it as a selected value that might not be in the list visualy 
                        // unless we update the list. 
                        // For simplicity, let's stick to predefined for now or handle custom logic if needed.
                        // Actually SearchableMultiSelect needs the option to be in the list to trigger 'onChange' 
                        // effectively with the ID unless we handle creation.
                        // Let's assume user picks from list or we accept the created value directly.
                    }}
                />
            )
        }

        // Default Text / Fallback
        return (
            <Input
                value={param.format}
                onChange={(e) => handleChange(index, 'format', e.target.value)}
                placeholder="Format / Criteria details"
                className="bg-zinc-900 border-white/10 text-white"
            />
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5 max-w-5xl">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-2">Qualification Parameters</h2>
                <p className="text-sm text-gray-400">
                    Define 4 parameters to determine if a lead is qualified or not.
                </p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 pb-2">
                    <div className="col-span-1 text-xs font-bold text-gray-500 uppercase">#</div>
                    <div className="col-span-3 text-xs font-bold text-gray-500 uppercase">Field Name (e.g. Budget)</div>
                    <div className="col-span-4 text-xs font-bold text-gray-500 uppercase">Expected Criteria Type</div>
                    <div className="col-span-4 text-xs font-bold text-gray-500 uppercase">Configuration</div>
                </div>

                {params.map((p, i) => {
                    const placeholders = [
                        { field: "Monthly Revenue" },
                        { field: "Company Size" },
                        { field: "Decision Maker Role" },
                        { field: "Timeline" }
                    ]
                    const ph = placeholders[i] || { field: "Custom field" }

                    return (
                        <div key={i} className="grid grid-cols-12 gap-4 items-start">
                            <div className="col-span-1 text-gray-500 text-xs font-mono pt-3">{i + 1}</div>
                            <div className="col-span-3">
                                <Input
                                    value={p.field}
                                    onChange={(e) => handleChange(i, 'field', e.target.value)}
                                    placeholder={ph.field}
                                    className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500 placeholder:text-gray-600"
                                />
                            </div>
                            <div className="col-span-4">
                                <Select
                                    value={["Text", "Date Range", "Numeric", "Numeric Range", "Role"].includes(p.criteria) ? p.criteria : undefined}
                                    onValueChange={(value) => handleChange(i, 'criteria', value)}
                                >
                                    <SelectTrigger className="bg-zinc-900 border-white/10 text-white focus:ring-blue-500">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Text">Text</SelectItem>
                                        <SelectItem value="Numeric">Numeric</SelectItem>
                                        <SelectItem value="Numeric Range">Numeric Range</SelectItem>
                                        <SelectItem value="Date Range">Date Range</SelectItem>
                                        <SelectItem value="Role">Role (Multi-select)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-4">
                                {renderFormatInput(p, i)}
                            </div>
                        </div>
                    )
                })}

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                    >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Parameters
                    </Button>
                </div>
            </div>
        </div>
    )
}
