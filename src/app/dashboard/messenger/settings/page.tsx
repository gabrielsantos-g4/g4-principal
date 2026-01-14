import { getSettings, updateSettings } from "@/actions/messenger/settings-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"

export default async function SettingsPage() {
    const settings = await getSettings()

    async function updateSettingsAction(formData: FormData) {
        "use server"
        await updateSettings(formData)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Configurações</h2>
                <p className="text-muted-foreground text-gray-400">
                    Gerencie as configurações gerais do Messenger.
                </p>
            </div>

            <div className="grid gap-4 max-w-2xl">
                <Card className="bg-[#1a1a1a] border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Identidade do Agente</CardTitle>
                        <CardDescription className="text-gray-400">
                            Como o seu assistente se apresenta nas conversas automáticas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={updateSettingsAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="wpp_name">Nome do Agente (Whatsapp)</Label>
                                <Input
                                    id="wpp_name"
                                    name="wpp_name"
                                    placeholder="Ex: Bia da G4"
                                    defaultValue={settings?.wpp_name || ""}
                                    className="bg-[#0f0f0f] border-white/10 text-white focus-visible:ring-[#1C73E8]"
                                />
                                <p className="text-xs text-gray-500">
                                    Este nome será usado em algumas variáveis de mensagem.
                                </p>
                            </div>

                            <Button type="submit" className="bg-[#1C73E8] hover:bg-[#1557b0] text-white">
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Alterações
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
