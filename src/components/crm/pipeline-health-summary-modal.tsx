"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CrmSettings } from "@/actions/crm/get-crm-settings";

interface PipelineHealthSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    leads: any[];
    settings: CrmSettings;
}

export function PipelineHealthSummaryModal({ isOpen, onClose, leads, settings }: PipelineHealthSummaryModalProps) {
    const avgTicket = settings.avg_ticket || 0;
    const revenueGoal = settings.revenue_goal || 0;
    const closeRate = settings.close_rate || 0;
    const statuses = settings.statuses || [];

    const neededCustomers = avgTicket > 0 ? Math.ceil(revenueGoal / avgTicket) : 0;
    const neededWarmHot = avgTicket > 0 && closeRate > 0 ? Math.ceil(neededCustomers / (closeRate / 100)) : 0;

    // Count current Warm/Hot leads
    const statusMap = new Map<string, { temperature?: string }>();
    statuses.forEach(s => {
        statusMap.set(s.label, { temperature: s.temperature });
    });
    const currentWarmHot = leads.filter(l => {
        const statusInfo = statusMap.get(l.status);
        const temperature = statusInfo?.temperature;
        return temperature === 'Warm' || temperature === 'Hot';
    }).length;

    const shortfall = neededWarmHot - currentWarmHot;
    const isHealthy = currentWarmHot >= neededWarmHot;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Pipeline Health Summary</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-lg">
                        <p className="text-base leading-relaxed text-gray-200">
                            You want to close{" "}
                            <span className="font-bold text-emerald-400">{neededCustomers} customers</span>{" "}
                            this month at an average ticket of{" "}
                            <span className="font-bold text-blue-400">${avgTicket.toLocaleString()}</span>,
                            reaching a revenue of{" "}
                            <span className="font-bold text-purple-400">${revenueGoal.toLocaleString()}</span>.
                        </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-white/10 rounded-lg">
                        <p className="text-base leading-relaxed text-gray-200">
                            With a close rate of{" "}
                            <span className="font-bold text-orange-400">{closeRate}%</span>,
                            you need{" "}
                            <span className="font-bold text-red-400">{neededWarmHot} leads</span>{" "}
                            with Warm or Hot status in your pipeline.
                        </p>
                    </div>

                    <div className={`p-6 border rounded-lg ${isHealthy
                        ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20'
                        : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20'
                        }`}>
                        <p className="text-base leading-relaxed text-gray-200">
                            Currently, you have{" "}
                            <span className={`font-bold ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                                {currentWarmHot} leads
                            </span>{" "}
                            with Warm/Hot status.{" "}
                            {isHealthy ? (
                                <span className="font-bold text-emerald-400">
                                    Your pipeline is healthy! 🎉
                                </span>
                            ) : (
                                <span className="font-bold text-red-400">
                                    You need {shortfall} more Warm/Hot leads to reach your goal.
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
