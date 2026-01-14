"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Power, QrCode, Trash2, Smartphone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Instance } from "@/actions/messenger/instances-actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
// Dialogs
import { ConnectInstanceDialog } from "./connect-instance-dialog"
import { DeleteInstanceDialog } from "./delete-instance-dialog"
import { PauseInstanceDialog } from "./pause-instance-dialog"

interface InstancesTableProps {
    instances: Instance[]
}

export function InstancesTable({ instances }: InstancesTableProps) {
    const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
    const [connectOpen, setConnectOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [pauseOpen, setPauseOpen] = useState(false)

    const handleAction = (instance: Instance, action: 'connect' | 'delete' | 'pause') => {
        setSelectedInstance(instance)
        if (action === 'connect') setConnectOpen(true)
        if (action === 'delete') setDeleteOpen(true)
        if (action === 'pause') setPauseOpen(true)
    }

    return (
        <div className="rounded-md border border-white/10 bg-[#1a1a1a]">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-400">Nome</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Última Atualização</TableHead>
                        <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {instances.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                Nenhuma instância encontrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        instances.map((instance) => (
                            <TableRow key={instance.id} className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-medium text-white">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-gray-500" />
                                        {instance.name.split('_')[0]}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "border-0",
                                            instance.status === 'CONNECTED' ? "bg-green-500/20 text-green-400" :
                                                instance.status === 'STOPPED' ? "bg-red-500/20 text-red-400" :
                                                    "bg-yellow-500/20 text-yellow-400"
                                        )}
                                    >
                                        {instance.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400">
                                    {format(new Date(instance.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => handleAction(instance, 'connect')}
                                                className="focus:bg-white/10 cursor-pointer"
                                                disabled={instance.status === 'CONNECTED'}
                                            >
                                                <QrCode className="mr-2 h-4 w-4 text-blue-400" />
                                                Conectar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleAction(instance, 'pause')}
                                                className="focus:bg-white/10 cursor-pointer"
                                                disabled={instance.status !== 'CONNECTED'}
                                            >
                                                <Power className="mr-2 h-4 w-4 text-amber-400" />
                                                Desconectar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={() => handleAction(instance, 'delete')}
                                                className="focus:bg-white/10 cursor-pointer text-red-400 focus:text-red-300"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Dialogs */}
            {selectedInstance && (
                <>
                    <ConnectInstanceDialog
                        instance={selectedInstance}
                        open={connectOpen}
                        onOpenChange={setConnectOpen}
                    />
                    <DeleteInstanceDialog
                        instanceId={selectedInstance.id}
                        open={deleteOpen}
                        onOpenChange={setDeleteOpen}
                        onSuccess={() => setDeleteOpen(false)}
                    />
                    <PauseInstanceDialog
                        instanceId={selectedInstance.id}
                        open={pauseOpen}
                        onOpenChange={setPauseOpen}
                        onSuccess={() => setPauseOpen(false)}
                    />
                </>
            )}
        </div>
    )
}
