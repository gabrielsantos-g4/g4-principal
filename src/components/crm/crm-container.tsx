"use client";

import { useMemo, useState } from "react";
import { CrmStats } from "@/components/crm/crm-stats";
import { CrmFilters } from "@/components/crm/crm-filters";
import { CrmTable } from "@/components/crm/crm-table";
import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { format } from "date-fns";

export interface CrmFilterState {
    tab: 'active' | 'earned' | 'lost';
    searchName: string;
    searchCompany: string;
    searchPhone: string;
    date: Date | undefined;
    product: string[];
    status: string;
    source: string;
    responsible: string;
    customField: string;
}

interface CrmContainerProps {
    initialLeads: any[];
    stats: any;
    settings: CrmSettings;
}

// Helper to parse dates consistently with CrmTable
function parseDateStr(str: string): Date {
    if (!str || str === "Pending") return new Date(8640000000000000); // Max safe integer

    const isoDate = new Date(str);
    if (!isNaN(isoDate.getTime()) && str.includes('-')) {
        return isoDate;
    }

    try {
        const parts = str.split(',');
        if (parts.length < 2) return new Date();

        const dateParts = parts[1].trim().split('/');
        if (dateParts.length < 2) return new Date();

        const day = parseInt(dateParts[0], 10);
        const monthStr = dateParts[1];
        const months: Record<string, number> = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const month = months[monthStr] ?? 0;
        const year = new Date().getFullYear();
        return new Date(year, month, day);
    } catch (e) {
        return new Date();
    }
}

export function CrmContainer({ initialLeads, stats: initialStats, settings }: CrmContainerProps) {
    const [filters, setFilters] = useState<CrmFilterState>({
        tab: 'active',
        searchName: '',
        searchCompany: '',
        searchPhone: '',
        date: undefined,
        product: [],
        status: '',
        source: '',
        responsible: '',
        customField: ''
    });

    // 1. Transform Leads (Mirroring CrmTable logic for consistency)
    const transformedLeads = useMemo(() => initialLeads.map(l => ({
        ...l,
        product: l.product || "",
        status: l.status || "New",
        source: l.source || "",
        custom: l.custom_field || "",
        responsible: l.responsible || "",
        nextStep: l.next_step || { date: "Pending", progress: 0, total: 6 },
        amount: l.amount ? parseFloat(l.amount.toString().replace(/[^0-9.-]+/g, "")) : 0
    })), [initialLeads]);

    // 2. Filter Leads
    const filteredLeads = useMemo(() => {
        return transformedLeads.filter(lead => {
            // Tab Filter
            if (filters.tab === 'active') {
                if (lead.status === 'Won' || lead.status === 'Lost') return false;
            } else if (filters.tab === 'earned') {
                if (lead.status !== 'Won') return false;
            } else if (filters.tab === 'lost') {
                if (lead.status !== 'Lost') return false;
            }

            // Text Search
            if (filters.searchName && !lead.name.toLowerCase().includes(filters.searchName.toLowerCase())) return false;
            if (filters.searchCompany && !lead.company?.toLowerCase().includes(filters.searchCompany.toLowerCase())) return false;
            if (filters.searchPhone && !lead.phone?.toLowerCase().includes(filters.searchPhone.toLowerCase())) return false;

            // Product Filter
            if (filters.product?.length > 0 && !filters.product.includes(lead.product)) return false;

            // Custom Field Filter
            if (filters.customField && lead.custom !== filters.customField) return false;

            // Source Filter
            if (filters.source && lead.source !== filters.source) return false;

            // Status Filter
            if (filters.status && lead.status !== filters.status) return false;

            // Responsible Filter
            if (filters.responsible && lead.responsible !== filters.responsible) return false;

            // Date Filter
            if (filters.date) {
                const filterDateStr = format(filters.date, "EEE, dd/MMM");
                if (lead.nextStep?.date !== filterDateStr) return false;
            }

            return true;
        });
    }, [transformedLeads, filters]);

    // 3. Calculate Dynamic Stats
    const dynamicStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let contacts = 0;
        let pipeline = 0;
        let todayCount = 0;
        let tomorrowCount = 0;
        let overdueCount = 0;

        filteredLeads.forEach(lead => {
            contacts++;
            pipeline += lead.amount || 0;

            const nextStepDate = parseDateStr(lead.nextStep.date);
            // Ignore Pending or far future
            if (nextStepDate.getFullYear() > 3000) return;

            // Check specific dates
            nextStepDate.setHours(0, 0, 0, 0);

            if (nextStepDate.getTime() === today.getTime()) {
                todayCount++;
            } else if (nextStepDate.getTime() === tomorrow.getTime()) {
                tomorrowCount++;
            } else if (nextStepDate < today) {
                overdueCount++;
            }
        });

        return {
            contacts,
            pipeline,
            today: todayCount,
            tomorrow: tomorrowCount,
            overdue: overdueCount
        };
    }, [filteredLeads]);

    return (
        <div className="flex flex-col gap-6 h-full min-h-0 flex-1">
            <CrmStats stats={dynamicStats} />
            <CrmFilters
                settings={settings}
                filters={filters}
                setFilters={setFilters}
                leads={transformedLeads}
            />
            <CrmTable
                initialLeads={initialLeads}
                settings={settings}
                filters={filters}
            />
        </div>
    );
}
