"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Check, X, Plus, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { updateCrmSettings } from "@/actions/crm/update-crm-settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TagItem {
    label: string;
    bg: string;
    text: string;
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
import { Label } from "@/components/ui/label";

interface CrmSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: CrmSettings;
}



export function CrmSettingsModal({ isOpen, onClose, settings }: CrmSettingsModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Initialize state from props
    const [products, setProducts] = useState(settings?.products || []);
    const [statuses, setStatuses] = useState(settings?.statuses || []);

    // Helper to normalize tags to TagItem[]
    const normalizeTags = (items: (string | TagItem)[]): TagItem[] =>
        items?.map(item => typeof item === 'string' ? { label: item, bg: 'bg-slate-800', text: 'text-slate-100' } : item) || [];

    const [responsibles, setResponsibles] = useState<TagItem[]>(normalizeTags(settings?.responsibles));
    const [sources, setSources] = useState<TagItem[]>(normalizeTags(settings?.sources));

    // Custom Field State
    const [customFieldName, setCustomFieldName] = useState(settings?.custom_fields?.name || "Category");
    const [customOptions, setCustomOptions] = useState<TagItem[]>(normalizeTags(settings?.custom_fields?.options));

    // Local state for inputs
    const [newProduct, setNewProduct] = useState({ name: "", price: "" });
    const [newStatus, setNewStatus] = useState({ label: "", bg: "bg-gray-500", text: "text-white" });
    const [newResponsible, setNewResponsible] = useState("");
    const [newSource, setNewSource] = useState("");
    const [newCustomOption, setNewCustomOption] = useState("");

    // Edit/Delete State
    const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
    const [editingProductData, setEditingProductData] = useState({ name: "", price: "" });
    const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'status' | 'responsible' | 'source' | 'customOption', index: number } | null>(null);

    // Sync state when settings prop updates
    useEffect(() => {
        if (!settings) return;
        setProducts(settings.products || []);
        setStatuses(settings.statuses || []);
        setResponsibles(normalizeTags(settings.responsibles));
        setSources(normalizeTags(settings.sources));
        setCustomFieldName(settings.custom_fields?.name || "Category");
        setCustomOptions(normalizeTags(settings.custom_fields?.options));
    }, [settings]);


    const saveSettings = async (overrideProducts?: any[], overrideStatuses?: any[], overrideResponsibles?: any[], overrideSources?: any[], overrideCustomOptions?: any[], silent: boolean = false) => {
        setLoading(true);
        try {
            const updatedSettings = {
                products: overrideProducts || products,
                statuses: overrideStatuses || statuses,
                responsibles: overrideResponsibles || responsibles,
                sources: overrideSources || sources,
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
                // We typically verify via refresh, but keeping local state in sync is good
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

    const startEditingProduct = (index: number) => {
        setEditingProductIndex(index);
        setEditingProductData({ name: products[index].name, price: products[index].price });
    };

    const cancelEditingProduct = () => {
        setEditingProductIndex(null);
        setEditingProductData({ name: "", price: "" });
    };

    const saveEditedProduct = async (index: number) => {
        const updatedProducts = [...products];
        updatedProducts[index] = { ...updatedProducts[index], ...editingProductData };
        setProducts(updatedProducts);
        setEditingProductIndex(null);
        await saveSettings(updatedProducts);
    };

    const confirmDeleteProduct = (index: number) => {
        setItemToDelete({ type: 'product', index });
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        const { type, index } = itemToDelete;

        if (type === 'product') {
            const updatedProducts = [...products];
            updatedProducts.splice(index, 1);
            setProducts(updatedProducts);
            await saveSettings(updatedProducts, undefined, undefined, undefined, undefined, true);
        } else if (type === 'status') {
            const updatedStatuses = [...statuses];
            updatedStatuses.splice(index, 1);
            setStatuses(updatedStatuses);
            await saveSettings(undefined, updatedStatuses, undefined, undefined, undefined, true);
        } else if (type === 'responsible') {
            const updated = [...responsibles];
            updated.splice(index, 1);
            setResponsibles(updated);
            await saveSettings(undefined, undefined, updated, undefined, undefined, true);
        } else if (type === 'source') {
            const updated = [...sources];
            updated.splice(index, 1);
            setSources(updated);
            await saveSettings(undefined, undefined, undefined, updated, undefined, true);
        } else if (type === 'customOption') {
            const updated = [...customOptions];
            updated.splice(index, 1);
            setCustomOptions(updated);
            await saveSettings(undefined, undefined, undefined, undefined, updated, true);
        }

        toast.error("Deleted!", {
            style: {
                background: '#ef4444',
                color: 'white',
                border: 'none'
            }
        });
        router.refresh();
        setItemToDelete(null);
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

    const updateStatusColor = async (index: number, bg: string, text: string) => {
        const updatedStatuses = [...statuses];
        updatedStatuses[index] = { ...updatedStatuses[index], bg, text };
        setStatuses(updatedStatuses);
        await saveSettings(undefined, updatedStatuses, undefined, undefined, undefined, true);
    }

    // --- Others ---
    const addResponsible = async () => {
        if (!newResponsible || responsibles.some(r => r.label === newResponsible)) return;
        const color = getRandomColor();
        const updated = [...responsibles, { label: newResponsible, ...color }];
        setResponsibles(updated);
        setNewResponsible("");
        await saveSettings(undefined, undefined, updated);
    };

    const removeResponsible = (index: number) => {
        setItemToDelete({ type: 'responsible', index });
    };

    const updateResponsibleColor = async (index: number, bg: string, text: string) => {
        const updated = [...responsibles];
        updated[index] = { ...updated[index], bg, text };
        setResponsibles(updated);
        await saveSettings(undefined, undefined, updated, undefined, undefined, true);
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

    const updateSourceColor = async (index: number, bg: string, text: string) => {
        const updated = [...sources];
        updated[index] = { ...updated[index], bg, text };
        setSources(updated);
        await saveSettings(undefined, undefined, undefined, updated, undefined, true);
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

    const updateCustomOptionColor = async (index: number, bg: string, text: string) => {
        const updated = [...customOptions];
        updated[index] = { ...updated[index], bg, text };
        setCustomOptions(updated);
        await saveSettings(undefined, undefined, undefined, undefined, updated, true);
    }

    // Helper for Enter key
    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === "Enter") {
            e.preventDefault();
            action();
        }
    };

    // Color Picker Component
    const ColorPicker = ({ currentColor, onSelect }: { currentColor: string, onSelect: (bg: string, text: string) => void }) => (
        <div className="grid grid-cols-5 gap-2 p-2 w-[180px]">
            {COLORS.map((color, idx) => (
                <button
                    key={idx}
                    className={`w-6 h-6 rounded-full ${color.bg} border border-white/20 hover:scale-110 transition-transform ${currentColor === color.bg ? 'ring-2 ring-white' : ''}`}
                    onClick={() => onSelect(color.bg, color.text)}
                />
            ))}
        </div>
    );

    // --- Render ---
    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] max-h-[90vh] overflow-y-auto bg-[#1a1a1a] text-white p-6 border border-white/10 rounded-lg">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-bold">CRM Settings</DialogTitle>
                        <DialogDescription className="text-gray-400">Manage your CRM products, statuses, and options.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Products Column */}
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
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-sm text-white">{product.name}</span>
                                                <span className="text-xs text-gray-400 border-l border-white/10 pl-3">${Number(product.price).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Popover open={editingProductIndex === index} onOpenChange={(open) => setEditingProductIndex(open ? index : null)}>
                                                    <PopoverTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-96 bg-[#1a1a1a] border-white/10 p-4">
                                                        <div className="space-y-3">
                                                            <h4 className="font-medium text-sm text-gray-300">Edit Product</h4>
                                                            <div className="flex flex-col gap-3">
                                                                <div className="flex gap-2">
                                                                    <div className="flex-1 space-y-1">
                                                                        <Label className="text-xs text-gray-500">Name</Label>
                                                                        <Input
                                                                            defaultValue={product.name}
                                                                            className="bg-black/50 border-white/20 text-white h-8"
                                                                            onChange={(e) => {
                                                                                const updated = [...products];
                                                                                updated[index] = { ...updated[index], name: e.target.value };
                                                                                setProducts(updated);
                                                                            }}
                                                                            onKeyDown={(e) => handleKeyDown(e, () => {
                                                                                saveSettings(products);
                                                                                setEditingProductIndex(null);
                                                                            })}
                                                                        />
                                                                    </div>
                                                                    <div className="w-24 space-y-1">
                                                                        <Label className="text-xs text-gray-500">Price</Label>
                                                                        <Input
                                                                            defaultValue={product.price}
                                                                            className="bg-black/50 border-white/20 text-white h-8"
                                                                            type="number"
                                                                            onChange={(e) => {
                                                                                const updated = [...products];
                                                                                updated[index] = { ...updated[index], price: e.target.value };
                                                                                setProducts(updated);
                                                                            }}
                                                                            onKeyDown={(e) => handleKeyDown(e, () => {
                                                                                saveSettings(products);
                                                                                setEditingProductIndex(null);
                                                                            })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs px-4 w-fit"
                                                                    onClick={() => {
                                                                        saveSettings(products);
                                                                        setEditingProductIndex(null);
                                                                    }}
                                                                >
                                                                    Save Changes
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
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
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map((status, index) => (
                                        <Popover key={index}>
                                            <PopoverTrigger asChild>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${status.bg} ${status.text} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                    {status.label}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeStatus(index); }}
                                                        className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10">
                                                <ColorPicker
                                                    currentColor={status.bg}
                                                    onSelect={(bg, text) => updateStatusColor(index, bg, text)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </div>
                            </div>

                            {/* Responsibles */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Team (Responsibles)</h3>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New Member Name"
                                        value={newResponsible}
                                        onChange={(e) => setNewResponsible(e.target.value)}
                                        className="bg-black/50 border-white/20 text-white"
                                        onKeyDown={(e) => handleKeyDown(e, addResponsible)}
                                    />
                                    <Button onClick={addResponsible} disabled={loading || !newResponsible} className="bg-white/10 hover:bg-white/20 text-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {responsibles.map((person, index) => (
                                        <Popover key={index}>
                                            <PopoverTrigger asChild>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${typeof person === 'string' ? 'bg-blue-900/30 text-blue-200' : `${person.bg} ${person.text}`} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                    {typeof person === 'string' ? person : person.label}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeResponsible(index); }}
                                                        className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10">
                                                <ColorPicker
                                                    currentColor={typeof person === 'string' ? 'bg-blue-900' : person.bg}
                                                    onSelect={(bg, text) => updateResponsibleColor(index, bg, text)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </div>
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
                                <div className="flex flex-wrap gap-2">
                                    {sources.map((source, index) => (
                                        <Popover key={index}>
                                            <PopoverTrigger asChild>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${typeof source === 'string' ? 'bg-purple-900/30 text-purple-200' : `${source.bg} ${source.text}`} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                    {typeof source === 'string' ? source : source.label}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeSource(index); }}
                                                        className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10">
                                                <ColorPicker
                                                    currentColor={typeof source === 'string' ? 'bg-purple-900' : source.bg}
                                                    onSelect={(bg, text) => updateSourceColor(index, bg, text)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Field */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Custom Field</h3>
                                <div className="space-y-3">
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
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {customOptions.map((opt, index) => (
                                                <Popover key={index}>
                                                    <PopoverTrigger asChild>
                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border border-white/10 ${typeof opt === 'string' ? 'bg-white/10 text-gray-200' : `${opt.bg} ${opt.text}`} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                            {typeof opt === 'string' ? opt : opt.label}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeCustomOption(index); }}
                                                                className="hover:text-white ml-1 opacity-70 hover:opacity-100"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10">
                                                        <ColorPicker
                                                            currentColor={typeof opt === 'string' ? 'bg-slate-800' : opt.bg}
                                                            onSelect={(bg, text) => updateCustomOptionColor(index, bg, text)}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            ))}
                                        </div>
                                    </div>
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
                            Are you sure you want to delete
                            {itemToDelete?.type === 'product' && <span className="font-semibold text-white"> {products[itemToDelete.index]?.name}</span>}
                            {itemToDelete?.type === 'status' && <span className="font-semibold text-white"> {statuses[itemToDelete.index]?.label}</span>}
                            {itemToDelete?.type === 'responsible' && <span className="font-semibold text-white"> {responsibles[itemToDelete.index]?.label}</span>}
                            {itemToDelete?.type === 'source' && <span className="font-semibold text-white"> {sources[itemToDelete.index]?.label}</span>}
                            {itemToDelete?.type === 'customOption' && <span className="font-semibold text-white"> {customOptions[itemToDelete.index]?.label}</span>}
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:space-x-0">
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-0 h-8 text-xs">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
