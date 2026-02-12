'use client'

import { useState, useEffect, useRef } from 'react'
import { Pencil, Trash2, Loader2, Save, X, AlertTriangle, Plus, Check, Brain, User, Shield, ShieldCheck, MessageCircle, Camera, Users2, GripVertical, RotateCcw } from 'lucide-react'
import { Reorder, useDragControls } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createCompanyUser, updateCompanyUser, getCompanyUsers, deleteCompanyUser, updateTeamOrder } from '@/actions/users'
import { updateActiveAgents } from '@/actions/agent-actions'
import { Agent, AGENTS } from '@/lib/agents'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import { MultiSelect } from '@/components/ui/multi-select'

function Badge({ children, variant, className }: any) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            variant === 'outline' ? 'ring-white/20' : '',
            className
        )}>
            {children}
        </span>
    )
}

interface UseProfile {
    id: string
    name: string
    email: string
    role: string
    job_title?: string
    avatar_url: string
    has_messaging_access?: boolean
    active_agents?: string[]
}

interface UnifiedTeamProps {
    initialActiveAgents?: string[] | null
    readOnly?: boolean
}

interface TeamRowProps {
    item: any
    selectedAgents: string[]
    toggleAgent: (id: string) => void
    setEditingUser: (user: UseProfile) => void
    setDeleteUser: (user: UseProfile) => void
    readOnly?: boolean
}

function TeamRow({ item, selectedAgents, toggleAgent, setEditingUser, setDeleteUser, readOnly }: TeamRowProps) {
    const { type, data, isFixed } = item
    // Gabriel Santos is a hybrid: human specialist but toggleable like an agent
    const isGabriel = item.id === 'agent-professional-gabriel'
    const isActive = (type === 'human' && !isGabriel) ? true : selectedAgents.includes(data.id)

    return (
        <Reorder.Item
            value={item}
            id={item.id}
            as="tr"
            dragListener={!isFixed}
            className={cn(
                "border-white/10 hover:bg-white/[0.04] group transition-colors select-none",
                !isFixed && "cursor-grab active:cursor-grabbing",
                (type === 'agent' || isGabriel) && !isActive && "opacity-40 grayscale hover:opacity-60 transition-opacity"
            )}
        >
            <TableCell className="w-[40px] pl-4">
                <div className="flex items-center gap-2">
                    {!isFixed && !readOnly ? (
                        <GripVertical size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    ) : (
                        <div className="w-[14px]" />
                    )}
                    {type === 'human' ? (
                        <User size={16} className="text-blue-400/50" />
                    ) : (
                        <Brain size={16} className={cn(isActive ? "text-purple-400" : "text-slate-600")} />
                    )}
                </div>
            </TableCell>

            <TableCell className="font-medium text-white px-4 py-4 w-[300px]">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden border transition-all",
                        type === 'human' ? "bg-slate-800 border-white/10 ring-2 ring-transparent group-hover:ring-blue-500/20" :
                            (isActive ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-white/10")
                    )}>
                        {type === 'human' ? (
                            data.avatar_url ? (
                                <img src={data.avatar_url} alt={data.name} className="w-full h-full object-cover" />
                            ) : (data.avatar ? <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" /> : data.name.charAt(0).toUpperCase())
                        ) : (
                            <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className={cn("text-sm font-semibold", !isActive && (type === 'agent' || isGabriel) ? "text-slate-400" : "text-white")}>
                            {data.name}
                        </span>
                        {type === 'human' ? (
                            <span className="text-[11px] text-slate-500 leading-none mt-1">{data.email || 'Specialist'}</span>
                        ) : (
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <span className="text-[10px] text-purple-400/70 leading-none mt-1 cursor-help uppercase tracking-widest font-bold">AI Agent</span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#111] border-white/10 text-white max-w-xs">
                                        {data.description}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </TableCell>

            <TableCell className="w-[120px]">
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold",
                        type === 'human' ? "border-blue-500/30 text-blue-400 bg-blue-500/5" : "border-purple-500/30 text-purple-400 bg-purple-500/5"
                    )}
                >
                    {type === 'human' ? 'Human' : 'AI Agent'}
                </Badge>
            </TableCell>

            <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        {type === 'human' && data.role === 'admin' ? (
                            <>
                                <ShieldCheck size={13} className="text-purple-400" />
                                <span className="text-sm font-bold text-slate-300">Admin</span>
                                {data.job_title && <span className="text-xs text-slate-500 border-l border-white/10 pl-2 ml-1">{data.job_title}</span>}
                            </>
                        ) : type === 'human' ? (
                            <>
                                <Shield size={13} className="text-slate-500" />
                                <span className="text-sm text-slate-300 capitalize">{data.job_title || 'Member'}</span>
                            </>
                        ) : (
                            <span className="text-sm text-slate-300">{data.role}</span>
                        )}
                    </div>

                    {type === 'human' && data.active_agents && data.active_agents.length > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex -space-x-1.5">
                                {data.active_agents.slice(0, 3).map((id: string) => {
                                    const agent = AGENTS.find(a => a.id === id)
                                    return agent ? (
                                        <div key={id} className="w-5 h-5 rounded-full border border-[#0c0c0c] overflow-hidden bg-slate-800" title={agent.name}>
                                            <img src={agent.avatar} className="w-full h-full object-cover" alt={agent.name} />
                                        </div>
                                    ) : null
                                })}
                            </div>
                            {data.active_agents.length > 3 && (
                                <span className="text-[9px] text-slate-500 font-bold">+{data.active_agents.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </TableCell>

            <TableCell className="text-right pr-6 w-[200px]">
                <div className="flex items-center justify-end gap-3">
                    {type === 'human' && data.has_messaging_access && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <MessageCircle size={14} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Has messaging access</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {type === 'agent' || isGabriel ? (
                        !readOnly ? (
                            <Button
                                size="sm"
                                variant={isActive ? "secondary" : "outline"}
                                onClick={() => toggleAgent(data.id)}
                                className={cn(
                                    "h-8 text-[10px] font-bold uppercase tracking-widest w-24 transition-all active:scale-95",
                                    isActive ? "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30" : "border-white/10 text-slate-500 hover:bg-white/10"
                                )}
                            >
                                {isActive ? (
                                    <><Check size={12} className="mr-1.5" /> Active</>
                                ) : (
                                    <><Plus size={12} className="mr-1.5" /> Hire</>
                                )}
                            </Button>
                        ) : (
                            <Badge variant="outline" className={cn("text-[10px]", isActive ? "border-green-500/30 text-green-500" : "border-slate-800 text-slate-700")}>
                                {isActive ? "Active" : "Inactive"}
                            </Badge>
                        )
                    ) : (
                        <div className="flex items-center justify-end gap-3">
                            {isFixed && (
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2">Owner</span>
                            )}
                            {!readOnly && (
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                        onClick={() => setEditingUser(data)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    {!isFixed && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={() => setDeleteUser(data)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </TableCell>
        </Reorder.Item>
    )
}

export function UnifiedTeam({ initialActiveAgents, readOnly }: UnifiedTeamProps) {
    const [users, setUsers] = useState<UseProfile[]>([])
    const [teamOrder, setTeamOrder] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isHiringOpen, setIsHiringOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UseProfile | null>(null)
    const [deleteUser, setDeleteUser] = useState<UseProfile | null>(null)

    // Combined items for reordering
    const [items, setItems] = useState<any[]>([])

    // AI Agents state
    const defaultSelection = initialActiveAgents ?? AGENTS.map(a => a.id)
    const [selectedAgents, setSelectedAgents] = useState<string[]>(defaultSelection)
    const [savingAgents, setSavingAgents] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        const result = await getCompanyUsers()
        const fetchedUsers = result.users as UseProfile[]
        const fetchedOrder = result.team_order as string[]

        setUsers(fetchedUsers)
        setTeamOrder(fetchedOrder)

        // Build unified list
        const admins = fetchedUsers.filter(u => u.role === 'admin')
        const otherHumans = fetchedUsers.filter(u => u.role !== 'admin')
        const aiAgents = AGENTS.filter(a => a.id !== 'professional-gabriel')

        const gabriel = AGENTS.find(a => a.id === 'professional-gabriel')!

        const allItems = [
            ...admins.map(u => ({ id: `user-${u.id}`, type: 'human', data: u, isFixed: u.role === 'admin' && admins.indexOf(u) === 0 })),
            { id: 'agent-professional-gabriel', type: 'human', data: gabriel, isFixed: false },
            ...otherHumans.map(u => ({ id: `user-${u.id}`, type: 'human', data: u, isFixed: false })),
            ...aiAgents.map(a => ({ id: `agent-${a.id}`, type: 'agent', data: a, isFixed: false }))
        ]

        if (fetchedOrder && fetchedOrder.length > 0) {
            // Sort by fetchedOrder
            // Strategy:
            // 1. Fixed Admin (handled by isFixed=true check if we wanted, but here we rely on array order + logic)
            // 2. New items (NOT in fetchedOrder)
            // 3. Existing items (IN fetchedOrder, sorted by index)

            const sortedItems = [...allItems].sort((a, b) => {
                // Always keep fixed items at the top (though admins.map sets isFixed for the first admin)
                if (a.isFixed) return -1
                if (b.isFixed) return 1

                const indexA = fetchedOrder.indexOf(a.id)
                const indexB = fetchedOrder.indexOf(b.id)

                // If both are new (not in order), maintain their relative order from allItems
                if (indexA === -1 && indexB === -1) return 0

                // If A is new and B is old, A comes first
                if (indexA === -1) return -1

                // If B is new and A is old, B comes first
                if (indexB === -1) return 1

                // Both are old, sort by order
                return indexA - indexB
            })
            setItems(sortedItems)
        } else {
            setItems(allItems)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleReorder = async (newItems: any[]) => {
        // Find the first fixed item
        const fixedItem = items.find(item => item.isFixed)
        if (fixedItem && newItems[0].id !== fixedItem.id) {
            // Revert or prevent? Reorder component handles this?
            // Usually, we should ensure the first item stays first.
            const updatedItems = [fixedItem, ...newItems.filter(item => item.id !== fixedItem.id)]
            setItems(updatedItems)
            const order = updatedItems.map(item => item.id)
            await saveOrder(order)
        } else {
            setItems(newItems)
            const order = newItems.map(item => item.id)
            await saveOrder(order)
        }
    }

    const saveOrder = async (order: string[]) => {
        const result = await updateTeamOrder(order)
        if (result.success) {
            toast.success('Team order updated')
        } else {
            toast.error('Failed to update order')
        }
    }

    const toggleAgent = async (agentId: string) => {
        if (readOnly) return

        const isSelected = selectedAgents.includes(agentId)
        const newSelection = isSelected
            ? selectedAgents.filter(id => id !== agentId)
            : [...selectedAgents, agentId]

        setSelectedAgents(newSelection)
        setSavingAgents(true)

        try {
            const result = await updateActiveAgents(newSelection)
            if (result.error) {
                toast.error('Failed to save changes')
                setSelectedAgents(selectedAgents)
            } else {
                toast.success('Team updated successfully')
            }
        } catch (error) {
            toast.error('Failed to save changes')
            setSelectedAgents(selectedAgents)
        } finally {
            setSavingAgents(false)
        }
    }

    const handleResetOrder = async () => {
        try {
            setSavingAgents(true)
            const res = await updateTeamOrder([])
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Order reset to default')
                fetchUsers()
            }
        } catch (error) {
            toast.error('Failed to reset order')
        } finally {
            setSavingAgents(false)
        }
    }

    return (
        <div className="space-y-8 max-w-[1200px]">
            {/* Unified Team List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users2 className="text-blue-400" size={20} />
                            Your Hybrid Team
                        </h3>
                        <p className="text-sm text-slate-400">Manage human specialists and AI agents in one place.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {savingAgents && <div className="flex items-center gap-2 text-xs text-blue-400"><Loader2 className="w-3 h-3 animate-spin" /> Updating...</div>}

                        {!readOnly && (
                            <Dialog open={isHiringOpen} onOpenChange={setIsHiringOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-[#1C73E8] hover:bg-[#1557b0] text-white flex items-center gap-2 px-4 shadow-lg shadow-blue-500/10 transition-all active:scale-95">
                                        <Plus size={18} />
                                        Hire Human Specialist
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0c0c0c] border-white/10 text-white sm:max-w-[550px] p-0 overflow-visible shadow-2xl">
                                    <UserForm
                                        mode="create"
                                        onSuccess={() => {
                                            setIsHiringOpen(false)
                                            fetchUsers()
                                        }}
                                        onClose={() => setIsHiringOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0c0c0c] shadow-xl">
                    <Table>
                        <TableHeader className="bg-white/[0.03]">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="w-[40px] pl-4">
                                    <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                                                    onClick={handleResetOrder}
                                                    disabled={savingAgents}
                                                >
                                                    <RotateCcw size={14} className={cn(savingAgents && "animate-spin")} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="bg-[#111] border-white/10 text-white">
                                                Reset to original order
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                                <TableHead className="w-[300px]">Member</TableHead>
                                <TableHead className="w-[120px]">Type</TableHead>
                                <TableHead>Role / Expertise</TableHead>
                                <TableHead className="text-right pr-6 w-[200px]">Status / Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        {loading ? (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                                        <span className="text-xs font-medium uppercase tracking-widest">Assembling team...</span>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        ) : (
                            <Reorder.Group
                                axis="y"
                                values={items}
                                onReorder={handleReorder}
                                as="tbody"
                                className="divide-y divide-white/5"
                            >
                                {items.map((item) => (
                                    <TeamRow
                                        key={item.id}
                                        item={item}
                                        selectedAgents={selectedAgents}
                                        toggleAgent={toggleAgent}
                                        setEditingUser={setEditingUser}
                                        setDeleteUser={setDeleteUser}
                                        readOnly={readOnly}
                                    />
                                ))}
                            </Reorder.Group>
                        )}
                    </Table>
                </div>
            </div>

            {/* Modals for Humans */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="bg-[#0c0c0c] border-white/10 text-white sm:max-w-[550px] p-0 overflow-visible">
                    {editingUser && (
                        <UserForm
                            mode="edit"
                            initialData={editingUser}
                            onSuccess={() => {
                                setEditingUser(null)
                                fetchUsers()
                            }}
                            onClose={() => setEditingUser(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle size={20} />
                            Confirm Removal
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 pt-2">
                            Are you sure you want to remove <span className="text-white font-medium">{deleteUser?.name}</span> from the team?
                            <br />
                            This will revoke their access immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
                            onClick={() => setDeleteUser(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                            onClick={async () => {
                                if (deleteUser) {
                                    const res = await deleteCompanyUser(deleteUser.id)
                                    if (res.error) {
                                        toast.error(res.error)
                                    } else {
                                        toast.success('Member removed successfully')
                                        fetchUsers()
                                    }
                                    setDeleteUser(null)
                                }
                            }}
                        >
                            Remove Specialist
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function UserForm({ mode, initialData, onSuccess, onClose }: { mode: 'create' | 'edit', initialData?: UseProfile, onSuccess: () => void, onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
    const [hasMessaging, setHasMessaging] = useState(initialData?.has_messaging_access || false)
    const [selectedAgents, setSelectedAgents] = useState<string[]>(initialData?.active_agents || [])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const agentOptions = AGENTS.map(agent => ({
        label: agent.name,
        subLabel: agent.role,
        value: agent.id
    }))

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')

        // Append custom fields
        formData.append('avatar_url', avatarUrl)
        formData.append('has_messaging_access', hasMessaging.toString())
        formData.append('active_agents', JSON.stringify(selectedAgents))

        try {
            let result
            if (mode === 'create') {
                result = await createCompanyUser(formData)
            } else {
                formData.append('userId', initialData?.id!)
                result = await updateCompanyUser(formData)
            }

            if (result.error) {
                setError(result.error)
            } else {
                toast.success(mode === 'create' ? 'Team member added!' : 'Member details updated!')
                onSuccess()
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="flex flex-col h-full">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden bg-slate-900 group-hover:border-blue-500 transition-all shadow-xl">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <User size={28} />
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={16} className="text-white" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold">{mode === 'create' ? 'Hire Human Specialist' : 'Edit Member'}</DialogTitle>
                        <DialogDescription className="text-[11px] text-slate-400 mt-0.5">
                            {mode === 'create'
                                ? 'Add a new specialist to your hybrid team.'
                                : 'Update profile and access permissions.'}
                        </DialogDescription>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                        <Input
                            name="name"
                            defaultValue={initialData?.name}
                            placeholder="e.g. Rachel Green"
                            className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Permission</Label>
                        <Select name="role" defaultValue={initialData?.role || 'member'}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:bg-white/10">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10 text-white">
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Job Title / Role</Label>
                        <Input
                            name="job_title"
                            defaultValue={initialData?.job_title || initialData?.role}
                            placeholder="e.g. Sales Specialist"
                            className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                        <Input
                            name="email"
                            type="email"
                            defaultValue={initialData?.email}
                            placeholder="rachel@company.com"
                            className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            {mode === 'create' ? 'Password' : 'New Password (Optional)'}
                        </Label>
                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                            required={mode === 'create'}
                            minLength={6}
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold text-white">Omnichannel Messaging</Label>
                            <p className="text-[11px] text-slate-400">Can this member handle chats in the inbox?</p>
                        </div>
                        <Checkbox
                            id="messaging-access"
                            checked={hasMessaging}
                            onCheckedChange={(checked) => setHasMessaging(!!checked)}
                            className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-white">Agent Permissions</Label>
                    <p className="text-[11px] text-slate-400 mb-2">Select which AI agents this member can assist and monitor.</p>
                    <MultiSelect
                        options={agentOptions}
                        value={selectedAgents}
                        onChange={setSelectedAgents}
                        placeholder="Select agents..."
                        usePortal={false}
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs font-medium">
                        <AlertTriangle size={14} />
                        {error}
                    </div>
                )}
            </div>

            <DialogFooter className="px-6 py-4 bg-white/[0.02] border-t border-white/5 gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white hover:bg-white/5"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-[#1C73E8] hover:bg-[#1557b0] text-white px-8 h-10 font-bold shadow-lg shadow-blue-500/10"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {mode === 'create' ? 'Save & Hire' : 'Update Profile'}
                </Button>
            </DialogFooter>
        </form>
    )
}

