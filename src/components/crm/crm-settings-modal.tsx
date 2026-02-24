"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Check, X, Plus, Save, GripVertical, Pencil } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Reorder } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { updateCrmSettings } from "@/actions/crm/update-crm-settings";
import { updateCrmStatuses } from "@/actions/crm/update-statuses"; // NEW
import { transferLeadsTag } from "@/actions/crm/transfer-leads-tag";
import { checkProductUsage, transferProduct } from "@/actions/crm/product-actions"; // NEW IMPORTS
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
import { formatCurrency } from "@/lib/utils";

export interface TagItem {
    id?: string | number;
    label: string;
    bg: string;
    text: string;
    email?: string;
    phase?: 'not_started' | 'in_progress' | 'closing';
    temperature?: 'Cold' | 'Warm' | 'Hot';
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
    leads?: any[];
}

import { StatusItem } from "./status-item";

// Internal component for editing a Tag (Name + Color + Phase)
export function TagEditor({
    tag,
    onSave,
    children
}: {
    tag: TagItem,
    onSave: (newLabel: string, newBg: string, newText: string) => void,
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
            <PopoverContent className="w-[260px] p-3 bg-[#1a1a1a] border-white/10 flex flex-col gap-3 z-[9999]">
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

export function CrmSettingsModal({ isOpen, onClose, settings, leads = [] }: CrmSettingsModalProps) {
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
        overrideLostReasons?: any[],
        silent: boolean = false,
        overrideMetrics?: { revenue_goal?: number; avg_ticket?: number; close_rate?: number }
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
                silent,
                overrideMetrics
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

    // Pipeline Health Metrics
    const [revenueGoal, setRevenueGoal] = useState<number>(settings?.revenue_goal || 0);
    const [avgTicket, setAvgTicket] = useState<number>(settings?.avg_ticket || 0);
    const [closeRate, setCloseRate] = useState<number>(settings?.close_rate || 0);
    const [showPipelineSummary, setShowPipelineSummary] = useState(false);


    // Custom Field State
    const [customFieldName, setCustomFieldName] = useState(settings?.custom_fields?.name || "Category");
    const [customOptions, setCustomOptions] = useState<TagItem[]>(normalizeTags(settings?.custom_fields?.options));

    // Local state for inputs
    const [newProduct, setNewProduct] = useState({ name: '', price: '' });
    const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
    const [editingProductData, setEditingProductData] = useState({ name: '', price: '' });
    const [newStatus, setNewStatus] = useState({ label: "", bg: "bg-gray-500", text: "text-white" });
    const [newSource, setNewSource] = useState("");
    const [newLostReason, setNewLostReason] = useState("");
    const [newCustomOption, setNewCustomOption] = useState("");

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
        setRevenueGoal(settings.revenue_goal || 0);
        setAvgTicket(settings.avg_ticket || 0);
        setCloseRate(settings.close_rate || 0);
    }, [settings]);

    const saveSettings = async (
        overrideProducts?: any[],
        overrideStatuses?: any[],
        overrideResponsibles?: any[],
        overrideSources?: any[],
        overrideCustomOptions?: any[],
        overrideLostReasons?: any[],
        silent: boolean = false,
        overrideMetrics?: { revenue_goal?: number, avg_ticket?: number, close_rate?: number }
    ) => {
        setLoading(true);
        try {
            const updatedSettings = {
                products: overrideProducts || products,
                statuses: overrideStatuses || statuses,
                responsibles: overrideResponsibles || responsibles,
                sources: overrideSources || sources,
                lost_reasons: overrideLostReasons || lostReasons,
                // temperatures: settings.temperatures, // Temporarily removed to fix save error if column missing
                custom_fields: {
                    name: customFieldName,
                    options: overrideCustomOptions || customOptions
                },
                revenue_goal: overrideMetrics?.revenue_goal ?? revenueGoal,
                avg_ticket: overrideMetrics?.avg_ticket ?? avgTicket,
                close_rate: overrideMetrics?.close_rate ?? closeRate,
            };

            const result = await updateCrmSettings(updatedSettings);

            if (result.success) {
                if (!silent) {
                    toast.success("Saved successfully!");
                }
                router.refresh();
            } else {
                console.error("Save failed:", result.error);
                toast.error(`Failed to save: ${result.error}`);
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

    const deleteProduct = async (index: number) => {
        try {
            const product = products[index];
            if (!product) return;

            // Simple confirmation
            if (!window.confirm(`Delete product "${product.name}"? This will remove it from all leads.`)) {
                return;
            }

            setLoading(true);

            // Remove product from leads
            await transferProduct(product.name);

            // Delete from settings
            const updatedProducts = [...products];
            updatedProducts.splice(index, 1);
            setProducts(updatedProducts);
            await saveSettings(updatedProducts, undefined, undefined, undefined, undefined, undefined, false);

            toast.success("Product deleted successfully!");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        } finally {
            setLoading(false);
        }
    };

    const startEditingProduct = (index: number) => {
        const product = products[index];
        setEditingProductIndex(index);
        setEditingProductData({ name: product.name, price: String(product.price) });
    };

    const cancelEditProduct = () => {
        setEditingProductIndex(null);
        setEditingProductData({ name: '', price: '' });
    };

    const saveEditedProduct = async () => {
        if (editingProductIndex === null) return;
        if (!editingProductData.name || !editingProductData.price) return;

        const updatedProducts = [...products];
        updatedProducts[editingProductIndex] = {
            name: editingProductData.name,
            price: editingProductData.price
        };

        setProducts(updatedProducts);
        await saveSettings(updatedProducts, undefined, undefined, undefined, undefined, undefined, false);
        setEditingProductIndex(null);
        setEditingProductData({ name: '', price: '' });
    };

    // Helper to get random color
    const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    // --- Statuses ---
    const addStatus = async () => {
        if (!newStatus.label) return;
        const color = getRandomColor();
        const newStatusObj: TagItem = { ...newStatus, ...color, id: crypto.randomUUID(), phase: 'not_started', temperature: 'Cold' };
        const updatedStatuses = [...statuses, newStatusObj];
        setStatuses(updatedStatuses);
        setNewStatus({ label: "", bg: "bg-gray-500", text: "text-white" });
        await updateCrmStatuses(updatedStatuses);
    };

    const [statusToDelete, setStatusToDelete] = useState<number | null>(null);

    const updateStatus = async (index: number, label: string, bg: string, text: string, phase?: 'not_started' | 'in_progress' | 'closing', temperature?: 'Cold' | 'Warm' | 'Hot') => {
        const updatedStatuses = [...statuses];
        updatedStatuses[index] = {
            ...updatedStatuses[index],
            label,
            bg,
            text,
            phase: phase || 'not_started',
            temperature: temperature || 'Cold'
        };
        setStatuses(updatedStatuses);
        await updateCrmStatuses(updatedStatuses);
    }

    const deleteStatus = async (index: number) => {
        if (!window.confirm("Are you sure you want to delete this status? All leads with this status will need to be updated.")) {
            return;
        }
        try {
            const updated = [...statuses];
            updated.splice(index, 1);
            setStatuses(updated);
            await updateCrmStatuses(updated);
            toast.success("Status deleted");
        } catch (error) {
            console.error("Error deleting status:", error);
            toast.error("Failed to delete status");
        }
    }

    // --- Others ---

    const addSource = async () => {
        if (!newSource || sources.some(s => s.label === newSource)) return;
        const color = getRandomColor();
        const updated = [...sources, { label: newSource, ...color }];
        setSources(updated);
        setNewSource("");
        await saveSettings(undefined, undefined, undefined, updated);
    };

    const updateSource = async (index: number, label: string, bg: string, text: string) => {
        const updated = [...sources];
        updated[index] = { ...updated[index], label, bg, text };
        setSources(updated);
        await saveSettings(undefined, undefined, undefined, updated, undefined, undefined, true);
    }

    const deleteSource = async (index: number) => {
        try {
            const updated = [...sources];
            updated.splice(index, 1);
            setSources(updated);
            await saveSettings(undefined, undefined, undefined, updated, undefined, undefined, false);
            toast.success("Source deleted");
        } catch (error) {
            console.error("Error deleting source:", error);
            toast.error("Failed to delete source");
        }
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

    const updateLostReason = async (index: number, label: string, bg: string, text: string) => {
        const updated = [...lostReasons];
        updated[index] = { ...updated[index], label, bg, text };
        setLostReasons(updated);
        await saveSettings(undefined, undefined, undefined, undefined, undefined, updated, true);
    }

    const deleteLostReason = async (index: number) => {
        try {
            const updated = [...lostReasons];
            updated.splice(index, 1);
            setLostReasons(updated);
            await saveSettings(undefined, undefined, undefined, undefined, undefined, updated, false);
            toast.success("Lost reason deleted");
        } catch (error) {
            console.error("Error deleting lost reason:", error);
            toast.error("Failed to delete lost reason");
        }
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

    const updateCustomOption = async (index: number, label: string, bg: string, text: string) => {
        const updated = [...customOptions];
        updated[index] = { ...updated[index], label, bg, text };
        setCustomOptions(updated);
        await saveSettings(undefined, undefined, undefined, undefined, updated, undefined, true);
    }

    const deleteCustomOption = async (index: number) => {
        try {
            const updated = [...customOptions];
            updated.splice(index, 1);
            setCustomOptions(updated);
            await saveSettings(undefined, undefined, undefined, undefined, updated, undefined, false);
            toast.success("Custom option deleted");
        } catch (error) {
            console.error("Error deleting custom option:", error);
            toast.error("Failed to delete custom option");
        }
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
                <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] h-[90vh] bg-[#0A0A0A] text-white p-0 border border-white/10 rounded-lg flex flex-col gap-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 pb-2 border-b border-white/10 shrink-0">
                        <DialogTitle className="text-xl font-bold">CRM Settings</DialogTitle>
                        <DialogDescription className="text-gray-400">Manage your CRM products, statuses, and options.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden p-6 pt-4">
                        <Tabs defaultValue="products" className="w-full h-full flex flex-col">
                            <TabsList className="bg-black/20 border border-white/10 w-fit">
                                <TabsTrigger value="products">Products</TabsTrigger>
                                <TabsTrigger value="tags">Tags</TabsTrigger>
                                <TabsTrigger value="pipeline-health">Pipeline Health</TabsTrigger>
                            </TabsList>

                            <TabsContent value="products" className="flex-1 overflow-y-auto mt-4 pr-2">
                                <div className="flex flex-col gap-8 pb-10">
                                    {/* Products Section */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Products / Services</h3>
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
                                                        {editingProductIndex === index ? (
                                                            <div className="flex items-center gap-2 flex-1 mr-2">
                                                                <Input
                                                                    value={editingProductData.name}
                                                                    onChange={(e) => setEditingProductData({ ...editingProductData, name: e.target.value })}
                                                                    className="bg-black/50 border-white/20 text-white flex-1 h-8 text-sm"
                                                                    placeholder="Product Name"
                                                                    autoFocus
                                                                    onKeyDown={(e) => handleKeyDown(e, saveEditedProduct)}
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    value={editingProductData.price}
                                                                    onChange={(e) => setEditingProductData({ ...editingProductData, price: e.target.value })}
                                                                    className="bg-black/50 border-white/20 text-white w-24 h-8 text-sm"
                                                                    placeholder="Price"
                                                                    onKeyDown={(e) => handleKeyDown(e, saveEditedProduct)}
                                                                />
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                                                        onClick={saveEditedProduct}
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                                                                        onClick={cancelEditProduct}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-medium text-sm text-white">{product.name}</span>
                                                                    <span className="text-xs text-gray-400 border-l border-white/10 pl-3">
                                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(product.price))}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 text-blue-400 hover:text-blue-300 hover:bg-white/10"
                                                                        onClick={() => startEditingProduct(index)}
                                                                        type="button"
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-white/10"
                                                                        onClick={() => deleteProduct(index)}
                                                                        disabled={loading}
                                                                        type="button"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                                {products.length === 0 && (
                                                    <div className="text-center py-4 text-gray-500 text-sm">No products added yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="tags" className="flex-1 overflow-hidden mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full p-1 overflow-y-auto lg:overflow-hidden">
                                    {/* Column 1: Pipeline Statuses */}
                                    <div className="flex flex-col gap-4 bg-white/[0.02] p-4 rounded-lg border border-white/5 lg:overflow-hidden h-full min-h-[400px]">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2">Pipeline Status</h3>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="New Status Label"
                                                value={newStatus.label}
                                                onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                                                className="h-9 bg-black/50 border-white/20 text-white text-sm"
                                                onKeyDown={(e) => handleKeyDown(e, addStatus)}
                                            />
                                            <Button size="sm" onClick={addStatus} disabled={loading || !newStatus.label} className="bg-white/10 hover:bg-white/20 text-white">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                            <Reorder.Group
                                                axis="y"
                                                values={statuses}
                                                onReorder={(newOrder) => {
                                                    setStatuses(newOrder);
                                                    updateCrmStatuses(newOrder);
                                                }}
                                                className="flex flex-col gap-2 w-full list-none py-1"
                                            >
                                                {statuses.map((status, index) => (
                                                    <StatusItem
                                                        key={status.id || `status-${index}-${status.label}`} // Fallback key if ID is missing, but ID should be present
                                                        status={status}
                                                        index={index}
                                                        settings={settings}
                                                        updateStatus={updateStatus}
                                                        TagEditorComponent={TagEditor}
                                                        onDelete={deleteStatus}
                                                    />
                                                ))}
                                            </Reorder.Group>
                                        </div>
                                    </div>

                                    {/* Column 2: Lead Sources */}
                                    <div className="flex flex-col gap-4 bg-white/[0.02] p-4 rounded-lg border border-white/5 lg:overflow-hidden h-full min-h-[400px]">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2">Lead Sources</h3>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="New Source Label"
                                                value={newSource}
                                                onChange={(e) => setNewSource(e.target.value)}
                                                className="h-9 bg-black/50 border-white/20 text-white text-sm"
                                                onKeyDown={(e) => handleKeyDown(e, addSource)}
                                            />
                                            <Button size="sm" onClick={addSource} disabled={loading || !newSource} className="bg-white/10 hover:bg-white/20 text-white">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                            <Reorder.Group
                                                axis="y"
                                                values={sources}
                                                onReorder={(newOrder) => {
                                                    setSources(newOrder);
                                                    debouncedSave(undefined, undefined, undefined, newOrder);
                                                }}
                                                className="flex flex-col gap-2 w-full list-none py-1"
                                            >
                                                {sources.map((source, index) => {
                                                    const tag = typeof source === 'string' ? { label: source, bg: 'bg-slate-800', text: 'text-slate-100' } : source;
                                                    return (
                                                        <Reorder.Item key={tag.label} value={source} className="list-none">
                                                            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/10 group">
                                                                <div className="cursor-grab active:cursor-grabbing flex-shrink-0">
                                                                    <GripVertical className="h-3.5 w-3.5 text-gray-600" />
                                                                </div>
                                                                <TagEditor
                                                                    tag={tag}
                                                                    onSave={(l, b, t) => updateSource(index, l, b, t)}
                                                                >
                                                                    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs border border-white/10 ${tag.bg} ${tag.text} cursor-pointer hover:brightness-110 transition-all shadow-sm flex-1 truncate`}>
                                                                        <span className="truncate">{tag.label}</span>
                                                                    </div>
                                                                </TagEditor>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                                    onMouseDown={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        setTimeout(() => deleteSource(index), 0);
                                                                    }}
                                                                    type="button"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </Reorder.Item>
                                                    )
                                                })}
                                            </Reorder.Group>
                                        </div>
                                    </div>

                                    {/* Column 3: Lost Reasons */}
                                    <div className="flex flex-col gap-4 bg-white/[0.02] p-4 rounded-lg border border-white/5 lg:overflow-hidden h-full min-h-[400px]">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2">Lost Reasons</h3>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="New Reason Label"
                                                value={newLostReason}
                                                onChange={(e) => setNewLostReason(e.target.value)}
                                                className="h-9 bg-black/50 border-white/20 text-white text-sm"
                                                onKeyDown={(e) => handleKeyDown(e, addLostReason)}
                                            />
                                            <Button size="sm" onClick={addLostReason} disabled={loading || !newLostReason} className="bg-white/10 hover:bg-white/20 text-white">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                            <Reorder.Group
                                                axis="y"
                                                values={lostReasons}
                                                onReorder={(newOrder) => {
                                                    setLostReasons(newOrder);
                                                    debouncedSave(undefined, undefined, undefined, undefined, undefined, newOrder);
                                                }}
                                                className="flex flex-col gap-2 w-full list-none py-1"
                                            >
                                                {lostReasons.map((reason, index) => {
                                                    const tag = typeof reason === 'string' ? { label: reason, bg: 'bg-red-900', text: 'text-red-100' } : reason;
                                                    return (
                                                        <Reorder.Item key={tag.label} value={reason} className="list-none">
                                                            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/10 group">
                                                                <div className="cursor-grab active:cursor-grabbing flex-shrink-0">
                                                                    <GripVertical className="h-3.5 w-3.5 text-gray-600" />
                                                                </div>
                                                                <TagEditor
                                                                    tag={tag}
                                                                    onSave={(l, b, t) => updateLostReason(index, l, b, t)}
                                                                >
                                                                    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs border border-white/10 ${tag.bg} ${tag.text} cursor-pointer hover:brightness-110 transition-all shadow-sm flex-1 truncate`}>
                                                                        <span className="truncate">{tag.label}</span>
                                                                    </div>
                                                                </TagEditor>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                                    onMouseDown={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        setTimeout(() => deleteLostReason(index), 0);
                                                                    }}
                                                                    type="button"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </Reorder.Item>
                                                    )
                                                })}
                                            </Reorder.Group>
                                        </div>
                                    </div>

                                    {/* Column 4: Custom Fields */}
                                    <div className="flex flex-col gap-4 bg-white/[0.02] p-4 rounded-lg border border-white/5 lg:overflow-hidden h-full min-h-[400px]">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Custom Options</h3>
                                            <Input
                                                value={customFieldName}
                                                onChange={(e) => setCustomFieldName(e.target.value)}
                                                onBlur={() => debouncedSave()}
                                                className="h-6 w-24 px-1 text-[10px] bg-transparent border-white/10 text-white focus:border-white/30 text-right"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder={`New ${customFieldName}...`}
                                                value={newCustomOption}
                                                onChange={(e) => setNewCustomOption(e.target.value)}
                                                className="h-9 bg-black/50 border-white/20 text-white text-sm"
                                                onKeyDown={(e) => handleKeyDown(e, addCustomOption)}
                                            />
                                            <Button size="sm" onClick={addCustomOption} disabled={loading || !newCustomOption} className="bg-white/10 hover:bg-white/20 text-white">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                            <Reorder.Group
                                                axis="y"
                                                values={customOptions}
                                                onReorder={(newOrder) => {
                                                    setCustomOptions(newOrder);
                                                    debouncedSave(undefined, undefined, undefined, undefined, newOrder);
                                                }}
                                                className="flex flex-col gap-2 w-full list-none py-1"
                                            >
                                                {customOptions.map((option, index) => {
                                                    const tag = typeof option === 'string' ? { label: option, bg: 'bg-slate-800', text: 'text-slate-100' } : option;
                                                    return (
                                                        <Reorder.Item key={tag.label} value={option} className="list-none">
                                                            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/10 group">
                                                                <div className="cursor-grab active:cursor-grabbing flex-shrink-0">
                                                                    <GripVertical className="h-3.5 w-3.5 text-gray-600" />
                                                                </div>
                                                                <TagEditor
                                                                    tag={tag}
                                                                    onSave={(l, b, t) => updateCustomOption(index, l, b, t)}
                                                                >
                                                                    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs border border-white/10 ${tag.bg} ${tag.text} cursor-pointer hover:brightness-110 transition-all shadow-sm flex-1 truncate`}>
                                                                        <span className="truncate">{tag.label}</span>
                                                                    </div>
                                                                </TagEditor>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                                    onMouseDown={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        setTimeout(() => deleteCustomOption(index), 0);
                                                                    }}
                                                                    type="button"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </Reorder.Item>
                                                    )
                                                })}
                                            </Reorder.Group>
                                        </div>
                                    </div>

                                </div>
                            </TabsContent>

                            <TabsContent value="pipeline-health" className="flex-1 overflow-y-auto mt-4 pr-2">
                                <div className="space-y-6 max-w-5xl">
                                    {/* Flow Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        {/* Card 1: Average Ticket */}
                                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-blue-300 font-semibold">Average Ticket</Label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                                    <Input
                                                        type="number"
                                                        value={avgTicket}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setAvgTicket(val);
                                                            debouncedSave(undefined, undefined, undefined, undefined, undefined, undefined, false, { avg_ticket: val });
                                                        }}
                                                        className="pl-6 h-12 text-lg font-bold bg-black/50 border-blue-500/30 text-white"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-gray-400">You fill</p>
                                            </div>
                                        </div>

                                        {/* Card 2: Customers Needed */}
                                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-purple-300 font-semibold">Customers Needed</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={revenueGoal > 0 && avgTicket > 0 ? Math.ceil(revenueGoal / avgTicket) : 0}
                                                        onChange={(e) => {
                                                            const customers = Number(e.target.value);
                                                            const newRevenue = customers * avgTicket;
                                                            setRevenueGoal(newRevenue);
                                                            debouncedSave(undefined, undefined, undefined, undefined, undefined, undefined, false, { revenue_goal: newRevenue });
                                                        }}
                                                        className="h-12 text-lg font-bold bg-black/50 border-purple-500/30 text-white"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-gray-400">You fill</p>
                                            </div>
                                        </div>

                                        {/* Card 3: Revenue Goal (Calculated) */}
                                        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-emerald-300 font-semibold">Revenue Goal</Label>
                                                <div className="h-12 flex items-center justify-center bg-black/50 border border-emerald-500/30 rounded-md">
                                                    <span className="text-lg font-bold text-emerald-400">
                                                        ${revenueGoal.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-gray-400">System calculates</p>
                                            </div>
                                        </div>

                                        {/* Card 4: Close Rate */}
                                        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-orange-300 font-semibold">Close Rate</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={closeRate}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setCloseRate(val);
                                                            debouncedSave(undefined, undefined, undefined, undefined, undefined, undefined, false, { close_rate: val });
                                                        }}
                                                        className="pr-7 h-12 text-lg font-bold bg-black/50 border-orange-500/30 text-white"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                </div>
                                                <p className="text-[9px] text-gray-400">You fill</p>
                                            </div>
                                        </div>

                                        {/* Card 5: Needed Warm/Hot Leads (Calculated) */}
                                        <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-red-300 font-semibold">Warm/Hot Leads</Label>
                                                <div className="h-12 flex items-center justify-center bg-black/50 border border-red-500/30 rounded-md">
                                                    <span className="text-2xl font-bold text-red-400">
                                                        {avgTicket > 0 && closeRate > 0 ? Math.ceil((revenueGoal / avgTicket) / (closeRate / 100)) : 0}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-gray-400">System calculates</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pipeline Health Summary */}
                                    <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg">
                                        <Button
                                            onClick={() => setShowPipelineSummary(true)}
                                            className="w-full h-auto py-4 bg-transparent hover:bg-white/5 border-0"
                                            variant="ghost"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const neededCustomers = avgTicket > 0 ? Math.ceil(revenueGoal / avgTicket) : 0;
                                                        const neededWarmHot = avgTicket > 0 && closeRate > 0 ? Math.ceil(neededCustomers / (closeRate / 100)) : 0;
                                                        
                                                        // Count current Warm/Hot leads
                                                        const statusMap = new Map<string, { temperature?: string }>();
                                                        statuses.forEach(s => {
                                                            statusMap.set(s.label, { temperature: s.temperature });
                                                        });
                                                        const currentWarmHot = leads.filter(l => {
                                                            const statusInfo = statusMap.get(l.status);
                                                            const temperature = statusInfo?.temperature;
                                                            return temperature === 'Warm' || temperature === 'Hot';
                                                        }).length;
                                                        
                                                        const isHealthy = currentWarmHot >= neededWarmHot;
                                                        
                                                        return (
                                                            <>
                                                                {isHealthy ? (
                                                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                                                        <Check className="h-5 w-5 text-emerald-400" />
                                                                        <span className="text-sm font-semibold text-emerald-300">Pipeline Healthy</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                                                                        <X className="h-5 w-5 text-red-400" />
                                                                        <span className="text-sm font-semibold text-red-300">Action Required</span>
                                                                    </div>
                                                                )}
                                                                <span className="text-xs text-gray-400">Click to see details</span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </Button>
                                    </div>

                                    {/* Helper Text */}
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                        <p className="text-xs text-gray-400 text-center">
                                            💡 Conversion rate is calculated based on leads with Warm and Hot status criteria.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DialogFooter className="p-6 pt-2 border-t border-white/10 shrink-0">
                        <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={onClose}>Close</Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog >

            {/* Pipeline Summary Modal */}
            <Dialog open={showPipelineSummary} onOpenChange={setShowPipelineSummary}>
                <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Pipeline Health Summary</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {(() => {
                            const neededCustomers = avgTicket > 0 ? Math.ceil(revenueGoal / avgTicket) : 0;
                            const neededWarmHot = avgTicket > 0 && closeRate > 0 ? Math.ceil(neededCustomers / (closeRate / 100)) : 0;
                            
                            // Count current Warm/Hot leads
                            const statusMap = new Map<string, { temperature?: string }>();
                            statuses.forEach(s => {
                                statusMap.set(s.label, { temperature: s.temperature });
                            });
                            const currentWarmHot = leads.filter(l => {
                                const statusInfo = statusMap.get(l.status);
                                const temperature = statusInfo?.temperature;
                                return temperature === 'Warm' || temperature === 'Hot';
                            }).length;
                            
                            const shortfall = neededWarmHot - currentWarmHot;
                            const isHealthy = currentWarmHot >= neededWarmHot;
                            
                            return (
                                <div className="space-y-4">
                                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-lg">
                                        <p className="text-base leading-relaxed text-gray-200">
                                            You want to close{" "}
                                            <span className="font-bold text-emerald-400">{neededCustomers} customers</span>{" "}
                                            this month at an average ticket of{" "}
                                            <span className="font-bold text-blue-400">${avgTicket.toLocaleString()}</span>, 
                                            reaching a revenue of{" "}
                                            <span className="font-bold text-purple-400">${revenueGoal.toLocaleString()}</span>.
                                        </p>
                                    </div>
                                    
                                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-white/10 rounded-lg">
                                        <p className="text-base leading-relaxed text-gray-200">
                                            With a close rate of{" "}
                                            <span className="font-bold text-orange-400">{closeRate}%</span>, 
                                            you need{" "}
                                            <span className="font-bold text-red-400">{neededWarmHot} leads</span>{" "}
                                            with Warm or Hot status in your pipeline.
                                        </p>
                                    </div>
                                    
                                    <div className={`p-6 border rounded-lg ${
                                        isHealthy 
                                            ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20' 
                                            : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20'
                                    }`}>
                                        <p className="text-base leading-relaxed text-gray-200">
                                            Currently, you have{" "}
                                            <span className={`font-bold ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {currentWarmHot} leads
                                            </span>{" "}
                                            with Warm/Hot status.{" "}
                                            {isHealthy ? (
                                                <span className="font-bold text-emerald-400">
                                                    Your pipeline is healthy! 🎉
                                                </span>
                                            ) : (
                                                <span className="font-bold text-red-400">
                                                    You need {shortfall} more Warm/Hot leads to reach your goal.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    
                    <div className="flex justify-end">
                        <Button onClick={() => setShowPipelineSummary(false)} variant="ghost" className="text-gray-400 hover:text-white">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </>
    );
}
