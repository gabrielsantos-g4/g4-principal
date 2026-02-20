'use client'

import { useState, useEffect, useRef } from 'react'
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
    Image as ImageIcon, Film, LayoutGrid, CheckCircle2, X, Upload,
    ThumbsUp, MessageSquare, Share2, Repeat2, Heart, Bookmark,
    Globe, MoreHorizontal, ChevronRight as ChevronRightSm,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createScheduledPost, getScheduledPosts, getMotherIdeas } from '@/actions/organic-social-actions'
import { createClient } from '@/lib/supabase-client'

interface PostEvent {
    id: string
    channel: string
    placement: string
    media_urls: any[]
    caption: string
    scheduled_date: string
    scheduled_time: string
    status: 'draft' | 'scheduled' | 'published'
}

interface UserProfile {
    name: string
    avatar: string | null
    handle: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Normalized placement → per-channel mapping
// "Common name" → which channels support it and what they call it
const PLACEMENT_MAP: Record<string, Partial<Record<string, string>>> = {
    'Post': { Instagram: 'Feed', Facebook: 'Feed', LinkedIn: 'Post', Reddit: 'Post', X: 'Post' },
    'Story': { Instagram: 'Stories', Facebook: 'Stories' },
    'Reel': { Instagram: 'Reels' },
    'Article': { LinkedIn: 'Article' },
}

// All placements a channel supports (keys of PLACEMENT_MAP where channel appears)
const CHANNEL_SUPPORTED_PLACEMENTS: Record<string, string[]> = {
    Instagram: ['Post', 'Story', 'Reel'],
    Facebook: ['Post', 'Story'],
    LinkedIn: ['Post', 'Article'],
    Reddit: ['Post'],
    X: ['Post'],
}

// Compute intersection of placements across selected channels
function commonPlacements(channels: string[]): string[] {
    if (channels.length === 0) return []
    return channels.reduce((acc, ch) =>
        acc.filter(p => CHANNEL_SUPPORTED_PLACEMENTS[ch]?.includes(p)),
        CHANNEL_SUPPORTED_PLACEMENTS[channels[0]] ?? []
    )
}

// Channel icon SVGs (inline, small)
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    Instagram: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497" /><stop offset="45%" stopColor="#fd5949" /><stop offset="60%" stopColor="#d6249f" /><stop offset="90%" stopColor="#285AEB" /></radialGradient></defs>
            <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    ),
    Facebook: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877f2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
    ),
    LinkedIn: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0a66c2]"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
    ),
    Reddit: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#ff4500]"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
    ),
    X: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    ),
}

const MEDIA_TYPES = ['Image', 'Carousel', 'Video'] as const
type MediaType = typeof MEDIA_TYPES[number]

const MEDIA_ACCEPT: Record<MediaType, string> = { Image: 'image/*', Carousel: 'image/*', Video: 'video/*' }
const MEDIA_MAX: Record<MediaType, number> = { Image: 1, Carousel: 10, Video: 1 }

// ─── Styled Select (native) ────────────────────────────────────────────────
function StyledSelect({ value, onChange, options, placeholder = 'Select', disabled = false }: {
    value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; disabled?: boolean
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                style={{ colorScheme: 'dark' }}
                className={`w-full appearance-none bg-white/5 border border-white/10 rounded-md px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="" disabled className="bg-[#171717] text-slate-400">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt} value={opt} className="bg-[#171717] text-white">{opt}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    )
}

// ─── Media Uploader ────────────────────────────────────────────────────────
function MediaUploader({ mediaType, files, onChange }: { mediaType: MediaType; files: File[]; onChange: (f: File[]) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const max = MEDIA_MAX[mediaType]
    const accept = MEDIA_ACCEPT[mediaType]
    const Icon = mediaType === 'Video' ? Film : mediaType === 'Carousel' ? LayoutGrid : ImageIcon

    const handleFiles = (list: FileList | null) => {
        if (!list) return
        onChange(Array.from(list).slice(0, max))
    }

    return (
        <div className="space-y-2">
            <input ref={inputRef} type="file" accept={accept} multiple={max > 1} className="hidden" onChange={e => handleFiles(e.target.files)} />
            {files.length === 0 ? (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-md px-4 py-5 text-slate-400 hover:text-white hover:border-white/40 transition-colors text-sm"
                >
                    <Upload className="w-4 h-4" />
                    {mediaType === 'Video' ? 'Upload Video' : mediaType === 'Carousel' ? 'Upload Images (up to 10)' : 'Upload Image'}
                </button>
            ) : (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {files.map((file, i) => (
                            <div key={i} className="relative group w-16 h-16">
                                {mediaType === 'Video'
                                    ? <div className="w-full h-full rounded bg-white/10 flex items-center justify-center text-slate-400"><Film className="w-5 h-5" /></div>
                                    : <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded border border-white/10" />
                                }
                                <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-2.5 h-2.5 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {mediaType === 'Carousel' && files.length < max && (
                        <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                            <Upload className="w-3 h-3" /> Add more ({files.length}/{max})
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Auto-resizing textarea ────────────────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, minRows = 2 }: {
    value: string; onChange: (v: string) => void; placeholder: string; minRows?: number
}) {
    const ref = useRef<HTMLTextAreaElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [value])
    return (
        <textarea
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={minRows}
            className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none overflow-hidden px-3 py-2.5"
        />
    )
}

// ─── Avatar placeholder ────────────────────────────────────────────────────
function Avatar({ src, name, size = 'md', className = '' }: { src: string | null; name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2)
    const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-xs'
    return src
        ? <img src={src} alt={name} className={`${dim} rounded-full object-cover ring-2 ring-white/10 ${className}`} />
        : <div className={`${dim} rounded-full bg-gradient-to-br from-[#1C73E8] to-[#a855f7] flex items-center justify-center font-bold text-white ${className}`}>{initials}</div>
}

// ─── Platform Previews ─────────────────────────────────────────────────────
function LinkedInPreview({ user, caption, files, mediaType, placement }: {
    user: UserProfile; caption: string; files: File[]; mediaType: MediaType; placement: string
}) {
    const mediaUrl = files.length > 0 ? URL.createObjectURL(files[0]) : null
    const isArticle = placement === 'Article'

    return (
        <div className="bg-white rounded-lg overflow-hidden text-[#000000e6] text-sm shadow-lg">
            {/* LinkedIn Nav bar hint */}
            <div className="bg-[#0a66c2] px-3 py-2 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                <span className="text-white font-bold text-xs tracking-wide">LinkedIn</span>
            </div>

            <div className="p-3">
                {/* Post Header */}
                <div className="flex items-start gap-2 mb-2">
                    <Avatar src={user.avatar} name={user.name} />
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[13px] text-[#000000e6] truncate">{user.name || 'Your Name'}</div>
                        <div className="text-[11px] text-[#00000099] leading-tight">Marketing Specialist • 1st</div>
                        <div className="text-[10px] text-[#00000099] flex items-center gap-1">
                            <span>Just now</span><span>•</span><Globe className="w-2.5 h-2.5" />
                        </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-[#00000066]" />
                </div>

                {/* Caption */}
                {caption && (
                    <p className="text-[12px] text-[#000000e6] mb-2 whitespace-pre-wrap leading-snug line-clamp-6">{caption}</p>
                )}
                {!caption && (
                    <p className="text-[12px] text-[#00000040] italic mb-2">Your caption will appear here...</p>
                )}

                {/* Media */}
                {mediaUrl && mediaType !== 'Video' && (
                    <div className="-mx-3 mb-2 bg-[#f3f2ef] flex items-center justify-center overflow-hidden"
                        style={{ aspectRatio: '1.91/1', maxHeight: '220px' }}
                    >
                        <img src={mediaUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                )}
                {mediaUrl && mediaType === 'Video' && (
                    <div className="rounded bg-black flex items-center justify-center h-32 -mx-3 mb-2">
                        <Film className="w-8 h-8 text-white/40" />
                    </div>
                )}

                {/* Article card */}
                {isArticle && (
                    <div className="border border-gray-200 rounded overflow-hidden mb-2">
                        {mediaUrl ? <img src={mediaUrl} alt="" className="w-full object-cover h-20" /> : <div className="h-20 bg-gray-100" />}
                        <div className="px-3 py-2">
                            <div className="text-[12px] font-semibold">Article Preview</div>
                            <div className="text-[10px] text-gray-400">linkedin.com</div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-[11px] text-[#00000066]">
                    <button className="flex items-center gap-1 hover:text-[#0a66c2] px-2 py-1 rounded"><ThumbsUp className="w-3.5 h-3.5" /><span>Like</span></button>
                    <button className="flex items-center gap-1 hover:text-[#0a66c2] px-2 py-1 rounded"><MessageSquare className="w-3.5 h-3.5" /><span>Comment</span></button>
                    <button className="flex items-center gap-1 hover:text-[#0a66c2] px-2 py-1 rounded"><Repeat2 className="w-3.5 h-3.5" /><span>Repost</span></button>
                    <button className="flex items-center gap-1 hover:text-[#0a66c2] px-2 py-1 rounded"><Share2 className="w-3.5 h-3.5" /><span>Send</span></button>
                </div>
            </div>
        </div>
    )
}

function InstagramPreview({ user, caption, files, mediaType, placement }: {
    user: UserProfile; caption: string; files: File[]; mediaType: MediaType; placement: string
}) {
    const isStory = placement === 'Stories'
    const isReels = placement === 'Reels'
    const mediaUrl = files.length > 0 ? URL.createObjectURL(files[0]) : null

    if (isStory) {
        return (
            <div className="bg-black rounded-xl overflow-hidden text-white relative" style={{ aspectRatio: '9/16', maxHeight: '320px' }}>
                <div className="absolute inset-0">
                    {mediaUrl
                        ? <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900" />
                    }
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                {/* Story progress bars */}
                <div className="absolute top-3 left-3 right-3 flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className={`h-0.5 flex-1 rounded-full ${i === 1 ? 'bg-white' : 'bg-white/30'}`} />)}
                </div>
                {/* Story header */}
                <div className="absolute top-6 left-3 right-3 flex items-center gap-2">
                    <Avatar src={user.avatar} name={user.name || 'You'} size="sm" />
                    <span className="text-[11px] font-semibold drop-shadow">{user.name || 'your_username'}</span>
                    <span className="text-[10px] text-white/60">Just now</span>
                </div>
                {/* Caption at bottom */}
                {caption && (
                    <div className="absolute bottom-6 left-3 right-3 text-center text-xs text-white drop-shadow-lg line-clamp-3">{caption}</div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden text-sm shadow-lg">
            {/* Instagram header */}
            <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
                <svg viewBox="0 0 24 24" className="w-5 h-5"><defs><radialGradient id="rg" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497" /><stop offset="5%" stopColor="#fdf497" /><stop offset="45%" stopColor="#fd5949" /><stop offset="60%" stopColor="#d6249f" /><stop offset="90%" stopColor="#285AEB" /></radialGradient></defs><path fill="url(#rg)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                <span className="font-bold text-xs text-transparent bg-clip-text" style={{ backgroundImage: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>Instagram</span>
            </div>

            {/* Post header */}
            <div className="flex items-center gap-2 px-3 py-2">
                <Avatar src={user.avatar} name={user.name || 'You'} />
                <div>
                    <div className="font-semibold text-[12px]">{user.handle || user.name || 'your_username'}</div>
                    <div className="text-[10px] text-gray-400">Just now</div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 ml-auto" />
            </div>

            {/* Media */}
            <div className="bg-[#fafafa] flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: isReels ? '9/16' : '1', maxHeight: isReels ? '300px' : '260px' }}
            >
                {mediaUrl
                    ? <img src={mediaUrl} alt="" className="max-w-full max-h-full" style={{ maxHeight: isReels ? '300px' : '260px' }} />
                    : <ImageIcon className="w-10 h-10 text-gray-300" />
                }
            </div>

            {/* Actions */}
            <div className="px-3 pt-2 pb-1">
                <div className="flex items-center gap-3 mb-1">
                    <Heart className="w-4 h-4 text-gray-700" />
                    <MessageSquare className="w-4 h-4 text-gray-700" />
                    <Share2 className="w-4 h-4 text-gray-700" />
                    <Bookmark className="w-4 h-4 text-gray-700 ml-auto" />
                </div>
                <div className="text-[11px] font-semibold text-gray-800">128 likes</div>
                {caption && <p className="text-[11px] text-gray-800 leading-snug line-clamp-3"><span className="font-semibold">{user.handle || user.name || 'username'}</span> {caption}</p>}
                {!caption && <p className="text-[11px] text-gray-400 italic">Caption preview...</p>}
            </div>
        </div>
    )
}

function XPreview({ user, caption, files, mediaType }: {
    user: UserProfile; caption: string; files: File[]; mediaType: MediaType
}) {
    const mediaUrl = files.length > 0 ? URL.createObjectURL(files[0]) : null
    return (
        <div className="bg-black border border-white/10 rounded-xl overflow-hidden text-white text-sm">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                <span className="font-bold text-xs">X (Twitter)</span>
            </div>
            <div className="p-3 flex gap-2">
                <Avatar src={user.avatar} name={user.name || 'You'} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="font-bold text-[13px] truncate">{user.name || 'Your Name'}</span>
                        <span className="text-white/40 text-[12px] truncate">@{user.handle || 'yourhandle'}</span>
                        <span className="text-white/40 text-[12px]">· just now</span>
                    </div>
                    {caption
                        ? <p className="text-[13px] leading-snug whitespace-pre-wrap mb-2 line-clamp-6">{caption}</p>
                        : <p className="text-[13px] text-white/30 italic mb-2">Your tweet will appear here...</p>
                    }
                    {mediaUrl && (
                        <div className="rounded-xl overflow-hidden mb-2 bg-black flex items-center justify-center"
                            style={{ maxHeight: '220px' }}
                        >
                            {mediaType === 'Video'
                                ? <div className="h-28 bg-white/5 flex items-center justify-center w-full"><Film className="w-8 h-8 text-white/30" /></div>
                                : <img src={mediaUrl} alt="" className="w-full h-full object-contain max-h-[220px]" />
                            }
                        </div>
                    )}
                    <div className="flex items-center gap-5 text-white/40 text-[11px]">
                        <button className="flex items-center gap-1 hover:text-blue-400"><MessageSquare className="w-3.5 h-3.5" /><span>Reply</span></button>
                        <button className="flex items-center gap-1 hover:text-green-400"><Repeat2 className="w-3.5 h-3.5" /><span>Repost</span></button>
                        <button className="flex items-center gap-1 hover:text-red-400"><Heart className="w-3.5 h-3.5" /><span>Like</span></button>
                        <button className="flex items-center gap-1 hover:text-blue-400"><Share2 className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FacebookPreview({ user, caption, files, mediaType }: {
    user: UserProfile; caption: string; files: File[]; mediaType: MediaType
}) {
    const mediaUrl = files.length > 0 ? URL.createObjectURL(files[0]) : null
    return (
        <div className="bg-white rounded-lg overflow-hidden text-sm shadow-md">
            <div className="bg-[#1877f2] px-3 py-2 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                <span className="text-white font-bold text-xs">Facebook</span>
            </div>
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Avatar src={user.avatar} name={user.name || 'You'} />
                    <div>
                        <div className="font-semibold text-[13px] text-gray-900">{user.name || 'Your Name'}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">Just now · <Globe className="w-2.5 h-2.5" /></div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400 ml-auto" />
                </div>
                {caption
                    ? <p className="text-[12px] text-gray-800 mb-2 whitespace-pre-wrap leading-snug line-clamp-6">{caption}</p>
                    : <p className="text-[12px] text-gray-400 italic mb-2">Caption preview...</p>
                }
                {mediaUrl && (
                    <div className="-mx-3 mb-2 bg-[#f0f2f5] flex items-center justify-center overflow-hidden" style={{ maxHeight: '260px' }}>
                        {mediaType === 'Video'
                            ? <div className="h-32 bg-black flex items-center justify-center w-full"><Film className="w-8 h-8 text-white/40" /></div>
                            : <img src={mediaUrl} alt="" className="w-full object-contain max-h-[260px]" />
                        }
                    </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-[11px] text-gray-500">
                    <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><ThumbsUp className="w-3.5 h-3.5" /><span>Like</span></button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><MessageSquare className="w-3.5 h-3.5" /><span>Comment</span></button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><Share2 className="w-3.5 h-3.5" /><span>Share</span></button>
                </div>
            </div>
        </div>
    )
}

function RedditPreview({ user, caption, files }: { user: UserProfile; caption: string; files: File[] }) {
    const mediaUrl = files.length > 0 ? URL.createObjectURL(files[0]) : null
    return (
        <div className="bg-[#1a1a1b] border border-[#343536] rounded-md overflow-hidden text-white text-sm">
            <div className="bg-[#ff4500] px-3 py-2 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
                <span className="font-bold text-xs">Reddit</span>
            </div>
            <div className="p-3">
                <div className="text-[10px] text-[#818384] mb-1">r/YourSubreddit · Posted by u/{user.name || 'yourname'}</div>
                <div className="font-semibold text-[13px] mb-2 text-white">{caption ? caption.split('\n')[0] : 'Post title preview'}</div>
                {mediaUrl && (
                    <div className="w-full bg-[#0d1117] flex items-center justify-center rounded mb-2 overflow-hidden" style={{ maxHeight: '220px' }}>
                        <img src={mediaUrl} alt="" className="w-full object-contain max-h-[220px]" />
                    </div>
                )}
                {caption && caption.split('\n').length > 1 && <p className="text-[11px] text-[#d7dadc] line-clamp-3">{caption.split('\n').slice(1).join('\n')}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[#818384]">
                    <button className="flex items-center gap-1 hover:text-white"><ThumbsUp className="w-3 h-3" />Upvote</button>
                    <button className="flex items-center gap-1 hover:text-white"><MessageSquare className="w-3 h-3" />Comment</button>
                    <button className="flex items-center gap-1 hover:text-white"><Share2 className="w-3 h-3" />Share</button>
                </div>
            </div>
        </div>
    )
}

function EmptyPreview() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-slate-700" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Select a channel</p>
                <p className="text-xs text-slate-600 mt-1">Your post preview will appear here</p>
            </div>
        </div>
    )
}

function PostPreview({ channel, placement, caption, files, mediaType, user }: {
    channel: string; placement: string; caption: string; files: File[]; mediaType: MediaType; user: UserProfile
}) {
    if (!channel) return <EmptyPreview />
    switch (channel) {
        case 'LinkedIn': return <LinkedInPreview user={user} caption={caption} files={files} mediaType={mediaType} placement={placement} />
        case 'Instagram': return <InstagramPreview user={user} caption={caption} files={files} mediaType={mediaType} placement={placement} />
        case 'X': return <XPreview user={user} caption={caption} files={files} mediaType={mediaType} />
        case 'Facebook': return <FacebookPreview user={user} caption={caption} files={files} mediaType={mediaType} />
        case 'Reddit': return <RedditPreview user={user} caption={caption} files={files} />
        default: return <EmptyPreview />
    }
}

// ─── Schedule View ─────────────────────────────────────────────────────────
export function ScheduleView() {
    const [currentDate, setCurrentDate] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
    const [events, setEvents] = useState<PostEvent[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [isLoading, setIsLoading] = useState(false)

    const [channels, setChannels] = useState<string[]>([])
    const [placement, setPlacement] = useState('')
    const [previewChannel, setPreviewChannel] = useState('')
    const [mediaType, setMediaType] = useState<MediaType>('Image')
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [caption, setCaption] = useState('')
    const [time, setTime] = useState('09:00')

    const [user, setUser] = useState<UserProfile>({ name: '', avatar: null, handle: '' })

    const [viewEvent, setViewEvent] = useState<PostEvent | null>(null)
    const [motherIdeas, setMotherIdeas] = useState<{ id: string; title: string }[]>([])
    const [selectedMotherIdeaId, setSelectedMotherIdeaId] = useState<string | null>(null)

    useEffect(() => {
        fetchPosts()
        fetchUser()
        getMotherIdeas().then(data => {
            setMotherIdeas(data.map((d: any) => ({ id: d.id, title: d.title })))
        })
    }, [])

    async function fetchUser() {
        try {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || ''
                const avatar = authUser.user_metadata?.avatar_url || null
                const handle = name.toLowerCase().replace(/\s+/g, '') || ''
                setUser({ name, avatar, handle })
            }
        } catch { }
    }

    async function fetchPosts() {
        const posts = await getScheduledPosts()
        setEvents(posts)
    }

    const today = new Date(); today.setHours(0, 0, 0, 0)

    const openModal = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        if (clickedDate < today) return
        setSelectedDate(clickedDate)
        setChannels([]); setPlacement(''); setPreviewChannel('')
        setMediaType('Image'); setMediaFiles([])
        setCaption(''); setTime('09:00')
        setSelectedMotherIdeaId(null)
        setIsModalOpen(true)
    }

    const openViewEvent = (event: PostEvent) => {
        setViewEvent(event)
    }

    const fullCaption = caption

    const handleSave = async () => {
        if (!selectedDate || channels.length === 0 || !placement) {
            toast.error('Please select at least one channel and a placement')
            return
        }
        setIsLoading(true)
        try {
            // Save one record per channel
            await Promise.all(channels.map(ch =>
                createScheduledPost({
                    channel: ch,
                    placement: PLACEMENT_MAP[placement]?.[ch] || placement,
                    caption: fullCaption,
                    scheduled_date: format(selectedDate!, 'yyyy-MM-dd'),
                    scheduled_time: time,
                    media_urls: [],
                })
            ))
            toast.success(
                channels.length > 1
                    ? `Scheduled for ${channels.length} channels!`
                    : 'Post scheduled!',
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> }
            )
            fetchPosts(); setIsModalOpen(false)
        } catch { toast.error('Unexpected error') }
        finally { setIsLoading(false) }
    }

    const getStatusColor = (status: PostEvent['status']) => {
        switch (status) {
            case 'published': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white capitalize">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors">Today</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-xl">
                <div className="grid grid-cols-7 border-b border-white/10 bg-[#111]">
                    {DAYS.map(day => (
                        <div key={day} className="py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[100px] divide-x divide-white/10 bg-black/40">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-white/[0.02]" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                        const dateStr = format(cellDate, 'yyyy-MM-dd')
                        const dayEvents = events.filter(e => e.scheduled_date === dateStr)
                        const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
                        const isPast = cellDate < today
                        return (
                            <div
                                key={day}
                                onClick={() => !isPast && openModal(day)}
                                className={`p-2 relative group transition-all border-b border-white/10 ${isPast ? 'opacity-50' : 'hover:bg-white/[0.04] cursor-pointer'
                                    }`}
                            >
                                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#1C73E8] text-white' : isPast ? 'text-slate-600' : 'text-slate-400'
                                    }`}>{day}</span>
                                <div className="space-y-1">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={e => { e.stopPropagation(); openViewEvent(event) }}
                                            className={`text-[9px] px-1.5 py-0.5 rounded border truncate font-medium leading-tight cursor-pointer hover:opacity-80 ${getStatusColor(event.status)}`}
                                            title={`${event.channel} – click to view`}
                                        >
                                            {event.scheduled_time?.substring(0, 5)} — {event.channel}
                                        </div>
                                    ))}
                                </div>
                                {!isPast && (
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs hover:bg-[#1C73E8]">+</div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Modal – wide, two-column */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent
                    className="bg-[#171717] border-white/10 text-white p-0 overflow-hidden !max-w-none"
                    style={{ width: '95vw', maxWidth: '1500px', height: '90vh', maxHeight: '90vh' }}
                >
                    {/* Hidden title for screen-reader accessibility (Radix requirement) */}
                    <DialogTitle className="sr-only">Schedule Post</DialogTitle>
                    <div className="grid h-full" style={{ gridTemplateColumns: '520px 1fr' }}>
                        {/* ── LEFT: Form ── */}
                        <div className="flex flex-col border-r border-white/10 overflow-y-auto max-h-[90vh]">
                            <div className="px-6 pt-5 pb-3 border-b border-white/10">
                                <h2 className="text-base font-bold">Schedule Post</h2>
                            </div>
                            <div className="px-6 py-4 space-y-4 flex-1">
                                {/* ── Channel multi-select ── */}
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-400 text-xs">Channels</Label>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {Object.keys(CHANNEL_SUPPORTED_PLACEMENTS).map(ch => {
                                                const isSelected = channels.includes(ch)
                                                return (
                                                    <button
                                                        key={ch}
                                                        type="button"
                                                        title={ch}
                                                        onClick={() => {
                                                            const next = isSelected
                                                                ? channels.filter(c => c !== ch)
                                                                : [...channels, ch]
                                                            setChannels(next)
                                                            setPlacement('')
                                                            setPreviewChannel(next[0] || '')
                                                        }}
                                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${isSelected
                                                            ? 'border-[#1C73E8] bg-[#1C73E8]/10'
                                                            : 'border-white/10 bg-white/5 grayscale opacity-40 hover:opacity-70'
                                                            }`}
                                                    >
                                                        {CHANNEL_ICONS[ch]}
                                                        <span className="text-[9px] font-medium text-white/60">{ch}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* ── Placement (intersection) ── */}
                                    {channels.length > 0 && (() => {
                                        const opts = commonPlacements(channels)
                                        return (
                                            <div className="space-y-1.5">
                                                <Label className="text-slate-400 text-xs">Placement</Label>
                                                {opts.length > 0 ? (
                                                    <div className="flex gap-2 flex-wrap">
                                                        {opts.map(p => (
                                                            <button
                                                                key={p}
                                                                type="button"
                                                                onClick={() => setPlacement(p)}
                                                                className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${placement === p
                                                                    ? 'bg-[#1C73E8]/20 border-[#1C73E8] text-[#1C73E8]'
                                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                                                                    }`}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2">
                                                        No common placement between selected channels
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })()}

                                </div>

                                {/* Mother Idea (Content Pillar) */}
                                {motherIdeas.length > 0 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-400 text-xs">Content Pillar</Label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {motherIdeas.map(idea => {
                                                const isSelected = selectedMotherIdeaId === idea.id
                                                return (
                                                    <button
                                                        key={idea.id}
                                                        type="button"
                                                        onClick={() => setSelectedMotherIdeaId(isSelected ? null : idea.id)}
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${isSelected
                                                                ? 'bg-[#1C73E8]/20 border-[#1C73E8] text-[#1C73E8]'
                                                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                                                            }`}
                                                    >
                                                        {idea.title}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Media Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-slate-400 text-xs">Media Type</Label>
                                    <div className="flex gap-2">
                                        {MEDIA_TYPES.map(type => {
                                            const Icon = type === 'Video' ? Film : type === 'Carousel' ? LayoutGrid : ImageIcon
                                            return (
                                                <button key={type} type="button" onClick={() => { setMediaType(type); setMediaFiles([]) }}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs font-medium transition-colors ${mediaType === type ? 'bg-[#1C73E8]/20 border-[#1C73E8] text-[#1C73E8]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}>
                                                    <Icon className="w-3.5 h-3.5" />{type}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Media Upload */}
                                <div className="space-y-1.5">
                                    <Label className="text-slate-400 text-xs">{mediaType === 'Carousel' ? 'Images (up to 10)' : mediaType === 'Video' ? 'Video' : 'Image'}</Label>
                                    <MediaUploader mediaType={mediaType} files={mediaFiles} onChange={setMediaFiles} />
                                </div>

                                {/* Caption */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Label className="text-slate-400 text-xs">Caption</Label>
                                        {/* Tooltip */}
                                        <div className="relative group">
                                            <svg className="w-3.5 h-3.5 text-slate-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                                            </svg>
                                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs text-slate-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                                <p className="font-semibold text-white mb-1.5">Caption best practices</p>
                                                <p className="text-slate-400 mb-1">We recommend structuring your caption as:</p>
                                                <ul className="space-y-0.5 text-slate-300">
                                                    <li><span className="text-slate-500">Hook</span> — up to 150 characters</li>
                                                    <li><span className="text-slate-500">Body</span> — up to 500 characters</li>
                                                    <li><span className="text-slate-500">CTA</span> — up to 100 characters</li>
                                                </ul>
                                                <p className="text-slate-500 mt-2">This helps improve clarity and engagement.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-white/10 bg-white/5 focus-within:border-[#1C73E8] transition-colors">
                                        <AutoTextarea
                                            value={caption}
                                            onChange={setCaption}
                                            placeholder="Write your caption here..."
                                            minRows={5}
                                        />
                                    </div>
                                </div>

                                {/* Date + Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-400 text-xs">Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white text-sm h-9">
                                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#171717] border-white/10 z-[200]">
                                                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus className="bg-[#171717] text-white" />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-400 text-xs">Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ colorScheme: 'dark' }}
                                                className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-2 rounded-md text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors h-9" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 text-slate-300">Cancel</Button>
                                <Button onClick={handleSave} disabled={isLoading} className="bg-[#1C73E8] hover:bg-[#1560bd] text-white min-w-[100px]">
                                    {isLoading ? 'Saving...' : 'Save Post'}
                                </Button>
                            </div>
                        </div>

                        {/* ── RIGHT: Preview ── */}
                        <div className="flex flex-col bg-[#0e0e0e] overflow-y-auto max-h-[90vh]">
                            <div className="px-6 pt-5 pb-3 border-b border-white/10 flex items-center gap-3 flex-wrap">
                                <h2 className="text-base font-bold">Preview</h2>
                                {/* Preview as tabs — shown in header when multiple channels selected */}
                                {channels.length > 1 && (
                                    <div className="flex gap-1.5 flex-wrap">
                                        {channels.map(ch => (
                                            <button
                                                key={ch}
                                                type="button"
                                                onClick={() => setPreviewChannel(ch)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${previewChannel === ch
                                                    ? 'bg-white/15 border-white/30 text-white'
                                                    : 'border-white/10 text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                <span className="[&>svg]:w-3 [&>svg]:h-3">{CHANNEL_ICONS[ch]}</span>
                                                {ch}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto flex items-start justify-center p-6">
                                <div className="w-full max-w-[420px]">
                                    <PostPreview
                                        channel={previewChannel || channels[0] || ''}
                                        placement={placement}
                                        caption={fullCaption}
                                        files={mediaFiles}
                                        mediaType={mediaType}
                                        user={user}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Read-only viewer for past/existing events */}
            <Dialog open={!!viewEvent} onOpenChange={() => setViewEvent(null)}>
                <DialogContent className="bg-[#171717] border-white/10 text-white max-w-md">
                    <DialogTitle className="sr-only">View Post</DialogTitle>
                    <div className="px-1 py-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold">Post Details</h2>
                            {viewEvent && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(viewEvent.status)}`}>
                                    {viewEvent.status}
                                </span>
                            )}
                        </div>
                        {viewEvent && (
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-slate-500 text-xs">Channel</Label>
                                        <p className="text-white mt-0.5">{viewEvent.channel}</p>
                                    </div>
                                    <div>
                                        <Label className="text-slate-500 text-xs">Placement</Label>
                                        <p className="text-white mt-0.5">{viewEvent.placement || '—'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-slate-500 text-xs">Date</Label>
                                        <p className="text-white mt-0.5">{viewEvent.scheduled_date}</p>
                                    </div>
                                    <div>
                                        <Label className="text-slate-500 text-xs">Time</Label>
                                        <p className="text-white mt-0.5">{viewEvent.scheduled_time?.substring(0, 5) || '—'}</p>
                                    </div>
                                </div>
                                {viewEvent.caption && (
                                    <div>
                                        <Label className="text-slate-500 text-xs">Caption</Label>
                                        <p className="text-white/80 mt-1 text-xs bg-white/5 rounded-md p-3 whitespace-pre-wrap leading-relaxed">
                                            {viewEvent.caption}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button variant="ghost" onClick={() => setViewEvent(null)} className="hover:bg-white/10 text-slate-300">
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
