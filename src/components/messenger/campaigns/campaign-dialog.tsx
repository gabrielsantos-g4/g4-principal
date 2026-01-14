"use client"

import { useState, useTransition, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"
import { createCampaign, updateCampaign, getPresignedUrl, Campaign } from "@/actions/messenger/campaigns-actions"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CampaignDialogProps {
    children?: React.ReactNode
    campaign?: Campaign
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CampaignDialog({ children, campaign, open: controlledOpen, onOpenChange }: CampaignDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? onOpenChange! : setInternalOpen

    const [name, setName] = useState(campaign?.name || "")
    const [message, setMessage] = useState(campaign?.message_template || "")
    const [messageType, setMessageType] = useState(campaign?.message_type || "text")
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [mediaPreview, setMediaPreview] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)

    // Reset or load data when opening
    useEffect(() => {
        if (open) {
            setName(campaign?.name || "")
            setMessage(campaign?.message_template || "")
            setMessageType(campaign?.message_type || "text")
            //@ts-ignore - DB model might differ slightly from TS type if not refreshed, 'message_url' is optional
            setMediaPreview(campaign?.message_url || null)
            setMediaFile(null)
        }
    }, [open, campaign])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setMediaFile(file)
            setMediaPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async () => {
        if (!name || !message) return

        let uploadedMediaUrl = null

        if (messageType !== 'text' && mediaFile) {
            setIsUploading(true)
            try {
                // 1. Get Presigned URL
                const { url, key, error } = await getPresignedUrl(mediaFile.name, mediaFile.type)
                if (error || !url) throw new Error(error || "Erro ao gerar URL de upload")

                // 2. Upload to R2
                await fetch(url, {
                    method: 'PUT',
                    body: mediaFile,
                    headers: { 'Content-Type': mediaFile.type }
                })

                // 3. Construct Public URL
                uploadedMediaUrl = `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${key}`
            } catch (err) {
                console.error(err)
                toast.error("Erro ao fazer upload da mídia.")
                setIsUploading(false)
                return
            }
            setIsUploading(false)
        }

        startTransition(async () => {
            const formData = new FormData()
            if (campaign) {
                formData.append('id', campaign.id)
            }
            formData.append('name', name)
            formData.append('message_template', message)
            formData.append('message_type', messageType)

            if (uploadedMediaUrl) {
                formData.append('message_url', uploadedMediaUrl)
            } else if (campaign && campaign.message_url && messageType !== 'text') {
                // Keep existing URL if not changed
                formData.append('message_url', campaign.message_url)
            }

            const result = campaign
                ? await updateCampaign(formData)
                : await createCampaign(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(campaign ? "Campanha atualizada!" : "Campanha criada com sucesso!")
                setOpen(false)
                if (!campaign) {
                    setName("")
                    setMessage("")
                    setMessageType("text")
                    setMediaFile(null)
                    setMediaPreview(null)
                }
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-[#1C73E8] hover:bg-[#1557b0] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Campanha
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] bg-[#1a1a1a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>{campaign ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {campaign ? "Edite os detalhes da sua campanha." : "Crie uma nova campanha de disparo. Configure a mensagem e veja o preview."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* Left Column: Inputs */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome da Campanha</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Promoção de Natal"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-[#0f0f0f] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#1C73E8]"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Tipo de Mensagem</Label>
                            <Select value={messageType} onValueChange={(val) => setMessageType(val as any)}>
                                <SelectTrigger className="bg-[#0f0f0f] border-white/10 text-white focus:ring-[#1C73E8]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="text">Apenas Texto</SelectItem>
                                    <SelectItem value="image">Imagem</SelectItem>
                                    <SelectItem value="video">Vídeo</SelectItem>
                                    <SelectItem value="audio">Áudio</SelectItem>
                                    <SelectItem value="document">Documento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {messageType !== 'text' && (
                            <div className="grid gap-2">
                                <Label>Arquivo de Mídia</Label>
                                <Input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept={
                                        messageType === 'image' ? "image/*" :
                                            messageType === 'video' ? "video/*" :
                                                messageType === 'audio' ? "audio/*" :
                                                    messageType === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" :
                                                        undefined
                                    }
                                    className="bg-[#0f0f0f] border-white/10 text-white file:text-white file:bg-[#1C73E8] file:border-0 file:rounded-sm hover:file:bg-[#1557b0]"
                                />
                                {mediaPreview && !mediaFile && (
                                    <p className="text-xs text-green-400 truncate">Mídia atual: ...{mediaPreview.slice(-15)}</p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="message">Mensagem</Label>
                            <Textarea
                                id="message"
                                placeholder="Digite sua mensagem aqui..."
                                className="h-[200px] resize-none bg-[#0f0f0f] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#1C73E8]"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <p className="text-xs text-gray-400">
                                Você pode usar variáveis como {`{{name}}`} para personalizar.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="flex justify-center items-center bg-[#0f0f0f] rounded-lg p-4 border border-white/10">
                        {/* Phone Mockup */}
                        <div className="relative w-[300px] h-[550px] bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-xl overflow-hidden">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-xl z-10"></div>

                            {/* Screen */}
                            <div className="w-full h-full bg-[#E5DDD5] flex flex-col relative">
                                {/* WhatsApp Header */}
                                <div className="bg-[#008069] h-16 pt-6 px-4 flex items-center text-white">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 mr-2"></div>
                                    <div className="text-sm font-medium">Nome do Contato</div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm max-w-[85%] text-sm text-gray-800 relative mb-2">
                                        {/* Media Preview */}
                                        {messageType === 'image' && mediaPreview && (
                                            <div className="mb-2 rounded-lg overflow-hidden">
                                                <img src={mediaPreview} alt="Preview" className="w-full h-auto object-cover" />
                                            </div>
                                        )}
                                        {messageType === 'video' && mediaPreview && (
                                            <div className="mb-2 rounded-lg overflow-hidden bg-black">
                                                <video src={mediaPreview} controls className="w-full h-auto" />
                                            </div>
                                        )}
                                        {messageType === 'audio' && mediaPreview && (
                                            <div className="mb-2 rounded-lg overflow-hidden">
                                                <audio src={mediaPreview} controls className="w-full" />
                                            </div>
                                        )}
                                        {messageType === 'document' && mediaPreview && (
                                            <div className="mb-2 rounded-lg overflow-hidden border bg-white">
                                                <iframe src={mediaPreview} className="w-full h-48" title="Document Preview" />
                                            </div>
                                        )}

                                        <div className="whitespace-pre-wrap">
                                            {message || "Sua mensagem aparecerá aqui..."}
                                        </div>
                                        <div className="text-[10px] text-gray-500 text-right mt-1">
                                            15:30
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Input Mock */}
                                <div className="h-12 bg-[#F0F2F5] flex items-center px-2">
                                    <div className="flex-1 h-8 bg-white rounded-full mx-2"></div>
                                    <div className="w-8 h-8 rounded-full bg-[#008069] opacity-50"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isPending || isUploading}
                        className="text-gray-300 hover:text-white hover:bg-white/10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name || !message || isPending || isUploading}
                        className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                    >
                        {(isPending || isUploading) ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isUploading ? "Enviando Mídia..." : "Criando..."}
                            </>
                        ) : (
                            campaign ? "Salvar Alterações" : "Criar Campanha"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
