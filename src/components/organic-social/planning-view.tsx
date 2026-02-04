

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquareText, Lightbulb, Folder, ChevronRight, Plus, ArrowLeft, Trash2, Sparkles, Calendar } from "lucide-react"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    getContentPillars, createContentPillar, deleteContentPillar,
    getMasterChats, createMasterChat, deleteMasterChat,
    getContentItems, createContentItem, deleteContentItem
} from '@/actions/organic-social-actions'
import { cn } from '@/lib/utils'

interface Pillar {
    id: string
    title: string
    created_at: string
}

interface MasterChat {
    id: string
    title: string
    created_at: string
}

interface ContentItem {
    id: string
    title: string
    content?: string
    format?: string
    status: 'draft' | 'approved' | 'scheduled'
    created_at: string
}

export function PlanningView() {
    const [pillars, setPillars] = useState<Pillar[]>([])
    const [masterChats, setMasterChats] = useState<MasterChat[]>([])
    const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null)
    const [contentItems, setContentItems] = useState<ContentItem[]>([])

    // UI State
    const [isLoading, setIsLoading] = useState(true)
    const [newPillarTitle, setNewPillarTitle] = useState('')
    const [newMasterChatTitle, setNewMasterChatTitle] = useState('')
    const [newItemTitle, setNewItemTitle] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (selectedPillar) {
            loadItems(selectedPillar.id)
        }
    }, [selectedPillar])

    async function loadData() {
        try {
            const [pillarsData, chatsData] = await Promise.all([
                getContentPillars(),
                getMasterChats()
            ])
            setPillars(pillarsData || [])
            setMasterChats(chatsData || [])
        } catch (error) {
            console.error('Failed to load data', error)
            toast.error('Failed to load planning data')
        } finally {
            setIsLoading(false)
        }
    }

    async function loadItems(pillarId: string) {
        try {
            const data = await getContentItems(pillarId)
            setContentItems(data || [])
        } catch (error) {
            console.error('Failed to load items', error)
            toast.error('Failed to load content items')
        }
    }

    // --- Actions ---

    async function handleCreatePillar() {
        if (!newPillarTitle.trim()) return
        const result = await createContentPillar(newPillarTitle)
        if (result.error) toast.error('Failed to create category')
        else {
            toast.success('Category created')
            setNewPillarTitle('')
            loadData() // Refetch pillars
        }
    }

    async function handleDeletePillar(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        if (!confirm('Delete this category and all its content items?')) return
        const result = await deleteContentPillar(id)
        if (result.error) toast.error('Failed to delete category')
        else {
            toast.success('Category deleted')
            if (selectedPillar?.id === id) setSelectedPillar(null)
            loadData()
        }
    }

    async function handleCreateMasterChat() {
        if (!newMasterChatTitle.trim()) return
        const result = await createMasterChat(newMasterChatTitle)
        if (result.error) toast.error('Failed to create planning session')
        else {
            toast.success('Session created')
            setNewMasterChatTitle('')
            loadData() // Refetch chats
        }
    }

    async function handleDeleteMasterChat(id: string) {
        if (!confirm('Delete this planning session?')) return
        const result = await deleteMasterChat(id)
        if (result.error) toast.error('Failed to delete session')
        else {
            toast.success('Session deleted')
            loadData()
        }
    }

    async function handleCreateItem() {
        if (!newItemTitle.trim() || !selectedPillar) return
        const result = await createContentItem(selectedPillar.id, { title: newItemTitle, format: 'text' })
        if (result.error) toast.error('Failed to create item')
        else {
            toast.success('Item created')
            setNewItemTitle('')
            loadItems(selectedPillar.id)
        }
    }

    async function handleDeleteItem(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        if (!confirm('Delete this item?')) return
        const result = await deleteContentItem(id)
        if (result.error) toast.error('Failed to delete item')
        else {
            toast.success('Item deleted')
            if (selectedPillar) loadItems(selectedPillar.id)
        }
    }

    if (isLoading) return <div className="text-center text-slate-500 py-10">Loading...</div>

    // VIEW 1: Categories List & Master Chats
    if (!selectedPillar) {
        return (
            <div className="space-y-10 max-w-5xl mx-auto">

                {/* Section 1: Strategic Planning (Master Chats) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-[#1C73E8]" />
                            Strategic Planning
                        </h3>
                    </div>
                    <p className="text-slate-400">
                        Use the Master Chat to plan your weekly/monthly content strategy across all categories.
                        The AI analyzes all your content pillars to propose the best mix.
                    </p>

                    <div className="flex gap-4 items-center bg-[#171717] p-4 rounded-xl border border-white/10">
                        <Input
                            value={newMasterChatTitle}
                            onChange={(e) => setNewMasterChatTitle(e.target.value)}
                            placeholder="New planning session (e.g., 'February Content Plan')"
                            className="bg-[#0c0c0c] border-white/10 text-white w-full md:max-w-md"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateMasterChat()}
                        />
                        <Button onClick={handleCreateMasterChat} disabled={!newMasterChatTitle.trim()} className="shrink-0 bg-[#1C73E8] text-white hover:bg-[#1557b0]">
                            <Plus className="w-4 h-4 mr-2" /> New Strategy Session
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {masterChats.map(chat => (
                            <div key={chat.id} className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#171717] hover:border-[#1C73E8]/50 hover:bg-[#1C73E8]/5 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#1C73E8]/10 text-[#1C73E8] flex items-center justify-center shrink-0">
                                        <MessageSquareText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-[#1C73E8] transition-colors">{chat.title}</h4>
                                        <p className="text-xs text-slate-500">Click to open chat</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteMasterChat(chat.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Section 2: Content Categories (Idea Mothers) */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Folder className="w-6 h-6 text-yellow-500" />
                        Content Categories ("Mothers")
                    </h3>
                    <p className="text-slate-400">
                        Organize your content ideas into pillars. Drill down to see specific scripts and ideas generated by the Strategy Chat.
                    </p>

                    <div className="flex gap-4 items-center bg-[#171717] p-4 rounded-xl border border-white/10">
                        <Input
                            value={newPillarTitle}
                            onChange={(e) => setNewPillarTitle(e.target.value)}
                            placeholder="New category name (e.g., 'Educational', 'Cases', 'Lifestyle'...)"
                            className="bg-[#0c0c0c] border-white/10 text-white w-full md:max-w-md"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePillar()}
                        />
                        <Button onClick={handleCreatePillar} disabled={!newPillarTitle.trim()} className="shrink-0 bg-[#1C73E8] text-white hover:bg-[#1557b0]">
                            <Plus className="w-4 h-4 mr-2" /> Add Category
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pillars.map(pillar => (
                            <div
                                key={pillar.id}
                                onClick={() => setSelectedPillar(pillar)}
                                className="group p-6 rounded-xl border border-white/10 bg-[#171717] hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all cursor-pointer space-y-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-3 rounded-lg bg-[#2a2a2a] group-hover:bg-yellow-500/10 group-hover:text-yellow-500 text-slate-400 transition-colors">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <button onClick={(e) => handleDeletePillar(e, pillar.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors line-clamp-1">{pillar.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">View content items</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // VIEW 2: Selected Category (Content Items)
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPillar(null)} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="h-4 w-[1px] bg-white/10" />
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Folder className="w-5 h-5 text-yellow-500" />
                    {selectedPillar.title}
                </h3>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 ml-2">Category</Badge>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Content List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex gap-4 items-center bg-[#171717] p-4 rounded-xl border border-white/10">
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white mb-1">Add Content Idea Manually</h4>
                            <p className="text-xs text-slate-500">Ideally, use the Master Chat to generate these, but you can add manually here.</p>
                        </div>
                        <Input
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            placeholder="Idea title..."
                            className="bg-[#0c0c0c] border-white/10 text-white w-64"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateItem()}
                        />
                        <Button size="sm" onClick={handleCreateItem} disabled={!newItemTitle.trim()} className="bg-[#1C73E8] text-white">
                            <Plus className="w-4 h-4" /> Add Idea
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contentItems.map(item => (
                            <Card key={item.id} className="bg-[#171717] border-white/10 hover:border-white/20 transition-all group">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="border-white/10 text-slate-400 text-[10px] uppercase tracking-wider">
                                            {item.format || 'General'}
                                        </Badge>
                                        <button onClick={(e) => handleDeleteItem(e, item.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-white leading-tight">{item.title}</h4>
                                    {item.content && (
                                        <p className="text-sm text-slate-400 line-clamp-3">{item.content}</p>
                                    )}
                                    <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
                                        <Calendar className="w-3 h-3" />
                                        <span>Draft</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {contentItems.length === 0 && (
                        <div className="text-center py-12 text-slate-600 italic border border-dashed border-white/5 rounded-xl">
                            No content items in this category yet.<br />
                            Go back and use the <strong>Strategic Planning</strong> chat to generate ideas for this category.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
