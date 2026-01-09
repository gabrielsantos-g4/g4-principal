'use client'

import { saveICP } from "@/actions/outreach-icp-actions"
import { useTransition, useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"

const HEADCOUNT_OPTIONS = [
    "Self-employed", "1–10", "11-50", "51-200", "201–500", "501–1000", "1001–5000", "5001–10,000", "10,000+"
]

const COMPANY_TYPE_OPTIONS = [
    "Privately Held", "Non Profit", "Public Company", "Partnership", "Self Owned", "Self Employed", "Educational Institution"
]

const FUNCTION_AREA_OPTIONS = [
    "Business Development", "Marketing", "Entrepreneurship", "Program and Project Management", "Sales", "Engineering",
    "Finance", "Accounting", "Administrative", "Arts and Design", "Community and Social Services", "Consulting",
    "Education", "Healthcare Services", "Human Resources", "Information Technology", "Legal", "Media and Communication",
    "Military and Protective Services", "Operations", "Product Management", "Purchasing", "Quality Assurance",
    "Real Estate", "Research", "Customer Success and Support"
]

const SENIORITY_LEVEL_OPTIONS = [
    "Owner / Partner", "Vice President", "Director", "CXO", "Senior", "Entry Level", "In Training",
    "Experienced Manager", "Entry Level Manager", "Strategic"
]

interface ICPData {
    company_headcount?: string[] | null
    example_ideal_companies?: string | null
    company_type?: string[] | null
    company_headquarter_location?: string | null
    function_or_area?: string[] | null
    job_title?: string | null
    seniority_level?: string[] | null
    additional_instruction?: string | null
}

interface ICPFormProps {
    initialData?: ICPData | null
}

export function ICPForm({ initialData }: ICPFormProps) {
    const [isPending, startTransition] = useTransition()

    // Helper to ensure array to prevent "crazy count" bug
    const toArray = (val: any): string[] => {
        if (!val) return []
        if (Array.isArray(val)) return val
        if (typeof val === 'string') {
            if (val.startsWith('[')) {
                try {
                    const parsed = JSON.parse(val)
                    if (Array.isArray(parsed)) return parsed
                } catch (e) { }
            }
            return [val]
        }
        return []
    }

    // State for Text Inputs (Controlled to sync with LocalStorage)
    const [textExamples, setTextExamples] = useState(initialData?.example_ideal_companies || "")
    const [textLocation, setTextLocation] = useState(initialData?.company_headquarter_location || "")
    const [textJobTitle, setTextJobTitle] = useState(initialData?.job_title || "")
    const [textInstructions, setTextInstructions] = useState(initialData?.additional_instruction || "")

    // State for MultiSelects
    const [headcount, setHeadcount] = useState<string[]>(toArray(initialData?.company_headcount))
    const [companyType, setCompanyType] = useState<string[]>(toArray(initialData?.company_type))
    const [functionArea, setFunctionArea] = useState<string[]>(toArray(initialData?.function_or_area))
    const [seniority, setSeniority] = useState<string[]>(toArray(initialData?.seniority_level))

    // Sync to LocalStorage for Chat Agent Access
    useEffect(() => {
        const formData = {
            company_headcount: headcount,
            example_ideal_companies: textExamples,
            company_type: companyType,
            company_headquarter_location: textLocation,
            function_or_area: functionArea,
            job_title: textJobTitle,
            seniority_level: seniority,
            additional_instruction: textInstructions
        }
        localStorage.setItem('outreach_icp_data', JSON.stringify(formData))
    }, [headcount, companyType, functionArea, seniority, textExamples, textLocation, textJobTitle, textInstructions])

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await saveICP(formData)
            if (result.error) {
                alert(result.error)
            }
        })
    }

    const isEditing = !!initialData

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Ideal Customer Profile</h2>
                <p className="text-gray-400">Define the core characteristics of your target audience to help us generate better prospects.</p>
            </div>

            <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-black">
                {/* Hidden Inputs for MultiSelect Arrays */}
                <input type="hidden" name="company_headcount" value={JSON.stringify(headcount)} />
                <input type="hidden" name="company_type" value={JSON.stringify(companyType)} />
                <input type="hidden" name="function_or_area" value={JSON.stringify(functionArea)} />
                <input type="hidden" name="seniority_level" value={JSON.stringify(seniority)} />

                {/* Row 1 */}
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Company headcount</label>
                    <p className="text-[10px] text-gray-500 mb-1">e.g., 50-200 employees</p>
                    <MultiSelect
                        options={HEADCOUNT_OPTIONS}
                        selected={headcount}
                        onChange={setHeadcount}
                        placeholder="Select headcount"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Example of ideal companies</label>
                    <p className="text-[10px] text-gray-500 mb-1">Clients you already have that are ideal</p>
                    <input
                        name="example_ideal_companies"
                        value={textExamples}
                        onChange={e => setTextExamples(e.target.value)}
                        type="text"
                        placeholder="Type here"
                        className="w-full bg-[#1A1A1A] text-gray-200 text-sm rounded bg-opacity-50 border border-white/10 p-2 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                {/* Row 2 */}
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Company type</label>
                    <p className="text-[10px] text-gray-500 mb-1">Lorem Ipsum</p>
                    <MultiSelect
                        options={COMPANY_TYPE_OPTIONS}
                        selected={companyType}
                        onChange={setCompanyType}
                        placeholder="Select type"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Headquarters location</label>
                    <p className="text-[10px] text-gray-500 mb-1">Type city, state, country or region</p>
                    <input
                        name="company_headquarter_location"
                        value={textLocation}
                        onChange={e => setTextLocation(e.target.value)}
                        type="text"
                        placeholder="Los angeles/CA"
                        className="w-full bg-[#1A1A1A] text-gray-200 text-sm rounded bg-opacity-50 border border-white/10 p-2 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                {/* Row 3 */}
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Function or Area</label>
                    <p className="text-[10px] text-gray-500 mb-1">e.g., Marketing, Sales, Engineering</p>
                    <MultiSelect
                        options={FUNCTION_AREA_OPTIONS}
                        selected={functionArea}
                        onChange={setFunctionArea}
                        placeholder="Select area"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Job title</label>
                    <p className="text-[10px] text-gray-500 mb-1">e.g., Marketing Director, VP of Sales</p>
                    <input
                        name="job_title"
                        value={textJobTitle}
                        onChange={e => setTextJobTitle(e.target.value)}
                        type="text"
                        placeholder="VP of Human Resource"
                        className="w-full bg-[#1A1A1A] text-gray-200 text-sm rounded bg-opacity-50 border border-white/10 p-2 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                {/* Row 4 */}
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Seniority level</label>
                    <p className="text-[10px] text-gray-500 mb-1">e.g., Manager, Director, VP, C-Level</p>
                    <MultiSelect
                        options={SENIORITY_LEVEL_OPTIONS}
                        selected={seniority}
                        onChange={setSeniority}
                        placeholder="Select level"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">Any additional instructions</label>
                    <p className="text-[10px] text-gray-500 mb-1">Any other details</p>
                    <input
                        name="additional_instruction"
                        value={textInstructions}
                        onChange={e => setTextInstructions(e.target.value)}
                        type="text"
                        placeholder="Type here"
                        className="w-full bg-[#1A1A1A] text-gray-200 text-sm rounded bg-opacity-50 border border-white/10 p-2 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#1C73E8] text-white text-sm px-6 py-2 rounded font-bold hover:bg-[#1557b0] transition-colors disabled:opacity-50 flex items-center"
                    >
                        {isPending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                        {isEditing ? "Update Configuration" : "Next Step"}
                    </button>
                </div>
            </form>
        </div>
    )
}
