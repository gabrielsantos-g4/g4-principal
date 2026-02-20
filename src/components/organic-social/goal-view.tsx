'use client'

import { useState, useEffect, useTransition } from 'react'
import { getOrganicSocialGoal, saveOrganicSocialGoal } from '@/actions/organic-social-goal-actions'
import { format, parseISO } from 'date-fns'
import { Target, Loader2, CheckCircle2 } from 'lucide-react'

interface GoalViewProps {
    companyId: string
    userName: string
}

export function GoalView({ companyId, userName }: GoalViewProps) {
    const [goal, setGoal] = useState('')
    const [savedGoal, setSavedGoal] = useState('')
    const [updatedBy, setUpdatedBy] = useState<string | null>(null)
    const [updatedAt, setUpdatedAt] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!companyId) return
        getOrganicSocialGoal(companyId).then(data => {
            if (data?.organic_social_goal) {
                setGoal(data.organic_social_goal)
                setSavedGoal(data.organic_social_goal)
            }
            setUpdatedBy(data?.organic_social_goal_updated_by ?? null)
            setUpdatedAt(data?.organic_social_goal_updated_at ?? null)
        })
    }, [companyId])

    const handleSave = () => {
        if (!goal.trim()) return
        startTransition(async () => {
            await saveOrganicSocialGoal(companyId, goal.trim(), userName)
            setSavedGoal(goal.trim())
            setUpdatedBy(userName)
            setUpdatedAt(new Date().toISOString())
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSave()
        }
    }

    const isDirty = goal !== savedGoal

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-white">Organic Social Goal</h2>
                    <p className="text-xs text-slate-500">Define the main objective for your organic social strategy</p>
                </div>
            </div>

            {/* Textarea */}
            <div className="relative">
                <textarea
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your organic social goal here...&#10;&#10;e.g. Grow our LinkedIn presence to generate 20 qualified leads per month through educational content targeting mid-market CFOs."
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed transition-colors"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-slate-700">
                    ⌘ + Enter to save
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
                {/* Last updated */}
                <div className="text-xs text-slate-600">
                    {updatedBy && updatedAt ? (
                        <span>
                            Last updated by <span className="text-slate-500">{updatedBy}</span>{' '}
                            on {format(parseISO(updatedAt), 'MMM d, yyyy')} at {format(parseISO(updatedAt), 'h:mm a')}
                        </span>
                    ) : (
                        <span className="text-slate-700">No goal set yet</span>
                    )}
                </div>

                {/* Save button */}
                <div className="flex items-center gap-2">
                    {saved && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Saved
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isPending || !isDirty || !goal.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        {isPending ? 'Saving...' : 'Save Goal'}
                    </button>
                </div>
            </div>
        </div>
    )
}
