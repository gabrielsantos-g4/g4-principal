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
                toast.success("List deleted successfully!")
            }
        } catch (error) {
            toast.error("Error deleting list.")
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete contact list?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        This action cannot be undone. The list and all its contacts will be permanently removed.
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
