'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload, ChevronRight, Layout, Link as LinkIcon, User } from 'lucide-react'
import { createInitiative, updateInitiative } from '@/actions/strategy-actions'
import { getChannels, createChannel, deleteChannel } from '@/actions/channel-actions'
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select"
import { toast } from "sonner"
import { ChevronsUpDown, Check } from 'lucide-react'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type FunnelStage = 'ToFu' | 'MoFu' | 'BoFu'
export type Channel = 'Organic' | 'Paid' | 'Outreach'

export interface NewCardData {
    id?: string
    funnelStage: FunnelStage
    channel: Channel
    title: string
    link?: string
    image?: string | null
    responsibleImage?: string | null
    channels?: string[] // Added channels field
}

interface AddStrategyCardModalProps {
    onAdd: (data: NewCardData) => void
    children?: React.ReactNode
    initialData?: NewCardData
}

export function AddStrategyCardModal({ onAdd, children, initialData }: AddStrategyCardModalProps) {
    const [open, setOpen] = useState(false)
    const [funnelStage, setFunnelStage] = useState<FunnelStage | null>(initialData?.funnelStage || null)
    const [channel, setChannel] = useState<Channel | null>(initialData?.channel || null)
    const [title, setTitle] = useState(initialData?.title || '')
    const [link, setLink] = useState(initialData?.link || '')
    const [selectedChannels, setSelectedChannels] = useState<string[]>(initialData?.channels || [])

    const [showCreateChannel, setShowCreateChannel] = useState(false)
    const [newChannelName, setNewChannelName] = useState('')

    // Dynamic Data State
    const [allChannelOptions, setAllChannelOptions] = useState<{ label: string, value: string, id?: string, isCustom?: boolean }[]>([])

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [responsibleFile, setResponsibleFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
    const [responsiblePreview, setResponsiblePreview] = useState<string | null>(initialData?.responsibleImage || null)
    const [isDragging, setIsDragging] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const responsibleInputRef = useRef<HTMLInputElement>(null)

    // Dynamic Channel Options (derived from state)
    // removed currentChannelOptions as we use allChannelOptions now

    // Priority list for sorting
    const PRIORITY_CHANNELS = [
        'LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'YouTube',
        'Google Ads', 'Meta Ads', 'LinkedIn Ads',
        'Email Marketing', 'WhatsApp', 'Blog / SEO', 'Newsletter',
        'Cold Outreach', 'Events', 'Podcast'
    ]

    // Static fallback in case server action fails or returns empty
    const FALLBACK_CHANNELS = [
        'LinkedIn', 'Instagram', 'Facebook', 'Google Ads', 'LinkedIn Ads',
        'Meta Ads', 'Email Marketing', 'Cold Outreach', 'WhatsApp',
        'YouTube', 'TikTok', 'Podcast', 'Blog / SEO', 'Newsletter', 'Events'
    ]

    const fetchChannels = async () => {
        try {
            console.log('Fetching channels for modal...')
            const chans = await getChannels()

            let options: { label: string, value: string, id?: string, isCustom?: boolean }[] = []

            if (chans && chans.length > 0) {
                console.log('Channels loaded from server:', chans.length)
                options = chans
                    .sort((a, b) => {
                        const aIsPriority = PRIORITY_CHANNELS.includes(a.name)
                        const bIsPriority = PRIORITY_CHANNELS.includes(b.name)

                        if (aIsPriority && !bIsPriority) return -1
                        if (!aIsPriority && bIsPriority) return 1

                        return a.name.localeCompare(b.name)
                    })
                    .map(c => ({
                        label: c.name,
                        value: c.name,
                        id: c.id,
                        isCustom: c.is_custom
                    }))
            } else {
                console.log('No channels from server, using client fallback')
                options = FALLBACK_CHANNELS
                    .sort((a, b) => {
                        const aIsPriority = PRIORITY_CHANNELS.includes(a)
                        const bIsPriority = PRIORITY_CHANNELS.includes(b)

                        if (aIsPriority && !bIsPriority) return -1
                        if (!aIsPriority && bIsPriority) return 1

                        return a.localeCompare(b)
                    })
                    .map(c => ({ label: c, value: c }))
            }

            setAllChannelOptions(options)
        } catch (err) {
            console.error('DEBUG: Error fetching channels, using fallback', err)
            const options = FALLBACK_CHANNELS.sort().map(c => ({ label: c, value: c }))
            setAllChannelOptions(options)
        }
    }

    useEffect(() => {
        fetchChannels()
    }, []) // Run once on mount

    const handleCreateChannel = async (name: string) => {
        try {
            const newChannel = await createChannel(name)
            if (newChannel) {
                // Refresh list
                await fetchChannels()
                // Auto-select the new channel
                setSelectedChannels(prev => [...prev, newChannel.name])
            }
        } catch (error) {
            console.error('Failed to create channel:', error)
        }
    }

    const handleConfirmCreateChannel = async () => {
        if (!newChannelName.trim()) return
        await handleCreateChannel(newChannelName)
        toast.success("Channel created!")
        setNewChannelName('')
        setShowCreateChannel(false)
    }

    const handleDeleteChannel = async (name: string) => {
        try {
            // Find ID by name
            const option = allChannelOptions.find(o => o.value === name)
            if (option?.id) {
                const success = await deleteChannel(option.id)
                if (success) {
                    // Remove from selected if present
                    setSelectedChannels(prev => prev.filter(c => c !== name))
                    // Refresh list
                    await fetchChannels()
                }
            }
        } catch (error) {
            console.error('Failed to delete channel:', error)
        }
    }

    useEffect(() => {
        if (open && initialData) {
            setFunnelStage(initialData.funnelStage)
            setChannel(initialData.channel)
            setTitle(initialData.title)
            setLink(initialData.link || '')
            setSelectedChannels(initialData.channels || [])
            setImagePreview(initialData.image || null)
            setResponsiblePreview(initialData.responsibleImage || null)
        }
    }, [open, initialData])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (val: string | null) => void, setFile: (f: File | null) => void) => {
        const file = e.target.files?.[0]
        if (file) {
            setFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        if (!funnelStage || !channel || !title) return;
        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('funnelStage', funnelStage)
            formData.append('channel', channel)
            if (link) formData.append('link', link)

            // Serialize channels for backend
            formData.append('channels', JSON.stringify(selectedChannels))

            if (imageFile) formData.append('image', imageFile)
            if (responsibleFile) formData.append('responsibleImage', responsibleFile)

            if (initialData?.id) {
                await updateInitiative(initialData.id, formData)
            } else {
                await createInitiative(formData)
            }

            onAdd({
                id: initialData?.id,
                funnelStage,
                channel,
                title,
                link,
                image: imagePreview,
                responsibleImage: responsiblePreview,
                channels: selectedChannels,
            })
            setOpen(false)

            if (!initialData) {
                setFunnelStage(null)
                setChannel(null)
                setTitle('')
                setLink('')
                setSelectedChannels([])
                setImagePreview(null)
                setResponsiblePreview(null)
                setImageFile(null)
                setResponsibleFile(null)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // ... return JSX ...


    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children || (
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Insert
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="!max-w-5xl w-full h-[700px] bg-zinc-950 text-white p-0 border-zinc-900 shadow-2xl overflow-hidden round-xl flex flex-col md:flex-row">
                    <DialogTitle className="sr-only">Strategy Card</DialogTitle>

                    {/* Left Sidebar: Stage Selection */}
                    <div className="w-64 bg-zinc-900/50 border-r border-zinc-900 p-6 flex flex-col gap-2 shrink-0 overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Funnel Stage</h3>

                        {[
                            { id: 'ToFu', label: 'ToFu', desc: 'Awareness' },
                            { id: 'MoFu', label: 'MoFu', desc: 'Nurturing' },
                            { id: 'BoFu', label: 'BoFu', desc: 'Conversion' }
                        ].map((stage) => (
                            <button
                                key={stage.id}
                                onClick={() => setFunnelStage(stage.id as FunnelStage)}
                                className={`group relative text-left p-4 rounded-xl transition-all border ease-in-out duration-200 ${funnelStage === stage.id
                                    ? 'bg-zinc-900 border-zinc-700 shadow-md scale-[1.02]'
                                    : 'border-transparent hover:bg-zinc-900/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-semibold ${funnelStage === stage.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                        {stage.label}
                                    </span>
                                    {funnelStage === stage.id && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                                </div>
                                <span className="text-xs text-zinc-500">{stage.desc}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* Header: Channel Selection */}
                        <div className="p-8 pb-0 shrink-0">
                            <div className="flex items-center justify-center mb-0">
                                <div className="inline-flex bg-zinc-900/80 rounded-lg p-1 border border-zinc-800">
                                    {['Organic', 'Paid', 'Outreach'].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setChannel(c as Channel)}
                                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${channel === c
                                                ? 'bg-zinc-800 text-white shadow-sm'
                                                : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Form Area */}
                        <div className="flex-1 p-8 pt-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                                {/* Col 1: Visuals */}
                                <div className="flex flex-col gap-3 h-full">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Card Visual</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                                            ${isDragging
                                                ? 'border-blue-500/50 bg-blue-500/5'
                                                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, setImagePreview, setImageFile)}
                                        />
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <span className="text-xs font-medium text-white flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700">
                                                        <Upload className="w-3 h-3" /> Change
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-600 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors border border-zinc-800 group-hover:border-blue-500/20">
                                                    <Layout className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium mb-1">Click to upload visual</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Col 2: Details */}
                                <div className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Initiative Title</label>
                                        <Input
                                            placeholder="e.g. Sales Campaign"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-10 text-sm bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-zinc-600 focus:bg-zinc-900 focus:ring-0 rounded-lg transition-all"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        {/* Channel Selection */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                    Channels
                                                </label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-auto p-0 text-blue-500 hover:text-blue-400 text-xs font-normal"
                                                    onClick={() => setShowCreateChannel(true)}
                                                >
                                                    + Create your own channel
                                                </Button>
                                            </div>
                                            <SearchableMultiSelect
                                                options={allChannelOptions}
                                                value={selectedChannels}
                                                onChange={setSelectedChannels}
                                                onDeleteOption={handleDeleteChannel}
                                                placeholder="Type to search channels..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Destination Link</label>
                                        <div className="relative group">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
                                            <Input
                                                placeholder="https://..."
                                                value={link}
                                                onChange={(e) => setLink(e.target.value)}
                                                className="h-10 pl-10 bg-zinc-900/50 border-zinc-800 text-white text-sm placeholder:text-zinc-700 focus:border-zinc-600 focus:bg-zinc-900 focus:ring-0 rounded-lg transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Person in Charge</label>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                                            <div
                                                onClick={() => responsibleInputRef.current?.click()}
                                                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors overflow-hidden shrink-0 border border-zinc-700 shadow-sm"
                                            >
                                                {responsiblePreview ? (
                                                    <img src={responsiblePreview} alt="Responsible" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-zinc-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <button
                                                    onClick={() => responsibleInputRef.current?.click()}
                                                    className="text-xs font-medium text-zinc-300 hover:text-white transition-colors text-left"
                                                >
                                                    {responsiblePreview ? 'Change photo' : 'Assign person'}
                                                </button>
                                                <p className="text-[10px] text-zinc-600">Responsible for execution</p>
                                            </div>
                                            <input
                                                type="file"
                                                ref={responsibleInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, setResponsiblePreview, setResponsibleFile)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Floating at bottom of right panel */}
                        <div className="p-6 border-t border-zinc-900 flex justify-end gap-3 bg-zinc-950/90 backdrop-blur-md shrink-0">
                            <Button
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-10 px-4 rounded-lg text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!funnelStage || !channel || !title || isSubmitting}
                                className="bg-blue-600 hover:bg-blue-500 text-white h-10 px-8 rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Initiative'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                <DialogContent className="max-w-[400px] bg-zinc-950 border-zinc-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Create New Channel</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            autoFocus
                            placeholder="e.g. Media Publisher XYZ"
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirmCreateChannel()
                            }}
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowCreateChannel(false)}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmCreateChannel}
                            disabled={!newChannelName.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Create Channel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
