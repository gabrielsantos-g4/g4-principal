import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

export function CrmFilters() {
    return (
        <div className="bg-[#111] p-3 rounded-lg border border-white/5 mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Button className="bg-[#1C73E8] text-white hover:bg-[#1557B0] text-[10px] h-7 px-3 rounded-md font-medium">
                        Active Leads
                    </Button>
                    <div className="flex items-center gap-1 text-gray-400 px-3 cursor-pointer hover:text-white transition-colors">
                        <span className="text-[10px] font-semibold uppercase tracking-wide">Select a Status</span>
                        <ChevronDown size={12} />
                    </div>
                </div>
                <div className="flex gap-4 text-[11px] font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-gray-300">Leads earned</span>
                    <span className="cursor-pointer hover:text-gray-300">Lost Leads</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search name"
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 h-8 text-xs w-40"
                />
                <Input
                    placeholder="Search company"
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 h-8 text-xs w-40"
                />
                <Input
                    placeholder="Search phone"
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 h-8 text-xs w-40"
                />

                {/* Date Mock */}
                <div className="h-8 px-3 rounded-md bg-black/50 border border-white/10 flex items-center text-xs text-gray-400 w-28 justify-center">
                    1/10/2026
                </div>

                {/* Product Mock */}
                <div className="h-8 px-3 rounded-md bg-black/50 border border-white/10 flex items-center text-xs text-gray-400 min-w-28 justify-between">
                    <span>Select Product</span>
                </div>

                <Button variant="ghost" className="bg-[#1C73E8]/10 text-[#1C73E8] hover:bg-[#1C73E8]/20 h-8 px-4 ml-auto text-xs font-medium">
                    Clean
                </Button>
            </div>
        </div>
    );
}
