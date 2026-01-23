'use client'

import React, { useRef, useEffect, useState } from 'react'

interface RichInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function RichInput({ value, onChange, placeholder, className }: RichInputProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isMounted, setIsMounted] = useState(false)

    // Set initial value
    useEffect(() => {
        if (ref.current && !isMounted) {
            ref.current.innerHTML = value || ''
            setIsMounted(true)
        }
    }, [isMounted, value])

    // Update internal HTML if value changes externally (and differs significantly)
    // This is tricky with contentEditable. For now, trusting initial sync + internal updates.

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const html = e.currentTarget.innerHTML
        if (html === '<br>' || html === '<div><br></div>') {
            onChange('')
        } else {
            onChange(html)
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        const isUrl = /^(https?:\/\/[^\s]+)$/.test(text.trim())

        const selection = window.getSelection()
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null

        if (isUrl && range && !range.collapsed && ref.current?.contains(range.commonAncestorContainer)) {
            // Linkify selection
            document.execCommand('createLink', false, text.trim())
        } else {
            // Insert plain text
            document.execCommand('insertText', false, text)
        }
    }

    return (
        <div className="relative w-full">
            <div
                ref={ref}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className={`w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 whitespace-pre-wrap ${className}`}
                style={{ minHeight: '120px', maxHeight: '300px', overflowY: 'auto' }}
            />
            {(!value || value === '<br>' || value === '') && placeholder && (
                <div className="absolute top-2.5 left-3 text-gray-500 text-sm pointer-events-none select-none">
                    {placeholder}
                </div>
            )}
        </div>
    )
}
