'use client'

import { useState, useEffect, useRef } from 'react'
import { createPendingLeads } from '@/actions/outreach-actions'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/components/providers/sidebar-provider'
import { Sidebar as SidebarIcon } from 'lucide-react'
import { saveChatMessage, getChatMessages } from '@/actions/agent-chat-actions'

interface AgentContext {
    name: string
    avatarUrl: string
    role?: string
    slug?: string
    externalUrl?: string
    description?: string
}

// Cleaned imports
import { getMessages, sendMessage } from '@/actions/audience-actions'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: React.ReactNode
}

interface RightSidebarProps {
    agent?: AgentContext
    userId?: string
    companyId?: string
    userName?: string
    initialChatId?: string
    chatTitle?: string
    companyName?: string
    userFullName?: string
}

export function RightSidebar({ agent, userId, companyId, userName = 'there', initialChatId, chatTitle, companyName, userFullName }: RightSidebarProps) {
    const { isRightSidebarCollapsed, toggleRightSidebar } = useSidebar()
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [leadsCount, setLeadsCount] = useState<number>(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const shouldScrollInstantly = useRef(false)
    const router = useRouter()

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    const getRandomVariation = (variations: string[]) => {
        return variations[Math.floor(Math.random() * variations.length)]
    }

    useEffect(() => {
        if (shouldScrollInstantly.current) {
            scrollToBottom('instant')
            shouldScrollInstantly.current = false
        } else {
            scrollToBottom('smooth')
        }
    }, [messages, isTyping])

    // Load Messages for Audience Agent
    useEffect(() => {
        if (agent?.slug === 'audience-channels' && initialChatId) {
            startChatSession(initialChatId)
        } else {
            // Reset for non-chat agents or no chat selected
            setMessages([])
            setIsTyping(false)

            // Special message for Audience agent when no chat is selected
            if (agent?.slug === 'audience-channels' && !initialChatId) {
                setIsTyping(true)
                const timer = setTimeout(() => {
                    setIsTyping(false)
                    setMessages([{
                        id: 'welcome-icp',
                        role: 'assistant',
                        content: (
                            <div className="space-y-2">
                                <p>Hey {userName}, please create or select an ICP on the side so we can start.</p>
                            </div>
                        )
                    }])
                }, 1000)
                return () => clearTimeout(timer)
            }

            // ... existing welcome logic for others ...
            // ... existing welcome logic for others ...
            /* 
               Message removed as requested. 
               The native integration under construction message is no longer needed.
            */
        }
    }, [agent?.slug, initialChatId])

    // Load Messages for AI Agents (Generic)
    useEffect(() => {
        if (agent?.slug && agent.slug !== 'audience-channels' && companyId && userId) {
            loadAgentChatHistory(agent.name, companyId, userId)
        }
    }, [agent?.slug, agent?.name, companyId, userId])

    const loadAgentChatHistory = async (agentName: string, companyId: string, userId: string) => {
        setIsTyping(true)
        setMessages([])
        const result = await getChatMessages({ empresa_id: companyId, agent_name: agentName, user_id: userId })
        if (result.success && result.messages) {
            // Map IDs to strings to match Message interface if they are UUIDs
            setMessages(result.messages.map(m => ({
                ...m,
                id: m.id.toString()
            })) as Message[])
        }
        setIsTyping(false)
    }

    const startChatSession = async (chatId: string) => {
        setIsTyping(true)
        setMessages([]) // Clear previous
        const dbMessages = await getMessages(chatId)

        // Map DB messages to UI
        const uiMessages = dbMessages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content
        })) as Message[]

        shouldScrollInstantly.current = true
        setMessages(uiMessages)
        setIsTyping(false)

        // If empty, add a welcome message specific to the selected chat title
        if (uiMessages.length === 0) {
            const welcomeMsg = chatTitle
                ? `Hi ${userName}! I'm ready to help you with "<strong>${chatTitle}</strong>". What would you like to know or discuss about this audience?`
                : `Hi ${userName}! I'm ready to help you with your audience strategy. What's on your mind?`

            setMessages([{
                id: 'welcome-new',
                role: 'assistant',
                content: <span dangerouslySetInnerHTML={{ __html: welcomeMsg }} />
            }])
        }
    }

    const persistMessage = async (msgData: {
        empresa_id: string
        user_id: string
        agent_name: string
        message: string
        sender: 'AGENT' | 'USER'
    }) => {
        try {
            await fetch('/api/chats/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgData)
            })
        } catch (error) {
            console.error('Failed to persist message:', error)
        }
    }

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text
        }

        setMessages(prev => [...prev, newMessage])
        setIsTyping(true)

        // Persist User Message (except for audience-channels which has its own logic)
        if (agent?.slug !== 'audience-channels' && companyId && userId && agent?.name) {
            persistMessage({
                empresa_id: companyId,
                user_id: userId,
                agent_name: agent.name,
                message: text,
                sender: 'USER'
            })
        }

        // Audience Logic (Real DB)
        if (agent?.slug === 'audience-channels' && initialChatId) {
            // 1. Send User Message & Get AI Response
            const res = await sendMessage(initialChatId, text, 'user')

            if (res.aiResponse) {
                // 2. Add AI Response to UI (Backend already saved it to DB)
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: res.aiResponse
                }])
            }

            setIsTyping(false)
            return
        }

        // Outreach Logic (Amanda Webhook API)
        if (agent?.slug === 'outreach') {
            try {
                // Send POST to Amanda's specific hook
                const payload = {
                    agent_name: "Amanda",
                    empresa_id: companyId,
                    text: text,
                    agente_name: "Amanda",
                    user_name: userFullName || userName,
                    empresa: companyName || 'Unknown Company'
                }

                console.log('DEBUG: Sending Amanda Webhook Payload:', payload)

                const response = await fetch('https://hook.startg4.com/webhook/2c65b755-6b30-44b2-ae51-7072d7e63510-amanda', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                if (!response.ok) {
                    throw new Error('Failed to send webhook')
                }

                const data = await response.json()
                const aiMsg = Array.isArray(data) && data[0]?.output
                    ? data[0].output
                    : (data.output || "Understood. I'm processing your request.");

                setMessages(prev => [...prev, {
                    id: Date.now().toString() + '-ai',
                    role: 'assistant',
                    content: aiMsg
                }])

                setIsTyping(false)

                // Persist Agent Message
                if (companyId && userId && agent?.name) {
                    persistMessage({
                        empresa_id: companyId,
                        user_id: userId,
                        agent_name: agent.name,
                        message: aiMsg,
                        sender: 'AGENT'
                    })
                }

                // Check for numeric leads logic (keeping backward compatibility if needed)
                const numberMatch = text.match(/(\d+)/)
            } catch (error) {
                console.error('Amanda Webhook Error:', error)
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Sorry, I encountered an error while processing your request. Please try again later."
                }])
            }
        }

        // Lauren (Organic Social) Logic - Internal Backend with OpenAI
        else if (agent?.slug === 'organic-social') {
            try {
                // Prepare messages to send to backend (only user and assistant roles)
                const apiMessages = [...messages, newMessage].map(m => ({
                    role: m.role,
                    content: m.content
                }))

                const response = await fetch('/api/chats/organic', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: apiMessages,
                        company_id: companyId,
                        user_name: userFullName || userName,
                    })
                })

                if (!response.ok) {
                    throw new Error('Failed to get response from Lauren backend')
                }

                // Handle Streaming Response
                if (!response.body) throw new Error('No response body')

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let aiResponseText = ''

                // Create a placeholder message in UI
                const tempId = Date.now().toString() + '-ai'
                setMessages(prev => [...prev, {
                    id: tempId,
                    role: 'assistant',
                    content: ''
                }])
                setIsTyping(false) // Turn off bouncing dots since we are streaming text

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    // Decode the chunk (Vercel AI SDK streamText sends special format, 
                    // usually text chunks start with '0:' e.g. '0:"Hello"')
                    const chunkText = decoder.decode(value, { stream: true })
                    const lines = chunkText.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('0:')) {
                            // Extract actual text chunk
                            try {
                                const payload = JSON.parse(line.substring(2))
                                aiResponseText += payload

                                // Update UI message incrementally
                                setMessages(prev => prev.map(m =>
                                    m.id === tempId ? { ...m, content: aiResponseText } : m
                                ))
                            } catch (e) {
                                // Ignore parse errors for partial chunks
                            }
                        }
                    }
                }

                // Persist Agent Message when stream completes
                if (companyId && userId && agent?.name) {
                    persistMessage({
                        empresa_id: companyId,
                        user_id: userId,
                        agent_name: agent.name,
                        message: aiResponseText,
                        sender: 'AGENT'
                    })
                }

            } catch (error) {
                console.error('Lauren AI Error:', error)
                setIsTyping(false)
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Sorry, I had trouble connecting to the knowledge base. Please try again."
                }])
            }
        }

        // CRM Logic (Emily Webhook API)
        else if (agent?.slug === 'crm') {
            try {
                // Send POST to Emily's specific hook
                const response = await fetch('https://hook.startg4.com/webhook/8dca6858-985e-41ff-b366-5913f9532553', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agente_name: "Emily",
                        empresa_id: companyId,
                        text: text
                    })
                })

                if (!response.ok) {
                    throw new Error('Failed to send webhook')
                }

                const data = await response.json()
                const aiMsg = Array.isArray(data) && data[0]?.output
                    ? data[0].output
                    : (data.output || "Understood. I'm processing your request.");

                setMessages(prev => [...prev, {
                    id: Date.now().toString() + '-ai',
                    role: 'assistant',
                    content: aiMsg
                }])

                setIsTyping(false)

                // Persist Agent Message
                if (companyId && userId && agent?.name) {
                    persistMessage({
                        empresa_id: companyId,
                        user_id: userId,
                        agent_name: agent.name,
                        message: aiMsg,
                        sender: 'AGENT'
                    })
                }

            } catch (error) {
                console.error('Emily Webhook Error:', error)
                setIsTyping(false)
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Sorry, I encountered an error while processing your request. Please try again later."
                }])
            }
        }

        // Strategy Logic (Liz Webhook API)
        else if (agent?.slug === 'strategy-overview') {
            try {
                // 1. Persist User Message FIRST (and wait)
                if (companyId && userId && agent?.name) {
                    await persistMessage({
                        empresa_id: companyId,
                        user_id: userId,
                        agent_name: agent.name,
                        message: text,
                        sender: 'USER'
                    })
                }

                // 2. Wait 3 seconds
                await new Promise(resolve => setTimeout(resolve, 3000))

                // 3. Send POST to Liz's specific hook
                const payload = {
                    empresa_id: companyId,
                    user_id: userId,
                    agent_name: "Liz",
                    message: text,
                    sender: "USER"
                }

                const response = await fetch('https://hook.startg4.com/webhook/3453cb1e-a654-4cb1-9b33-acbfaf9322a6', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                if (!response.ok) {
                    const errText = await response.text()
                    console.error('Liz Webhook Failed:', response.status, errText)
                    throw new Error('Failed to send webhook')
                }

                const textRes = await response.text()
                let data
                try {
                    data = textRes ? JSON.parse(textRes) : {}
                } catch (e) {
                    console.warn('Liz Webhook return invalid JSON:', textRes)
                    data = {}
                }

                // New format: { "message": "..." }
                // Fallback to old format just in case: data.output or data[0].output
                const aiMsg = data.message ||
                    (Array.isArray(data) && data[0]?.output ? data[0].output : data.output) ||
                    "I'm analyzing your strategy. One moment please.";

                setMessages(prev => [...prev, {
                    id: Date.now().toString() + '-ai',
                    role: 'assistant',
                    content: aiMsg
                }])

                setIsTyping(false)

                // Agent message is now persisted by the backend, so we don't save it here.

            } catch (error) {
                console.error('Liz Webhook Error:', error)
                setIsTyping(false)
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Sorry, I encountered an error while processing your request. Please try again later."
                }])
            }
        }

        else {
            // Default echo for others if needed, or nothing
            setIsTyping(false)
        }
    }

    const handleSendWebhook = async (e: React.MouseEvent<HTMLButtonElement>, countOverride?: number) => {
        const btn = e.currentTarget
        const count = countOverride !== undefined ? countOverride : leadsCount
        btn.disabled = true
        btn.innerText = "Sending..."

        // Success Variations
        const successVariations = [
            "Request sent successfully! You will receive your leads shortly.",
            "Great! Request sent. Your leads will be with you soon.",
            "Done! I've sent your request. Expect the leads shortly.",
            "Successfully sent! You'll get your leads in a moment.",
            "Request confirmed and sent! Your leads are on their way."
        ]

        try {
            const storedData = localStorage.getItem('outreach_icp_data')
            const body = storedData ? JSON.parse(storedData) : {}

            // Add User ID to payload
            if (userId) {
                body.user_id = userId
            }

            // Allow override of leads count if we tracked it, but user said "everything filled in ICP"
            // Parallel execution: Webhook + DB Insertion
            await Promise.all([
                fetch('https://hook.startg4.com/webhook/4a03306f-54de-43b6-a7ed-bf08f0515e6a', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }),
                createPendingLeads(count > 0 ? count : 1) // Default to 1 if count lost
            ])

            btn.innerText = "Sent!"

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: getRandomVariation(successVariations)
            }])

            router.refresh() // Refresh UI to show new pending leads

        } catch (error) {
            console.error(error)
            btn.innerText = "Error sending"
            btn.disabled = false
            alert("Error sending webhook")
        }
    }



    return (
        <div className={`border-l border-white/10 flex flex-col bg-[#171717] w-full h-full transition-all duration-300 relative`}>

            {/* Toggle Button - Absolute */}
            <button
                onClick={toggleRightSidebar}
                className={`absolute z-20 top-6 text-gray-400 hover:text-white transition-all ${isRightSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-4'}`}
                title={isRightSidebarCollapsed ? "Expand Chat" : "Collapse Chat"}
            >
                <SidebarIcon size={20} className="scale-x-[-1]" />
            </button>

            <div className={`flex-1 overflow-y-auto px-6 pb-8 pt-6 custom-scrollbar transition-opacity duration-200 ${isRightSidebarCollapsed ? 'opacity-0 invisible hidden' : 'opacity-100 visible'}`}>
                {agent ? (
                    <>
                        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 flex flex-col gap-3 mb-6 w-[85%] ml-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-[#1C73E8] overflow-hidden flex-shrink-0">
                                    <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xl font-bold text-white leading-none">
                                        {agent.name}
                                    </p>
                                    <h3 className="text-xs font-bold text-[#1C73E8] mt-1 leading-none uppercase tracking-wide whitespace-nowrap">
                                        {agent.role || 'AI Agent'}
                                    </h3>
                                </div>
                            </div>

                            {/* Agent Description */}
                            {agent?.description && (
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {agent.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Chat Messages */}
                        <div className="space-y-4">
                            {/* Chat Badge */}
                            {chatTitle && (
                                <div className="flex justify-center w-full mb-6">
                                    <div className="bg-[#1C73E8]/20 text-[#1C73E8] border border-[#1C73E8]/30 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1C73E8] animate-pulse" />
                                        {chatTitle}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : ''
                                        }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden flex-shrink-0">
                                            <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div
                                        className={`rounded-lg p-3 text-sm max-w-[80%] whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'bg-[#1C73E8] text-white'
                                            : 'bg-white/5 border border-white/10 text-gray-200'
                                            }`}
                                    >
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
                            <div ref={messagesEndRef} />
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

            {/* Liz Suggestions */}
            {agent?.slug === 'strategy-overview' && messages.length === 0 && (
                <div className="px-4 pb-2 flex flex-col gap-2 shrink-0 items-end">
                    {[
                        "How do I choose the right channels for my type of business?",
                        "How do I know when to scale or stop a channel?",
                        "How do I combine channels without wasting budget?",
                        "How do I turn attention into real sales opportunities?"
                    ].map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSendMessage(suggestion)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors text-right"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Chat Input Mock */}
            <div className={`p-4 pt-2 border-t border-white/10 shrink-0 transition-opacity duration-200 ${isRightSidebarCollapsed ? 'opacity-0 invisible hidden' : 'opacity-100 visible'}`}>
                <div className="bg-white/5 border border-white/10 rounded-xl flex gap-2 p-2 items-end">
                    <textarea
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const target = e.target as HTMLTextAreaElement;
                                handleSendMessage(target.value);
                                target.value = '';
                                target.style.height = 'auto';
                            }
                        }}
                        rows={1}
                        placeholder={`Ask ${agent?.name || 'an agent'} a question...`}
                        className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-500 px-3 py-2 resize-none max-h-[200px] overflow-y-auto min-h-[40px]"
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                    />
                    <button
                        onClick={(e) => {
                            const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement
                            handleSendMessage(textarea.value)
                            textarea.value = ''
                            textarea.style.height = 'auto'
                        }}
                        className="bg-white text-black text-xs font-bold px-3 py-2 rounded-lg uppercase hover:bg-gray-200 transition-colors h-9 mb-0.5 whitespace-nowrap"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
