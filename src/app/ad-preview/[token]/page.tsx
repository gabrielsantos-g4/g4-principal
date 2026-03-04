export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdPreviewClient } from '@/components/paid-social/ad-preview-client'

interface Props {
    params: Promise<{ token: string }>
}

export default async function AdPreviewPage({ params }: Props) {
    const { token } = await params

    // Require login
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect(`/login?redirect=/ad-preview/${token}`)
    }

    return <AdPreviewClient token={token} />
}
