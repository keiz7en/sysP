import React, {useState, useEffect, useRef} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'code' | 'math' | 'image' | 'link';
}

interface QuickAction {
    id: string;
    label: string;
    icon: string;
    message: string;
}

const StudentChat: React.FC = () => {
    const {user} = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: `Hello ${user?.first_name || 'there'}! 👋 I'm your AI assistant. I can help you with:

• **Academic questions** - Homework help, concept explanations
• **Course guidance** - Study plans, assignment assistance  
• **Career advice** - Job prospects, skill development
• **Technical support** - Using platform features
• **Research assistance** - Finding resources, citations

What would you like to explore today?`,
            sender: 'ai',
            timestamp: new Date()
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

    const generateAIResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase()

        // Simple keyword-based responses (in a real app, this would be an AI API call)
        if (lowerMessage.includes('homework') || lowerMessage.includes('assignment')) {
            return `I'd be happy to help with your homework! 📚

Here's how I can assist:
• Break down complex problems step-by-step
• Explain key concepts and formulas
• Provide practice examples
• Check your work and give feedback

**What subject is your homework in?** Please share the specific question or topic you're working on, and I'll provide detailed guidance.`
        }

        if (lowerMessage.includes('concept') || lowerMessage.includes('explain') || lowerMessage.includes('understand')) {
            return `Great question! I love explaining concepts! 🧠

**To give you the best explanation, please tell me:**
• What specific concept are you struggling with?
• What subject/course is this for?
• What part confuses you the most?

I can explain things using:
• Simple analogies and examples
• Visual descriptions
• Step-by-step breakdowns
• Real-world applications

What concept would you like me to explain?`
        }

        if (lowerMessage.includes('study') || lowerMessage.includes('plan') || lowerMessage.includes('exam')) {
            return `Let's create an effective study plan! 📅

**I'll help you build a personalized study schedule based on:**
• Your upcoming exams and deadlines
• Subject difficulty and your confidence level
• Available study time per day
• Your learning style preferences

**To get started, please share:**
• What subjects/courses do you need to study?
• When are your exams?
• How much time can you dedicate daily?
• Which topics do you find most challenging?

I'll create a structured plan with specific goals and milestones!`
        }

        if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('future')) {
            return `Career guidance is one of my specialties! 💼

**I can help you with:**
• Exploring career paths in your field
• Understanding job market trends
• Skill development recommendations
• Resume and interview preparation
• Networking strategies
• Graduate school decisions

**Let's start with:**
• What's your major or field of interest?
• Are you looking for internships, entry-level jobs, or career changes?
• What are your key strengths and interests?
• Any specific companies or roles you're considering?

I'll provide personalized insights and actionable next steps!`
        }

        if (lowerMessage.includes('help') || lowerMessage.includes('technical') || lowerMessage.includes('platform') || lowerMessage.includes('how')) {
            return `I'm here to help with technical questions! 🔧

**Platform features I can guide you through:**
• Navigating your dashboard and course materials
• Submitting assignments and tracking grades
• Using the adaptive learning system
• Setting up accessibility features
• Managing your profile and preferences
• Understanding AI assessments

**Common tasks:**
• "How do I submit an assignment?"
• "Where can I see my grades?"
• "How do I change my learning preferences?"
• "How do I access course materials?"

What specific feature or task do you need help with?`
        }

        if (lowerMessage.includes('research') || lowerMessage.includes('resources') || lowerMessage.includes('citation')) {
            return `Research assistance coming right up! 🔍

**I can help you with:**
• Finding credible academic sources
• Understanding citation formats (APA, MLA, Chicago)
• Organizing research materials
• Creating research outlines
• Fact-checking information
• Database search strategies

**For the best results, tell me:**
• What's your research topic?
• What type of sources do you need? (books, journals, websites)
• What citation style is required?
• What's the scope of your project?

I'll provide specific resources and research strategies tailored to your needs!`
        }

        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            return `You're very welcome! 😊 I'm always here to help. 

Is there anything else you'd like assistance with? I'm ready to support your learning journey 24/7!`
        }

        // Default response
        return `I'm here to help! 🤖

I noticed you asked about "${userMessage}". While I want to give you the most helpful response, I might need a bit more context.

**Here's what I'm great at helping with:**
• **Academic Support** - Homework, concepts, study strategies
• **Career Guidance** - Job search, skill development, industry insights  
• **Technical Help** - Platform features, troubleshooting
• **Research** - Finding sources, citations, fact-checking

Could you rephrase your question or let me know which area you'd like help with? The more specific you are, the better I can assist! 💪`
    }

    const handleSend = () => {
        if (message.trim()) {
            // Add user message
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                text: message.trim(),
                sender: 'user',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, userMessage])
            setMessage('')
            setSelectedQuickAction(null)

            // Simulate AI typing
            setIsTyping(true)

            // Generate and add AI response after delay
            setTimeout(() => {
                const aiResponse: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: generateAIResponse(message.trim()),
                    sender: 'ai',
                    timestamp: new Date()
                }

                setMessages(prev => [...prev, aiResponse])
                setIsTyping(false)
            }, 1500 + Math.random() * 1000) // Random delay for realism
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
                    🤖 AI Learning Assistant
                </h1>
                <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                    24/7 AI-powered academic support, career guidance, and personalized help
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
                                        marginTop: '0.5rem'
                                    }}>
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
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
                                AI is typing...
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
