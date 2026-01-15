"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { useState } from "react";

interface CrmSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock initial data
const INITIAL_PRODUCTS = [
    { id: 1, name: "Single project", price: "2,000.00" },
    { id: 2, name: "Single project", price: "500.00" },
    { id: 3, name: "Product", price: "30.00" },
    { id: 4, name: "Ongoing full service", price: "1,500.00" },
    { id: 5, name: "Ongoing single service", price: "250.00" },
];

const INITIAL_STATUSES = [
    { id: 1, name: "Not a good fit", bg: "bg-red-900", text: "text-red-100" },
    { id: 2, name: "Talk to", bg: "bg-blue-900", text: "text-blue-100" },
    { id: 3, name: "Talking", bg: "bg-green-900", text: "text-green-100" },
    { id: 4, name: "Talk Later", bg: "bg-yellow-900", text: "text-yellow-100" },
    { id: 5, name: "Not interested", bg: "bg-red-200", text: "text-red-900" },
    { id: 6, name: "Client", bg: "bg-emerald-700", text: "text-white" },
];

const INITIAL_RESPONSIBLE = [
    { id: 1, name: "Gabriel" },
    { id: 2, name: "Vini" },
    { id: 3, name: "Nanda" },
    { id: 4, name: "Leticia" },
];

const INITIAL_SOURCES = [
    { id: 1, name: "Instagram" },
    { id: 2, name: "LinkedIn" },
    { id: 3, name: "Google Ads" },
    { id: 4, name: "Indication" },
];

const INITIAL_CUSTOM_OPTIONS = [
    { id: 1, name: "Project A" },
    { id: 2, name: "Project B" },
    { id: 3, name: "Internal" },
];

export function CrmSettingsModal({ isOpen, onClose }: CrmSettingsModalProps) {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [statuses, setStatuses] = useState(INITIAL_STATUSES);
    const [responsibles, setResponsibles] = useState(INITIAL_RESPONSIBLE);
    const [sources, setSources] = useState(INITIAL_SOURCES);

    // Custom Field State
    const [customFieldName, setCustomFieldName] = useState("Category");
    const [customOptions, setCustomOptions] = useState(INITIAL_CUSTOM_OPTIONS);

    const handleImportUTMs = () => {
        const newSources = [
            { id: Date.now(), name: "UTM: campaign_black_friday" },
            { id: Date.now() + 1, name: "UTM: newsletter_jan" }
        ];
        setSources(prev => [...prev, ...newSources]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1600px] bg-[#111] text-white p-8 border border-white/10 rounded-sm">
                <div className="grid grid-cols-5 gap-8">
                    {/* Left Column: Products */}
                    <div>
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-bold">Add product / service</DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-2 mb-6">
                            <Input
                                placeholder="Type the product/service"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm flex-1 focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                            />
                            <Input
                                placeholder="$3,000"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm w-28 text-right focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                            />
                            <Button className="bg-[#1C73E8] hover:bg-[#1557B0] text-white font-bold h-10 px-6 rounded-sm">
                                Save
                            </Button>
                        </div>

                        <div className="divide-y divide-white/10 border-t border-white/10">
                            {products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between py-3 group">
                                    <div className="text-sm">
                                        <span className="text-white font-medium">{product.name}</span>
                                        <span className="text-gray-500 mx-2">|</span>
                                        <span className="text-gray-400 font-mono">{product.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Middle Column: Status */}
                    <div>
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-bold">Edit status</DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-2 mb-6 items-center">
                            <Input
                                placeholder="New Status"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm flex-1 focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                            />

                            {/* Mock Color Pickers */}
                            <div className="flex items-center gap-2 px-2">
                                <div className="flex flex-col items-center gap-1 cursor-pointer">
                                    <div className="w-8 h-8 bg-white border border-white/20 rounded-sm"></div>
                                    <span className="text-[10px] text-gray-500 italic">Background</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 cursor-pointer">
                                    <div className="w-8 h-8 bg-gray-500 border border-white/20 rounded-sm"></div>
                                    <span className="text-[10px] text-gray-500 italic">Font</span>
                                </div>
                            </div>

                            <Button className="bg-[#1C73E8] hover:bg-[#1557B0] text-white font-bold h-10 px-6 rounded-sm">
                                Save
                            </Button>
                        </div>

                        <div className="divide-y divide-white/10 border-t border-white/10">
                            {statuses.map((status) => (
                                <div key={status.id} className="flex items-center justify-between py-3 group">
                                    <span className={`px-3 py-1 rounded text-xs font-bold ${status.bg} ${status.text}`}>
                                        {status.name}
                                    </span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Responsible (New) */}
                    <div>
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-bold">Responsible</DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-2 mb-6">
                            <Input
                                placeholder="New Responsible"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm flex-1 focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                            />
                            <Button className="bg-[#1C73E8] hover:bg-[#1557B0] text-white font-bold h-10 px-6 rounded-sm">
                                Save
                            </Button>
                        </div>

                        <div className="divide-y divide-white/10 border-t border-white/10">
                            {responsibles.map((person) => (
                                <div key={person.id} className="flex items-center justify-between py-3 group">
                                    <span className="text-white font-medium text-sm">{person.name}</span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 4: Source (New) */}
                    <div>
                        <DialogHeader className="mb-6 flex flex-row items-center justify-between">
                            <DialogTitle className="text-xl font-bold">Source</DialogTitle>
                            <Button
                                onClick={handleImportUTMs}
                                variant="outline"
                                className="h-7 text-xs border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                            >
                                Import UTMs
                            </Button>
                        </DialogHeader>

                        <div className="flex gap-2 mb-6">
                            <Input
                                placeholder="New Source"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm flex-1 focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                            />
                            <Button className="bg-[#1C73E8] hover:bg-[#1557B0] text-white font-bold h-10 px-6 rounded-sm">
                                Save
                            </Button>
                        </div>

                        <div className="divide-y divide-white/10 border-t border-white/10">
                            {sources.map((src) => (
                                <div key={src.id} className="flex items-center justify-between py-3 group">
                                    <span className="text-white font-medium text-sm">{src.name}</span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 5: Custom Field (Wildcard) */}
                    <div>
                        <DialogHeader className="mb-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Field Name</span>
                                <Input
                                    value={customFieldName}
                                    onChange={(e) => setCustomFieldName(e.target.value)}
                                    className="bg-transparent border-none text-xl font-bold p-0 text-white focus-visible:ring-0 placeholder:text-gray-600 h-auto rounded-none border-b border-transparent hover:border-white/20 focus:border-[#1C73E8] transition-colors"
                                />
                            </div>
                        </DialogHeader>

                        <div className="flex gap-2 mb-6">
                            <Input
                                placeholder={`New ${customFieldName} option`}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm flex-1 focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                            />
                            <Button className="bg-[#1C73E8] hover:bg-[#1557B0] text-white font-bold h-10 px-6 rounded-sm">
                                Save
                            </Button>
                        </div>

                        <div className="divide-y divide-white/10 border-t border-white/10">
                            {customOptions.map((opt) => (
                                <div key={opt.id} className="flex items-center justify-between py-3 group">
                                    <span className="text-white font-medium text-sm">{opt.name}</span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
