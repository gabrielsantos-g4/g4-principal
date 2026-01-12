"use client";

import { Button } from "@/components/ui/button";
import { Agent } from "@/lib/agents";
import { Book, LayoutList, User, LogOut } from "lucide-react";

interface SupportHeaderProps {
    agent: Agent;
}

export function SupportHeader({ agent }: SupportHeaderProps) {
    return (
        <div className="flex items-center justify-between bg-[#0A0A0A] p-3 rounded-xl border border-white/5 mb-6">
            <div className="flex items-center gap-4 pl-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1C73E8] shadow-[0_0_20px_rgba(28,115,232,0.4)] relative">
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white leading-none mb-1">{agent.role}</h1>
                    <p className="text-sm text-[#1C73E8] font-medium leading-none tracking-wide">{agent.name}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 pr-2">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white leading-tight">Gabriel Santos</p>
                    <p className="text-xs text-gray-400 leading-tight">gabriel@startg4.com</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button size="icon" className="bg-[#1C73E8] hover:bg-[#1557B0] text-white w-10 h-10 rounded-lg shadow-lg shadow-blue-900/20">
                        <Book size={18} strokeWidth={2.5} />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 hover:text-white w-10 h-10 rounded-lg border border-white/5">
                        <LayoutList size={18} strokeWidth={2.5} />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 hover:text-white w-10 h-10 rounded-lg border border-white/5">
                        <User size={18} strokeWidth={2.5} />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 hover:text-white w-10 h-10 rounded-lg border border-white/5">
                        <LogOut size={18} className="rotate-180" strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
