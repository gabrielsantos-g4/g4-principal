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
import { deleteCampaign } from "@/actions/messenger/campaigns-actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteCampaignDialogProps {
    campaignId: string
    // Simplified, we just use a button as trigger by default in table usually, but let's make it flexible
}

export function DeleteCampaignDialog({ campaignId }: DeleteCampaignDialogProps) {

    const handleDelete = async () => {
        try {
            const result = await deleteCampaign(campaignId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Campanha excluída com sucesso!")
            }
        } catch (error) {
            toast.error("Erro ao excluir campanha.")
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Apagar campanha"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Apagar</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        Esta ação não pode ser desfeita.
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
