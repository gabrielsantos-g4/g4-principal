"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { getCrmSettings } from "@/actions/crm/get-crm-settings"
import { updateQualificationActions } from "@/actions/crm/update-qualification-actions"
import { getMessagingUsers, MessagingUser } from "@/actions/users/get-messaging-users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActionConfig {
    type: string
    value: string
}

interface QualificationActions {
    nq: ActionConfig
    mql: ActionConfig
    sql: ActionConfig
}

export function QualificationActionsForm() {
    const [actions, setActions] = useState<QualificationActions>({
        nq: { type: "text", value: "" },
        mql: { type: "text", value: "" },
        sql: { type: "text", value: "" }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [users, setUsers] = useState<MessagingUser[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const [settings, messagingUsers] = await Promise.all([
                    getCrmSettings(),
                    getMessagingUsers()
                ])

                setUsers(messagingUsers)

                if (settings.qualification_actions) {
                    // Ensure valid structure even if partial data exists
                    setActions({
                        nq: settings.qualification_actions.nq || { type: "text", value: "" },
                        mql: settings.qualification_actions.mql || { type: "text", value: "" },
                        sql: settings.qualification_actions.sql || { type: "text", value: "" }
                    })
                }
            } catch (error) {
                console.error(error)
                toast.error("Failed to load settings")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleChange = (key: keyof QualificationActions, field: keyof ActionConfig, value: string) => {
        setActions(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
                // Reset value if type changes to prevent type mismatch (e.g. text in ID field)
                ...(field === 'type' ? { value: "" } : {})
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await updateQualificationActions(actions)
            if (res.success) {
                toast.success("Qualification actions updated")
            } else {
                toast.error("Failed to update actions")
            }
        } catch {
            toast.error("Error saving")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        )
    }

    const renderActionInput = (key: keyof QualificationActions, config: ActionConfig) => {
        switch (config.type) {
            case "link":
                return (
                    <Input
                        value={config.value}
                        onChange={(e) => handleChange(key, 'value', e.target.value)}
                        placeholder="https://example.com/calendar"
                        className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500 placeholder:text-gray-600"
                    />
                )
            case "contact":
                return (
                    <Select
                        value={config.value}
                        onValueChange={(value) => handleChange(key, 'value', value)}
                    >
                        <SelectTrigger className="bg-zinc-900 border-white/10 text-white focus:ring-blue-500">
                            <SelectValue placeholder="Select a person" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-white/10 text-white max-h-[300px]">
                            {users.map(user => (
                                <SelectItem key={user.id} value={user.id} className="cursor-pointer focus:bg-white/10 focus:text-white">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 border border-white/10">
                                            <AvatarImage src={user.avatar_url || undefined} />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            case "text":
            default:
                return (
                    <Input
                        value={config.value}
                        onChange={(e) => handleChange(key, 'value', e.target.value)}
                        placeholder="e.g. Please wait for a specialist..."
                        className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500 placeholder:text-gray-600"
                    />
                )
        }
    }

    return (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5 max-w-5xl mt-8">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-2">Post-Qualification Actions</h2>
                <p className="text-sm text-gray-400">
                    Define what happens after Jess qualifies a lead.
                </p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 pb-2">
                    <div className="col-span-2 text-xs font-bold text-gray-500 uppercase">Status</div>
                    <div className="col-span-3 text-xs font-bold text-gray-500 uppercase">Action Type</div>
                    <div className="col-span-7 text-xs font-bold text-gray-500 uppercase">Configuration</div>
                </div>

                {/* NQ Row */}
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                        <div className="font-bold text-red-400">NQ (Not Qualified)</div>
                    </div>
                    <div className="col-span-3">
                        <Select
                            value={actions.nq.type}
                            onValueChange={(value) => handleChange('nq', 'type', value)}
                        >
                            <SelectTrigger className="bg-zinc-900 border-white/10 text-white focus:ring-blue-500">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                <SelectItem value="link">Link (URL)</SelectItem>
                                <SelectItem value="contact">Contact (Person)</SelectItem>
                                <SelectItem value="text">Text (Message)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-7">
                        {renderActionInput('nq', actions.nq)}
                    </div>
                </div>

                {/* MQL Row */}
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                        <div className="font-bold text-purple-400">MQL (Marketing)</div>
                    </div>
                    <div className="col-span-3">
                        <Select
                            value={actions.mql.type}
                            onValueChange={(value) => handleChange('mql', 'type', value)}
                        >
                            <SelectTrigger className="bg-zinc-900 border-white/10 text-white focus:ring-blue-500">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                <SelectItem value="link">Link (URL)</SelectItem>
                                <SelectItem value="contact">Contact (Person)</SelectItem>
                                <SelectItem value="text">Text (Message)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-7">
                        {renderActionInput('mql', actions.mql)}
                    </div>
                </div>

                {/* SQL Row */}
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                        <div className="font-bold text-green-400">SQL (Sales)</div>
                    </div>
                    <div className="col-span-3">
                        <Select
                            value={actions.sql.type}
                            onValueChange={(value) => handleChange('sql', 'type', value)}
                        >
                            <SelectTrigger className="bg-zinc-900 border-white/10 text-white focus:ring-blue-500">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                <SelectItem value="link">Link (URL)</SelectItem>
                                <SelectItem value="contact">Contact (Person)</SelectItem>
                                <SelectItem value="text">Text (Message)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-7">
                        {renderActionInput('sql', actions.sql)}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                    >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Actions
                    </Button>
                </div>
            </div>
        </div>
    )
}
