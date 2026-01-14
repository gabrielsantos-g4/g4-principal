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
import { Training, deleteTraining } from "@/actions/training-actions";

interface TrainingsListProps {
    trainings: Training[];
}

export function TrainingsList({ trainings }: TrainingsListProps) {
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (selectedTraining) {
            setIsDeleting(true);
            try {
                await deleteTraining(selectedTraining.uid);
                toast.success("Training deleted successfully");
                setSelectedTraining(null);
            } catch (error) {
                toast.error("Error deleting training");
                console.error(error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleView = (name: string) => {
        // Mock opening PDF
        window.open(`https://example.com/files/${name.toLowerCase().replace(/\s+/g, '-')}.pdf`, '_blank');
        toast.info(`Opening ${name}.pdf...`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
    }

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
                {trainings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No trainings found. Upload one to get started.
                    </div>
                ) : (
                    trainings.map((item) => (
                        <div key={item.uid} className="flex items-center justify-between py-2 px-2 hover:bg-white/5 rounded-md group transition-colors">
                            <span className="text-sm font-medium text-gray-200 w-1/3 truncate">{item.titulo}</span>
                            <span className="text-xs text-gray-500 font-mono w-1/3 text-center">{formatDate(item.created_at)}</span>

                            <div className="flex items-center justify-end gap-2 w-1/3">
                                {/* <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleView(item.titulo)}
                                    className="h-7 w-7 bg-[#1C73E8]/10 text-[#1C73E8] hover:bg-[#1C73E8]/20 hover:text-[#1C73E8]"
                                >
                                    <Eye size={14} />
                                </Button> */}
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
                    ))
                )}
            </div>

            <Dialog open={!!selectedTraining} onOpenChange={(open) => !open && setSelectedTraining(null)}>
                <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Training</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to delete <span className="text-white font-medium">"{selectedTraining?.titulo}"</span>?
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
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
