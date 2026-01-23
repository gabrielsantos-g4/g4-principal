'use client'

import React from 'react'

export function RichViewer({ content }: { content: string }) {
    if (!content) return null

    // Hybrid Parser:
    // 1. Split by HTML tags to isolate text content.
    // 2. In text content, apply Markdown and URL replacers to generate HTML links.
    // 3. Rejoin and direct render.

    const processText = (text: string) => {
        // Regex for Markdown [text](url) OR Raw URL
        const regex = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g
        const parts = text.split(regex)

        return parts.map(part => {
            // Check for Markdown link: [label](url)
            const markdownMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
            if (markdownMatch) {
                const [_, label, url] = markdownMatch
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline font-medium">${label}</a>`
            }
            // Check for Raw URL
            if (part.match(/^(https?:\/\/[^\s]+)$/)) {
                return `<a href="${part}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline break-all">${part}</a>`
            }
            return part
        }).join('')
    }

    // Split by tags
    // content might be plain text (no tags) or HTML.
    // We capture the tags so we can reassemble.
    const parts = content.split(/(<[^>]+>)/g)

    // If it's just plain text, split returns ["text"]

    const finalHtml = parts.map(part => {
        if (part.match(/^<[^>]+>$/)) {
            // It's a tag (or comment), return as is
            return part
        }
        // It's text node content
        return processText(part)
    }).join('')

    // Fallback: If for some reason finalHtml is drastically different or empty (shouldn't be), we could error.
    // But this logic simply embellishes text nodes.

    return (
        <div
            className="text-gray-200 text-sm bg-black/20 p-3 rounded-lg whitespace-pre-wrap [&_a]:text-blue-400 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
        />
    )
}
