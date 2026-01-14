import { getInstances } from "@/actions/messenger/instances-actions"
import { CreateInstanceDialog } from "@/components/messenger/instances/create-instance-dialog"
import { InstancesTable } from "@/components/messenger/instances/instances-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function InstancesPage() {
    const instances = await getInstances()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Instâncias</h2>
                    <p className="text-muted-foreground text-gray-400">
                        Gerencie suas conexões do WhatsApp.
                    </p>
                </div>
                <CreateInstanceDialog>
                    <Button className="bg-[#1C73E8] hover:bg-[#1557b0] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Instância
                    </Button>
                </CreateInstanceDialog>
            </div>

            <InstancesTable instances={instances} />
        </div>
    )
}
