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

    const isHealthy = currentWarmHot >= neededWarmHot;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-[#0a0a0a] border-white/10 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        Pipeline Strategy
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-4 text-[15px] leading-relaxed">
                        <p className="text-gray-300">
                            You want to close <span className="text-white font-bold">{neededCustomers} customers</span>.
                            At an average ticket of <span className="text-blue-400 font-bold">${avgTicket.toLocaleString()}</span>,
                            you will reach <span className="text-emerald-400 font-bold">${revenueGoal.toLocaleString()}</span> in revenue.
                        </p>

                        <p className="text-gray-300">
                            We have <span className="text-white font-bold">{leads.length} leads</span> in the list.
                            Of these, <span className="text-white font-bold">{currentWarmHot}</span> are in <span className="text-orange-400 font-semibold">Warm</span> or <span className="text-red-400 font-semibold">Hot</span> phase.
                        </p>

                        <div className="pt-2 border-t border-white/5">
                            <p className="text-gray-300">
                                Your conversion rate is <span className="text-blue-400 font-bold">{closeRate}%</span>, so:
                            </p>

                            <div className={`mt-4 p-4 rounded-xl border ${isHealthy
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}>
                                <p className="font-medium">
                                    {isHealthy ? (
                                        <>Your pipeline is healthy because you have enough warm/hot leads ({currentWarmHot}) to convert.</>
                                    ) : (
                                        <>Your pipeline is challenging; you need {neededWarmHot} leads in warm/hot phase ({currentWarmHot}) for a healthy pipeline.</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
                    <Button onClick={onClose} variant="outline" className="h-9 px-6 bg-transparent border-white/10 text-white hover:bg-white/5">
                        Got it
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
