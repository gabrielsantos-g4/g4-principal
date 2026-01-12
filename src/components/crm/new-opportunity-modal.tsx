"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
// Custom styling wrapper for phone input to match shadcn/ui
import "@/styles/phone-input.css";

interface NewOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewOpportunityModal({ isOpen, onClose }: NewOpportunityModalProps) {
    const [phone, setPhone] = useState<string | undefined>();
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [product, setProduct] = useState("");

    const handleSave = () => {
        // Implement save logic here or pass up
        console.log({ name, company, phone, email, linkedin, product });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1200px] bg-[#111] text-white p-6 border border-white/10 rounded-sm">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold">New opportunity</DialogTitle>
                </DialogHeader>

                <div className="flex items-end gap-3 w-full">
                    <div className="grid grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1.2fr] gap-3 w-full">
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Name</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Company */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Company</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Phone</label>
                            <div className="border border-white/10 rounded-sm px-3 py-0.5 h-10 flex items-center bg-white/5 focus-within:ring-1 focus-within:ring-[#1C73E8] focus-within:border-[#1C73E8]">
                                <PhoneInput
                                    international
                                    defaultCountry="BR"
                                    value={phone}
                                    onChange={setPhone}
                                    className="phone-input-custom w-full"
                                    placeholder="Type here"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Email</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* LinkedIn */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">LinkedIn</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                            />
                        </div>

                        {/* Products/Services */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Products/Services ($)</label>
                            <Input
                                placeholder="Choose the product"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={product}
                                onChange={(e) => setProduct(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pb-0.5">
                        <Button variant="outline" onClick={onClose} className="h-10 px-4 font-bold border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-sm">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="h-10 px-6 font-bold bg-[#1C73E8] text-white hover:bg-[#1557B0] border-none shadow-none rounded-sm">
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
