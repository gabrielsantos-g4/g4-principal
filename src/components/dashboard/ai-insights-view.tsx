import { AlertTriangle, TrendingUp, Info, AlertCircle, PlayCircle, PauseCircle, MousePointer, Search, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdsInsightItem, InsightPriorityAction } from '@/lib/insights-types';
import { cn } from "@/lib/utils";

interface AiInsightsViewProps {
    data: AdsInsightItem;
}

export function AiInsightsView({ data }: AiInsightsViewProps) {
    const { analysis } = data;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center gap-2">
                        <span className="text-slate-50">✨</span> AI Performance Analysis
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Generated on {new Date(data.generated_at_iso).toLocaleString()}
                    </p>
                </div>
                <Badge variant="outline" className="px-3 py-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                    {data.output_language === 'pt-br' ? 'Português' : 'English'}
                </Badge>
            </div>

            {/* Executive Summary */}
            <Card className="border-l-4 border-l-indigo-500 shadow-sm bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
                        <Info className="w-5 h-5 text-indigo-500" />
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base text-slate-400 leading-relaxed">
                        {analysis.executive_summary}
                    </p>
                </CardContent>
            </Card>

            <Tabs defaultValue="actions" className="w-full">
                <TabsList className="bg-slate-900 border-slate-800 grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="actions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 text-slate-400">Priorities</TabsTrigger>
                    <TabsTrigger value="warnings" className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 text-slate-400">Warnings</TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 text-slate-400">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="actions" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {analysis.priority_actions.map((action, i) => (
                            <ActionCard key={i} action={action} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="warnings" className="space-y-4 mt-4">
                    {analysis.warnings.length > 0 ? (
                        <Card className="border-red-900/50 bg-red-950/10 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-red-400 flex items-center gap-2 text-lg">
                                    <AlertTriangle className="w-5 h-5" />
                                    Detected Anomalies
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {analysis.warnings.map((warning, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-950 rounded-md border border-red-900/30 shadow-sm">
                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-300">{warning}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                            No warnings detected. great job!
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Top Campaigns */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-base text-slate-200">Top Campaigns by Spend</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.top_entities.top_campaigns_by_spend.map((c, i) => (
                                    <div key={i} className="flex justify-between items-start text-sm border-b border-slate-800 last:border-0 pb-2 last:pb-0">
                                        <div>
                                            <div className="font-medium text-slate-300 line-clamp-1" title={c.campaign_name}>
                                                {c.campaign_name}
                                            </div>
                                            <div className="text-xs text-slate-500">{c.group_name}</div>
                                        </div>
                                        <div className="text-right whitespace-nowrap ml-4">
                                            <div className="font-bold text-slate-200">${c.spent.toLocaleString()}</div>
                                            <div className="text-xs text-slate-500">CPC ${c.cpc}</div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Top Ads */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-base text-slate-200">Top Ads by CTR</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.top_entities.top_ads_by_ctr.map((ad, i) => (
                                    <div key={i} className="flex justify-between items-start text-sm border-b border-slate-800 last:border-0 pb-2 last:pb-0">
                                        <div>
                                            <div className="font-medium text-slate-300 line-clamp-1 text-xs uppercase tracking-wide">
                                                {ad.campaign_name.replace('FY25 - ', '').split('-')[0]}...
                                            </div>
                                            <div className="text-xs text-slate-500 italic">"{ad.creative_name}"</div>
                                        </div>
                                        <div className="text-right whitespace-nowrap ml-4">
                                            <div className="font-bold text-emerald-400">{(ad.ctr_percent * 100).toFixed(2)}% CTR</div>
                                            <div className="text-xs text-slate-500">${ad.spent.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ActionCard({ action }: { action: InsightPriorityAction }) {
    const severityColor = {
        high: "border-red-500 shadow-red-500/10",
        medium: "border-amber-500 shadow-amber-500/10",
        low: "border-blue-500 shadow-blue-500/10"
    };

    return (
        <Card className={cn("bg-slate-900 border-slate-800 border-t-4 shadow-sm hover:shadow-md transition-shadow", severityColor[action.severity])}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 uppercase text-[10px] font-bold tracking-wider hover:bg-slate-700">
                        {action.action_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={cn(
                        "text-[10px] font-bold border",
                        action.severity === 'high' ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" :
                            action.severity === 'medium' ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30" :
                                "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                    )}>
                        {action.severity} Priority
                    </Badge>
                </div>
                <CardTitle className="text-base leading-snug font-semibold text-slate-200">
                    {action.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-slate-400 mb-3 line-clamp-3" title={action.why}>
                    {action.why}
                </div>
                {action.supporting_stats && (
                    <div className="bg-slate-950 p-2 rounded text-xs text-mono text-slate-500 border border-slate-800 font-mono">
                        {action.supporting_stats}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
