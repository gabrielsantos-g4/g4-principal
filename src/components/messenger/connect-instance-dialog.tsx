"use client"

import { useState, useEffect } from "react"
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
import { WifiOff, QrCode, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { startInstanceSession } from "@/actions/messenger/instances-actions"

interface ConnectInstanceDialogProps {
    children: React.ReactNode
    instance: {
        id: string
        name: string
        status: string | null
        empresa_id: string
        qr_code?: string | null
        url_profile?: string | null
    }
}

export function ConnectInstanceDialog({ children, instance }: ConnectInstanceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(instance.qr_code || null)

    // Sync local state with props (Realtime updates from parent)
    useEffect(() => {
        setQrCode(instance.qr_code || null)

        // If we have a QR code or status is WORKING, stop loading
        if (instance.qr_code || instance.status === 'WORKING') {
            setIsLoading(false)
        }
    }, [instance.qr_code, instance.status, instance])

    const handleGenerateQRCode = async () => {
        setIsLoading(true)
        setQrCode(null)

        const result = await startInstanceSession(instance.id)

        if (result.error) {
            console.error(result.error)
            // TODO: Show error toast
            setIsLoading(false)
        } else {
            // Success! Now we wait for Realtime updates to populate the QR code
            // We keep isLoading true until we receive the QR code via Realtime
            // setIsLoading(false) 
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Connect Instance</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {qrCode ? "Scan the QR Code to synchronize" : "Generate QR Code to connect WhatsApp."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center gap-4 w-full">
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-lg font-semibold">
                            {instance.name.replace(`_${instance.empresa_id}`, '')}
                        </h3>
                        <Badge variant="secondary" className="text-sm">
                            {instance.status || 'STOPPED'}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-center w-[250px] h-[250px] bg-white/10 rounded-lg overflow-hidden transition-all duration-300">
                        {isLoading ? (
                            <Loader2 className="w-24 h-24 text-primary animate-spin" />
                        ) : instance.status === 'WORKING' && instance.url_profile ? (
                            <img src={instance.url_profile} alt="Profile" className="w-full h-full object-cover" />
                        ) : qrCode ? (
                            <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                            <WifiOff className="w-24 h-24 text-muted-foreground/50" />
                        )}
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-col gap-2 w-full">
                    {instance.status === 'WORKING' ? (
                        <Button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="w-full bg-slate-700 hover:bg-slate-600"
                        >
                            Close
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="button"
                                onClick={handleGenerateQRCode}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? "Generating..." : (
                                    <>
                                        <QrCode className="mr-2 h-4 w-4" />
                                        Generate QR Code
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="w-full mt-2 sm:mt-0 bg-transparent border-white/20 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
