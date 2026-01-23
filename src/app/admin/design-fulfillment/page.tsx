import { DesignFulfillmentLayout } from "@/components/admin/fulfillment/design-fulfillment-layout"
import { DashboardHeader } from "@/components/dashboard-header"

export const metadata = {
    title: 'Design Fulfillment Admin',
    description: 'Manage design requests'
}

export default function AdminDesignFulfillmentPage() {
    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <DesignFulfillmentLayout />
            </div>
        </div>
    )
}
