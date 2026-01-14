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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deleteContactList } from "@/actions/messenger/contacts-actions"

interface DeleteContactListDialogProps {
    listId: string
    children: React.ReactNode
}

export function DeleteContactListDialog({ listId, children }: DeleteContactListDialogProps) {

    const handleDelete = async () => {
        try {
            const result = await deleteContactList(listId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Lista excluída com sucesso!")
            }
        } catch (error) {
            toast.error("Erro ao excluir lista.")
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir lista de contatos?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        Esta ação não pode ser desfeita. A lista e todos os seus contatos serão removidos permanentemente.
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
