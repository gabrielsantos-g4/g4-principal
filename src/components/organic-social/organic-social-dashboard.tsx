'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlanningView } from './planning-view'
import { ScheduleView } from './schedule-view'
import { ReportView } from './report-view'

export function OrganicSocialDashboard() {
    return (
        <div className="w-full min-h-screen text-white p-6 md:p-8">
            <Tabs defaultValue="planning" className="space-y-6">
                <div className="flex justify-center">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="planning" className="data-[state=active]:bg-[#1C73E8] data-[state=active]:text-white">Planning</TabsTrigger>
                        <TabsTrigger value="execution" className="data-[state=active]:bg-[#1C73E8] data-[state=active]:text-white">Execution</TabsTrigger>
                        <TabsTrigger value="reports" className="data-[state=active]:bg-[#1C73E8] data-[state=active]:text-white">Reports</TabsTrigger>
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
