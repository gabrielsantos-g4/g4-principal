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
import { DeleteContactListDialog } from "@/components/messenger/delete-contact-list-dialog"

interface ContactListsTableProps {
    contactLists: ContactList[]
}

export function ContactListsTable({ contactLists }: ContactListsTableProps) {
    const router = useRouter()

    return (
        <div className="rounded-md border border-white/10">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">Data</TableHead>
                        <TableHead className="text-gray-300">Nome</TableHead>
                        <TableHead className="text-right text-gray-300">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contactLists.map((list) => (
                        <TableRow key={list.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="text-gray-300">
                                {format(new Date(list.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-white">{list.nome || 'Sem nome'}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Ver lista"
                                        className="hover:bg-white/10 text-gray-300"
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
                                            className="text-destructive hover:text-destructive hover:bg-white/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Apagar</span>
                                        </Button>
                                    </DeleteContactListDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {contactLists.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-gray-400">
                                Nenhuma lista encontrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
