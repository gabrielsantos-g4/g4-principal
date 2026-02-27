'use client'

import { useState, useTransition } from 'react'
import { saveLandingPageContent } from '@/actions/landing-page-actions'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

interface LandingPageEditorProps {
    empresaId: string
    initialContent: string
}

export function LandingPageEditor({ empresaId, initialContent }: LandingPageEditorProps) {
    const [content, setContent] = useState(initialContent)
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveLandingPageContent(empresaId, content)
            if (result.error) {
                toast.error('Failed to save: ' + result.error)
            } else {
                toast.success('Saved!')
            }
        })
    }

    return (
        <div className="h-full w-full flex flex-col p-4 gap-3">
            {/* Save button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                    {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save
                </button>
            </div>

            {/* Full-height textarea */}
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Describe what you want for the landing page... paste links, copy & paste briefs, anything goes."
                className="flex-1 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-0 text-sm text-slate-200 placeholder:text-slate-600 p-5 leading-relaxed transition-colors custom-scrollbar"
            />
        </div>
    )
}
