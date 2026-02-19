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

    // Edit/Delete State
    const [itemToDelete, setItemToDelete] = useState<{ type: 'product', index: number } | null>(null);

    // Product Deletion State
    const [productDeleteInfo, setProductDeleteInfo] = useState<{ count: number, productName: string, index: number } | null>(null);
    const [selectedReassignProduct, setSelectedReassignProduct] = useState<string>("");

    // Transfer State
    const [transferTarget, setTransferTarget] = useState<string>("");

    // Get available options for transfer based on itemToDelete
    const getTransferOptions = () => {
        return [];
    };

    // Sync state when settings prop updates
    useEffect(() => {
        if (!settings) return;
        setProducts(settings.products || []);
        setStatuses(settings.statuses || []);
        setResponsibles(normalizeTags(settings.responsibles || []));
        setSources(normalizeTags(settings.sources || []));
        setLostReasons(normalizeTags(settings.lost_reasons || []));
        // setTemperatures(normalizeTags(settings.temperatures || [])); // Removed
        setCustomFieldName(settings.custom_fields?.name || "Category");
        setCustomOptions(normalizeTags(settings.custom_fields?.options || []));
        setRevenueGoal(settings.revenue_goal || 0);
        setAvgTicket(settings.avg_ticket || 0);
        setCloseRate(settings.close_rate || 0);
    }, [settings]);

    // Reset transfer target when delete modal opens
    useEffect(() => {
        setTransferTarget("");
    }, [itemToDelete]);

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

    const confirmDeleteProduct = async (index: number) => {
        try {
            const product = products[index];
            if (!product) return;

            setLoading(true);
            console.log(`[Client] Checking usage for product: ${product.name}`);
            const result = await checkProductUsage(product.name);
            console.log(`[Client] Usage check result:`, result);

            // Handle case where result might be undefined if action fails completely
            const count = result?.count || 0;

            if (count > 0) {
                setProductDeleteInfo({ count, productName: product.name, index });
                setItemToDelete(null);
            } else {
                setItemToDelete({ type: 'product', index });
            }
        } catch (error) {
            console.error("Error checking product usage:", error);
            toast.error("Failed to check product usage. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleProductDeleteConfirm = async () => {
        if (!productDeleteInfo) return;
        setLoading(true);

        try {
            const { productName, index } = productDeleteInfo;

            // 1. Handle Reassignment or Removal from Leads
            if (selectedReassignProduct) {
                await transferProduct(productName, selectedReassignProduct);
                toast.success(`Leads reassigned to ${selectedReassignProduct}`);
            } else {
                // Just remove the product from leads
                await transferProduct(productName);
                toast.success(`Product removed from ${productDeleteInfo.count} leads`);
            }

            // 2. Delete Product from Settings
            const updatedProducts = [...products];
            updatedProducts.splice(index, 1);
            setProducts(updatedProducts);
            await saveSettings(updatedProducts, undefined, undefined, undefined, undefined, undefined, true);

            toast.success("Product deleted successfully!");
            setProductDeleteInfo(null);
            setSelectedReassignProduct("");

        } catch (e) {
            console.error(e);
            toast.error("Failed to delete product.");
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

    const saveEditedProduct = () => {
        if (editingProductIndex === null) return;
        if (!editingProductData.name || !editingProductData.price) return;

        const updatedProducts = [...products];
        updatedProducts[editingProductIndex] = {
            name: editingProductData.name,
            price: editingProductData.price
        };

        setProducts(updatedProducts);
        // Save immediately (not silent) to show feedback
        saveSettings(updatedProducts, undefined, undefined, undefined, undefined, undefined, false);
        setEditingProductIndex(null);
        setEditingProductData({ name: '', price: '' });
    };

    // Generic Delete handler with Transfer Logic
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setLoading(true);

        const { type, index } = itemToDelete;

        try {
            if (type === 'product') {
                const updatedProducts = [...products];
                updatedProducts.splice(index, 1);
                setProducts(updatedProducts);
                await saveSettings(updatedProducts, undefined, undefined, undefined, undefined, undefined, true);
                toast.success("Product deleted successfully!");
                setItemToDelete(null);
            }
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
            {/* Product Reassignment Modal */}
            <Dialog open={!!productDeleteInfo} onOpenChange={(open) => !open && setProductDeleteInfo(null)}>
                <DialogContent className="bg-[#1a1a1a] border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Product: {productDeleteInfo?.productName}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            This product is currently associated with <span className="text-white font-bold">{productDeleteInfo?.count} leads</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <p className="text-sm text-gray-300">What would you like to do with these leads?</p>
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-400 uppercase">Reassign to (Optional)</Label>
                            <Select value={selectedReassignProduct} onValueChange={setSelectedReassignProduct}>
                                <SelectTrigger className="bg-black/50 border-white/20 text-white">
                                    <SelectValue placeholder="Leave empty to just remove product" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="remove_only_placeholder">Leave empty (Remove product from leads)</SelectItem>
                                    {products
                                        .filter((_, idx) => idx !== productDeleteInfo?.index)
                                        .map((p, idx) => (
                                            <SelectItem key={idx} value={p.name}>{p.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-gray-500">
                                If you leave this empty, the product "{productDeleteInfo?.productName}" will simply be removed from the leads' product list.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setProductDeleteInfo(null)} disabled={loading}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleProductDeleteConfirm}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading ? "Processing..." : "Confirm Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-white/10"
                                                                        onClick={() => confirmDeleteProduct(index)}
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
                                                        <Reorder.Item key={tag.label} value={source}>
                                                            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/10 group">
                                                                <GripVertical className="h-3.5 w-3.5 text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                                                <TagEditor
                                                                    tag={tag}
                                                                    onSave={(l, b, t) => updateSource(index, l, b, t)}
                                                                >
                                                                    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs border border-white/10 ${tag.bg} ${tag.text} cursor-pointer hover:brightness-110 transition-all shadow-sm flex-1 truncate`}>
                                                                        <span className="truncate">{tag.label}</span>
                                                                    </div>
                                                                </TagEditor>
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
                                                        <Reorder.Item key={tag.label} value={reason}>
                                                            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/10 group">
                                                                <GripVertical className="h-3.5 w-3.5 text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                                                <TagEditor
                                                                    tag={tag}
                                                                    onSave={(l, b, t) => updateLostReason(index, l, b, t)}
                                                                >
                                                                    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs border border-white/10 ${tag.bg} ${tag.text} cursor-pointer hover:brightness-110 transition-all shadow-sm flex-1 truncate`}>
                                                                        <span className="truncate">{tag.label}</span>
                                                                    </div>
                                                                </TagEditor>
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
                                                        <Reorder.Item key={tag.label} value={option}>
                                                            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/10 group">
                                                                <GripVertical className="h-3.5 w-3.5 text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                                                <TagEditor
                                                                    tag={tag}
                                                                    onSave={(l, b, t) => updateCustomOption(index, l, b, t)}
                                                                >
                                                                    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs border border-white/10 ${tag.bg} ${tag.text} cursor-pointer hover:brightness-110 transition-all shadow-sm flex-1 truncate`}>
                                                                        <span className="truncate">{tag.label}</span>
                                                                    </div>
                                                                </TagEditor>
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
                                <div className="space-y-8 max-w-2xl">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-100 mb-2">Pipeline Health Calculator</h3>
                                        <p className="text-sm text-blue-200/80 mb-4">
                                            Configure your revenue goals to automatically calculate if your pipeline is healthy.
                                            The system compares your <strong>Needed Pipeline</strong> vs <strong>Actual Pipeline (Closing Phase)</strong>.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <h4 className="font-semibold text-gray-200">Revenue Goals</h4>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-gray-400">Monthly Revenue Goal</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                    <Input
                                                        type="number"
                                                        value={revenueGoal}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setRevenueGoal(val);
                                                            debouncedSave(undefined, undefined, undefined, undefined, undefined, undefined, false, { revenue_goal: val });
                                                        }}
                                                        className="pl-7 bg-black/50 border-white/20 text-white"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500">Monthly revenue target to calculate pipeline health.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Average Ticket</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                    <Input
                                                        type="number"
                                                        value={avgTicket}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setAvgTicket(val);
                                                            debouncedSave(undefined, undefined, undefined, undefined, undefined, undefined, false, { avg_ticket: val });
                                                        }}
                                                        className="pl-7 bg-black/50 border-white/20 text-white"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500">Average deal value.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <h4 className="font-semibold text-gray-200">Conversion Metrics</h4>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Close Rate (%)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={closeRate}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setCloseRate(val);
                                                            debouncedSave(undefined, undefined, undefined, undefined, undefined, undefined, false, { close_rate: val });
                                                        }}
                                                        className="pr-8 bg-black/50 border-white/20 text-white"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">Historical closing percentage (e.g. 20 for 20%).</p>
                                                <p className="text-[10px] text-gray-500">
                                                    Percentage of "Closing" leads that typically become customers.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Calculation */}
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                                        <h4 className="font-semibold text-gray-200">Projected Requirements</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-black/30 rounded border border-white/10">
                                                <span className="text-xs text-gray-400 block mb-1">Needed Customers</span>
                                                <span className="text-xl font-bold text-white">
                                                    {avgTicket > 0 ? Math.ceil(revenueGoal / avgTicket) : 0}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-black/30 rounded border border-white/10">
                                                <span className="text-xs text-gray-400 block mb-1">Needed Advanced Pipeline (Deals)</span>
                                                <span className="text-xl font-bold text-[#1C73E8]">
                                                    {avgTicket > 0 && closeRate > 0 ? Math.ceil((revenueGoal / avgTicket) / (closeRate / 100)) : 0}
                                                </span>
                                            </div>
                                        </div>
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

            <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent className="bg-[#1a1a1a] border border-white/10 text-white z-[200]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete the tag.
                        </AlertDialogDescription>
                    </AlertDialogHeader>


                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    );
}
