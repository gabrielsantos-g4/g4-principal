'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { updateCompanyDNA } from '@/actions/company-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CompanyDNAProps {
    company: any // Typed as any for simplicity, ideally should be a partial interface
    children: React.ReactNode
}

export function CompanyDNADialog({ company, children }: CompanyDNAProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const result = await updateCompanyDNA(formData)

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Company DNA updated successfully')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="bg-black border border-white/10 text-white sm:max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0 gap-0">
                <div className="p-6 pb-4 border-b border-white/10">
                    <DialogTitle className="text-lg font-bold tracking-wider">COMPANY DNA</DialogTitle>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Customize your AI context</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Company Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Company Name</label>
                        <input
                            name="company_name"
                            defaultValue={company?.name || ''}
                            placeholder="e.g., Acme Corp"
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <p className="text-[10px] text-gray-500">Your company's legal or brand name</p>
                    </div>

                    {/* Company Website */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Company Website</label>
                        <input
                            name="website"
                            defaultValue={company?.company_website || ''}
                            placeholder="https://www.company.com"
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <p className="text-[10px] text-gray-500">Primary company website URL</p>
                    </div>

                    {/* Useful Links */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Useful Links</label>
                        <textarea
                            name="useful_links"
                            defaultValue={company?.useful_links || ''}
                            placeholder={`LinkedIn: https://linkedin.com/company/...\nBlog: https://blog.company.com\nCase Studies: https://...`}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                        />
                        <p className="text-[10px] text-gray-500">One link per line (social media, resources, documentation, etc.)</p>
                    </div>

                    {/* ICP */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Ideal Customer Profile (ICP)</label>
                        <textarea
                            name="icp"
                            defaultValue={company?.ideal_customer_profile || ''}
                            placeholder={`Company size: 50-200 employees\nIndustry: B2B SaaS, Tech\nDecision makers: VP of Sales, CMO\nPain points: Manual processes, low conversion\nBudget range: $50K-$200K annually`}
                            rows={5}
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                        />
                        <p className="text-[10px] text-gray-500">Describe your ideal customer: size, industry, role, pain points, budget</p>
                    </div>

                    {/* Brand Voice */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Brand Voice & Copy Style</label>
                        <textarea
                            name="brand_voice"
                            defaultValue={company?.brand_voice || ''}
                            placeholder={`Tone: Professional yet conversational\nStyle: Direct and benefit-driven, avoid jargon\nLanguage: Use active voice, short sentences\nPersonality: Confident but not arrogant\nAvoid: Corporate speak, buzzwords, hype`}
                            rows={5}
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                        />
                        <p className="text-[10px] text-gray-500">Guide for messaging: tone, style, what to emphasize or avoid</p>
                    </div>

                    <div className="flex justify-start gap-4 pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-black text-xs font-bold px-6 py-3 rounded uppercase tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            Save Company DNA
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="bg-transparent border border-white/10 text-white text-xs font-bold px-6 py-3 rounded uppercase tracking-wider hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
