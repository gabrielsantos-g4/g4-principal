"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "sonner";
import { createOpportunity } from "@/actions/crm/create-opportunity";
import { updateOpportunity } from "@/actions/crm/update-opportunity";
import "@/styles/phone-input.css";
import { CountrySelect } from "./country-select";
import { CrmProductSelect } from "./crm-product-select";

import { CrmSettings } from "@/actions/crm/get-crm-settings";

interface NewOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings?: CrmSettings;
    initialData?: any;
}

export function NewOpportunityModal({ isOpen, onClose, settings, initialData }: NewOpportunityModalProps) {
    const isEditMode = !!initialData;
    const [phone, setPhone] = useState<string | undefined>();
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [product, setProduct] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with initialData when opening
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setRole(initialData.role || "");
                setCompany(initialData.company || "");
                setWebsite(initialData.website || "");
                setPhone(initialData.phone);
                setEmail(initialData.email || "");
                setLinkedin(initialData.linkedin || "");
                setLinkedin(initialData.linkedin || "");
                setProduct(initialData.product || "[]");
                setAmount(parseFloat(initialData.amount) || 0);
            } else {
                setName("");
                setRole("");
                setCompany("");
                setWebsite("");
                setPhone(undefined);
                setEmail("");
                setLinkedin("");
                setLinkedin("");
                setProduct("[]");
                setAmount(0);
            }
        }
    }, [isOpen, initialData]);

    const handleSave = async () => {
        if (!name || !company) {
            toast.error("Name and Company are required.");
            return;
        }

        setIsSaving(true);
        try {
            let result;
            if (isEditMode) {
                // Determine if we need to update amount (if product changed)
                // Update amount if product changed
                let priceToUpdate: number | undefined = undefined;
                if (product !== initialData.product) {
                    priceToUpdate = amount;
                }

                result = await updateOpportunity({
                    id: initialData.id,
                    name,
                    company,
                    phone,
                    email,
                    linkedin,
                    website,
                    role,
                    product,
                    price: priceToUpdate
                });
            } else {
                result = await createOpportunity({
                    name,
                    company,
                    phone,
                    email,
                    linkedin,
                    website,
                    role,
                    product
                });
            }

            if (result.success) {
                toast.success(isEditMode ? "Opportunity updated!" : "Opportunity created successfully!");
                onClose();
            } else {
                toast.error(result.error || "Failed to save opportunity");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1400px] bg-[#111] text-white p-6 border border-white/10 rounded-sm">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold">{isEditMode ? "Edit Opportunity" : "New opportunity"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-6 w-full">
                    <div className="grid grid-cols-4 gap-4 w-full">
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

                        {/* Role */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Role</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
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

                        {/* Website */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Website</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
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
                                    countrySelectComponent={CountrySelect}
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
                            <CrmProductSelect
                                value={product}
                                options={settings?.products || []}
                                onChange={(products, total) => {
                                    setProduct(JSON.stringify(products));
                                    setAmount(total);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="h-10 px-4 font-bold border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-sm">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="h-10 px-6 font-bold bg-[#1C73E8] text-white hover:bg-[#1557B0] border-none shadow-none rounded-sm disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
