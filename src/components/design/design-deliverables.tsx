'use client'

export function DesignDeliverables() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Deliverables List - Design Request</h2>
                <button className="bg-[#1C73E8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1557b0] transition-colors">
                    Schedule a quick call
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Deadline</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Link</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {/* Example rows - replace with real data */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-sm text-white font-medium">name design</td>
                            <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 12:51</td>
                            <td className="py-4 px-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1C73E8]/10 text-[#1C73E8]">
                                    In progress
                                </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-400">25/Dec/25, 20:00</td>
                            <td className="py-4 px-4 text-sm">
                                <span className="text-gray-600">-</span>
                            </td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-sm text-white font-medium">efg</td>
                            <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 17:58</td>
                            <td className="py-4 px-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1C73E8]/10 text-[#1C73E8]">
                                    In progress
                                </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-400">25/Dec/25, 17:57</td>
                            <td className="py-4 px-4 text-sm">
                                <span className="text-gray-600">-</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
