'use client'

import { useState, useRef, useEffect } from 'react'
import { updateCompanyDNA } from '@/actions/company-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ExamplePill } from "@/components/ui/example-pill"

function AutoResizeTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [props.defaultValue, props.value])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
        props.onInput?.(e)
    }

    return (
        <textarea
            {...props}
            ref={textareaRef}
            onInput={handleInput}
            className={`${props.className} overflow-hidden`}
        />
    )
}

interface CompanyDNAFormProps {
    company: any
}

export function CompanyDNAForm({ company }: CompanyDNAFormProps) {
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
        }
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <p className="text-sm text-gray-500 mt-1 tracking-wide">Provide context information about the company. All agents will consult this information to work.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-[#171717] border border-white/10 p-8 rounded-xl">

                <div className="grid grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Company Name</label>
                        <input
                            name="company_name"
                            defaultValue={company?.name || ''}
                            placeholder="e.g., Acme Corp"
                            className="w-full bg-black/50 border border-white/10 rounded p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <p className="text-[10px] text-gray-500">Your company&apos;s legal or brand name</p>
                    </div>

                    {/* Company Website */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Company Website</label>
                        <input
                            name="website"
                            defaultValue={company?.company_website || ''}
                            placeholder="https://www.company.com"
                            className="w-full bg-black/50 border border-white/10 rounded p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <p className="text-[10px] text-gray-500">Primary company website URL</p>
                    </div>
                </div>

                {/* Useful Links */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        Useful Links
                        <ExamplePill content={`https://www.linkedin.com/company/acme-inc\nhttps://instagram.com/acme_inc\nhttps://acme.com/blog/our-story`} />
                    </label>
                    <AutoResizeTextarea
                        name="links"
                        defaultValue={company?.links?.join('\n') || ''}
                        placeholder={`https://www.linkedin.com/company/...\nhttps://instagram.com/...`}
                        rows={3}
                        className="w-full bg-black/50 border border-white/10 rounded p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed font-mono text-sm"
                    />
                    <p className="text-[10px] text-gray-500">One link per line (social media, resources, documentation, etc.)</p>
                </div>

                {/* ICP */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        About the Company / Product
                        <ExamplePill content={`We are Acme Inc, a B2B SaaS platform that helps e-commerce brands automate their customer support.\n\nOur primary problem we solve is the high cost and slow response time of manual support teams.\n\nTarget audience: COO's and CSMs at mid-market retailers.\n\nCompany size: 50-200 employees.\nAnnual Revenue: $20M - $30M.`} />
                    </label>
                    <AutoResizeTextarea
                        name="description"
                        defaultValue={company?.description || ''}
                        placeholder="Describe what the company does, what the product is, what problem it solves, etc."
                        rows={6}
                        className="w-full bg-black/50 border border-white/10 rounded p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                    />
                    <p className="text-[10px] text-gray-500">Describe what the company does, what the product is, what problem it solves, etc.</p>
                </div>

                {/* Brand Voice */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        Brand Voice & Copy Style
                        <ExamplePill content={`Tone: Professional, empathetic, yet authoritative.\nStyle: Use short sentences. Avoid jargon.\nDo: Focus on benefits. Use active verbs.\nDon't: Be overly casual or too academic.\nReference: Clean, clear, and helpful.`} />
                    </label>
                    <AutoResizeTextarea
                        name="brand_voice"
                        defaultValue={company?.brand_voice || ''}
                        placeholder="Describe the tone, style, and voice of the brand communication."
                        rows={4}
                        className="w-full bg-black/50 border border-white/10 rounded p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                    />
                    <p className="text-[10px] text-gray-500">Describe the tone, style, and voice of the brand communication.</p>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white text-black text-sm font-bold px-8 py-3 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    )
}
