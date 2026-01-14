import { getContactLists } from "@/actions/messenger/contacts-actions"
import { ContactListsTable } from "@/components/messenger/contacts/contact-lists-table"
import { UploadContactsDialog } from "@/components/messenger/contacts/upload-contacts-dialog"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default async function ContactsPage() {
    const contactLists = await getContactLists()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Listas de Contatos</h2>
                    <p className="text-muted-foreground text-gray-400">
                        Gerencie suas listas de contatos importadas.
                    </p>
                </div>
                <UploadContactsDialog>
                    <Button className="bg-[#1C73E8] hover:bg-[#1557b0] text-white">
                        <Upload className="mr-2 h-4 w-4" />
                        Importar Contatos
                    </Button>
                </UploadContactsDialog>
            </div>

            <ContactListsTable contactLists={contactLists} />
        </div>
    )
}
