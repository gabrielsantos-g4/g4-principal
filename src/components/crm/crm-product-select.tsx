"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Product {
    id?: number;
    name: string;
    price: string;
}

interface CrmProductSelectProps {
    value: string; // JSON string array or simple string
    options: Product[];
    onChange: (products: string[], totalAmount: number) => void;
}

export function CrmProductSelect({ value, options, onChange }: CrmProductSelectProps) {
    const [open, setOpen] = useState(false);

    // Parse current value
    const selectedProducts = useMemo(() => {
        if (!value) return [];
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
            return [value]; // Fallback if single string
        } catch {
            return [value]; // Fallback if simple string
        }
    }, [value]);

    const handleSelect = (productName: string) => {
        const isSelected = selectedProducts.includes(productName);
        let newSelected: string[];

        if (isSelected) {
            newSelected = selectedProducts.filter(p => p !== productName);
        } else {
            newSelected = [...selectedProducts, productName];
        }

        // Calculate total amount
        const total = newSelected.reduce((acc, name) => {
            const product = options.find(p => p.name === name);
            return acc + (product ? parseFloat(product.price) : 0);
        }, 0);

        onChange(newSelected, total);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full h-auto min-h-[26px] p-1 text-[11px] hover:bg-white/5 font-normal ml-0"
                >
                    <div className="flex flex-wrap gap-1 items-center text-left">
                        {selectedProducts.length > 0 ? (
                            selectedProducts.map((name) => (
                                <Badge key={name} variant="secondary" className="px-1 py-0 h-4 text-[9px] bg-white/10 hover:bg-white/20 text-white border-0 font-normal rounded-sm text-nowrap">
                                    {name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-gray-600 italic">Select...</span>
                        )}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-[#1A1A1A] border-white/10 text-white" align="start">
                <Command className="bg-transparent border-none">
                    <CommandInput placeholder="Search product..." className="h-8 text-xs" />
                    <CommandList>
                        <CommandEmpty className="py-2 text-center text-xs text-gray-400">No product found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((product) => {
                                const isSelected = selectedProducts.includes(product.name);
                                return (
                                    <CommandItem
                                        key={product.name}
                                        value={product.name}
                                        onSelect={() => handleSelect(product.name)}
                                        className="text-xs data-[selected='true']:bg-white/10 data-[selected='true']:text-white cursor-pointer"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-white/30",
                                                isSelected ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-3 w-3")} />
                                        </div>
                                        <span>{product.name}</span>
                                        <span className="ml-auto text-gray-500 text-[10px]">${Number(product.price).toLocaleString()}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
