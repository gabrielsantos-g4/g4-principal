'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, PlayCircle, X, CalendarIcon, Edit2, Trash2 } from 'lucide-react'
import { format } from "date-fns"
import { enUS } from "date-fns/locale"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateMilestone } from '@/actions/milestones/update-milestone'
import { deleteMilestone } from '@/actions/milestones/delete-milestone'
import { toast } from "sonner"

interface MilestoneEditPanelProps {
    milestone: any
    onClose: () => void
    onUpdate: (updatedMilestone: any) => void
    onDelete?: (id: string) => void
    users: any[]
}

const STATUS_ICONS = {
    'To Do': <Clock size={16} className="text-slate-400" />,
    'Doing': <PlayCircle size={16} className="text-blue-400" />,
    'In Review': <Clock size={16} className="text-yellow-400" />,
    'Approved': <CheckCircle2 size={16} className="text-emerald-400" />,
    'Rejected': <X size={16} className="text-red-400" />,
    'Aborted': <X size={16} className="text-red-400" />
}

export function MilestoneEditPanel({ milestone, onClose, onUpdate, onDelete, users }: MilestoneEditPanelProps) {

    // Local state for editing fields
    const [actionTitle, setActionTitle] = useState(milestone.action_title || '')
    const [targetMetric, setTargetMetric] = useState(milestone.target_metric || '')
    const [date, setDate] = useState<Date | undefined>(
        milestone.deadline ? new Date(milestone.deadline) : undefined
    )
    const [status, setStatus] = useState(milestone.status || 'To Do')
    const [assignee, setAssignee] = useState(milestone.assignees?.[0] || 'Unassigned')
    const [comments, setComments] = useState(milestone.comments || '')

    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        const payload = {
            id: milestone.id,
            action_title: actionTitle,
            target_metric: targetMetric,
            deadline: date ? date.toISOString() : null,
            status,
            assignees: assignee === 'Unassigned' ? [] : [assignee],
            comments
        }

        const result = await updateMilestone(payload)

        if (result.error) {
            toast.error("Error saving", { description: result.error })
        } else if (result.data) {
            toast.success("Milestone saved!")
            onUpdate(result.data)
            onClose()
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        setDeleting(true)
        const result = await deleteMilestone(milestone.id)
        if (result.error) {
            toast.error("Error deleting", { description: result.error })
            setDeleting(false)
        } else {
            toast.success("Goal deleted.")
            onDelete?.(milestone.id)
            onClose()
        }
    }

    return (
        <div className="absolute top-0 right-0 w-[450px] max-w-full h-full bg-[#1e1e1e] border-l border-white/10 shadow-2xl flex flex-col z-50 transform transition-transform animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-white/5 shrink-0 gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">{milestone.month_label}</span>
                        <Edit2 size={12} className="text-slate-500" />
                    </div>
                    <Textarea
                        value={actionTitle}
                        onChange={(e) => setActionTitle(e.target.value)}
                        className="text-base font-bold text-white bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none w-full placeholder:text-white/30 resize-none min-h-[48px]"
                        placeholder="Action Description..."
                    />
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full shrink-0">
                    <X size={16} />
                </button>
            </div>

            {/* Editor Content Scroll */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">

                {/* Status */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full bg-[#171717] border-white/10 text-white h-9 focus:ring-0">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e1e] border-white/10 text-white z-[9999]" position="item-aligned">
                            {Object.keys(STATUS_ICONS).map((s) => (
                                <SelectItem key={s} value={s} className="hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer py-2">
                                    <div className="flex items-center gap-2">
                                        {STATUS_ICONS[s as keyof typeof STATUS_ICONS]}
                                        <span>{s}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Deadline Picker */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Deadline</label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal bg-[#171717] border-white/10 hover:bg-white/5 hover:text-white h-9
                        ${!date ? "text-slate-400" : "text-white"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "MMM do, yyyy", { locale: enUS }) : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-white/10 text-white shadow-xl z-[9999]" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => {
                                    setDate(d)
                                    setIsCalendarOpen(false)
                                }}
                                initialFocus
                                className="bg-[#1e1e1e] pointer-events-auto"
                                classNames={{
                                    day_today: "bg-white/5 text-white",
                                    day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                                    head_cell: "text-slate-400 font-normal",
                                    nav_button_previous: "hidden",
                                    nav_button_next: "hidden",
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Objective */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Objective (Number)</label>
                    <Input
                        value={targetMetric}
                        onChange={(e) => setTargetMetric(e.target.value)}
                        placeholder="e.g 1000 leads"
                        className="bg-[#171717] border-white/10 text-white h-9 focus-visible:ring-1 focus-visible:ring-blue-500"
                    />
                </div>

                {/* Assignee */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Assignee</label>
                    <Select value={assignee} onValueChange={setAssignee}>
                        <SelectTrigger className="w-full bg-[#171717] border-white/10 text-white h-9 focus:ring-0">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e1e] border-white/10 text-white z-[9999]" position="item-aligned">
                            <SelectItem value="Unassigned" className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-slate-400">Unassigned</SelectItem>
                            {users.map((u) => (
                                <SelectItem key={u.id} value={u.name} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer focus:text-white py-1.5">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-5 h-5">
                                            <AvatarImage src={u.avatar_url} />
                                            <AvatarFallback className="text-[10px] bg-white/10">{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {u.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Comments */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Comments</label>
                    <Textarea
                        placeholder="Add a comment or update..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="min-h-[80px] bg-[#171717] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
                    />
                </div>

            </div>

            {/* Footer Controls */}
            <div className="p-4 border-t border-white/5 bg-[#171717] shrink-0">
                {showDeleteConfirm ? (
                    /* Inline confirmation — avoids nested Dialog conflict */
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-white/80">
                            Delete <span className="font-semibold text-white">&ldquo;{milestone.action_title || 'this goal'}&rdquo;</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                            >
                                {deleting ? 'Deleting...' : 'Yes, delete'}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 text-slate-300 hover:text-white hover:bg-white/5 text-sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5 px-3"
                        >
                            <Trash2 size={14} />
                            Delete
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}
