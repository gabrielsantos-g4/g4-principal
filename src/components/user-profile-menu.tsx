"use client"

import { LogOut, User, CreditCard, Ban, ArrowUpRight } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signout } from '@/app/login/actions'

interface UserProfileMenuProps {
    userName: string
    companyName: string
    initials: string
}

export function UserProfileMenu({ userName, companyName, initials }: UserProfileMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors rounded-lg group outline-none">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {initials}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-white text-sm font-medium truncate leading-tight group-hover:text-white transition-colors">
                            {userName}
                        </h3>
                        <p className="text-gray-500 text-[10px] truncate leading-tight group-hover:text-gray-400 transition-colors">
                            {companyName}
                        </p>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 bg-[#111] border-white/10 text-white mb-2"
                align="end"
                side="right"
                sideOffset={10}
                style={{ zIndex: 99999 }}
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-gray-500">{companyName}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white group">
                    <User className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white" />
                    <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white group">
                    <CreditCard className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white" />
                    <span>Billing</span>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white group">
                    <a href="mailto:gabriel@startg4.com" className="w-full flex items-center">
                        <ArrowUpRight className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white" />
                        <span>Support</span>
                    </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white group text-red-400 focus:text-red-400">
                    <form action={signout} className="w-full flex items-center">
                        <button type="submit" className="flex items-center w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </form>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white group text-red-500 focus:text-red-500">
                    <Ban className="mr-2 h-4 w-4" />
                    <span>Deactivate account</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
