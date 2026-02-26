"use client";

import { useMemo } from "react";
import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineHealthIndicatorProps {
    leads: any[];
    settings: CrmSettings;
    onClick?: () => void;
}

export function PipelineHealthIndicator({ leads, settings, onClick }: PipelineHealthIndicatorProps) {
    const health = useMemo(() => {
        const revenueGoal = settings.revenue_goal || 0;
        const avgTicket = settings.avg_ticket || 0;
        const closeRate = settings.close_rate || 0;

        // If not configured, hide
        if (revenueGoal <= 0 || avgTicket <= 0 || closeRate <= 0) {
            return null;
        }

        // Step 1: Calculate needed customers
        const neededCustomers = Math.ceil(revenueGoal / avgTicket);

        // Step 2: Calculate needed Warm/Hot leads based on conversion rate
        const neededPipelineDeals = Math.ceil(neededCustomers / (closeRate / 100));

        // Map status label to temperature for O(1) lookup
        const statusMap = new Map<string, { phase?: string, temperature?: string }>();
        settings.statuses.forEach(s => {
            statusMap.set(s.label, { phase: s.phase, temperature: s.temperature });
        });

        // Count leads with Warm or Hot temperature
        const currentPipelineDeals = leads.filter(l => {
            const statusInfo = statusMap.get(l.status);
            const temperature = statusInfo?.temperature;
            return temperature === 'Warm' || temperature === 'Hot';
        }).length;

        const isHealthy = currentPipelineDeals >= neededPipelineDeals;
        const shortfall = neededPipelineDeals - currentPipelineDeals;
        const percentage = neededPipelineDeals > 0
            ? Math.min(100, Math.round((currentPipelineDeals / neededPipelineDeals) * 100))
            : 100;

        return {
            neededCustomers,
            neededPipelineDeals,
            currentPipelineDeals,
            isHealthy,
            shortfall,
            percentage,
            closeRate
        };
    }, [leads, settings]);

    if (!health) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onClick}
                        className={cn(
                            "flex items-center justify-center h-8 w-8 relative rounded-md border text-xs font-medium transition-colors cursor-pointer border-white/10 bg-[#1A1A1A] hover:bg-white/5",
                            health.isHealthy ? "text-emerald-500 hover:text-emerald-400" : "text-red-500 hover:text-red-400"
                        )}>
                        <Filter size={16} />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4} className="dark:bg-[#1a1a1a] dark:border-white/10 p-2 shadow-2xl">
                    <div className="flex items-center gap-2">
                        {health.isHealthy ? <TrendingUp className="text-emerald-500" size={14} /> : <TrendingDown className="text-red-500" size={14} />}
                        <span className="text-xs font-semibold text-white">
                            {health.isHealthy ? "Healthy Pipeline" : "Challenging Pipeline"}
                        </span>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
