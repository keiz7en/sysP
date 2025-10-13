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

// Enhanced Features Explorer
const FeaturesExplorer = ({onBack}: { onBack: () => void }) => {
    const [selectedCategory, setSelectedCategory] = useState(0)

    const featureCategories = [
        {
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
type AppPhase = 'loading' | 'welcome_back' | 'onboarding' | 'login' | 'app' | 'features'
type UserType = 'student' | 'teacher'

function App() {
    const [phase, setPhase] = useState<AppPhase>('loading')
    const [userState, setUserState] = useState<UserState>(defaultUserState)

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
                        <FeaturesExplorer onBack={() => setPhase('app')}/>
                    </motion.div>
                )}
            </AnimatePresence>
        </Router>
    )
}

export default App