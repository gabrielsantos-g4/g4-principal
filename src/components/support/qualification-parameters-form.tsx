"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { getCrmSettings } from "@/actions/crm/get-crm-settings"
import { updateQualificationQuestions } from "@/actions/crm/update-qualification-questions"

interface Param {
    field: string
    criteria: string
}

export function QualificationParametersForm() {
    // Fixed size 4 for the 4 questions req
    const [params, setParams] = useState<Param[]>([
        { field: "", criteria: "" },
        { field: "", criteria: "" },
        { field: "", criteria: "" },
        { field: "", criteria: "" }
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
                    if (typeof item === 'string') return { field: item, criteria: '' }
                    return item as Param
                })

                const padded = [
                    safeLoaded[0] || { field: "", criteria: "" },
                    safeLoaded[1] || { field: "", criteria: "" },
                    safeLoaded[2] || { field: "", criteria: "" },
                    safeLoaded[3] || { field: "", criteria: "" }
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
        <div className="bg-[#111] p-6 rounded-lg border border-white/5 max-w-4xl">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-2">Qualification Parameters</h2>
                <p className="text-sm text-gray-400">
                    Define the 4 key criteria (Field & Correct Answer) that Jess uses to qualify leads.
                </p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 pb-2">
                    <div className="col-span-5 text-xs font-bold text-gray-500 uppercase">Field Name (e.g. Budget)</div>
                    <div className="col-span-7 text-xs font-bold text-gray-500 uppercase">Expected Criteria (e.g. {'>'} 5000)</div>
                </div>

                {params.map((p, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 text-gray-500 text-xs font-mono">{i + 1}</div>
                        <div className="col-span-4">
                            <Input
                                value={p.field}
                                onChange={(e) => handleChange(i, 'field', e.target.value)}
                                placeholder="Field name..."
                                className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-7">
                            <Input
                                value={p.criteria}
                                onChange={(e) => handleChange(i, 'criteria', e.target.value)}
                                placeholder="Expected response / Valid criteria..."
                                className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>
                ))}

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
