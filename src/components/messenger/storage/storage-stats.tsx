"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StorageFile } from "@/actions/messenger/storage-actions"
import { ImageIcon, Video, FileText, Music } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useMemo } from "react"

interface StorageStatsProps {
    files: StorageFile[]
}

const MAX_STORAGE_BYTES = 200 * 1024 * 1024 // 200MB

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function StorageStats({ files }: StorageStatsProps) {
    const stats = useMemo(() => {
        let totalBytes = 0
        let imageCount = 0
        let videoCount = 0
        let docCount = 0
        let audioCount = 0
        let otherCount = 0

        files.forEach(file => {
            totalBytes += file.size

            if (file.type === 'image') imageCount++
            else if (file.type === 'video') videoCount++
            else if (file.type === 'audio') audioCount++
            else if (file.type === 'document') docCount++
            else otherCount++
        })

        const percentUsed = Math.min(100, (totalBytes / MAX_STORAGE_BYTES) * 100)

        // Define color based on usage percentage
        let usageColor = "hsl(var(--chart-2))" // Green-ish by default
        if (percentUsed > 75) usageColor = "hsl(var(--chart-4))" // Yellow/Orange
        if (percentUsed > 90) usageColor = "hsl(var(--destructive))" // Red

        const chartData = [
            { browser: "safari", visitors: totalBytes, fill: usageColor },
            { browser: "other", visitors: MAX_STORAGE_BYTES - totalBytes, fill: "hsl(var(--muted))" },
        ]

        return {
            totalBytes,
            imageCount,
            videoCount,
            docCount,
            audioCount,
            totalCount: files.length,
            percentUsed,
            chartData,
            usageColor
        }
    }, [files])

    const chartConfig = {
        visitors: {
            label: "Uso",
        },
    }

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <Card className="bg-[#1a1a1a] border-white/10 text-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-400">
                        Imagens
                    </CardTitle>
                    <ImageIcon className="h-3 w-3 text-gray-500" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-xl font-bold">{stats.imageCount}</div>
                </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-white/10 text-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-400">
                        Vídeos
                    </CardTitle>
                    <Video className="h-3 w-3 text-gray-500" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-xl font-bold">{stats.videoCount}</div>
                </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-white/10 text-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-400">
                        Áudios
                    </CardTitle>
                    <Music className="h-3 w-3 text-gray-500" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-xl font-bold">{stats.audioCount}</div>
                </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-white/10 text-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-400">
                        Documentos
                    </CardTitle>
                    <FileText className="h-3 w-3 text-gray-500" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="text-xl font-bold">{stats.docCount}</div>
                </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-white/10 text-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-400">
                        Armazenamento
                    </CardTitle>
                    <div className="h-3 w-3 rounded-full border border-gray-500 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex flex-col">
                    <div className="text-xl font-bold">
                        {stats.percentUsed.toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 truncate">
                        {formatBytes(stats.totalBytes)} de {formatBytes(MAX_STORAGE_BYTES)}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
