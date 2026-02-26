'use server'

import { getPlatformConfig } from './paid-social-config-actions'

/**
 * Interface for LinkedIn Ad Analytics response
 * This follows the standard LinkedIn Ads API structure for ad analytics.
 */
interface LinkedInAnalyticsRow {
    pivotValue: string
    impressions: number
    clicks: number
    costInLocalCurrency: number
    externalWebsiteConversions?: number
}

export async function fetchLinkedInMetrics() {
    try {
        const configResult = await getPlatformConfig('linkedin')

        if (!configResult.success || !configResult.data) {
            return { success: false, error: 'LinkedIn configuration not found' }
        }

        const { access_token, ad_account_id } = configResult.data.config

        if (!access_token || !ad_account_id) {
            return { success: false, error: 'Missing LinkedIn credentials' }
        }

        // Standard LinkedIn Ads API endpoint for analytics
        // Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting
        const today = new Date()
        const url = new URL('https://api.linkedin.com/rest/adAnalytics')
        url.searchParams.append('q', 'analytics')
        url.searchParams.append('pivot', 'CAMPAIGN')
        url.searchParams.append('dateRange.start.day', '1')
        url.searchParams.append('dateRange.start.month', '1')
        url.searchParams.append('dateRange.start.year', '2024')
        url.searchParams.append('dateRange.end.day', today.getDate().toString())
        url.searchParams.append('dateRange.end.month', (today.getMonth() + 1).toString())
        url.searchParams.append('dateRange.end.year', today.getFullYear().toString())
        url.searchParams.append('accounts', `List(urn:li:sponsoredAccount:${ad_account_id})`)
        url.searchParams.append('fields', 'pivotValue,impressions,clicks,costInLocalCurrency,externalWebsiteConversions')

        console.log(`Fetching LinkedIn metrics for account ${ad_account_id} with URL: ${url.toString()}`)

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'LinkedIn-Version': '202401',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('LinkedIn API Error:', errorData)
            return { success: false, error: errorData.message || 'Failed to fetch LinkedIn data' }
        }

        const data = await response.json()
        console.log('LinkedIn API Response Data:', JSON.stringify(data, null, 2))
        const rows: LinkedInAnalyticsRow[] = data.elements || []

        // Transform LinkedIn data to the dashboard format
        // We calculate totals and format the performance series
        const transformedData = {
            metrics: {
                spend: rows.reduce((acc, row) => acc + (row.costInLocalCurrency || 0), 0),
                impressions: rows.reduce((acc, row) => acc + (row.impressions || 0), 0),
                clicks: rows.reduce((acc, row) => acc + (row.clicks || 0), 0),
                conversions: rows.reduce((acc, row) => acc + (row.externalWebsiteConversions || 0), 0),
                roas: 0,
                cpa: 0
            },
            // Note: In a real scenario, we'd fetch daily/weekly breakdown. 
            // For this MVP, we provide a synthetic series based on totals for visualization.
            performance: [
                { date: 'Initial', spend: 0, roas: 0, conversions: 0 },
                ...rows.map((row, i) => ({
                    date: `Campaign ${i + 1}`,
                    spend: row.costInLocalCurrency || 0,
                    roas: (row.costInLocalCurrency > 0) ? (row.externalWebsiteConversions || 0) / row.costInLocalCurrency : 0,
                    conversions: row.externalWebsiteConversions || 0
                }))
            ]
        }

        // Add derived metrics
        const totalSpend = transformedData.metrics.spend
        transformedData.metrics.roas = totalSpend > 0 ? transformedData.metrics.conversions / (totalSpend / 100) : 0 // Simplified mock ROAS mapping
        transformedData.metrics.cpa = transformedData.metrics.conversions > 0 ? totalSpend / transformedData.metrics.conversions : 0

        return { success: true, data: transformedData }

    } catch (error: any) {
        console.error('Unexpected error fetching LinkedIn data:', error)
        return { success: false, error: error.message }
    }
}
