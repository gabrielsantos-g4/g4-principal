"use client"

import { Contact } from "@/actions/messenger/contacts-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SubscriptionBadge } from "@/components/messenger/subscription-badge"

interface ContactsTableProps {
    initialContacts: Contact[]
}

export function ContactsTable({ initialContacts }: ContactsTableProps) {
    return (
        <div className="border border-white/10 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">Nome</TableHead>
                        <TableHead className="text-gray-300">Telefone</TableHead>
                        <TableHead className="text-gray-300">Subscribed</TableHead>
                        <TableHead className="text-gray-300">Tags</TableHead>
                        <TableHead className="text-gray-300">Campanhas</TableHead>
                        <TableHead className="text-right text-gray-300">Data</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialContacts.map((contact) => (
                        <TableRow key={contact.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium text-white">{contact.name || '-'}</TableCell>
                            <TableCell className="text-gray-300">{contact.phone}</TableCell>
                            <TableCell>
                                <SubscriptionBadge
                                    contactId={contact.id}
                                    initialStatus={!!contact.send_campaigns}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {contact.tags?.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-gray-300">
                                            {tag}
                                        </Badge>
                                    )) || '-'}
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                                {contact.campaigns_id && contact.campaigns_id.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {contact.campaigns_id.map((camp, idx) => (
                                            <span key={idx} className="text-sm">
                                                {camp.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell className="text-right text-gray-300">
                                {contact.created_at
                                    ? format(new Date(contact.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                    : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {initialContacts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                Nenhum contato encontrado nesta lista.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
