'use client'

import { useState } from 'react'

// ─── SVG Icons (pixel-faithful to LinkedIn) ───────────────────────────────

const LinkedInLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="w-9 h-9">
        <path fill="#0a66c2" d="M34 2.5v29A2.5 2.5 0 0131.5 34H2.5A2.5 2.5 0 010 31.5V2.5A2.5 2.5 0 012.5 0h29A2.5 2.5 0 0134 2.5zM10 13H5v16h5V13zM7.5 11a2.9 2.9 0 10-.06 0zM29 19.28C29 14.8 26.92 13 24.14 13a4.7 4.7 0 00-4.1 2.23V13H15v16h5v-8.54a2.93 2.93 0 012.62-3.21 2.78 2.78 0 01.53 0A2.6 2.6 0 0126 20v9h5z" />
    </svg>
)

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 11 7zm-5 10v-7H6v7h2v-6h8v6h2z" />
    </svg>
)

const NetworkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M16 11a5 5 0 10-5.92-4.92A5 5 0 0016 11zm0-8a3 3 0 110 6 3 3 0 010-6zm-9 8a4 4 0 100-8 4 4 0 000 8zm0-6a2 2 0 110 4 2 2 0 010-4zm11 12a2 2 0 00-2-2h-4a2 2 0 00-2 2v2h-2v-2a4 4 0 014-4h4a4 4 0 014 4v2h-2v-2zm-16 2v-2a4 4 0 014-4h1V11H6a6 6 0 00-6 6v2h2z" />
    </svg>
)

const JobsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M17 6V5a3 3 0 00-3-3h-4a3 3 0 00-3 3v1H2v4a3 3 0 003 3h14a3 3 0 003-3V6h-5zm-8-1a1 1 0 011-1h4a1 1 0 011 1v1H9V5zM2 17v2a3 3 0 003 3h14a3 3 0 003-3v-2H2z" />
    </svg>
)

const MessagingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M16 4H8a7 7 0 000 14h4l4 4v-4a7 7 0 000-14zm-8 8a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
)

const NotifIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M22 19h-8.28a2 2 0 11-3.44 0H2v-1l1-1V9a9 9 0 0118 0v8l1 1v1zM18 9A6 6 0 006 9v9h12V9z" />
    </svg>
)

const LikeIcon = ({ active }: { active?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.46 11l-3.91-6.68A2.01 2.01 0 0014 3.28a1.94 1.94 0 00-1.81.61 2 2 0 00-.44 1.67l.62 3.44H4a2 2 0 00-2 2 1.89 1.89 0 00.24.93l2.92 6.44A2 2 0 007 19.61h8.38a2 2 0 002-1.86L18.33 13a2 2 0 00-.19-.94 2 2 0 001.32-1.06zM5 19 2.1 12.6A.06.06 0 012 12.5v-.11a0 0 0 010 0h1v6.5zm15-7.39a.48.48 0 01-.48.39h-1l.quay 1.44-1 7.42a.5.5 0 01-.5.54H7a.5.5 0 01-.45-.3L4 8h9l-.89-4.86a.47.47 0 01.1-.4.53.53 0 01.48-.14.5.5 0 01.29.22l4 6.79z" />
    </svg>
)

const ThumbIcon = ({ active }: { active?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-4 h-4" fill={active ? '#0a66c2' : '#666'}>
        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM6.5 11.5h-2v-5h2v5zM5.5 5.75a1 1 0 110-2 1 1 0 010 2zm7.5 5.75h-5.5l.5-3h-1l1.5-3.5v-.5a.5.5 0 01.5-.5H11a.5.5 0 01.5.5v2h1a.5.5 0 01.46.69l-1 2.5v1.31z" />
    </svg>
)

const CommentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M7 9h10v1H7zm0 4h7v-1H7zm16-2a6.78 6.78 0 01-2.84 5.61L12 22v-4H8A7 7 0 018 4h8a7 7 0 017 7zm-2 0a5 5 0 00-5-5H8a5 5 0 000 10h6v2.28L17.08 15a4.85 4.85 0 001.92-4z" />
    </svg>
)

const RepostIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M13.96 5L11.21 7.75l1.42 1.42L14 7.8V15h2V7.8l1.37 1.37 1.42-1.42L16.04 5h-2.08zM13 17H7V9.79l1.37 1.37 1.42-1.42L7.04 7H5l-3 3.25 1.42 1.42L5 10.2V19h8v-2z" />
    </svg>
)

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M21 3L0 10l7.66 4.26L16 8l-6.26 8.34L14 24l7-21z" />
    </svg>
)

const DotsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
)

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
        <path d="M8 11L3 6h10z" />
    </svg>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="#666">
        <path d="M21.7 20.3l-4.9-4.9a8 8 0 10-1.4 1.4l4.9 4.9 1.4-1.4zM10 16a6 6 0 110-12 6 6 0 010 12z" />
    </svg>
)

const ForBusinessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M3 3h4v4H3zm7 4h4V3h-4zm7-4v4h4V3zM3 14h4v-4H3zm7 0h4v-4h-4zm7 0h4v-4h-4zM3 21h4v-4H3zm7 0h4v-4h-4zm7 0h4v-4h-4z" />
    </svg>
)

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
    const navItems = [
        { label: 'Home', icon: <HomeIcon />, active: true, badge: null },
        { label: 'My Network', icon: <NetworkIcon />, badge: 4 },
        { label: 'Jobs', icon: <JobsIcon />, badge: null },
        { label: 'Messaging', icon: <MessagingIcon />, badge: 16 },
        { label: 'Notifications', icon: <NotifIcon />, badge: 23 },
    ]

    return (
        <nav className="bg-white border-b border-[#e0e0e0] sticky top-0 z-20 shadow-sm">
            <div className="max-w-[1128px] mx-auto px-2 flex items-center h-[52px] gap-1">
                {/* Logo + Search */}
                <div className="flex items-center gap-1 shrink-0 mr-2">
                    <LinkedInLogo />
                    <div className="ml-1 flex items-center gap-2 bg-[#eef3f8] rounded-md px-3 h-9 w-[220px]">
                        <SearchIcon />
                        <span className="text-sm text-[#666] font-normal">Search</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex-1" />

                {/* Nav items */}
                <div className="flex items-center">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 h-[52px] min-w-[80px] text-xs transition-colors
                                ${item.active ? 'text-black border-b-2 border-black' : 'text-[#666] hover:text-black border-b-2 border-transparent'}`}
                        >
                            <div className="relative">
                                {item.icon}
                                {item.badge !== null && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5 leading-none">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="font-medium text-[11px]">{item.label}</span>
                        </button>
                    ))}

                    <div className="w-px h-8 bg-[#e0e0e0] mx-1" />

                    {/* Me */}
                    <button className="relative flex flex-col items-center justify-center gap-0.5 px-3 h-[52px] min-w-[60px] text-xs text-[#666] hover:text-black border-b-2 border-transparent">
                        <div className="w-6 h-6 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold text-[9px]">GS</div>
                        <span className="flex items-center gap-0.5 font-medium text-[11px]">Me <ChevronDownIcon /></span>
                    </button>

                    {/* For Business */}
                    <button className="relative flex flex-col items-center justify-center gap-0.5 px-3 h-[52px] min-w-[80px] text-xs text-[#666] hover:text-black border-b-2 border-transparent">
                        <div className="relative">
                            <ForBusinessIcon />
                            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5">23</span>
                        </div>
                        <span className="flex items-center gap-0.5 font-medium text-[11px]">For Business <ChevronDownIcon /></span>
                    </button>

                    {/* Sales Nav */}
                    <button className="relative flex flex-col items-center justify-center gap-0.5 px-3 h-[52px] min-w-[70px] text-xs text-[#666] hover:text-black border-b-2 border-transparent">
                        <div className="relative">
                            <div className="w-6 h-6 bg-[#f5c518] rounded-sm flex items-center justify-center text-black font-bold text-[8px]">SN</div>
                            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5">7</span>
                        </div>
                        <span className="font-medium text-[11px]">Sales Nav</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel() {
    return (
        <div className="w-[225px] shrink-0 hidden lg:block">
            {/* Profile card */}
            <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden mb-2">
                {/* Cover photo */}
                <div className="relative h-[54px] overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"
                        alt="cover"
                        className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 right-1.5 bg-[#915907] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Premium</span>
                </div>

                {/* Avatar */}
                <div className="px-3 pb-3 relative">
                    <div className="w-[72px] h-[72px] rounded-full border-4 border-white absolute -top-9 overflow-hidden">
                        <img
                            src="https://ui-avatars.com/api/?name=GS&background=0a66c2&color=fff&bold=true&size=128"
                            alt="Gabriel Santos"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="pt-10">
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold text-[#1d2226] leading-tight">Gabriel Santos</p>
                            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                                <rect width="24" height="24" fill="#0a66c2" rx="4" />
                                <path d="M7 17V9.5l3.5 4.5 3.5-4.5V17m2-10h-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-xs text-[#56687a] mt-0.5 leading-tight">Fractional Growth Marketer | Strategy & Execution | Global...</p>
                        <p className="text-xs text-[#56687a] mt-1">Bauru, São Paulo</p>
                        <div className="flex items-center gap-1 mt-2">
                            <div className="w-4 h-4 bg-[#0a66c2] rounded text-white text-[8px] flex items-center justify-center font-bold leading-none">g4</div>
                            <span className="text-xs text-[#56687a]">g4 LeadGen</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#e0e0e0] px-3 py-2.5 space-y-2">
                    <div className="flex justify-between items-center cursor-pointer hover:bg-[#f3f2ef] -mx-3 px-3 py-0.5 rounded">
                        <span className="text-xs text-[#56687a]">Profile viewers</span>
                        <span className="text-xs font-semibold text-[#0a66c2]">76</span>
                    </div>
                    <div className="flex justify-between items-center cursor-pointer hover:bg-[#f3f2ef] -mx-3 px-3 py-0.5 rounded">
                        <span className="text-xs text-[#56687a]">Post impressions</span>
                        <span className="text-xs font-semibold text-[#0a66c2]">20</span>
                    </div>
                </div>

                <div className="border-t border-[#e0e0e0] px-3 py-2.5">
                    <button className="flex items-center gap-2 text-xs text-[#56687a] hover:text-[#0a66c2] font-medium transition-colors">
                        <span className="text-base">🏆</span>
                        Go to Sales Navigator
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Post Card ────────────────────────────────────────────────────────────────
interface Post {
    id: string
    socialProof?: string
    author: {
        logo: string
        logoStyle?: string
        name: string
        sub: string
        promoted: boolean
    }
    text: string
    image?: {
        src: string
        captionTitle?: string
        captionSite?: string
        innerContent?: React.ReactNode
        ctaText?: string
    }
    reactionCount: number
    commentCount: number
}

function PostCard({ post }: { post: Post }) {
    const [liked, setLiked] = useState(false)

    return (
        <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden shadow-sm">
            {/* Social proof */}
            {post.socialProof && (
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                            {[0, 1].map(i => (
                                <div key={i} className="w-5 h-5 rounded-full bg-[#c0c0c0] border-2 border-white overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${i === 0 ? 'MZ' : 'GK'}&background=${i === 0 ? 'a0b0c0' : '8090a0'}&color=fff&size=40`} alt="" className="w-full h-full" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-[#56687a]" dangerouslySetInnerHTML={{ __html: post.socialProof }} />
                    </div>
                    <button className="text-[#56687a] hover:text-[#1d2226] p-1 rounded-full hover:bg-[#f3f2ef]"><DotsIcon /></button>
                </div>
            )}

            {/* Author row */}
            <div className="px-4 pt-3 pb-2 flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-[#e0e0e0] ${post.author.logoStyle || 'bg-white'}`}>
                        <img src={post.author.logo} alt={post.author.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#1d2226] leading-tight">{post.author.name}</p>
                        <p className="text-xs text-[#56687a] leading-tight">{post.author.sub}</p>
                        {post.author.promoted && <p className="text-xs text-[#56687a]">Promoted</p>}
                    </div>
                </div>
                {!post.socialProof && (
                    <button className="text-[#56687a] hover:text-[#1d2226] p-1 rounded-full hover:bg-[#f3f2ef]"><DotsIcon /></button>
                )}
            </div>

            {/* Post text */}
            <div className="px-4 pb-2 text-sm text-[#1d2226] leading-[1.5] whitespace-pre-line">{post.text}</div>

            {/* Image / rich media */}
            {post.image && (
                <div>
                    <div className="relative bg-[#1a1a2e] overflow-hidden" style={{ minHeight: 280 }}>
                        <img src={post.image.src} alt="" className="w-full object-cover opacity-40" style={{ maxHeight: 400 }} />
                        {/* Inner content overlay */}
                        {post.image.innerContent && (
                            <div className="absolute inset-0 flex flex-col justify-center px-8 py-6">
                                {post.image.innerContent}
                            </div>
                        )}
                    </div>
                    {/* Below-fold caption */}
                    {(post.image.captionTitle || post.image.captionSite) && (
                        <div className="bg-[#f3f2ef] border-t border-[#e0e0e0] px-4 py-2.5 flex items-center justify-between">
                            <div>
                                {post.image.captionTitle && <p className="text-sm font-semibold text-[#1d2226] leading-tight truncate max-w-[380px]">{post.image.captionTitle}</p>}
                                {post.image.captionSite && <p className="text-xs text-[#56687a]">{post.image.captionSite}</p>}
                            </div>
                            {post.image.ctaText && (
                                <button className="ml-3 shrink-0 text-sm font-semibold text-[#0a66c2] hover:underline">{post.image.ctaText}</button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Reactions count + comments */}
            <div className="px-4 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {/* Reaction emoji bubbles */}
                    <div className="flex">
                        <div className="w-[18px] h-[18px] rounded-full bg-[#0a66c2] border-2 border-white flex items-center justify-center text-[10px]">👍</div>
                        <div className="-ml-1 w-[18px] h-[18px] rounded-full bg-[#5f9b41] border-2 border-white flex items-center justify-center text-[10px]">❤️</div>
                    </div>
                    <span className="text-xs text-[#56687a] ml-1">{post.reactionCount + (liked ? 1 : 0)}</span>
                </div>
                {post.commentCount > 0 && (
                    <span className="text-xs text-[#56687a] hover:underline cursor-pointer">{post.commentCount} comments</span>
                )}
            </div>

            {/* Reactions sub-section (from screenshot) */}
            <div className="px-4 py-1 text-xs text-[#56687a] font-medium border-t border-[#e0e0e0]">Reactions</div>
            <div className="px-4 pb-1 flex -space-x-1.5">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-[#c0c0c0]">
                        <img src={`https://ui-avatars.com/api/?name=${String.fromCharCode(65 + i)}&background=${['6e8faf', '9b6e6e', '6e9b6e', '8f6e9b', '9b8f6e', '6e9b9b', '8f8f6e', '9b6e8f'][i]}&color=fff&size=56`} alt="" className="w-full h-full object-cover" />
                    </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white bg-[#e0e0e0] flex items-center justify-center text-[10px] font-semibold text-[#56687a]">+19</div>
            </div>

            {/* Action buttons */}
            <div className="px-1 py-1 border-t border-[#e0e0e0] flex items-center">
                {[
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19.46 11l-3.91-6.68A2 2 0 0014 3.28a2 2 0 00-2.26 2.28l.62 3.44H4a2 2 0 00-2 2 1.89 1.89 0 00.24.93l2.92 6.44A2 2 0 007 19.61h8.38a2 2 0 002-1.86L18.33 13a2 2 0 001.13-2z" /></svg>, label: 'Like', action: () => setLiked(l => !l), active: liked },
                    { icon: <CommentIcon />, label: 'Comment' },
                    { icon: <RepostIcon />, label: 'Repost' },
                    { icon: <SendIcon />, label: 'Send' },
                ].map(btn => (
                    <button
                        key={btn.label}
                        onClick={btn.action}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-semibold transition-colors
                            ${btn.active ? 'text-[#0a66c2]' : 'text-[#666] hover:bg-[#f3f2ef] hover:text-[#1d2226]'}`}
                    >
                        {btn.icon}
                        <span>{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Comment box */}
            <div className="px-4 py-3 border-t border-[#e0e0e0] flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-xs font-bold shrink-0">GS</div>
                <div className="flex-1 rounded-full border border-[#c0c0c0] px-4 py-1.5 text-sm text-[#56687a] cursor-text hover:border-[#1d2226] transition-colors flex items-center justify-between">
                    <span>Add a comment...</span>
                    <div className="flex items-center gap-2.5 text-[#666]">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg>
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" /></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Right Panel ──────────────────────────────────────────────────────────────
function RightPanel() {
    return (
        <div className="w-[300px] shrink-0 hidden xl:block">
            {/* Promoted PPG card */}
            <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden mb-2">
                <div className="h-[80px] bg-gradient-to-r from-[#3a5a8f] to-[#5a82b0] relative">
                    <div className="flex items-start justify-between p-2">
                        <div className="w-12 h-12 bg-white rounded border border-[#e0e0e0] flex items-center justify-center">
                            <div className="text-[#1a3a6b] font-black text-lg">PPG</div>
                        </div>
                        <div className="flex items-center gap-1 text-white text-xs bg-black/20 px-2 py-0.5 rounded">
                            Promoted <DotsIcon />
                        </div>
                    </div>
                </div>
                <div className="px-4 pt-2 pb-3">
                    <p className="text-sm font-semibold text-[#1d2226]">PPG</p>
                    <p className="text-xs text-[#1d2226] mt-1 leading-relaxed">Gabriel, siga-nos e participe das iniciativas. Somos motivados pelo nosso propósito de proteger e embelezar o mundo.</p>
                    <div className="flex items-center gap-1 mt-2">
                        <div className="flex -space-x-1">
                            {[0, 1].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-[#c0c0c0] overflow-hidden"><img src={`https://ui-avatars.com/api/?name=${i === 0 ? 'J' : 'R'}&background=${i === 0 ? '8090a0' : '9080a0'}&color=fff&size=40`} alt="" className="w-full h-full" /></div>)}
                        </div>
                        <span className="text-[10px] text-[#56687a]">Jeff & 26 other connections also follow</span>
                    </div>
                    <button className="mt-3 w-full border border-[#c0c0c0] rounded-full py-1.5 text-sm font-semibold text-[#1d2226] hover:bg-[#f3f2ef] hover:border-[#1d2226] transition-colors">
                        Follow
                    </button>
                </div>
            </div>

            {/* Similar pages */}
            <div className="bg-white rounded-xl border border-[#e0e0e0] p-4">
                <p className="text-sm font-semibold text-[#1d2226] mb-3">Similar pages</p>

                {[
                    {
                        name: 'Anthropic', category: 'Research', employees: '501-1,000 employees',
                        connections: 'Matt & 173 other connections follow this page',
                        avatar: 'https://ui-avatars.com/api/?name=AI&background=000&color=fff&bold=true&size=64',
                        border: 'border-[#e0e0e0]'
                    },
                    {
                        name: 'Slack', category: 'Computer Software', employees: '1,001-5,000 employees',
                        connections: 'Alex & 112 other connections follow this page',
                        avatar: 'https://ui-avatars.com/api/?name=SL&background=611f69&color=fff&bold=true&size=64',
                        border: 'border-[#e0e0e0]'
                    },
                    {
                        name: 'Google Cloud', category: 'Computer Software', employees: '10,001+ employees',
                        connections: 'Matt & 68 other connections follow this page',
                        avatar: 'https://ui-avatars.com/api/?name=GC&background=4285f4&color=fff&bold=true&size=64',
                        border: 'border-[#e0e0e0]'
                    },
                ].map(company => (
                    <div key={company.name} className="flex items-start gap-2.5 mb-4">
                        <div className={`w-12 h-12 rounded border ${company.border} overflow-hidden shrink-0 flex items-center justify-center bg-white`}>
                            <img src={company.avatar} alt={company.name} className="w-10 h-10 object-cover rounded" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1d2226] truncate">{company.name}</p>
                            <p className="text-xs text-[#56687a] truncate">{company.category}</p>
                            <p className="text-xs text-[#56687a] truncate">{company.employees}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <div className="w-4 h-4 rounded-full bg-[#c0c0c0] overflow-hidden shrink-0">
                                    <img src={`https://ui-avatars.com/api/?name=M&background=8090a0&color=fff&size=32`} alt="" className="w-full h-full" />
                                </div>
                                <p className="text-[10px] text-[#56687a] leading-tight">{company.connections}</p>
                            </div>
                            <button className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#1d2226] border border-[#1d2226] rounded-full px-3 py-0.5 hover:bg-[#f3f2ef] transition-colors">
                                + Follow
                            </button>
                        </div>
                    </div>
                ))}

                <button className="flex items-center gap-1 text-sm text-[#56687a] hover:text-[#1d2226] font-medium mt-1">
                    Show more <ChevronDownIcon />
                </button>
            </div>

            {/* Footer links */}
            <div className="mt-3 px-1 flex flex-wrap gap-x-2 gap-y-0.5">
                {['About', 'Accessibility', 'Help Center', 'Privacy & Terms', 'Ad Choices', 'Advertising', 'Business Services', 'Get the LinkedIn app', 'More'].map(l => (
                    <span key={l} className="text-[11px] text-[#56687a] hover:underline cursor-pointer">{l}</span>
                ))}
                <div className="w-full mt-1 flex items-center gap-1">
                    <LinkedInLogo />
                    <span className="text-[11px] text-[#56687a]">LinkedIn Corporation © 2025</span>
                </div>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function LinkedInFeedPreview() {
    const posts: Post[] = [
        {
            id: '1',
            socialProof: 'Matt Zanderigo, <strong>Gareth Kersey</strong> and 17 other connections follow <strong>Spacelift</strong>',
            author: {
                logo: 'https://ui-avatars.com/api/?name=SL&background=1a1a4e&color=8b5cf6&bold=true&size=64&font-size=0.5&rounded=true',
                name: 'Spacelift',
                sub: '17,724 followers',
                promoted: true,
            },
            text: "Too many IaC tools, not enough time? We've rounded up the 16 best for 2026 so you can pick what works for you.",
            image: {
                src: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=60',
                captionTitle: '16 Most Useful Infrastructure as Code (IaC) Tools for 2026',
                captionSite: 'spacelift.io',
                ctaText: 'Learn more',
                innerContent: (
                    <div className="flex flex-col h-full justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">S</div>
                            <span className="text-white font-bold text-sm">spacelift</span>
                            <span className="text-white text-sm">🚀</span>
                        </div>
                        {/* Tag */}
                        <div>
                            <span className="bg-[#f5c518] text-black text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-sm uppercase">Popular Article</span>
                        </div>
                        {/* Title */}
                        <h2 className="text-white font-extrabold text-2xl leading-tight mt-1">
                            16 Most Useful<br />Infrastructure as Code<br />(IaC) Tools for 2026
                        </h2>
                        {/* Meta row */}
                        <div className="flex items-center gap-6 mt-2">
                            <div>
                                <p className="text-[#f5c518] text-[10px]">Written by</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-5 h-5 rounded-full bg-gray-400 overflow-hidden">
                                        <img src="https://ui-avatars.com/api/?name=FD&background=5a6e8a&color=fff&size=40" alt="" className="w-full h-full" />
                                    </div>
                                    <p className="text-white text-xs font-semibold">Flavius Dinu</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[#f5c518] text-[10px]">Reading time</p>
                                <p className="text-white text-xs font-semibold">13 min read</p>
                            </div>
                            <div>
                                <p className="text-[#f5c518] text-[10px]">People saw</p>
                                <p className="text-white text-xs font-semibold">44 229</p>
                            </div>
                        </div>
                        {/* CTA button */}
                        <button className="mt-3 w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-3 rounded-lg text-base transition-colors">
                            Read the full article
                        </button>
                    </div>
                ),
            },
            reactionCount: 27,
            commentCount: 0,
        },
    ]

    return (
        <div className="bg-[#f3f2ef] min-h-full font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
            <Navbar />
            <div className="max-w-[1128px] mx-auto w-full px-4 py-4 flex gap-4 items-start">
                <LeftPanel />
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    {posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
                <RightPanel />
            </div>
        </div>
    )
}
