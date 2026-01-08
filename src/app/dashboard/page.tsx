import { ArrowUpRight } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { RightSidebar } from '@/components/right-sidebar'

export default function DashboardPage() {
    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            {/* Top Bar */}
            <DashboardHeader />

            {/* Main Content Body - Flex Row */}
            <div className="flex flex-1 min-h-0">
                {/* Left Content (Stats) - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase">Performance Overview</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Card 1 */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Pipeline</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">147</div>
                            <div className="flex items-center text-green-500 text-xs">
                                <ArrowUpRight size={14} className="mr-1" />
                                12% vs. previous month
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Close Rate</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">23</div>
                            <div className="text-gray-500 text-xs">
                                $432.5K in potential value
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Card 3 */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Campaigns</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">8</div>
                            <div className="text-gray-500 text-xs">
                                LinkedIn, Google, Meta
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Organic Reach</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">12.4K</div>
                            <div className="text-gray-500 text-xs">
                                impressions this week
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Card 5 */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">January Revenue</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">$87.2K</div>
                            <div className="text-gray-500 text-xs">
                                18 pending invoices
                            </div>
                        </div>

                        {/* Card 6 */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Conversion Rate</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">18.5%</div>
                            <div className="flex items-center text-green-500 text-xs">
                                <ArrowUpRight size={14} className="mr-1" />
                                3.2% vs. last quarter
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <RightSidebar />
            </div>
        </div>
    )
}
