'use client'

import { PlanningView } from './planning-view'
import { ScheduleView } from './schedule-view'
import { GoalView } from './goal-view'
import { DesignView } from './design-view'

interface OrganicSocialDashboardProps {
    activeTab: string
    companyId: string
    userName: string
}

function InProgress() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 text-center py-24">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm6.75-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v10.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V9.75zm6.75-3c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v13.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V6.75z" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">In Progress</p>
                <p className="text-xs text-slate-600 mt-1">Results will appear here as the agent delivers outputs</p>
            </div>
        </div>
    )
}

export function OrganicSocialDashboard({ activeTab, companyId, userName }: OrganicSocialDashboardProps) {
    return (
        <div className="w-full h-full overflow-y-auto text-white p-6 md:p-8">
            <div className="flex flex-col min-h-0">
                {activeTab === 'goal' && <GoalView companyId={companyId} userName={userName} />}
                {activeTab === 'planning' && <PlanningView />}
                {activeTab === 'design' && <DesignView />}
                {/* publishing = renamed execution tab */}
                {(activeTab === 'publishing' || activeTab === 'execution') && <ScheduleView />}
                {activeTab === 'results' && <InProgress />}
            </div>
        </div>
    )
}
