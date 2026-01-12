"use client";

import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function KnowledgeBaseUpload() {
    const [isDragActive, setIsDragActive] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            toast.success(`${acceptedFiles.length} file(s) selected: ${acceptedFiles.map(f => f.name).join(", ")}`);
            // Here you would handle the upload
        }
    }, []);

    const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        onDropAccepted: () => setIsDragActive(false),
        onDropRejected: () => setIsDragActive(false),
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    return (
        <div
            {...getRootProps()}
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
    );
}
