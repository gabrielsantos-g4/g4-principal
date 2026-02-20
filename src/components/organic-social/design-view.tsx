'use client'

import { useRouter } from 'next/navigation'
import { Palette } from 'lucide-react'

const MELINDA_AVATAR = 'https://i.pinimg.com/736x/d9/dd/c2/d9ddc27d2a07dc48e539146bf5d8eb48.jpg'

export function DesignView() {
    const router = useRouter()

    const handleMelindaClick = () => {
        router.push('/dashboard/design-video')
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-white">Design</h2>
                    <p className="text-xs text-slate-500">Creative production for your organic social content</p>
                </div>
            </div>

            {/* Handoff card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-5">
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                    To move forward, you'll need a creative.
                    <br />
                    Let's bring in <span className="text-white font-medium">Melinda</span> (Design & Video).
                </p>

                {/* Melinda avatar — clickable */}
                <button
                    onClick={handleMelindaClick}
                    className="group flex flex-col items-center gap-3 focus:outline-none"
                    title="Open Melinda — Design & Video"
                >
                    <div className="relative">
                        <img
                            src={MELINDA_AVATAR}
                            alt="Melinda"
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-200 group-hover:scale-105"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center ring-2 ring-[#0e0e0e]">
                            <Palette className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Melinda</p>
                        <p className="text-xs text-slate-500">Design & Video</p>
                        <p className="text-[11px] text-purple-400/70 mt-1 group-hover:text-purple-400 transition-colors">Click to open →</p>
                    </div>
                </button>
            </div>
        </div>
    )
}
