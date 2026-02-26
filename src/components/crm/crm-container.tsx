"use client";

import { useMemo, useState } from "react";

import { CrmFilters } from "@/components/crm/crm-filters";
import { CrmTable } from "@/components/crm/crm-table";
import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { format } from "date-fns";

export interface CrmFilterState {
    tab: 'active' | 'earned' | 'lost';
    searchGlobal: string; // Global search across name, company, phone
    searchName: string;
    searchCompany: string;
    searchPhone: string;
    dateRange: { from: Date | undefined; to: Date | undefined } | undefined;
    createdAtRange: { from: Date | undefined; to: Date | undefined } | undefined;
    product: string[];
    status: string[];
    source: string[];
    responsible: string[];
    customField: string[];
    contactFilter: 'overdue' | 'today' | 'tomorrow' | 'pending' | null;
    qualification: string;
}

interface CrmContainerProps {
    initialLeads: any[];
    stats: any;
    settings: CrmSettings;
    viewerProfile?: any;
}

// Helper to parse dates consistently with CrmTable
function parseDateStr(str: string): Date {
    if (!str || str === "Pending") return new Date(8640000000000000); // Max safe integer

    // FIX: Handle YYYY-MM-DD explicitly as local date to prevent UTC timezone shift
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                return new Date(year, month, day);
            }
        }
    }

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

export function CrmContainer({ initialLeads, stats: initialStats, settings, viewerProfile }: CrmContainerProps) {
    const [filters, setFilters] = useState<CrmFilterState>({
        tab: 'active',
        searchGlobal: '',
        searchName: '',
        searchCompany: '',
        searchPhone: '',
        dateRange: undefined,
        createdAtRange: undefined,
        product: [],
        status: [],
        source: [],
        responsible: [],
        customField: [],
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
        qualification_status: l.qualification_status?.toLowerCase(),
        conversation_channel: l.conversation_channel || "WhatsApp",
        // Add missing fields for CrmTable
        history: Array.isArray(l.history_log) ? l.history_log.map((h: any) => ({
            ...h,
            date: h.date ? new Date(h.date) : new Date()
        })) : [],
        date: l.created_at || new Date().toISOString()
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

            // Text Search - Global search (OR logic)
            if (filters.searchGlobal) {
                const searchLower = filters.searchGlobal.toLowerCase();
                const matchesName = lead.name.toLowerCase().includes(searchLower);
                const matchesCompany = lead.company?.toLowerCase().includes(searchLower);
                const matchesPhone = lead.phone?.toLowerCase().includes(searchLower);
                if (!matchesName && !matchesCompany && !matchesPhone) return false;
            }

            // Individual searches (AND logic - kept for backward compatibility)
            if (filters.searchName && !lead.name.toLowerCase().includes(filters.searchName.toLowerCase())) return false;
            if (filters.searchCompany && !lead.company?.toLowerCase().includes(filters.searchCompany.toLowerCase())) return false;
            if (filters.searchPhone && !lead.phone?.toLowerCase().includes(filters.searchPhone.toLowerCase())) return false;

            // Product Filter
            if (filters.product?.length > 0) {
                let leadProducts: string[] = [];
                try {
                    // Handle JSON array string or simple string
                    if (lead.product.startsWith('[')) {
                        leadProducts = JSON.parse(lead.product);
                    } else if (lead.product) {
                        leadProducts = [lead.product];
                    }
                } catch (e) {
                    leadProducts = lead.product ? [lead.product] : [];
                }

                // Check if lead has ANY of the selected products
                const hasMatch = leadProducts.some(p => filters.product.includes(p));
                if (!hasMatch) return false;
            }

            // Custom Field Filter
            if (filters.customField?.length > 0 && !filters.customField.includes(lead.custom)) return false;

            // Source Filter
            if (filters.source?.length > 0 && !filters.source.includes(lead.source)) return false;

            // Status Filter
            if (filters.status?.length > 0) {
                // Normalize both values for comparison (trim whitespace)
                const leadStatus = (lead.status || '').trim();
                if (!filters.status.some((st: string) => st.trim() === leadStatus)) return false;
            }

            // Responsible Filter
            if (filters.responsible?.length > 0 && !filters.responsible.includes(lead.responsible)) return false;

            // Date Range Filter
            if (filters.dateRange?.from || filters.dateRange?.to) {
                const nextStepDate = parseDateStr(lead.nextStep?.date);
                // Ensure valid date
                if (nextStepDate.getTime() >= 8640000000000000) return false;

                const checkDate = new Date(nextStepDate.getFullYear(), nextStepDate.getMonth(), nextStepDate.getDate());

                if (filters.dateRange.from) {
                    const fromDate = new Date(filters.dateRange.from);
                    fromDate.setHours(0, 0, 0, 0);
                    if (checkDate < fromDate) return false;
                }

                if (filters.dateRange.to) {
                    const toDate = new Date(filters.dateRange.to);
                    toDate.setHours(0, 0, 0, 0);
                    if (checkDate > toDate) return false;
                }
            }

            // Created At Range Filter
            if (filters.createdAtRange?.from || filters.createdAtRange?.to) {
                const createdDate = lead.date ? new Date(lead.date) : null;
                if (!createdDate) return false;

                const checkDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

                if (filters.createdAtRange.from) {
                    const fromDate = new Date(filters.createdAtRange.from);
                    fromDate.setHours(0, 0, 0, 0);
                    if (checkDate < fromDate) return false;
                }

                if (filters.createdAtRange.to) {
                    const toDate = new Date(filters.createdAtRange.to);
                    toDate.setHours(0, 0, 0, 0);
                    if (checkDate > toDate) return false;
                }
            }

            // Contact Filter checking was removed from here so headerStats can see all applicable leads

            return true;
        });
    }, [transformedLeads, filters]);

    // 3. Final Filter (Base + Qualification + Contact Date) - Used for Table
    const finalFilteredLeads = useMemo(() => {
        let leads = baseFilteredLeads;

        // Apply Qualification
        if (filters.qualification) {
            if (filters.qualification === 'untagged') {
                leads = leads.filter(lead => !lead.qualification_status || !['mql', 'sql', 'nq'].includes(lead.qualification_status));
            } else {
                leads = leads.filter(lead => lead.qualification_status === filters.qualification);
            }
        }

        // Apply Contact Filter
        if (filters.contactFilter) {
            leads = leads.filter(lead => {
                const nextStepDate = parseDateStr(lead.nextStep?.date);
                if (nextStepDate.getTime() >= 8640000000000000) return false;

                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const dayAfterTomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

                if (filters.contactFilter === 'overdue') {
                    return nextStepDate < todayStart;
                } else if (filters.contactFilter === 'today') {
                    return nextStepDate >= todayStart && nextStepDate < tomorrowStart;
                } else if (filters.contactFilter === 'tomorrow') {
                    return nextStepDate >= tomorrowStart && nextStepDate < dayAfterTomorrowStart;
                } else if (filters.contactFilter === 'pending') {
                    return lead.nextStep?.date === "Pending" || !lead.nextStep?.date;
                }
                return true;
            });
        }

        return leads;
    }, [baseFilteredLeads, filters.qualification, filters.contactFilter]);

    // 4. Calculate Header Stats (Based on Base Filters)
    const headerStats = useMemo(() => {
        let pipelineValue = 0;
        let overdue = 0;
        let today = 0;
        let tomorrow = 0;
        let pending = 0;
        let mql = 0;
        let sql = 0;
        let not_qualified = 0;
        let untagged = 0;

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
            } else {
                pending++;
            }

            // Qualification Stats
            if (lead.qualification_status === 'mql') mql++;
            else if (lead.qualification_status === 'sql') sql++;
            else if (lead.qualification_status === 'nq') not_qualified++;
            else untagged++;
        });

        return {
            totalLeads: baseFilteredLeads.length,
            pipelineValue,
            qualification: { mql, sql, not_qualified, untagged },
            contacts: { overdue, today, tomorrow, pending }
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
                viewerProfile={viewerProfile}
            />
            <CrmTable
                initialLeads={[]} // Deprecated/Unused
                filteredLeads={finalFilteredLeads}
                settings={settings}
                filters={filters}
            />
        </div>
    );
}
