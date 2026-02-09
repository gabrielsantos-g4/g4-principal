"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Building2, Phone } from "lucide-react";

interface CrmSearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    searchName: string;
    searchCompany: string;
    searchPhone: string;
    onSearchNameChange: (value: string) => void;
    onSearchCompanyChange: (value: string) => void;
    onSearchPhoneChange: (value: string) => void;
}

export function CrmSearchModal({
    open,
    onOpenChange,
    searchName,
    searchCompany,
    searchPhone,
    onSearchNameChange,
    onSearchCompanyChange,
    onSearchPhoneChange
}: CrmSearchModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0c0c0c] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium">Search Leads</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 pt-2">
                    {/* Name Search */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">Name</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by name..."
                                value={searchName}
                                onChange={(e) => onSearchNameChange(e.target.value)}
                                className="pl-9 bg-[#111] border-white/10 text-white placeholder:text-slate-500 focus:border-[#1C73E8] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Company Search */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">Company</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by company..."
                                value={searchCompany}
                                onChange={(e) => onSearchCompanyChange(e.target.value)}
                                className="pl-9 bg-[#111] border-white/10 text-white placeholder:text-slate-500 focus:border-[#1C73E8] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Phone Search */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by phone..."
                                value={searchPhone}
                                onChange={(e) => onSearchPhoneChange(e.target.value)}
                                className="pl-9 bg-[#111] border-white/10 text-white placeholder:text-slate-500 focus:border-[#1C73E8] transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
