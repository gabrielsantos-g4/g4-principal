'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface ExpertiseArea {
    category: string
    roles: string[]
}

const EXPERTISE_AREAS: ExpertiseArea[] = [
    {
        category: 'STRATEGY & LEADERSHIP',
        roles: [
            'Chief Marketing Officer',
            'Creative Strategist',
            'Brand Marketer',
            'Product Marketer'
        ]
    },
    {
        category: 'CUSTOMER ACQUISITION',
        roles: [
            'Growth Marketer',
            'Paid Search Marketer',
            'Paid Social Marketer',
            'SEO Marketer',
            'Programmatic Marketer',
            'Amazon Marketer'
        ]
    },
    {
        category: 'CONVERT & RETAIN',
        roles: [
            'Email Marketer',
            'Content Marketer',
            'Social Media Manager'
        ]
    },
    {
        category: 'OPS & DATA',
        roles: [
            'Marketing Automation',
            'Marketing Analyst',
            'Graphic Designer',
            'Agency Account Manager'
        ]
    }
]

export function GabrielExpertiseDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-7xl bg-[#0c0c0c] border border-white/10 p-8 sm:p-12 shadow-2xl">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-3xl font-light text-white tracking-tight">
                        Gabriel's Expertise
                    </DialogTitle>
                    <p className="text-slate-400 font-light text-lg mt-2">
                        Comprehensive fractional marketing leadership and execution capabilities.
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {EXPERTISE_AREAS.map((area) => (
                        <div key={area.category} className="space-y-4">
                            <h3 className="text-xs font-bold text-[#1C73E8] uppercase tracking-widest border-b border-white/5 pb-2">
                                {area.category}
                            </h3>
                            <div className="space-y-2">
                                {area.roles.map((role) => (
                                    <div
                                        key={role}
                                        className="text-gray-300 text-sm py-2 px-3 rounded hover:bg-white/5 hover:text-white transition-colors cursor-default border border-transparent hover:border-white/5"
                                    >
                                        {role}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
