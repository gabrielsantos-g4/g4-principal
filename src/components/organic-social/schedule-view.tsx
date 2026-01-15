'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'

interface PostEvent {
    id: string
    day: number
    month: number
    year: number
    channel: string
    placement: string
    media: string
    caption: string
    destination: string
    time: string
    status: 'published' | 'waiting' | 'error'
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MOCK_EVENTS_INITIAL: PostEvent[] = [
    { id: '1', day: 5, month: 0, year: 2026, channel: 'Instagram', placement: 'Reels', media: 'video.mp4', caption: 'Launch day!', destination: 'https://g4.com', time: '10:00', status: 'published' },
    { id: '2', day: 8, month: 0, year: 2026, channel: 'LinkedIn', placement: 'Post', media: 'image.png', caption: 'Team insights', destination: 'https://g4.com/blog', time: '09:00', status: 'waiting' },
    { id: '3', day: 12, month: 0, year: 2026, channel: 'YouTube', placement: 'Shorts', media: 'short.mp4', caption: 'Quick tip', destination: 'https://g4.com', time: '14:00', status: 'error' },
]

export function ScheduleView() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)) // Jan 2026 for demo
    const [events, setEvents] = useState<PostEvent[]>(MOCK_EVENTS_INITIAL)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    // Form State
    const [formData, setFormData] = useState({
        channel: '',
        placement: '',
        media: '',
        caption: '',
        destination: '',
        time: '',
    })

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        setSelectedDate(newDate)
        // Reset form
        setFormData({
            channel: '',
            placement: '',
            media: '',
            caption: '',
            destination: '',
            time: '09:00',
        })
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!selectedDate) return

        const newEvent: PostEvent = {
            id: Math.random().toString(36).substr(2, 9),
            day: selectedDate.getDate(),
            month: selectedDate.getMonth(),
            year: selectedDate.getFullYear(),
            channel: formData.channel || 'Generic',
            placement: formData.placement || 'Feed',
            media: formData.media,
            caption: formData.caption,
            destination: formData.destination,
            time: formData.time,
            status: 'waiting' // Default new posts to waiting
        }

        setEvents([...events, newEvent])
        setIsModalOpen(false)
    }

    const getStatusColor = (status: PostEvent['status']) => {
        switch (status) {
            case 'published': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'waiting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    // Calendar logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white capitalize">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-[#111]">
                    {DAYS.map(day => (
                        <div key={day} className="py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-white/10 bg-black/40">
                    {/* Empty cells for padding */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-white/[0.02]" />
                    ))}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dayEvents = events.filter(e =>
                            e.day === day &&
                            e.month === currentDate.getMonth() &&
                            e.year === currentDate.getFullYear()
                        )

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className="p-3 relative group hover:bg-white/[0.04] transition-all border-b border-white/10 cursor-pointer"
                            >
                                <span className={`text-sm font-medium block mb-2 w-7 h-7 flex items-center justify-center rounded-full ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
                                        ? 'bg-[#1C73E8] text-white'
                                        : 'text-slate-400'
                                    }`}>
                                    {day}
                                </span>

                                <div className="space-y-1.5">
                                    {dayEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className={`text-[10px] px-2 py-1 rounded border truncate font-medium ${getStatusColor(event.status)}`}
                                            title={`${event.channel} - ${event.status}`}
                                        >
                                            {event.time} - {event.channel}
                                        </div>
                                    ))}
                                </div>

                                {/* Add Button (Hover) */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs hover:bg-[#1C73E8]">
                                        +
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Post Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#171717] border-white/10 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Schedule Post</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Channel</Label>
                                <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#171717] border-white/10 text-white">
                                        <SelectItem value="Instagram">Instagram</SelectItem>
                                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                        <SelectItem value="Twitter">Twitter</SelectItem>
                                        <SelectItem value="YouTube">YouTube</SelectItem>
                                        <SelectItem value="TikTok">TikTok</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Placement</Label>
                                <Select value={formData.placement} onValueChange={(v) => setFormData({ ...formData, placement: v })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#171717] border-white/10 text-white">
                                        <SelectItem value="Feed">Feed Post</SelectItem>
                                        <SelectItem value="Reels">Reels</SelectItem>
                                        <SelectItem value="Story">Story</SelectItem>
                                        <SelectItem value="Shorts">Shorts</SelectItem>
                                        <SelectItem value="Article">Article</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Media</Label>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 justify-start">
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Upload Media
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Caption</Label>
                            <Textarea
                                value={formData.caption}
                                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                placeholder="Write your post caption here..."
                                className="bg-white/5 border-white/10 min-h-[100px] text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Destination Page</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    placeholder="https://"
                                    className="bg-white/5 border-white/10 pl-9 text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#171717] border-white/10">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            initialFocus
                                            className="bg-[#171717] text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="bg-white/5 border-white/10 pl-9 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 text-slate-300">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-[#1C73E8] hover:bg-[#1560bd] text-white">
                            Save Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
