'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { BarChart3, PieChart, TrendingDown, Target, Award, X, Filter, Users, Tag, Globe, LineChart, Calendar as CalendarIcon, MessageSquare, DollarSign, CalendarClock, AlertTriangle } from "lucide-react"
import { useMemo, useState } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    LabelList,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import { motion } from "framer-motion";
import { format, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay, differenceInDays, isWeekend } from "date-fns";
import { CrmSettings, TagItem } from "@/actions/crm/get-crm-settings";
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface CrmReportsModalProps {
    isOpen: boolean
    onClose: () => void
    leads: Record<string, any>[]
    settings: CrmSettings
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ef4444', '#3b82f6'];

const CustomYAxisTick = ({ x, y, payload, width, ...props }: { x?: number, y?: number, payload?: { value: string | number }, width?: number, [key: string]: any }) => {
    const value = payload?.value ? payload.value.toString() : "";
    const limit = 20; // approximate chars per line
    const words = value.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        if (currentLine.length + words[i].length + 1 <= limit) {
            currentLine += ' ' + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);

    return (
        <g transform={`translate(${x},${y})`}>
            {lines.map((line, index) => (
                <text
                    key={index}
                    x={0}
                    y={0}
                    dy={(index - (lines.length - 1) / 2) * 12 + 4}
                    textAnchor="end"
                    fill="#9ca3af"
                    fontSize={11}
                    {...props}
                >
                    {line}
                </text>
            ))}
        </g>
    );
};

// Helper to parse dates (duplicated from CrmContainer to ensure self-containment or could be utils)
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

export function CrmReportsModal({ isOpen, onClose, leads, settings }: CrmReportsModalProps) {

    // Helper to get consistent color for standard statuses
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return '#3b82f6';
            case 'Won': return '#22c55e';
            case 'Lost': return '#ef4444';
            default: return '#8884d8';
        }
    }

    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date()
    })

    const stats = useMemo(() => {
        // Filter leads by date range first
        const filteredLeads = leads.filter(l => {
            if (!date?.from) return true;

            const leadDateStr = l.created_at || l.date;
            if (!leadDateStr || leadDateStr === 'Pending') return false;

            const leadDate = new Date(leadDateStr);
            const from = startOfDay(date.from);
            const to = date.to ? endOfDay(date.to) : endOfDay(date.from);

            return isWithinInterval(leadDate, { start: from, end: to });
        });

        const total = filteredLeads.length;
        const won = filteredLeads.filter(l => l.status === 'Won').length;
        const lost = filteredLeads.filter(l => l.status === 'Lost').length;
        const winRate = total > 0 ? (won / total) * 100 : 0;

        // --- Status Distribution ---
        const allStatuses = [...(settings.statuses || [])];
        if (!allStatuses.some((s: TagItem) => s.label === 'New')) allStatuses.unshift({ label: 'New', bg: 'bg-blue-500', text: 'New' });
        if (!allStatuses.some((s: TagItem) => s.label === 'Won')) allStatuses.push({ label: 'Won', bg: 'bg-green-500', text: 'Won' });
        if (!allStatuses.some((s: TagItem) => s.label === 'Lost')) allStatuses.push({ label: 'Lost', bg: 'bg-red-500', text: 'Lost' });

        const statusCount: Record<string, number> = {};
        allStatuses.forEach((s: TagItem) => statusCount[s.label] = 0);

        filteredLeads.forEach(l => {
            const s = l.status || 'New';
            statusCount[s] = (statusCount[s] || 0) + 1;
        });

        const statusData = Object.entries(statusCount).map(([name, value]) => ({
            name,
            value,
        }));

        // --- Product Distribution (Explicit Sort) ---
        const allProducts = settings.products || [];
        const productCount: Record<string, number> = {};
        allProducts.forEach((p) => productCount[p.name] = 0);

        filteredLeads.forEach(l => {
            let products: string[] = [];
            try {
                if (l.product && l.product.startsWith('[')) {
                    products = JSON.parse(l.product);
                } else if (l.product) {
                    products = [l.product];
                }
            } catch {
                if (l.product) products = [l.product];
            }
            products.forEach(p => {
                if (p) productCount[p] = (productCount[p] || 0) + 1;
            });
        });
        const productData = Object.entries(productCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Strict descending sort

        // --- Source Distribution ---
        const allSources = settings.sources || [];
        const sourceCount: Record<string, number> = {};
        allSources.forEach((s: string | TagItem) => {
            const label = typeof s === 'string' ? s : s.label;
            sourceCount[label] = 0;
        });
        filteredLeads.forEach(l => {
            if (l.source) sourceCount[l.source] = (sourceCount[l.source] || 0) + 1;
        });
        const sourceData = Object.entries(sourceCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);


        // --- Category Distribution ---
        const allCategories = settings.custom_fields?.options || [];
        const categoryCount: Record<string, number> = {};
        allCategories.forEach((c: string | TagItem) => {
            const label = typeof c === 'string' ? c : c.label;
            categoryCount[label] = 0;
        });
        filteredLeads.forEach(l => {
            const category = l.custom_field || l.custom;
            if (category) categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        const categoryData = Object.entries(categoryCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // --- Responsible (Won / Assigned formula) ---
        const allResponsibles = settings.responsibles || [];
        const respCount: Record<string, { won: number, lost: number, assigned: number }> = {};
        allResponsibles.forEach((r: string | TagItem) => {
            const label = typeof r === 'string' ? r : r.label;
            respCount[label] = { won: 0, lost: 0, assigned: 0 };
        });

        let unassignedAssigned = 0;
        let unassignedWon = 0;
        let unassignedLost = 0;

        filteredLeads.forEach(l => {
            if (l.responsible) {
                if (!respCount[l.responsible]) respCount[l.responsible] = { won: 0, lost: 0, assigned: 0 };
                respCount[l.responsible].assigned++;
                if (l.status === 'Won') respCount[l.responsible].won++;
                else if (l.status === 'Lost') respCount[l.responsible].lost++;
            } else {
                unassignedAssigned++;
                if (l.status === 'Won') unassignedWon++;
                else if (l.status === 'Lost') unassignedLost++;
            }
        });

        const responsibleData = Object.entries(respCount).map(([name, counts]) => {
            const totalClosed = counts.won + counts.lost;
            return {
                name,
                Won: counts.won,
                Lost: counts.lost,
                Assigned: counts.assigned,
                TotalClosed: totalClosed,
                winRate: counts.assigned > 0 ? (counts.won / counts.assigned) * 100 : 0
            };
        }).sort((a, b) => b.Assigned - a.Assigned); // Sort by most assigned leads

        // Add Unassigned row at the end
        responsibleData.push({
            name: 'Unassigned',
            Won: unassignedWon,
            Lost: unassignedLost,
            Assigned: unassignedAssigned,
            TotalClosed: unassignedWon + unassignedLost,
            winRate: unassignedAssigned > 0 ? (unassignedWon / unassignedAssigned) * 100 : 0
        });

        // --- Timeline ---
        const leadsWithDate = filteredLeads.filter(l => (l.created_at || l.date) && (l.created_at || l.date) !== 'Pending');

        // Dynamic timeline interval based on selection
        let intervalStart = startOfMonth(new Date());
        let intervalEnd = endOfMonth(new Date());

        if (date?.from) {
            intervalStart = date.from;
            intervalEnd = date.to || date.from;
        }

        const daysDiff = Math.max(1, differenceInDays(intervalEnd, intervalStart) + 1);
        const avgLeadsPerDay = total > 0 ? (total / daysDiff).toFixed(1) : "0.0";

        const days = eachDayOfInterval({
            start: intervalStart,
            end: intervalEnd
        });
        const timelineData = days.map(day => {
            const count = leadsWithDate.filter(l => isSameDay(new Date(l.created_at || l.date), day)).length;
            return {
                date: day.toISOString(), // Store as ISO string for parsing
                displayDate: format(day, 'MMM dd'),
                commits: count
            };
        });

        // --- Lost Reasons ---
        const lostReasonsCount: Record<string, number> = {};
        filteredLeads.filter(l => l.status === 'Lost' && l.lost_reason).forEach(l => {
            const r = l.lost_reason!;
            lostReasonsCount[r] = (lostReasonsCount[r] || 0) + 1;
        });
        const lostReasonsData = Object.entries(lostReasonsCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
        const mainLostReason = lostReasonsData.length > 0 ? lostReasonsData[0] : null;

        // --- Touchpoint Distribution ---
        const tpCount = {
            'TP 1': 0,
            'TP 2': 0,
            'TP 3': 0,
            'TP 4': 0,
            'Break-up Msg': 0,
            'In Progress': 0
        };

        // --- Engagement Level ---
        const engagementCount = {
            'Initial': 0,      // <= 2 messages
            'Developing': 0,   // 3-5 messages
            'Advanced': 0      // >= 6 messages
        };

        filteredLeads.forEach(l => {
            const p = l.nextStep?.progress || 0;
            if (p === 1) tpCount['TP 1']++;
            else if (p === 2) tpCount['TP 2']++;
            else if (p === 3) tpCount['TP 3']++;
            else if (p === 4) tpCount['TP 4']++;
            else if (p === 5) tpCount['Break-up Msg']++;
            else if (p > 5) {
                tpCount['In Progress']++;

                // Count engagement for In Progress leads
                const msgCount = l.history?.length || 0;
                if (msgCount <= 2) engagementCount['Initial']++;
                else if (msgCount <= 5) engagementCount['Developing']++;
                else engagementCount['Advanced']++;
            }
        });

        const tpData = Object.entries(tpCount)
            .filter(([name]) => name !== 'In Progress')
            .map(([name, value]) => ({ name, value }));

        const engagementData = [
            { name: 'Conversation Starter', value: engagementCount['Initial'] }, // <= 2
            { name: 'Developing Conversation', value: engagementCount['Developing'] }, // 3-5
            { name: 'Advanced Conversation', value: engagementCount['Advanced'] } // >= 6
        ];

        // --- GLOBAL Stats Calculation (Independent of Filters) ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let globalContacts = 0;
        let globalPipeline = 0;
        let globalTodayCount = 0;
        let globalTomorrowCount = 0;
        let globalOverdueCount = 0;
        let globalWon = 0;
        let globalLost = 0;

        leads.forEach(lead => {
            globalContacts++;

            // Parse amount if string
            const amountVal = typeof lead.amount === 'number' ? lead.amount : (lead.amount ? parseFloat(lead.amount.toString().replace(/[^0-9.-]+/g, "")) : 0);
            globalPipeline += amountVal || 0;

            const nextStepDate = parseDateStr(lead.nextStep?.date || lead.next_step?.date);

            // Stats checks
            if (lead.status === 'Won') globalWon++;
            else if (lead.status === 'Lost') globalLost++;

            // Ignore Pending or far future for date-based stats
            if (nextStepDate.getFullYear() > 3000) return;

            // Check specific dates
            const checkDate = new Date(nextStepDate);
            checkDate.setHours(0, 0, 0, 0);

            if (checkDate.getTime() === today.getTime()) {
                globalTodayCount++;
            } else if (checkDate.getTime() === tomorrow.getTime()) {
                globalTomorrowCount++;
            } else if (checkDate < today) {
                globalOverdueCount++;
            }
        });

        const globalWinRate = globalContacts > 0 ? (globalWon / globalContacts) * 100 : 0;

        const globalStats = {
            contacts: globalContacts,
            pipeline: globalPipeline,
            today: globalTodayCount,
            tomorrow: globalTomorrowCount,
            overdue: globalOverdueCount,
            won: globalWon,
            lost: globalLost,
            winRate: globalWinRate
        };

        return {
            total,
            won,
            lost,
            winRate,
            statusData,
            productData,
            sourceData,
            categoryData,
            responsibleData,
            timelineData,
            lostReasonsData,
            mainLostReason,
            tpData,
            engagementData,
            globalStats,
            avgLeadsPerDay
        };
    }, [leads, settings, date]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="bg-[#0f0f0f] border-white/10 text-white w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] sm:max-w-[98vw] flex flex-col p-0 gap-0 overflow-hidden"
            >
                <DialogHeader className="p-6 border-b border-white/5 bg-[#141414]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">Performance Reports</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Comprehensive analysis of your CRM data and performance metrics.
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                                onClick={() => setDate({
                                    from: startOfMonth(new Date()),
                                    to: endOfMonth(new Date()),
                                })}
                            >
                                Clear Filter
                            </Button>
                            <div className="flex items-center gap-2">
                                {/* From Date */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[140px] justify-start text-left font-normal bg-[#0a0a0a] border-white/10 text-white hover:bg-white/5 hover:text-white",
                                                !date?.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? format(date.from, "LLL dd, y") : <span>From</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#0f0f0f] border-white/10 text-white" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={date?.from}
                                            onSelect={(newDate) => setDate(prev => {
                                                if (!prev) return { from: newDate, to: undefined };
                                                return { ...prev, from: newDate };
                                            })}
                                            initialFocus
                                            className="bg-[#0f0f0f] text-white"
                                        />
                                    </PopoverContent>
                                </Popover>

                                {/* To Date */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[140px] justify-start text-left font-normal bg-[#0a0a0a] border-white/10 text-white hover:bg-white/5 hover:text-white",
                                                !date?.to && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.to ? format(date.to, "LLL dd, y") : <span>To</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#0f0f0f] border-white/10 text-white" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={date?.to}
                                            onSelect={(newDate) => setDate(prev => {
                                                if (!prev) return { from: undefined, to: newDate };
                                                return { ...prev, to: newDate };
                                            })}
                                            disabled={(d) => date?.from ? d < date.from : false}
                                            initialFocus
                                            className="bg-[#0f0f0f] text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#0a0a0a]">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-6 w-full max-w-full"
                    >
                        {/* Summary Cards Grid */}
                        {/* Summary Cards Grid - Reduced to 3 cards (Deep Analysis) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">


                            {/* 3. Won Deals */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Award size={100} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium mb-2">Won Deals</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">{stats.globalStats.won}</div>
                                <div className="flex items-center text-sm text-gray-400">
                                    Great job! Keep it up.
                                </div>
                            </motion.div>

                            {/* 4. Win Rate */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <PieChart size={100} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium mb-2">Win Rate</div>
                                <div className="text-4xl font-bold text-purple-400 mb-2">{stats.globalStats.winRate.toFixed(1)}%</div>
                                <div className="flex items-center text-sm text-gray-400">
                                    Percentage of won deals.
                                </div>
                            </motion.div>



                            {/* 8. Lost Leads */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <TrendingDown size={100} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium mb-2">Lost Leads</div>
                                <div className="text-4xl font-bold text-red-400 mb-2">{stats.globalStats.lost}</div>
                                <div className="flex items-center text-sm text-gray-400">
                                    {stats.mainLostReason && (
                                        <>Main reason: <span className="text-white ml-1">{stats.mainLostReason.name}</span></>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Full Width Timeline */}
                        <motion.div variants={itemVariants} className="w-full bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[350px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <LineChart size={18} className="text-green-500" />
                                    Acquisition Timeline
                                </h3>
                                <div className="text-sm text-gray-400">
                                    Avg. Leads/Day: <span className="text-white font-bold">{stats.avgLeadsPerDay}</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.timelineData}>
                                        <defs>
                                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#666"
                                            tick={({ x, y, payload }) => {
                                                const date = new Date(payload.value);
                                                const isWeekendDay = isWeekend(date);
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text x={0} y={0} dy={32} textAnchor="middle" fill={isWeekendDay ? "#fff" : "#666"} fontWeight={isWeekendDay ? "bold" : "normal"} fontSize={12}>
                                                            <tspan x="0" dy="0">{format(date, 'EEE')}</tspan>
                                                            <tspan x="0" dy="14">{format(date, 'MMM dd')}</tspan>
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                            interval={0}
                                            height={60}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            tick={{ fill: '#888', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                                        />
                                        <Area type="monotone" dataKey="commits" name="Leads" stroke="#8884d8" fillOpacity={1} fill="url(#colorLeads)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Omnichannel/Messaging Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
                            {/* Average Response Time */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <MessageSquare size={18} className="text-blue-500" />
                                    <span className="text-xs text-gray-500 font-medium">Messaging</span>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">2.4h</div>
                                <div className="text-sm text-gray-400">Avg. Response Time</div>
                                <div className="mt-3 text-xs text-gray-500">
                                    Across all team members
                                </div>
                            </motion.div>

                            {/* Active Conversations */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <Users size={18} className="text-green-500" />
                                    <span className="text-xs text-gray-500 font-medium">Messaging</span>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">12</div>
                                <div className="text-sm text-gray-400">Active Conversations</div>
                                <div className="mt-3 text-xs text-gray-500">
                                    Currently in progress
                                </div>
                            </motion.div>

                            {/* Total Messages */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <BarChart3 size={18} className="text-purple-500" />
                                    <span className="text-xs text-gray-500 font-medium">Messaging</span>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">847</div>
                                <div className="text-sm text-gray-400">Total Messages</div>
                                <div className="mt-3 text-xs text-gray-500">
                                    Sent and received
                                </div>
                            </motion.div>

                            {/* Resolution Rate */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <Target size={18} className="text-emerald-500" />
                                    <span className="text-xs text-gray-500 font-medium">Messaging</span>
                                </div>
                                <div className="text-3xl font-bold text-emerald-400 mb-2">87%</div>
                                <div className="text-sm text-gray-400">Resolution Rate</div>
                                <div className="mt-3 text-xs text-gray-500">
                                    Conversations resolved
                                </div>
                            </motion.div>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                            {/* Status Distribution */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[450px]">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Filter size={18} className="text-blue-500" />
                                    Leads by Status
                                </h3>
                                <div className="flex-1 w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.statusData} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={130}
                                                tick={<CustomYAxisTick />}
                                                interval={0}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                                {stats.statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                                                ))}
                                                <LabelList dataKey="value" position="right" fill="#fff" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Source Distribution */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[450px]">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Globe size={18} className="text-cyan-500" />
                                    Leads by Source
                                </h3>
                                <div className="flex-1 w-full relative min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={stats.sourceData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={130}
                                                tick={<CustomYAxisTick />}
                                                interval={0}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20}>
                                                <LabelList dataKey="value" position="right" fill="#fff" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {/* Pies Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Product Distribution */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[400px]">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Tag size={18} className="text-purple-500" />
                                    Leads by Product
                                </h3>
                                <div className="flex-1 w-full relative min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={stats.productData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={130}
                                                tick={<CustomYAxisTick />}
                                                interval={0}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20}>
                                                <LabelList dataKey="value" position="right" fill="#fff" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Category Distribution */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[400px]">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <PieChart size={18} className="text-orange-500" />
                                    Leads by {settings.custom_fields?.name || "Category"}
                                </h3>
                                <div className="flex-1 w-full relative min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={stats.categoryData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={130}
                                                tick={<CustomYAxisTick />}
                                                interval={0}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20}>
                                                <LabelList dataKey="value" position="right" fill="#fff" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>


                        {/* Row 3: Touchpoints & Engagement */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                            {/* Touchpoint Distribution */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[400px]">
                                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                                    <Target size={18} className="text-indigo-500" />
                                    Leads by Touchpoint
                                </h3>
                                <p className="text-xs text-gray-500 mb-6 ml-7">
                                    Volume of leads at each automated touchpoint.
                                </p>
                                <div className="flex-1 w-full relative min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.tpData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            />
                                            <YAxis
                                                hide
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50}>
                                                <LabelList dataKey="value" position="top" fill="#fff" fontSize={12} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Engagement Level Distribution */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[400px]">
                                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                                    <MessageSquare size={18} className="text-pink-500" />
                                    Engagement Level (In Progress)
                                </h3>
                                <p className="text-xs text-gray-500 mb-6 ml-7">
                                    Conversation maturity based on message count.
                                </p>
                                <div className="flex-1 w-full relative min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={stats.engagementData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={160}
                                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={30}>
                                                <LabelList dataKey="value" position="right" fill="#fff" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {/* Row 3: Lost Reasons & Responsible Stats */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">

                            {/* Closed by Responsible */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Users size={18} className="text-yellow-500" />
                                    Closed Deals by Responsible
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-400">
                                        <thead className="bg-[#1a1a1a] text-gray-200 uppercase text-xs font-semibold">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Responsible</th>
                                                <th className="px-4 py-3 text-right">Assigned</th>
                                                <th className="px-4 py-3 text-right">Won</th>
                                                <th className="px-4 py-3 text-right">Lost</th>
                                                <th className="px-4 py-3 text-right">Win Rate</th>
                                                <th className="px-4 py-3 rounded-r-lg text-right">Total Closed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {stats.responsibleData.map((r, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                                                    <td className="px-4 py-3 text-right text-gray-300">{r.Assigned}</td>
                                                    <td className="px-4 py-3 text-right text-green-400">{r.Won}</td>
                                                    <td className="px-4 py-3 text-right text-red-400">{r.Lost}</td>
                                                    <td className="px-4 py-3 text-right text-blue-400">
                                                        {r.winRate.toFixed(1)}%
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-white">{r.TotalClosed}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>


                            {/* Lost Reasons Analysis */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <TrendingDown size={18} className="text-red-500" />
                                    Why did we lose leads?
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart layout="vertical" data={stats.lostReasonsData.slice(0, 5)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                                <XAxis type="number" hide />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    width={130}
                                                    tick={<CustomYAxisTick />}
                                                    interval={0}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20}>
                                                    <LabelList dataKey="value" position="right" fill="#fff" />
                                                </Bar>
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                    itemStyle={{ color: '#fff' }}
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-col justify-center gap-4">
                                        {stats.mainLostReason ? (
                                            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
                                                <div className="text-red-400 font-medium mb-1">Primary Loss Reason</div>
                                                <div className="text-3xl font-bold text-white mb-2">{stats.mainLostReason.name}</div>
                                                <div className="text-sm text-gray-400">
                                                    Accounts for <span className="text-white font-bold">{stats.lost > 0 ? ((stats.mainLostReason.value / stats.lost) * 100).toFixed(0) : 0}%</span> of all lost deals.
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500 italic">No lost leads data available yet.</div>
                                        )}
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                                            <div className="text-sm text-gray-400">Recommendation</div>
                                            <div className="text-white mt-1">
                                                {stats.mainLostReason
                                                    ? "Consider reviewing the objection handling scripts for this specific reason."
                                                    : "Keep tracking your lost reasons to get actionable insights."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </div>

                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
