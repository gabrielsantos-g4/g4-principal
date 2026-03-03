'use client'

import { useState, useRef } from 'react'
import {
    Layers, Zap, Image as ImageIcon, Plus, Trash2, Edit2,
    ChevronRight, Check, X, ArrowLeft, AlignLeft, Type,
    MousePointerClick, Settings2, MoreHorizontal, Circle,
    Film, FileText, LayoutGrid, Upload, ChevronLeft
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdStatus = 'draft' | 'review' | 'approved'
type GroupStatus = 'active' | 'paused' | 'archived'
type CampaignObjective =
    | 'Brand Awareness' | 'Website Visits' | 'Engagement' | 'Video Views'
    | 'Lead Generation' | 'Website Conversions' | 'Job Applicants'

type MediaType = 'image' | 'video' | 'carousel' | 'document'

interface AdCreative {
    id: string; name: string; text: string
    mediaType?: MediaType
    imageUrl?: string
    carouselUrls?: string[]
    videoUrl?: string
    documentUrl?: string
    documentName?: string
    mediaAspectRatio?: number    // width/height, e.g. 0.5625 = 9:16, 1.778 = 16:9
    headline: string; description: string; ctaButton: string; ctaUrl: string
    status: AdStatus
}

interface Campaign {
    id: string; groupId: string; name: string
    objective: CampaignObjective; audience: string
    budgetType: 'daily' | 'total'; budget: string
    startDate: string; endDate: string; ads: AdCreative[]
}

interface CampaignGroup {
    id: string; name: string; status: GroupStatus
}

// ─── Helpers / defaults ───────────────────────────────────────────────────────

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const defaultAd = (): AdCreative => ({
    id: uid(), name: 'New Ad', text: '', headline: '',
    description: '', ctaButton: 'Learn More', ctaUrl: '', status: 'draft',
    mediaType: undefined, imageUrl: undefined, carouselUrls: [], videoUrl: undefined,
    documentUrl: undefined, documentName: undefined, mediaAspectRatio: undefined,
})

// Detect pixel dimensions asynchronously and return width/height ratio
function detectImageRatio(url: string): Promise<number> {
    return new Promise(resolve => {
        const img = new window.Image()
        img.onload = () => resolve(img.naturalWidth / img.naturalHeight)
        img.onerror = () => resolve(16 / 9)
        img.src = url
    })
}
function detectVideoRatio(url: string): Promise<number> {
    return new Promise(resolve => {
        const v = document.createElement('video')
        v.onloadedmetadata = () => resolve(v.videoWidth / v.videoHeight)
        v.onerror = () => resolve(16 / 9)
        v.src = url
    })
}

const defaultCampaign = (groupId: string, n = 1): Campaign => ({
    id: uid(), groupId, name: `New Campaign ${n}`,
    objective: 'Website Visits', audience: '',
    budgetType: 'daily', budget: '', startDate: '', endDate: '',
    ads: [defaultAd()],
})

const defaultGroup = (n = 1): CampaignGroup => ({
    id: uid(), name: `Campaign Group ${n}`, status: 'active',
})

const OBJECTIVES: CampaignObjective[] = [
    'Brand Awareness', 'Website Visits', 'Engagement', 'Video Views',
    'Lead Generation', 'Website Conversions', 'Job Applicants',
]

const CTA_OPTIONS = [
    'Learn More', 'Sign Up', 'Register', 'Download', 'Apply Now',
    'Get Quote', 'Request Demo', 'Contact Us', 'Visit Website', 'Subscribe',
]

const STATUS_COLORS: Record<AdStatus, string> = {
    draft: 'text-slate-400 bg-slate-800',
    review: 'text-amber-300 bg-amber-500/15',
    approved: 'text-emerald-400 bg-emerald-500/15',
}

const GROUP_STATUS_COLOR: Record<GroupStatus, string> = {
    active: 'text-emerald-400',
    paused: 'text-amber-400',
    archived: 'text-slate-500',
}

// ─── Ad Editor Modal ──────────────────────────────────────────────────────────

function AdEditorPanel({ ad, onSave, onClose }: {
    ad: AdCreative; onSave: (a: AdCreative) => void; onClose: () => void
}) {
    const [local, setLocal] = useState<AdCreative>({ ...ad })
    const fileRef = useRef<HTMLInputElement>(null)
    const upd = (p: Partial<AdCreative>) => setLocal(prev => ({ ...prev, ...p }))

    return (
        <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f0f]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414] shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><ArrowLeft size={18} /></button>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ad Creative Editor</p>
                        <input
                            value={local.name}
                            onChange={e => upd({ name: e.target.value })}
                            className="bg-transparent text-white font-semibold text-base focus:outline-none border-b border-transparent focus:border-blue-500/50"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={local.status}
                        onChange={e => upd({ status: e.target.value as AdStatus })}
                        className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                    >
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="approved">Approved</option>
                    </select>
                    <button
                        onClick={() => { onSave(local); toast.success('Ad saved!') }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
                    >
                        <Check size={14} /> Save
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0">
                {/* Form */}
                <div className="w-[400px] shrink-0 border-r border-white/10 overflow-y-auto p-6 space-y-5">
                    {/* Text */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <AlignLeft size={11} /> Introductory Text
                        </label>
                        <textarea
                            value={local.text}
                            onChange={e => upd({ text: e.target.value })}
                            placeholder="Write your ad copy…"
                            rows={4}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-700 p-3 focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>
                    {/* ── Media ─────────────────────────────────── */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <ImageIcon size={11} /> Media
                        </label>

                        {/* Type selector */}
                        <div className="grid grid-cols-4 gap-1.5">
                            {([
                                { t: 'image', icon: <ImageIcon size={13} />, label: 'Image' },
                                { t: 'video', icon: <Film size={13} />, label: 'Video' },
                                { t: 'carousel', icon: <LayoutGrid size={13} />, label: 'Carousel' },
                                { t: 'document', icon: <FileText size={13} />, label: 'Document' },
                            ] as { t: MediaType; icon: React.ReactNode; label: string }[]).map(({ t, icon, label }) => (
                                <button key={t}
                                    onClick={() => upd({ mediaType: t, imageUrl: undefined, videoUrl: undefined, carouselUrls: [], documentUrl: undefined, documentName: undefined })}
                                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-semibold transition-all
                                        ${local.mediaType === t
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                            : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}
                                >
                                    {icon}{label}
                                </button>
                            ))}
                        </div>

                        {/* Upload zone — varies by type */}
                        {(!local.mediaType || local.mediaType === 'image') && (
                            <div onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[100px]">
                                {local.imageUrl ? (
                                    <div className="relative w-full">
                                        <img src={local.imageUrl} alt="" className="w-full rounded-lg max-h-36 object-cover" />
                                        <button onClick={e => { e.stopPropagation(); upd({ imageUrl: undefined }) }}
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500"><X size={12} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={20} className="text-slate-600 group-hover:text-blue-400" />
                                        <p className="text-xs text-slate-500">Click to upload image</p>
                                        <p className="text-[10px] text-slate-700">JPG, PNG, GIF · 1200×628px recommended</p>
                                    </>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                    onChange={async e => {
                                        const f = e.target.files?.[0]
                                        if (!f) return
                                        const url = URL.createObjectURL(f)
                                        const ratio = await detectImageRatio(url)
                                        upd({ mediaType: 'image', imageUrl: url, mediaAspectRatio: ratio })
                                    }} />
                            </div>
                        )}

                        {local.mediaType === 'video' && (
                            <div onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[100px]">
                                {local.videoUrl ? (
                                    <div className="relative w-full max-h-48 flex items-center justify-center overflow-hidden rounded-lg bg-black">
                                        <video src={local.videoUrl} controls
                                            className="max-h-48 max-w-full object-contain" />
                                        <button onClick={e => { e.stopPropagation(); upd({ videoUrl: undefined, mediaAspectRatio: undefined }) }}
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500"><X size={12} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <Film size={20} className="text-slate-600 group-hover:text-blue-400" />
                                        <p className="text-xs text-slate-500">Click to upload video</p>
                                        <p className="text-[10px] text-slate-700">MP4, MOV, AVI · Max 200MB</p>
                                    </>
                                )}
                                <input ref={fileRef} type="file" accept="video/*" className="hidden"
                                    onChange={async e => {
                                        const f = e.target.files?.[0]
                                        if (!f) return
                                        const url = URL.createObjectURL(f)
                                        const ratio = await detectVideoRatio(url)
                                        upd({ videoUrl: url, mediaAspectRatio: ratio })
                                    }} />
                            </div>
                        )}

                        {local.mediaType === 'carousel' && (
                            <div className="space-y-2">
                                {/* Carousel thumbnails */}
                                {(local.carouselUrls ?? []).length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {(local.carouselUrls ?? []).map((url, i) => (
                                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => upd({ carouselUrls: (local.carouselUrls ?? []).filter((_, j) => j !== i) })}
                                                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500"><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div onClick={() => fileRef.current?.click()}
                                    className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[80px]">
                                    <LayoutGrid size={18} className="text-slate-600 group-hover:text-blue-400" />
                                    <p className="text-xs text-slate-500">Add carousel slide</p>
                                    <p className="text-[10px] text-slate-700">Up to 10 images</p>
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                                    onChange={e => {
                                        const files = Array.from(e.target.files ?? [])
                                        const urls = files.map(f => URL.createObjectURL(f))
                                        upd({ carouselUrls: [...(local.carouselUrls ?? []), ...urls].slice(0, 10) })
                                        e.target.value = ''
                                    }} />
                            </div>
                        )}

                        {local.mediaType === 'document' && (
                            <div onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[100px]">
                                {local.documentUrl ? (
                                    <div className="flex items-center gap-3 w-full bg-white/5 rounded-lg px-4 py-3">
                                        <FileText size={28} className="text-blue-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{local.documentName}</p>
                                            <p className="text-[10px] text-slate-500">PDF Document</p>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); upd({ documentUrl: undefined, documentName: undefined }) }}
                                            className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <FileText size={20} className="text-slate-600 group-hover:text-blue-400" />
                                        <p className="text-xs text-slate-500">Click to upload PDF</p>
                                        <p className="text-[10px] text-slate-700">Max 100MB</p>
                                    </>
                                )}
                                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                                    onChange={e => {
                                        const f = e.target.files?.[0]
                                        if (f) upd({ documentUrl: URL.createObjectURL(f), documentName: f.name })
                                    }} />
                            </div>
                        )}
                    </div>

                    {/* Headline */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><Type size={11} /> Headline</label>
                        <input value={local.headline} onChange={e => upd({ headline: e.target.value })}
                            placeholder="e.g., Grow Your Business in 2026"
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-700 px-3 py-2 focus:outline-none focus:border-blue-500" />
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><Type size={11} /> Description <span className="text-slate-700 normal-case font-normal text-[10px]">(optional)</span></label>
                        <input value={local.description} onChange={e => upd({ description: e.target.value })}
                            placeholder="Short tagline…"
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-700 px-3 py-2 focus:outline-none focus:border-blue-500" />
                    </div>
                    {/* CTA */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><MousePointerClick size={11} /> CTA Button</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={local.ctaButton} onChange={e => upd({ ctaButton: e.target.value })}
                                className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-2 py-2 focus:outline-none">
                                {CTA_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                            <input value={local.ctaUrl} onChange={e => upd({ ctaUrl: e.target.value })}
                                placeholder="https://…"
                                className="bg-[#1a1a1a] border border-white/10 text-sm text-white placeholder:text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                        </div>
                    </div>
                </div>

                {/* LinkedIn Preview */}
                <div className="flex-1 bg-[#f3f2ef] overflow-y-auto p-6 flex flex-col items-center">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#56687a] mb-4">LinkedIn Ad Preview</p>
                    <div className="w-full max-w-[504px] bg-white rounded-xl border border-[#e0e0e0] shadow-sm overflow-hidden">
                        {/* Company header */}
                        <div className="px-4 pt-3 pb-2 flex items-start gap-2.5">
                            <div className="w-12 h-12 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold text-sm shrink-0">Co</div>
                            <div>
                                <p className="text-sm font-semibold text-[#1d2226]">Your Company</p>
                                <p className="text-xs text-[#56687a]">Promoted</p>
                            </div>
                        </div>
                        {local.text && <div className="px-4 pb-2 text-sm text-[#1d2226] leading-relaxed whitespace-pre-line">{local.text}</div>}

                        {/* Media preview area */}
                        {(!local.mediaType || local.mediaType === 'image') && (
                            local.imageUrl
                                ? <div className="w-full max-h-[300px] overflow-hidden bg-[#f3f2ef] flex items-center justify-center">
                                    <img src={local.imageUrl} alt="" className="max-h-[300px] max-w-full object-contain" />
                                </div>
                                : <div className="mx-4 mb-2 h-44 bg-[#f3f2ef] border border-[#e0e0e0] rounded-lg flex items-center justify-center">
                                    <ImageIcon size={28} className="text-[#c0c0c0]" /></div>
                        )}

                        {local.mediaType === 'video' && (
                            local.videoUrl
                                ? <div className="w-full max-h-[300px] overflow-hidden bg-black flex items-center justify-center">
                                    <video src={local.videoUrl} controls className="max-h-[300px] max-w-full object-contain" />
                                </div>
                                : <div className="mx-4 mb-2 h-44 bg-[#1d2226] rounded-lg flex flex-col items-center justify-center gap-2">
                                    <Film size={28} className="text-[#56687a]" />
                                    <p className="text-xs text-[#56687a]">Video preview</p>
                                </div>
                        )}

                        {local.mediaType === 'carousel' && (() => {
                            const slides = local.carouselUrls ?? []
                            return slides.length > 0 ? (
                                <div className="relative overflow-hidden">
                                    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                                        {slides.map((url, i) => (
                                            <div key={i} className="flex-none w-full snap-center">
                                                <img src={url} alt="" className="w-full object-cover max-h-64" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center gap-1 py-2">
                                        {slides.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#0a66c2]' : 'bg-[#c0c0c0]'}`} />)}
                                    </div>
                                </div>
                            ) : (
                                <div className="mx-4 mb-2 h-44 bg-[#f3f2ef] border border-[#e0e0e0] rounded-lg flex flex-col items-center justify-center gap-2">
                                    <LayoutGrid size={28} className="text-[#c0c0c0]" />
                                    <p className="text-xs text-[#c0c0c0]">Carousel preview</p>
                                </div>
                            )
                        })()}

                        {local.mediaType === 'document' && (
                            local.documentUrl ? (
                                <div className="mx-4 mb-2 rounded-lg overflow-hidden border border-[#e0e0e0] bg-[#f9f9f9] px-4 py-3 flex items-center gap-3">
                                    <FileText size={28} className="text-[#0a66c2] shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1d2226] truncate">{local.documentName}</p>
                                        <p className="text-xs text-[#56687a]">PDF · Document Ad</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mx-4 mb-2 h-44 bg-[#f3f2ef] border border-[#e0e0e0] rounded-lg flex flex-col items-center justify-center gap-2">
                                    <FileText size={28} className="text-[#c0c0c0]" />
                                    <p className="text-xs text-[#c0c0c0]">Document preview</p>
                                </div>
                            )
                        )}

                        {/* Footer CTA */}
                        <div className="bg-[#f3f2ef] border-t border-[#e0e0e0] px-4 py-3 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#1d2226] truncate">{local.headline || 'Your headline here'}</p>
                                {local.description && <p className="text-xs text-[#56687a] truncate">{local.description}</p>}
                            </div>
                            <button className="shrink-0 border border-[#0a66c2] rounded text-sm font-semibold text-[#0a66c2] px-3 py-1 whitespace-nowrap">
                                {local.ctaButton}
                            </button>
                        </div>
                    </div>
                    <p className="mt-4 text-[10px] text-[#c0c0c0]">Approximate preview. Final may differ.</p>
                </div>
            </div>
        </div>
    )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked, indeterminate, onChange }: {
    checked: boolean; indeterminate?: boolean; onChange: () => void
}) {
    return (
        <button
            onClick={e => { e.stopPropagation(); onChange() }}
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                ${checked || indeterminate ? 'bg-[#0a66c2] border-[#0a66c2]' : 'border-white/30 bg-transparent hover:border-[#0a66c2]'}`}
        >
            {indeterminate && !checked
                ? <div className="w-2 h-0.5 bg-white rounded" />
                : checked ? <Check size={10} className="text-white" /> : null}
        </button>
    )
}

// ─── Status Select ─────────────────────────────────────────────────────────────

function GroupStatusSelect({ value, onChange }: { value: GroupStatus; onChange: (v: GroupStatus) => void }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value as GroupStatus)}
            onClick={e => e.stopPropagation()}
            className={`bg-[#1a1a1a] border border-white/10 text-sm rounded-lg px-2 py-1 focus:outline-none ${GROUP_STATUS_COLOR[value]}`}
        >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
        </select>
    )
}

// ─── Tab: Campaign Groups ─────────────────────────────────────────────────────

function GroupsTab({ groups, campaigns, selected, onSelect, onAdd, onDelete, onUpdate }: {
    groups: CampaignGroup[]
    campaigns: Campaign[]
    selected: Set<string>
    onSelect: (id: string, checked: boolean) => void
    onAdd: () => void
    onDelete: (id: string) => void
    onUpdate: (g: CampaignGroup) => void
}) {
    const allChecked = groups.length > 0 && groups.every(g => selected.has(g.id))
    const someChecked = groups.some(g => selected.has(g.id))

    return (
        <div className="space-y-2">
            {/* Select All header */}
            {groups.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <Checkbox
                        checked={allChecked}
                        indeterminate={someChecked && !allChecked}
                        onChange={() => groups.forEach(g => onSelect(g.id, !allChecked))}
                    />
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex-1">Campaign Group</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-24 text-center">Status</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-24 text-center">Campaigns</span>
                    <div className="w-8" />
                </div>
            )}

            {/* Group rows */}
            {groups.map(g => {
                const campCount = campaigns.filter(c => c.groupId === g.id).length
                return (
                    <div
                        key={g.id}
                        className={`flex items-center gap-3 px-4 py-4 rounded-xl border transition-colors cursor-pointer
                            ${selected.has(g.id)
                                ? 'bg-[#0a66c2]/10 border-[#0a66c2]/30'
                                : 'bg-[#0d0d0d] border-white/10 hover:border-white/20'
                            }`}
                        onClick={() => onSelect(g.id, !selected.has(g.id))}
                    >
                        <Checkbox checked={selected.has(g.id)} onChange={() => onSelect(g.id, !selected.has(g.id))} />

                        {/* Icon */}
                        <div className="w-9 h-9 rounded-lg bg-[#0a66c2]/20 border border-[#0a66c2]/30 flex items-center justify-center shrink-0">
                            <Layers size={16} className="text-[#0a66c2]" />
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Campaign Group</p>
                            <input
                                value={g.name}
                                onChange={e => onUpdate({ ...g, name: e.target.value })}
                                onClick={e => e.stopPropagation()}
                                className="bg-transparent text-white font-semibold text-base focus:outline-none w-full border-b border-transparent focus:border-blue-500/50"
                            />
                        </div>

                        {/* Status */}
                        <div className="w-28 flex justify-center" onClick={e => e.stopPropagation()}>
                            <GroupStatusSelect value={g.status} onChange={v => onUpdate({ ...g, status: v })} />
                        </div>

                        {/* Campaign count */}
                        <span className="w-24 text-center text-sm text-slate-400">{campCount} campaign{campCount !== 1 ? 's' : ''}</span>

                        {/* Delete */}
                        <button onClick={e => { e.stopPropagation(); onDelete(g.id) }} className="w-8 flex justify-center text-slate-700 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                )
            })}

            {/* Add group */}
            <button
                onClick={onAdd}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/10 hover:border-[#0a66c2]/50 rounded-xl text-sm text-slate-500 hover:text-[#0a66c2] transition-colors group mt-2"
            >
                <Plus size={16} className="group-hover:text-[#0a66c2]" />
                Add Campaign Group
            </button>
        </div>
    )
}

// ─── Tab: Campaigns ───────────────────────────────────────────────────────────

function CampaignsTab({ groups, campaigns, selectedGroups, selected, onSelect, onAdd, onDelete, onUpdate }: {
    groups: CampaignGroup[]
    campaigns: Campaign[]
    selectedGroups: Set<string>
    selected: Set<string>
    onSelect: (id: string, checked: boolean) => void
    onAdd: (groupId: string) => void
    onDelete: (id: string) => void
    onUpdate: (c: Campaign) => void
}) {
    // If no groups selected → show all; otherwise filter
    const showingAll = selectedGroups.size === 0 || selectedGroups.size === groups.length
    const activeGroups = showingAll ? groups : groups.filter(g => selectedGroups.has(g.id))
    const visible = showingAll ? campaigns : campaigns.filter(c => selectedGroups.has(c.groupId))

    const allChecked = visible.length > 0 && visible.every(c => selected.has(c.id))
    const someChecked = visible.some(c => selected.has(c.id))
    const groupName = (id: string) => groups.find(g => g.id === id)?.name ?? '—'
    const groupStatus = (id: string) => groups.find(g => g.id === id)?.status ?? 'active'

    return (
        <div className="space-y-3">

            {/* ── Scope bar: which groups are active ── */}
            <div className="flex items-center gap-2 flex-wrap px-1">
                <span className="text-xs text-slate-600 shrink-0">Showing campaigns from:</span>
                {showingAll ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                        <Layers size={11} className="text-[#0a66c2]" /> All Campaign Groups
                    </span>
                ) : (
                    activeGroups.map(g => (
                        <span key={g.id} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0a66c2]/15 border border-[#0a66c2]/30 px-2.5 py-1 rounded-full">
                            <Layers size={11} className="text-[#0a66c2]" /> {g.name}
                        </span>
                    ))
                )}
                {!showingAll && (
                    <span className="text-xs text-slate-600">
                        — {visible.length} campaign{visible.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Column header */}
            {visible.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <Checkbox
                        checked={allChecked}
                        indeterminate={someChecked && !allChecked}
                        onChange={() => visible.forEach(c => onSelect(c.id, !allChecked))}
                    />
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex-1">Campaign</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-32 text-center">Objective</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-20 text-center">Budget</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-20 text-center">Ads</span>
                    <div className="w-8" />
                </div>
            )}

            {visible.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-600">
                    <Zap size={28} />
                    <p className="text-sm">No campaigns yet</p>
                    <p className="text-xs text-slate-700">Select a Campaign Group first, then add campaigns below</p>
                </div>
            )}

            {/* Grouped by group with prominent section header */}
            {[...new Set(visible.map(c => c.groupId))].map(gid => (
                <div key={gid} className="space-y-2">
                    {/* Prominent group section header */}
                    <div className="flex items-center gap-2 mt-2 mb-1 px-1">
                        <div className="w-6 h-6 rounded bg-[#0a66c2]/20 border border-[#0a66c2]/30 flex items-center justify-center shrink-0">
                            <Layers size={12} className="text-[#0a66c2]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{groupName(gid)}</span>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${groupStatus(gid) === 'active' ? 'bg-emerald-500/15 text-emerald-400'
                                : groupStatus(gid) === 'paused' ? 'bg-amber-500/15 text-amber-400'
                                    : 'bg-slate-700 text-slate-400'
                                }`}>{groupStatus(gid)}</span>
                        </div>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {visible.filter(c => c.groupId === gid).map(c => (
                        <div
                            key={c.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors
                                ${selected.has(c.id) ? 'bg-[#0a66c2]/10 border-[#0a66c2]/30' : 'bg-[#0d0d0d] border-white/10 hover:border-white/20'}`}
                        >
                            <Checkbox checked={selected.has(c.id)} onChange={() => onSelect(c.id, !selected.has(c.id))} />

                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <Zap size={13} className="text-blue-400" />
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <input
                                    value={c.name}
                                    onChange={e => onUpdate({ ...c, name: e.target.value })}
                                    className="bg-transparent text-white font-medium text-sm focus:outline-none w-full border-b border-transparent focus:border-blue-500/50"
                                />
                                <div className="flex gap-3 mt-1 flex-wrap">
                                    <input value={c.audience} onChange={e => onUpdate({ ...c, audience: e.target.value })}
                                        placeholder="Audience…"
                                        className="bg-transparent text-xs text-slate-500 focus:outline-none border-b border-transparent focus:border-blue-500/30 w-36 placeholder:text-slate-700" />
                                    <div className="flex gap-1 items-center">
                                        <input type="date" value={c.startDate} onChange={e => onUpdate({ ...c, startDate: e.target.value })}
                                            className="bg-transparent text-xs text-slate-500 focus:outline-none" />
                                        <span className="text-slate-700 text-xs">→</span>
                                        <input type="date" value={c.endDate} onChange={e => onUpdate({ ...c, endDate: e.target.value })}
                                            className="bg-transparent text-xs text-slate-500 focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Objective */}
                            <div className="w-32 flex justify-center">
                                <select value={c.objective} onChange={e => onUpdate({ ...c, objective: e.target.value as CampaignObjective })}
                                    className="bg-[#1a1a1a] border border-white/10 text-white text-xs rounded-lg px-2 py-1 focus:outline-none w-full">
                                    {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>

                            {/* Budget */}
                            <div className="w-20 flex items-center gap-1">
                                <input value={c.budget} onChange={e => onUpdate({ ...c, budget: e.target.value })}
                                    placeholder="$50"
                                    className="bg-[#1a1a1a] border border-white/10 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 w-full text-center placeholder:text-slate-700" />
                            </div>

                            {/* Ad count */}
                            <span className="w-20 text-center text-xs text-slate-400">{c.ads.length} ad{c.ads.length !== 1 ? 's' : ''}</span>

                            {/* Delete */}
                            <button onClick={() => onDelete(c.id)} className="w-8 flex justify-center text-slate-700 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                    ))}
                    <button onClick={() => onAdd(gid)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/10 hover:border-[#0a66c2]/50 rounded-xl text-xs text-slate-600 hover:text-[#0a66c2] transition-colors">
                        <Plus size={13} /> Add Campaign to {groupName(gid)}
                    </button>
                </div>
            ))}

            {/* Empty-state Add buttons per group */}
            {visible.length === 0 && groups.length > 0 && (
                <div className="space-y-2 pt-2">
                    {activeGroups.map(g => (
                        <button key={g.id} onClick={() => onAdd(g.id)}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 hover:border-[#0a66c2]/50 rounded-xl text-xs text-slate-600 hover:text-[#0a66c2] transition-colors">
                            <Plus size={13} /> Add Campaign to {g.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Tab: Ads ─────────────────────────────────────────────────────────────────

function AdsTab({ groups, campaigns, selectedGroups, selectedCampaigns, onUpdateAd, onAddAd, onDeleteAd }: {
    groups: CampaignGroup[]
    campaigns: Campaign[]
    selectedGroups: Set<string>
    selectedCampaigns: Set<string>
    onUpdateAd: (campaignId: string, ad: AdCreative) => void
    onAddAd: (campaignId: string) => void
    onDeleteAd: (campaignId: string, adId: string) => void
}) {
    const [editingAd, setEditingAd] = useState<{ campaignId: string; ad: AdCreative } | null>(null)

    // Filter campaigns
    const showingAllGroups = selectedGroups.size === 0 || selectedGroups.size === groups.length
    const activeGroups = showingAllGroups ? groups : groups.filter(g => selectedGroups.has(g.id))

    const visibleCampaigns = (() => {
        let result = campaigns
        if (!showingAllGroups) result = result.filter(c => selectedGroups.has(c.groupId))
        if (selectedCampaigns.size > 0) result = result.filter(c => selectedCampaigns.has(c.id))
        return result
    })()

    const allAds = visibleCampaigns.flatMap(c => c.ads.map(a => ({ ...a, campaignId: c.id, campaignName: c.name })))

    const groupOf = (c: Campaign) => groups.find(g => g.id === c.groupId)

    return (
        <>
            {editingAd ? (
                <AdEditorPanel
                    ad={editingAd.ad}
                    onSave={(ad) => { onUpdateAd(editingAd.campaignId, ad); setEditingAd(null) }}
                    onClose={() => setEditingAd(null)}
                />
            ) : (
                <div className="space-y-3">
                    {/* ── Scope bar ── */}
                    <div className="flex items-center gap-2 flex-wrap px-1">
                        <span className="text-xs text-slate-600 shrink-0">Showing ads from:</span>
                        {showingAllGroups ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                                <Layers size={11} className="text-[#0a66c2]" /> All Campaign Groups
                            </span>
                        ) : (
                            activeGroups.map(g => (
                                <span key={g.id} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0a66c2]/15 border border-[#0a66c2]/30 px-2.5 py-1 rounded-full">
                                    <Layers size={11} className="text-[#0a66c2]" /> {g.name}
                                </span>
                            ))
                        )}
                        {selectedCampaigns.size > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                · {selectedCampaigns.size} campaign{selectedCampaigns.size !== 1 ? 's' : ''} selected
                            </span>
                        )}
                    </div>

                    {/* Header */}
                    {allAds.length > 0 && (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                            <div className="w-10 h-10 shrink-0" />
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex-1">Ad Creative</span>
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-36">Campaign</span>
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-24 text-center">Status</span>
                            <div className="w-24" />
                            <div className="w-8" />
                        </div>
                    )}

                    {allAds.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-600">
                            <ImageIcon size={28} />
                            <p className="text-sm">No ads yet</p>
                            <p className="text-xs text-slate-700">Select campaigns in the Campaign tab to see their ads here</p>
                        </div>
                    )}

                    {/* Group ads by campaign, with group section header */}
                    {[...new Set(visibleCampaigns.map(c => c.groupId))].map(gid => {
                        const grp = groupOf(visibleCampaigns.find(c => c.groupId === gid)!)
                        const groupCampaigns = visibleCampaigns.filter(c => c.groupId === gid)
                        return (
                            <div key={gid} className="space-y-2">
                                {/* Group header */}
                                <div className="flex items-center gap-2 mt-2 mb-1 px-1">
                                    <div className="w-6 h-6 rounded bg-[#0a66c2]/20 border border-[#0a66c2]/30 flex items-center justify-center shrink-0">
                                        <Layers size={12} className="text-[#0a66c2]" />
                                    </div>
                                    <span className="text-xs font-bold text-white">{grp?.name ?? '—'}</span>
                                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${grp?.status === 'active' ? 'bg-emerald-500/15 text-emerald-400'
                                        : grp?.status === 'paused' ? 'bg-amber-500/15 text-amber-400'
                                            : 'bg-slate-700 text-slate-400'
                                        }`}>{grp?.status}</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>

                                {groupCampaigns.map(cmp => (
                                    <div key={cmp.id} className="space-y-2">
                                        {/* Campaign sub-header */}
                                        <div className="flex items-center gap-2 pl-8 pr-1">
                                            <Zap size={11} className="text-blue-500" />
                                            <span className="text-[11px] font-semibold text-slate-400">{cmp.name}</span>
                                            <div className="flex-1 h-px bg-white/[0.04]" />
                                        </div>
                                        {cmp.ads.map(ad => (
                                            <div key={ad.id} className="flex items-center gap-3 px-4 py-3 bg-[#0d0d0d] border border-white/10 hover:border-white/20 rounded-xl transition-colors group">
                                                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {ad.imageUrl ? <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-slate-700" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{ad.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{ad.headline || ad.text || 'Empty — click Edit'}</p>
                                                </div>
                                                <span className="w-36 text-xs text-slate-500 truncate">{cmp.name}</span>
                                                <div className="w-24 flex justify-center">
                                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[ad.status]}`}>{ad.status}</span>
                                                </div>
                                                <button
                                                    onClick={() => setEditingAd({ campaignId: cmp.id, ad })}
                                                    className="w-24 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={11} /> Edit
                                                </button>
                                                <button onClick={() => onDeleteAd(cmp.id, ad.id)} className="w-8 flex justify-center text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => onAddAd(cmp.id)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/10 hover:border-blue-500/50 rounded-xl text-xs text-slate-600 hover:text-blue-400 transition-colors">
                                            <Plus size={13} /> Add Ad to {cmp.name}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabId = 'groups' | 'campaigns' | 'ads'

const TABS: { id: TabId; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: 'groups', label: 'Campaign Group', sub: '', icon: <Layers size={14} /> },
    { id: 'campaigns', label: 'Campaign', sub: 'objective, audience, budget', icon: <Zap size={14} /> },
    { id: 'ads', label: 'Ad Creative', sub: 'text, image, headline, CTA', icon: <ImageIcon size={14} /> },
]

export function LinkedInCampaignSetup() {
    const [activeTab, setActiveTab] = useState<TabId>('groups')
    const [groups, setGroups] = useState<CampaignGroup[]>([defaultGroup(1)])
    const [campaigns, setCampaigns] = useState<Campaign[]>([defaultCampaign(defaultGroup(1).id, 1)])
    const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
    const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set())

    // ── Group ops ──────────────────────────────────────────────────────────────
    const addGroup = () => {
        const g = defaultGroup(groups.length + 1)
        setGroups(prev => [...prev, g])
    }

    const deleteGroup = (id: string) => {
        setGroups(prev => prev.filter(g => g.id !== id))
        setCampaigns(prev => prev.filter(c => c.groupId !== id))
        setSelectedGroups(prev => { const s = new Set(prev); s.delete(id); return s })
    }

    const updateGroup = (g: CampaignGroup) => setGroups(prev => prev.map(x => x.id === g.id ? g : x))

    const selectGroup = (id: string, checked: boolean) => {
        setSelectedGroups(prev => {
            const s = new Set(prev)
            checked ? s.add(id) : s.delete(id)
            return s
        })
    }

    // ── Campaign ops ───────────────────────────────────────────────────────────
    const addCampaign = (groupId: string) => {
        const n = campaigns.filter(c => c.groupId === groupId).length + 1
        setCampaigns(prev => [...prev, defaultCampaign(groupId, n)])
    }

    const deleteCampaign = (id: string) => {
        setCampaigns(prev => prev.filter(c => c.id !== id))
        setSelectedCampaigns(prev => { const s = new Set(prev); s.delete(id); return s })
    }

    const updateCampaign = (c: Campaign) => setCampaigns(prev => prev.map(x => x.id === c.id ? c : x))

    const selectCampaign = (id: string, checked: boolean) => {
        setSelectedCampaigns(prev => {
            const s = new Set(prev)
            checked ? s.add(id) : s.delete(id)
            return s
        })
    }

    // ── Ad ops ─────────────────────────────────────────────────────────────────
    const addAd = (campaignId: string) =>
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ads: [...c.ads, defaultAd()] } : c))

    const deleteAd = (campaignId: string, adId: string) =>
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ads: c.ads.filter(a => a.id !== adId) } : c))

    const updateAd = (campaignId: string, ad: AdCreative) =>
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ads: c.ads.map(a => a.id === ad.id ? ad : a) } : c))

    // ── Badge counts ───────────────────────────────────────────────────────────
    const campaignBadge = selectedGroups.size === 0 || selectedGroups.size === groups.length
        ? campaigns.length
        : campaigns.filter(c => selectedGroups.has(c.groupId)).length

    const adsBadge = (() => {
        let result = campaigns
        if (selectedGroups.size > 0 && selectedGroups.size < groups.length)
            result = result.filter(c => selectedGroups.has(c.groupId))
        if (selectedCampaigns.size > 0)
            result = result.filter(c => selectedCampaigns.has(c.id))
        return result.reduce((s, c) => s + c.ads.length, 0)
    })()

    const badges: Record<TabId, number> = {
        groups: groups.length,
        campaigns: campaignBadge,
        ads: adsBadge,
    }

    // ── Submit ─────────────────────────────────────────────────────────────────
    const submitForApproval = () => {
        const allAds = campaigns.flatMap(c => c.ads)
        const drafts = allAds.filter(a => a.status === 'draft').length
        if (drafts > 0) toast.info(`${drafts} ad${drafts > 1 ? 's are' : ' is'} still in Draft.`)
        else toast.success('Campaign submitted for approval!')
    }

    return (
        <div className="w-full max-w-[920px] space-y-5">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#0a66c2] rounded flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </div>
                    <span className="font-bold text-white text-base">LinkedIn Ads</span>
                    <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Manual Setup</span>
                </div>
                <button
                    onClick={submitForApproval}
                    className="flex items-center gap-2 bg-[#0a66c2] hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/30"
                >
                    <Check size={14} /> Submit for Approval
                </button>
            </div>

            {/* Tab bar — exact LinkedIn Ads Manager style */}
            <div className="flex items-center gap-0 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
                {TABS.map((tab, i) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center gap-2.5 px-5 py-3.5 transition-colors relative
                                ${isActive ? 'bg-white/5 text-[#0a66c2]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'}
                                ${i < TABS.length - 1 ? 'border-r border-white/10' : ''}`}
                        >
                            <span className={isActive ? 'text-[#0a66c2]' : 'text-slate-600'}>{tab.icon}</span>
                            <span className="font-semibold text-sm">{tab.label}</span>
                            {tab.sub && <span className="text-slate-600 text-xs hidden md:block">({tab.sub})</span>}
                            <span className={`ml-auto text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ${isActive ? 'bg-[#0a66c2] text-white' : 'bg-white/10 text-slate-400'}`}>
                                {badges[tab.id]}
                            </span>
                            {i < TABS.length - 1 && (
                                <ChevronRight size={14} className="text-slate-700 absolute right-0 translate-x-0.5 z-10 hidden md:block" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab content */}
            {activeTab === 'groups' && (
                <GroupsTab
                    groups={groups}
                    campaigns={campaigns}
                    selected={selectedGroups}
                    onSelect={selectGroup}
                    onAdd={addGroup}
                    onDelete={deleteGroup}
                    onUpdate={updateGroup}
                />
            )}

            {activeTab === 'campaigns' && (
                <CampaignsTab
                    groups={groups}
                    campaigns={campaigns}
                    selectedGroups={selectedGroups}
                    selected={selectedCampaigns}
                    onSelect={selectCampaign}
                    onAdd={addCampaign}
                    onDelete={deleteCampaign}
                    onUpdate={updateCampaign}
                />
            )}

            {activeTab === 'ads' && (
                <AdsTab
                    groups={groups}
                    campaigns={campaigns}
                    selectedGroups={selectedGroups}
                    selectedCampaigns={selectedCampaigns}
                    onUpdateAd={updateAd}
                    onAddAd={addAd}
                    onDeleteAd={deleteAd}
                />
            )}
        </div>
    )
}
