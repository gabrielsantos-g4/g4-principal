export interface CSVRow {
    'Start Date': string;
    'End Date': string;
    'Campaign Name': string;
    'Ad Name': string;
    'Impressions': number;
    'Clicks': number;
    'Spend': number; // Usually in currency
    'Total Conversions': number;
    'Total Conversion Value': number;
    // Add other fields as necessary from the CSV analysis
    // e.g., 'Currency Code', 'Ad ID', 'Campaign ID'
}

export interface AggregatedData {
    overall: {
        totalSpend: number;
        totalImpressions: number;
        totalClicks: number;
        ctr: number;
        cpc: number;
        ecpm: number;
    };
    campaigns: Record<string, {
        name: string;
        impressions: number;
        clicks: number;
        spend: number;
        ctr: number;
        cpc: number;
    }>;
    ads: Array<{
        name: string;
        campaign: string;
        impressions: number;
        clicks: number;
        spend: number;
        ctr: number;
        category: 'scale' | 'monitor' | 'pause';
    }>;
}

export function processCSVData(data: any[]): AggregatedData {
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    const campaignMap: Record<string, any> = {};
    const adList: any[] = [];

    data.forEach(row => {
        // Smarter number parsing
        const parseNumber = (val: any) => {
            if (typeof val === 'number') return val;
            if (!val || typeof val !== 'string') return 0;

            let clean = val.trim();
            // Check if it's already a clean number
            if (/^-?\d+(\.\d+)?$/.test(clean)) return parseFloat(clean);

            // Heuristic for comma vs dot
            const hasComma = clean.includes(',');
            const hasDot = clean.includes('.');

            if (hasComma && hasDot) {
                // Determine which is decimal
                const lastComma = clean.lastIndexOf(',');
                const lastDot = clean.lastIndexOf('.');
                if (lastComma > lastDot) {
                    // Euro style: 1.234,56 -> remove dots, replace comma
                    clean = clean.replace(/\./g, '').replace(',', '.');
                } else {
                    // US style: 1,234.56 -> remove commas
                    clean = clean.replace(/,/g, '');
                }
            } else if (hasComma) {
                // If contains only commas, assume decimal if it looks like XX,XX (2 decimals)
                // But could be 1,000 (thousand). 
                // Ambiguous. Usually safer to remove currency symbols first.

                // Let's strip currency first
                clean = clean.replace(/[^0-9,.-]/g, '');

                // Re-check format after stripping
                if (clean.includes(',') && !clean.includes('.')) {
                    // 1,234 or 12,34?
                    // If matches \d+,\d{2}$ -> likely decimal
                    if (/,\d{2}$/.test(clean)) {
                        clean = clean.replace(',', '.');
                    } else {
                        clean = clean.replace(/,/g, '');
                    }
                }
            } else {
                // Only dashes or text?
                clean = clean.replace(/[^0-9.-]/g, '');
            }

            // Final cleanup just in case
            clean = clean.replace(/[^0-9.-]/g, '');
            return parseFloat(clean) || 0;
        };

        const keys = Object.keys(row);
        // Find key respecting priority of search terms
        const findKey = (search: string[], exclude?: string[]) => {
            for (const term of search) {
                const found = keys.find(k => k.toLowerCase().includes(term.toLowerCase()) &&
                    (!exclude || !exclude.some(e => k.toLowerCase().includes(e.toLowerCase()))));
                if (found) return found;
            }
            return undefined;
        };

        const impressionsKey = findKey(['Impressions', 'Views']);
        const clicksKey = findKey(['Clicks']);
        const spendKey = findKey(['Total Spend', 'Amount Spent', 'Cost', 'Spend']);
        const campaignKey = findKey(['Campaign Name', 'Campaign'], ['ID']); // Prioritize Name, exclude ID if searching generic 'Campaign'
        const adKey = findKey(['Ad Name', 'Ad Content', 'Creative Name']);

        const impressions = impressionsKey ? parseNumber(row[impressionsKey]) : 0;
        const clicks = clicksKey ? parseNumber(row[clicksKey]) : 0;
        const spend = spendKey ? parseNumber(row[spendKey]) : 0;
        const campaignName = (campaignKey ? row[campaignKey] : 'Unknown Campaign') as string;
        const adName = (adKey ? row[adKey] : 'Unknown Ad') as string;

        totalSpend += spend;
        totalImpressions += impressions;
        totalClicks += clicks;

        // Aggregate Campaigns
        if (!campaignMap[campaignName]) {
            campaignMap[campaignName] = {
                name: campaignName,
                impressions: 0,
                clicks: 0,
                spend: 0,
                ctr: 0,
                cpc: 0
            };
        }
        campaignMap[campaignName].impressions += impressions;
        campaignMap[campaignName].clicks += clicks;
        campaignMap[campaignName].spend += spend;

        // Collect Ad Data (assuming rows are unique ads or granular enough)
        // If ads appear multiple times (e.g. by date), we might need to aggregate ads too.
        // For now, let's look for existing ad entry to aggregate
        const existingAd = adList.find(a => a.name === adName && a.campaign === campaignName);
        if (existingAd) {
            existingAd.impressions += impressions;
            existingAd.clicks += clicks;
            existingAd.spend += spend;
        } else {
            adList.push({
                name: adName,
                campaign: campaignName,
                impressions,
                clicks,
                spend,
                ctr: 0,
                category: 'monitor'
            });
        }
    });

    // Calculate Derived Metrics for Campaigns
    Object.values(campaignMap).forEach(camp => {
        camp.ctr = camp.impressions > 0 ? (camp.clicks / camp.impressions) * 100 : 0;
        camp.cpc = camp.clicks > 0 ? (camp.spend / camp.clicks) : 0;
    });

    // Calculate Derived Metrics for Ads and Categorize
    adList.forEach(ad => {
        ad.ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;

        // Categorization logic based on original benchmarks
        if (ad.ctr > 0.55) ad.category = 'scale';
        else if (ad.ctr < 0.45) ad.category = 'pause';
        else ad.category = 'monitor';
    });

    // Sort ads by CTR descending
    adList.sort((a, b) => b.ctr - a.ctr);

    return {
        overall: {
            totalSpend,
            totalImpressions,
            totalClicks,
            ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
            cpc: totalClicks > 0 ? (totalSpend / totalClicks) : 0,
            ecpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
        },
        campaigns: campaignMap,
        ads: adList
    };
}
