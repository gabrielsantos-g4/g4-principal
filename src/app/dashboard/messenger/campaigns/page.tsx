import { getCampaigns } from "@/actions/messenger/campaigns-actions"
import { getContactLists } from "@/actions/messenger/contacts-actions"
import { getInstances } from "@/actions/messenger/instances-actions"
import { CampaignDialog } from "@/components/messenger/campaigns/campaign-dialog"
import { TriggerCampaignDialog } from "@/components/messenger/campaigns/trigger-campaign-dialog"
import { DeleteCampaignDialog } from "@/components/messenger/campaigns/delete-campaign-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Image, FileText, Video, Mic, File } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function CampaignsPage() {
    const campaigns = await getCampaigns()
    const lists = await getContactLists()
    const instances = await getInstances()

    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return <Image className="h-4 w-4" />
            case 'video': return <Video className="h-4 w-4" />
            case 'audio': return <Mic className="h-4 w-4" />
            case 'document': return <File className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Campaigns and Broadcasts</h2>
                    <p className="text-muted-foreground text-gray-400">
                        Create message templates and broadcast campaigns.
                    </p>
                </div>
                <div className="flex gap-2">
                    <CampaignDialog />
                    <TriggerCampaignDialog campaigns={campaigns} lists={lists} instances={instances} />
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-[#1a1a1a]">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">Type</TableHead>
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Message (Preview)</TableHead>
                            <TableHead className="text-gray-400">Media</TableHead>
                            <TableHead className="text-gray-400">Created at</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No campaigns created.
                                </TableCell>
                            </TableRow>
                        ) : (
                            campaigns.map((camp) => (
                                <TableRow key={camp.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell>
                                        <div className="text-gray-400" title={camp.message_type}>
                                            {getIcon(camp.message_type)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{camp.name}</TableCell>
                                    <TableCell className="max-w-[300px] truncate text-gray-400">
                                        {camp.message_template}
                                    </TableCell>
                                    <TableCell>
                                        {camp.message_url ? (
                                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0">
                                                With Media
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-600 text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {format(new Date(camp.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <CampaignDialog campaign={camp}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Editar"
                                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                            </CampaignDialog>

                                            <DeleteCampaignDialog campaignId={camp.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
