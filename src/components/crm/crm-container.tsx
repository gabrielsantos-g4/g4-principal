"use client";

import { useState } from "react";
import { CrmStats } from "@/components/crm/crm-stats";
import { CrmFilters } from "@/components/crm/crm-filters";
import { CrmTable } from "@/components/crm/crm-table";
import { CrmSettings } from "@/actions/crm/get-crm-settings";

export interface CrmFilterState {
    tab: 'active' | 'earned' | 'lost';
    searchName: string;
    searchCompany: string;
    searchPhone: string;
    date: Date | undefined;
    product: string;
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

export function CrmContainer({ initialLeads, stats, settings }: CrmContainerProps) {
    const [filters, setFilters] = useState<CrmFilterState>({
        tab: 'active',
        searchName: '',
        searchCompany: '',
        searchPhone: '',
        date: undefined,
        product: '',
        status: '',
        source: '',
        responsible: '',
        customField: ''
    });

    return (
        <div className="flex flex-col gap-6">
            <CrmStats stats={stats} />
            <CrmFilters
                settings={settings}
                filters={filters}
                setFilters={setFilters}
            />
            <CrmTable
                initialLeads={initialLeads}
                settings={settings}
                filters={filters}
            />
        </div>
    );
}
