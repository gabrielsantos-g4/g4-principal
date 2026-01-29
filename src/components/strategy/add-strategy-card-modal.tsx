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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Upload, ChevronRight, Layout, Link as LinkIcon, User } from 'lucide-react'
import { createInitiative, updateInitiative } from '@/actions/strategy-actions'
import { getChannels, createChannel, deleteChannel } from '@/actions/channel-actions'
import { getCampaigns, createCampaign, updateCampaign } from '@/actions/campaign-actions'
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
    campaign?: string
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
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(initialData?.campaign ? [initialData.campaign] : [])
    const [allCampaignOptions, setAllCampaignOptions] = useState<{ label: string, value: string, id?: string, isCustom?: boolean, endDate?: string | null }[]>([])

    const [showCreateChannel, setShowCreateChannel] = useState(false)
    const [newChannelName, setNewChannelName] = useState('')

    // Dynamic Data State
    const [allChannelOptions, setAllChannelOptions] = useState<{ label: string, value: string, id?: string, isCustom?: boolean }[]>([])

    const [showCreateCampaign, setShowCreateCampaign] = useState(false)
    const [newCampaignName, setNewCampaignName] = useState('')
    const [newCampaignEndDate, setNewCampaignEndDate] = useState<string>('')
    const [newCampaignNoEndDate, setNewCampaignNoEndDate] = useState(false)

    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)
    const [campaignToEdit, setCampaignToEdit] = useState<{ name: string, id: string } | null>(null)
    const [editCampaignName, setEditCampaignName] = useState('')
    const [editCampaignEndDate, setEditCampaignEndDate] = useState<string>('')
    const [editCampaignNoEndDate, setEditCampaignNoEndDate] = useState(false)

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [responsibleFile, setResponsibleFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
    const [responsiblePreview, setResponsiblePreview] = useState<string | null>(initialData?.responsibleImage || null)
    const [isDragging, setIsDragging] = useState(false)
    const [isDraggingResponsible, setIsDraggingResponsible] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, boolean>>({})

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
                        const aIsCustom = a.is_custom
                        const bIsCustom = b.is_custom

                        if (aIsCustom && !bIsCustom) return -1
                        if (!aIsCustom && bIsCustom) return 1

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

    const fetchCampaigns = async () => {
        try {
            const camps = await getCampaigns()
            const options = camps.map(c => ({
                label: c.name,
                value: c.name,
                id: c.id,
                isCustom: true, // Campaigns are effectively custom lists
                endDate: c.end_date
            }))
            setAllCampaignOptions(options)
        } catch (err) {
            console.error('Error fetching campaigns:', err)
        }
    }

    useEffect(() => {
        if (open) {
            // Only fetch if we haven't loaded yet or if forced.
            // For now, fetching on every open is acceptable compared to fetching 50 times on page load.
            // We can optimize by checking if allChannelOptions is empty, but we might want fresh data.
            fetchChannels()
            fetchCampaigns()
        }
    }, [open])

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

    const handleCreateCampaign = async (name: string, endDate?: string | null) => {
        try {
            const newCamp = await createCampaign(name, endDate)
            if (newCamp) {
                await fetchCampaigns()
                setSelectedCampaigns([newCamp.name])
            }
        } catch (error) {
            console.error('Failed to create campaign:', error)
        }
    }

    const handleConfirmCreateChannel = async () => {
        if (!newChannelName.trim()) return
        await handleCreateChannel(newChannelName)
        toast.success("Channel created!")
        setNewChannelName('')
        setShowCreateChannel(false)
    }

    const [channelToDelete, setChannelToDelete] = useState<string | null>(null)

    const handleDeleteChannel = (name: string) => {
        setChannelToDelete(name)
    }

    const confirmDeleteChannel = async () => {
        if (!channelToDelete) return

        try {
            // Find ID by name
            const option = allChannelOptions.find(o => o.value === channelToDelete)
            if (option?.id) {
                const success = await deleteChannel(option.id)
                if (success) {
                    // Remove from selected if present
                    setSelectedChannels(prev => prev.filter(c => c !== channelToDelete))
                    // Refresh list
                    await fetchChannels()
                    toast.success("Channel deleted")
                }
            }
        } catch (error) {
            console.error('Failed to delete channel:', error)
        } finally {
            setChannelToDelete(null)
        }
    }

    // Campaign CRUD Handlers
    const handleConfirmCreateCampaign = async () => {
        if (!newCampaignName.trim()) return

        const finalEndDate = newCampaignNoEndDate ? null : (newCampaignEndDate || null)
        await handleCreateCampaign(newCampaignName, finalEndDate)

        setNewCampaignName('')
        setNewCampaignEndDate('')
        setNewCampaignNoEndDate(false)
        setShowCreateCampaign(false)
        toast.success("Campaign created!")
    }

    const handleDeleteCampaign = (name: string) => {
        setCampaignToDelete(name)
    }

    const confirmDeleteCampaign = async () => {
        if (!campaignToDelete) return
        try {
            const option = allCampaignOptions.find(o => o.value === campaignToDelete)
            if (option?.id) {
                const success = await deleteChannel(option.id) // reusing deleteChannel as table is same
                if (success) {
                    setSelectedCampaigns(prev => prev.filter(c => c !== campaignToDelete))
                    await fetchCampaigns()
                    toast.success("Campaign deleted")
                }
            }
        } catch (error) {
            console.error('Failed to delete campaign:', error)
        } finally {
            setCampaignToDelete(null)
        }
    }

    const handleEditCampaign = (name: string) => {
        const option = allCampaignOptions.find(o => o.value === name)
        if (option?.id) {
            setCampaignToEdit({ name, id: option.id })
            setEditCampaignName(name)
            // Populate date fields
            if (option.endDate) {
                setEditCampaignEndDate(option.endDate.split('T')[0]) // Extract YYYY-MM-DD
                setEditCampaignNoEndDate(false)
            } else {
                setEditCampaignEndDate('')
                setEditCampaignNoEndDate(true)
            }
        }
    }

    const confirmEditCampaign = async () => {
        if (!campaignToEdit || !editCampaignName.trim()) return
        try {
            const finalEndDate = editCampaignNoEndDate ? null : (editCampaignEndDate || null)
            const updated = await updateCampaign(campaignToEdit.id, editCampaignName, finalEndDate)

            if (updated) {
                await fetchCampaigns()
                // Update selection if previously selected
                if (selectedCampaigns.includes(campaignToEdit.name)) {
                    setSelectedCampaigns(prev => prev.map(c => c === campaignToEdit.name ? updated.name : c))
                }
                toast.success("Campaign updated")
            }
        } catch (error) {
            console.error('Failed to update campaign:', error)
        } finally {
            setCampaignToEdit(null)
            setEditCampaignName('')
            setEditCampaignEndDate('')
            setEditCampaignNoEndDate(false)
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

    const handleResponsibleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingResponsible(true)
    }

    const handleResponsibleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingResponsible(false)
    }

    const handleResponsibleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingResponsible(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setResponsibleFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setResponsiblePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {}
        if (!funnelStage) newErrors.funnelStage = true
        if (!channel) newErrors.channel = true
        if (!title.trim()) newErrors.title = true

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields")
            return
        }
        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('funnelStage', funnelStage || '')
            formData.append('channel', channel || '')
            if (link) formData.append('link', link)

            // Serialize channels for backend
            formData.append('channels', JSON.stringify(selectedChannels))
            if (selectedCampaigns.length > 0) formData.append('campaign', selectedCampaigns[0])

            if (imageFile) formData.append('image', imageFile)
            if (responsibleFile) formData.append('responsibleImage', responsibleFile)

            if (initialData?.id) {
                await updateInitiative(initialData.id, formData)
            } else {
                await createInitiative(formData)
            }

            onAdd({
                id: initialData?.id,
                funnelStage: funnelStage as FunnelStage,
                channel: channel as Channel,
                title,
                link,
                image: imagePreview,
                responsibleImage: responsiblePreview,
                channels: selectedChannels,
                campaign: selectedCampaigns[0],
            })
            setOpen(false)

            if (!initialData) {
                setFunnelStage(null)
                setChannel(null)
                setTitle('')
                setLink('')
                setSelectedChannels([])
                setSelectedCampaigns([])
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
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${errors.funnelStage ? 'text-red-500' : 'text-zinc-500'}`}>Funnel Stage</h3>

                        {[
                            { id: 'ToFu', label: 'ToFu', desc: 'Awareness' },
                            { id: 'MoFu', label: 'MoFu', desc: 'Nurturing' },
                            { id: 'BoFu', label: 'BoFu', desc: 'Conversion' }
                        ].map((stage) => (
                            <button
                                key={stage.id}
                                onClick={() => {
                                    setFunnelStage(stage.id as FunnelStage)
                                    if (errors.funnelStage) setErrors(prev => ({ ...prev, funnelStage: false }))
                                }}
                                className={`group relative text-left p-4 rounded-xl transition-all border ease-in-out duration-200 ${funnelStage === stage.id
                                    ? 'bg-zinc-900 border-zinc-700 shadow-md'
                                    : 'border-transparent hover:bg-zinc-900/50'
                                    } ${errors.funnelStage ? 'border-red-500/50 bg-red-500/5' : ''}`}
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
                            <div className="flex items-center justify-center mb-0 w-full px-8">
                                <div className={`grid grid-cols-3 w-full bg-zinc-900/50 rounded-xl p-1 gap-1 border ${errors.channel ? 'border-red-500' : 'border-zinc-900'}`}>
                                    {['Organic', 'Paid', 'Outreach'].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => {
                                                setChannel(c as Channel)
                                                if (errors.channel) setErrors(prev => ({ ...prev, channel: false }))
                                            }}
                                            className={`relative w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border ${channel === c
                                                ? 'bg-zinc-900 text-white border-zinc-700 shadow-lg'
                                                : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-800/50'
                                                }`}
                                        >
                                            {c}
                                            {channel === c && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                            )}
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
                                        className={`w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
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
                                        <label className={`text-xs font-bold uppercase tracking-wider ${errors.title ? 'text-red-500' : 'text-zinc-500'}`}>Initiative Title</label>
                                        <Input
                                            placeholder="e.g. Sales Campaign"
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value)
                                                if (errors.title) setErrors(prev => ({ ...prev, title: false }))
                                            }}
                                            className={`h-10 text-sm bg-zinc-900/50 text-white placeholder:text-zinc-700 focus:bg-zinc-900 focus:ring-0 rounded-lg transition-all ${errors.title
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-zinc-800 focus:border-zinc-600'
                                                }`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Campaign</label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 text-blue-500 hover:text-blue-400 text-xs font-normal"
                                                onClick={() => setShowCreateCampaign(true)}
                                            >
                                                + Create your own campaign
                                            </Button>
                                        </div>
                                        <div className="w-full">
                                            <SearchableMultiSelect
                                                options={allCampaignOptions}
                                                value={selectedCampaigns}
                                                onChange={setSelectedCampaigns}
                                                onCreateOption={handleCreateCampaign}
                                                onDeleteOption={handleDeleteCampaign}
                                                onEditOption={handleEditCampaign}
                                                placeholder="Select or create a campaign..."
                                                single={true}
                                            />
                                        </div>
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
                                        <div
                                            onClick={() => responsibleInputRef.current?.click()}
                                            onDragOver={handleResponsibleDragOver}
                                            onDragLeave={handleResponsibleDragLeave}
                                            onDrop={handleResponsibleDrop}
                                            className={`group relative flex items-center gap-3 p-2 bg-zinc-900/30 rounded-lg border transition-all cursor-pointer ${isDraggingResponsible
                                                ? 'border-blue-500/50 bg-blue-500/5'
                                                : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-700 shadow-sm group-hover:border-zinc-600">
                                                {responsiblePreview ? (
                                                    <img src={responsiblePreview} alt="Responsible" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-zinc-300 group-hover:text-white truncate">
                                                    {responsiblePreview ? 'Image uploaded' : 'Assign person'}
                                                </p>
                                                <p className="text-[10px] text-zinc-600 group-hover:text-zinc-500 truncate">
                                                    Drag & drop or click
                                                </p>
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
                                disabled={isSubmitting}
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

            {/* Confirm Delete Channel Dialog */}
            <Dialog open={!!channelToDelete} onOpenChange={(open) => !open && setChannelToDelete(null)}>
                <DialogContent className="max-w-sm bg-zinc-950 border-zinc-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Delete Channel</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center">
                        <p className="text-zinc-400 mb-6">
                            Are you sure you want to delete the channel <span className="text-white font-semibold">{channelToDelete}</span>?
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setChannelToDelete(null)}
                                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDeleteChannel}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Campaign Dialog */}
            <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
                <DialogContent className="max-w-[400px] bg-zinc-950 border-zinc-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Create New Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Campaign Name</label>
                            <Input
                                autoFocus
                                placeholder="e.g. Q1 Sales Push"
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirmCreateCampaign()
                                }}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">End Date</label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="date"
                                    value={newCampaignEndDate}
                                    onChange={(e) => setNewCampaignEndDate(e.target.value)}
                                    disabled={newCampaignNoEndDate}
                                    className={`bg-zinc-900 border-zinc-800 text-white ${newCampaignNoEndDate ? 'opacity-50' : ''}`}
                                />
                                <div className="flex items-center space-x-2 shrink-0">
                                    <Checkbox
                                        id="new-no-date"
                                        checked={newCampaignNoEndDate}
                                        onCheckedChange={(c) => {
                                            setNewCampaignNoEndDate(!!c)
                                            if (c) setNewCampaignEndDate('')
                                        }}
                                        className="border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <label
                                        htmlFor="new-no-date"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400"
                                    >
                                        No End Date
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowCreateCampaign(false)}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmCreateCampaign}
                            disabled={!newCampaignName.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Create
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Campaign Dialog */}
            <Dialog open={!!campaignToEdit} onOpenChange={(open) => !open && setCampaignToEdit(null)}>
                <DialogContent className="max-w-[400px] bg-zinc-950 border-zinc-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Campaign Name</label>
                            <Input
                                autoFocus
                                placeholder="e.g. Q1 Sales Push"
                                value={editCampaignName}
                                onChange={(e) => setEditCampaignName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmEditCampaign()
                                }}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">End Date</label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="date"
                                    value={editCampaignEndDate}
                                    onChange={(e) => setEditCampaignEndDate(e.target.value)}
                                    disabled={editCampaignNoEndDate}
                                    className={`bg-zinc-900 border-zinc-800 text-white ${editCampaignNoEndDate ? 'opacity-50' : ''}`}
                                />
                                <div className="flex items-center space-x-2 shrink-0">
                                    <Checkbox
                                        id="edit-no-date"
                                        checked={editCampaignNoEndDate}
                                        onCheckedChange={(c) => {
                                            setEditCampaignNoEndDate(!!c)
                                            if (c) setEditCampaignEndDate('')
                                        }}
                                        className="border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <label
                                        htmlFor="edit-no-date"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400"
                                    >
                                        No End Date
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setCampaignToEdit(null)}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmEditCampaign}
                            disabled={!editCampaignName.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Campaign Confirmation Dialog */}
            <Dialog open={!!campaignToDelete} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
                <DialogContent className="max-w-sm bg-zinc-950 border-zinc-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Delete Campaign?</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center">
                        <p className="text-zinc-400 mb-6">
                            Are you sure you want to delete <span className="text-white font-semibold">"{campaignToDelete}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setCampaignToDelete(null)}
                                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDeleteCampaign}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
