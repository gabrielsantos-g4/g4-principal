"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { CrmSettings } from "@/actions/crm/get-crm-settings";

interface NewOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings?: CrmSettings;
    initialData?: any;
    leads?: any[];
}

export function NewOpportunityModal({ isOpen, onClose, settings, initialData, leads = [] }: NewOpportunityModalProps) {
    const router = useRouter();
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

    // New Fields
    const [touchpoint, setTouchpoint] = useState<string>("0");
    const [firstMessage, setFirstMessage] = useState("");
    const [customField, setCustomField] = useState("");
    const [source, setSource] = useState("");
    const [status, setStatus] = useState("New");
    const [responsible, setResponsible] = useState("");


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
                setProduct(initialData.product || "[]");
                setAmount(parseFloat(initialData.amount) || 0);

                setCustomField(initialData.custom || "");
                setSource(initialData.source || "");
                setStatus(initialData.status || "New");
                setResponsible(initialData.responsible || "");

                // Next step logic reconstruction
                if (initialData.nextStep?.progress === 6) {
                    setTouchpoint("6");
                } else {
                    setTouchpoint(initialData.nextStep?.progress?.toString() || "0");
                }
            } else {
                setName("");
                setRole("");
                setCompany("");
                setWebsite("");
                setPhone(undefined);
                setEmail("");
                setLinkedin("");
                setProduct("[]");
                setAmount(0);

                setTouchpoint("0");
                setFirstMessage("");
                setCustomField("");
                setSource("");
                setStatus("New");
                setResponsible("");
            }
        }
    }, [isOpen, initialData]);

    // Auto-engage logic
    useEffect(() => {
        if (firstMessage && firstMessage.trim().length > 0) {
            setTouchpoint("6");
        }
    }, [firstMessage]);

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validateWebsite = (url: string) => {
        // Simple validation for typical domain or url
        return url.includes(".") && url.length > 3;
    };

    const handleSave = async () => {
        if (!name) {
            toast.error("Name is required.");
            return;
        }

        if (email && !validateEmail(email)) {
            toast.error("Invalid email address.");
            return;
        }

        if (website && !validateWebsite(website)) {
            toast.error("Invalid website URL (must contain domain).");
            return;
        }
        if (website && !validateWebsite(website)) {
            toast.error("Invalid website URL (must contain domain).");
            return;
        }

        // --- Deduplication Logic ---
        const normalize = (str: string) => str ? str.trim().toLowerCase() : "";
        const currentId = initialData?.id;

        // Strict Check: Name (Blocker)
        const nameExists = leads?.find(l =>
            normalize(l.name) === normalize(name) && l.id !== currentId
        );

        if (nameExists) {
            toast.error("Lead already exists!", {
                description: `A lead with the name "${name}" is already registered. Please use a different name to create a new record.`
            });
            return;
        }

        // Soft Check: Phone/Email/LinkedIn (Warning)
        const duplicateFields = [];
        if (leads) {
            if (phone && leads.some(l => l.phone === phone && l.id !== currentId)) duplicateFields.push("Phone");
            if (email && leads.some(l => normalize(l.email) === normalize(email) && l.id !== currentId)) duplicateFields.push("Email");
            if (linkedin && leads.some(l => normalize(l.linkedin) === normalize(linkedin) && l.id !== currentId)) duplicateFields.push("LinkedIn");
        }

        if (duplicateFields.length > 0) {
            toast("Potential Duplicate Detected", {
                description: `Found existing lead with same ${duplicateFields.join(", ")}. Saving anyway as Name is unique.`,
                duration: 4000,
            });
        }
        // ---------------------------

        setIsSaving(true);
        try {
            let result;
            const engaged = touchpoint === "6";

            if (isEditMode) {
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
                    price: priceToUpdate,
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
                    product,
                    amount,
                    customField,
                    status,
                    source,
                    responsible,
                    touchpoint: engaged ? 6 : parseInt(touchpoint),
                    engaged,
                    firstMessage
                });
            }

            if (result.success) {
                toast.success(isEditMode ? "Opportunity updated!" : "Opportunity created successfully!");
                router.refresh();
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

    // Helper options
    const RESPONSIBLES = settings?.responsibles || [];
    const SOURCES = settings?.sources || [];
    const CUSTOM_OPTIONS = settings?.custom_fields?.options || [];
    const STATUSES = settings?.statuses || [
        { label: "New", bg: "bg-blue-500", text: "text-white" },
        { label: "Won", bg: "bg-green-500", text: "text-white" },
        { label: "Lost", bg: "bg-red-500", text: "text-white" }
    ];

    const isTouchpointDisabled = firstMessage.trim().length > 0;
    const isEngaged = touchpoint === "6";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-[1400px] max-h-[95vh] overflow-y-auto bg-[#111] text-white p-4 sm:p-6 border border-white/10 rounded-md sm:rounded-sm w-full">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold">{isEditMode ? "Edit Opportunity" : "New opportunity"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-6 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        {/* 1. Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Name <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* 2. Company */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Company</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>

                        {/* 3. Role */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Role</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />
                        </div>

                        {/* 4. Phone */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Phone</label>
                            <div className="border border-white/10 rounded-sm px-3 py-0.5 h-10 flex items-center bg-white/5 focus-within:ring-1 focus-within:ring-[#1C73E8] focus-within:border-[#1C73E8]">
                                <PhoneInput
                                    international={false}
                                    defaultCountry="BR"
                                    value={phone}
                                    onChange={setPhone}
                                    countrySelectComponent={CountrySelect}
                                    className="phone-input-custom w-full [&_input]:ml-2"
                                    placeholder="Type here"
                                />
                            </div>
                        </div>

                        {/* 5. Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Email</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* 6. LinkedIn */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">LinkedIn</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                            />
                        </div>

                        {/* 7. Website */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Website</label>
                            <Input
                                placeholder="Type here"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>

                        {/* 8. Next Step (Touchpoint) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Next Step (Touchpoint)</label>
                            <Select
                                value={touchpoint}
                                onValueChange={(val) => {
                                    if (isTouchpointDisabled && val !== "6") {
                                        toast.error("Disable 'Conversation Established' to edit touchpoint.", {
                                            description: "Clear the first message to change the touchpoint."
                                        });
                                        // Force it back to 6 if they tried to change it
                                        // But shadcn Select doesn't easily support 'start transition' blocking, 
                                        // so we rely on rendering. Actually disabling the trigger is better.
                                        return;
                                    }
                                    setTouchpoint(val);
                                }}
                            >
                                <SelectTrigger
                                    disabled={isTouchpointDisabled}
                                    className={`w-full h-10 bg-white/5 border-white/10 text-white rounded-sm ${isTouchpointDisabled ? 'opacity-50 cursor-not-allowed border-red-500/30' : ''}`}
                                >
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                    <SelectItem value="0">Select...</SelectItem>
                                    <SelectItem value="1">Touchpoint 1</SelectItem>
                                    <SelectItem value="2">Touchpoint 2</SelectItem>
                                    <SelectItem value="3">Touchpoint 3</SelectItem>
                                    <SelectItem value="4">Touchpoint 4</SelectItem>
                                    <SelectItem value="5">Breakup Message</SelectItem>
                                    <SelectItem value="6" className="text-[#1C73E8] font-bold">Conversation Established</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 8. Engaged (Message Circle) Indicator */}
                        <div className="flex flex-col gap-1.5 items-start justify-end h-full pb-2">
                            <div
                                className={`flex items-center gap-2 cursor-pointer select-none ${isEngaged ? 'text-[#1C73E8]' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => {
                                    if (isTouchpointDisabled && !isEngaged) return;
                                    if (firstMessage.length > 0) return;
                                    setTouchpoint(isEngaged ? "0" : "6");
                                }}
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isEngaged ? 'border-[#1C73E8] bg-[#1C73E8]' : 'border-gray-500'}`}>
                                    {isEngaged && <span className="text-white text-xs">✓</span>}
                                </div>
                                <span className="font-bold text-sm">Conversation Established</span>
                            </div>
                        </div>

                        {/* 9. First Message - Auto-activates Conv. Established */}
                        <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-400">First Message</label>
                                {touchpoint === "6" && <span className="text-xs text-[#1C73E8] font-bold">Conversation Established Active</span>}
                            </div>
                            <Input
                                placeholder="Type the first message here..."
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10 rounded-sm focus-visible:ring-1 focus-visible:ring-[#1C73E8]"
                                value={firstMessage}
                                onChange={(e) => setFirstMessage(e.target.value)}
                            />
                        </div>


                        {/* 11. Product */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Product ($)</label>
                            <CrmProductSelect
                                value={product}
                                options={settings?.products || []}
                                onChange={(products, total) => {
                                    setProduct(JSON.stringify(products));
                                    setAmount(total);
                                }}
                            />
                        </div>

                        {/* 12. Custom Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">{settings?.custom_fields?.name || "Category"}</label>
                            <Select value={customField} onValueChange={setCustomField}>
                                <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white rounded-sm">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                    <SelectItem value=" ">Select...</SelectItem>
                                    {CUSTOM_OPTIONS.map((opt: any, idx: number) => {
                                        const label = typeof opt === 'string' ? opt : opt.label;
                                        const bg = typeof opt === 'string' ? 'bg-slate-800' : opt.bg;
                                        const text = typeof opt === 'string' ? 'text-slate-100' : opt.text;
                                        return (
                                            <SelectItem key={idx} value={label}>
                                                <Badge className={`${bg} ${text} border-none hover:opacity-80`}>
                                                    {label}
                                                </Badge>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 13. Source */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Source</label>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white rounded-sm">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                    <SelectItem value=" ">Select...</SelectItem>
                                    {SOURCES.map((src: any, idx: number) => {
                                        const label = typeof src === 'string' ? src : src.label;
                                        const bg = typeof src === 'string' ? 'bg-slate-800' : src.bg;
                                        const text = typeof src === 'string' ? 'text-slate-100' : src.text;
                                        return (
                                            <SelectItem key={idx} value={label}>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${bg} ${text} border-none hover:opacity-80`}>
                                                        {label}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 14. Status */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Status</label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white rounded-sm">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                    {STATUSES.map((st: any, idx: number) => {
                                        const label = typeof st === 'string' ? st : st.label;
                                        const bg = typeof st === 'string' ? 'bg-slate-800' : st.bg;
                                        const text = typeof st === 'string' ? 'text-slate-100' : st.text;
                                        return (
                                            <SelectItem key={idx} value={label}>
                                                <Badge className={`${bg} ${text} border-none hover:opacity-80`}>
                                                    {label}
                                                </Badge>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 15. Responsible */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-400">Responsible</label>
                            <Select value={responsible} onValueChange={setResponsible}>
                                <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white rounded-sm">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                    <SelectItem value=" ">Select...</SelectItem>
                                    {RESPONSIBLES.map((resp: any, idx: number) => {
                                        const label = typeof resp === 'string' ? resp : resp.label;
                                        // Try to find a role or color if possible, otherwise default.
                                        // Usually responsible objects in settings might have 'avatar' or 'color'.
                                        // If not, we default to a neutral badge.
                                        const bg = typeof resp === 'string' ? 'bg-slate-700' : (resp.bg || 'bg-slate-700');
                                        const text = typeof resp === 'string' ? 'text-slate-100' : (resp.text || 'text-slate-100');

                                        return (
                                            <SelectItem key={idx} value={label}>
                                                <Badge className={`${bg} ${text} border-none hover:opacity-80`}>
                                                    {label}
                                                </Badge>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
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
