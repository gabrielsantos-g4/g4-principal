
import { Reorder } from "framer-motion";
import { GripVertical, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagEditor } from "./crm-settings-modal"; // Assuming TagEditor is exported or I need to move it too.
// Wait, TagEditor is currently internal to crm-settings-modal.tsx. I should probably move TagEditor to a separate file or keep StatusItem internal. 
// Moving TagEditor to a separate file is cleaner.

export function StatusItem({ status, index, settings, updateStatus, TagEditorComponent }: { status: any, index: number, settings: any, updateStatus: any, TagEditorComponent: any }) {
    const phase = status.phase || 'not_started';
    const temperature = status.temperature || 'Cold';

    // Find the temperature config from settings
    const DEFAULT_TEMPERATURES = [
        { label: 'Cold', bg: 'bg-blue-900', text: 'text-blue-100' },
        { label: 'Warm', bg: 'bg-orange-900', text: 'text-orange-100' },
        { label: 'Hot', bg: 'bg-red-900', text: 'text-red-100' }
    ];

    const availableTemps = (settings.temperatures && settings.temperatures.length > 0)
        ? settings.temperatures
        : DEFAULT_TEMPERATURES;

    const matchedTemp = availableTemps.find((t: any) => (typeof t === 'string' ? t : t.label) === temperature);

    const tempConfig = matchedTemp
        ? (typeof matchedTemp === 'string' ? { label: matchedTemp, bg: 'bg-slate-800', text: 'text-slate-100' } : matchedTemp)
        : DEFAULT_TEMPERATURES.find(t => t.label === temperature) || { label: temperature || 'Cold', bg: 'bg-blue-900', text: 'text-blue-100' };

    return (
        <Reorder.Item value={status} className="select-none">
            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/10 relative">

                {/* Tag Group (Icon + Name) - Explicitly isolated */}
                <div className="flex items-center gap-2 group/tag cursor-pointer flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0" />

                    <TagEditorComponent
                        tag={status}
                        onSave={(l: string, b: string, t: string) => updateStatus(index, l, b, t, status.phase, status.temperature)}
                    >
                        <div className={`flex items-center gap-2 px-2 py-0.5 rounded text-xs border border-white/10 ${status.bg} ${status.text} hover:brightness-110 transition-all shadow-sm truncate`}>
                            <span className="font-medium truncate">{status.label}</span>
                            <Pencil className="h-3 w-3 opacity-0 group-hover/tag:opacity-50" />
                        </div>
                    </TagEditorComponent>
                </div>

                {/* Temperature Selection Dropdown - Isolated */}
                <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                    <Select
                        value={temperature}
                        onValueChange={(val) => {
                            const tVal = val as 'Cold' | 'Warm' | 'Hot';
                            let newPhase: 'not_started' | 'in_progress' | 'closing' = 'not_started';

                            if (tVal === 'Hot') newPhase = 'closing';
                            else if (tVal === 'Warm') newPhase = 'in_progress';
                            else newPhase = 'not_started';

                            updateStatus(index, status.label, status.bg, status.text, newPhase, tVal);
                        }}
                    >
                        <SelectTrigger
                            className={`h-6 w-[60px] text-[8px] uppercase font-bold tracking-wider border-white/10 ${tempConfig.bg} ${tempConfig.text} px-1.5 cursor-pointer select-none`}
                        >
                            <SelectValue>{tempConfig.label}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white min-w-[80px]">
                            {availableTemps.map((t: any) => {
                                const tLabel = typeof t === 'string' ? t : t.label;
                                const tBg = typeof t === 'string' ? 'bg-slate-800' : t.bg;
                                const tText = typeof t === 'string' ? 'text-slate-100' : t.text;

                                return (
                                    <SelectItem
                                        key={tLabel}
                                        value={tLabel}
                                        className={`text-[9px] uppercase font-bold tracking-wider text-gray-400 focus:text-white focus:${tBg.replace('bg-', 'focus:bg-')}`}
                                    >
                                        {tLabel}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </Reorder.Item>
    );
}
