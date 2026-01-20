'use client'

import { saveICP } from "@/actions/outreach-icp-actions"
import { requestResearch } from "@/actions/outreach/request-research"
import { useTransition, useState, useEffect } from "react"
import { Loader2, Plus, Users, Building2, Briefcase, MonitorSmartphone, MapPin, Badge, Building, FileText } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"
import { toast } from "sonner"
import { OutreachDemandsList } from "./outreach-demands-list"

const HEADCOUNT_OPTIONS = [
    "Self-employed", "1–10", "11-50", "51-200", "201–500", "501–1000", "1001–5000", "5001–10,000", "10,000+"
].map(opt => ({ value: opt, label: opt }))

const COMPANY_TYPE_OPTIONS = [
    "Privately Held", "Non Profit", "Public Company", "Partnership", "Self Owned", "Self Employed", "Educational Institution"
].map(opt => ({ value: opt, label: opt }))

const FUNCTION_AREA_OPTIONS = [
    "Business Development", "Marketing", "Entrepreneurship", "Program and Project Management", "Sales", "Engineering",
    "Finance", "Accounting", "Administrative", "Arts and Design", "Community and Social Services", "Consulting",
    "Education", "Healthcare Services", "Human Resources", "Information Technology", "Legal", "Media and Communication",
    "Military and Protective Services", "Operations", "Product Management", "Purchasing", "Quality Assurance",
    "Real Estate", "Research", "Customer Success and Support"
].map(opt => ({ value: opt, label: opt }))

const SENIORITY_LEVEL_OPTIONS = [
    "Owner / Partner", "Vice President", "Director", "CXO", "Senior", "Entry Level", "In Training",
    "Experienced Manager", "Entry Level Manager", "Strategic"
].map(opt => ({ value: opt, label: opt }))

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
    initialDemands?: any[]
}

export function ICPForm({ initialData, initialDemands = [] }: ICPFormProps) {
    const [isPending, startTransition] = useTransition()
    const [isRequesting, startRequestTransition] = useTransition()

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
                toast.error(result.error)
            } else {
                toast.success("Configuration updated successfully")
            }
        })
    }

    const handleRequestResearch = () => {
        startRequestTransition(async () => {
            const result = await requestResearch()
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Research requested successfully!")
            }
        })
    }

    const isEditing = !!initialData

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">About the Company / Product</h2>
                <p className="text-gray-400">Define the core characteristics of your target audience to help us generate better prospects.</p>
            </div>

            <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-6 bg-transparent">
                {/* Hidden Inputs for MultiSelect Arrays */}
                <input type="hidden" name="company_headcount" value={JSON.stringify(headcount)} />
                <input type="hidden" name="company_type" value={JSON.stringify(companyType)} />
                <input type="hidden" name="function_or_area" value={JSON.stringify(functionArea)} />
                <input type="hidden" name="seniority_level" value={JSON.stringify(seniority)} />

                {/* Row 1: 3 Columns (Headcount, Type, Seniority) */}
                <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <Users className="w-4 h-4 text-[#1C73E8]" />
                        Company headcount
                    </label>
                    <MultiSelect
                        options={HEADCOUNT_OPTIONS}
                        value={headcount}
                        onChange={setHeadcount}
                        placeholder="Select headcount"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <Building2 className="w-4 h-4 text-[#1C73E8]" />
                        Company type
                    </label>
                    <MultiSelect
                        options={COMPANY_TYPE_OPTIONS}
                        value={companyType}
                        onChange={setCompanyType}
                        placeholder="Select type"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <Briefcase className="w-4 h-4 text-[#1C73E8]" />
                        Seniority level
                    </label>
                    <MultiSelect
                        options={SENIORITY_LEVEL_OPTIONS}
                        value={seniority}
                        onChange={setSeniority}
                        placeholder="Select level"
                    />
                </div>

                {/* Row 2: 2 Columns (Function, Location) */}
                <div className="space-y-2 md:col-span-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <MonitorSmartphone className="w-4 h-4 text-[#1C73E8]" />
                        Function or Area
                    </label>
                    <MultiSelect
                        options={FUNCTION_AREA_OPTIONS}
                        value={functionArea}
                        onChange={setFunctionArea}
                        placeholder="Select area"
                    />
                </div>

                <div className="space-y-2 md:col-span-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <MapPin className="w-4 h-4 text-[#1C73E8]" />
                        Headquarters location
                    </label>
                    <div className="relative">
                        <input
                            name="company_headquarter_location"
                            value={textLocation}
                            onChange={e => setTextLocation(e.target.value)}
                            type="text"
                            placeholder="e.g. Los Angeles/CA"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                    </div>
                </div>

                {/* Row 3: 2 Columns (Job Title, Examples) */}
                <div className="space-y-2 md:col-span-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <Badge className="w-4 h-4 text-[#1C73E8]" />
                        Job title
                    </label>
                    <textarea
                        name="job_title"
                        value={textJobTitle}
                        onChange={e => setTextJobTitle(e.target.value)}
                        placeholder="e.g. VP of Human Resources"
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none"
                    />
                </div>

                <div className="space-y-2 md:col-span-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <Building className="w-4 h-4 text-[#1C73E8]" />
                        Example of ideal companies
                    </label>
                    <textarea
                        name="example_ideal_companies"
                        value={textExamples}
                        onChange={e => setTextExamples(e.target.value)}
                        placeholder="List specific companies you want to target..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none"
                    />
                </div>

                {/* Row 4: Full Width (Instructions) */}
                <div className="space-y-2 md:col-span-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <FileText className="w-4 h-4 text-[#1C73E8]" />
                        Any additional instructions
                    </label>
                    <textarea
                        name="additional_instruction"
                        value={textInstructions}
                        onChange={e => setTextInstructions(e.target.value)}
                        placeholder="Any other criteria or context for the AI researcher..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="md:col-span-6 flex justify-end mt-4 gap-3 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={handleRequestResearch}
                        disabled={isRequesting}
                        className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Request Research
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 text-sm font-bold text-white bg-[#1C73E8] rounded-lg hover:bg-[#1557b0] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Update Configuration
                    </button>
                </div>
            </form>

            <OutreachDemandsList demands={initialDemands} />
        </div>
    )
}
