import { Trash2, Edit2, CheckCircle2, MessageCircle, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data
const LEADS = [
    { id: 1, name: "James", company: "Dwelling Place", date: "27/Sep 08:18", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", status: "Talking" },
    { id: 2, name: "Aldemir", company: "Bulls", date: "27/Sep 08:18", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "30,00", status: "Talking" },
    { id: 3, name: "Deroba Caires", company: "Alma Candle", date: "27/Sep 11:44", phone: "1↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 2, total: 5 }, amount: "30,00", status: "Talking" },
    { id: 4, name: "Ticianny", company: "PCTec", date: "27/Sep 12:41", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking" },
    { id: 5, name: "Moça AOSA", company: "AOSA", date: "27/Sep 12:41", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking" },
    { id: 6, name: "Renato/Chris", company: "Brian", date: "27/Sep 18:49", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", status: "Talking" },
    { id: 7, name: "Vanil/Iza", company: "PV Brasileira", date: "02/Dec 08:49", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 3, total: 5 }, amount: "30,00", status: "Talking" },
    { id: 8, name: "James", company: "Dwelling Place", date: "27/Sep 08:18", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", status: "Talking" },
    { id: 9, name: "Aldemir", company: "Bulls", date: "27/Sep 08:18", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "30,00", status: "Talking" },
    { id: 10, name: "Deroba Caires", company: "Alma Candle", date: "27/Sep 11:44", phone: "1↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 2, total: 5 }, amount: "30,00", status: "Talking" },
    { id: 11, name: "Ticianny", company: "PCTec", date: "27/Sep 12:41", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking" },
    { id: 12, name: "Moça AOSA", company: "AOSA", date: "27/Sep 12:41", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking" },
    { id: 13, name: "Renato/Chris", company: "Brian", date: "27/Sep 18:49", phone: "↗", email: "-", linkedin: "-", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", status: "Talking" },
];

export function CrmTable() {
    return (
        <div className="bg-[#111] rounded-lg border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
            <div className="grid grid-cols-[1.5fr_1.5fr_0.8fr_0.5fr_0.5fr_0.6fr_1.5fr_1fr_1fr_0.5fr] bg-white/5 px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider items-center gap-4 shrink-0 border-b border-white/5">
                <div>Name</div>
                <div>Company</div>
                <div>Created</div>
                <div>Phone</div>
                <div>Email</div>
                <div>LinkedIn</div>
                <div>Next Step</div>
                <div>Amount</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
            </div>

            <div className="divide-y divide-white/5 overflow-y-auto flex-1 custom-scrollbar">
                {LEADS.map((lead) => (
                    <div key={lead.id} className="grid grid-cols-[1.5fr_1.5fr_0.8fr_0.5fr_0.5fr_0.6fr_1.5fr_1fr_1fr_0.5fr] px-4 py-3 text-sm text-gray-300 items-center gap-4 hover:bg-white/5 transition-colors group">
                        <div className="font-bold text-white truncate text-[13px]">{lead.name}</div>
                        <div className="font-semibold text-white/90 truncate text-[13px]">{lead.company}</div>
                        <div className="text-gray-500 font-mono text-[11px] leading-tight">
                            {lead.date.split(' ').map((part, i) => (
                                <div key={i}>{part}</div>
                            ))}
                        </div>
                        <div className="text-gray-500 flex items-center justify-start gap-1 cursor-pointer hover:text-[#1C73E8]">
                            {lead.phone}
                        </div>
                        <div className="text-gray-600 text-center">{lead.email}</div>
                        <div className="text-gray-600 text-center">{lead.linkedin}</div>

                        {/* Next Step Column */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-red-400 text-[11px] font-semibold">{lead.nextStep.date}</span>
                            <div className="flex items-center gap-1">
                                <div className="flex space-x-1.5">
                                    {[...Array(lead.nextStep.total)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`w-3 h-3 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1C73E8]/50 ${i < lead.nextStep.progress ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] text-gray-500 ml-1">{lead.nextStep.progress}/{lead.nextStep.total}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-gray-300 text-[12px]">
                            <MessageCircle size={14} className="text-[#1C73E8]" />
                            {lead.amount} <ExternalLink size={12} className="opacity-50" />
                        </div>

                        <div>
                            <div className="bg-[#1C73E8]/10 text-[#1C73E8] border border-[#1C73E8]/20 px-3 py-1 rounded text-[11px] font-bold flex items-center justify-between w-28 cursor-pointer hover:bg-[#1C73E8]/20 transition-colors">
                                {lead.status}
                                <ChevronDown size={12} />
                            </div>
                        </div>

                        {/* Actions (Empty in mockup but keeping structure) */}
                        <div className="flex items-center justify-end gap-1 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-white hover:bg-white/10">
                                <Edit2 size={14} />
                            </Button> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
