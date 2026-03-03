"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Edit2, Plus, GripVertical } from "lucide-react"
import { format, getWeeksInMonth, getWeekOfMonth, getDaysInMonth } from "date-fns"
import { enUS } from "date-fns/locale"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    rectIntersection,
    useDroppable,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { getMilestones } from "@/actions/milestones/get-milestones"
import { createMilestone } from "@/actions/milestones/create-milestone"
import { updateMilestone } from "@/actions/milestones/update-milestone"
import { getMessagingUsers } from "@/actions/users/get-messaging-users"
import { MilestoneEditPanel } from "./milestone-edit-panel"

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const buildColumns = () => {
    const now = new Date()
    const currentMonthIndex = now.getMonth()
    const currentYear = now.getFullYear()
    return Array.from({ length: 12 }).map((_, i) => {
        const monthIndex = (currentMonthIndex + i) % 12
        const yearOffset = Math.floor((currentMonthIndex + i) / 12)
        const year = currentYear + yearOffset
        return { id: monthIndex, year, label: `${MONTHS_EN[monthIndex]} ${year}` }
    })
}

const COLUMNS = buildColumns()

function getContainerForMilestone(m: any): string {
    const col = COLUMNS.find(c => c.id === m.month_index)
    if (!col) return `${m.month_index}-week-1`
    const weeksCount = getWeeksInMonth(new Date(col.year, col.id, 1))
    if (!m.deadline) return `${col.id}-week-1`
    const d = new Date(m.deadline)
    let week = getWeekOfMonth(d)
    week = Math.max(1, Math.min(week, weeksCount))
    return `${col.id}-week-${week}`
}

function deadlineForWeek(weekNum: number, monthIndex: number, year: number): string {
    const totalDays = getDaysInMonth(new Date(year, monthIndex))
    const targetDay = Math.min((weekNum - 1) * 7 + 1, totalDays)
    return new Date(year, monthIndex, targetDay, 12, 0, 0).toISOString()
}

function parseContainer(id: string): { monthIndex: number; weekNum: number } | null {
    const parts = id.split('-week-')
    if (parts.length !== 2) return null
    return { monthIndex: parseInt(parts[0]), weekNum: parseInt(parts[1]) }
}

interface MilestoneModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userProfile?: any
}

// ─── Sortable Card ─────────────────────────────────────────────────────────────
function SortableCard({ item, users, onEdit }: { item: any; users: any[]; onEdit: (item: any) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className="w-full bg-[#272727] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors shadow-sm group relative shrink-0">
            <div {...attributes} {...listeners} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 z-20" onClick={e => e.stopPropagation()}>
                <GripVertical size={14} />
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-1.5 rounded-full z-10" onClick={e => { e.stopPropagation(); onEdit(item) }}>
                <Edit2 size={12} className="text-slate-400" />
            </div>

            <div className="flex flex-col gap-2 pl-4 cursor-pointer" onClick={() => onEdit(item)}>
                <h4 className="font-medium text-white/90 leading-tight pr-6">{item.action_title}</h4>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        (item.status === 'Doing' || item.status === 'In Review') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            item.status === 'Aborted' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {item.status.toUpperCase()}
                    </span>
                    {item.deadline && (
                        <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-slate-300 border border-white/5 flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {format(new Date(item.deadline), "E, MMM dd", { locale: enUS })}
                        </span>
                    )}
                    {item.assignees?.length > 0 && (
                        <div className="flex items-center gap-1 ml-auto">
                            {item.assignees.map((name: string, idx: number) => {
                                const u = users.find((u: any) => u.name === name)
                                if (!u) return null
                                return (
                                    <Avatar key={idx} className="w-5 h-5 border border-white/10 shrink-0">
                                        <AvatarImage src={u.avatar_url} />
                                        <AvatarFallback className="text-[8px] bg-white/10">{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                )
                            })}
                        </div>
                    )}
                </div>

                {item.target_metric && (
                    <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Objective</span>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-flex">{item.target_metric}</span>
                    </div>
                )}
                {item.comments && (
                    <span className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed bg-white/[0.02] p-2 rounded-md border border-white/5 block">
                        {item.comments.split('\n')[0]}
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Droppable Week Column (makes empty columns accept drops too) ──────────────
function WeekColumn({ containerId, weekNum, items, users, onEdit }: {
    containerId: string
    weekNum: number
    items: any[]
    users: any[]
    onEdit: (item: any) => void
}) {
    const { setNodeRef, isOver } = useDroppable({ id: containerId })

    return (
        <div className={`flex flex-col flex-1 min-w-[260px] rounded-[16px] border h-full transition-colors ${isOver ? 'bg-blue-500/10 border-blue-400/40' : 'bg-[#1e1e1e] border-white/5'}`}>
            <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Week {weekNum}</span>
                {items.length > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-white/10 rounded text-white/50">{items.length}</span>
                )}
            </div>
            <SortableContext id={containerId} items={items.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar min-h-[80px]">
                    {items.map(item => (
                        <SortableCard key={item.id} item={item} users={users} onEdit={onEdit} />
                    ))}
                </div>
            </SortableContext>
        </div>
    )
}

function CardOverlay({ item }: { item: any }) {
    return (
        <div className="w-[260px] bg-[#3a3a3a] border border-blue-500/40 rounded-xl p-4 shadow-2xl opacity-95 cursor-grabbing rotate-1">
            <h4 className="font-medium text-white/90 leading-tight text-sm">{item.action_title}</h4>
        </div>
    )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function MilestoneModal({ open, onOpenChange, userProfile }: MilestoneModalProps) {
    const [milestones, setMilestones] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creatingMonth, setCreatingMonth] = useState<number | null>(null)
    const [editingMilestone, setEditingMilestone] = useState<any | null>(null)
    const [activeItem, setActiveItem] = useState<any | null>(null)

    // Track original container when drag starts, so onDragEnd knows if it really moved
    const originalContainerRef = useRef<string>('')

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    useEffect(() => {
        if (open && userProfile?.empresa_id) fetchData()
    }, [open, userProfile])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [milestonesRes, usersRes] = await Promise.all([getMilestones(userProfile.empresa_id), getMessagingUsers()])
            if (milestonesRes.data) setMilestones(milestonesRes.data)
            if (usersRes) setUsers(usersRes)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleUpdate = (updated: any) => setMilestones(prev => prev.map(m => m.id === updated.id ? updated : m))

    const handleAddCard = async (monthIndex: number, monthLabel: string) => {
        if (!userProfile?.empresa_id) return
        setCreatingMonth(monthIndex)
        try {
            const result = await createMilestone(userProfile.empresa_id, monthIndex, monthLabel)
            if (result.data) { setMilestones(prev => [...prev, result.data]); setEditingMilestone(result.data) }
        } catch (e) { console.error(e) }
        finally { setCreatingMonth(null) }
    }

    // ── DnD ──────────────────────────────────────────────────────────────────

    const handleDragStart = ({ active }: DragStartEvent) => {
        const item = milestones.find(m => m.id === active.id)
        setActiveItem(item ?? null)
        if (item) originalContainerRef.current = getContainerForMilestone(item)
    }

    const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
        if (!over) return
        const activeId = active.id as string
        const overId = over.id as string
        if (activeId === overId) return

        setMilestones(prev => {
            const activeMilestone = prev.find(m => m.id === activeId)
            if (!activeMilestone) return prev

            const activeContainer = getContainerForMilestone(activeMilestone)

            // Determine the over container
            const isOverContainer = overId.includes('-week-')
            let overContainer: string
            if (isOverContainer) {
                overContainer = overId
            } else {
                const overMile = prev.find(m => m.id === overId)
                if (!overMile) return prev
                overContainer = getContainerForMilestone(overMile)
            }

            if (activeContainer === overContainer) {
                // Same container: reorder
                if (!isOverContainer) {
                    const sameItems = prev.filter(m => getContainerForMilestone(m) === activeContainer)
                    const others = prev.filter(m => getContainerForMilestone(m) !== activeContainer)
                    const oldIdx = sameItems.findIndex(m => m.id === activeId)
                    const newIdx = sameItems.findIndex(m => m.id === overId)
                    if (oldIdx === -1 || newIdx === -1) return prev
                    return [...others, ...arrayMove(sameItems, oldIdx, newIdx)]
                }
                return prev
            }

            // Cross-container: compute new deadline for the target container
            const parsed = parseContainer(overContainer)
            if (!parsed) return prev
            const { monthIndex, weekNum } = parsed
            const col = COLUMNS.find(c => c.id === monthIndex)
            if (!col) return prev
            const newDeadline = deadlineForWeek(weekNum, monthIndex, col.year)

            const others = prev.filter(m => m.id !== activeId)
            const moved = { ...activeMilestone, month_index: monthIndex, deadline: newDeadline }

            // Insert before the card we're hovering over, or append to container
            if (!isOverContainer) {
                const overIdx = others.findIndex(m => m.id === overId)
                if (overIdx !== -1) {
                    const result = [...others]
                    result.splice(overIdx, 0, moved)
                    return result
                }
            }
            return [...others, moved]
        })
    }, [])

    const handleDragEnd = useCallback(async ({ active }: DragEndEvent) => {
        setActiveItem(null)

        const activeId = active.id as string
        setMilestones(prev => {
            const activeMilestone = prev.find(m => m.id === activeId)
            if (!activeMilestone) return prev

            const currentContainer = getContainerForMilestone(activeMilestone)
            const originalContainer = originalContainerRef.current

            // Persist if container changed
            if (currentContainer !== originalContainer) {
                const parsed = parseContainer(currentContainer)
                if (parsed) {
                    const { monthIndex, weekNum } = parsed
                    const col = COLUMNS.find(c => c.id === monthIndex)
                    if (col) {
                        const newDeadline = deadlineForWeek(weekNum, monthIndex, col.year)
                        // Fire-and-forget — state is already optimistically updated
                        updateMilestone({
                            id: activeId,
                            deadline: newDeadline,
                            action_title: activeMilestone.action_title,
                            target_metric: activeMilestone.target_metric,
                            status: activeMilestone.status,
                            assignees: activeMilestone.assignees ?? [],
                            comments: activeMilestone.comments ?? '',
                        })
                    }
                }
            }
            return prev
        })
        originalContainerRef.current = ''
    }, [])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[98vw] h-[98vh] sm:max-w-[98vw] bg-[#171717] border-white/10 text-white flex flex-col p-6 overflow-hidden">
                <DialogHeader className="shrink-0 mb-2">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Project Milestones</DialogTitle>
                    <p className="text-sm text-slate-400 mt-1">Macro schedule and objectives of your marketing and sales project with g4.</p>
                </DialogHeader>

                <div className="flex-1 w-full mt-2 overflow-hidden flex flex-col justify-start">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="w-full h-full overflow-x-auto custom-scrollbar pb-6 flex items-start snap-x snap-mandatory">
                            <div className="flex items-start space-x-4 md:space-x-6 lg:space-x-8 min-w-max h-full p-1">

                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">Loading milestones...</div>
                                ) : (
                                    COLUMNS.map(col => {
                                        const colMilestones = milestones.filter(m => m.month_index === col.id)
                                        const weeksCount = getWeeksInMonth(new Date(col.year, col.id, 1))
                                        const weeksArray = Array.from({ length: weeksCount }, (_, i) => i + 1)

                                        return (
                                            <div key={col.id} className="flex flex-col w-[92vw] max-w-[1200px] bg-white/5 border border-white/10 rounded-2xl shrink-0 h-full max-h-[80vh]">
                                                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold text-white/90 text-lg">{col.label}</h3>
                                                        <span className="text-sm font-semibold px-2.5 py-1 bg-white/10 rounded-full text-white/50">{colMilestones.length} Goals</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddCard(col.id, col.label)}
                                                        disabled={creatingMonth === col.id}
                                                        className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {creatingMonth === col.id ? <span className="animate-pulse">Creating...</span> : <><Plus size={14} />New Goal</>}
                                                    </button>
                                                </div>

                                                <div className="flex-1 overflow-x-auto p-4 flex gap-4 custom-scrollbar">
                                                    {weeksArray.map(weekNum => {
                                                        const containerId = `${col.id}-week-${weekNum}`
                                                        const weekItems = colMilestones.filter(m => getContainerForMilestone(m) === containerId)
                                                        return (
                                                            <WeekColumn
                                                                key={containerId}
                                                                containerId={containerId}
                                                                weekNum={weekNum}
                                                                items={weekItems}
                                                                users={users}
                                                                onEdit={setEditingMilestone}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                            {activeItem ? <CardOverlay item={activeItem} /> : null}
                        </DragOverlay>
                    </DndContext>
                </div>

                {editingMilestone && (
                    <MilestoneEditPanel
                        milestone={editingMilestone}
                        users={users}
                        onUpdate={handleUpdate}
                        onDelete={(id) => {
                            setMilestones(prev => prev.filter(m => m.id !== id))
                            setEditingMilestone(null)
                        }}
                        onClose={() => setEditingMilestone(null)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
