import { StorageGrid } from "@/components/messenger/storage/storage-grid"
import { getStorageFiles } from "@/actions/messenger/storage-actions"
import { StorageStats } from "@/components/messenger/storage/storage-stats"

export default async function StoragePage() {
    const files = await getStorageFiles()

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 flex text-white">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Storage</h2>
                    <p className="text-gray-400">
                        Gerencie seus arquivos de mídia (imagens, vídeos, documentos).
                    </p>
                </div>
            </div>

            <StorageStats files={files} />

            <div className="flex-1">
                <StorageGrid files={files} />
            </div>
        </div>
    )
}
