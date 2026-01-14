import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    children?: React.ReactNode
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    children,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-white/10 rounded-lg p-8 text-center animate-in fade-in-50 bg-white/5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
            <p className="mb-4 mt-2 text-sm text-gray-400 max-w-sm">
                {description}
            </p>
            {children ? (
                <div className="mt-4">{children}</div>
            ) : actionLabel ? (
                <Button onClick={onAction} className="mt-4">
                    {actionLabel}
                </Button>
            ) : null}
        </div>
    )
}
