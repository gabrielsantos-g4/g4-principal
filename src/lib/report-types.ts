export interface AdsReportKPI {
    total_spent: number | null;
    total_impressions: number | null;
    total_clicks: number | null;
    ctr_percent: number | null;
    avg_cpc: number | null;
    avg_cpm: number | null;
}

export interface CampaignData {
    campaign_name: string;
    group_name: string;
    spent: number | null;
    impressions: number | null;
    clicks: number | null;
    cpc: number | null;
    ctr_percent: number | null;
}

export interface AdPerformance {
    creative_name: string;
    campaign_name: string;
    impressions: number | null;
    clicks: number | null;
    ctr_percent: number | null;
    spent: number | null;
    status_bucket: 'scale' | 'monitor' | 'pause';
}

export interface PriorityAction {
    severity: 'high' | 'medium' | 'low';
    title: string;
    why: string;
    action_type: 'scale' | 'pause' | 'monitor'; // Added based on JSON
    supporting_stats: string | null; // Changed to string
}

export interface MonthlyOverview {
    spent: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
}

export interface MonthlyTrendData {
    month: string;
    timestamp: number;
    overview: MonthlyOverview;
    groups_breakdown: Record<string, number>;
    groups_breakdown_impressions?: Record<string, number>;
    groups_breakdown_clicks?: Record<string, number>;
}

export interface AdsReportData {
    meta: {
        row_count: number;
        currency: string | null;
        date_generated: string | null;
        start_date?: string | null;
        end_date?: string | null;
    };
    overview: AdsReportKPI;
    monthly_trends?: MonthlyTrendData[];
    campaigns: {
        overview_by_campaign: CampaignData[];
    };
    ads: {
        by_ctr_ranked: AdPerformance[];
    };
    insights: {
        executive_summary: string;
        priority_actions: PriorityAction[];
        warnings: string[];
    };
}
