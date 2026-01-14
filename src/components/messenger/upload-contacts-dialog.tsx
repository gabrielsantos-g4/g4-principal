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
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadContacts } from "@/actions/messenger/contacts-actions"

interface UploadContactsDialogProps {
    children: React.ReactNode
}

export function UploadContactsDialog({ children }: UploadContactsDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [listName, setListName] = useState("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file || !listName) return

        setIsLoading(true)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('list_name', listName)

        try {
            const result = await uploadContacts(formData)

            if (result.error) {
                console.error(result.error)
                alert(result.error)
            } else {
                console.log("Upload successful", result)
                setOpen(false)
                setFile(null)
                setListName("")
            }
        } catch (error) {
            console.error("Unexpected error", error)
            alert("Ocorreu um erro inesperado.")
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Import Contacts</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Upload an .xls or .xlsx file to import contacts.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="listName">List Name</Label>
                        <Input
                            id="listName"
                            placeholder="My Contacts List"
                            value={listName}
                            onChange={(e) => setListName(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">Contacts File</Label>
                        <div className="relative">
                            <Input
                                id="file"
                                type="file"
                                accept=".xls,.xlsx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Label
                                htmlFor="file"
                                className="flex h-10 w-full cursor-pointer rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm items-center text-gray-300 hover:bg-white/10"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {file ? "Change File" : "Choose File"}
                            </Label>
                        </div>
                    </div>
                    {file && (
                        <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-md">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span className="truncate">{file.name}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || !listName || isLoading}
                        className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
