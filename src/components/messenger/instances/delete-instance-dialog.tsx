"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deleteInstance } from "@/actions/messenger/instances-actions"

interface DeleteInstanceDialogProps {
    instanceId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteInstanceDialog({
    instanceId,
    open,
    onOpenChange,
    onSuccess
}: DeleteInstanceDialogProps) {

    const handleDelete = async () => {
        try {
            const result = await deleteInstance(instanceId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Instância excluída com sucesso!")
                onSuccess?.()
            }
        } catch (error) {
            toast.error("Erro ao excluir instância.")
            console.error(error)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a instância
                        e desconectará o WhatsApp associado.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                        Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
