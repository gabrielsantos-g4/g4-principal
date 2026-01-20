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
                toast.success("Campaign deleted successfully!")
            }
        } catch (error) {
            toast.error("Error deleting campaign.")
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Delete campaign"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
