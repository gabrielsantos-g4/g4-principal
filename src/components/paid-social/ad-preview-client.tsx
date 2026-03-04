'use client'

import { useEffect, useState, useRef } from 'react'
import { getAdShare, updateAdShare, getAdShareLogs, AdShareData, AdShareLog } from '@/actions/ads-share-actions'
import { CheckCircle, Clock, Edit3, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

// ── Inline-editable field ────────────────────────────────────────────────────
function EditableField({
    value,
    onSave,
    multiline = false,
    className = '',
    placeholder = '',
}: {
    value: string
    onSave: (v: string) => Promise<void>
    multiline?: boolean
    className?: string
    placeholder?: string
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const [saving, setSaving] = useState(false)
    const ref = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)

    useEffect(() => { setDraft(value) }, [value])
    useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

    const commit = async () => {
        if (draft === value) { setEditing(false); return }
        setSaving(true)
        await onSave(draft)
        setSaving(false)
        setEditing(false)
    }

    if (editing) {
        const sharedClass = `w-full bg-blue-50 border-2 border-blue-400 rounded px-2 py-1 text-sm focus:outline-none resize-none ${className}`
        return multiline ? (
            <textarea
                ref={ref as any}
                className={sharedClass}
                rows={4}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
            />
        ) : (
            <input
                ref={ref as any}
                className={sharedClass}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => {
                    if (e.key === 'Enter') commit()
                    if (e.key === 'Escape') { setDraft(value); setEditing(false) }
                }}
            />
        )
    }

    return (
        <span
            className={`group relative cursor-pointer hover:bg-blue-50 hover:ring-2 hover:ring-blue-300 rounded px-1 transition-all ${className}`}
            onClick={() => setEditing(true)}
            title="Click to edit"
        >
            {saving ? <Loader2 size={12} className="inline animate-spin mr-1 text-blue-500" /> : null}
            {value || <span className="text-gray-400 italic">{placeholder}</span>}
            <Edit3 size={11} className="inline ml-1.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
    )
}

// ── Format relative time ─────────────────────────────────────────────────────
function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

const FIELD_LABELS: Record<string, string> = {
    text: 'Introductory Text',
    headline: 'Headline',
    cta: 'CTA',
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function AdPreviewClient({ token }: { token: string }) {
    const [ad, setAd] = useState<AdShareData | null>(null)
    const [logs, setLogs] = useState<AdShareLog[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [showLog, setShowLog] = useState(false)
    const [saveFlash, setSaveFlash] = useState<string | null>(null)

    useEffect(() => {
        Promise.all([
            getAdShare(token),
            getAdShareLogs(token),
        ]).then(([shareRes, logsRes]) => {
            if (!shareRes.success) { setError(shareRes.error ?? 'Not found'); return }
            setAd(shareRes.data!.ad_data as AdShareData)
            setLogs(logsRes.logs ?? [])
            setLoading(false)
        })
    }, [token])

    const refreshLogs = async () => {
        const res = await getAdShareLogs(token)
        if (res.success) setLogs(res.logs ?? [])
    }

    const handleSave = async (field: keyof AdShareData, newValue: string) => {
        if (!ad) return
        const oldValue = String(ad[field] ?? '')
        const updated = { ...ad, [field]: newValue }
        setAd(updated)
        const res = await updateAdShare(token, field, oldValue, newValue, updated)
        if (res.success) {
            setSaveFlash(FIELD_LABELS[field] ?? field)
            setTimeout(() => setSaveFlash(null), 2500)
            await refreshLogs()
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#0a66c2]" size={36} />
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
            </div>
            <p className="text-gray-700 font-semibold text-lg">{error}</p>
            <p className="text-gray-500 text-sm">Contact the person who shared this link.</p>
        </div>
    )

    if (!ad) return null

    return (
        <div className="min-h-screen bg-[#f3f2ef] font-sans">
            {/* Header bar */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#0a66c2] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">Ad Copy Review</span>
                    <span className="text-gray-400 text-sm">·</span>
                    <span className="text-gray-600 text-sm truncate max-w-xs">{ad.name}</span>
                </div>
                <div className="flex items-center gap-3">
                    {saveFlash && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-full px-3 py-1">
                            <CheckCircle size={12} /> "{saveFlash}" saved
                        </span>
                    )}
                    <button
                        onClick={() => setShowLog(v => !v)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#0a66c2] border border-gray-200 hover:border-[#0a66c2]/40 rounded-full px-3 py-1.5 transition-colors"
                    >
                        <Clock size={12} /> Revision Log ({logs.length})
                        {showLog ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>
            </div>

            {/* Revision Log Panel */}
            {showLog && (
                <div className="bg-white border-b border-gray-200 px-4 py-4 max-w-3xl mx-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock size={14} className="text-[#0a66c2]" /> Copy Revision History
                    </h3>
                    {logs.length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 text-center">No edits yet. Click any text in the preview to start editing.</p>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {logs.map(log => (
                                <div key={log.id} className="flex gap-3 text-sm">
                                    <div className="w-7 h-7 rounded-full bg-[#0a66c2]/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#0a66c2] uppercase">
                                        {log.user_name.slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-800 text-xs">
                                            <span className="font-semibold">{log.user_name}</span> edited <span className="font-medium text-[#0a66c2]">{FIELD_LABELS[log.field] ?? log.field}</span>
                                        </p>
                                        <div className="mt-1 space-y-0.5">
                                            <p className="text-[11px] text-gray-400 line-through truncate">"{log.old_value}"</p>
                                            <p className="text-[11px] text-gray-600 truncate">"{log.new_value}"</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(log.edited_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Ad Preview Card */}
            <div className="flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-[552px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                    {/* Post header */}
                    <div className="p-4 flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#0a66c2] flex items-center justify-center shrink-0 text-white font-bold text-lg">Co</div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm leading-tight">Your Company</p>
                            <p className="text-xs text-gray-500">Promoted</p>
                        </div>
                    </div>

                    {/* Intro text — editable */}
                    <div className="px-4 pb-3">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            <EditableField
                                value={ad.text}
                                onSave={v => handleSave('text', v)}
                                multiline
                                placeholder="Introductory text..."
                            />
                        </p>
                    </div>

                    {/* Image / media */}
                    {ad.imageUrl ? (
                        <img src={ad.imageUrl} alt="" className="w-full object-cover max-h-72" />
                    ) : (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs border-t border-b border-gray-200">
                            No image
                        </div>
                    )}

                    {/* Headline + CTA bar — editable */}
                    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                                <EditableField
                                    value={ad.headline}
                                    onSave={v => handleSave('headline', v)}
                                    placeholder="Headline..."
                                />
                            </p>
                        </div>
                        <button className="shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors">
                            <EditableField
                                value={ad.cta || 'Learn More'}
                                onSave={v => handleSave('cta', v)}
                                placeholder="CTA"
                            />
                        </button>
                    </div>

                    {/* Footer tip */}
                    <div className="px-4 py-3 border-t border-gray-100">
                        <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                            <Edit3 size={10} /> Click any text above to edit it · changes are saved automatically
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
