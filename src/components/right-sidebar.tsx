'use client'

import { useState, useEffect, useRef } from 'react'
import { createPendingLeads } from '@/actions/outreach-actions'
import { useRouter } from 'next/navigation'

interface AgentContext {
    name: string
    avatarUrl: string
    role?: string
    slug?: string
    externalUrl?: string
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
    userName?: string
    initialChatId?: string
    chatTitle?: string
}

export function RightSidebar({ agent, userId, userName = 'there', initialChatId, chatTitle }: RightSidebarProps) {
    console.log('RightSidebar mounted/updated. ChatTitle:', chatTitle, 'InitialChatId:', initialChatId)
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [leadsCount, setLeadsCount] = useState<number>(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const getRandomVariation = (variations: string[]) => {
        return variations[Math.floor(Math.random() * variations.length)]
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    // Load Messages for Audience Agent
    useEffect(() => {
        if (agent?.slug === 'audience-channels' && initialChatId) {
            startChatSession(initialChatId)
        } else {
            // Reset for non-chat agents or no chat selected
            setMessages([])
            setIsTyping(false)
            // ... existing welcome logic for others ...
            if (agent && agent.slug !== 'audience-channels' && agent.externalUrl && agent.slug !== 'outreach') {
                setIsTyping(true)
                const timer = setTimeout(() => {
                    setIsTyping(false)
                    setMessages([{
                        id: 'welcome',
                        role: 'assistant',
                        content: (
                            <div className="space-y-2">
                                <p>Hello! The native integration for <strong>{agent.role}</strong> is currently under construction.</p>
                                <p>
                                    You can access the provisional version here: <br />
                                    <a href={agent.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[#1C73E8] underline hover:text-white transition-colors break-all">
                                        {agent.externalUrl}
                                    </a>
                                </p>
                            </div>
                        )
                    }])
                }, 1000)
                return () => clearTimeout(timer)
            }
        }
    }, [agent?.slug, initialChatId])

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

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text
        }

        setMessages(prev => [...prev, newMessage])
        setIsTyping(true)

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

        // Outreach Logic (Existing)
        if (agent?.slug === 'outreach') {
            const numberMatch = text.match(/(\d+)/)

            if (numberMatch) {
                const number = parseInt(numberMatch[0])
                setLeadsCount(number) // Store for webhook

                // 1. Immediate Response Variations
                const greetingVariations = [
                    `Ok ${userName}, understood. You want to find ${number} leads.`,
                    `Got it ${userName}. I see you're looking for ${number} leads.`,
                    `Understood ${userName}. So you need ${number} leads.`,
                    `Right ${userName}, noted. You are targeting ${number} leads.`,
                    `Ok ${userName}, I can help with that. You need ${number} leads.`
                ]

                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: getRandomVariation(greetingVariations)
                    }])
                    // Keep typing for next message
                }, 1000)

                // 2. Delayed Response Variations
                const confirmationVariations = [
                    "First, I need you to confirm the ICP on the left. If the information is correct, click send. If you need to change anything, update it, click 'Update Configuration' and then send.",
                    "Please verify the ICP details on the left before we proceed. If everything looks good, click send. Otherwise, make your changes, click 'Update Configuration', and then send.",
                    "I just need you to check the ICP configuration on the left. If it's accurate, go ahead and click send. If not, please update it, save the configuration, and then send.",
                    "Before I start, could you confirm the ICP settings on the left? Click send if they are correct. If you need to edit, update the fields, save the configuration, and then send.",
                    "One last thing: please review the ICP information on the left. If it's all correct, simply click send. If you need to adjust anything, update it, click 'Update Configuration', and send."
                ]

                setTimeout(() => {
                    setIsTyping(false)
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: (
                            <div className="space-y-3">
                                <p>{getRandomVariation(confirmationVariations)}</p>
                                <button
                                    onClick={(e) => handleSendWebhook(e, number)}
                                    className="bg-[#1C73E8] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#1557b0] transition-colors w-full"
                                >
                                    Confirm and Send
                                </button>
                            </div>
                        )
                    }])
                }, 4000)
            } else {
                // Fallback for no number
                setTimeout(() => {
                    setIsTyping(false)
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: `Please specify how many leads you need (type a number), ${userName}.`
                    }])
                }, 1500)
            }
        } else {
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
        <div className="w-[400px] border-l border-white/10 flex flex-col bg-black shrink-0">
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

            {/* Chat Input Mock */}
            <div className="p-8 pt-4 border-t border-white/10 shrink-0">
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
                        className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-500 px-3 py-2 resize-none max-h-[200px] overflow-y-auto"
                        style={{ minHeight: '40px' }}
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
                        className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg uppercase hover:bg-gray-200 transition-colors h-9 mb-0.5"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
