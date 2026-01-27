import { getChannelCategories, getChannels } from '@/actions/channel-actions'

export default async function DebugChannelsPage() {
    const categories = await getChannelCategories()
    const channels = await getChannels()

    return (
        <div className="p-10 space-y-8 bg-zinc-950 min-h-screen text-white">
            <h1 className="text-2xl font-bold">Debug Channels</h1>

            <div className="grid grid-cols-2 gap-8">
                <div className="border p-4 rounded border-zinc-800">
                    <h2 className="text-xl font-bold mb-4 text-green-400">Categories ({categories.length})</h2>
                    <pre className="text-xs bg-zinc-900 p-4 rounded overflow-auto max-h-[500px]">
                        {JSON.stringify(categories, null, 2)}
                    </pre>
                </div>

                <div className="border p-4 rounded border-zinc-800">
                    <h2 className="text-xl font-bold mb-4 text-blue-400">Channels ({channels.length})</h2>
                    <pre className="text-xs bg-zinc-900 p-4 rounded overflow-auto max-h-[500px]">
                        {JSON.stringify(channels, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    )
}
