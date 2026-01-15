'use client'

export function VideoDeliverables() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Deliverables - Video</h2>
                <button className="bg-[#1C73E8]/20 text-[#1C73E8] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1C73E8]/30 transition-colors">
                    Schedule a quick call
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Material Name</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Creation Date</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Status / g4 Comment</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Delivery Deadline</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Delivery Link</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-sm text-gray-300 font-medium">Material Name</td>
                            <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 11:59</td>
                            <td className="py-4 px-4 text-sm text-gray-400">In progress</td>
                            <td className="py-4 px-4 text-sm text-gray-400">26/Dec/25, 13:00</td>
                            <td className="py-4 px-4 text-sm text-[#1C73E8]">-</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-sm text-gray-300 font-medium">Holiday Campaign</td>
                            <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 12:23</td>
                            <td className="py-4 px-4 text-sm text-gray-400">In progress</td>
                            <td className="py-4 px-4 text-sm text-gray-400">25/Dec/25, 18:00</td>
                            <td className="py-4 px-4 text-sm text-[#1C73E8]">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
