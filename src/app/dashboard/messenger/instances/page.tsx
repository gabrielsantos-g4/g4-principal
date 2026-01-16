import { ChannelsConfig } from "@/components/support/channels-config"
import { getEmpresaId } from "@/lib/get-empresa-id"
import { redirect } from "next/navigation"

export default async function InstancesPage() {
    const empresaId = await getEmpresaId()

    if (!empresaId) {
        redirect('/login')
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Instâncias</h2>
                    <p className="text-muted-foreground text-gray-400">
                        Gerencie sua conexão do WhatsApp.
                    </p>
                </div>
            </div>

            <ChannelsConfig companyId={empresaId} showWebChat={false} />
        </div>
    )
}
