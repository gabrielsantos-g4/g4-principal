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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Rocket, ArrowRight, ArrowLeft, Smartphone, Check } from "lucide-react"
import { toast } from "sonner"
import { Campaign, triggerCampaign } from "@/actions/messenger/campaigns-actions"
import { ContactList } from "@/actions/messenger/contacts-actions"
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select"
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
    // selectedInstanceId will now strictly hold a single ID string for single mode logic convenience
    // But for multi-select component we might need an array state.
    // Let's use a new state for the multi-select value array to support both modes seamlessly.
    const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([])

    // We keep selectedInstanceId for backward compatibility mostly, or just use selectedInstanceIds[0]
    const selectedInstanceId = selectedInstanceIds[0] || ""

    const [rotateInstances, setRotateInstances] = useState(false)
    const [selectedListId, setSelectedListId] = useState<string>("")
    const [isSending, setIsSending] = useState(false)


    // Filter only WORKING instances
    const activeInstances = instances.filter(i => {
        // Standardize status check
        const status = i.status?.toLowerCase()?.trim()
        return status === 'working' || status === 'online'
    })

    // Auto-select removed for debugging
    console.log('DEBUG: Step 3 activeInstances:', activeInstances)

    // Reset state when opening
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Reset after closing
            setTimeout(() => {
                setStep(1)
                setSelectedCampaignId("")
                setSelectedInstanceIds([])
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
            } else if (selectedInstanceIds.length > 0) {
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
            const instanceIds = selectedInstanceIds

            const result = await triggerCampaign(selectedCampaignId, instanceIds, selectedListId, rotateInstances)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Campaign sent for processing!")
            handleOpenChange(false)
        } catch (error) {
            toast.error("Error triggering campaign.")
        } finally {
            setIsSending(false)
        }
    }

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId)
    const selectedList = lists.find(l => l.id === selectedListId)
    const selectedInstance = instances.find(i => i.uid === selectedInstanceId)

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Rocket className="h-4 w-4" />
                    Send Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Send Campaign</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {step === 1 && "Select the message template."}
                        {step === 2 && "Select the target contact list."}
                        {step === 3 && "Select the sending instance."}
                        {step === 4 && "Check the data before sending."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Template (Campaign) - {campaigns.length} available</Label>
                                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                                    <SelectTrigger className="bg-[#0f0f0f] border-white/10 text-white focus:ring-[#1C73E8]">
                                        <SelectValue placeholder="Select a template..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white z-[9999]">
                                        {campaigns && campaigns.length > 0 ? (
                                            campaigns.map(camp => (
                                                <SelectItem key={camp.id} value={camp.id}>
                                                    {camp.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-gray-500 text-center">No templates found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Contact List - {lists.length} available</Label>
                                <Select value={selectedListId} onValueChange={setSelectedListId}>
                                    <SelectTrigger className="bg-[#0f0f0f] border-white/10 text-white focus:ring-[#1C73E8]">
                                        <SelectValue placeholder="Select a list..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white z-[9999]">
                                        {lists.map(list => (
                                            <SelectItem key={list.id} value={list.id}>
                                                {list.nome || "Unnamed"}
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
                                <Label>Instance (Whatsapp)</Label>

                                {!rotateInstances ? (
                                    <div className="space-y-4">
                                        <SearchableMultiSelect
                                            options={activeInstances.map(i => ({
                                                label: i.nome?.split('_')[0] || "Sem Nome",
                                                value: i.uid
                                            }))}
                                            value={selectedInstanceIds}
                                            onChange={setSelectedInstanceIds}
                                            placeholder="Select instance..."
                                            single={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-xs text-gray-400 mb-2">
                                            Select instances to rotate (leave empty to use all {activeInstances.length} active instances)
                                        </p>
                                        <SearchableMultiSelect
                                            options={activeInstances.map(i => ({
                                                label: i.nome?.split('_')[0] || "Sem Nome",
                                                value: i.uid
                                            }))}
                                            value={selectedInstanceIds}
                                            onChange={setSelectedInstanceIds}
                                            placeholder="Select instances to rotate..."
                                            single={false}
                                        />
                                    </div>
                                )}

                                {activeInstances.length === 0 && (
                                    <p className="text-xs text-red-400 mt-2">You need an instance with WORKING status.</p>
                                )}

                                {activeInstances.length > 1 && (
                                    <div className="flex items-center space-x-2 pt-4">
                                        <Checkbox
                                            id="rotate-instances"
                                            checked={rotateInstances}
                                            onCheckedChange={(checked: boolean) => {
                                                setRotateInstances(checked)
                                                // When enabling rotate, default to all active if selection is empty? 
                                                // Or kept as is.
                                                if (checked && selectedInstanceIds.length === 0) {
                                                    // Optional: pre-select all? 
                                                    // setSelectedInstanceIds(activeInstances.map(i => i.uid))
                                                }
                                                // If disabling rotate, keep first selection or clear?
                                                if (!checked && selectedInstanceIds.length > 1) {
                                                    setSelectedInstanceIds([selectedInstanceIds[0]])
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-[#1C73E8]"
                                        />
                                        <label
                                            htmlFor="rotate-instances"
                                            className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Rotate between selected instances
                                        </label>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 bg-[#0f0f0f] p-4 rounded-lg border border-white/10">
                            <div className="grid grid-cols-3 text-sm gap-2">
                                <span className="font-medium text-gray-400">Instance:</span>
                                {rotateInstances ? (
                                    <div className="col-span-2 text-white">
                                        <span className="font-semibold block mb-1">Rotating between:</span>
                                        <ul className="list-disc list-inside text-xs text-gray-400">
                                            {activeInstances.map(inst => (
                                                <li key={inst.uid}>{inst.nome?.split('_')[0]}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <span className="col-span-2 font-semibold text-white">{selectedInstanceIds.map(id => instances.find(i => i.uid === id)?.nome?.split('_')[0]).join(', ')}</span>
                                )}

                                <span className="font-medium text-gray-400">Template:</span>
                                <span className="col-span-2 text-white">{selectedCampaign?.name}</span>

                                <span className="font-medium text-gray-400">List:</span>
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
                            Cancel
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={isSending}
                            className="text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    )}

                    {step < 4 ? (
                        <Button
                            onClick={handleNext}
                            className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                            disabled={
                                (step === 1 && !selectedCampaignId) ||
                                (step === 2 && !selectedListId) ||
                                (step === 3 && ((selectedInstanceIds.length === 0 && !rotateInstances) || (rotateInstances && selectedInstanceIds.length === 0 && activeInstances.length === 0))) // Allow empty rotate if fallback to all active? No, let's enforce selection if rotate is custom. Or fallback to all if empty. Let's strictly require selection for clarity now.
                            }
                        >
                            Next
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
                                    Sending...
                                </>
                            ) : (
                                <>
                                    SEND
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
