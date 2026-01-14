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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Plus, Smartphone } from "lucide-react"
import { createInstance } from "@/actions/messenger/instances-actions"

export function CreateInstanceDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await createInstance(name)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Instância criada com sucesso!")
                setOpen(false)
                setName("")
            }
        } catch (error) {
            toast.error("Erro desconhecido ao criar instância.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-[#1C73E8] hover:bg-[#1557b0] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Instância
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Nova Instância</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Crie uma nova instância para conectar seu WhatsApp.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Instância</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Comercial, Suporte, Marketing..."
                            className="bg-[#0f0f0f] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#1C73E8]"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Apenas letras, números, hífens e underlines.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="border-white/10 hover:bg-white/5 text-gray-300"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !name}
                            className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
