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
import { PauseCircle, Loader2 } from "lucide-react"
import { stopInstanceSession } from "@/actions/messenger/instances-actions"
import { toast } from "sonner"

interface PauseInstanceDialogProps {
    children: React.ReactNode
    instanceId: string
    instanceName: string
}

export function PauseInstanceDialog({ children, instanceId, instanceName }: PauseInstanceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handlePause = async () => {
        setIsLoading(true)
        const result = await stopInstanceSession(instanceId)

        if (result.error) {
            console.error(result.error)
            toast.error(result.error)
            setIsLoading(false)
        } else {
            toast.success("Instância pausada com sucesso")
            setOpen(false)
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Pausar Conexão</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Esta ação vai pausar a conexão, desconectar do seu aparelho, mas vai continuar na sua lista de conexões.
                        Você pode sincronizar novamente lendo o QR Code.
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
                        onClick={handlePause}
                        disabled={isLoading}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Pausando...
                            </>
                        ) : (
                            <>
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Pausar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
