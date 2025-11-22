import React, {useState, useEffect, useRef} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {aiStudentAPI} from '../../../services/api'
import toast from 'react-hot-toast'

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'code' | 'math' | 'image' | 'link';
    ai_powered?: boolean;
}

interface EnrolledCourse {
    id: number;
    title: string;
    code: string;
    instructor_name: string;
}

interface QuickAction {
    id: string;
    label: string;
    icon: string;
    message: string;
}

const StudentChat: React.FC = () => {
    const {user, token} = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [message, setMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null)
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const quickActions: QuickAction[] = [
        {id: '1', label: 'Explain concept', icon: '🧠', message: 'Can you explain a concept from this course?'},
        {id: '2', label: 'Course overview', icon: '📚', message: 'Give me an overview of this course'},
        {id: '3', label: 'Study tips', icon: '💡', message: 'What are some study tips for this course?'},
        {id: '4', label: 'Assignment help', icon: '📝', message: 'I need help with an assignment in this course'},
        {id: '5', label: 'Exam preparation', icon: '📊', message: 'How should I prepare for exams in this course?'},
        {id: '6', label: 'Course materials', icon: '📖', message: 'What materials should I focus on for this course?'}
    ]

    useEffect(() => {
        fetchEnrolledCourses()
    }, [token])

    useEffect(() => {
        if (selectedCourse && enrolledCourses.length > 0) {
            const course = enrolledCourses.find(c => c.id === selectedCourse)
            if (course) {
                setMessages([{
                    id: '1',
                    text: `Hello ${user?.first_name || 'there'}! 👋 I'm your AI Course Assistant powered by Gemini.

**Currently helping with:** ${course.title} (${course.code})
**Instructor:** ${course.instructor_name}

I can help you with:
• **Course concepts** - Detailed explanations of topics
• **Study guidance** - How to approach course materials
• **Assignment help** - Understanding requirements and concepts
• **Exam preparation** - Study strategies and practice
• **Course materials** - Clarification on lectures and readings

💡 **Note:** I can only assist with your enrolled courses. Please select a course to get started!`,
                    sender: 'ai',
                    timestamp: new Date(),
                    ai_powered: true
                }])
            }
        } else if (enrolledCourses.length > 0) {
            setMessages([{
                id: '1',
                text: `Hello ${user?.first_name || 'there'}! 👋

To get started, please select one of your enrolled courses from the dropdown above. I can only provide guidance on courses you're currently taking.

📚 **Your Enrolled Courses:**
${enrolledCourses.map(c => `• ${c.title} (${c.code})`).join('\n')}

Select a course to begin!`,
                sender: 'ai',
                timestamp: new Date(),
                ai_powered: false
            }])
        } else {
            setMessages([{
                id: '1',
                text: `Hello ${user?.first_name || 'there'}! 👋

You don't have any enrolled courses yet. This AI assistant can only help with courses you're enrolled in.

Please enroll in courses first to access course-specific AI guidance.`,
                sender: 'ai',
                timestamp: new Date(),
                ai_powered: false
            }])
        }
        scrollToBottom()
    }, [selectedCourse, enrolledCourses, user])

    const fetchEnrolledCourses = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/students/dashboard/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                const courses = data.current_enrollments?.map((enrollment: any) => ({
                    id: enrollment.course_id,
                    title: enrollment.course_title,
                    code: enrollment.course_code,
                    instructor_name: enrollment.instructor_name
                })) || []
                setEnrolledCourses(courses)

                if (courses.length > 0 && !selectedCourse) {
                    setSelectedCourse(courses[0].id)
                }
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error)
            toast.error('Failed to load enrolled courses')
        }
    }

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

            if (!selectedCourse) {
                return {
                    text: "Please select a course first to get AI assistance specific to that course.",
                    ai_powered: false
                };
            }

            const response = await aiStudentAPI.sendChatMessage(token, {
                message: userMessage,
                course_id: selectedCourse,
                context: 'Course-specific learning assistant - provide helpful, educational responses related to the enrolled course only',
            });

            return {
                text: response.response,
                ai_powered: response.ai_powered
            };
        } catch (error: any) {
            console.error('AI Response Error:', error);

            if (error.message.includes('not enrolled') || error.message.includes('access')) {
                return {
                    text: "You don't have access to this course. Please select one of your enrolled courses.",
                    ai_powered: false
                };
            }

            return {
                text: "I'm sorry, I encountered an error processing your request. Please try again or select a different course.",
                ai_powered: false
            };
        }
    }

    const handleSend = async () => {
        if (!message.trim()) return

        if (!selectedCourse) {
            toast.error('Please select a course first')
            return
        }

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

    const handleQuickAction = (action: QuickAction) => {
        if (!selectedCourse) {
            toast.error('Please select a course first')
            return
        }
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
            <div style={{marginBottom: '1.5rem'}}>
                <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937'}}>
                    🎓 Course AI Assistant
                </h1>
                <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '1rem'}}>
                    AI-powered course guidance restricted to your enrolled courses
                </p>

                {/* Course Selector */}
                {enrolledCourses.length > 0 ? (
                    <div style={{marginBottom: '1rem'}}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151',
                            fontSize: '0.95rem'
                        }}>
                            Select Course *
                        </label>
                        <select
                            value={selectedCourse || ''}
                            onChange={(e) => setSelectedCourse(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                border: '2px solid #3b82f6',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">-- Select a course --</option>
                            {enrolledCourses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title} ({course.code}) - {course.instructor_name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        border: '1px solid #fbbf24',
                        color: '#92400e',
                        marginBottom: '1rem'
                    }}>
                        ⚠️ You need to enroll in courses to use this AI assistant.
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {selectedCourse && enrolledCourses.length > 0 && (
                <div style={{marginBottom: '1.5rem'}}>
                    <h3 style={{fontSize: '1rem', marginBottom: '0.75rem', color: '#374151', fontWeight: '600'}}>
                        🚀 Quick Actions for This Course
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{fontSize: '1rem'}}>{action.icon}</span>
                                {action.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Container */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                height: selectedCourse ? 'calc(100% - 280px)' : 'calc(100% - 200px)',
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
                    {selectedCourse ? (
                        <>
                            <div style={{display: 'flex', gap: '0.75rem', alignItems: 'flex-end'}}>
                                <div style={{flex: 1}}>
                                    <textarea
                                        ref={inputRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Ask about course concepts, assignments, or study materials..."
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
                                        Press Enter to send, Shift+Enter for new line • AI guidance restricted
                                        to {enrolledCourses.find(c => c.id === selectedCourse)?.title}
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
                        </>
                    ) : (
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#fef3c7',
                            borderRadius: '12px',
                            border: '1px solid #fbbf24',
                            color: '#92400e',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            ⚠️ Please select a course from the dropdown above to start chatting
                        </div>
                    )}
                </div>
            </div>

            {/* Restriction Notice */}
            <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                fontSize: '0.85rem',
                color: '#1e40af',
                textAlign: 'center'
            }}>
                🔒 <strong>Privacy & Restrictions:</strong> This AI assistant can only help with your enrolled courses.
                General fact-checking and non-course queries are not supported.
            </div>
        </motion.div>
    )
}

export default StudentChat
