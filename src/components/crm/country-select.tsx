"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

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
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type CountrySelectProps = {
    disabled?: boolean;
    value: RPNInput.Country;
    onChange: (value: RPNInput.Country) => void;
    options: { value: RPNInput.Country; label: string; icon: React.ComponentType }[];
};

export const CountrySelect = ({ value, onChange, options, disabled }: CountrySelectProps) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = React.useCallback(
        (country: RPNInput.Country) => {
            onChange(country);
            setOpen(false);
        },
        [onChange]
    );

    const SelectedFlag = flags[value];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className="flex gap-1 rounded-sm px-3 h-full bg-white/5 border-r border-white/10 hover:bg-white/10"
                    disabled={disabled}
                >
                    {SelectedFlag && <div className="w-6 h-4 flex items-center justify-center"><SelectedFlag title={value} /></div>}
                    <ChevronsUpDown className="h-4 w-4 opacity-50 text-gray-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 z-[99999] bg-[#1A1A1A] border-white/10 text-white" align="start">
                <Command className="bg-[#1A1A1A] text-white">
                    <CommandInput placeholder="Search country..." className="h-9 text-white placeholder:text-gray-500" />
                    <CommandList className="max-h-[300px] overflow-y-auto block">
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const Flag = flags[option.value];
                                const countryName = option.label;
                                const countryCode = option.value;
                                if (!countryCode) return null;
                                const callingCode = RPNInput.getCountryCallingCode(countryCode);

                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={`${countryName} (+${callingCode})`}
                                        onSelect={() => handleSelect(option.value)}
                                        className="gap-2 cursor-pointer text-gray-300 hover:text-white hover:bg-white/10 aria-selected:bg-white/10 aria-selected:text-white"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {Flag && <div className="w-5 h-3 flex items-center justify-center shrink-0"><Flag title={countryName} /></div>}
                                            <span className="flex-1 truncate">{countryName}</span>
                                            <span className="text-gray-500 text-xs">+{callingCode}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
