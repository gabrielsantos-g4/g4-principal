
export function CrmStats() {
    return (
        <div className="grid grid-cols-5 gap-3 mb-4">
            <StatCard label="Contacts" value="63" />
            <StatCard label="Pipeline" value="$ 13,320" />
            <StatCard label="Today" value="0" />
            <StatCard label="Tomorrow" value="0" />
            <StatCard label="Overdue" value="15" />
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#111] p-4 rounded-lg border border-white/5 flex flex-col justify-between h-24">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
            <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        </div>
    );
}
