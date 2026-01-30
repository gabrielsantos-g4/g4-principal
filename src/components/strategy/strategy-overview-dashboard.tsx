'use client'

import { useState, useEffect } from 'react'
import { Agent } from '@/lib/agents'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Compass, Mail, Plus, UserCircle2, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { AddStrategyCardModal, FunnelStage, Channel, NewCardData } from './add-strategy-card-modal'
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteInitiative, createInitiative } from '@/actions/strategy-actions'


interface StrategyOverviewDashboardProps {
    agent: Agent
    initialCards?: any[]
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
    channels?: string[]
    campaign?: string
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

export function StrategyOverviewDashboard({ agent, initialCards = [] }: StrategyOverviewDashboardProps) {
    // Merge INITIAL_CARDS with DB cards
    const dbCards: StrategyCardData[] = initialCards.map(c => ({
        id: c.id,
        funnelStage: c.funnel_stage as FunnelStage,
        channel: c.channel as Channel,
        title: c.title,
        link: c.link,
        image: c.image_url,
        responsibleImage: c.responsible_image_url,
        channels: c.channels, // Map new column
        campaign: c.campaign // Map campaign column
    }))

    const [cards, setCards] = useState<StrategyCardData[]>([...dbCards, ...INITIAL_CARDS])

    const handleAddCard = (data: NewCardData) => {
        const newCard: StrategyCardData = {
            id: Math.random().toString(36).substr(2, 9),
            funnelStage: data.funnelStage,
            channel: data.channel,
            title: data.title,
            image: data.image || undefined,
            link: data.link,
            responsibleImage: data.responsibleImage,
            channels: data.channels,
            campaign: data.campaign,
        }
        setCards([...cards, newCard])
    }

    const handleUpdateCard = (data: NewCardData) => {
        setCards(cards.map(c => c.id === data.id ? {
            ...c,
            funnelStage: data.funnelStage,
            channel: data.channel,
            title: data.title,
            image: data.image || undefined,
            link: data.link,
            responsibleImage: data.responsibleImage,
            channels: data.channels,
            campaign: data.campaign,
        } : c))
    }

    const handleRemoveCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id))
    }

    const renderCell = (stage: FunnelStage, ch: Channel) => {
        const cellCards = cards.filter(c => c.funnelStage === stage && c.channel === ch)

        return (
            <div className="h-full w-full p-4 min-h-[140px] group/cell relative transition-colors duration-300 hover:bg-white/[0.02]">
                {/* Empty State / Interactive Add Area */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover/cell:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <AddStrategyCardModal
                        initialData={{
                            funnelStage: stage,
                            channel: ch,
                            title: '',
                        }}
                        onAdd={handleAddCard}
                    >
                        <div className="w-full h-full absolute inset-0 cursor-pointer pointer-events-auto flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-white/50 group-hover/cell:bg-blue-600 group-hover/cell:text-white group-hover/cell:border-blue-500 transition-all scale-90 group-hover/cell:scale-100 shadow-sm">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                    </AddStrategyCardModal>
                </div>

                {/* Cards Grid */}
                <div className="relative z-10 flex flex-wrap gap-3 pointer-events-none">
                    {cellCards.map(card => (
                        <div key={card.id} className="pointer-events-auto">
                            <StrategyCard
                                {...card}
                                onUpdate={handleUpdateCard}
                                onDelete={handleRemoveCard}
                            />
                        </div>
                    ))}
                </div>
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
                                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                            </TabsList>


                            <AddStrategyCardModal onAdd={handleAddCard}>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-500 font-mono">{cards.length} Initiatives</span>
                                    <Button className="w-8 h-8 p-0 rounded-full bg-[#1C73E8] hover:bg-[#1560bd] text-white flex items-center justify-center">
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </div>
                            </AddStrategyCardModal>
                        </div>

                        <TabsContent value="channels" className="flex-1 flex flex-col mt-0 h-full">
                            <ChannelsView
                                cards={cards}
                                onUpdate={handleUpdateCard}
                                onDelete={handleRemoveCard}
                            />
                        </TabsContent>


                        <TabsContent value="funnel" className="flex-1 flex flex-col mt-0 data-[state=active]:flex">
                            {/* Header Grid */}
                            <div className="border-b border-zinc-800 mb-6 bg-white/5 rounded-t-lg px-6 pt-3 pb-4">
                                {/* Super Headers */}
                                <div className="grid grid-cols-[240px_1fr_1fr_1fr] gap-6 mb-1">
                                    <div></div>
                                    <div className="col-span-2 text-center text-xs text-slate-400 uppercase tracking-widest relative">
                                        Inbound
                                        <div className="absolute bottom-0 left-4 right-4 h-px bg-white/10"></div>
                                    </div>
                                    <div className="text-center text-xs text-slate-400 uppercase tracking-widest relative">
                                        Outbound
                                        <div className="absolute bottom-0 left-4 right-4 h-px bg-white/10"></div>
                                    </div>
                                </div>

                                {/* Main Headers */}
                                <div className="grid grid-cols-[240px_1fr_1fr_1fr] gap-6">
                                    <div className="font-medium text-slate-400 flex items-center justify-center text-center">Funnel Level</div>
                                    <div className="text-center font-bold text-slate-200">Organic</div>
                                    <div className="text-center font-bold text-slate-200">Paid</div>
                                    <div className="text-center font-bold text-slate-200">Outreach</div>
                                </div>
                            </div>

                            {/* Matrix Rows */}
                            <div className="flex-1 grid grid-rows-3 gap-8 overflow-y-auto pr-2 custom-scrollbar">

                                {/* ToFu Row */}
                                <div className="grid grid-cols-[240px_1fr_1fr_1fr] gap-0 border-b border-zinc-800 min-h-[220px]">
                                    <div className="flex flex-col items-center justify-center text-center border-r border-zinc-800 bg-black/40 p-4">
                                        <div className="font-bold text-2xl text-white tracking-tight">ToFu</div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">(Awareness)</div>
                                    </div>

                                    <div className="border-r border-zinc-800 h-full">{renderCell('ToFu', 'Organic')}</div>
                                    <div className="border-r border-zinc-800 h-full">{renderCell('ToFu', 'Paid')}</div>
                                    <div className="h-full">{renderCell('ToFu', 'Outreach')}</div>
                                </div>


                                {/* MoFu Row */}
                                <div className="grid grid-cols-[240px_1fr_1fr_1fr] gap-0 border-b border-zinc-800 min-h-[220px] bg-white/[0.01]">
                                    <div className="flex flex-col items-center justify-center text-center border-r border-zinc-800 bg-black/40 p-4">
                                        <div className="font-bold text-2xl text-white tracking-tight">MoFu</div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">(Nurturing)</div>
                                    </div>

                                    <div className="border-r border-zinc-800 h-full">{renderCell('MoFu', 'Organic')}</div>
                                    <div className="border-r border-zinc-800 h-full">{renderCell('MoFu', 'Paid')}</div>
                                    <div className="h-full">{renderCell('MoFu', 'Outreach')}</div>
                                </div>


                                {/* BoFu Row */}
                                <div className="grid grid-cols-[240px_1fr_1fr_1fr] gap-0 min-h-[220px]">
                                    <div className="flex flex-col items-center justify-center text-center border-r border-zinc-800 bg-black/40 p-4">
                                        <div className="font-bold text-2xl text-white tracking-tight">BoFu</div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">(Conversion)</div>
                                    </div>

                                    <div className="border-r border-zinc-800 h-full">{renderCell('BoFu', 'Organic')}</div>
                                    <div className="border-r border-zinc-800 h-full">{renderCell('BoFu', 'Paid')}</div>
                                    <div className="h-full">{renderCell('BoFu', 'Outreach')}</div>
                                </div>

                            </div>
                        </TabsContent>

                        <TabsContent value="campaigns" className="flex-1 flex flex-col mt-0 h-full">
                            <CampaignsView
                                cards={cards}
                                onAdd={handleAddCard}
                                onUpdate={handleUpdateCard}
                                onDelete={handleRemoveCard}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function StrategyCard({ id, title, description, icon, image, placeholderIcon, link, responsibleImage, funnelStage, channel, channels, campaign, onUpdate, onDelete }: StrategyCardData & { onUpdate?: (data: NewCardData) => void, onDelete?: (id: string) => void }) {
    const [isHovered, setIsHovered] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        // e.preventDefault() // Not inside link anymore, but good to keep
        // e.stopPropagation()
        setIsDeleting(true)
        try {
            await deleteInitiative(id)
            if (onDelete) onDelete(id) // Update UI immediately
        } catch (error) {
            console.error('Failed to delete:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <div
                className="flex flex-col gap-2 w-32 relative group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Card className="w-32 h-32 bg-white text-black border-0 shadow-lg transition-transform cursor-pointer overflow-hidden flex flex-col shrink-0 relative p-0 gap-0 rounded-md group-hover:scale-105">

                    {/* Link Overlay - Sibling to interactions */}
                    {link && (
                        <a
                            href={link}
                            target="_blank"
                            className="absolute inset-0 z-10"
                            aria-label={`Open ${title}`}
                        />
                    )}

                    <CardContent className="flex-1 relative bg-white min-h-0 p-0 w-full h-full pointer-events-none">
                        {description ? (
                            <div className="w-full h-full p-2 flex items-center justify-center">
                                <p className="text-[8px] text-gray-500 text-center leading-relaxed line-clamp-6">
                                    {description}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Icons / Placeholders Container */}
                                {!image && (
                                    <div className="w-full h-full p-2 flex items-center justify-center">
                                        {icon && (
                                            <div className="mb-0">
                                                {icon}
                                            </div>
                                        )}

                                        {!icon && placeholderIcon && (
                                            <div className="flex items-center justify-center w-full">
                                                {placeholderIcon}
                                            </div>
                                        )}

                                        {!icon && !placeholderIcon && (
                                            <div className="w-8 h-8 bg-gray-100 rounded-full" />
                                        )}
                                    </div>
                                )}

                                {/* Image Display - Full Bleed */}
                                {image && (
                                    <img
                                        src={image}
                                        alt={title}
                                        className="w-full h-full object-cover absolute inset-0 z-10"
                                    />
                                )}
                            </>
                        )}
                    </CardContent>

                    {/* Overlays / Decorations */}
                    {responsibleImage && (
                        <div className="absolute top-1 left-1 w-6 h-6 rounded-full border border-white shadow-sm overflow-hidden z-20 pointer-events-none" title="Person in Charge">
                            <img src={responsibleImage} alt="Responsible" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {link && (
                        <div className="absolute bottom-1 right-1 opacity-100 transition-opacity z-20 bg-white/80 rounded-full p-1 shadow-sm backdrop-blur-sm group-hover:opacity-0 pointer-events-none">
                            <ExternalLink className="w-3 h-3 text-slate-600" />
                        </div>
                    )}

                    {/* Hover Actions Overlay - Top Right - Z-30 (Above Link) */}
                    <div className="absolute top-1 right-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1">
                        <AddStrategyCardModal
                            key={`${id}-${campaign}-${channels?.join(',')}-${title}`} // Force remount when data changes
                            initialData={{
                                id,
                                title,
                                funnelStage,
                                channel,
                                link,
                                image,
                                responsibleImage,
                                channels: channels || (channel ? [channel] : []), // Pass actual channels or fallback
                                campaign: campaign
                            }}
                            onAdd={(data) => onUpdate && onUpdate(data)}
                        >
                            <button
                                className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm border border-slate-100 cursor-pointer"
                                title="Edit"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </AddStrategyCardModal>
                        <AlertDialogTrigger asChild>
                            <button
                                className="w-6 h-6 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm border border-slate-100 cursor-pointer"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </AlertDialogTrigger>
                    </div>
                </Card>

                {/* Title Outside */}
                <a href={link || '#'} target={link ? '_blank' : undefined} className={`outline-none ${!link ? 'pointer-events-none' : ''}`}>
                    <h3 className="text-[10px] font-medium leading-tight text-slate-400 text-center line-clamp-2 px-1 group-hover:text-white transition-colors">
                        {title}
                    </h3>
                </a>
            </div>

            <AlertDialogContent className="bg-zinc-950 text-white border-zinc-800">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        Permanently delete "{title}"? This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-4">
                    <AlertDialogCancel className="bg-transparent border-zinc-800 text-white hover:bg-zinc-900 hover:text-white mt-0">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


import { getCampaigns } from '@/actions/campaign-actions'

function CampaignsView({ cards, onAdd, onUpdate, onDelete }: {
    cards: StrategyCardData[],
    onAdd: (data: NewCardData) => void,
    onUpdate: (data: NewCardData) => void,
    onDelete: (id: string) => void
}) {
    const [allCampaigns, setAllCampaigns] = useState<{ label: string, value: string, endDate?: string | null }[]>([])

    // Fetch campaigns on mount
    useEffect(() => {
        const loadCampaigns = async () => {
            const camps = await getCampaigns()
            setAllCampaigns(camps.map(c => ({ label: c.name, value: c.name, endDate: c.end_date })))
        }
        loadCampaigns()
    }, [])

    // Grouping Logic
    // 1. Get all unique campaign names from DB (allCampaigns) + any in use in cards
    const usedCampaigns = new Set(cards.map(c => c.campaign).filter(Boolean) as string[])
    const knownCampaigns = new Set(allCampaigns.map(c => c.value))

    // Combine both sets
    const activeCampaignNames = Array.from(new Set([...knownCampaigns, ...usedCampaigns])).sort()

    const unassignedCards = cards.filter(card => !card.campaign)

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-lg border border-white/5 overflow-hidden">

            {/* Grid List */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-12 max-w-[1600px] mx-auto mb-20">

                    {/* Empty State */}
                    {activeCampaignNames.length === 0 && unassignedCards.length === 0 && (
                        <div className="text-slate-600 mt-20 text-center">No campaigns or initiatives found.</div>
                    )}

                    {/* Render Grouped Campaigns */}
                    {activeCampaignNames.map(campaignName => {
                        const campaignCards = cards.filter(card => card.campaign === campaignName)
                        const campaignData = allCampaigns.find(c => c.value === campaignName)

                        // Show header even if empty? user request implies showing grouped. 
                        // If we show empty campaigns, it might be nice. 

                        return (
                            <div key={campaignName} className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-2">
                                    <h3 className="text-lg font-medium text-white">{campaignName}</h3>
                                    {campaignData?.endDate && (
                                        <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                            Ends: {new Date(campaignData.endDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                        {campaignCards.length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {campaignCards.length === 0 ? (
                                        <div className="text-sm text-slate-600 italic py-2">No initiatives in this campaign yet.</div>
                                    ) : (
                                        campaignCards.map(card => (
                                            <StrategyCard
                                                key={`${campaignName}-${card.id}`}
                                                {...card}
                                                onUpdate={onUpdate}
                                                onDelete={onDelete}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Unassigned Cards */}
                    {unassignedCards.length > 0 && (
                        <div className="flex flex-col gap-4 opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-2">
                                <h3 className="text-lg font-medium text-slate-400">Unassigned / General</h3>
                                <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                    {unassignedCards.length}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {unassignedCards.map(card => (
                                    <StrategyCard
                                        key={`unassigned-${card.id}`}
                                        {...card}
                                        onUpdate={onUpdate}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


function ChannelsView({ cards, onUpdate, onDelete }: {
    cards: StrategyCardData[],
    onUpdate: (data: NewCardData) => void,
    onDelete: (id: string) => void
}) {

    // 1. Identify active channels from cards + unassigned
    // We want to group by Channel Name
    const activeChannelNames = Array.from(new Set(
        cards.flatMap(card => card.channels || [])
    )).sort()

    const unassignedCards = cards.filter(card => !card.channels || card.channels.length === 0)

    // Calculate total displayed initiatives
    const totalDisplayed = cards.length

    return (
        <div className="flex-1 w-full h-full bg-black flex overflow-hidden">
            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black p-8">


                <div className="flex flex-col gap-12 max-w-[1600px] mb-20">

                    {/* Empty State */}
                    {activeChannelNames.length === 0 && unassignedCards.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl">
                            <Compass className="w-10 h-10 text-slate-600 mb-4" />
                            <p className="text-slate-500">No channels active yet.</p>
                        </div>
                    )}

                    {/* Render Grouped Channels */}
                    {activeChannelNames.map(channelName => {
                        const channelCards = cards.filter(card => card.channels?.includes(channelName))
                        if (channelCards.length === 0) return null

                        return (
                            <div key={channelName} className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-2">
                                    <h3 className="text-lg font-medium text-white">{channelName}</h3>
                                    <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                        {channelCards.length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {channelCards.map(card => (
                                        <StrategyCard
                                            key={`${channelName}-${card.id}`}
                                            {...card}
                                            onUpdate={onUpdate}
                                            onDelete={onDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {/* Unassigned Cards */}
                    {unassignedCards.length > 0 && (
                        <div className="flex flex-col gap-4 opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-2">
                                <h3 className="text-lg font-medium text-slate-400">Unassigned / General</h3>
                                <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                    {unassignedCards.length}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {unassignedCards.map(card => (
                                    <StrategyCard
                                        key={`unassigned-${card.id}`}
                                        {...card}
                                        onUpdate={onUpdate}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
