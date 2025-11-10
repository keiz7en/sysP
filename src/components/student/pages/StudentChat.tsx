import React, {useState, useEffect, useRef} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {aiStudentAPI} from '../../../services/api'

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'code' | 'math' | 'image' | 'link';
    ai_powered?: boolean;
}

interface QuickAction {
    id: string;
    label: string;
    icon: string;
    message: string;
}

const StudentChat: React.FC = () => {
    const {user, token} = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: `Hello ${user?.first_name || 'there'}! 👋 I'm your AI assistant powered by Gemini. I can help you with:

• **Academic questions** - Homework help, concept explanations
• **Course guidance** - Study plans, assignment assistance  
• **Career advice** - Job prospects, skill development
• **Technical support** - Using platform features
• **Research assistance** - Finding resources, citations

What would you like to explore today?`,
            sender: 'ai',
            timestamp: new Date(),
            ai_powered: true
        }
    ])
    const [message, setMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const quickActions: QuickAction[] = [
        {id: '1', label: 'Help with homework', icon: '📚', message: 'I need help with my homework assignments'},
        {id: '2', label: 'Explain a concept', icon: '🧠', message: 'Can you explain a concept I\'m struggling with?'},
        {id: '3', label: 'Study plan', icon: '📅', message: 'Help me create a study plan for my upcoming exams'},
        {id: '4', label: 'Career guidance', icon: '💼', message: 'I need advice about my career path and opportunities'},
        {id: '5', label: 'Technical help', icon: '🔧', message: 'I need help using the platform features'},
        {id: '6', label: 'Research help', icon: '🔍', message: 'Help me find resources for my research project'}
    ]

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }

    const generateAIResponse = async (userMessage: string): Promise<{ text: string; ai_powered: boolean }> => {
        try {
            if (!token) {
                return {
                    text: "Please log in to use the AI assistant.",
                    ai_powered: false
                };
            }

            const response = await aiStudentAPI.sendChatMessage(token, {
                message: userMessage,
                context: 'Student learning assistant - provide helpful, educational responses',
            });

            return {
                text: response.response,
                ai_powered: response.ai_powered
            };
        } catch (error) {
            console.error('AI Response Error:', error);
            return {
                text: "I'm sorry, I encountered an error processing your request. Please try again or rephrase your question.",
                ai_powered: false
            };
        }
    }

    const handleSend = async () => {
        if (message.trim()) {
            // Add user message
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                text: message.trim(),
                sender: 'user',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, userMessage])
            const currentMessage = message.trim()
            setMessage('')
            setSelectedQuickAction(null)

            // Show AI typing
            setIsTyping(true)

            // Get AI response
            const aiResponseData = await generateAIResponse(currentMessage)

            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponseData.text,
                sender: 'ai',
                timestamp: new Date(),
                ai_powered: aiResponseData.ai_powered
            }

            setMessages(prev => [...prev, aiResponse])
            setIsTyping(false)
        }
    }

    const handleQuickAction = (action: QuickAction) => {
        setSelectedQuickAction(action.id)
        setMessage(action.message)
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const formatMessage = (text: string) => {
        // Simple markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .split('\n').map((line, i) => (
                <div key={i} dangerouslySetInnerHTML={{__html: line}}/>
            ))
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            style={{padding: '2rem', maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 200px)'}}
        >
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937'}}>
                    🔍 Fact AI Check
                </h1>
                <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                    AI-powered fact checking, verification, and educational support with Gemini
                </p>
            </div>

            {/* Quick Actions */}
            <div style={{marginBottom: '2rem'}}>
                <h3 style={{fontSize: '1.1rem', marginBottom: '1rem', color: '#374151'}}>
                    🚀 Quick Actions
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem'
                }}>
                    {quickActions.map((action) => (
                        <motion.button
                            key={action.id}
                            whileHover={{scale: 1.02}}
                            whileTap={{scale: 0.98}}
                            onClick={() => handleQuickAction(action)}
                            style={{
                                padding: '0.75rem 1rem',
                                backgroundColor: selectedQuickAction === action.id ? '#3b82f6' : '#f3f4f6',
                                color: selectedQuickAction === action.id ? 'white' : '#374151',
                                border: '1px solid ' + (selectedQuickAction === action.id ? '#3b82f6' : '#d1d5db'),
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{fontSize: '1.1rem'}}>{action.icon}</span>
                            {action.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Chat Container */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                height: 'calc(100% - 200px)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Messages */}
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '1rem'
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    backgroundColor: msg.sender === 'user' ? '#3b82f6' : '#f3f4f6',
                                    color: msg.sender === 'user' ? 'white' : '#1f2937',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5'
                                }}>
                                    <div style={{marginBottom: '0.5rem'}}>
                                        {formatMessage(msg.text)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        opacity: 0.7,
                                        textAlign: 'right',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        {msg.ai_powered && msg.sender === 'ai' && (
                                            <span style={{fontSize: '0.7rem', opacity: 0.8}}>
                                                ✨ Powered by Gemini AI
                                            </span>
                                        )}
                                        <span>
                                            {msg.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                marginBottom: '1rem'
                            }}
                        >
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderRadius: '20px 20px 20px 4px',
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.25rem'
                                }}>
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: '#6b7280'
                                            }}
                                        />
                                    ))}
                                </div>
                                🤖 AI is thinking...
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef}/>
                </div>

                {/* Input Area */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                }}>
                    <div style={{display: 'flex', gap: '0.75rem', alignItems: 'flex-end'}}>
                        <div style={{flex: 1}}>
                            <textarea
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask me anything about your studies, career, or how to use the platform..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    resize: 'none',
                                    fontFamily: 'inherit',
                                    backgroundColor: 'white'
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                            />
                            <div style={{
                                fontSize: '0.8rem',
                                color: '#6b7280',
                                marginTop: '0.5rem'
                            }}>
                                Press Enter to send, Shift+Enter for new line
                            </div>
                        </div>
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={handleSend}
                            disabled={!message.trim() || isTyping}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: !message.trim() || isTyping ? '#9ca3af' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: !message.trim() || isTyping ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                minWidth: '80px',
                                height: 'fit-content'
                            }}
                        >
                            {isTyping ? '⏳' : '🚀'}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default StudentChat
