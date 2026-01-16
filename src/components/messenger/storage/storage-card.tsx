"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon, Trash2, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { DeleteFileDialog } from "./delete-file-dialog"
import { StorageFile } from "@/actions/messenger/storage-actions"
import { Badge } from "@/components/ui/badge"

interface StorageCardProps {
    file: StorageFile
    onDeleted: () => void
}

export function StorageCard({ file, onDeleted }: StorageCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Helper to format bytes to human readable string
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const isImage = file.type === 'image'
    const isVideo = file.type === 'video'
    const isAudio = file.type === 'audio'
    const isDocument = file.type === 'document'

    const getTypeLabel = () => {
        if (isImage) return 'IMAGEM'
        if (isVideo) return 'VÍDEO'
        if (isAudio) return 'ÁUDIO'
        if (isDocument) return 'DOC'
        return 'ARQUIVO'
    }

    return (
        <>
            <Card className="overflow-hidden group hover:shadow-md transition-shadow border-white/10 bg-[#1a1a1a] text-white">
                <CardContent className="p-0 flex flex-col items-center justify-center bg-black/20 relative">
                    {/* Badge Overlay */}
                    <div className="absolute top-2 right-2 z-10">
                        <Badge variant="secondary" className="opacity-75 font-mono text-[10px] bg-black/50 text-white hover:bg-black/70">
                            {getTypeLabel()}
                        </Badge>
                    </div>

                    <div className="w-full aspect-video flex items-center justify-center bg-[#111111] border-b border-white/5 overflow-visible relative">
                        {isImage ? (
                            <img
                                src={file.url}
                                alt={file.name}
                                className="object-cover w-full h-full"
                            />
                        ) : isVideo ? (
                            <video
                                src={file.url}
                                controls
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : isAudio ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/20 p-4">
                                <audio
                                    src={file.url}
                                    controls
                                    className="w-full"
                                />
                            </div>
                        ) : isDocument && file.name.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full pointer-events-none bg-white"
                                title={file.name}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <FileIcon className="h-12 w-12 text-gray-500" />
                            </div>
                        )}
                    </div>

                    <div className="p-2 text-center w-full">
                        <p className="font-medium truncate w-full text-xs text-gray-200" title={file.name}>
                            {file.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {formatBytes(file.size)}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="p-1 gap-1 justify-end bg-[#1a1a1a] border-t border-white/10 h-8">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar</span>
                        </a>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                    </Button>
                </CardFooter>
            </Card>

            <DeleteFileDialog
                fileKey={file.key}
                fileName={file.name}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onDeleted={onDeleted}
            />
        </>
    )
}
