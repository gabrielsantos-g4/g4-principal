"use client";

import { useMemo, useState } from "react";

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
    contactFilter: 'overdue' | 'today' | 'tomorrow' | null;
    qualification: string;
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
        customField: '',
        contactFilter: null,
        qualification: ''
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
        amount: l.amount ? parseFloat(l.amount.toString().replace(/[^0-9.-]+/g, "")) : 0,
        qualification_status: l.qualification_status?.toLowerCase() // Normalize to lowercase
    })), [initialLeads]);

    // 2. Base Filter (Everything EXCEPT Qualification) - Used for Stats
    const baseFilteredLeads = useMemo(() => {
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

            // Contact Filter (Overdue/Today/Tomorrow)
            if (filters.contactFilter) {
                const nextStepDate = parseDateStr(lead.nextStep?.date);
                // Ensure valid date
                if (nextStepDate.getTime() >= 8640000000000000) return false;

                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const dayAfterTomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

                if (filters.contactFilter === 'overdue') {
                    if (nextStepDate >= todayStart) return false;
                } else if (filters.contactFilter === 'today') {
                    if (nextStepDate < todayStart || nextStepDate >= tomorrowStart) return false;
                } else if (filters.contactFilter === 'tomorrow') {
                    if (nextStepDate < tomorrowStart || nextStepDate >= dayAfterTomorrowStart) return false;
                }
            }

            return true;
        });
    }, [transformedLeads, filters]);

    // 3. Final Filter (Base + Qualification) - Used for Table
    const finalFilteredLeads = useMemo(() => {
        if (!filters.qualification) return baseFilteredLeads;
        return baseFilteredLeads.filter(lead => lead.qualification_status === filters.qualification);
    }, [baseFilteredLeads, filters.qualification]);

    // 4. Calculate Header Stats (Based on Base Filters)
    const headerStats = useMemo(() => {
        let pipelineValue = 0;
        let overdue = 0;
        let today = 0;
        let tomorrow = 0;
        let mql = 0;
        let sql = 0;
        let not_qualified = 0;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const dayAfterTomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

        baseFilteredLeads.forEach(lead => {
            pipelineValue += lead.amount || 0;

            const nextStepDate = parseDateStr(lead.nextStep?.date);
            // Check if date is valid and not "Pending" (max safe integer)
            if (nextStepDate.getTime() < 8640000000000000) {
                if (nextStepDate < todayStart) {
                    overdue++;
                } else if (nextStepDate >= todayStart && nextStepDate < tomorrowStart) {
                    today++;
                } else if (nextStepDate >= tomorrowStart && nextStepDate < dayAfterTomorrowStart) {
                    tomorrow++;
                }
            }

            // Qualification Stats
            if (lead.qualification_status === 'mql') mql++;
            else if (lead.qualification_status === 'sql') sql++;
            else if (lead.qualification_status === 'nq') not_qualified++;
        });

        return {
            totalLeads: baseFilteredLeads.length,
            pipelineValue,
            qualification: { mql, sql, not_qualified },
            contacts: { overdue, today, tomorrow }
        };
    }, [baseFilteredLeads]);


    return (
        <div className="flex flex-col gap-4 h-full min-h-0 flex-1">
            <CrmFilters
                settings={settings}
                filters={filters}
                setFilters={setFilters}
                leads={transformedLeads}
                headerStats={headerStats}
            />
            <CrmTable
                initialLeads={initialLeads}
                settings={settings}
                filters={filters}
            />
        </div>
    );
}
