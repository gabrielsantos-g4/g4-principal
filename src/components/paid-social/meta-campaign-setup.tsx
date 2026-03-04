'use client'

import { useState, useRef } from 'react'
import {
    Layers, Zap, Image as ImageIcon, Plus, Trash2, Edit2,
    ChevronRight, Check, X, ArrowLeft, AlignLeft, Type,
    MousePointerClick, Settings2, MoreHorizontal, Circle,
    Film, FileText, LayoutGrid, Upload, Heart, MessageCircle,
    Share2, Bookmark
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdStatus = 'draft' | 'review' | 'approved'
type GroupStatus = 'active' | 'paused' | 'archived'
type MediaType = 'image' | 'video' | 'carousel' | 'document'
type Placement = 'instagram_feed' | 'instagram_stories' | 'facebook_feed' | 'facebook_reels'

type MetaObjective =
    | 'Awareness' | 'Traffic' | 'Engagement' | 'Leads'
    | 'App Promotion' | 'Sales'

interface MetaAd {
    id: string; name: string; primaryText: string
    mediaType?: MediaType
    imageUrl?: string
    carouselUrls?: string[]
    videoUrl?: string
    documentUrl?: string
    documentName?: string
    mediaAspectRatio?: number
    headline: string; description: string; ctaButton: string; ctaUrl: string
    placement: Placement
    status: AdStatus
}

interface AdSet {
    id: string; campaignId: string; name: string
    audience: string; ageMin: number; ageMax: number
    gender: 'all' | 'male' | 'female'
    budgetType: 'daily' | 'lifetime'; budget: string
    startDate: string; endDate: string
    ads: MetaAd[]
}

interface MetaCampaign {
    id: string; name: string
    objective: MetaObjective
    buyingType: 'auction' | 'reservation'
    adSets: AdSet[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const defaultAd = (): MetaAd => ({
    id: uid(), name: 'New Ad', primaryText: '', headline: '',
    description: '', ctaButton: 'Learn More', ctaUrl: '', status: 'draft',
    placement: 'instagram_feed',
    mediaType: undefined, imageUrl: undefined, carouselUrls: [],
    videoUrl: undefined, documentUrl: undefined, documentName: undefined,
    mediaAspectRatio: undefined,
})

const defaultAdSet = (campaignId: string, n = 1): AdSet => ({
    id: uid(), campaignId, name: `Ad Set ${n}`,
    audience: '', ageMin: 18, ageMax: 65, gender: 'all',
    budgetType: 'daily', budget: '', startDate: '', endDate: '',
    ads: [defaultAd()],
})

const defaultCampaign = (n = 1): MetaCampaign => ({
    id: uid(), name: `Campaign ${n}`,
    objective: 'Traffic', buyingType: 'auction',
    adSets: [defaultAdSet(uid())],
})

const OBJECTIVES: MetaObjective[] = [
    'Awareness', 'Traffic', 'Engagement', 'Leads', 'App Promotion', 'Sales'
]

const CTA_OPTIONS = [
    'Learn More', 'Sign Up', 'Shop Now', 'Book Now', 'Download',
    'Get Offer', 'Contact Us', 'Watch More', 'Apply Now', 'Subscribe'
]

const PLACEMENTS: { id: Placement; label: string; icon: string }[] = [
    { id: 'instagram_feed', label: 'Instagram Feed', icon: '📱' },
    { id: 'instagram_stories', label: 'Stories / Reels', icon: '🎬' },
    { id: 'facebook_feed', label: 'Facebook Feed', icon: '💻' },
    { id: 'facebook_reels', label: 'Facebook Reels', icon: '🎥' },
]

const STATUS_COLORS: Record<AdStatus, string> = {
    draft: 'text-slate-400 bg-slate-800',
    review: 'text-amber-300 bg-amber-500/15',
    approved: 'text-emerald-400 bg-emerald-500/15',
}

// ─── Dimension detectors ──────────────────────────────────────────────────────

function detectImageRatio(url: string): Promise<number> {
    return new Promise(resolve => {
        const img = new window.Image()
        img.onload = () => resolve(img.naturalWidth / img.naturalHeight)
        img.onerror = () => resolve(1)
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

// ─── Ad Editor Panel ──────────────────────────────────────────────────────────

function MetaAdEditorPanel({ ad, onSave, onClose }: {
    ad: MetaAd; onSave: (a: MetaAd) => void; onClose: () => void
}) {
    const [local, setLocal] = useState<MetaAd>({ ...ad })
    const fileRef = useRef<HTMLInputElement>(null)
    const upd = (p: Partial<MetaAd>) => setLocal(prev => ({ ...prev, ...p }))

    return (
        <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f0f]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414] shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><ArrowLeft size={18} /></button>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Meta Ad Editor</p>
                        <input value={local.name} onChange={e => upd({ name: e.target.value })}
                            className="bg-transparent text-white font-semibold text-base focus:outline-none border-b border-transparent focus:border-blue-500/50" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select value={local.status} onChange={e => upd({ status: e.target.value as AdStatus })}
                        className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="approved">Approved</option>
                    </select>
                    <button onClick={() => { onSave(local); toast.success('Ad saved!') }}
                        className="flex items-center gap-2 bg-[#1877f2] hover:bg-[#0d6ef2] text-white text-sm font-semibold px-4 py-1.5 rounded-lg">
                        <Check size={14} /> Save
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0">
                {/* Form */}
                <div className="w-[420px] shrink-0 border-r border-white/10 overflow-y-auto p-6 space-y-5">

                    {/* Placement selector */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <Settings2 size={11} /> Placement
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {PLACEMENTS.map(p => (
                                <button key={p.id} onClick={() => upd({ placement: p.id })}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all
                                        ${local.placement === p.id
                                            ? 'border-[#1877f2] bg-[#1877f2]/10 text-[#1877f2]'
                                            : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}>
                                    <span>{p.icon}</span> {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Primary Text */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <AlignLeft size={11} /> Primary Text
                        </label>
                        <textarea value={local.primaryText} onChange={e => upd({ primaryText: e.target.value })}
                            placeholder="Write your ad copy…" rows={4}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-700 p-3 focus:outline-none focus:border-[#1877f2] resize-none" />
                    </div>

                    {/* Media */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <ImageIcon size={11} /> Media
                        </label>
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
                                            ? 'border-[#1877f2] bg-[#1877f2]/10 text-[#1877f2]'
                                            : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}>
                                    {icon}{label}
                                </button>
                            ))}
                        </div>

                        {/* Image upload */}
                        {(!local.mediaType || local.mediaType === 'image') && (
                            <div onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/10 hover:border-[#1877f2]/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[100px]">
                                {local.imageUrl ? (
                                    <div className="relative w-full max-h-48 flex items-center justify-center overflow-hidden rounded-lg bg-black">
                                        <img src={local.imageUrl} alt="" className="max-h-48 max-w-full object-contain" />
                                        <button onClick={e => { e.stopPropagation(); upd({ imageUrl: undefined }) }}
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500"><X size={12} /></button>
                                    </div>
                                ) : (
                                    <><Upload size={20} className="text-slate-600 group-hover:text-[#1877f2]" />
                                        <p className="text-xs text-slate-500">Click to upload image</p>
                                        <p className="text-[10px] text-slate-700">1:1 or 4:5 recommended for Feed · 9:16 for Stories</p></>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                    onChange={async e => {
                                        const f = e.target.files?.[0]; if (!f) return
                                        const url = URL.createObjectURL(f)
                                        const ratio = await detectImageRatio(url)
                                        upd({ mediaType: 'image', imageUrl: url, mediaAspectRatio: ratio })
                                    }} />
                            </div>
                        )}

                        {/* Video upload */}
                        {local.mediaType === 'video' && (
                            <div onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/10 hover:border-[#1877f2]/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[100px]">
                                {local.videoUrl ? (
                                    <div className="relative w-full max-h-48 flex items-center justify-center overflow-hidden rounded-lg bg-black">
                                        <video src={local.videoUrl} controls className="max-h-48 max-w-full object-contain" />
                                        <button onClick={e => { e.stopPropagation(); upd({ videoUrl: undefined, mediaAspectRatio: undefined }) }}
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500"><X size={12} /></button>
                                    </div>
                                ) : (
                                    <><Film size={20} className="text-slate-600 group-hover:text-[#1877f2]" />
                                        <p className="text-xs text-slate-500">Click to upload video</p>
                                        <p className="text-[10px] text-slate-700">MP4, MOV · Max 4GB</p></>
                                )}
                                <input ref={fileRef} type="file" accept="video/*" className="hidden"
                                    onChange={async e => {
                                        const f = e.target.files?.[0]; if (!f) return
                                        const url = URL.createObjectURL(f)
                                        const ratio = await detectVideoRatio(url)
                                        upd({ videoUrl: url, mediaAspectRatio: ratio })
                                    }} />
                            </div>
                        )}

                        {/* Carousel */}
                        {local.mediaType === 'carousel' && (
                            <div className="space-y-2">
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
                                    className="border-2 border-dashed border-white/10 hover:border-[#1877f2]/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[80px]">
                                    <LayoutGrid size={18} className="text-slate-600 group-hover:text-[#1877f2]" />
                                    <p className="text-xs text-slate-500">Add carousel card</p>
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

                        {/* Document */}
                        {local.mediaType === 'document' && (
                            <div onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/10 hover:border-[#1877f2]/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[100px]">
                                {local.documentUrl ? (
                                    <div className="flex items-center gap-3 w-full bg-white/5 rounded-lg px-4 py-3">
                                        <FileText size={28} className="text-[#1877f2] shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{local.documentName}</p>
                                            <p className="text-[10px] text-slate-500">PDF Document</p>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); upd({ documentUrl: undefined, documentName: undefined }) }}
                                            className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <><FileText size={20} className="text-slate-600 group-hover:text-[#1877f2]" />
                                        <p className="text-xs text-slate-500">Click to upload PDF</p></>
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
                            placeholder="e.g., Try it free today"
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-700 px-3 py-2 focus:outline-none focus:border-[#1877f2]" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <Type size={11} /> Description <span className="normal-case font-normal text-[10px] text-slate-700">(optional)</span>
                        </label>
                        <input value={local.description} onChange={e => upd({ description: e.target.value })}
                            placeholder="Short tagline…"
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-700 px-3 py-2 focus:outline-none focus:border-[#1877f2]" />
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
                                className="bg-[#1a1a1a] border border-white/10 text-sm text-white placeholder:text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1877f2]" />
                        </div>
                    </div>
                </div>

                {/* Meta Ad Preview */}
                <MetaAdPreview ad={local} />
            </div>
        </div>
    )
}

// ─── Meta Ad Preview ──────────────────────────────────────────────────────────

function MetaAdPreview({ ad }: { ad: MetaAd }) {
    const isStories = ad.placement === 'instagram_stories' || ad.placement === 'facebook_reels'
    const isFacebook = ad.placement === 'facebook_feed' || ad.placement === 'facebook_reels'

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center"
            style={{ background: isFacebook ? '#f0f2f5' : '#fafafa' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                style={{ color: isFacebook ? '#65676b' : '#8e8e8e' }}>
                {isFacebook ? 'Facebook' : 'Instagram'} Ad Preview
            </p>

            {/* Instagram Feed */}
            {ad.placement === 'instagram_feed' && (
                <div className="w-full max-w-[380px] bg-white rounded-2xl overflow-hidden shadow-sm border border-[#dbdbdb]">
                    {/* Top bar with "Instagram" label */}
                    <div className="px-4 py-2 border-b border-[#dbdbdb] text-center">
                        <span className="font-['Billabong',_cursive] text-xl text-[#1d1d1d]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: 1 }}>Instagram</span>
                    </div>
                    {/* Account row */}
                    <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
                                <div className="w-full h-full rounded-full bg-[#1877f2] flex items-center justify-center text-white text-[10px] font-bold">Co</div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#1d1d1d] leading-tight">yourcompany</p>
                                <p className="text-[10px] text-[#8e8e8e]">Ad</p>
                            </div>
                        </div>
                        <MoreHorizontal size={18} className="text-[#1d1d1d]" />
                    </div>
                    {/* Media */}
                    <div className="w-full bg-[#f3f3f3] flex items-center justify-center overflow-hidden min-h-[200px] max-h-[380px]">
                        <MediaPreview ad={ad} />
                    </div>
                    {/* CTA row */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[#dbdbdb]">
                        <span className="text-sm font-semibold text-[#1d1d1d]">{ad.ctaButton || 'Learn More'}</span>
                        <ChevronRight size={16} className="text-[#1d1d1d]" />
                    </div>
                    {/* Engagement row */}
                    <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-4">
                            <Heart size={22} className="text-[#1d1d1d]" />
                            <MessageCircle size={22} className="text-[#1d1d1d]" />
                            <Share2 size={22} className="text-[#1d1d1d]" />
                        </div>
                        <Bookmark size={22} className="text-[#1d1d1d]" />
                    </div>
                    {/* Caption */}
                    {ad.primaryText && (
                        <div className="px-3 pb-3 text-xs text-[#1d1d1d] leading-relaxed">
                            <span className="font-semibold">yourcompany</span> {ad.primaryText}
                        </div>
                    )}
                </div>
            )}

            {/* Instagram Stories / Reels */}
            {(ad.placement === 'instagram_stories' || ad.placement === 'facebook_reels') && (
                <div className="w-full max-w-[280px] rounded-3xl overflow-hidden shadow-xl relative bg-black"
                    style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
                    {/* Media fill */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <MediaPreview ad={ad} fill />
                    </div>
                    {/* Overlay gradient bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pt-16 pb-4 px-4">
                        {ad.headline && (
                            <p className="text-white font-bold text-sm text-center drop-shadow leading-tight mb-2">{ad.headline}</p>
                        )}
                        <button className="w-full bg-white/90 text-black font-semibold text-sm rounded-full py-2">
                            {ad.ctaButton || 'Learn More'}
                        </button>
                    </div>
                    {/* Top UI chrome */}
                    <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
                        <div className="flex-1 h-0.5 bg-white/30 rounded-full">
                            <div className="h-full w-1/3 bg-white rounded-full" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1px]">
                                <div className="w-full h-full rounded-full bg-[#1877f2]" />
                            </div>
                            <p className="text-white text-[10px] font-semibold drop-shadow">yourcompany</p>
                            <span className="text-white/70 text-[10px]">· Ad</span>
                        </div>
                        <X size={14} className="text-white/80 ml-auto" />
                    </div>
                </div>
            )}

            {/* Facebook Feed */}
            {ad.placement === 'facebook_feed' && (
                <div className="w-full max-w-[420px] bg-white rounded-xl overflow-hidden shadow-sm border border-[#dddfe2]">
                    {/* Account row */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-sm">Co</div>
                            <div>
                                <p className="text-sm font-semibold text-[#1d2129]">Your Company</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-[10px] text-[#65676b]">Sponsored</p>
                                    <span className="text-[#65676b] text-[10px]">·</span>
                                    <svg viewBox="0 0 12 12" className="w-3 h-3 fill-[#65676b]"><path d="M6 0C2.686 0 0 2.686 0 6s2.686 6 6 6 6-2.686 6-6S9.314 0 6 0zm3 8.4L5.4 6V1.8h1.2v3.6L9.6 7.2 9 8.4z" /></svg>
                                </div>
                            </div>
                        </div>
                        <MoreHorizontal size={20} className="text-[#65676b]" />
                    </div>
                    {/* Primary text */}
                    {ad.primaryText && <p className="px-4 pb-2 text-sm text-[#1d2129] leading-relaxed">{ad.primaryText}</p>}
                    {/* Media */}
                    <div className="w-full bg-[#f0f2f5] flex items-center justify-center overflow-hidden min-h-[180px] max-h-[340px]">
                        <MediaPreview ad={ad} />
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-[#dddfe2] flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#65676b] uppercase tracking-wide text-[10px]">{ad.ctaUrl ? new URL(ad.ctaUrl.startsWith('http') ? ad.ctaUrl : 'https://' + ad.ctaUrl).hostname : 'yourwebsite.com'}</p>
                            <p className="text-sm font-semibold text-[#1d2129] truncate">{ad.headline || 'Your headline here'}</p>
                            {ad.description && <p className="text-xs text-[#65676b] truncate">{ad.description}</p>}
                        </div>
                        <button className="shrink-0 bg-[#e4e6eb] hover:bg-[#dddfe2] text-[#1d2129] text-sm font-semibold px-4 py-2 rounded-md transition-colors">
                            {ad.ctaButton || 'Learn More'}
                        </button>
                    </div>
                    {/* Reactions */}
                    <div className="flex items-center justify-around px-4 py-1 border-t border-[#dddfe2]">
                        {(['Like', 'Comment', 'Share'] as const).map(a => (
                            <button key={a} className="flex items-center gap-1.5 text-xs font-semibold text-[#65676b] hover:text-[#1877f2] py-2 transition-colors">
                                {a === 'Like' && <Heart size={16} />}
                                {a === 'Comment' && <MessageCircle size={16} />}
                                {a === 'Share' && <Share2 size={16} />}
                                {a}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <p className="mt-4 text-[10px] text-[#c0c0c0]">Approximate preview. Final may differ.</p>
        </div>
    )
}

// ─── Shared media renderer ────────────────────────────────────────────────────

function MediaPreview({ ad, fill }: { ad: MetaAd; fill?: boolean }) {
    const cls = fill ? 'w-full h-full object-cover' : 'max-h-[300px] max-w-full object-contain'

    if (ad.mediaType === 'video' && ad.videoUrl)
        return <video src={ad.videoUrl} controls className={fill ? 'w-full h-full object-cover' : 'max-h-[300px] max-w-full'} />

    if (ad.mediaType === 'carousel' && (ad.carouselUrls ?? []).length > 0)
        return (
            <div className="relative w-full overflow-hidden">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {(ad.carouselUrls ?? []).map((url, i) => (
                        <div key={i} className="flex-none w-full snap-center">
                            <img src={url} alt="" className="w-full object-cover max-h-[280px]" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-1 py-2 absolute bottom-0 left-0 right-0">
                    {(ad.carouselUrls ?? []).map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#1877f2]' : 'bg-white/40'}`} />)}
                </div>
            </div>
        )

    if (ad.mediaType === 'document' && ad.documentUrl)
        return (
            <div className="flex items-center gap-3 bg-[#f0f2f5] rounded-lg px-4 py-3 w-full">
                <FileText size={28} className="text-[#1877f2] shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1d2129] truncate">{ad.documentName}</p>
                    <p className="text-xs text-[#65676b]">PDF Document</p>
                </div>
            </div>
        )

    if (ad.imageUrl)
        return <img src={ad.imageUrl} alt="" className={cls} />

    // Placeholder
    return (
        <div className="w-full h-full min-h-[180px] flex items-center justify-center">
            <ImageIcon size={32} className="text-[#c0c0c0]" />
        </div>
    )
}

// ─── Ads Tab ──────────────────────────────────────────────────────────────────

function AdsTab({ adSets, campaigns, onUpdateAd, onAddAd }: {
    adSets: AdSet[]
    campaigns: MetaCampaign[]
    onUpdateAd: (adSetId: string, ad: MetaAd) => void
    onAddAd: (adSetId: string) => void
}) {
    const [editingAd, setEditingAd] = useState<{ adSetId: string; ad: MetaAd } | null>(null)

    const allAds = adSets.flatMap(s => s.ads.map(a => ({ ...a, adSetId: s.id, adSetName: s.name })))

    if (editingAd) {
        return (
            <MetaAdEditorPanel
                ad={editingAd.ad}
                onSave={(ad) => { onUpdateAd(editingAd.adSetId, ad); setEditingAd(null) }}
                onClose={() => setEditingAd(null)}
            />
        )
    }

    return (
        <div className="space-y-3">
            {allAds.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-600">
                    <ImageIcon size={28} />
                    <p className="text-sm">No ads yet</p>
                    <p className="text-xs text-slate-700">Select ad sets in the Ad Sets tab first</p>
                </div>
            )}
            {allAds.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="w-10 h-10 shrink-0" />
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex-1">Ad Creative</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-32">Ad Set</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-24 text-center">Placement</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider w-20 text-center">Status</span>
                    <div className="w-20" />
                </div>
            )}
            {adSets.map(adSet => adSet.ads.map(ad => (
                <div key={ad.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10">
                    {/* Thumbnail: real media if available, otherwise icon */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#1877f2]/10 flex items-center justify-center">
                        {ad.videoUrl ? (
                            <video src={ad.videoUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        ) : ad.imageUrl ? (
                            <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (ad.carouselUrls ?? []).length > 0 ? (
                            <img src={(ad.carouselUrls ?? [])[0]} alt="" className="w-full h-full object-cover" />
                        ) : ad.mediaType === 'video' ? (
                            <Film size={16} className="text-[#1877f2]" />
                        ) : ad.mediaType === 'carousel' ? (
                            <LayoutGrid size={16} className="text-[#1877f2]" />
                        ) : ad.mediaType === 'document' ? (
                            <FileText size={16} className="text-[#1877f2]" />
                        ) : (
                            <ImageIcon size={16} className="text-[#1877f2]" />
                        )}
                    </div>
                    <span className="text-sm text-white font-medium flex-1 truncate">{ad.name}</span>
                    <span className="text-xs text-slate-500 w-32 truncate">{adSet.name}</span>
                    <span className="text-xs text-slate-500 w-24 text-center">{PLACEMENTS.find(p => p.id === ad.placement)?.label ?? ad.placement}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-20 text-center ${STATUS_COLORS[ad.status]}`}>{ad.status}</span>
                    <div className="flex items-center gap-1 w-20 justify-end">
                        <button onClick={() => setEditingAd({ adSetId: adSet.id, ad })}
                            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => onAddAd(adSet.id)}
                            className="p-1.5 text-slate-500 hover:text-[#1877f2] rounded-lg hover:bg-[#1877f2]/10 transition-all">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            )))}
            {adSets.map(adSet => (
                <button key={`add-${adSet.id}`} onClick={() => onAddAd(adSet.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/10 hover:border-[#1877f2]/50 rounded-xl text-xs text-slate-600 hover:text-[#1877f2] transition-colors">
                    <Plus size={13} /> Add Ad to {adSet.name}
                </button>
            ))}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabId = 'campaigns' | 'adsets' | 'ads'

const TABS: { id: TabId; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: 'campaigns', label: 'Campaign', sub: 'objective, buying type', icon: <Layers size={14} /> },
    { id: 'adsets', label: 'Ad Set', sub: 'audience, budget, schedule', icon: <Zap size={14} /> },
    { id: 'ads', label: 'Ad', sub: 'creative, placement, CTA', icon: <ImageIcon size={14} /> },
]

export function MetaCampaignSetup() {
    const [activeTab, setActiveTab] = useState<TabId>('campaigns')
    const [campaigns, setCampaigns] = useState<MetaCampaign[]>([defaultCampaign()])
    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
    const [activeAdSetId, setActiveAdSetId] = useState<string | null>(null)

    const allAdSets = campaigns.flatMap(c => c.adSets)
    const selectedAdSets = activeAdSetId
        ? allAdSets.filter(s => s.id === activeAdSetId)
        : activeCampaignId
            ? allAdSets.filter(s => s.campaignId === activeCampaignId)
            : allAdSets

    // ── Campaign CRUD
    const addCampaign = () => {
        const c = defaultCampaign(campaigns.length + 1)
        setCampaigns(p => [...p, c])
    }
    const updateCampaign = (id: string, patch: Partial<MetaCampaign>) =>
        setCampaigns(p => p.map(c => c.id === id ? { ...c, ...patch } : c))
    const deleteCampaign = (id: string) =>
        setCampaigns(p => p.filter(c => c.id !== id))

    // ── Ad Set CRUD
    const addAdSet = (campaignId: string) => {
        const s = defaultAdSet(campaignId, allAdSets.length + 1)
        setCampaigns(p => p.map(c => c.id === campaignId ? { ...c, adSets: [...c.adSets, s] } : c))
    }
    const updateAdSet = (campaignId: string, adSetId: string, patch: Partial<AdSet>) =>
        setCampaigns(p => p.map(c => c.id === campaignId
            ? { ...c, adSets: c.adSets.map(s => s.id === adSetId ? { ...s, ...patch } : s) }
            : c))
    const deleteAdSet = (campaignId: string, adSetId: string) =>
        setCampaigns(p => p.map(c => c.id === campaignId
            ? { ...c, adSets: c.adSets.filter(s => s.id !== adSetId) }
            : c))

    // ── Ad CRUD
    const addAd = (adSetId: string) => {
        const ad = defaultAd()
        setCampaigns(p => p.map(c => ({
            ...c, adSets: c.adSets.map(s =>
                s.id === adSetId ? { ...s, ads: [...s.ads, ad] } : s)
        })))
    }
    const updateAd = (adSetId: string, ad: MetaAd) =>
        setCampaigns(p => p.map(c => ({
            ...c, adSets: c.adSets.map(s =>
                s.id === adSetId ? { ...s, ads: s.ads.map(a => a.id === ad.id ? ad : a) } : s)
        })))

    return (
        <div className="w-full space-y-4">
            {/* Tab content */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">

                {/* ── Campaigns ───────────────────────── */}
                {activeTab === 'campaigns' && (
                    <div className="space-y-3">
                        {campaigns.map(c => (
                            <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.025] overflow-hidden">
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#1877f2]/10 flex items-center justify-center shrink-0">
                                        <Layers size={15} className="text-[#1877f2]" />
                                    </div>
                                    <input value={c.name} onChange={e => updateCampaign(c.id, { name: e.target.value })}
                                        className="flex-1 bg-transparent text-white font-semibold text-sm focus:outline-none" />
                                    <button onClick={() => { setActiveCampaignId(c.id); setActiveTab('adsets') }}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors">
                                        {c.adSets.length} ad set{c.adSets.length !== 1 ? 's' : ''} <ChevronRight size={12} />
                                    </button>
                                    <button onClick={() => deleteCampaign(c.id)}
                                        className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-600 uppercase tracking-wider">Objective</label>
                                        <select value={c.objective}
                                            onChange={e => updateCampaign(c.id, { objective: e.target.value as MetaObjective })}
                                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none">
                                            {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-600 uppercase tracking-wider">Buying Type</label>
                                        <select value={c.buyingType}
                                            onChange={e => updateCampaign(c.id, { buyingType: e.target.value as 'auction' | 'reservation' })}
                                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none">
                                            <option value="auction">Auction</option>
                                            <option value="reservation">Reservation</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addCampaign}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 hover:border-[#1877f2]/50 text-xs text-slate-600 hover:text-[#1877f2] rounded-xl transition-colors">
                            <Plus size={13} /> New Campaign
                        </button>
                    </div>
                )}

                {/* ── Ad Sets ─────────────────────────── */}
                {activeTab === 'adsets' && (
                    <div className="space-y-3">
                        {campaigns.map(c => (
                            <div key={c.id}>
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 px-1">{c.name}</p>
                                {c.adSets.map(s => (
                                    <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.025] overflow-hidden mb-2">
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <Zap size={15} className="text-emerald-400" />
                                            </div>
                                            <input value={s.name} onChange={e => updateAdSet(c.id, s.id, { name: e.target.value })}
                                                className="flex-1 bg-transparent text-white font-semibold text-sm focus:outline-none" />
                                            <button onClick={() => { setActiveAdSetId(s.id); setActiveTab('ads') }}
                                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-white">
                                                {s.ads.length} ad{s.ads.length !== 1 ? 's' : ''} <ChevronRight size={12} />
                                            </button>
                                            <button onClick={() => deleteAdSet(c.id, s.id)}
                                                className="p-1 text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-600 uppercase tracking-wider">Audience</label>
                                                <input value={s.audience} onChange={e => updateAdSet(c.id, s.id, { audience: e.target.value })}
                                                    placeholder="e.g., Marketing Managers 30-55"
                                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-700 px-2 py-1.5 focus:outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-600 uppercase tracking-wider">Budget / day (USD)</label>
                                                <input value={s.budget} onChange={e => updateAdSet(c.id, s.id, { budget: e.target.value })}
                                                    placeholder="e.g., 50"
                                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-700 px-2 py-1.5 focus:outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-600 uppercase tracking-wider">Start Date</label>
                                                <input type="date" value={s.startDate} onChange={e => updateAdSet(c.id, s.id, { startDate: e.target.value })}
                                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-600 uppercase tracking-wider">End Date</label>
                                                <input type="date" value={s.endDate} onChange={e => updateAdSet(c.id, s.id, { endDate: e.target.value })}
                                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addAdSet(c.id)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/10 hover:border-emerald-500/40 text-xs text-slate-600 hover:text-emerald-400 rounded-xl transition-colors mb-3">
                                    <Plus size={13} /> New Ad Set in {c.name}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Ads ─────────────────────────────── */}
                {activeTab === 'ads' && (
                    <AdsTab
                        adSets={selectedAdSets}
                        campaigns={campaigns}
                        onUpdateAd={updateAd}
                        onAddAd={addAd}
                    />
                )}
            </div>
        </div>
    )
}
