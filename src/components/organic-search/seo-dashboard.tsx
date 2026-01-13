'use client'

import { useState } from 'react'
import { KeywordList } from './keyword-list'
import { ContentGenerator } from './content-generator'

export function SeoDashboard() {
    const [selectedKeyword, setSelectedKeyword] = useState<any>(null)

    return (
        <div className="w-full h-full flex overflow-hidden bg-black text-white">
            <KeywordList
                onSelect={setSelectedKeyword}
                selectedId={selectedKeyword?.id}
            />
            <div className="flex-1 min-w-0">
                <ContentGenerator keyword={selectedKeyword} />
            </div>
        </div>
    )
}
