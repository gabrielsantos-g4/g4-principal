'use client'

'use client'

import { useState } from 'react'
import { Agent } from '@/lib/agents'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Compass, Mail, Plus, UserCircle2, ExternalLink } from 'lucide-react'
import { AddStrategyCardModal, FunnelStage, Channel, NewCardData } from './add-strategy-card-modal'
import { Button } from "@/components/ui/button"

interface StrategyOverviewDashboardProps {
    agent: Agent
}

interface StrategyCardData {
    id: string
    funnelStage: FunnelStage
    channel: Channel
    title: string
    description?: string
    icon?: React.ReactNode
    image?: string
    placeholderIcon?: React.ReactNode
    link?: string
    responsibleImage?: string | null
}

const INITIAL_CARDS: StrategyCardData[] = [
    {
        id: '1',
        funnelStage: 'ToFu',
        channel: 'Organic',
        title: 'Blog > Thought Leadership',
        image: '/images/strategy/blog-chart.png',
        placeholderIcon: <div className="w-full h-16 bg-blue-50/10 rounded flex items-center justify-center text-[10px] text-blue-200">Chart Visual</div>
    },
    {
        id: '1b',
        funnelStage: 'ToFu',
        channel: 'Paid',
        title: 'Ads - Discovery',
        description: 'There is a mention of the new kind of artist in a sense of them arriving.'
    },
    {
        id: '1c',
        funnelStage: 'ToFu',
        channel: 'Outreach',
        title: 'Linkedin Sales Nav',
        icon: <Compass className="w-8 h-8 text-[#1C73E8]" />
    },
    {
        id: '2',
        funnelStage: 'MoFu',
        channel: 'Organic',
        title: 'Newsletter',
        image: '/images/strategy/newsletter-typography.png',
        placeholderIcon: <div className="text-lg font-serif font-bold text-black">best<br />typefaces.</div>
    },
    {
        id: '2b',
        funnelStage: 'MoFu',
        channel: 'Paid',
        title: 'Retargeting Ads',
        image: '/images/strategy/retargeting-ui.png',
        placeholderIcon: <div className="w-full h-16 bg-green-500/20 rounded-md border border-green-500/30 flex items-center justify-center text-[10px]">UI Mockup</div>
    },
    {
        id: '2c',
        funnelStage: 'MoFu',
        channel: 'Outreach',
        title: 'Email Sequences',
        image: '/images/strategy/email-sequence.png',
        placeholderIcon: <Mail className="w-8 h-8 text-slate-400" />
    },
    {
        id: '3',
        funnelStage: 'BoFu',
        channel: 'Organic',
        title: 'Landing Pages',
        image: '/images/strategy/landing-page.png',
        placeholderIcon: <div className="bg-slate-900 p-1.5 rounded text-[6px] text-slate-300 border border-slate-700">The Ultimate AI Sales Engineer</div>
    },
    {
        id: '3b',
        funnelStage: 'BoFu',
        channel: 'Paid',
        title: 'PPC Campaigns',
        icon: <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow"><span className="text-lg font-bold text-blue-500">G</span></div>
    },
    {
        id: '3c',
        funnelStage: 'BoFu',
        channel: 'Outreach',
        title: '1:1 Outreach',
        image: '/images/strategy/video-thumbnail.png',
        placeholderIcon: <div className="w-full h-16 bg-slate-800 rounded relative overflow-hidden"><div className="absolute inset-0 flex items-center justify-center opacity-50 text-[10px]">Video</div></div>
    }
]

export function StrategyOverviewDashboard({ agent }: StrategyOverviewDashboardProps) {
    const [cards, setCards] = useState<StrategyCardData[]>(INITIAL_CARDS)

    const handleAddCard = (data: NewCardData) => {
        const newCard: StrategyCardData = {
            id: Math.random().toString(36).substr(2, 9),
            funnelStage: data.funnelStage,
            channel: data.channel,
            title: data.title,
            image: data.image || undefined,
            link: data.link,
            responsibleImage: data.responsibleImage,
        }
        setCards([...cards, newCard])
    }

    const renderCell = (stage: FunnelStage, ch: Channel) => {
        const cellCards = cards.filter(c => c.funnelStage === stage && c.channel === ch)
        return (
            <div className="flex flex-wrap content-start gap-4 h-full p-2">
                {cellCards.map(card => (
                    <StrategyCard
                        key={card.id}
                        {...card}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="flex-1 w-full bg-black text-white p-6 overflow-hidden flex flex-col">
            <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col">

                {/* Top Action Bar */}
                <div className="flex justify-between items-center mb-6">
                    <Tabs defaultValue="funnel" className="w-full flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-white/5 border border-white/10">
                                <TabsTrigger value="funnel">Funnel</TabsTrigger>
                                <TabsTrigger value="channels">Channels</TabsTrigger>
                                <TabsTrigger value="influencers">Influencers & Media Publishers</TabsTrigger>
                            </TabsList>

                            <AddStrategyCardModal onAdd={handleAddCard}>
                                <Button className="bg-[#1C73E8] hover:bg-[#1560bd] text-white gap-2 font-medium">
                                    <Plus className="w-4 h-4" /> Insert Initiative
                                </Button>
                            </AddStrategyCardModal>
                        </div>

                        <TabsContent value="funnel" className="flex-1 flex flex-col mt-0 data-[state=active]:flex">
                            {/* Header Grid */}
                            <div className="grid grid-cols-[120px_1fr_1fr_1fr] border-b border-white/20 mb-8 pb-4">
                                <div className="font-medium text-slate-400">Funnel Level</div>

                                {/* Inbound Group */}
                                <div className="col-span-2 text-center border-r border-white/10 relative">
                                    <div className="absolute -top-6 left-0 right-0 text-center text-xs text-slate-500 uppercase tracking-widest">Inbound</div>
                                    <div className="grid grid-cols-2">
                                        <div className="text-center font-medium">Organic</div>
                                        <div className="text-center font-medium">Paid</div>
                                    </div>
                                </div>

                                {/* Outbound Group */}
                                <div className="text-center relative">
                                    <div className="absolute -top-6 left-0 right-0 text-center text-xs text-slate-500 uppercase tracking-widest">Outbound</div>
                                    <div className="font-medium">Outreach</div>
                                </div>
                            </div>

                            {/* Matrix Rows */}
                            <div className="flex-1 grid grid-rows-3 gap-8 overflow-y-auto pr-2 custom-scrollbar">

                                {/* ToFu Row */}
                                <div className="grid grid-cols-[120px_1fr_1fr_1fr] border-b border-white/10 pb-8 min-h-[160px]">
                                    <div className="text-right pr-6 pt-4">
                                        <div className="font-bold text-lg">ToFu</div>
                                        <div className="text-xs text-slate-500">(Awareness)</div>
                                    </div>

                                    <div className="border-r border-white/10 h-full">{renderCell('ToFu', 'Organic')}</div>
                                    <div className="border-r border-white/10 h-full">{renderCell('ToFu', 'Paid')}</div>
                                    <div className="h-full">{renderCell('ToFu', 'Outreach')}</div>
                                </div>


                                {/* MoFu Row */}
                                <div className="grid grid-cols-[120px_1fr_1fr_1fr] border-b border-white/10 pb-8 min-h-[160px]">
                                    <div className="text-right pr-6 pt-4">
                                        <div className="font-bold text-lg">MoFu</div>
                                        <div className="text-xs text-slate-500">(Nurturing)</div>
                                    </div>

                                    <div className="border-r border-white/10 h-full">{renderCell('MoFu', 'Organic')}</div>
                                    <div className="border-r border-white/10 h-full">{renderCell('MoFu', 'Paid')}</div>
                                    <div className="h-full">{renderCell('MoFu', 'Outreach')}</div>
                                </div>


                                {/* BoFu Row */}
                                <div className="grid grid-cols-[120px_1fr_1fr_1fr] min-h-[160px]">
                                    <div className="text-right pr-6 pt-4">
                                        <div className="font-bold text-lg">BoFu</div>
                                        <div className="text-xs text-slate-500">(Conversion)</div>
                                    </div>

                                    <div className="border-r border-white/10 h-full">{renderCell('BoFu', 'Organic')}</div>
                                    <div className="border-r border-white/10 h-full">{renderCell('BoFu', 'Paid')}</div>
                                    <div className="h-full">{renderCell('BoFu', 'Outreach')}</div>
                                </div>

                            </div>
                        </TabsContent>

                        <TabsContent value="channels">
                            <div className="flex-1 flex items-center justify-center text-slate-500 h-[600px] border border-white/5 rounded-lg border-dashed">
                                Channels View (Work in Progress)
                            </div>
                        </TabsContent>

                        <TabsContent value="influencers">
                            <div className="flex-1 flex items-center justify-center text-slate-500 h-[600px] border border-white/5 rounded-lg border-dashed">
                                Influencers & Media Publishers View (Work in Progress)
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function StrategyCard({ title, description, icon, image, placeholderIcon, link, responsibleImage }: StrategyCardData) {
    return (
        <a
            href={link || '#'}
            target={link ? '_blank' : undefined}
            className={`block outline-none ${!link ? 'pointer-events-none' : ''}`}
        >
            <Card className="w-32 h-32 bg-white text-black border-0 shadow-lg hover:scale-105 transition-transform cursor-pointer overflow-hidden flex flex-col shrink-0 relative group">
                <div className="bg-gray-100 py-1.5 px-2 text-center border-b border-gray-200 h-10 flex items-center justify-center">
                    <h3 className="text-[10px] font-semibold leading-tight text-gray-800 line-clamp-2">{title}</h3>
                </div>
                <CardContent className="flex-1 p-2 flex flex-col items-center justify-center relative bg-white min-h-0">
                    {description ? (
                        <p className="text-[8px] text-gray-500 text-center leading-relaxed line-clamp-4">
                            {description}
                        </p>
                    ) : (
                        <>
                            {icon && !image && (
                                <div className="mb-0">
                                    {icon}
                                </div>
                            )}

                            {!icon && !image && placeholderIcon && (
                                <div className="flex items-center justify-center w-full">
                                    {placeholderIcon}
                                </div>
                            )}

                            {/* Image Display */}
                            {image && (
                                <img src={image} alt={title} className="w-full h-full object-cover absolute inset-0 py-10" />
                            )}

                            {/* Fallback if nothing provided */}
                            {!icon && !image && !description && !placeholderIcon && (
                                <div className="w-8 h-8 bg-gray-100 rounded-full" />
                            )}
                        </>
                    )}
                </CardContent>

                {/* Overlays / Decorations */}
                {responsibleImage && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border border-white shadow-sm overflow-hidden z-10" title="Person in Charge">
                        <img src={responsibleImage} alt="Responsible" className="w-full h-full object-cover" />
                    </div>
                )}

                {link && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                )}
            </Card>
        </a>
    )
}

