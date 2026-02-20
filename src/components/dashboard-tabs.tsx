'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabOption {
    value: string
    label: string
}

interface DashboardTabsProps {
    tabs: TabOption[]
    defaultValue?: string
}

export function DashboardTabs({ tabs, defaultValue }: DashboardTabsProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentTab = searchParams.get('tab') || defaultValue || tabs[0]?.value

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', value)
        router.push(`${pathname}?${params.toString()}`)
    }

    if (!tabs || tabs.length === 0) return null

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-fit">
            <TabsList className="bg-[#171717] p-1 rounded-lg border border-white/10 w-fit h-auto">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
