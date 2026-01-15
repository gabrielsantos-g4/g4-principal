"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Box as BoxIcon, Type, ArrowRight, MousePointer2, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface WhiteboardModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Tool = 'select' | 'box' | 'text' | 'arrow'

interface Element {
    id: string
    type: 'box' | 'text' | 'arrow'
    x: number
    y: number
    content?: string
    width?: number
    height?: number
    toX?: number
    toY?: number
}

export function WhiteboardModal({ open, onOpenChange }: WhiteboardModalProps) {
    const [tool, setTool] = useState<Tool>('select')
    const [elements, setElements] = useState<Element[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [interactionState, setInteractionState] = useState<'idle' | 'creating' | 'dragging'>('idle')
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Load elements (mock persistence could be added here)
    useEffect(() => {
        const saved = localStorage.getItem("g4_whiteboard_elements")
        if (saved) {
            try {
                setElements(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to load whiteboard", e)
            }
        }
    }, [])

    const saveElements = (newElements: Element[]) => {
        setElements(newElements)
        localStorage.setItem("g4_whiteboard_elements", JSON.stringify(newElements))
    }

    const handleMouseDown = (e: React.MouseEvent, id?: string) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (tool === 'select') {
            if (id) {
                e.stopPropagation()
                setSelectedId(id)
                setInteractionState('dragging')
            } else {
                setSelectedId(null)
            }
        } else {
            // Start creating
            setInteractionState('creating')
            setStartPos({ x, y })
            const newId = Date.now().toString()
            setSelectedId(newId)

            let newElement: Element
            if (tool === 'box') {
                newElement = { id: newId, type: 'box', x, y, width: 0, height: 0, content: 'Box' }
            } else if (tool === 'arrow') {
                newElement = { id: newId, type: 'arrow', x, y, toX: x, toY: y }
            } else if (tool === 'text') {
                newElement = { id: newId, type: 'text', x, y, content: 'Text' }
                setInteractionState('idle') // Text is instant placement
                saveElements([...elements, newElement])
                setTool('select') // Switch back to select
                return
            } else {
                return
            }
            saveElements([...elements, newElement])
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        if (interactionState === 'dragging' && selectedId && tool === 'select') {
            saveElements(elements.map(el => {
                if (el.id !== selectedId) return el
                if (el.type === 'arrow') {
                    return { ...el, x: el.x + e.movementX, y: el.y + e.movementY, toX: (el.toX || 0) + e.movementX, toY: (el.toY || 0) + e.movementY }
                }
                return { ...el, x: el.x + e.movementX, y: el.y + e.movementY }
            }))
        } else if (interactionState === 'creating' && selectedId) {
            const currentX = e.clientX - rect.left
            const currentY = e.clientY - rect.top

            saveElements(elements.map(el => {
                if (el.id !== selectedId) return el

                if (el.type === 'box') {
                    const width = Math.abs(currentX - startPos.x)
                    const height = Math.abs(currentY - startPos.y)
                    const x = Math.min(currentX, startPos.x)
                    const y = Math.min(currentY, startPos.y)
                    return { ...el, x, y, width: Math.max(width, 50), height: Math.max(height, 30) }
                } else if (el.type === 'arrow') {
                    return { ...el, toX: currentX, toY: currentY }
                }
                return el
            }))
        }
    }

    const handleMouseUp = () => {
        if (interactionState === 'creating') {
            setTool('select')
        }
        setInteractionState('idle')
    }

    const updateContent = (id: string, content: string) => {
        saveElements(elements.map(el => el.id === id ? { ...el, content } : el))
    }

    const deleteSelected = () => {
        if (selectedId) {
            saveElements(elements.filter(el => el.id !== selectedId))
            setSelectedId(null)
        }
    }

    // Keyboard support for delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) deleteSelected()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedId, elements])


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[98vw] h-[98vh] sm:max-w-[98vw] bg-[#171717] border-white/10 text-white flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-bold">Whiteboard</DialogTitle>
                    <div className="flex items-center gap-2 bg-[#1e1e1e] p-1 rounded-lg border border-white/10">
                        <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} label="Select" />
                        <ToolButton active={tool === 'box'} onClick={() => setTool('box')} icon={BoxIcon} label="Box" />
                        <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={Type} label="Text" />
                        <ToolButton active={tool === 'arrow'} onClick={() => setTool('arrow')} icon={ArrowRight} label="Arrow" />
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <button
                            onClick={deleteSelected}
                            disabled={!selectedId}
                            className="p-2 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-30 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <div className="w-8"></div> {/* Spacer for symmetry */}
                </DialogHeader>

                <div
                    ref={containerRef}
                    className="flex-1 bg-[#121212] relative overflow-hidden"
                    style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
                    onMouseDown={(e) => handleMouseDown(e)}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {elements.map(el => (
                        <div
                            key={el.id}
                            className={`absolute group ${selectedId === el.id ? 'ring-1 ring-blue-500' : ''}`}
                            style={{
                                left: el.x,
                                top: el.y,
                                width: el.type === 'box' ? el.width : 'auto',
                                height: el.type === 'box' ? el.height : 'auto',
                                cursor: tool === 'select' ? 'move' : 'default',
                                pointerEvents: interactionState === 'creating' ? 'none' : 'auto'
                            }}
                            onMouseDown={(e) => handleMouseDown(e, el.id)}
                            onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                        >
                            {el.type === 'box' && (
                                <div className="w-full h-full bg-[#2a2a2a] border border-white/20 rounded flex items-center justify-center p-2 min-w-[50px] min-h-[30px]">
                                    <input
                                        className="bg-transparent border-none text-center text-white focus:outline-none w-full h-full cursor-text"
                                        value={el.content}
                                        onChange={(e) => updateContent(el.id, e.target.value)}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                            )}
                            {el.type === 'text' && (
                                <input
                                    className="bg-transparent border-none text-white focus:outline-none text-lg min-w-[200px]"
                                    value={el.content}
                                    onChange={(e) => updateContent(el.id, e.target.value)}
                                    autoFocus
                                />
                            )}
                            {el.type === 'arrow' && (
                                <svg width="200" height="100" className="pointer-events-none overflow-visible">
                                    <line
                                        x1="0" y1="0"
                                        x2={el.toX ? el.toX - el.x : 100}
                                        y2={el.toY ? el.toY - el.y : 0}
                                        stroke="white"
                                        strokeWidth="2"
                                        markerEnd="url(#arrowhead)"
                                    />
                                    <defs>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                                        </marker>
                                    </defs>
                                </svg>
                            )}
                        </div>
                    ))}
                    <div className="absolute bottom-4 right-4 text-xs text-gray-500 pointer-events-none">
                        Click tool to add. Drag to move. Delete to remove.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ToolButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`p-2 rounded transition-colors ${active ? 'bg-[#1C73E8] text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
            <Icon size={18} />
        </button>
    )
}
