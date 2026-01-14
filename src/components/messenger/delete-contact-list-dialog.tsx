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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Loader2 } from "lucide-react"
import { deleteContactList } from "@/actions/messenger/contacts-actions"

interface DeleteContactListDialogProps {
    children: React.ReactNode
    listId: string
}

export function DeleteContactListDialog({ children, listId }: DeleteContactListDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteContactList(listId)

        if (result.error) {
            console.error(result.error)
            alert(result.error)
            setIsLoading(false)
        } else {
            setOpen(false)
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Excluir Lista de Contatos</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Tem certeza que deseja apagar esta lista? Esta ação não pode ser desfeita e removerá todos os contatos associados.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
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
