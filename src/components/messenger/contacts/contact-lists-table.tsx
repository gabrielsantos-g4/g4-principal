"use client"

import { ContactList } from "@/actions/messenger/contacts-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { DeleteContactListDialog } from "./delete-contact-list-dialog"

interface ContactListsTableProps {
    contactLists: ContactList[]
}

export function ContactListsTable({ contactLists }: ContactListsTableProps) {
    const router = useRouter()

    return (
        <div className="rounded-md border border-white/10 bg-[#1a1a1a]">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-400">Data</TableHead>
                        <TableHead className="text-gray-400">Nome da Lista</TableHead>
                        <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contactLists.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                Nenhuma lista encontrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        contactLists.map((list) => (
                            <TableRow key={list.id} className="border-white/10 hover:bg-white/5">
                                <TableCell className="text-gray-300">
                                    {format(new Date(list.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                    {list.nome || 'Sem nome'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Ver contatos"
                                            className="text-gray-400 hover:text-white hover:bg-white/10"
                                            onClick={() => router.push(`/dashboard/messenger/contacts/${list.id}`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">Ver</span>
                                        </Button>

                                        <DeleteContactListDialog listId={list.id}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Apagar lista"
                                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Apagar</span>
                                            </Button>
                                        </DeleteContactListDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
