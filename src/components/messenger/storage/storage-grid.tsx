"use client"

import { StorageFile } from "@/actions/messenger/storage-actions"
import { StorageCard } from "./storage-card"
import { FileQuestion } from "lucide-react"

interface StorageGridProps {
    files: StorageFile[]
}

export function StorageGrid({ files: initialFiles }: StorageGridProps) {
    return (
        <>
            {initialFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-[#1a1a1a]/50">
                    <FileQuestion className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-300">Nenhum arquivo encontrado</h3>
                    <p className="text-sm">Os arquivos que você enviar aparecerão aqui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {initialFiles.map((file) => (
                        <StorageCard
                            key={file.key}
                            file={file}
                            onDeleted={() => {
                                // Handled by server revalidation
                            }}
                        />
                    ))}
                </div>
            )}
        </>
    )
}
