import { getContactsByListId } from "@/actions/messenger/contacts-actions"
import { ContactsTable } from "@/components/messenger/contacts/contacts-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ContactListIdPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ContactListIdPage({ params }: ContactListIdPageProps) {
    const { id } = await params
    const contacts = await getContactsByListId(id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/messenger/contacts">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Detalhes da Lista</h2>
                    <p className="text-muted-foreground text-gray-400">
                        Visualizando {contacts.length} contatos.
                    </p>
                </div>
            </div>

            <ContactsTable initialContacts={contacts} />
        </div>
    )
}
