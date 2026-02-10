"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Check, X, Plus, Save, GripVertical } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Reorder } from "framer-motion";

import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { updateCrmSettings } from "@/actions/crm/update-crm-settings";
import { transferLeadsTag } from "@/actions/crm/transfer-leads-tag";
import { getCompanyUsers } from "@/actions/users"; // Import getCompanyUsers
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TagItem {
    label: string;
    bg: string;
    text: string;
    email?: string;
}

const COLORS = [
    { bg: "bg-slate-800", text: "text-slate-100" },
    { bg: "bg-red-900", text: "text-red-100" },
    { bg: "bg-orange-900", text: "text-orange-100" },
    { bg: "bg-amber-900", text: "text-amber-100" },
    { bg: "bg-green-900", text: "text-green-100" },
    { bg: "bg-emerald-900", text: "text-emerald-100" },
    { bg: "bg-teal-900", text: "text-teal-100" },
    { bg: "bg-cyan-900", text: "text-cyan-100" },
    { bg: "bg-blue-900", text: "text-blue-100" },
    { bg: "bg-indigo-900", text: "text-indigo-100" },
    { bg: "bg-violet-900", text: "text-violet-100" },
    { bg: "bg-purple-900", text: "text-purple-100" },
    { bg: "bg-fuchsia-900", text: "text-fuchsia-100" },
    { bg: "bg-pink-900", text: "text-pink-100" },
    { bg: "bg-rose-900", text: "text-rose-100" },
];

interface CrmSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: CrmSettings;
}

// Internal component for editing a Tag (Name + Color)
function TagEditor({
    tag,
    onSave,
    onDelete,
    children
}: {
    tag: TagItem,
    onSave: (newLabel: string, newBg: string, newText: string) => void,
    onDeleteRaw?: () => void,
    onDelete?: () => void,
    children: React.ReactNode
}) {
    const [label, setLabel] = useState(tag.label);
    const [color, setColor] = useState({ bg: tag.bg, text: tag.text });
    const [open, setOpen] = useState(false);

    // Reset state when popover opens or tag changes
    useEffect(() => {
        if (open) {
            setLabel(tag.label);
            setColor({ bg: tag.bg, text: tag.text });
        }
    }, [open, tag]);

    const handleSave = () => {
        if (label.trim()) {
            onSave(label, color.bg, color.text);
            setOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-3 bg-[#1a1a1a] border-white/10 flex flex-col gap-3 z-[9999]">
                <div className="space-y-1">
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Label</Label>
                    <Input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="h-8 text-xs bg-black/50 border-white/20 text-white"
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Color</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {COLORS.map((c, idx) => (
                            <button
                                key={idx}
                                className={`w-6 h-6 rounded-full ${c.bg} border border-white/20 hover:scale-110 transition-transform ${color.bg === c.bg ? 'ring-2 ring-white scale-110' : ''}`}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-400 hover:text-white"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function CrmSettingsModal({ isOpen, onClose, settings }: CrmSettingsModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Debounce Ref
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSave = (
        overrideProducts?: any[],
        overrideStatuses?: any[],
        overrideResponsibles?: any[],
        overrideSources?: any[],
        overrideCustomOptions?: any[],
        overrideLostReasons?: any[]
    ) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveSettings(
                overrideProducts,
                overrideStatuses,
                overrideResponsibles,
                overrideSources,
                overrideCustomOptions,
                overrideLostReasons,
                true // silent save
            );
        }, 1000);
    };

    // Initialize state from props
    const [products, setProducts] = useState(settings?.products || []);
    const [statuses, setStatuses] = useState(settings?.statuses || []);

    // Helper to normalize tags to TagItem[]
    const normalizeTags = (items: (string | TagItem)[]): TagItem[] =>
        items?.map(item => typeof item === 'string' ? { label: item, bg: 'bg-slate-800', text: 'text-slate-100' } : item) || [];

    const [responsibles, setResponsibles] = useState<TagItem[]>(normalizeTags(settings?.responsibles || []));
    const [sources, setSources] = useState<TagItem[]>(normalizeTags(settings?.sources || []));
    const [lostReasons, setLostReasons] = useState<TagItem[]>(normalizeTags(settings?.lost_reasons || []));

    // Real Team Members State
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            getCompanyUsers().then(data => {
                if (data && data.users) {
                    setTeamMembers(data.users);
                }
            });
        }
    }, [isOpen]);

    // Custom Field State
    const [customFieldName, setCustomFieldName] = useState(settings?.custom_fields?.name || "Category");
    const [customOptions, setCustomOptions] = useState<TagItem[]>(normalizeTags(settings?.custom_fields?.options));

    // Local state for inputs
    const [newProduct, setNewProduct] = useState({ name: "", price: "" });
    const [newStatus, setNewStatus] = useState({ label: "", bg: "bg-gray-500", text: "text-white" });
    const [newResponsible, setNewResponsible] = useState({ name: "", email: "" });
    const [newSource, setNewSource] = useState("");
    const [newLostReason, setNewLostReason] = useState("");
    const [newCustomOption, setNewCustomOption] = useState("");

    // Edit/Delete State
    const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
    const [editingProductData, setEditingProductData] = useState({ name: "", price: "" });
    const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'status' | 'responsible' | 'source' | 'lostReason' | 'customOption', index: number } | null>(null);

    // Transfer State
    const [transferTarget, setTransferTarget] = useState<string>("");

    // Get available options for transfer based on itemToDelete
    const getTransferOptions = () => {
        if (!itemToDelete) return [];
        const { type, index } = itemToDelete;

        const filter = (arr: TagItem[]) => arr.filter((_, idx) => idx !== index);

        switch (type) {
            case 'status': return filter(statuses);
            case 'responsible': return filter(responsibles);
            case 'source': return filter(sources);
            case 'lostReason': return filter(lostReasons);
            case 'customOption': return filter(customOptions);
            default: return [];
        }
    };

    // Sync state when settings prop updates
    useEffect(() => {
        if (!settings) return;
        setProducts(settings.products || []);
        setStatuses(settings.statuses || []);
        setResponsibles(normalizeTags(settings.responsibles || []));
        setSources(normalizeTags(settings.sources || []));
        setLostReasons(normalizeTags(settings.lost_reasons || []));
        setCustomFieldName(settings.custom_fields?.name || "Category");
        setCustomOptions(normalizeTags(settings.custom_fields?.options || []));
    }, [settings]);

    // Reset transfer target when delete modal opens
    useEffect(() => {
        setTransferTarget("");
    }, [itemToDelete]);


    const saveSettings = async (overrideProducts?: any[], overrideStatuses?: any[], overrideResponsibles?: any[], overrideSources?: any[], overrideCustomOptions?: any[], overrideLostReasons?: any[], silent: boolean = false) => {
        setLoading(true);
        try {
            const updatedSettings = {
                products: overrideProducts || products,
                statuses: overrideStatuses || statuses,
                responsibles: overrideResponsibles || responsibles,
                sources: overrideSources || sources,
                lost_reasons: overrideLostReasons || lostReasons,
                custom_fields: {
                    name: customFieldName,
                    options: overrideCustomOptions || customOptions
                }
            };

            const result = await updateCrmSettings(updatedSettings);

            if (result.success) {
                if (!silent) {
                    toast.success("Saved successfully!");
                }
                router.refresh();
            } else {
                toast.error("Failed to save.");
            }
        } catch (error) {
            toast.error("Error saving settings.");
        } finally {
            setLoading(false);
        }
    };

    // --- Products ---
    const addProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;
        const updatedProducts = [...products, { ...newProduct, id: Date.now() }];
        setProducts(updatedProducts);
        setNewProduct({ name: "", price: "" });
        await saveSettings(updatedProducts);
    };

    const confirmDeleteProduct = (index: number) => {
        setItemToDelete({ type: 'product', index });
    };

    // Generic Delete handler with Transfer Logic
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setLoading(true);

        const { type, index } = itemToDelete;

        try {
            // 1. Transfer leads if needed (Products don't have lead association in this context usually, skipping for simplicity unless requested)
            if (type !== 'product' && transferTarget) {
                let oldValue = "";
                let column = "";

                if (type === 'status') {
                    oldValue = statuses[index].label;
                    column = 'status';
                } else if (type === 'responsible') {
                    oldValue = responsibles[index].label;
                    column = 'responsible';
                } else if (type === 'source') {
                    oldValue = sources[index].label;
                    column = 'source';
                } else if (type === 'lostReason') {
                    oldValue = lostReasons[index].label;
                    column = 'lost_reason';
                } else if (type === 'customOption') {
                    oldValue = customOptions[index].label;
                    column = 'custom_field';
                }

                if (oldValue && column) {
                    const transferResult = await transferLeadsTag(oldValue, transferTarget, column);
                    if (!transferResult.success) {
                        toast.error("Failed to transfer leads. Delete aborted.");
                        setLoading(false);
                        return;
                    }
                    toast.success(`Leads transferred to ${transferTarget}`);
                }
            }


            // 2. Perform local deletion and save
            if (type === 'product') {
                const updatedProducts = [...products];
                updatedProducts.splice(index, 1);
                setProducts(updatedProducts);
                await saveSettings(updatedProducts, undefined, undefined, undefined, undefined, undefined, true);
            } else if (type === 'status') {
                const updatedStatuses = [...statuses];
                updatedStatuses.splice(index, 1);
                setStatuses(updatedStatuses);
                await saveSettings(undefined, updatedStatuses, undefined, undefined, undefined, undefined, true);
            } else if (type === 'responsible') {
                const updated = [...responsibles];
                updated.splice(index, 1);
                setResponsibles(updated);
                await saveSettings(undefined, undefined, updated, undefined, undefined, undefined, true);
            } else if (type === 'source') {
                const updated = [...sources];
                updated.splice(index, 1);
                setSources(updated);
                await saveSettings(undefined, undefined, undefined, updated, undefined, undefined, true);
            } else if (type === 'lostReason') {
                const updated = [...lostReasons];
                updated.splice(index, 1);
                setLostReasons(updated);
                await saveSettings(undefined, undefined, undefined, undefined, undefined, updated, true);
            } else if (type === 'customOption') {
                const updated = [...customOptions];
                updated.splice(index, 1);
                setCustomOptions(updated);
                await saveSettings(undefined, undefined, undefined, undefined, updated, undefined, true);
            }

            toast.error("Tag deleted!", {
                style: { background: '#ef4444', color: 'white', border: 'none' }
            });
            router.refresh();
            setItemToDelete(null);
            setTransferTarget("");

        } catch (e) {
            console.error(e);
            toast.error("An error occurred during deletion.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get random color
    const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    // ... (Product handlers unchanged) ...

    // --- Statuses ---
    const addStatus = async () => {
        if (!newStatus.label) return;
        const color = getRandomColor();
        const updatedStatuses = [...statuses, { ...newStatus, ...color, id: Date.now() }];
        setStatuses(updatedStatuses);
        setNewStatus({ label: "", bg: "bg-gray-500", text: "text-white" });
        await saveSettings(undefined, updatedStatuses);
    };

    const removeStatus = (index: number) => {
        setItemToDelete({ type: 'status', index });
    };

    const updateStatus = async (index: number, label: string, bg: string, text: string) => {
        const updatedStatuses = [...statuses];
        updatedStatuses[index] = { ...updatedStatuses[index], label, bg, text };
        setStatuses(updatedStatuses);
        await saveSettings(undefined, updatedStatuses, undefined, undefined, undefined, undefined, true);
    }

    // --- Others ---
    const addResponsible = async () => {
        if (!newResponsible.name || !newResponsible.email || responsibles.some(r => r.label === newResponsible.name)) return;
        const color = getRandomColor();
        const updated = [...responsibles, { label: newResponsible.name, email: newResponsible.email, ...color }];
        setResponsibles(updated);
        setNewResponsible({ name: "", email: "" });
        await saveSettings(undefined, undefined, updated);
    };

    const removeResponsible = (index: number) => {
        setItemToDelete({ type: 'responsible', index });
    };

    const updateResponsible = async (index: number, label: string, bg: string, text: string) => {
        const updated = [...responsibles];
        updated[index] = { ...updated[index], label, bg, text };
        setResponsibles(updated);
        await saveSettings(undefined, undefined, updated, undefined, undefined, undefined, true);
    }

    const addSource = async () => {
        if (!newSource || sources.some(s => s.label === newSource)) return;
        const color = getRandomColor();
        const updated = [...sources, { label: newSource, ...color }];
        setSources(updated);
        setNewSource("");
        await saveSettings(undefined, undefined, undefined, updated);
    };

    const removeSource = (index: number) => {
        setItemToDelete({ type: 'source', index });
    };

    const updateSource = async (index: number, label: string, bg: string, text: string) => {
        const updated = [...sources];
        updated[index] = { ...updated[index], label, bg, text };
        setSources(updated);
        await saveSettings(undefined, undefined, undefined, updated, undefined, undefined, true);
    }

    // --- Lost Reasons ---
    const addLostReason = async () => {
        if (!newLostReason || lostReasons.some(r => r.label === newLostReason)) return;
        const color = getRandomColor();
        const updated = [...lostReasons, { label: newLostReason, ...color }];
        setLostReasons(updated);
        setNewLostReason("");
        await saveSettings(undefined, undefined, undefined, undefined, undefined, updated);
    };

    const removeLostReason = (index: number) => {
        setItemToDelete({ type: 'lostReason', index });
    };

    const updateLostReason = async (index: number, label: string, bg: string, text: string) => {
        const updated = [...lostReasons];
        updated[index] = { ...updated[index], label, bg, text };
        setLostReasons(updated);
        await saveSettings(undefined, undefined, undefined, undefined, undefined, updated, true);
    }

    // --- Custom Options ---
    const addCustomOption = async () => {
        if (!newCustomOption || customOptions.some(o => o.label === newCustomOption)) return;
        const color = getRandomColor();
        const updated = [...customOptions, { label: newCustomOption, ...color }];
        setCustomOptions(updated);
        setNewCustomOption("");
        await saveSettings(undefined, undefined, undefined, undefined, updated);
    };

    const removeCustomOption = (index: number) => {
        setItemToDelete({ type: 'customOption', index });
    }

    const updateCustomOption = async (index: number, label: string, bg: string, text: string) => {
        const updated = [...customOptions];
        updated[index] = { ...updated[index], label, bg, text };
        setCustomOptions(updated);
        await saveSettings(undefined, undefined, undefined, undefined, updated, undefined, true);
    }

    // Helper for Enter key
    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === "Enter") {
            e.preventDefault();
            action();
        }
    };

    // --- Render ---
    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] max-h-[90vh] overflow-y-auto bg-[#1a1a1a] text-white p-6 border border-white/10 rounded-lg">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-bold">CRM Settings</DialogTitle>
                        <DialogDescription className="text-gray-400">Manage your CRM products, statuses, and options.</DialogDescription>
                    </DialogHeader>

                    {/* ... (Existing Grid Structure unchanged) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Products Column */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Products / Services</h3>
                                {/* Avoid duplicating product add UI code for brevity, it's same as before */}
                                <div className="space-y-3 p-4 bg-white/5 rounded-md border border-white/10">
                                    <Label className="text-sm text-gray-300">Add New Product</Label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Name (e.g., Consulting)"
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                className="bg-black/50 border-white/20 text-white flex-1"
                                                onKeyDown={(e) => handleKeyDown(e, addProduct)}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                className="bg-black/50 border-white/20 text-white w-32"
                                                onKeyDown={(e) => handleKeyDown(e, addProduct)}
                                            />
                                        </div>
                                        <Button
                                            onClick={addProduct}
                                            disabled={loading || !newProduct.name || !newProduct.price}
                                            className="bg-[#1C73E8] hover:bg-[#1557B0] text-white h-8 text-xs w-fit px-4"
                                        >
                                            Save Product
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 pr-2">
                                    {products.map((product, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10 group hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-sm text-white">{product.name}</span>
                                                <span className="text-xs text-gray-400 border-l border-white/10 pl-3">${Number(product.price).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-white/10"
                                                    onClick={() => confirmDeleteProduct(index)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {products.length === 0 && (
                                        <div className="text-center py-4 text-gray-500 text-sm">No products added yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Statuses & Others Column */}
                        <div className="space-y-8">
                            {/* Statuses */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Pipeline Statuses</h3>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New Status Label"
                                        value={newStatus.label}
                                        onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                                        className="bg-black/50 border-white/20 text-white"
                                        onKeyDown={(e) => handleKeyDown(e, addStatus)}
                                    />
                                    <Button onClick={addStatus} disabled={loading || !newStatus.label} className="bg-white/10 hover:bg-white/20 text-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Reorder.Group
                                    axis="x"
                                    values={statuses}
                                    onReorder={(newOrder) => {
                                        setStatuses(newOrder);
                                        debouncedSave(undefined, newOrder);
                                    }}
                                    className="flex flex-nowrap overflow-x-auto gap-2 w-full list-none p-1 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                >
                                    {statuses.map((status, index) => (
                                        <Reorder.Item key={status.id || status.label} value={status}>
                                            <TagEditor
                                                tag={status}
                                                onSave={(l, b, t) => updateStatus(index, l, b, t)}
                                                onDelete={() => removeStatus(index)}
                                            >
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${status.bg} ${status.text} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                    <GripVertical className="h-3 w-3 opacity-50 mr-1 cursor-grab active:cursor-grabbing" />
                                                    {status.label}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeStatus(index); }}
                                                        className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </TagEditor>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>

                            {/* Responsibles */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Team (Responsibles)</h3>

                                {/* Active Team Members (Read-Only / Selectable) */}
                                <div className="space-y-2 mb-4">
                                    <Label className="text-xs text-blue-400 font-bold uppercase tracking-wider">Active Platform Members</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {teamMembers.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                        {member.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-blue-100">{member.name}</span>
                                                        <span className="text-[10px] text-blue-300">{member.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/20 capitalize">
                                                        {member.role}
                                                    </span>
                                                    {/* Auto-add to responsibles if not present? Or just show they are available? 
                                                        For now, showing them as "System Users" distinct from "Manual Tags"
                                                    */}
                                                </div>
                                            </div>
                                        ))}
                                        {teamMembers.length === 0 && <span className="text-xs text-gray-500">No active members found.</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Custom / External Responsibles</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="New Member Name"
                                            value={newResponsible.name}
                                            onChange={(e) => setNewResponsible({ ...newResponsible, name: e.target.value })}
                                            className="bg-black/50 border-white/20 text-white flex-1"
                                            onKeyDown={(e) => handleKeyDown(e, addResponsible)}
                                        />
                                        <Input
                                            placeholder="Member e-mail"
                                            value={newResponsible.email}
                                            onChange={(e) => setNewResponsible({ ...newResponsible, email: e.target.value })}
                                            className="bg-black/50 border-white/20 text-white w-64"
                                            onKeyDown={(e) => handleKeyDown(e, addResponsible)}
                                        />
                                        <Button onClick={addResponsible} disabled={loading || !newResponsible.name || !newResponsible.email} className="bg-white/10 hover:bg-white/20 text-white">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Reorder.Group
                                        axis="y"
                                        values={responsibles}
                                        onReorder={(newOrder) => {
                                            setResponsibles(newOrder);
                                            debouncedSave(undefined, undefined, newOrder);
                                        }}
                                        className="flex flex-col gap-2 list-none p-0"
                                    >
                                        {responsibles.map((person, index) => {
                                            const tag = typeof person === 'string' ? { label: person, bg: 'bg-blue-900', text: 'text-blue-100' } : person;
                                            return (
                                                <Reorder.Item key={tag.label} value={person}>
                                                    <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                                                        <div className="flex items-center gap-2">
                                                            <GripVertical className="h-4 w-4 text-gray-500 cursor-grab active:cursor-grabbing" />
                                                            <TagEditor
                                                                tag={tag}
                                                                onSave={(l, b, t) => updateResponsible(index, l, b, t)}
                                                            >
                                                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${tag.bg} ${tag.text} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                                    {tag.label}
                                                                </div>
                                                            </TagEditor>
                                                            {typeof person !== 'string' && person.email && (
                                                                <span className="text-xs text-gray-500">{person.email}</span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-white/10"
                                                            onClick={() => removeResponsible(index)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </Reorder.Item>
                                            )
                                        })}
                                    </Reorder.Group>
                                </div>
                            </div>

                            {/* Lost Reasons */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Lost Lead Reasons</h3>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New Reason"
                                        value={newLostReason}
                                        onChange={(e) => setNewLostReason(e.target.value)}
                                        className="bg-black/50 border-white/20 text-white"
                                        onKeyDown={(e) => handleKeyDown(e, addLostReason)}
                                    />
                                    <Button onClick={addLostReason} disabled={loading || !newLostReason} className="bg-white/10 hover:bg-white/20 text-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Reorder.Group
                                    axis="x"
                                    values={lostReasons}
                                    onReorder={(newOrder) => {
                                        setLostReasons(newOrder);
                                        debouncedSave(undefined, undefined, undefined, undefined, undefined, newOrder);
                                    }}
                                    className="flex flex-nowrap overflow-x-auto gap-2 w-full list-none p-1 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                >
                                    {lostReasons.map((reason, index) => (
                                        <Reorder.Item key={reason.label} value={reason}>
                                            <TagEditor
                                                tag={reason}
                                                onSave={(l, b, t) => updateLostReason(index, l, b, t)}
                                                onDelete={() => removeLostReason(index)}
                                            >
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${reason.bg} ${reason.text} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                    <GripVertical className="h-3 w-3 opacity-50 mr-1 cursor-grab active:cursor-grabbing" />
                                                    {reason.label}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeLostReason(index); }}
                                                        className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </TagEditor>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>

                            {/* Sources */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Lead Sources</h3>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New Source"
                                        value={newSource}
                                        onChange={(e) => setNewSource(e.target.value)}
                                        className="bg-black/50 border-white/20 text-white"
                                        onKeyDown={(e) => handleKeyDown(e, addSource)}
                                    />
                                    <Button onClick={addSource} disabled={loading || !newSource} className="bg-white/10 hover:bg-white/20 text-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Reorder.Group
                                    axis="x"
                                    values={sources}
                                    onReorder={(newOrder) => {
                                        setSources(newOrder);
                                        debouncedSave(undefined, undefined, undefined, newOrder);
                                    }}
                                    className="flex flex-nowrap overflow-x-auto gap-2 w-full list-none p-1 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                >
                                    {sources.map((source, index) => (
                                        <Reorder.Item key={source.label} value={source}>
                                            <TagEditor
                                                tag={source}
                                                onSave={(l, b, t) => updateSource(index, l, b, t)}
                                                onDelete={() => removeSource(index)}
                                            >
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${source.bg} ${source.text} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                    <GripVertical className="h-3 w-3 opacity-50 mr-1 cursor-grab active:cursor-grabbing" />
                                                    {source.label}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeSource(index); }}
                                                        className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </TagEditor>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>

                            {/* Custom Field */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Custom Field</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs text-gray-500">Field Name</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={customFieldName}
                                                    onChange={(e) => setCustomFieldName(e.target.value)}
                                                    className="bg-black/50 border-white/20 text-white h-8 w-full"
                                                    onKeyDown={(e) => handleKeyDown(e, () => saveSettings())}
                                                />
                                                <Button
                                                    onClick={() => saveSettings()}
                                                    disabled={loading || !customFieldName}
                                                    className="bg-white/10 hover:bg-white/20 text-white px-3"
                                                >
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs text-gray-500">Field Options</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="New Option"
                                                    value={newCustomOption}
                                                    onChange={(e) => setNewCustomOption(e.target.value)}
                                                    className="bg-black/50 border-white/20 text-white"
                                                    onKeyDown={(e) => handleKeyDown(e, addCustomOption)}
                                                />
                                                <Button onClick={addCustomOption} disabled={loading || !newCustomOption} className="bg-white/10 hover:bg-white/20 text-white">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Reorder.Group
                                        axis="x"
                                        values={customOptions}
                                        onReorder={(newOrder) => {
                                            setCustomOptions(newOrder);
                                            debouncedSave(undefined, undefined, undefined, undefined, newOrder);
                                        }}
                                        className="flex flex-nowrap overflow-x-auto gap-2 mt-2 w-full list-none p-1 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                    >
                                        {customOptions.map((opt, index) => (
                                            <Reorder.Item key={opt.label} value={opt}>
                                                <TagEditor
                                                    tag={opt}
                                                    onSave={(l, b, t) => updateCustomOption(index, l, b, t)}
                                                >
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${opt.bg} ${opt.text} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                        <GripVertical className="h-3 w-3 opacity-50 mr-1 cursor-grab active:cursor-grabbing" />
                                                        {opt.label}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeCustomOption(index); }}
                                                            className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </TagEditor>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            </div>

                        </div>
                    </div>

                    <DialogFooter className="mt-8 pt-4 border-t border-white/10">
                        <Button variant="ghost" onClick={onClose} className="bg-transparent hover:bg-white/10 text-white">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white z-[10000] max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Delete
                            {itemToDelete?.type === 'product' && <span className="font-semibold text-white"> {products[itemToDelete.index]?.name}</span>}
                            {itemToDelete?.type === 'status' && <span className="font-semibold text-white"> {statuses[itemToDelete.index]?.label}</span>}
                            {itemToDelete?.type === 'responsible' && <span className="font-semibold text-white"> {responsibles[itemToDelete.index]?.label}</span>}
                            {itemToDelete?.type === 'source' && <span className="font-semibold text-white"> {sources[itemToDelete.index]?.label}</span>}
                            {itemToDelete?.type === 'lostReason' && <span className="font-semibold text-white"> {lostReasons[itemToDelete.index]?.label}</span>}
                            {itemToDelete?.type === 'customOption' && <span className="font-semibold text-white"> {customOptions[itemToDelete.index]?.label}</span>}
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {itemToDelete && itemToDelete.type !== 'product' && getTransferOptions().length > 0 && (
                        <div className="py-2 space-y-2">
                            <Label className="text-xs text-gray-400">Transfer leads to a new tag:</Label>
                            <Select value={transferTarget} onValueChange={setTransferTarget}>
                                <SelectTrigger className="w-full h-8 bg-black/50 border-white/20 text-white text-xs">
                                    <SelectValue placeholder="Select replacement tag..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white z-[10001]">
                                    {getTransferOptions().map((opt, idx) => (
                                        <SelectItem key={idx} value={opt.label}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-yellow-500/80">
                                Warning: Leads using this tag will be transferred to the selected tag.
                            </p>
                        </div>
                    )}

                    <AlertDialogFooter className="gap-2 sm:space-x-0 mt-2">
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white border-0 h-8 text-xs"
                            disabled={loading || !!(itemToDelete && itemToDelete.type !== 'product' && getTransferOptions().length > 0 && !transferTarget)}
                        >
                            {loading ? "Processing..." : "Confirm Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
