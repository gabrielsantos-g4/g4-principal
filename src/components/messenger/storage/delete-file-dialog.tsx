"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, Loader2 } from "lucide-react"
import { deleteStorageFile } from "@/actions/messenger/storage-actions"
import { toast } from "sonner"

interface DeleteFileDialogProps {
    fileKey: string
    fileName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onDeleted: () => void
}

export function DeleteFileDialog({ fileKey, fileName, open, onOpenChange, onDeleted }: DeleteFileDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const result = await deleteStorageFile(fileKey)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Arquivo excluído com sucesso!")
                onDeleted()
                onOpenChange(false)
            }
        } catch (error) {
            console.error("Client delete error:", error)
            toast.error("Erro inesperado ao excluir arquivo.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Excluir Arquivo</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Tem certeza que deseja excluir o arquivo <span className="font-semibold text-white">{fileName}</span>?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
