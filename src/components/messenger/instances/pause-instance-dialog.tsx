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
import { stopInstanceSession } from "@/actions/messenger/instances-actions"

interface PauseInstanceDialogProps {
    instanceId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function PauseInstanceDialog({
    instanceId,
    open,
    onOpenChange,
    onSuccess
}: PauseInstanceDialogProps) {

    const handlePause = async () => {
        try {
            const result = await stopInstanceSession(instanceId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Sessão parada com sucesso.")
                onSuccess?.()
            }
        } catch (error) {
            toast.error("Erro ao parar a sessão.")
            console.error(error)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Parar Instância?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        Isso irá desconectar a sessão do WhatsApp temporariamente.
                        As mensagens não serão enviadas ou recebidas até que você reconecte.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handlePause}
                        className="bg-amber-600 hover:bg-amber-700 text-white border-none"
                    >
                        Parar Sessão
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
