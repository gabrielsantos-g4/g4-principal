"use client";

import { useMemo } from "react";
import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineHealthIndicatorProps {
    leads: any[];
    settings: CrmSettings;
}

export function PipelineHealthIndicator({ leads, settings }: PipelineHealthIndicatorProps) {
    const health = useMemo(() => {
        const revenueGoal = settings.revenue_goal || 0;
        const avgTicket = settings.avg_ticket || 0;
        const closeRate = settings.close_rate || 0;

        // If not configured, hide
        if (revenueGoal <= 0 || avgTicket <= 0 || closeRate <= 0) {
            return null;
        }

        const neededCustomers = Math.ceil(revenueGoal / avgTicket);
        // Avoid division by zero
        const neededPipelineDeals = Math.ceil(neededCustomers / (closeRate / 100));

        // Map status label to phase and temperature for O(1) lookup
        const statusMap = new Map<string, { phase?: string, temperature?: string }>();
        settings.statuses.forEach(s => {
            statusMap.set(s.label, { phase: s.phase, temperature: s.temperature });
        });

        const currentPipelineDeals = leads.filter(l => {
            const statusInfo = statusMap.get(l.status);
            const isClosing = statusInfo?.phase === 'closing';
            // neededPipelineDeals counts leads that are Closing OR Hot
            const isHot = statusInfo?.temperature === 'Hot';
            return isClosing || isHot;
        }).length;

        const isHealthy = currentPipelineDeals >= neededPipelineDeals;
        const shortfall = neededPipelineDeals - currentPipelineDeals;
        const percentage = neededPipelineDeals > 0
            ? Math.min(100, Math.round((currentPipelineDeals / neededPipelineDeals) * 100))
            : 100;

        return {
            neededPipelineDeals,
            currentPipelineDeals,
            isHealthy,
            shortfall,
            percentage
        };
    }, [leads, settings]);

    if (!health) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-help transition-colors",
                        health.isHealthy
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                    )}>
                        {health.isHealthy ? (
                            <CheckCircle2 size={14} />
                        ) : (
                            <AlertCircle size={14} />
                        )}
                        <span className="hidden sm:inline">
                            {health.isHealthy ? "Pipeline Healthy" : `${health.shortfall} Deals Needed`}
                        </span>
                        <span className="sm:hidden">
                            {health.percentage}%
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="dark:bg-[#1a1a1a] dark:border-white/10 p-4 max-w-xs shadow-2xl">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                            {health.isHealthy ? <TrendingUp className="text-emerald-500" size={16} /> : <TrendingDown className="text-red-500" size={16} />}
                            <span className="font-semibold text-white">Pipeline Strategy</span>
                        </div>

                        <div className="space-y-3 text-sm leading-relaxed">
                            <p className="text-gray-300">
                                You want to close <span className="text-white font-bold">{health.neededPipelineDeals} deals</span> this month.
                            </p>
                            <p className="text-gray-300">
                                From your total leads, <span className="text-white font-bold">{health.currentPipelineDeals}</span> are in the <span className="text-orange-400 font-semibold">Closing (Hot)</span> stage.
                            </p>
                            <p className="text-gray-300">
                                That represents <span className={cn("font-bold", health.isHealthy ? "text-emerald-400" : "text-red-400")}>{health.percentage}%</span> of your goal.
                            </p>

                            {!health.isHealthy ? (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-300 text-xs">
                                        You still need <span className="text-white font-bold">{health.shortfall} more</span> to hit your goal.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <p className="text-emerald-300 text-xs">
                                        You are on track to hit your goal! Keep it up.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
