import { AdminFulfillmentLayout } from "@/components/admin/fulfillment/admin-fulfillment-layout"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminFulfillmentPage() {
    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <AdminFulfillmentLayout />
            </div>
        </div>
    )
}
