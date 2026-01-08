'use client'

import { useState, useEffect, useRef } from 'react'

interface AgentContext {
    name: string
    avatarUrl: string
    role?: string
    slug?: string
    externalUrl?: string
}

interface RightSidebarProps {
    agent?: AgentContext
}

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: React.ReactNode
}

// ... imports

export function RightSidebar({ agent }: RightSidebarProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        // 1. Immediate Reset on every agent change (or mount due to key prop)
        setMessages([])
        setIsTyping(false)

        if (!agent) return

        // 2. Identify Paid Social (ignore)
        if (agent.name === 'John' || agent.role?.includes('Paid Social')) return

        // 3. Start Animation if external link exists (except Paid Social)
        if (agent.externalUrl) {
            setIsTyping(true)

            const timer = setTimeout(() => {
                setIsTyping(false)
                setMessages([
                    {
                        id: 'welcome',
                        role: 'assistant',
                        content: (
                            <div className="space-y-2">
                                <p>Hello! The native integration for <strong>{agent.role}</strong> is currently under construction.</p>
                                <p>
                                    You can access the provisional version here: <br />
                                    <a
                                        href={agent.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#1C73E8] underline hover:text-white transition-colors break-all"
                                    >
                                        {agent.externalUrl}
                                    </a>
                                </p>
                            </div>
                        )
                    }
                ])
            }, 4000)

            return () => clearTimeout(timer)
        }
    }, [agent?.name, agent?.externalUrl]) // Re-run if name or url changes

    return (
        <div className="w-[400px] border-l border-white/10 flex flex-col bg-black">
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {agent ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full border-2 border-[#1C73E8] overflow-hidden mx-auto mb-4">
                                <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                            <p className="text-xs text-[#1C73E8] font-medium uppercase tracking-wider mt-1">{agent.role || 'AI Agent'}</p>
                            <p className="text-sm text-gray-500 mt-4 px-4">
                                I can analyze your {agent.role?.toLowerCase() || 'performance'}, suggest optimizations, and generate executive reports.
                            </p>
                        </div>

                        {/* Chat Messages */}
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden flex-shrink-0">
                                        <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-200">
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden flex-shrink-0">
                                        <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-sm font-bold text-white mb-2">Select an agent</h3>
                        <p className="text-xs text-gray-500 mb-8">Choose from the sidebar to begin</p>

                        <div className="space-y-4 opacity-50">
                            {/* ... visual placeholders ... */}
                            <div className="h-12 bg-white/5 rounded w-full" />
                            <div className="h-12 bg-white/5 rounded w-3/4" />
                            <div className="h-12 bg-white/5 rounded w-5/6" />
                        </div>
                    </>
                )}
            </div>

            {/* Chat Input Mock */}
            <div className="p-8 pt-4 border-t border-white/10 shrink-0">
                <div className="bg-white/5 border border-white/10 rounded flex gap-2 p-1">
                    <input type="text" placeholder={`Ask ${agent?.name || 'an agent'} a question...`} className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-500 px-3 py-2" />
                    <button className="bg-white text-black text-xs font-bold px-6 py-2 rounded uppercase hover:bg-gray-200 transition-colors">Send</button>
                </div>
            </div>
        </div>
    )
}
