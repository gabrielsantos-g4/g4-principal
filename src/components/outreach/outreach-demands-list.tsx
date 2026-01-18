"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";

interface Demand {
    id: string;
    icp_name: string;
    request_date: string;
    deadline: string;
    email_to_send: string;
    status: string;
}

interface OutreachDemandsListProps {
    demands: Demand[];
}

export function OutreachDemandsList({ demands }: OutreachDemandsListProps) {
    if (!demands || demands.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xl font-bold text-white mb-4">Research Requests History</h3>
            <div className="rounded-md border border-white/10 overflow-hidden bg-[#1A1A1A]">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-3 font-medium">ICP Name</th>
                            <th className="px-6 py-3 font-medium">Request Date</th>
                            <th className="px-6 py-3 font-medium">Deadline (7 days)</th>
                            <th className="px-6 py-3 font-medium">Recipient Email</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {demands.map((demand) => (
                            <tr key={demand.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{demand.icp_name}</td>
                                <td className="px-6 py-4">{format(new Date(demand.request_date), 'PPP')}</td>
                                <td className="px-6 py-4">{format(new Date(demand.deadline), 'PPP')}</td>
                                <td className="px-6 py-4">{demand.email_to_send}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {demand.status === 'Completed' ? (
                                            <CheckCircle2 className="text-green-500 w-4 h-4" />
                                        ) : (
                                            <Clock className="text-yellow-500 w-4 h-4" />
                                        )}
                                        <span className={demand.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}>
                                            {demand.status}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
