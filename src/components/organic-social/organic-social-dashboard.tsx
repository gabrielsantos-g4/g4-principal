'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlanningView } from './planning-view'
import { ScheduleView } from './schedule-view'
import { ReportView } from './report-view'

export function OrganicSocialDashboard() {
    return (
        <div className="w-full min-h-screen text-white p-6 md:p-8">
            <Tabs defaultValue="planning" className="space-y-6">
                <div className="flex justify-start">
                    <TabsList className="bg-[#171717] p-1 rounded-lg border border-white/10 w-fit h-auto">
                        <TabsTrigger
                            value="planning"
                            className="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            Planning
                        </TabsTrigger>
                        <TabsTrigger
                            value="execution"
                            className="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            Execution
                        </TabsTrigger>
                        <TabsTrigger
                            value="reports"
                            className="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            Reports
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="planning" className="space-y-4">
                    <PlanningView />
                </TabsContent>

                <TabsContent value="execution" className="space-y-4">
                    <ScheduleView />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <ReportView />
                </TabsContent>
            </Tabs>
        </div>
    )
}
