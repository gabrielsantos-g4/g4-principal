"use client";

import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadTrainingFile } from "@/actions/training-actions";

interface KnowledgeBaseUploadProps {
    companyId: string;
}

export function KnowledgeBaseUpload({ companyId }: KnowledgeBaseUploadProps) {
    const router = useRouter();
    const [isDragActive, setIsDragActive] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setIsOpen(true);
            if (!name) {
                // Auto-fill name from file name (without extension)
                const fileName = acceptedFiles[0].name.replace(/\.[^/.]+$/, "");
                setName(fileName);
            }
        }
    }, [name]);

    const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        onDropAccepted: () => setIsDragActive(false),
        onDropRejected: () => setIsDragActive(false),
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file || !name) {
            toast.error("Please provide a name and select a file.");
            return;
        }

        if (!companyId) {
            toast.error("Company ID mismatch. Please try reloading.");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Uploading training...");

        try {
            const formData = new FormData();
            formData.append("midia", file);
            formData.append("tabela_nome", companyId);
            formData.append("titulo", name);

            const result = await uploadTrainingFile(formData);

            if (!result.success) {
                throw new Error(result.error || "Upload failed");
            }

            toast.success("Training uploaded successfully!", { id: toastId });
            setIsOpen(false);
            setFile(null);
            setName("");
            router.refresh();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to upload training.", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleManualClick = () => {
        setIsOpen(true);
    };

    return (
        <>
            <div
                {...getRootProps()}
                onClick={handleManualClick}
                className={cn(
                    "bg-[#111] p-6 rounded-lg border border-white/5 mb-6 flex items-center justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden",
                    isDragActive && "border-[#1C73E8] bg-[#1C73E8]/5 ring-1 ring-[#1C73E8]"
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-white relative z-10">New Knowledge (Bulk)</h2>
                    {isDragActive && <p className="text-xs text-[#1C73E8] absolute -bottom-4 animate-in fade-in slide-in-from-top-1 ">Drop files here...</p>}
                </div>

                <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-white/20 text-[#1C73E8] text-sm font-medium transition-colors z-10",
                    "group-hover:border-[#1C73E8] group-hover:bg-[#1C73E8]/10",
                    isDragActive && "border-[#1C73E8] bg-[#1C73E8]/20"
                )}>
                    Upload Your PDF
                    <Upload size={16} />
                </div>

                {/* Drag Overlay Effect */}
                {isDragActive && (
                    <div className="absolute inset-0 bg-[#1C73E8]/5 pointer-events-none" />
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-bold">New Knowledge</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Training name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={cn(
                                    "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#1C73E8] focus:ring-[#1C73E8]",
                                    !name && "border-white/10" // Default border
                                )}
                            />
                        </div>

                        {/* Drop area inside modal */}
                        <div
                            className="border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => document.getElementById('modal-file-input')?.click()}
                        >
                            <input
                                type="file"
                                id="modal-file-input"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setFile(e.target.files[0]);
                                        if (!name) setName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                                    }
                                }}
                            />
                            {file ? (
                                <div className="flex items-center gap-2 text-white">
                                    <FileText size={24} className="text-[#1C73E8]" />
                                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                        <X size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-sm">Drop or select your PDF</span>
                            )}
                        </div>

                        {isUploading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-8 h-8 text-[#1C73E8] animate-spin" />
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-[#1C73E8] hover:bg-[#1C73E8]/90 text-white font-bold py-6 text-lg border-0"
                                onClick={handleUpload}
                                disabled={!file || !name}
                            >
                                Upload
                                <Upload className="ml-2 w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
