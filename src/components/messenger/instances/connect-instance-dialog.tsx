"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, QrCode } from "lucide-react"
import { startInstanceSession, Instance } from "@/actions/messenger/instances-actions"
import { createClient } from "@/lib/supabase-client"
import Image from "next/image"
import { toast } from "sonner"

interface ConnectInstanceDialogProps {
    instance: Instance
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ConnectInstanceDialog({
    instance,
    open,
    onOpenChange
}: ConnectInstanceDialogProps) {
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [status, setStatus] = useState<string>(instance.status)
    const [isLoading, setIsLoading] = useState(false)
    const [supabase] = useState(() => createClient())

    // 1. Start Session on Open
    useEffect(() => {
        if (open && instance.status !== 'CONNECTED') {
            const initSession = async () => {
                setIsLoading(true)
                try {
                    const result = await startInstanceSession(instance.id)
                    if (result.error) {
                        toast.error(result.error)
                    }
                } catch (e) {
                    toast.error("Erro ao iniciar sessão.")
                } finally {
                    setIsLoading(false)
                }
            }
            initSession()
        }
    }, [open, instance.id, instance.status])

    // 2. Realtime Listener for QR Code and Status
    useEffect(() => {
        if (!open) return

        const channel = supabase
            .channel(`instance-connect-${instance.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'camp_instances',
                filter: `id=eq.${instance.id}`
            }, (payload) => {
                const updated = payload.new as Instance
                setStatus(updated.status)

                if (updated.qr_code_base64) {
                    setQrCode(updated.qr_code_base64)
                }

                if (updated.status === 'CONNECTED') {
                    toast.success('WhatsApp conectado com sucesso!')
                    onOpenChange(false)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [open, instance.id, supabase, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Conectar WhatsApp</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Escaneie o QR Code com seu WhatsApp para conectar a instância <strong>{instance.name.split('_')[0]}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    {status === 'CONNECTED' ? (
                        <div className="text-green-500 font-medium flex flex-col items-center">
                            <Loader2 className="h-8 w-8 mb-2 animate-spin" /> {/* Or success icon */}
                            Conectado!
                        </div>
                    ) : (
                        <div className="relative flex items-center justify-center bg-white p-2 rounded-lg min-w-[250px] min-h-[250px]">
                            {qrCode ? (
                                <Image
                                    src={qrCode}
                                    alt="QR Code"
                                    width={250}
                                    height={250}
                                    className="rounded-md"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <Loader2 className="h-8 w-8 mb-2 animate-spin text-[#1C73E8]" />
                                    <span className="text-sm">Gerando QR Code...</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="text-sm text-gray-400 text-center">
                        <p>Status atual: <span className="text-white font-mono">{status}</span></p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
