'use client'

import { useState } from 'react'
import { Sparkles, Copy, CheckCircle2, FileText, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Keyword {
    id: string
    term: string
}

interface ContentGeneratorProps {
    keyword: Keyword | null
}

export function ContentGenerator({ keyword }: ContentGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [content, setContent] = useState<string | null>(null)

    const handleGenerate = () => {
        setIsGenerating(true)
        // Simulate generation delay
        setTimeout(() => {
            setContent(`
# ${keyword?.term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: A Comprehensive Guide

Optimize your sales funnel efficiently and drive more conversions.

## Introduction
In today's competitive landscape, understanding **${keyword?.term}** is crucial for growth. This guide explores strategies...

## Key Benefits
- Increased conversion rates
- Better customer insights
- Streamlined operations

## Conclusion
Implementing these changes will transform your business metrics.
            `)
            setIsGenerating(false)
        }, 2000)
    }

    if (!keyword) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Select a Keyword</h3>
                <p className="max-w-sm mx-auto">Choose a target keyword from the sidebar to start generating optimized content.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header / Actions */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                <div>
                    <div className="text-sm text-slate-500 mb-1">Focus Keyword</div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {keyword.term}
                    </h2>
                </div>
                <div className="flex gap-3 items-center">
                    {content && (
                        <div className="flex items-center gap-4 mr-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">SEO Score</div>
                                <div className="text-emerald-400 font-bold">92</div>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="text-xs text-slate-400">Excellent</div>
                        </div>
                    )}

                    {!content && (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                        >
                            {isGenerating ? (
                                <>Generating...</>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Content
                                </>
                            )}
                        </Button>
                    )}
                    {content && (
                        <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Text
                        </Button>
                    )}
                </div>
            </div>

            {/* Split View: Editor & Preview */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto bg-[#0A0A0A]">
                    {content ? (
                        <div className="max-w-3xl mx-auto prose prose-invert prose-slate">
                            {/* Simple markdown-like rendering for demo */}
                            {content.split('\n').map((line, i) => {
                                if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white mb-6">{line.replace('# ', '')}</h1>
                                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">{line.replace('## ', '')}</h2>
                                if (line.trim() === '') return <br key={i} />
                                if (line.startsWith('- ')) return (
                                    <li key={i} className="ml-4 text-slate-300 list-disc">{line.replace('- ', '')}</li>
                                )
                                return <p key={i} className="text-slate-300 leading-relaxed mb-4">{line}</p>
                            })}
                        </div>
                    ) : isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <div className="w-12 h-12 rounded-full border-2 border-[#1C73E8] border-t-transparent animate-spin mb-4" />
                            <p>Writing your article...</p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-50">
                            <p>Ready to generate.</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Optimization Checklist */}
                {content && (
                    <div className="w-80 border-l border-white/10 bg-black/20 p-6 overflow-y-auto">
                        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-slate-500">Optimization Checklist</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-sm text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Keyword in H1</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Keyword density optimal</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>1200+ words</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Structured data included</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-300">
                                <div className="w-4 h-4 rounded-full border border-slate-600 mt-0.5 shrink-0" />
                                <span className="text-slate-500">Add internal links</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
