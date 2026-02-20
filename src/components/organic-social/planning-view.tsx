

'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Library, Plus, Trash2, CornerDownRight, Pencil, ChevronDown, ChevronUp, GripVertical, FileText, Sparkles } from "lucide-react"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    getMotherIdeas, createMotherIdea, deleteMotherIdea, updateMotherIdea, reorderMotherIdeas,
    getChildIdeas, createChildIdea, deleteChildIdea, updateChildIdea
} from '@/actions/organic-social-actions'

function SortableMotherCardWrapper({ id, children }: { id: string, children: (attributes: any, listeners: any) => React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: 'relative' as const, zIndex: isDragging ? 50 : 1 };
    return <div ref={setNodeRef} style={style}>{children(attributes, listeners)}</div>
}

const CONTENT_TYPES = [
    { value: "Educational", description: "Teach something" },
    { value: "How-to", description: "Step-by-step guide" },
    { value: "Listicle", description: "Top 3, top 5, etc." },
    { value: "Common Mistake", description: "Errors to avoid" },
    { value: "Myth vs Fact", description: "Debunking myths" },
    { value: "Comparison", description: "X vs Y" },
    { value: "Before and After", description: "Transformation" },
    { value: "Case Study", description: "Real-life proof" },
    { value: "Storytelling", description: "Personal/client story" },
    { value: "Behind the Scenes", description: "The process" },
    { value: "Hot Take", description: "Strong opinion" },
    { value: "Light Controversy", description: "Slightly controversial" },
    { value: "Contrarian", description: "Breaking the pattern" },
    { value: "Technical Insight", description: "Authority insight" },
    { value: "Framework", description: "Replicable model" },
    { value: "Problem Diagnosis", description: "Identify root cause" },
    { value: "Trend Analysis", description: "What's changing" },
    { value: "Prediction", description: "What will happen next" },
    { value: "Warning", description: "Be careful with this" },
    { value: "Checklist", description: "Step-by-step list" },
    { value: "Analogy", description: "Explain complex simply" },
    { value: "Provocative Question", description: "Engaging question" },
    { value: "Mini-lesson", description: "Short educational tip" },
    { value: "Direct Sales", description: "Direct offer/pitch" },
    { value: "Social Proof", description: "Testimonials & results" },
    { value: "Client Behind the Scenes", description: "Client's BTS" },
    { value: "Hard Truth", description: "Difficult truth" },
    { value: "Simplification", description: "Explain concepts easily" },
    { value: "Anti-hype", description: "Debunking trends" }
]

const FORMAT_TYPES = [
    { value: "Single image (text or visual)", description: "Static image frame" },
    { value: "Image + caption", description: "Image with descriptive text" },
    { value: "Quote / tweet style post", description: "Text-heavy quote or tweet" },
    { value: "Simple graphic", description: "Basic graphic or chart" },
    { value: "Text carousel", description: "Multi-slide text post" },
    { value: "Image + text carousel", description: "Multi-slide image and text" },
    { value: "Story-style carousel", description: "Narrative multi-slide post" },
    { value: "Checklist carousel", description: "Multi-slide checklist" },
    { value: "Comparison carousel", description: "Multi-slide comparison" },
    { value: "Talking head video", description: "Camera facing speaker" },
    { value: "Short talking head (under 30s)", description: "Quick camera facing speaker" },
    { value: "Talking head with captions", description: "Speaker with dynamic text" },
    { value: "B-roll video with voiceover", description: "Background video with VO" },
    { value: "Video with supporting visuals", description: "Video with graphics/charts" },
    { value: "Split-screen video", description: "Two videos side-by-side" },
    { value: "Screen recording / tutorial", description: "Screencast teaching" },
    { value: "Meme / trend adaptation", description: "Trending format" },
    { value: "Reaction (react) video", description: "Reacting to other content" },
    { value: "Remix / duets", description: "Side-by-side response" },
    { value: "High-retention edit (fast cuts + hook)", description: "Fast-paced editing" },
    { value: "Loop video", description: "Seamlessly repeating video" },
    { value: "Result / proof screenshot", description: "Showing real results" },
    { value: "Behind-the-scenes", description: "Process documentation" },
    { value: "Hybrid (video + slides)", description: "Mixed media" }
]

const IDEA_HELPER_OPTIONS = [
    { label: "Generate 5 child ideas", prompt: "Generate 5 child ideas for: " },
    { label: "Rewrite this idea in 5 angles", prompt: "Rewrite this idea in 5 angles: " },
    { label: "Turn into hooks (10)", prompt: "Turn into 10 hooks: " },
    { label: "Turn into questions (10)", prompt: "Turn into 10 questions: " },
    { label: "Pain → solution angles (5)", prompt: "Pain -> solution angles (5): " },
    { label: "Objection angles (5)", prompt: "Objection angles (5): " },
    { label: "Competitor-style angles (5)", prompt: "Competitor-style angles (5): " },
]

const IDEA_HELPER_SOURCES = [
    "Meta Ads Library / TikTok Creative Center",
    "Direct competitors (high engagement posts)",
    "Indirect competitors (same audience, other product)",
    "Global reference creators (Hormozi, Ladeira)",
    "Viral post comments (real pain points)",
    "Product reviews (Amazon, G2, App Store)",
    "Best-selling book titles (Amazon)",
    "Sales page headlines (Landing Pages)",
    "Marketing emails (niche newsletters)",
    "VSL Scripts (direct sales structure)",
    "Client FAQs",
    "Sales calls (real objections)",
    "Communities (Reddit, Facebook groups, Slack)",
    "YouTube (most viewed videos on topic)",
    "Podcasts (recurring guest topics)",
    "Trends (Google Trends, X trending)",
    "Success cases (before/after, studies)",
    "Known frameworks (AIDA, PAS)",
    "Your old content (repurpose)",
    "Internal data (CRM, metrics, pipeline)",
    "Ask the AI (LLM support)"
]

interface MotherIdea {
    id: string
    title: string
    created_at: string
}

interface ChildIdea {
    id: string
    parent_id: string
    content: string
    content_type?: string | null
    format_type?: string | null
    script_content?: string | null
    created_at: string
}

export function PlanningView() {
    const [motherIdeas, setMotherIdeas] = useState<MotherIdea[]>([])
    const [childIdeas, setChildIdeas] = useState<{ [parentId: string]: ChildIdea[] }>({})

    // UI State
    const [isLoading, setIsLoading] = useState(true)
    const [newMotherTitle, setNewMotherTitle] = useState('')
    const [newChildContent, setNewChildContent] = useState<{ [parentId: string]: string }>({})
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

    // Edit State
    const [editingMotherId, setEditingMotherId] = useState<string | null>(null)
    const [editingChildId, setEditingChildId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')

    // Script Dialog State
    const [scriptModalOpen, setScriptModalOpen] = useState(false)
    const [activeScriptChildId, setActiveScriptChildId] = useState<string | null>(null)
    const [activeScriptParentId, setActiveScriptParentId] = useState<string | null>(null)
    const [scriptValue, setScriptValue] = useState("")
    const scriptTextareaRef = useRef<HTMLTextAreaElement>(null)

    const toggleCard = (id: string) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const mothers = await getMotherIdeas()
            setMotherIdeas(mothers || [])

            // Carrega filhas de todas as mães e expande por padrão
            const childrenMap: { [parentId: string]: ChildIdea[] } = {}
            const newExpandedState: Record<string, boolean> = {}
            for (const mother of mothers || []) {
                const children = await getChildIdeas(mother.id)
                childrenMap[mother.id] = children || []
                // If not already set, expand by default
                newExpandedState[mother.id] = expandedCards[mother.id] !== undefined ? expandedCards[mother.id] : true
            }
            setChildIdeas(childrenMap)
            setExpandedCards(prev => ({ ...prev, ...newExpandedState }))

        } catch (error) {
            console.error('Failed to load data', error)
            toast.error('Failed to load ideas data')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleRefreshChildren(parentId: string) {
        try {
            const children = await getChildIdeas(parentId)
            setChildIdeas(prev => ({ ...prev, [parentId]: children || [] }))
        } catch (error) {
            console.error('Failed to load child ideas', error)
        }
    }

    // --- Actions ---

    async function handleCreateMother() {
        if (!newMotherTitle.trim()) return
        const result = await createMotherIdea(newMotherTitle)
        if (result.error) toast.error('Failed to create Pillar')
        else {
            toast.success('Pillar created')
            setNewMotherTitle('')
            loadData() // Refetch all to get new IDs
        }
    }

    async function handleDeleteMother(id: string) {
        if (!confirm('Delete this Pillar and all its sub-ideas?')) return
        const result = await deleteMotherIdea(id)
        if (result.error) toast.error('Failed to delete Pillar')
        else {
            toast.success('Pillar deleted')
            loadData()
        }
    }

    async function handleCreateChild(parentId: string) {
        const content = newChildContent[parentId]
        if (!content?.trim()) return

        const result = await createChildIdea(parentId, content)
        if (result.error) toast.error('Failed to create sub-idea')
        else {
            toast.success('Sub-idea created')
            setNewChildContent(prev => ({ ...prev, [parentId]: '' }))
            handleRefreshChildren(parentId)
        }
    }

    async function handleDeleteChild(parentId: string, childId: string) {
        if (!confirm('Delete this sub-idea?')) return
        const result = await deleteChildIdea(childId)
        if (result.error) toast.error('Failed to delete sub-idea')
        else {
            toast.success('Sub-idea deleted')
            handleRefreshChildren(parentId)
        }
    }

    async function handleSaveMotherEdit(id: string) {
        if (!editValue.trim()) return setEditingMotherId(null)
        const result = await updateMotherIdea(id, editValue)
        if (result.error) toast.error('Failed to update Pillar')
        else {
            toast.success('Pillar updated')
            setEditingMotherId(null)
            loadData()
        }
    }

    async function handleSaveChildEdit(parentId: string, childId: string) {
        if (!editValue.trim()) return setEditingChildId(null)
        const result = await updateChildIdea(childId, { content: editValue })
        if (result.error) toast.error('Failed to update sub-idea')
        else {
            toast.success('Sub-idea updated')
            setEditingChildId(null)
            handleRefreshChildren(parentId)
        }
    }

    async function handleContentTypeChange(parentId: string, childId: string, newType: string) {
        const result = await updateChildIdea(childId, { content_type: newType })
        if (result.error) toast.error('Failed to update content type')
        else {
            toast.success('Content type updated')
            handleRefreshChildren(parentId)
        }
    }

    async function handleFormatTypeChange(parentId: string, childId: string, newFormat: string) {
        const result = await updateChildIdea(childId, { format_type: newFormat })
        if (result.error) toast.error('Failed to update format')
        else {
            toast.success('Format updated')
            handleRefreshChildren(parentId)
        }
    }

    async function handleSaveScript() {
        if (!activeScriptChildId || !activeScriptParentId) return
        // Read the latest value from the uncontrolled textarea ref
        const currentValue = scriptTextareaRef.current?.value ?? scriptValue
        const result = await updateChildIdea(activeScriptChildId, { script_content: currentValue })
        if (result.error) toast.error('Failed to save script')
        else {
            toast.success('Script saved')
            setScriptModalOpen(false)
            handleRefreshChildren(activeScriptParentId)
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setMotherIdeas((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                reorderMotherIdeas(newOrder.map(item => item.id)).then(res => {
                    if (res.error) toast.error('Failed to save arrangement');
                    else toast.success('Arrangement saved automatically');
                });

                return newOrder;
            });
        }
    }

    function handleIdeaHelperSelect(option: string) {
        navigator.clipboard.writeText(option)
        toast.success('Inspiration source copied to clipboard!')
    }

    if (isLoading) return <div className="text-center text-slate-500 py-10">Loading...</div>

    return (
        <div className="space-y-6 w-full pb-20">

            {/* Section 1: Create Content Pillar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Library className="w-5 h-5 text-[#1C73E8]" />
                        Content Pillars
                    </h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] bg-[#1C73E8]/10 text-[#1C73E8] hover:bg-[#1C73E8]/20 hover:text-[#1C73E8]">
                                <Sparkles className="w-3 h-3 mr-1.5" />
                                Idea Helper
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[420px] max-h-[500px] overflow-y-auto bg-[#171717] border-white/10 text-white shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sources of Inspiration</DropdownMenuLabel>
                            {IDEA_HELPER_SOURCES.map((source, i) => (
                                <DropdownMenuItem
                                    key={i}
                                    className="text-xs hover:bg-white/10 cursor-pointer focus:bg-white/10"
                                    onClick={() => handleIdeaHelperSelect(source)}
                                >
                                    {source}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex gap-3 items-center bg-[#171717] p-3 rounded-lg border border-white/10">
                    <Input
                        value={newMotherTitle}
                        onChange={(e) => setNewMotherTitle(e.target.value)}
                        placeholder="New Content Pillar (e.g., 'Behind the scenes at G4')"
                        className="bg-[#0c0c0c] border-white/10 text-sm text-white w-full md:max-w-md h-9"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateMother()}
                    />
                    <Button onClick={handleCreateMother} disabled={!newMotherTitle.trim()} size="sm" className="shrink-0 bg-[#1C73E8] text-white hover:bg-[#1557b0] transition-colors h-9">
                        <Plus className="w-4 h-4 mr-2" /> Create Pillar
                    </Button>
                </div>
            </div>

            <div className="h-[1px] bg-white/10" />

            {/* Section 2: Mother Ideas List */}
            <div className="space-y-4">

                {motherIdeas.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-600 italic border border-dashed border-white/5 rounded-lg w-full mx-auto">
                        No Content Pillars created yet.<br />
                        Start by creating one above!
                    </div>
                )}

                <div className="flex flex-col gap-4 w-full">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={motherIdeas.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            {motherIdeas.map(mother => {
                                const children = childIdeas[mother.id] || []
                                const isExpanded = expandedCards[mother.id]

                                return (
                                    <SortableMotherCardWrapper key={mother.id} id={mother.id}>
                                        {(attributes, listeners) => (
                                            <Card className="bg-[#171717] border-white/10 rounded-lg overflow-hidden p-0 gap-0 shadow-lg">
                                                {/* Mother Header */}
                                                <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between bg-black/20 group">
                                                    <div className="flex items-center gap-2.5 flex-1">
                                                        <div
                                                            {...attributes}
                                                            {...listeners}
                                                            className="flex items-center justify-center p-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 transition-colors"
                                                        >
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                        <div className="w-6 h-6 rounded bg-[#1C73E8]/10 text-[#1C73E8] flex items-center justify-center shrink-0">
                                                            <Library className="w-3.5 h-3.5" />
                                                        </div>
                                                        {editingMotherId === mother.id ? (
                                                            <Input
                                                                autoFocus
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={() => handleSaveMotherEdit(mother.id)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSaveMotherEdit(mother.id)
                                                                    if (e.key === 'Escape') setEditingMotherId(null)
                                                                }}
                                                                className="bg-black/50 border-white/20 text-white h-7 text-sm font-semibold px-2"
                                                            />
                                                        ) : (
                                                            <h4 className="font-semibold text-sm text-white px-2 py-0.5 rounded transition-colors -ml-2">
                                                                {mother.title}
                                                            </h4>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">

                                                        <button
                                                            onClick={() => {
                                                                setEditingMotherId(mother.id)
                                                                setEditValue(mother.title)
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-colors shrink-0"
                                                            title="Edit Pillar"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMother(mother.id)}
                                                            className="p-1 text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                            title="Delete Pillar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleCard(mother.id)}
                                                            className="p-1 text-slate-400 hover:text-white transition-colors shrink-0"
                                                            title={isExpanded ? "Collapse" : "Expand"}
                                                        >
                                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <CardContent className="p-3 space-y-2">
                                                        {/* Child Ideas List */}
                                                        <div className="space-y-1.5">
                                                            {children.length === 0 ? (
                                                                <p className="text-[11px] text-slate-500 italic px-1 pt-1">No child ideas yet.</p>
                                                            ) : (
                                                                <>
                                                                    <div className="hidden sm:flex px-1.5 pb-1">
                                                                        <div className="flex-1"></div>
                                                                        <div className="flex items-center gap-2 sm:ml-auto">
                                                                            <span className="w-[130px] text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">Content Angle</span>
                                                                            <span className="w-[130px] text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">Format</span>
                                                                            <div className="w-[90px]"></div>{/* Spacer for actions */}
                                                                        </div>
                                                                    </div>
                                                                    {children.map(child => (
                                                                        <div key={child.id} className="flex flex-col sm:flex-row sm:items-start gap-2 p-1.5 rounded bg-[#2a2a2a]/40 border border-white/5 group hover:border-white/10 transition-colors">
                                                                            <div className="flex items-start gap-2 flex-1">
                                                                                <CornerDownRight className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                                                                                {editingChildId === child.id ? (
                                                                                    <Input
                                                                                        autoFocus
                                                                                        value={editValue}
                                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                                        onBlur={() => handleSaveChildEdit(mother.id, child.id)}
                                                                                        onKeyDown={(e) => {
                                                                                            if (e.key === 'Enter') handleSaveChildEdit(mother.id, child.id)
                                                                                            if (e.key === 'Escape') setEditingChildId(null)
                                                                                        }}
                                                                                        className="bg-black/50 border-white/20 text-slate-300 h-6 text-[13px] px-2 flex-1"
                                                                                    />
                                                                                ) : (
                                                                                    <p className="text-[13px] text-slate-300 flex-1 whitespace-pre-wrap leading-snug break-words px-1 rounded transition-colors">
                                                                                        {child.content}
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex items-center gap-2 pl-5 sm:pl-0 sm:ml-auto">
                                                                                <Select
                                                                                    value={child.content_type || ''}
                                                                                    onValueChange={(value) => handleContentTypeChange(mother.id, child.id, value)}
                                                                                >
                                                                                    <SelectTrigger className="h-6 text-[11px] w-[130px] bg-black/40 border-white/10 text-slate-400 focus:ring-0">
                                                                                        <SelectValue placeholder="Content Angle" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent className="bg-[#171717] border-white/10 text-white max-h-[300px]">
                                                                                        {CONTENT_TYPES.map(type => (
                                                                                            <SelectItem key={type.value} value={type.value} title={type.description} className="text-[12px] hover:bg-white/10 focus:bg-white/10 cursor-pointer group">
                                                                                                <div className="flex items-center justify-between gap-4 w-full min-w-[200px]">
                                                                                                    <span>{type.value}</span>
                                                                                                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity ml-auto text-right">
                                                                                                        {type.description}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>

                                                                                <Select
                                                                                    value={child.format_type || ''}
                                                                                    onValueChange={(value) => handleFormatTypeChange(mother.id, child.id, value)}
                                                                                >
                                                                                    <SelectTrigger className="h-6 text-[11px] w-[130px] bg-black/40 border-white/10 text-slate-400 focus:ring-0">
                                                                                        <SelectValue placeholder="Format" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent className="bg-[#171717] border-white/10 text-white max-h-[300px]">
                                                                                        {FORMAT_TYPES.map(type => (
                                                                                            <SelectItem key={type.value} value={type.value} title={type.description} className="text-[12px] hover:bg-white/10 focus:bg-white/10 cursor-pointer group">
                                                                                                <div className="flex items-center justify-between gap-4 w-full min-w-[200px]">
                                                                                                    <span>{type.value}</span>
                                                                                                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity ml-auto text-right">
                                                                                                        {type.description}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>

                                                                                <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-2">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setActiveScriptChildId(child.id)
                                                                                            setActiveScriptParentId(mother.id)
                                                                                            setScriptValue(child.script_content || '')
                                                                                            setScriptModalOpen(true)
                                                                                        }}
                                                                                        className={`p-1 transition-colors shrink-0 ${child.script_content ? 'text-[#1C73E8]' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}
                                                                                        title={child.script_content ? "View/Edit Script" : "Add Script"}
                                                                                    >
                                                                                        <FileText className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setEditingChildId(child.id)
                                                                                            setEditValue(child.content)
                                                                                        }}
                                                                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-colors shrink-0"
                                                                                        title="Edit sub-idea"
                                                                                    >
                                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteChild(mother.id, child.id)}
                                                                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-all shrink-0"
                                                                                        title="Delete sub-idea"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Add Child Input */}
                                                        <div className="flex gap-2 pt-2 border-t border-white/5">
                                                            <Input
                                                                value={newChildContent[mother.id] || ''}
                                                                onChange={(e) => setNewChildContent(prev => ({ ...prev, [mother.id]: e.target.value }))}
                                                                placeholder="Type here"
                                                                className="bg-[#0c0c0c] border-white/10 text-xs text-white max-w-xs transition-all focus:border-[#1C73E8]/50 h-6 px-2 rounded"
                                                                onKeyDown={(e) => e.key === 'Enter' && handleCreateChild(mother.id)}
                                                            />
                                                            <Button
                                                                onClick={() => handleCreateChild(mother.id)}
                                                                disabled={!(newChildContent[mother.id] || '').trim()}
                                                                variant="secondary"
                                                                size="sm"
                                                                className="shrink-0 bg-white/5 hover:bg-white/10 text-white transition-colors h-6 px-2 text-[11px] rounded"
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        )}
                                    </SortableMotherCardWrapper>
                                )
                            })}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Script Modal */}
            <Dialog open={scriptModalOpen} onOpenChange={(open) => {
                if (!open && scriptTextareaRef.current) {
                    setScriptValue(scriptTextareaRef.current.value)
                }
                setScriptModalOpen(open)
            }}>
                <DialogContent className="bg-[#171717] border-white/10 text-white sm:max-w-[700px] h-[80vh] flex flex-col [&>button]:text-white">
                    <DialogHeader>
                        <DialogTitle>Script / Description</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {(() => {
                                if (activeScriptParentId && activeScriptChildId) {
                                    const children = childIdeas[activeScriptParentId] || []
                                    const child = children.find(c => c.id === activeScriptChildId)
                                    if (child?.content) return <span className="text-slate-300 italic">&ldquo;{child.content}&rdquo;</span>
                                }
                                return "Write the video script, captions, or notes for this idea."
                            })()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 py-4 overflow-hidden">
                        <textarea
                            ref={scriptTextareaRef}
                            defaultValue={scriptValue}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    if (scriptTextareaRef.current) {
                                        setScriptValue(scriptTextareaRef.current.value)
                                    }
                                    handleSaveScript()
                                }
                            }}
                            placeholder="Write your script here..."
                            className="w-full h-full min-h-full resize-none bg-[#0c0c0c] border border-white/10 rounded-md text-white placeholder:text-slate-500 p-4 text-[15px] outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setScriptModalOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 h-9">
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            if (scriptTextareaRef.current) {
                                setScriptValue(scriptTextareaRef.current.value)
                            }
                            handleSaveScript()
                        }} className="bg-[#1C73E8] text-white hover:bg-[#1557b0] h-9">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
