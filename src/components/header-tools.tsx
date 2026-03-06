"use client"

import { useState, useEffect } from "react"
import { StickyNote, Settings, Building2, Users2, History, BadgeDollarSign, CreditCard, ArrowUpRight, LogOut, MessageCircle, LayoutGrid, GraduationCap, ListChecks, Waypoints, BarChart3 } from "lucide-react"

import { NotesModal } from "./tools/notes-modal"
import { MilestoneModal } from "./tools/milestone-modal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { signout } from '@/app/login/actions'

interface HeaderToolsProps {
    userProfile?: any
}

export function HeaderTools({ userProfile }: HeaderToolsProps) {
    const [isNotesOpen, setIsNotesOpen] = useState(false)
    const [isMilestonesOpen, setIsMilestonesOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const isJessPage = pathname === '/dashboard/customer-support'

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner'

    const handleNavigation = (tab: string) => {
        router.push(`/dashboard/orchestrator?tab=${tab}`)
    }

    const handleJessTabSelection = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2">




            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="p-2 border border-white/20 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center h-9 w-9 data-[state=open]:bg-white/10 data-[state=open]:text-white"
                        title="Settings"
                    >
                        <Settings size={16} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-[#171717] border-white/10 text-white" align="end">

                    <DropdownMenuSeparator className="bg-white/10" />

                    {isAdmin && (
                        <>

                            <DropdownMenuItem onClick={() => handleNavigation('company')} className="gap-2 cursor-pointer focus:bg-white/5">
                                <Building2 size={14} className="text-gray-400" />
                                <span>Company Info</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNavigation('team')} className="gap-2 cursor-pointer focus:bg-white/5">
                                <Users2 size={14} className="text-gray-400" />
                                <span>Team</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsNotesOpen(true)} className="gap-2 cursor-pointer focus:bg-white/5">
                                <StickyNote size={14} className="text-gray-400" />
                                <span>Notes</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsMilestonesOpen(true)} className="gap-2 cursor-pointer focus:bg-white/5">
                                <Waypoints size={14} className="text-gray-400" />
                                <span>Milestones</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNavigation('history')} className="gap-2 cursor-pointer focus:bg-white/5">
                                <History size={14} className="text-gray-400" />
                                <span>Logs</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNavigation('pricing')} className="gap-2 cursor-pointer focus:bg-white/5">
                                <BadgeDollarSign size={14} className="text-gray-400" />
                                <span>Plans</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNavigation('billing')} className="gap-2 cursor-pointer focus:bg-white/5">
                                <CreditCard size={14} className="text-gray-400" />
                                <span>Billing</span>
                            </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuItem onClick={() => handleNavigation('support')} className="gap-2 cursor-pointer focus:bg-white/5">
                        <ArrowUpRight size={14} className="text-gray-400" />
                        <span>Support</span>
                    </DropdownMenuItem>
                    {!isAdmin && (
                        <>
                            <DropdownMenuItem onClick={() => setIsNotesOpen(true)} className="gap-2 cursor-pointer focus:bg-white/5">
                                <StickyNote size={14} className="text-gray-400" />
                                <span>Notes</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsMilestonesOpen(true)} className="gap-2 cursor-pointer focus:bg-white/5">
                                <Waypoints size={14} className="text-gray-400" />
                                <span>Milestones</span>
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuSeparator className="bg-white/10" />

                    <DropdownMenuItem
                        onClick={() => signout()}
                        className="gap-2 cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10 w-full"
                    >
                        <LogOut size={14} className="mr-2" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <NotesModal open={isNotesOpen} onOpenChange={setIsNotesOpen} />
            <MilestoneModal open={isMilestonesOpen} onOpenChange={setIsMilestonesOpen} userProfile={userProfile} />
        </div>
    )
}
