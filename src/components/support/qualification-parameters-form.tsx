"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { getCrmSettings } from "@/actions/crm/get-crm-settings"
import { updateQualificationQuestions } from "@/actions/crm/update-qualification-questions"

interface Param {
    field: string
    criteria: string
    format: string
}

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
                // Determine if legacy string[] or new object[]
                // JSONB is flexible, but if we just migrated, it might be empty. 
                // If it was strings, we might need to migrate, but since it's fresh, we assume new structure.

                const loaded = settings.qualification_questions

                // Safe mapping in case of mixed data (though unlikely given dev flow)
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
        newParams[index] = { ...newParams[index], [key]: value }
        setParams(newParams)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Filter out entries where both field and criteria are empty to keep DB clean
            // If user clears a row, it disappears from DB. Gaps will be collapsed on reload.
            const validParams = params.filter(p => p.field.trim() !== "" || p.criteria.trim() !== "")

            const res = await updateQualificationQuestions(validParams)
            if (res.success) {
                toast.success("Qualification parameters updated")

                // Optional: Reload settings to reflect current DB state (collapsed gaps) or keep UI as is?
                // Keeping UI is better UX (don't jump rows while user looks at them).
                // But next reload will collapse them. That's fine.
            } else {
                toast.error("Failed to update parameters")
            }
        } catch (error) {
            toast.error("Error saving")
        } finally {
            setSaving(false)
        }
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
                    <div className="col-span-4 text-xs font-bold text-gray-500 uppercase">Expected Criteria (e.g. {'>'} 5000)</div>
                    <div className="col-span-4 text-xs font-bold text-gray-500 uppercase">Data Format (e.g. 11 digits)</div>
                </div>

                {params.map((p, i) => {
                    // B2B Market Standard Placeholders (English - US Context)
                    const placeholders = [
                        { field: "EIN (Employer ID)", criteria: "12-3456789", format: "9 digits" },
                        { field: "Monthly Revenue Range", criteria: "$20,000 - $50,000", format: "Numeric ($)" },
                        { field: "Company Size", criteria: "51-200 employees", format: "Number range" },
                        { field: "Lead Role", criteria: "Manager or VP", format: "Free text" }
                    ]
                    const ph = placeholders[i] || { field: "Custom field", criteria: "Validation criteria", format: "Expected format" }

                    return (
                        <div key={i} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1 text-gray-500 text-xs font-mono">{i + 1}</div>
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
                                    value={["Text", "Date", "Numeric", "Numeric Range"].includes(p.criteria) ? p.criteria : undefined}
                                    onValueChange={(value) => handleChange(i, 'criteria', value)}
                                >
                                    <SelectTrigger className="bg-zinc-900 border-white/10 text-white focus:ring-blue-500">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Text">Text</SelectItem>
                                        <SelectItem value="Date">Date</SelectItem>
                                        <SelectItem value="Numeric">Numeric</SelectItem>
                                        <SelectItem value="Numeric Range">Numeric Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-4">
                                <Input
                                    value={p.format}
                                    onChange={(e) => handleChange(i, 'format', e.target.value)}
                                    placeholder={ph.format}
                                    type={(() => {
                                        switch (p.criteria) {
                                            case 'Date': return 'date'
                                            case 'Numeric': return 'number'
                                            default: return 'text'
                                        }
                                    })()}
                                    className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500 placeholder:text-gray-600"
                                />
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
