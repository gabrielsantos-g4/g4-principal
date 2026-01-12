"use client";

import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, QrCode } from "lucide-react";

export function ChannelsConfig() {
    return (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5">
            <h2 className="text-lg font-bold text-white mb-6">Channels & Connectors</h2>

            <div className="space-y-4">
                {/* WhatsApp */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-white w-24">WhatsApp</span>
                            <Button variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 h-8 text-xs font-bold">
                                Generate QR Code <QrCode size={14} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Web Chat */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <span className="font-bold text-white w-24 shrink-0">Web chat</span>

                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-[10px] text-gray-500 font-bold">Profile Picture</div>
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    <img src="https://i.pinimg.com/736x/24/29/61/2429617ce5e50f631606f92b65aaeb0f.jpg" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="text-xs text-gray-500 font-mono truncate max-w-[300px]">https://app.startg4.com/chat?utm_source=g4</div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Copy URL <Copy size={12} className="ml-2" />
                                    </Button>
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Open page <ExternalLink size={12} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bubble Chat */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <span className="font-bold text-white w-24 shrink-0">Bubble chat</span>

                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-[10px] text-gray-500 font-bold">Profile Picture</div>
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    <img src="https://i.pinimg.com/736x/24/29/61/2429617ce5e50f631606f92b65aaeb0f.jpg" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2 mt-4">
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Copy Code <Copy size={12} className="ml-2" />
                                    </Button>
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Tutorial video <ExternalLink size={12} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
