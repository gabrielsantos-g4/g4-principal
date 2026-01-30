'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { BarChart3, PieChart, TrendingDown, Target, Award, X, Filter, Users, Tag, Globe, LineChart } from "lucide-react"
import { useMemo } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
    LabelList
} from 'recharts';
import { motion } from "framer-motion";
import { format, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { CrmSettings } from "@/actions/crm/get-crm-settings";

interface CrmReportsModalProps {
    isOpen: boolean
    onClose: () => void
    leads: any[]
    settings: CrmSettings
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ef4444', '#3b82f6'];

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

    const stats = useMemo(() => {
        const total = leads.length;
        const won = leads.filter(l => l.status === 'Won').length;
        const lost = leads.filter(l => l.status === 'Lost').length;
        const winRate = total > 0 ? (won / total) * 100 : 0;

        // --- Status Distribution ---
        const allStatuses = [...(settings.statuses || [])];
        if (!allStatuses.some((s: any) => s.label === 'New')) allStatuses.unshift({ label: 'New', bg: 'bg-blue-500', text: 'New' });
        if (!allStatuses.some((s: any) => s.label === 'Won')) allStatuses.push({ label: 'Won', bg: 'bg-green-500', text: 'Won' });
        if (!allStatuses.some((s: any) => s.label === 'Lost')) allStatuses.push({ label: 'Lost', bg: 'bg-red-500', text: 'Lost' });

        const statusCount: Record<string, number> = {};
        allStatuses.forEach((s: any) => statusCount[s.label] = 0);

        leads.forEach(l => {
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
        allProducts.forEach((p: any) => productCount[p.name] = 0);

        leads.forEach(l => {
            let products: string[] = [];
            try {
                if (l.product && l.product.startsWith('[')) {
                    products = JSON.parse(l.product);
                } else if (l.product) {
                    products = [l.product];
                }
            } catch (e) {
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
        allSources.forEach((s: any) => {
            const label = typeof s === 'string' ? s : s.label;
            sourceCount[label] = 0;
        });
        leads.forEach(l => {
            if (l.source) sourceCount[l.source] = (sourceCount[l.source] || 0) + 1;
        });
        const sourceData = Object.entries(sourceCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);


        // --- Category Distribution ---
        const allCategories = settings.custom_fields?.options || [];
        const categoryCount: Record<string, number> = {};
        allCategories.forEach((c: any) => {
            const label = typeof c === 'string' ? c : c.label;
            categoryCount[label] = 0;
        });
        leads.forEach(l => {
            const category = l.custom_field || l.custom;
            if (category) categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        const categoryData = Object.entries(categoryCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // --- Responsible (Won / Assigned formula) ---
        const allResponsibles = settings.responsibles || [];
        const respCount: Record<string, { won: number, lost: number, assigned: number }> = {};
        allResponsibles.forEach((r: any) => {
            const label = typeof r === 'string' ? r : r.label;
            respCount[label] = { won: 0, lost: 0, assigned: 0 };
        });

        let unassignedAssigned = 0;
        let unassignedWon = 0;
        let unassignedLost = 0;

        leads.forEach(l => {
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
        const leadsWithDate = leads.filter(l => (l.created_at || l.date) && (l.created_at || l.date) !== 'Pending');
        const days = eachDayOfInterval({
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date())
        });
        const timelineData = days.map(day => {
            const count = leadsWithDate.filter(l => isSameDay(new Date(l.created_at || l.date), day)).length;
            return {
                date: format(day, 'MMM dd'),
                commits: count
            };
        });

        // --- Lost Reasons ---
        const lostReasonsCount: Record<string, number> = {};
        leads.filter(l => l.status === 'Lost' && l.lost_reason).forEach(l => {
            const r = l.lost_reason!;
            lostReasonsCount[r] = (lostReasonsCount[r] || 0) + 1;
        });
        const lostReasonsData = Object.entries(lostReasonsCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
        const mainLostReason = lostReasonsData.length > 0 ? lostReasonsData[0] : null;

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
            mainLostReason
        };
    }, [leads, settings]);

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
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#0a0a0a]">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-6 w-full max-w-full"
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Target size={100} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium mb-2">Total Leads</div>
                                <div className="text-4xl font-bold text-white mb-2">{stats.total}</div>
                                <div className="flex items-center text-sm text-gray-400">
                                    All leads currently in the list.
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Award size={100} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium mb-2">Won Deals</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">{stats.won}</div>
                                <div className="flex items-center text-sm text-gray-400">
                                    Great job!
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <TrendingDown size={100} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium mb-2">Lost Leads</div>
                                <div className="text-4xl font-bold text-red-400 mb-2">{stats.lost}</div>
                                <div className="flex items-center text-sm text-gray-400">
                                    {stats.mainLostReason && (
                                        <>Main reason: <span className="text-white ml-1">{stats.mainLostReason.name}</span></>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <PieChart size={100} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium mb-2">Win Rate</div>
                                <div className="text-4xl font-bold text-purple-400 mb-2">{stats.winRate.toFixed(1)}%</div>
                                <div className="flex items-center text-sm text-gray-400">
                                    Percentage of won deals from total leads.
                                </div>
                            </motion.div>
                        </div>

                        {/* Full Width Timeline */}
                        <motion.div variants={itemVariants} className="w-full bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[350px]">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <LineChart size={18} className="text-green-500" />
                                Acquisition Timeline (Current Month)
                            </h3>
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
                                            tick={{ fill: '#888', fontSize: 12 }}
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
                                            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                                        />
                                        <Area type="monotone" dataKey="commits" name="Leads" stroke="#8884d8" fillOpacity={1} fill="url(#colorLeads)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

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
                                                width={100}
                                                tick={{ fill: '#888', fontSize: 12 }}
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
                                                width={100}
                                                tick={{ fill: '#9ca3af', fontSize: 11 }}
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
                                        <RePieChart>
                                            <Pie
                                                data={stats.productData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.productData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value, entry: any) => (
                                                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                                        {value} <span style={{ color: '#fff', marginLeft: '4px' }}>({entry.payload.value})</span>
                                                    </span>
                                                )}
                                            />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Category Distribution */}
                            <motion.div variants={itemVariants} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col h-[400px]">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <PieChart size={18} className="text-orange-500" />
                                    Leads by Category
                                </h3>
                                <div className="flex-1 w-full relative min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={stats.categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value, entry: any) => (
                                                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                                        {value} <span style={{ color: '#fff', marginLeft: '4px' }}>({entry.payload.value})</span>
                                                    </span>
                                                )}
                                            />
                                        </RePieChart>
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
                                                    width={100}
                                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
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
