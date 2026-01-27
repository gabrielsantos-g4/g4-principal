"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"


export interface Option {
    label: string
    value: string
    isCustom?: boolean
}

interface SearchableMultiSelectProps {
    options: Option[]
    value: string[]
    onChange: (value: string[]) => void
    onCreateOption?: (value: string) => Promise<void> | void
    onDeleteOption?: (value: string) => Promise<void> | void
    placeholder?: string
}

export function SearchableMultiSelect({
    options,
    value,
    onChange,
    onCreateOption,
    onDeleteOption,
    placeholder = "Select options...",
}: SearchableMultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const handleUnselect = (item: string) => {
        onChange(value.filter((i) => i !== item))
    }

    const handleCreate = async () => {
        if (onCreateOption && inputValue.trim()) {
            await onCreateOption(inputValue.trim())
            // Option should be added to options prop by parent
            setInputValue("")
        }
    }

    // Identify if the current input matches any existing option (exact match)
    const exactMatch = options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase())

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-zinc-900/50 border-zinc-800 text-white hover:bg-zinc-900 hover:text-white h-auto min-h-10 py-2 px-3"
                >
                    <div className="flex flex-wrap gap-1">
                        {value.length > 0 ? (
                            value.map((item) => {
                                const option = options.find((o) => o.value === item)
                                return (
                                    <Badge
                                        variant="secondary"
                                        key={item}
                                        className="mr-1 mb-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleUnselect(item)
                                        }}
                                    >
                                        {option?.label || item}
                                        <button
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(item)
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleUnselect(item)
                                            }}
                                        >
                                            <X className="h-3 w-3 text-zinc-500 hover:text-zinc-200" />
                                        </button>
                                    </Badge>
                                )
                            })
                        ) : (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-zinc-900 border-zinc-800" align="start">
                <Command className="bg-transparent text-white" shouldFilter={true}>
                    <CommandInput
                        placeholder="Search..."
                        className="text-white"
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList className="max-h-[300px] overflow-auto">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        const newValue = value.includes(option.value)
                                            ? value.filter((v) => v !== option.value)
                                            : [...value, option.value]
                                        onChange(newValue)
                                    }}
                                    className="cursor-pointer text-white aria-selected:bg-zinc-800 flex items-center justify-between group"
                                >
                                    <div className="flex items-center">
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.includes(option.value) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </div>

                                    {option.isCustom && onDeleteOption && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // Identify ID? SearchableMultiSelect uses value=name usually in this app
                                                // If value is ID, we are good. If value is Name, we need ID.
                                                // Assuming option.value is the ID or the unique key.
                                                // In AddStrategyCardModal, value IS the Name.
                                                // So we pass the value (Name) or we need ID in Option?
                                                // We should extend Option to have `id`?
                                                // Or rely on specialized lookup.
                                                // Simplest: pass option.value (which is "Name" in our case) to onDeleteOption,
                                                // and let parent figure it out? No, parent has list of objects.
                                                // Parent can lookup ID by Name.
                                                onDeleteOption(option.value)
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded-full transition-all"
                                            title="Delete custom channel"
                                        >
                                            <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                                        </button>
                                    )}
                                </CommandItem>
                            ))}

                            {/* Create Option - Always show if input exists and exact match is not found */}
                            {!exactMatch && inputValue.trim().length > 0 && onCreateOption && (
                                <CommandItem
                                    key={`create-${inputValue}`}
                                    value={inputValue}
                                    onSelect={handleCreate}
                                    className="cursor-pointer text-blue-400 aria-selected:bg-zinc-800 font-medium border-t border-zinc-800 mt-1"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create "{inputValue}"
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

// Icon for Create button
import { PlusCircle } from "lucide-react"
