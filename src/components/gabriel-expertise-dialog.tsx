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
            <DialogContent className="max-w-5xl bg-[#0c0c0c] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        Áreas que o Gabriel pode desenvolver pra você
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 py-4">
                    {EXPERTISE_AREAS.map((area) => (
                        <div key={area.category}>
                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                                {area.category}
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {area.roles.map((role) => (
                                    <div
                                        key={role}
                                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                                    >
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="text-2xl">💼</div>
                                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                                                {role}
                                            </p>
                                        </div>
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
