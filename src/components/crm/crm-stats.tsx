
interface CrmStatsProps {
    stats: {
        contacts: number;
        pipeline: number;
        today: number;
        tomorrow: number;
        overdue: number;
    };
}

export function CrmStats({ stats }: CrmStatsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <StatCard label="Contacts" value={stats.contacts.toString()} />
            <StatCard label="Pipeline" value={`$ ${stats.pipeline.toLocaleString()}`} />
            <StatCard label="Today" value={stats.today.toString()} />
            <StatCard label="Tomorrow" value={stats.tomorrow.toString()} />
            <StatCard label="Overdue" value={stats.overdue.toString()} />
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
