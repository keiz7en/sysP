import React, {useState, useEffect} from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import {motion, AnimatePresence} from 'framer-motion'
import toast from 'react-hot-toast'

// User state management
interface UserState {
    isFirstTime: boolean
    hasCompletedOnboarding: boolean
    userType: 'student' | 'teacher' | null
    email: string
    lastLoginDate: string
    preferences: {
        theme: 'light' | 'dark'
        language: string
        notifications: boolean
    }
}

const defaultUserState: UserState = {
    isFirstTime: true,
    hasCompletedOnboarding: false,
    userType: null,
    email: '',
    lastLoginDate: '',
    preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
    }
}

// Simple Loading Screen
const LoadingScreen = () => (
    <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
    }}>
        <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '2rem'
        }}/>
        <h1 style={{fontSize: '3rem', marginBottom: '1rem', fontWeight: 700}}>
            🎓 EduAI System
        </h1>
        <p style={{fontSize: '1.25rem', opacity: 0.9}}>
            Initializing your AI-powered education experience...
        </p>

        <style dangerouslySetInnerHTML={{
            __html: `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `
        }}/>
    </div>
)

// Welcome Back Screen for Returning Users
const WelcomeBackScreen = ({userState, onContinue}: { userState: UserState, onContinue: () => void }) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleContinue = () => {
        setIsLoading(true)
        toast.success(`Welcome back, ${userState.email}!`)
        setTimeout(() => {
            onContinue()
        }, 1500)
    }

    const formatLastLogin = (dateString: string) => {
        if (!dateString) return 'Recently'
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
        return `${Math.ceil(diffDays / 30)} months ago`
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            <motion.div
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.5}}
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '3rem',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    margin: '0 auto 2rem auto',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                }}>
                    👋
                </div>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Welcome Back!
                </h1>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    marginBottom: '2rem',
                    lineHeight: 1.6
                }}>
                    Ready to continue your AI-powered learning journey?
                </p>

                <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: userState.userType === 'student' ? '#6366f1' : '#ec4899',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            {userState.userType === 'student' ? '🎓' : '👨‍🏫'}
                        </div>
                        <div>
                            <div style={{fontWeight: 600, color: '#1e293b'}}>
                                {userState.email}
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#64748b'}}>
                                {userState.userType === 'student' ? 'Student Account' : 'Teacher Account'}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Last active: {formatLastLogin(userState.lastLoginDate)}</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 500
                        }}>
                            Active User
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleContinue}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: isLoading ? '#94a3b8' : '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        marginBottom: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {isLoading ? 'Loading Dashboard...' : 'Continue to Dashboard'}
                </button>

                <button
                    onClick={() => {
                        localStorage.removeItem('eduai_user_state')
                        window.location.reload()
                    }}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'transparent',
                        color: '#64748b',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    Sign in as Different User
                </button>
            </motion.div>
        </div>
    )
}

// Simple Onboarding Screen
const OnboardingScreen = ({onComplete}: { onComplete: () => void }) => {
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = [
        {
            icon: '🧠',
            title: 'AI-Powered Learning',
            description: 'Experience personalized education with AI that adapts to your learning style and pace'
        },
        {
            icon: '📝',
            title: 'Smart Assessments',
            description: 'Take AI-generated quizzes and get instant feedback with detailed performance analysis'
        },
        {
            icon: '💼',
            title: 'Career Guidance',
            description: 'Get personalized job recommendations and skill assessments based on your academic performance'
        },
        {
            icon: '🤖',
            title: 'Intelligent Assistant',
            description: 'Chat with our AI assistant for instant help with courses, assignments, and career advice'
        }
    ]

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1)
        } else {
            onComplete()
        }
    }

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1)
        }
    }

    const slide = slides[currentSlide]

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                maxWidth: '600px',
                textAlign: 'center',
                background: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    fontSize: '5rem',
                    marginBottom: '2rem'
                }}>
                    {slide.icon}
                </div>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: '#1e293b'
                }}>
                    {slide.title}
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: '#64748b',
                    marginBottom: '3rem',
                    lineHeight: 1.6
                }}>
                    {slide.description}
                </p>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: currentSlide === 0 ? '#e2e8f0' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Back
                    </button>

                    <div style={{display: 'flex', gap: '8px'}}>
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: index === currentSlide ? '#6366f1' : '#e2e8f0'
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextSlide}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Simple Login Screen
const LoginScreen = ({onLogin}: { onLogin: (type: 'student' | 'teacher', email: string) => void }) => {
    const [userType, setUserType] = useState<'student' | 'teacher'>('student')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = () => {
        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }
        toast.success(`Welcome! Logging in as ${userType}`)
        setTimeout(() => onLogin(userType, email), 500)
    }

    const handleDemoLogin = () => {
        const demoEmail = userType === 'student' ? 'student@demo.com' : 'teacher@demo.com'
        setEmail(demoEmail)
        setPassword('demo123')
        toast.success('Demo credentials loaded')
        setTimeout(() => onLogin(userType, demoEmail), 500)
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                background: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Welcome Back
                </h1>

                <p style={{
                    textAlign: 'center',
                    color: '#64748b',
                    marginBottom: '2rem'
                }}>
                    Sign in to your EduAI account
                </p>

                <div style={{marginBottom: '2rem'}}>
                    <div style={{
                        display: 'flex',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '12px',
                        padding: '4px'
                    }}>
                        <button
                            onClick={() => setUserType('student')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: userType === 'student' ? '#6366f1' : 'transparent',
                                color: userType === 'student' ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            🎓 Student
                        </button>
                        <button
                            onClick={() => setUserType('teacher')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: userType === 'teacher' ? '#6366f1' : 'transparent',
                                color: userType === 'teacher' ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            👨‍🏫 Teacher
                        </button>
                    </div>
                </div>

                <div style={{marginBottom: '1rem'}}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{marginBottom: '2rem'}}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    Sign In
                </button>

                <button
                    onClick={handleDemoLogin}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: 'transparent',
                        color: '#6366f1',
                        border: '2px solid #6366f1',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Try Demo Account
                </button>
            </div>
        </div>
    )
}

// --- Enhanced Features Explorer (revamped for full category page navigation) ---
const FeaturesExplorer = ({onBack, onCategorySelect}: {
    onBack: () => void,
    onCategorySelect: (categoryId: string) => void
}) => {
    const [selectedCategory, setSelectedCategory] = useState(0)

    const featureCategories = [
        {
            id: 'student_records',
            title: 'Student Information & Academic Records',
            icon: '📊',
            color: '#6366f1',
            description: 'Centralized student profiles with AI-powered academic analysis',
            features: [
                {
                    name: 'Smart Student Profiles',
                    description: 'Comprehensive demographics, academic history, and performance tracking',
                    icon: '👤',
                    benefits: ['Automated transcript generation', 'Real-time grade tracking', 'Performance analytics']
                },
                {
                    name: 'AI Progress Analysis',
                    description: 'Identify strengths, weaknesses, and dropout risks using machine learning',
                    icon: '🎯',
                    benefits: ['Early intervention alerts', 'Strength identification', 'Personalized recommendations']
                },
                {
                    name: 'Attendance Intelligence',
                    description: 'Smart attendance tracking with pattern recognition',
                    icon: '📅',
                    benefits: ['Automated attendance', 'Pattern analysis', 'Engagement insights']
                }
            ]
        },
        {
            id: 'adaptive_learning',
            title: 'Personalized & Adaptive Learning',
            icon: '🧠',
            color: '#8b5cf6',
            description: 'AI-powered customized learning paths for every student',
            features: [
                {
                    name: 'Adaptive Learning Paths',
                    description: 'AI designs custom learning journeys based on individual progress and learning style',
                    icon: '🛤️',
                    benefits: ['Personalized curriculum', 'Adaptive difficulty', 'Optimal pacing']
                },
                {
                    name: 'Gamification Engine',
                    description: 'Engagement tracking with game elements to keep learners motivated',
                    icon: '🎮',
                    benefits: ['Achievement badges', 'Progress rewards', 'Interactive challenges']
                },
                {
                    name: 'AI-Generated Assessments',
                    description: 'Dynamic quizzes and tests tailored to individual learning needs',
                    icon: '📝',
                    benefits: ['Custom question generation', 'Difficulty adjustment', 'Instant feedback']
                }
            ]
        },
        {
            id: 'teacher_management',
            title: 'Teacher & Course Management',
            icon: '👨‍🏫',
            color: '#ec4899',
            description: 'Digital teacher profiles and AI-automated course management',
            features: [
                {
                    name: 'Teacher Performance Analytics',
                    description: 'Digital profiles with expertise mapping and effectiveness metrics',
                    icon: '📈',
                    benefits: ['Teaching effectiveness analysis', 'Expertise tracking', 'Performance insights']
                },
                {
                    name: 'Content Digitization AI',
                    description: 'Automated course content creation and digitization',
                    icon: '📚',
                    benefits: ['Auto content generation', 'Material digitization', 'Curriculum mapping']
                },
                {
                    name: 'Speech-to-Text Integration',
                    description: 'Voice recognition for note-taking and transcript generation',
                    icon: '🎤',
                    benefits: ['Automated transcription', 'Voice note-taking', 'Accessibility support']
                }
            ]
        },
        {
            id: 'career_guidance',
            title: 'Career Guidance & Employability',
            icon: '💼',
            color: '#10b981',
            description: 'AI-driven career matching and skill development',
            features: [
                {
                    name: 'Smart Resume Analysis',
                    description: 'AI parsing and skill assessment to match job market needs',
                    icon: '📄',
                    benefits: ['Resume optimization', 'Skill gap analysis', 'Job matching']
                },
                {
                    name: 'Job Recommendation Engine',
                    description: 'NLP-based matching of student profiles with job opportunities',
                    icon: '🎯',
                    benefits: ['Personalized job suggestions', 'Skill alignment', 'Career path guidance']
                },
                {
                    name: 'Career Chatbot Advisor',
                    description: 'NLP-powered guidance on courses, admissions, and scholarships',
                    icon: '🤖',
                    benefits: ['24/7 career guidance', 'Scholarship recommendations', 'Course suggestions']
                }
            ]
        },
        {
            id: 'academic_automation',
            title: 'Academic Automation & Assessment',
            icon: '⚡',
            color: '#f59e0b',
            description: 'OCR and AI-powered automated grading systems',
            features: [
                {
                    name: 'OCR Mark Entry System',
                    description: 'Optical character recognition for automated grade entry',
                    icon: '📋',
                    benefits: ['Automated grade entry', 'Error reduction', 'Time saving']
                },
                {
                    name: 'AI Essay Scoring',
                    description: 'Transformer NLP models for consistent, unbiased essay evaluation',
                    icon: '✍️',
                    benefits: ['Consistent grading', 'Grammar analysis', 'Creativity assessment']
                },
                {
                    name: 'OBE Mapping System',
                    description: 'Outcome-Based Education linking performance with learning objectives',
                    icon: '🎯',
                    benefits: ['Learning outcome tracking', 'Objective alignment', 'Quality assurance']
                }
            ]
        },
        {
            id: 'research_insights',
            title: 'Research & Policy Insights',
            icon: '🔬',
            color: '#ef4444',
            description: 'Machine learning models for educational insights and policy guidance',
            features: [
                {
                    name: 'Predictive Analytics',
                    description: 'ML models predicting student performance and dropout risks',
                    icon: '📊',
                    benefits: ['Performance prediction', 'Risk assessment', 'Trend analysis']
                },
                {
                    name: 'Policy Intelligence',
                    description: 'Data-driven insights for educational policy and strategy',
                    icon: '📋',
                    benefits: ['Evidence-based policies', 'Success rate analysis', 'Strategic planning']
                },
                {
                    name: 'Multi-language Impact Analysis',
                    description: 'Analyze effectiveness of different instructional languages',
                    icon: '🌐',
                    benefits: ['Language effectiveness', 'Cultural adaptation', 'Inclusive education']
                }
            ]
        },
        {
            id: 'engagement_accessibility',
            title: 'Engagement & Accessibility',
            icon: '♿',
            color: '#8b5cf6',
            description: 'AI-powered engagement monitoring and accessibility features',
            features: [
                {
                    name: 'Engagement Analytics',
                    description: 'AI monitors interaction patterns to optimize lesson design',
                    icon: '📈',
                    benefits: ['Interaction tracking', 'Engagement optimization', 'Learning adaptation']
                },
                {
                    name: 'Voice Recognition System',
                    description: 'Automated form filling and lecture transcription',
                    icon: '🎙️',
                    benefits: ['Voice-to-text', 'Automated forms', 'Accessibility support']
                },
                {
                    name: 'Adaptive Interface',
                    description: 'Interface adjusts based on user needs and disabilities',
                    icon: '🎨',
                    benefits: ['Disability support', 'Personalized UI', 'Inclusive design']
                }
            ]
        }
    ]

    const currentCategory = featureCategories[selectedCategory]

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                color: 'white',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '2rem',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    ← Back to Dashboard
                </button>

                <h1 style={{fontSize: '3rem', marginBottom: '1rem', fontWeight: 700}}>
                    🚀 AI-Powered Education Features
                </h1>
                <p style={{fontSize: '1.25rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto'}}>
                    Explore our comprehensive AI-driven solutions for modern education and career development
                </p>
            </div>

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '2rem'
            }}>
                {/* Category Sidebar */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    height: 'fit-content',
                    position: 'sticky',
                    top: '2rem'
                }}>
                    <h3 style={{marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.25rem'}}>
                        Feature Categories
                    </h3>

                    {featureCategories.map((category, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedCategory(index)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                backgroundColor: selectedCategory === index ? category.color : 'transparent',
                                color: selectedCategory === index ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            <span style={{fontSize: '1.5rem'}}>{category.icon}</span>
                            <div>
                                <div style={{fontWeight: 600, fontSize: '0.9rem'}}>
                                    {category.title}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Feature Details */}
                <div>
                    <motion.div
                        key={selectedCategory}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                    >
                        {/* Category Header */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            marginBottom: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            background: `linear-gradient(135deg, ${currentCategory.color}15, ${currentCategory.color}05)`
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                                <div style={{
                                    fontSize: '3rem',
                                    width: '80px',
                                    height: '80px',
                                    backgroundColor: currentCategory.color,
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {currentCategory.icon}
                                </div>
                                <div>
                                    <h2 style={{fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0}}>
                                        {currentCategory.title}
                                    </h2>
                                    <p style={{fontSize: '1.1rem', color: '#64748b', margin: '0.5rem 0 0 0'}}>
                                        {currentCategory.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onCategorySelect(currentCategory.id)}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: currentCategory.color,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        marginLeft: 'auto'
                                    }}
                                >
                                    View Full System
                                </button>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {currentCategory.features.map((feature, index) => (
                                <div
                                    key={index}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            fontSize: '2rem',
                                            width: '60px',
                                            height: '60px',
                                            backgroundColor: `${currentCategory.color}15`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {feature.icon}
                                        </div>
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            margin: 0
                                        }}>
                                            {feature.name}
                                        </h3>
                                    </div>

                                    <p style={{
                                        color: '#64748b',
                                        marginBottom: '1.5rem',
                                        lineHeight: 1.6
                                    }}>
                                        {feature.description}
                                    </p>

                                    <div>
                                        <h4 style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            color: currentCategory.color,
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Key Benefits
                                        </h4>
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0
                                        }}>
                                            {feature.benefits.map((benefit, bIndex) => (
                                                <li key={bIndex} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.25rem',
                                                    fontSize: '0.9rem',
                                                    color: '#64748b'
                                                }}>
                                                    <span style={{color: currentCategory.color}}>✓</span>
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

// Enhanced Dashboard with user state
const Dashboard = ({userState, onExploreFeatures}: { userState: UserState, onExploreFeatures: () => void }) => (
    <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif'
    }}>
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Welcome Header */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '3rem',
                color: 'white',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    marginBottom: '0.5rem',
                    fontWeight: 700
                }}>
                    🎉 Welcome to EduAI System
                </h1>
                <p style={{
                    fontSize: '1.5rem',
                    opacity: 0.9,
                    marginBottom: '1rem'
                }}>
                    {userState.userType === 'student' ? 'Student Dashboard' : 'Teacher Dashboard'}
                </p>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'inline-block'
                }}>
                    <span style={{fontSize: '1.1rem'}}>
                        👋 Hello, {userState.email.split('@')[0]}!
                    </span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
            }}>
                {[
                    {icon: '📚', title: 'Courses', desc: 'Manage your courses and learning paths'},
                    {icon: '🤖', title: 'AI Assistant', desc: 'Get help from your AI-powered assistant'},
                    {icon: '📊', title: 'Analytics', desc: 'Track your progress and performance'},
                    ...(userState.userType === 'student' ? [{
                        icon: '💼',
                        title: 'Career Tools',
                        desc: 'Build resume and find opportunities'
                    }] : [])
                ].map((card, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '16px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>{card.icon}</div>
                        <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b'}}>{card.title}</h3>
                        <p style={{color: '#64748b'}}>{card.desc}</p>
                    </div>
                ))}
            </div>

            <div style={{textAlign: 'center'}}>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '16px 32px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginRight: '1rem'
                    }}
                >
                    🔄 Refresh
                </button>
                <button
                    onClick={onExploreFeatures}
                    style={{
                        padding: '16px 32px',
                        backgroundColor: '#ec4899',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    ✨ Explore Features
                </button>
            </div>
        </div>
    </div>
)

// Main App with User State Management
type AppPhase = 'loading' | 'welcome_back' | 'onboarding' | 'login' | 'app' | 'features' | 'category_page'
type UserType = 'student' | 'teacher'

function App() {
    const [phase, setPhase] = useState<AppPhase>('loading')
    const [userState, setUserState] = useState<UserState>(defaultUserState)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')


    useEffect(() => {
        // Check for existing user state
        const timer = setTimeout(() => {
            const savedUserState = localStorage.getItem('eduai_user_state')

            if (savedUserState) {
                try {
                    const parsedState = JSON.parse(savedUserState)
                    setUserState(parsedState)

                    // If user has completed onboarding and is logged in, show welcome back
                    if (parsedState.hasCompletedOnboarding && parsedState.userType) {
                        setPhase('welcome_back')
                    } else if (parsedState.hasCompletedOnboarding) {
                        setPhase('login')
                    } else {
                        setPhase('onboarding')
                    }
                } catch (error) {
                    console.error('Error parsing user state:', error)
                    setPhase('onboarding')
                }
            } else {
                // New user
                setPhase('onboarding')
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    const saveUserState = (newState: UserState) => {
        setUserState(newState)
        localStorage.setItem('eduai_user_state', JSON.stringify(newState))
    }

    const handleOnboardingComplete = () => {
        const updatedState = {
            ...userState,
            hasCompletedOnboarding: true,
            isFirstTime: false
        }
        saveUserState(updatedState)
        setPhase('login')
    }

    const handleLogin = (type: UserType, email: string) => {
        const updatedState = {
            ...userState,
            userType: type,
            email: email,
            lastLoginDate: new Date().toISOString()
        }
        saveUserState(updatedState)
        setPhase('app')
    }

    const handleWelcomeBackContinue = () => {
        // Update last login date
        const updatedState = {
            ...userState,
            lastLoginDate: new Date().toISOString()
        }
        saveUserState(updatedState)
        setPhase('app')
    }

    // --- Dedicated category page routing logic ---
    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId)
        setPhase('category_page')
    }

    return (
        <Router>
            <AnimatePresence mode="wait">
                {phase === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <LoadingScreen/>
                    </motion.div>
                )}

                {phase === 'welcome_back' && (
                    <motion.div
                        key="welcome_back"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <WelcomeBackScreen
                            userState={userState}
                            onContinue={handleWelcomeBackContinue}
                        />
                    </motion.div>
                )}

                {phase === 'onboarding' && (
                    <motion.div
                        key="onboarding"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <OnboardingScreen onComplete={handleOnboardingComplete}/>
                    </motion.div>
                )}

                {phase === 'login' && (
                    <motion.div
                        key="login"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <LoginScreen onLogin={handleLogin}/>
                    </motion.div>
                )}

                {phase === 'app' && (
                    <motion.div
                        key="app"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <Routes>
                            <Route path="/" element={
                                <Dashboard
                                    userState={userState}
                                    onExploreFeatures={() => setPhase('features')}
                                />
                            }/>
                            <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </motion.div>
                )}

                {phase === 'features' && (
                    <motion.div
                        key="features"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <FeaturesExplorer
                            onBack={() => setPhase('app')}
                            onCategorySelect={handleCategorySelect}
                        />
                    </motion.div>
                )}

                {phase === 'category_page' && (
                    <motion.div
                        key="category_page"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        {selectedCategoryId === 'student_records' && (
                            <StudentRecordsPage onBack={() => setPhase('features')}/>
                        )}
                        {selectedCategoryId === 'adaptive_learning' && (
                            <AdaptiveLearningPage onBack={() => setPhase('features')}/>
                        )}
                        {selectedCategoryId === 'teacher_management' && (
                            <TeacherManagementPage onBack={() => setPhase('features')}/>
                        )}
                        {selectedCategoryId === 'career_guidance' && (
                            <CareerGuidancePage onBack={() => setPhase('features')}/>
                        )}
                        {selectedCategoryId === 'academic_automation' && (
                            <AcademicAutomationPage onBack={() => setPhase('features')}/>
                        )}
                        {selectedCategoryId === 'research_insights' && (
                            <ResearchInsightsPage onBack={() => setPhase('features')}/>
                        )}
                        {selectedCategoryId === 'engagement_accessibility' && (
                            <EngagementAccessibilityPage onBack={() => setPhase('features')}/>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </Router>
    )
}

// --- Teacher Management Page ---
const TeacherManagementPage = ({onBack}) => {
    const [selectedTeacher, setSelectedTeacher] = React.useState(null)
    const [activeTab, setActiveTab] = React.useState('profile')

    const mockTeachers = [
        {
            id: 1,
            name: 'Dr. Emily Carter',
            email: 'emily.carter@edu.edu',
            teacherId: 'T2023001',
            expertise: ['Machine Learning', 'AI', 'Statistics'],
            avatar: '',
            effectiveness: 94,
            years: 8,
            courses: ['CS301', 'CS350'],
            analytics: {
                feedbackScore: 4.7,
                materialsDigitized: 42,
                speechToTextUsage: 'High'
            }
        }
    ]

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #ec4899, #6366f1)',
                color: 'white',
                padding: '2rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '1rem'
                    }}
                >
                    ← Back to Features
                </button>

                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700}}>
                    Teacher & Course Management
                </h1>
                <p style={{fontSize: '1.1rem', opacity: 0.9}}>
                    Digital teacher profiles and AI-automated course management
                </p>
            </div>

            <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem'}}>
                    {/* Teacher List */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        height: 'fit-content'
                    }}>
                        <h3 style={{marginBottom: '1rem', color: '#1e293b'}}>Teachers</h3>

                        {mockTeachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                onClick={() => setSelectedTeacher(teacher)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    backgroundColor: selectedTeacher?.id === teacher.id ? '#ec4899' : '#f8fafc',
                                    color: selectedTeacher?.id === teacher.id ? 'white' : '#1e293b',
                                    cursor: 'pointer',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: selectedTeacher?.id === teacher.id ? 'rgba(255,255,255,0.2)' : '#ec4899',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        color: 'white'
                                    }}>
                                    </div>
                                    <div>
                                        <div style={{fontWeight: 600, fontSize: '0.9rem'}}>
                                            {teacher.name}
                                        </div>
                                        <div style={{fontSize: '0.8rem', opacity: 0.8}}>
                                            {teacher.teacherId}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>Effectiveness: {teacher.effectiveness}%</span>
                                    <span style={{
                                        backgroundColor: '#6366f1',
                                        color: 'white',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem'
                                    }}>
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Teacher Details */}
                    {selectedTeacher ? (
                        <div>
                            {/* Teacher Header */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '2rem',
                                marginBottom: '2rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        backgroundColor: '#ec4899',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem',
                                        color: 'white'
                                    }}>
                                    </div>
                                    <div style={{flex: 1}}>
                                        <h2 style={{fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0}}>
                                            {selectedTeacher.name}
                                        </h2>
                                        <p style={{color: '#64748b', margin: '0.5rem 0'}}>
                                            {selectedTeacher.expertise.join(', ')}
                                        </p>
                                        <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
                                            <div>
                                                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#6366f1'}}>
                                                    {selectedTeacher.effectiveness}%
                                                </div>
                                                <div style={{fontSize: '0.9rem', color: '#64748b'}}>Effectiveness</div>
                                            </div>
                                            <div>
                                                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#ec4899'}}>
                                                    {selectedTeacher.years}
                                                </div>
                                                <div style={{fontSize: '0.9rem', color: '#64748b'}}>Years Teaching</div>
                                            </div>
                                            <div>
                                                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b'}}>
                                                    {selectedTeacher.courses.length}
                                                </div>
                                                <div style={{fontSize: '0.9rem', color: '#64748b'}}>Courses</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#ec489910',
                                        color: '#ec4899',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontWeight: 600
                                    }}>
                                        AI Profile
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0'
                                }}>
                                    {[
                                        {id: 'profile', label: 'Profile', icon: ''},
                                        {id: 'analytics', label: 'Analytics', icon: ''},
                                        {id: 'courses', label: 'Courses', icon: ''},
                                        {id: 'speech', label: 'Speech-to-Text', icon: ''}
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                                                color: activeTab === tab.id ? '#ec4899' : '#64748b',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: activeTab === tab.id ? 600 : 400,
                                                borderBottom: activeTab === tab.id ? '2px solid #ec4899' : 'none'
                                            }}
                                        >
                                            <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div style={{padding: '2rem'}}>
                                    {activeTab === 'profile' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Digital Profile</h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '1.5rem'
                                            }}>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Email</div>
                                                    <div style={{color: '#1e293b'}}>{selectedTeacher.email}</div>
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Expertise</div>
                                                    <div
                                                        style={{color: '#1e293b'}}>{selectedTeacher.expertise.join(', ')}</div>
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Courses</div>
                                                    <div
                                                        style={{color: '#1e293b'}}>{selectedTeacher.courses.join(', ')}</div>
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Feedback Score
                                                    </div>
                                                    <div
                                                        style={{color: '#1e293b'}}>{selectedTeacher.analytics.feedbackScore} /
                                                        5
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'analytics' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Teacher
                                                Analytics</h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '1.5rem'
                                            }}>
                                                <div style={{
                                                    backgroundColor: '#6366f110',
                                                    borderRadius: '12px',
                                                    padding: '1.5rem',
                                                    borderLeft: '4px solid #6366f1'
                                                }}>
                                                    <h4 style={{color: '#6366f1', marginBottom: '0.5rem'}}>Material
                                                        Digitization</h4>
                                                    <div
                                                        style={{fontWeight: 700, fontSize: '1.5rem', color: '#6366f1'}}>
                                                        {selectedTeacher.analytics.materialsDigitized}
                                                    </div>
                                                    <div style={{color: '#64748b', fontSize: '0.9rem'}}>Materials
                                                        Digitized
                                                    </div>
                                                </div>
                                                <div style={{
                                                    backgroundColor: '#10b98110',
                                                    borderRadius: '12px',
                                                    padding: '1.5rem',
                                                    borderLeft: '4px solid #10b981'
                                                }}>
                                                    <h4 style={{
                                                        color: '#10b981',
                                                        marginBottom: '0.5rem'
                                                    }}>Speech-to-Text</h4>
                                                    <div
                                                        style={{fontWeight: 700, fontSize: '1.5rem', color: '#10b981'}}>
                                                        {selectedTeacher.analytics.speechToTextUsage}
                                                    </div>
                                                    <div style={{color: '#64748b', fontSize: '0.9rem'}}>Usage</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'courses' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Teacher's
                                                Courses</h3>
                                            <ul>
                                                {selectedTeacher.courses.map((code, idx) => (
                                                    <li key={idx}
                                                        style={{
                                                            backgroundColor: '#ec489910',
                                                            color: '#ec4899',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '12px',
                                                            marginBottom: '0.5rem',
                                                            display: 'inline-block'
                                                        }}
                                                    >{code}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {activeTab === 'speech' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Speech-to-Text
                                                Usage</h3>
                                            <div style={{
                                                padding: '1.5rem',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '12px',
                                            }}>
                                                <div>
                                                    <strong>Voice Notes:</strong> AI automatically transcribes lectures
                                                    and notes.<br/>
                                                    <strong>Accessibility:</strong> Supports students with disability
                                                    needs.<br/>
                                                    <strong>Integration:</strong> Course transcriptions available for
                                                    students.<br/>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '4rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{fontSize: '4rem', marginBottom: '1rem'}}></div>
                            <h3 style={{color: '#64748b', fontSize: '1.2rem'}}>
                                Select a teacher to view their profile and analytics
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- Academic Automation Page ---
const AcademicAutomationPage = ({onBack}) => {
    const [activeTab, setActiveTab] = React.useState('ocr')

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #6366f1)',
                color: 'white',
                padding: '2rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '1rem'
                    }}
                >
                    ← Back to Features
                </button>

                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700}}>
                    Academic Automation & Assessment
                </h1>
                <p style={{fontSize: '1.1rem', opacity: 0.9}}>
                    OCR and AI-powered automated grading systems
                </p>
            </div>

            <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    {[
                        {id: 'ocr', label: 'OCR Mark Entry', icon: ''},
                        {id: 'essay', label: 'AI Essay Scoring', icon: ''},
                        {id: 'obe', label: 'OBE Mapping', icon: ''}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: activeTab === tab.id ? '#f59e0b' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab === 'ocr' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>OCR Mark Entry System</h3>
                        <p style={{color: '#64748b', marginBottom: '1rem'}}>
                            Upload scanned answer sheets and let AI automatically extract grades.
                        </p>
                        <div style={{
                            border: '2px dashed #e2e8f0',
                            borderRadius: '12px',
                            padding: '3rem',
                            textAlign: 'center',
                            backgroundColor: '#f8fafc'
                        }}>
                            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📋</div>
                            <button
                                onClick={() => toast.success('Uploading and processing scanned sheets...')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Upload Sheets
                            </button>
                        </div>
                        <div style={{
                            marginTop: '2rem',
                            backgroundColor: '#f59e0b10',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#f59e0b', marginBottom: '0.5rem'}}>Automated Grade Entry</h4>
                            <p style={{color: '#64748b', fontSize: '0.9rem'}}>
                                AI extracts marks with 99.6% accuracy. Manual entry reduced by 85%.
                            </p>
                        </div>
                    </div>
                )}
                {activeTab === 'essay' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>AI Essay Scoring</h3>
                        <p style={{color: '#64748b', marginBottom: '1rem'}}>
                            Submit essays to get instant, unbiased grades powered by transformer NLP models.
                        </p>
                        <div style={{
                            border: '2px dashed #e2e8f0',
                            borderRadius: '12px',
                            padding: '3rem',
                            textAlign: 'center',
                            backgroundColor: '#f8fafc'
                        }}>
                            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>✍️</div>
                            <button
                                onClick={() => toast.success('Essay submitted. AI scoring in progress...')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Submit Essay
                            </button>
                        </div>
                        <div style={{
                            marginTop: '2rem',
                            backgroundColor: '#f59e0b10',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#f59e0b', marginBottom: '0.5rem'}}>Results & Feedback</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>Consistency & Unbiased grading</li>
                                <li>Grammar & Creativity evaluation</li>
                                <li>Instant actionable feedback</li>
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'obe' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Outcome Based Education Mapping</h3>
                        <p style={{color: '#64748b', marginBottom: '1rem'}}>
                            Link student achievements directly to learning objectives and program outcomes.
                        </p>
                        <div style={{
                            backgroundColor: '#6366f110',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#6366f1', marginBottom: '0.5rem'}}>Quality Assurance</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>Learning outcome tracking per course</li>
                                <li>Objective alignment & optimizations</li>
                                <li>Continuous improvement suggestions</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Research & Policy Insights Page ---
const ResearchInsightsPage = ({onBack}) => {
    const [activeTab, setActiveTab] = React.useState('prediction')

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #ef4444, #6366f1)',
                color: 'white',
                padding: '2rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '1rem'
                    }}
                >
                    ← Back to Features
                </button>

                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700}}>
                    Research & Policy Insights
                </h1>
                <p style={{fontSize: '1.1rem', opacity: 0.9}}>
                    Machine learning models for educational insights and policy guidance
                </p>
            </div>
            <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    {[
                        {id: 'prediction', label: 'Predictive Analytics', icon: ''},
                        {id: 'policy', label: 'Policy Intelligence', icon: ''},
                        {id: 'language', label: 'Multi-language Analysis', icon: ''}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: activeTab === tab.id ? '#ef4444' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab === 'prediction' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Predictive Analytics</h3>
                        <div style={{
                            backgroundColor: '#ef444410',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#ef4444', marginBottom: '0.5rem'}}>Student Performance Prediction</h4>
                            <p style={{color: '#64748b', fontSize: '0.9rem'}}>
                                ML model forecasts GPA improvement by 2.4% next semester. Dropout risk down to 8%.
                            </p>
                            <button
                                onClick={() => toast.success('Generating updated predictions...')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    marginTop: '1rem'
                                }}
                            >
                                Refresh Predictions
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'policy' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Policy Intelligence</h3>
                        <div style={{
                            backgroundColor: '#ef444410',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#ef4444', marginBottom: '0.5rem'}}>Evidence-Based Policy</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>97% completion rate after policy changes</li>
                                <li>ML models signal successful outcomes</li>
                                <li>Actionable strategic improvements</li>
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'language' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Multi-language Impact Analysis</h3>
                        <div style={{
                            backgroundColor: '#ef444410',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#ef4444', marginBottom: '0.5rem'}}>Language Effectiveness</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>English instruction increases STEM achievement by 14%</li>
                                <li>Cultural adaptation efforts triple completion rates</li>
                                <li>Inclusive policies optimized per region</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Engagement & Accessibility Page ---
const EngagementAccessibilityPage = ({onBack}) => {
    const [activeTab, setActiveTab] = React.useState('analytics')

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                padding: '2rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '1rem'
                    }}
                >
                    ← Back to Features
                </button>
                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700}}>
                    Engagement & Accessibility
                </h1>
                <p style={{fontSize: '1.1rem', opacity: 0.9}}>
                    AI-powered engagement monitoring and accessibility features
                </p>
            </div>
            <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    {[
                        {id: 'analytics', label: 'Engagement Analytics', icon: ''},
                        {id: 'voice', label: 'Voice Recognition', icon: ''},
                        {id: 'interface', label: 'Adaptive Interface', icon: ''}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: activeTab === tab.id ? '#8b5cf6' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab === 'analytics' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Engagement Analytics</h3>
                        <div style={{
                            backgroundColor: '#8b5cf610',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#8b5cf6', marginBottom: '0.5rem'}}>Interaction Tracking</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>AI tracks lesson engagement patterns</li>
                                <li>Session optimization suggestions</li>
                                <li>Adaptive content pacing</li>
                            </ul>
                            <button
                                onClick={() => toast.success('Updating engagement analytics...')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    marginTop: '1rem'
                                }}
                            >
                                Refresh Metrics
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'voice' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Voice Recognition System</h3>
                        <div style={{
                            backgroundColor: '#8b5cf610',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#8b5cf6', marginBottom: '0.5rem'}}>Voice-to-Text Features</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>Automated form filling</li>
                                <li>Lecture transcription</li>
                                <li>Disability accessibility support</li>
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'interface' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Adaptive Interface</h3>
                        <div style={{
                            backgroundColor: '#8b5cf610',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#8b5cf6', marginBottom: '0.5rem'}}>Personalized User Experience</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>UI adapts based on user accessibility needs</li>
                                <li>Inclusive design for disabilities</li>
                                <li>Custom color, font, interaction preferences</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Student Information & Academic Records Page ---
const StudentRecordsPage = ({onBack}: { onBack: () => void }) => {
    const [selectedStudent, setSelectedStudent] = React.useState<any>(null)
    const [activeTab, setActiveTab] = React.useState('profile')

    const mockStudents = [
        {
            id: 1,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@student.edu',
            studentId: 'ST2023001',
            gpa: 3.85,
            year: 'Sophomore',
            major: 'Computer Science',
            avatar: '👩‍🎓',
            attendanceRate: 94,
            riskLevel: 'Low',
            analytics: {
                strengths: ['Mathematics', 'Programming', 'Problem Solving'],
                weaknesses: ['Writing', 'Communication'],
                dropoutRisk: 12,
                performanceTrend: 'Improving'
            },
            courses: [
                {code: 'CS201', name: 'Data Structures', grade: 'A-', credits: 3},
                {code: 'MATH250', name: 'Statistics', grade: 'B+', credits: 4},
                {code: 'ENG102', name: 'Technical Writing', grade: 'B', credits: 3}
            ]
        },
        {
            id: 2,
            name: 'Michael Chen',
            email: 'michael.chen@student.edu',
            studentId: 'ST2023002',
            gpa: 3.42,
            year: 'Junior',
            major: 'Business Administration',
            avatar: '👨‍🎓',
            attendanceRate: 87,
            riskLevel: 'Medium',
            analytics: {
                strengths: ['Leadership', 'Analytics', 'Strategy'],
                weaknesses: ['Mathematics', 'Research'],
                dropoutRisk: 28,
                performanceTrend: 'Stable'
            },
            courses: [
                {code: 'BUS301', name: 'Marketing', grade: 'A', credits: 3},
                {code: 'BUS250', name: 'Finance', grade: 'C+', credits: 4},
                {code: 'STAT201', name: 'Business Statistics', grade: 'B-', credits: 3}
            ]
        }
    ]

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                padding: '2rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '1rem'
                    }}
                >
                    ← Back to Features
                </button>

                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700}}>
                    📊 Student Information & Academic Records
                </h1>
                <p style={{fontSize: '1.1rem', opacity: 0.9}}>
                    Centralized student profiles with AI-powered academic analysis
                </p>
            </div>

            <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem'}}>
                    {/* Student List */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        height: 'fit-content'
                    }}>
                        <h3 style={{marginBottom: '1rem', color: '#1e293b'}}>Students</h3>

                        {mockStudents.map((student) => (
                            <div
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    backgroundColor: selectedStudent?.id === student.id ? '#6366f1' : '#f8fafc',
                                    color: selectedStudent?.id === student.id ? 'white' : '#1e293b',
                                    cursor: 'pointer',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: selectedStudent?.id === student.id ? 'rgba(255,255,255,0.2)' : '#6366f1',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}>
                                        {student.avatar}
                                    </div>
                                    <div>
                                        <div style={{fontWeight: 600, fontSize: '0.9rem'}}>
                                            {student.name}
                                        </div>
                                        <div style={{fontSize: '0.8rem', opacity: 0.8}}>
                                            {student.studentId}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>GPA: {student.gpa}</span>
                                    <span style={{
                                        backgroundColor: student.riskLevel === 'Low' ? '#10b981' :
                                            student.riskLevel === 'Medium' ? '#f59e0b' : '#ef4444',
                                        color: 'white',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem'
                                    }}>
                                        {student.riskLevel} Risk
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Student Details */}
                    {selectedStudent ? (
                        <div>
                            {/* Student Header */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '2rem',
                                marginBottom: '2rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        backgroundColor: '#6366f1',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem'
                                    }}>
                                        {selectedStudent.avatar}
                                    </div>
                                    <div style={{flex: 1}}>
                                        <h2 style={{fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0}}>
                                            {selectedStudent.name}
                                        </h2>
                                        <p style={{color: '#64748b', margin: '0.5rem 0'}}>
                                            {selectedStudent.year} • {selectedStudent.major}
                                        </p>
                                        <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
                                            <div>
                                                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#6366f1'}}>
                                                    {selectedStudent.gpa}
                                                </div>
                                                <div style={{fontSize: '0.9rem', color: '#64748b'}}>Current GPA</div>
                                            </div>
                                            <div>
                                                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#10b981'}}>
                                                    {selectedStudent.attendanceRate}%
                                                </div>
                                                <div style={{fontSize: '0.9rem', color: '#64748b'}}>Attendance</div>
                                            </div>
                                            <div>
                                                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b'}}>
                                                    {selectedStudent.analytics.dropoutRisk}%
                                                </div>
                                                <div style={{fontSize: '0.9rem', color: '#64748b'}}>Dropout Risk</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#6366f110',
                                        color: '#6366f1',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontWeight: 600
                                    }}>
                                        AI Profile
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0'
                                }}>
                                    {[
                                        {id: 'profile', label: 'Profile', icon: '👤'},
                                        {id: 'analytics', label: 'AI Analytics', icon: '🧠'},
                                        {id: 'courses', label: 'Courses', icon: '📚'},
                                        {id: 'transcripts', label: 'Transcripts', icon: '📄'}
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                                                color: activeTab === tab.id ? '#6366f1' : '#64748b',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: activeTab === tab.id ? 600 : 400,
                                                borderBottom: activeTab === tab.id ? '2px solid #6366f1' : 'none'
                                            }}
                                        >
                                            <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div style={{padding: '2rem'}}>
                                    {activeTab === 'profile' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Student Profile</h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '1.5rem'
                                            }}>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Email</div>
                                                    <div style={{color: '#1e293b'}}>{selectedStudent.email}</div>
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Student ID</div>
                                                    <div style={{color: '#1e293b'}}>{selectedStudent.studentId}</div>
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Academic Year</div>
                                                    <div style={{color: '#1e293b'}}>{selectedStudent.year}</div>
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 600, color: '#64748b'}}>Major</div>
                                                    <div style={{color: '#1e293b'}}>{selectedStudent.major}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'analytics' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>AI-Powered
                                                Analytics</h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                                gap: '1.5rem'
                                            }}>
                                                <div style={{
                                                    backgroundColor: '#10b98110',
                                                    borderRadius: '12px',
                                                    padding: '1.5rem',
                                                    borderLeft: '4px solid #10b981'
                                                }}>
                                                    <h4 style={{
                                                        color: '#10b981',
                                                        marginBottom: '0.5rem'
                                                    }}>Strengths</h4>
                                                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                                        {selectedStudent.analytics.strengths.map((strength: string, idx: number) => (
                                                            <li key={idx} style={{
                                                                color: '#64748b',
                                                                fontSize: '0.9rem',
                                                                marginBottom: '0.25rem'
                                                            }}>
                                                                ✓ {strength}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div style={{
                                                    backgroundColor: '#f59e0b10',
                                                    borderRadius: '12px',
                                                    padding: '1.5rem',
                                                    borderLeft: '4px solid #f59e0b'
                                                }}>
                                                    <h4 style={{color: '#f59e0b', marginBottom: '0.5rem'}}>Areas for
                                                        Improvement</h4>
                                                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                                        {selectedStudent.analytics.weaknesses.map((weakness: string, idx: number) => (
                                                            <li key={idx} style={{
                                                                color: '#64748b',
                                                                fontSize: '0.9rem',
                                                                marginBottom: '0.25rem'
                                                            }}>
                                                                ⚠ {weakness}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div style={{
                                                    backgroundColor: '#6366f110',
                                                    borderRadius: '12px',
                                                    padding: '1.5rem',
                                                    borderLeft: '4px solid #6366f1'
                                                }}>
                                                    <h4 style={{color: '#6366f1', marginBottom: '0.5rem'}}>Performance
                                                        Trend</h4>
                                                    <div style={{color: '#64748b', fontSize: '0.9rem'}}>
                                                        📈 {selectedStudent.analytics.performanceTrend}
                                                    </div>
                                                    <div style={{
                                                        marginTop: '0.5rem',
                                                        fontSize: '0.8rem',
                                                        color: '#64748b'
                                                    }}>
                                                        AI predicts continued improvement based on current patterns
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'courses' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Current Courses</h3>
                                            <div style={{display: 'grid', gap: '1rem'}}>
                                                {selectedStudent.courses.map((course: any, idx: number) => (
                                                    <div key={idx} style={{
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: '12px',
                                                        padding: '1.5rem',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <h4 style={{
                                                                color: '#1e293b',
                                                                margin: 0,
                                                                marginBottom: '0.25rem'
                                                            }}>
                                                                {course.code}: {course.name}
                                                            </h4>
                                                            <div style={{color: '#64748b', fontSize: '0.9rem'}}>
                                                                Credits: {course.credits}
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            backgroundColor: '#6366f1',
                                                            color: 'white',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '20px',
                                                            fontWeight: 600
                                                        }}>
                                                            {course.grade}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'transcripts' && (
                                        <div>
                                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Automated
                                                Transcripts</h3>
                                            <div style={{
                                                backgroundColor: '#6366f110',
                                                borderRadius: '12px',
                                                padding: '2rem',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📄</div>
                                                <h4 style={{color: '#6366f1', marginBottom: '1rem'}}>AI-Generated
                                                    Transcript</h4>
                                                <p style={{color: '#64748b', marginBottom: '1.5rem'}}>
                                                    Official transcript automatically generated and updated in real-time
                                                </p>
                                                <button
                                                    onClick={() => toast.success('Generating official transcript...')}
                                                    style={{
                                                        padding: '12px 24px',
                                                        backgroundColor: '#6366f1',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Download Transcript
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '4rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>👥</div>
                            <h3 style={{color: '#64748b', fontSize: '1.2rem'}}>
                                Select a student to view their comprehensive AI-powered profile
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- Personalized & Adaptive Learning Page ---
const AdaptiveLearningPage = ({onBack}: { onBack: () => void }) => {
    const [activeTab, setActiveTab] = React.useState('paths')
    const [selectedPath, setSelectedPath] = React.useState<any>(null)

    const mockLearningPaths = [
        {
            id: 1,
            title: 'Computer Science Fundamentals',
            student: 'Sarah Johnson',
            progress: 78,
            difficulty: 'Adaptive',
            estimatedCompletion: '6 weeks',
            modules: [
                {name: 'Variables & Data Types', status: 'completed', score: 95},
                {name: 'Control Structures', status: 'completed', score: 87},
                {name: 'Functions & Methods', status: 'current', score: null},
                {name: 'Object-Oriented Programming', status: 'locked', score: null},
                {name: 'Data Structures', status: 'locked', score: null}
            ],
            aiInsights: 'Student excels in logical thinking. Recommend more visual programming exercises.',
            gamification: {
                badges: ['First Code', 'Logic Master', 'Problem Solver'],
                points: 2340,
                level: 'Intermediate Coder'
            }
        }
    ]

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                padding: '2rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '1rem'
                    }}
                >
                    ← Back to Features
                </button>

                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700}}>
                    🧠 Personalized & Adaptive Learning
                </h1>
                <p style={{fontSize: '1.1rem', opacity: 0.9}}>
                    AI-powered customized learning paths for every student
                </p>
            </div>

            <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    {[
                        {id: 'paths', label: 'Learning Paths', icon: '🛤️'},
                        {id: 'gamification', label: 'Gamification', icon: '🎮'},
                        {id: 'assessments', label: 'AI Assessments', icon: '📝'}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: activeTab === tab.id ? '#8b5cf6' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'paths' && (
                    <div style={{display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem'}}>
                        {/* Learning Paths List */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            height: 'fit-content'
                        }}>
                            <h3 style={{marginBottom: '1rem', color: '#1e293b'}}>Active Learning Paths</h3>

                            {mockLearningPaths.map((path) => (
                                <div
                                    key={path.id}
                                    onClick={() => setSelectedPath(path)}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        backgroundColor: selectedPath?.id === path.id ? '#8b5cf6' : '#f8fafc',
                                        color: selectedPath?.id === path.id ? 'white' : '#1e293b',
                                        cursor: 'pointer',
                                        marginBottom: '1rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <h4 style={{margin: 0, marginBottom: '0.5rem', fontWeight: 600}}>
                                        {path.title}
                                    </h4>
                                    <div style={{fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem'}}>
                                        Student: {path.student}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{fontSize: '0.8rem'}}>Progress: {path.progress}%</span>
                                        <div style={{
                                            backgroundColor: selectedPath?.id === path.id ? 'rgba(255,255,255,0.2)' : '#8b5cf6',
                                            color: 'white',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '10px',
                                            fontSize: '0.7rem',
                                            fontWeight: 500
                                        }}>
                                            AI-Adaptive
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Path Details */}
                        {selectedPath ? (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '2rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{marginBottom: '2rem'}}>
                                    <h2 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        margin: 0,
                                        marginBottom: '0.5rem'
                                    }}>
                                        {selectedPath.title}
                                    </h2>
                                    <div style={{display: 'flex', gap: '2rem', marginBottom: '1rem'}}>
                                        <div>
                                            <div style={{fontSize: '1.2rem', fontWeight: 600, color: '#8b5cf6'}}>
                                                {selectedPath.progress}%
                                            </div>
                                            <div style={{fontSize: '0.9rem', color: '#64748b'}}>Progress</div>
                                        </div>
                                        <div>
                                            <div style={{fontSize: '1.2rem', fontWeight: 600, color: '#10b981'}}>
                                                {selectedPath.estimatedCompletion}
                                            </div>
                                            <div style={{fontSize: '0.9rem', color: '#64748b'}}>Est. Completion</div>
                                        </div>
                                        <div>
                                            <div style={{fontSize: '1.2rem', fontWeight: 600, color: '#f59e0b'}}>
                                                {selectedPath.difficulty}
                                            </div>
                                            <div style={{fontSize: '0.9rem', color: '#64748b'}}>Difficulty</div>
                                        </div>
                                    </div>
                                </div>

                                <h3 style={{marginBottom: '1rem', color: '#1e293b'}}>Learning Modules</h3>
                                <div style={{display: 'grid', gap: '1rem', marginBottom: '2rem'}}>
                                    {selectedPath.modules.map((module: any, idx: number) => (
                                        <div key={idx} style={{
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            opacity: module.status === 'locked' ? 0.5 : 1
                                        }}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor:
                                                        module.status === 'completed' ? '#10b981' :
                                                            module.status === 'current' ? '#f59e0b' : '#e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {module.status === 'completed' ? '✓' :
                                                        module.status === 'current' ? '⏳' : '🔒'}
                                                </div>
                                                <div>
                                                    <h4 style={{color: '#1e293b', margin: 0, marginBottom: '0.25rem'}}>
                                                        {module.name}
                                                    </h4>
                                                    <div style={{
                                                        color: '#64748b',
                                                        fontSize: '0.9rem',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {module.status}
                                                    </div>
                                                </div>
                                            </div>
                                            {module.score && (
                                                <div style={{
                                                    backgroundColor: '#8b5cf6',
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    fontWeight: 600
                                                }}>
                                                    {module.score}%
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    backgroundColor: '#8b5cf610',
                                    borderRadius: '12px',
                                    padding: '1.5rem'
                                }}>
                                    <h4 style={{color: '#8b5cf6', marginBottom: '0.5rem'}}>AI Insights</h4>
                                    <p style={{color: '#64748b', fontSize: '0.9rem', margin: 0}}>
                                        {selectedPath.aiInsights}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '4rem',
                                textAlign: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🛤️</div>
                                <h3 style={{color: '#64748b', fontSize: '1.2rem'}}>
                                    Select a learning path to view AI-powered customization
                                </h3>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'gamification' && selectedPath && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Gamification Engine</h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                backgroundColor: '#8b5cf610',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🏆</div>
                                <h4 style={{color: '#8b5cf6', marginBottom: '0.5rem'}}>Level</h4>
                                <div style={{fontSize: '1.2rem', fontWeight: 600, color: '#1e293b'}}>
                                    {selectedPath.gamification.level}
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: '#f59e0b10',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⭐</div>
                                <h4 style={{color: '#f59e0b', marginBottom: '0.5rem'}}>Points</h4>
                                <div style={{fontSize: '1.2rem', fontWeight: 600, color: '#1e293b'}}>
                                    {selectedPath.gamification.points.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <h4 style={{marginBottom: '1rem', color: '#1e293b'}}>Achievement Badges</h4>
                        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                            {selectedPath.gamification.badges.map((badge: string, idx: number) => (
                                <div key={idx} style={{
                                    backgroundColor: '#10b98110',
                                    color: '#10b981',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    🏅 {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'assessments' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>AI-Generated Assessments</h3>

                        <div style={{
                            backgroundColor: '#8b5cf610',
                            borderRadius: '12px',
                            padding: '2rem',
                            textAlign: 'center',
                            marginBottom: '2rem'
                        }}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📝</div>
                            <h4 style={{color: '#8b5cf6', marginBottom: '1rem'}}>Dynamic Quiz Generation</h4>
                            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>
                                AI creates personalized quizzes based on your learning progress and difficulty
                                preferences
                            </p>
                            <button
                                onClick={() => toast.success('Generating personalized quiz...')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Generate Quiz
                            </button>
                        </div>

                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#1e293b', marginBottom: '0.5rem'}}>AI Assessment Features</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>Adaptive difficulty based on performance</li>
                                <li>Instant feedback with explanations</li>
                                <li>Progress tracking and weak area identification</li>
                                <li>Personalized challenge recommendations</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Career Guidance & Employability Page ---
const CareerGuidancePage = ({onBack}: { onBack: () => void }) => {
    const [activeTab, setActiveTab] = React.useState('resume')
    const [mockResume] = React.useState({
        name: 'Sarah Johnson',
        email: 'sarah.johnson@student.edu',
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
        experience: [
            {title: 'Intern Developer', company: 'Tech Corp', duration: '3 months'},
            {title: 'Project Assistant', company: 'University Lab', duration: '6 months'}
        ],
        aiScore: 87,
        suggestions: [
            'Add more quantifiable achievements',
            'Include relevant coursework section',
            'Highlight leadership experiences'
        ]
    })

    const mockJobs = [
        {
            id: 1,
            title: 'Frontend Developer',
            company: 'Tech Innovations',
            location: 'San Francisco, CA',
            salary: '$75,000 - $95,000',
            match: 94,
            skills: ['React', 'JavaScript', 'CSS'],
            type: 'Full-time'
        },
        {
            id: 2,
            title: 'Software Engineer Intern',
            company: 'StartupXYZ',
            location: 'Remote',
            salary: '$25/hour',
            match: 87,
            skills: ['Python', 'JavaScript', 'Git'],
            type: 'Internship'
        }
    ]

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #10b981, #6366f1)',
                color: 'white',
                padding: '2rem'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '1rem'
                    }}
                >
                    ← Back to Features
                </button>

                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700}}>
                    💼 Career Guidance & Employability
                </h1>
                <p style={{fontSize: '1.1rem', opacity: 0.9}}>
                    AI-driven career matching and skill development
                </p>
            </div>

            <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    {[
                        {id: 'resume', label: 'Resume Analysis', icon: '📄'},
                        {id: 'jobs', label: 'Job Matching', icon: '🎯'},
                        {id: 'chatbot', label: 'Career Advisor', icon: '🤖'}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: activeTab === tab.id ? '#10b981' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'resume' && (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem'}}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Resume Analysis</h3>

                            <div style={{marginBottom: '2rem'}}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem'
                                }}>
                                    <h4 style={{color: '#1e293b', margin: 0}}>AI Optimization Score</h4>
                                    <div style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontWeight: 600,
                                        fontSize: '1.1rem'
                                    }}>
                                        {mockResume.aiScore}/100
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: '#e2e8f0',
                                    borderRadius: '10px',
                                    height: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        backgroundColor: '#10b981',
                                        height: '100%',
                                        width: `${mockResume.aiScore}%`,
                                        transition: 'width 0.3s'
                                    }}/>
                                </div>
                            </div>

                            <div style={{marginBottom: '2rem'}}>
                                <h4 style={{color: '#1e293b', marginBottom: '1rem'}}>Skills Analysis</h4>
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                                    {mockResume.skills.map((skill: string, idx: number) => (
                                        <div key={idx} style={{
                                            backgroundColor: '#10b98110',
                                            color: '#10b981',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            fontWeight: 500,
                                            fontSize: '0.9rem'
                                        }}>
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                border: '2px dashed #e2e8f0',
                                borderRadius: '12px',
                                padding: '2rem',
                                textAlign: 'center',
                                backgroundColor: '#f8fafc'
                            }}>
                                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📄</div>
                                <p style={{color: '#64748b', marginBottom: '1rem'}}>
                                    Upload your resume for AI-powered analysis and optimization
                                </p>
                                <button
                                    onClick={() => toast.success('Analyzing resume with AI...')}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Upload Resume
                                </button>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            height: 'fit-content'
                        }}>
                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>AI Suggestions</h3>
                            <div style={{display: 'grid', gap: '1rem'}}>
                                {mockResume.suggestions.map((suggestion: string, idx: number) => (
                                    <div key={idx} style={{
                                        backgroundColor: '#f59e0b10',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        borderLeft: '4px solid #f59e0b'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span style={{color: '#f59e0b'}}>💡</span>
                                            <span style={{fontWeight: 600, color: '#1e293b', fontSize: '0.9rem'}}>
                                                Improvement Tip
                                            </span>
                                        </div>
                                        <p style={{color: '#64748b', fontSize: '0.9rem', margin: 0}}>
                                            {suggestion}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            marginBottom: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>AI Job Matching Engine</h3>
                            <p style={{color: '#64748b', marginBottom: '1rem'}}>
                                Our NLP-powered system matches your skills with the best job opportunities
                            </p>
                        </div>

                        <div style={{display: 'grid', gap: '1.5rem'}}>
                            {mockJobs.map((job) => (
                                <div key={job.id} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.2s'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: '1rem'
                                    }}>
                                        <div>
                                            <h4 style={{
                                                color: '#1e293b',
                                                margin: 0,
                                                marginBottom: '0.25rem',
                                                fontSize: '1.3rem'
                                            }}>
                                                {job.title}
                                            </h4>
                                            <p style={{color: '#64748b', margin: 0, fontSize: '1rem'}}>
                                                {job.company} • {job.location}
                                            </p>
                                        </div>
                                        <div style={{
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}>
                                            {job.match}% Match
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{color: '#10b981', fontWeight: 600, fontSize: '1.1rem'}}>
                                            {job.salary}
                                        </div>
                                        <div style={{
                                            backgroundColor: '#6366f110',
                                            color: '#6366f1',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '15px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            {job.type}
                                        </div>
                                    </div>

                                    <div style={{marginBottom: '1rem'}}>
                                        <h5 style={{
                                            color: '#1e293b',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}>Required Skills:</h5>
                                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                            {job.skills.map((skill: string, idx: number) => (
                                                <span key={idx} style={{
                                                    backgroundColor: '#8b5cf610',
                                                    color: '#8b5cf6',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '15px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toast.success(`Applied to ${job.title} position!`)}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'chatbot' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Career Chatbot Advisor</h3>

                        <div style={{
                            backgroundColor: '#10b98110',
                            borderRadius: '12px',
                            padding: '2rem',
                            textAlign: 'center',
                            marginBottom: '2rem'
                        }}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🤖</div>
                            <h4 style={{color: '#10b981', marginBottom: '1rem'}}>AI-Powered Career Guidance</h4>
                            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>
                                Get instant, personalized advice on courses, admissions, scholarships, and career paths
                            </p>
                            <button
                                onClick={() => toast.success('Starting chat with career advisor...')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Start Conversation
                            </button>
                        </div>

                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h4 style={{color: '#1e293b', marginBottom: '0.5rem'}}>24/7 Guidance Topics</h4>
                            <ul style={{color: '#64748b', fontSize: '0.9rem'}}>
                                <li>Course recommendations based on career goals</li>
                                <li>Scholarship opportunities and application tips</li>
                                <li>Admission requirements for target programs</li>
                                <li>Industry insights and job market trends</li>
                                <li>Skill development recommendations</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App