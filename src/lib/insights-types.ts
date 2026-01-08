import { AdsReportData } from './report-types';

export interface AdsInsightsWrapper {
    insights: AdsInsightItem[];
}

export interface AdsInsightItem {
    schema_version: string;
    generated_at_iso: string;
    output_language: string;
    analysis: InsightAnalysis;
}

export interface InsightAnalysis {
    executive_summary: string;
    priority_actions: InsightPriorityAction[];
    warnings: string[];
    kpis: InsightKPIs;
    top_entities: InsightTopEntities;
    data_quality: InsightDataQuality;
}

export interface InsightPriorityAction {
    severity: 'high' | 'medium' | 'low';
    action_type: 'scale' | 'pause' | 'monitor' | 'fix_creative' | 'investigate';
    title: string;
    why: string;
    supporting_stats: string;
    evidence_paths: string[];
}

export interface InsightKPIs {
    spend: number | null;
    impressions: number | null;
    clicks: number | null;
    ctr: number | null;
    avg_cpc: number | null;
    avg_cpm: number | null;
}

export interface InsightTopEntities {
    top_campaigns_by_spend: {
        campaign_name: string;
        group_name: string;
        spent: number;
        ctr_percent: number;
        cpc: number;
    }[];
    top_ads_by_ctr: {
        creative_name: string;
        campaign_name: string;
        group_name: string;
        ctr_percent: number;
        spent: number;
    }[];
}

export interface InsightDataQuality {
    issues: {
        severity: 'high' | 'medium' | 'low';
        code: string;
        description: string;
        evidence_paths: string[];
    }[];
}
