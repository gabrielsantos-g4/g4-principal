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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Rocket, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Campaign, triggerCampaign } from "@/actions/messenger/campaigns-actions"
import { ContactList } from "@/actions/messenger/contacts-actions"
// We will just pass pre-fetched count or use simple length for now for list count as an optimization or separate action
// For now, let's assume we can pass the list count or fetch it if needed. 
// Simpler approach: Pass full objects.

interface TriggerCampaignDialogProps {
    campaigns: Campaign[]
    lists: ContactList[]
    instances: any[] // Using any for now, matches Instance type roughly
}

export function TriggerCampaignDialog({ campaigns, lists, instances }: TriggerCampaignDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)

    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
    const [selectedInstanceId, setSelectedInstanceId] = useState<string>("")
    const [rotateInstances, setRotateInstances] = useState(false)
    const [selectedListId, setSelectedListId] = useState<string>("")
    const [isSending, setIsSending] = useState(false)

    // Filter only WORKING instances
    const activeInstances = instances.filter(i => i.status === 'WORKING')

    // Reset state when opening
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Reset after closing
            setTimeout(() => {
                setStep(1)
                setSelectedCampaignId("")
                setSelectedInstanceId("")
                setRotateInstances(false)
                setSelectedListId("")
            }, 300)
        }
    }

    const handleNext = async () => {
        if (step === 1 && selectedCampaignId) {
            setStep(2)
        } else if (step === 2 && selectedListId) {
            setStep(3)
        } else if (step === 3) {
            if (rotateInstances && activeInstances.length > 1) {
                setStep(4)
            } else if (selectedInstanceId) {
                setStep(4)
            }
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleSend = async () => {
        setIsSending(true)
        try {
            const instanceIds = rotateInstances
                ? activeInstances.map(i => i.id)
                : [selectedInstanceId]

            const result = await triggerCampaign(selectedCampaignId, instanceIds, selectedListId, rotateInstances)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Campanha enviada para processamento!")
            handleOpenChange(false)
        } catch (error) {
            toast.error("Erro ao disparar campanha.")
        } finally {
            setIsSending(false)
        }
    }

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId)
    const selectedList = lists.find(l => l.id === selectedListId)
    const selectedInstance = instances.find(i => i.id === selectedInstanceId)

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Rocket className="h-4 w-4" />
                    Disparar Campanha
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Disparar Campanha</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {step === 1 && "Selecione o modelo de mensagem (Template)."}
                        {step === 2 && "Selecione a lista de contatos alvo."}
                        {step === 3 && "Selecione a instância de envio."}
                        {step === 4 && "Confira os dados antes de enviar."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Template (Campanha)</Label>
                                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                                    <SelectTrigger className="bg-[#0f0f0f] border-white/10 text-white focus:ring-[#1C73E8]">
                                        <SelectValue placeholder="Selecione um template..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        {campaigns.map(camp => (
                                            <SelectItem key={camp.id} value={camp.id}>
                                                {camp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Lista de Contatos</Label>
                                <Select value={selectedListId} onValueChange={setSelectedListId}>
                                    <SelectTrigger className="bg-[#0f0f0f] border-white/10 text-white focus:ring-[#1C73E8]">
                                        <SelectValue placeholder="Selecione uma lista..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        {lists.map(list => (
                                            <SelectItem key={list.id} value={list.id}>
                                                {list.nome || "Sem nome"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Instância (Whatsapp)</Label>

                                {!rotateInstances && (
                                    <Select value={selectedInstanceId} onValueChange={setSelectedInstanceId}>
                                        <SelectTrigger className="bg-[#0f0f0f] border-white/10 text-white focus:ring-[#1C73E8]">
                                            <SelectValue placeholder="Selecione a instância..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                            {activeInstances.length === 0 ? (
                                                <div className="p-2 text-sm text-gray-400 text-center">Nenhuma instância ativa</div>
                                            ) : activeInstances.map(inst => (
                                                <SelectItem key={inst.id} value={inst.id}>
                                                    {inst.name.split('_')[0]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {activeInstances.length > 1 && (
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="rotate-instances"
                                            checked={rotateInstances}
                                            onCheckedChange={(checked: boolean) => {
                                                setRotateInstances(checked)
                                                if (checked) setSelectedInstanceId("")
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-[#1C73E8]"
                                        />
                                        <label
                                            htmlFor="rotate-instances"
                                            className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Alternar instâncias (Rodízio)
                                        </label>
                                    </div>
                                )}

                                {rotateInstances && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        As {activeInstances.length} instâncias ativas serão utilizadas para o envio em modo de rodízio.
                                    </p>
                                )}

                                {activeInstances.length === 0 && (
                                    <p className="text-xs text-red-400">Você precisa de uma instância com status WORKING para enviar.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 bg-[#0f0f0f] p-4 rounded-lg border border-white/10">
                            <div className="grid grid-cols-3 text-sm gap-2">
                                <span className="font-medium text-gray-400">Instância:</span>
                                {rotateInstances ? (
                                    <div className="col-span-2 text-white">
                                        <span className="font-semibold block mb-1">Alternando entre:</span>
                                        <ul className="list-disc list-inside text-xs text-gray-400">
                                            {activeInstances.map(inst => (
                                                <li key={inst.id}>{inst.name.split('_')[0]}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <span className="col-span-2 font-semibold text-white">{selectedInstance?.name.split('_')[0]}</span>
                                )}

                                <span className="font-medium text-gray-400">Template:</span>
                                <span className="col-span-2 text-white">{selectedCampaign?.name}</span>

                                <span className="font-medium text-gray-400">Lista:</span>
                                <span className="col-span-2 text-white">{selectedList?.nome}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    {step === 1 ? (
                        <Button
                            variant="ghost"
                            onClick={() => handleOpenChange(false)}
                            className="text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={isSending}
                            className="text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    )}

                    {step < 4 ? (
                        <Button
                            onClick={handleNext}
                            className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                            disabled={
                                (step === 1 && !selectedCampaignId) ||
                                (step === 2 && !selectedListId) ||
                                (step === 3 && ((!selectedInstanceId && !rotateInstances) || activeInstances.length === 0))
                            }
                        >
                            Próximo
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSend}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isSending}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    ENVIAR
                                    <Rocket className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
