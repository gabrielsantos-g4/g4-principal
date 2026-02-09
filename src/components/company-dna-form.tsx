'use client'

import { useState, useRef, useEffect } from 'react'
import { updateCompanyDNA } from '@/actions/company-actions'
import { toast } from 'sonner'
import { Loader2, Upload, User as UserIcon } from 'lucide-react'
import { ExamplePill } from "@/components/ui/example-pill"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    userProfile?: any
    mode: 'profile' | 'company'
}

export function CompanyDNAForm({ company, userProfile, mode }: CompanyDNAFormProps) {
    const [loading, setLoading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile?.avatar_url || null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setAvatarPreview(objectUrl)
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const result = await updateCompanyDNA(formData)

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Updated successfully')
        }
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                {mode === 'company' && (
                    <p className="text-sm text-gray-500 mt-1 tracking-wide">
                        Provide context information about the company. All agents will consult this information to work.
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className={`space-y-8 bg-[#171717] border border-white/10 p-8 rounded-xl ${mode === 'profile' ? 'max-w-lg' : ''}`}>

                {mode === 'profile' && (
                    <div className="flex flex-row items-center gap-8 max-w-lg">
                        {/* Profile Picture - Circular Drop Zone */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault()
                                e.currentTarget.classList.add('border-white', 'opacity-50')
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault()
                                e.currentTarget.classList.remove('border-white', 'opacity-50')
                            }}
                            onDrop={(e) => {
                                e.preventDefault()
                                e.currentTarget.classList.remove('border-white', 'opacity-50')
                                const file = e.dataTransfer.files?.[0]
                                if (file && file.type.startsWith('image/')) {
                                    const objectUrl = URL.createObjectURL(file)
                                    setAvatarPreview(objectUrl)

                                    if (fileInputRef.current) {
                                        const dataTransfer = new DataTransfer()
                                        dataTransfer.items.add(file)
                                        fileInputRef.current.files = dataTransfer.files
                                    }
                                } else if (file) {
                                    toast.error('Please upload an image file')
                                }
                            }}
                            onClick={handleAvatarClick}
                            className="relative group cursor-pointer shrink-0"
                        >
                            <Avatar className="h-24 w-24 border-2 border-white/10 group-hover:border-white/30 transition-all rounded-full overflow-hidden">
                                <AvatarImage src={avatarPreview || ''} className="object-cover" />
                                <AvatarFallback className="bg-white/5 text-gray-400">
                                    <UserIcon size={32} />
                                </AvatarFallback>
                            </Avatar>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={20} className="text-white mb-1" />
                                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Edit</span>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                name="avatar_file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* User Name & Instructions */}
                        <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">User Name</label>
                                {(() => {
                                    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner';
                                    return (
                                        <input
                                            name="user_name"
                                            defaultValue={userProfile?.name || ''}
                                            placeholder="John Doe"
                                            disabled={!isAdmin}
                                            className={`${!isAdmin ? 'text-gray-400 cursor-not-allowed' : 'text-white'} w-full bg-black/50 border border-white/10 rounded-md h-10 px-4 text-sm placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors`}
                                        />
                                    );
                                })()}
                            </div>
                            <p className="text-xs text-gray-500">
                                Click the avatar or drag and drop an image to update your profile picture.
                            </p>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Email</label>
                                <input
                                    defaultValue={userProfile?.email || ''}
                                    disabled
                                    className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-4 text-sm text-gray-400 placeholder-gray-600 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {mode === 'company' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-12 gap-6 items-end">
                            {/* Company Name */}
                            <div className="col-span-12 md:col-span-3 space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Company Name</label>
                                <input
                                    name="company_name"
                                    defaultValue={company?.name || ''}
                                    placeholder="e.g., Acme Corp"
                                    className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            {/* Company Website */}
                            <div className="col-span-12 md:col-span-3 space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Company Website</label>
                                <input
                                    name="website"
                                    defaultValue={company?.company_website || ''}
                                    placeholder="https://www.company.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            {/* Company Size */}
                            <div className="col-span-12 md:col-span-3 space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Your Company Size</label>
                                <Select name="company_size" defaultValue={company?.company_size || ''}>
                                    <SelectTrigger className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-sm text-white focus:ring-0 focus:ring-offset-0 focus:border-white/30 transition-colors">
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#171717] border-white/10 text-white">
                                        <SelectItem value="Self-employed">Self-employed</SelectItem>
                                        <SelectItem value="1-10">1–10</SelectItem>
                                        <SelectItem value="11-50">11–50</SelectItem>
                                        <SelectItem value="51-200">51–200</SelectItem>
                                        <SelectItem value="201-500">201–500</SelectItem>
                                        <SelectItem value="501-1000">501–1000</SelectItem>
                                        <SelectItem value="1001-5000">1001–5000</SelectItem>
                                        <SelectItem value="5001-10000">5001–10,000</SelectItem>
                                        <SelectItem value="10000+">10,000+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Main Goal */}
                            <div className="col-span-12 md:col-span-3 space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Goal / Ideal Scenario</label>
                                <input
                                    name="main_goal"
                                    defaultValue={company?.main_goal || ''}
                                    placeholder="e.g., Convert 1 new client per week"
                                    className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-4" />

                        <div className="grid grid-cols-12 gap-6 items-start">
                            {/* Useful Links */}
                            <div className="col-span-12 md:col-span-6 space-y-1.5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Useful Links</label>
                                    <ExamplePill content={`https://www.linkedin.com/company/acme-inc\nhttps://instagram.com/acme_inc\nhttps://acme.com/blog/our-story`} />
                                </div>
                                <AutoResizeTextarea
                                    name="useful_links"
                                    defaultValue={company?.useful_links || ''}
                                    placeholder={`https://www.linkedin.com/company/...\nhttps://instagram.com/...`}
                                    rows={4}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed font-mono text-xs"
                                />
                                <p className="text-[10px] text-gray-500">One link per line (social media, resources, documentation, etc.)</p>
                            </div>

                            {/* Main Challenge */}
                            <div className="col-span-12 md:col-span-6 space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Main Challenge</label>
                                <AutoResizeTextarea
                                    name="main_challenge"
                                    defaultValue={company?.main_challenge || ''}
                                    placeholder="e.g., High churn rate due to poor onboarding."
                                    rows={4}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                                />
                                <p className="text-[10px] text-gray-500">Keep this always updated with the main difficulty or challenge you are facing in the marketing and sales area.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6 items-start">
                            {/* ICP */}
                            <div className="col-span-12 md:col-span-6 space-y-1.5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                        About the Company / Product
                                    </label>
                                    <ExamplePill content={`We are Acme Inc, a B2B SaaS platform that helps e-commerce brands automate their customer support.\n\nOur primary problem we solve is the high cost and slow response time of manual support teams.\n\nTarget audience: COO's and CSMs at mid-market retailers.\n\nCompany size: 50-200 employees.\nAnnual Revenue: $20M - $30M.`} />
                                </div>
                                <AutoResizeTextarea
                                    name="icp"
                                    defaultValue={company?.ideal_customer_profile || ''}
                                    placeholder="e.g., B2B SaaS platform helping e-commerce brands automate support. Target audience: COO's at mid-market retailers."
                                    rows={5}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                                />
                                <p className="text-[10px] text-gray-500">Describe what the company does, what the product is, what problem it solves, etc.</p>
                            </div>

                            {/* Brand Voice */}
                            <div className="col-span-12 md:col-span-6 space-y-1.5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                        Brand Voice & Copy Style
                                    </label>
                                    <ExamplePill content={`Tone: Professional, empathetic, yet authoritative.\nStyle: Use short sentences. Avoid jargon.\nDo: Focus on benefits. Use active verbs.\nDon't: Be overly casual or too academic.\nReference: Clean, clear, and helpful.`} />
                                </div>
                                <AutoResizeTextarea
                                    name="brand_voice"
                                    defaultValue={company?.brand_voice || ''}
                                    placeholder="e.g., Professional, empathetic, yet authoritative. Use short sentences and avoid jargon."
                                    rows={5}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                                />
                                <p className="text-[10px] text-gray-500">Describe the tone, style, and voice of the brand communication.</p>
                            </div>
                        </div>
                    </div>
                )}

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
