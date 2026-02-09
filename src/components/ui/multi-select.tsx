'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Option {
    value: string
    label: string
    subLabel?: string
}

interface MultiSelectProps {
    options: Option[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    usePortal?: boolean
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    usePortal = true
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Ensure value is always an array
    const safeValue = value || []

    // Calculate position for the dropdown
    useEffect(() => {
        if (isOpen && containerRef.current && usePortal) {
            const updatePosition = () => {
                const rect = containerRef.current!.getBoundingClientRect()
                setPosition({
                    top: rect.bottom + window.scrollY + 4, // 4px gap
                    left: rect.left + window.scrollX,
                    width: rect.width
                })
            }
            updatePosition()
            window.addEventListener('resize', updatePosition)
            window.addEventListener('scroll', updatePosition, true)
            return () => {
                window.removeEventListener('resize', updatePosition)
                window.removeEventListener('scroll', updatePosition, true)
            }
        }
    }, [isOpen, usePortal])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current?.contains(event.target as Node) ||
                dropdownRef.current?.contains(event.target as Node)
            ) {
                return
            }
            setIsOpen(false)
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const toggleOption = (optionValue: string) => {
        const newValue = safeValue.includes(optionValue)
            ? safeValue.filter(v => v !== optionValue)
            : [...safeValue, optionValue]
        onChange(newValue)
    }

    const displayValue = safeValue.length > 0
        ? options.filter(o => safeValue.includes(o.value)).map(o => o.label).join(', ')
        : placeholder

    const dropdownContent = (
        <div
            ref={dropdownRef}
            style={usePortal ? {
                position: 'fixed',
                top: (position.top || 0) - window.scrollY,
                left: position.left || 0,
                width: position.width || 0,
                zIndex: 9999
            } : {
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '100%',
                zIndex: 100
            }}
            className="bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {options.map((option) => (
                <div
                    key={option.value}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleOption(option.value)
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-3 hover:bg-white/10 transition-colors ${safeValue.includes(option.value) ? 'text-white bg-white/5' : 'text-gray-300'
                        }`}
                >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 pointer-events-none ${safeValue.includes(option.value)
                        ? 'bg-[#1C73E8] border-[#1C73E8]'
                        : 'border-white/20'
                        }`}>
                        {safeValue.includes(option.value) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{option.label}</span>
                        {option.subLabel && (
                            <span className="text-[10px] text-gray-500 truncate">{option.subLabel}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white/5 border ${isOpen ? 'border-[#1C73E8]' : 'border-white/10'} rounded-lg px-3 py-2 text-sm text-white cursor-pointer transition-colors flex items-center justify-between group hover:border-white/20`}
            >
                <span className={`block truncate ${safeValue.length === 0 ? 'text-gray-500' : ''}`}>
                    {displayValue}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (usePortal ? createPortal(dropdownContent, document.body) : dropdownContent)}
        </div>
    )
}
