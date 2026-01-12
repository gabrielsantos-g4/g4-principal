"use client";

import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

const TRAININGS = [
    { id: 1, name: "General", date: "Dec 22, 2025 4:37 pm" },
    { id: 2, name: "Audience Research", date: "Dec 22, 2025 4:38 pm" },
    { id: 3, name: "Competitors Analysis", date: "Dec 22, 2025 4:39 pm" },
    { id: 4, name: "Strategy Overview", date: "Dec 22, 2025 4:40 pm" },
    { id: 5, name: "CEO Advising", date: "Dec 22, 2025 4:40 pm" },
    { id: 6, name: "Outreach", date: "Dec 22, 2025 4:41 pm" },
    { id: 7, name: "Messenger", date: "Dec 22, 2025 4:41 pm" },
    { id: 8, name: "Customer Support", date: "Dec 22, 2025 4:41 pm" },
    { id: 9, name: "Design & Video", date: "Dec 22, 2025 4:42 pm" },
    { id: 10, name: "Copy & Messaging", date: "Dec 22, 2025 4:44 pm" },
    { id: 11, name: "Organic Social", date: "Dec 22, 2025 4:44 pm" },
    { id: 12, name: "Paid Social", date: "Dec 22, 2025 4:45 pm" },
    { id: 13, name: "Organic Search (SEO)", date: "Dec 22, 2025 4:45 pm" },
    { id: 14, name: "Paid Search", date: "Dec 22, 2025 4:46 pm" },
    { id: 15, name: "Landing Page", date: "Dec 22, 2025 4:47 pm" },
    { id: 16, name: "CRM", date: "Dec 22, 2025 4:47 pm" },
    { id: 17, name: "UTM Builder", date: "Dec 22, 2025 4:47 pm" },
    { id: 18, name: "BI", date: "Dec 22, 2025 4:48 pm" },
];

export function TrainingsList() {
    const [selectedTraining, setSelectedTraining] = useState<{ id: number, name: string } | null>(null);

    const handleDelete = () => {
        if (selectedTraining) {
            toast.success("Training deleted successfully");
            setSelectedTraining(null);
            // Here you would call an API/action to actually delete
        }
    };

    const handleView = (name: string) => {
        // Mock opening PDF
        window.open(`https://example.com/files/${name.toLowerCase().replace(/\s+/g, '-')}.pdf`, '_blank');
        toast.info(`Opening ${name}.pdf...`);
    };

    return (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5 h-full">
            <h2 className="text-lg font-bold text-white mb-6">All Trainings</h2>

            {/* Header Row */}
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span className="w-1/3">Training Name</span>
                <span className="w-1/3 text-center">Upload Date</span>
                <span className="w-1/3 text-right pr-2">Actions</span>
            </div>

            <div className="space-y-1">
                {TRAININGS.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-2 hover:bg-white/5 rounded-md group transition-colors">
                        <span className="text-sm font-medium text-gray-200 w-1/3 truncate">{item.name}</span>
                        <span className="text-xs text-gray-500 font-mono w-1/3 text-center">{item.date}</span>

                        <div className="flex items-center justify-end gap-2 w-1/3">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleView(item.name)}
                                className="h-7 w-7 bg-[#1C73E8]/10 text-[#1C73E8] hover:bg-[#1C73E8]/20 hover:text-[#1C73E8]"
                            >
                                <Eye size={14} />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedTraining(item)}
                                className="h-7 w-7 text-red-400 hover:bg-red-400/10 hover:text-red-300"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedTraining} onOpenChange={(open) => !open && setSelectedTraining(null)}>
                <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Training</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to delete <span className="text-white font-medium">"{selectedTraining?.name}"</span>?
                            <br />This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedTraining(null)}
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
