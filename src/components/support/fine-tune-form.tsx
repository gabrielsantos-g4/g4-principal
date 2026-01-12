"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function FineTuneForm() {
    return (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">New Knowledge (Fine-Tune)</h2>
                <Button className="bg-white/10 hover:bg-white/20 text-white font-medium h-8 text-xs px-4">
                    Send <Send size={12} className="ml-2" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
                    <Input
                        placeholder="Type here..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#1C73E8]"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question / In this situation...</label>
                    <Input
                        placeholder="Type here..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#1C73E8]"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Answer / Answer this...</label>
                    <Input
                        placeholder="Type here..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#1C73E8]"
                    />
                </div>
            </div>
        </div>
    );
}
