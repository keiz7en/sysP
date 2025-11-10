import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface AIRecommendation {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
}

interface LearningInsights {
    performance_analysis: {
        overall_trend: string;
        strongest_areas: string[];
        areas_needing_attention: string[];
        grade_prediction: number;
    };
    learning_patterns: {
        optimal_study_time: string;
        attention_span: string;
        learning_efficiency: number;
        retention_rate: number;
    };
    ai_recommendations: AIRecommendation[];
    study_optimization: {
        suggested_schedule: string;
        focus_areas: string[];
        time_allocation: string;
    };
    study_metrics: {
        total_study_hours: number;
        average_session_minutes: number;
        courses_analyzed: number;
        average_score: number;
    };
    ai_powered: boolean;
    model: string;
}

const ResearchInsights: React.FC = () => {
    const {token} = useAuth()
    const [activeTab, setActiveTab] = useState('performance')
    const [insights, setInsights] = useState<LearningInsights | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLearningInsights()
    }, [token])

    const fetchLearningInsights = async () => {
        setLoading(true)
        try {
            if (!token) {
                console.error('No token available')
                setInsights(null)
                setLoading(false)
                return
            }

            const response = await fetch('/api/students/ai-learning-insights/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                console.log('Learning insights data:', data)
                setInsights(data)
                if (data.ai_powered) {
                    toast.success('✨ AI-Powered Insights Generated!')
                }
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('API error:', response.status, errorData)

                // If student has no courses, show mock data instead of error
                setInsights({
                    performance_analysis: {
                        overall_trend: 'stable',
                        strongest_areas: ['Getting Started', 'Learning the Platform'],
                        areas_needing_attention: ['Course Enrollment', 'Active Participation'],
                        grade_prediction: 0
                    },
                    learning_patterns: {
                        optimal_study_time: 'Start tracking by enrolling in courses',
                        attention_span: 'Not enough data yet',
                        learning_efficiency: 0,
                        retention_rate: 0
                    },
                    ai_recommendations: [
                        {
                            title: 'Enroll in Courses',
                            description: 'Start your learning journey by enrolling in courses that interest you. This will help us track your progress and provide personalized insights.',
                            priority: 'high',
                            impact: 'Essential for getting personalized learning analytics'
                        },
                        {
                            title: 'Set Learning Goals',
                            description: 'Define what you want to achieve. Clear goals help you stay focused and motivated throughout your learning journey.',
                            priority: 'medium',
                            impact: 'Helps you stay on track and measure success'
                        },
                        {
                            title: 'Explore AI Features',
                            description: 'Try out the AI Learning Assistant for homework help, study planning, and career guidance.',
                            priority: 'medium',
                            impact: 'Get personalized support 24/7'
                        }
                    ],
                    study_optimization: {
                        suggested_schedule: 'Enroll in courses to get a personalized schedule',
                        focus_areas: ['Course Selection', 'Platform Exploration'],
                        time_allocation: 'Start with exploring available courses and features'
                    },
                    study_metrics: {
                        total_study_hours: 0,
                        average_session_minutes: 0,
                        courses_analyzed: 0,
                        average_score: 0
                    },
                    ai_powered: false,
                    model: 'Getting Started Mode'
                })

                toast.info('📚 Enroll in courses to see personalized insights!')
            }
        } catch (error) {
            console.error('Error fetching learning insights:', error)

            // Show friendly error with mock data
            setInsights({
                performance_analysis: {
                    overall_trend: 'stable',
                    strongest_areas: ['Getting Started'],
                    areas_needing_attention: ['Course Enrollment'],
                    grade_prediction: 0
                },
                learning_patterns: {
                    optimal_study_time: 'Data will appear after course enrollment',
                    attention_span: 'Not enough data yet',
                    learning_efficiency: 0,
                    retention_rate: 0
                },
                ai_recommendations: [
                    {
                        title: 'Start Your Learning Journey',
                        description: 'Enroll in courses to begin tracking your learning progress and receive AI-powered insights.',
                        priority: 'high',
                        impact: 'Unlocks all analytics features'
                    }
                ],
                study_optimization: {
                    suggested_schedule: 'Available after course enrollment',
                    focus_areas: ['Getting Started'],
                    time_allocation: 'Explore the platform first'
                },
                study_metrics: {
                    total_study_hours: 0,
                    average_session_minutes: 0,
                    courses_analyzed: 0,
                    average_score: 0
                },
                ai_powered: false,
                model: 'Demo Mode'
            })

            toast.error('Connection error - Showing demo insights')
        } finally {
            setLoading(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#ef4444'
            case 'medium':
                return '#f59e0b'
            case 'low':
                return '#10b981'
            default:
                return '#6b7280'
        }
    }

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'improving':
                return '#10b981'
            case 'declining':
                return '#ef4444'
            case 'stable':
                return '#6b7280'
            default:
                return '#6b7280'
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving':
                return '📈'
            case 'declining':
                return '📉'
            case 'stable':
                return '➡️'
            default:
                return '📊'
        }
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>
                    🤖 Analyzing your learning patterns with AI...
                </div>
            </div>
        )
    }

    if (!insights) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '12px',
                color: '#6b7280',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🔬</div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937'}}>No Insights Available</h3>
                <p style={{fontSize: '1rem', marginBottom: '0'}}>
                    Start taking courses to see AI-powered learning insights.
                </p>
            </div>
        )
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        marginBottom: 0,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🔬 Learning Insights
                    </h1>
                    {insights.ai_powered && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b98120',
                            borderRadius: '20px',
                            border: '1px solid #10b98140'
                        }}>
                            <span style={{fontSize: '1rem'}}>✨</span>
                            <span style={{
                                color: '#10b981',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Powered by {insights.model}
                            </span>
                        </div>
                    )}
                </div>
                <p style={{color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem'}}>
                    AI-powered analytics to optimize your learning performance and study habits
                </p>

                {/* Study Metrics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <motion.div
                        whileHover={{scale: 1.02}}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📊</div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                            {insights.study_metrics.total_study_hours}h
                        </div>
                        <div style={{fontSize: '0.9rem', opacity: 0.9}}>Total Study Hours</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem'}}>This Month</div>
                    </motion.div>

                    <motion.div
                        whileHover={{scale: 1.02}}
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⏰</div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                            {insights.study_metrics.average_session_minutes} min
                        </div>
                        <div style={{fontSize: '0.9rem', opacity: 0.9}}>Average Session</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem'}}>Optimal Range</div>
                    </motion.div>

                    <motion.div
                        whileHover={{scale: 1.02}}
                        style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🧠</div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                            {insights.learning_patterns.retention_rate}%
                        </div>
                        <div style={{fontSize: '0.9rem', opacity: 0.9}}>Retention Rate</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem'}}>Above Average</div>
                    </motion.div>

                    <motion.div
                        whileHover={{scale: 1.02}}
                        style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🎯</div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                            {insights.learning_patterns.learning_efficiency}%
                        </div>
                        <div style={{fontSize: '0.9rem', opacity: 0.9}}>Focus Score</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem'}}>Excellent</div>
                    </motion.div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '2rem',
                    maxWidth: '600px'
                }}>
                    {[
                        {id: 'performance', label: '📈 Performance'},
                        {id: 'patterns', label: '🔍 Learning Patterns'},
                        {id: 'recommendations', label: '💡 AI Recommendations'}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                    >
                        {activeTab === 'performance' && (
                            <div>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                    AI-Powered Performance Analysis
                                </h2>

                                {/* Overall Trend */}
                                <motion.div
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.2rem'}}>
                                                Overall Learning Trend
                                            </h3>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                                <span style={{fontSize: '1.5rem'}}>
                                                    {getTrendIcon(insights.performance_analysis.overall_trend)}
                                                </span>
                                                <span style={{
                                                    color: getTrendColor(insights.performance_analysis.overall_trend),
                                                    fontWeight: '600',
                                                    fontSize: '1.1rem',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {insights.performance_analysis.overall_trend}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '2rem',
                                            fontWeight: '700',
                                            color: '#6366f1'
                                        }}>
                                            {insights.study_metrics.average_score}%
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Strongest Areas */}
                                <motion.div
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.1}}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    <h3 style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>💪</span> Your Strengths
                                    </h3>
                                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                        {insights.performance_analysis.strongest_areas.map((area, idx) => (
                                            <li key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem',
                                                backgroundColor: '#10b98110',
                                                borderRadius: '8px',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <span style={{color: '#10b981', fontSize: '1.2rem'}}>✓</span>
                                                <span style={{color: '#374151', fontWeight: '500'}}>{area}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* Areas for Improvement */}
                                <motion.div
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.2}}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    <h3 style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>🎯</span> Growth Opportunities
                                    </h3>
                                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                        {insights.performance_analysis.areas_needing_attention.map((area, idx) => (
                                            <li key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem',
                                                backgroundColor: '#f59e0b10',
                                                borderRadius: '8px',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <span style={{color: '#f59e0b', fontSize: '1.2rem'}}>⚡</span>
                                                <span style={{color: '#374151', fontWeight: '500'}}>{area}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* Grade Prediction */}
                                <motion.div
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.3}}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '2px solid #6366f1'
                                    }}
                                >
                                    <h3 style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>🔮</span> AI Grade Prediction
                                    </h3>
                                    <div style={{textAlign: 'center'}}>
                                        <div style={{
                                            fontSize: '3rem',
                                            fontWeight: '700',
                                            color: '#6366f1',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {insights.performance_analysis.grade_prediction.toFixed(2)}
                                        </div>
                                        <div style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                            Predicted GPA for Next Semester
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {activeTab === 'patterns' && (
                            <div>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                    Discovered Learning Patterns
                                </h2>
                                <div style={{display: 'grid', gap: '1rem'}}>
                                    <motion.div
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                            <span style={{fontSize: '2rem'}}>🕙</span>
                                            <div>
                                                <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem'}}>
                                                    Peak Learning Time
                                                </h3>
                                                <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>
                                                    {insights.learning_patterns.optimal_study_time}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.1}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                            <span style={{fontSize: '2rem'}}>⏱️</span>
                                            <div>
                                                <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem'}}>
                                                    Optimal Study Session
                                                </h3>
                                                <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>
                                                    {insights.learning_patterns.attention_span}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.2}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <h3 style={{
                                            margin: '0 0 1rem 0',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span>📅</span> Study Optimization
                                        </h3>
                                        <div style={{color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6}}>
                                            <p style={{marginBottom: '0.5rem'}}>
                                                <strong>Schedule:</strong> {insights.study_optimization.suggested_schedule}
                                            </p>
                                            <p style={{marginBottom: '0.5rem'}}>
                                                <strong>Focus
                                                    Areas:</strong> {insights.study_optimization.focus_areas.join(', ')}
                                            </p>
                                            <p style={{marginBottom: 0}}>
                                                <strong>Time
                                                    Allocation:</strong> {insights.study_optimization.time_allocation}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'recommendations' && (
                            <div>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                    AI-Powered Recommendations
                                </h2>
                                <div style={{display: 'grid', gap: '1.5rem'}}>
                                    {insights.ai_recommendations.map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{opacity: 0, x: -20}}
                                            animate={{opacity: 1, x: 0}}
                                            transition={{delay: index * 0.1}}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                padding: '2rem',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                border: `2px solid ${getPriorityColor(rec.priority)}20`
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '1rem'
                                            }}>
                                                <h3 style={{margin: 0, fontSize: '1.2rem', flex: 1}}>{rec.title}</h3>
                                                <span style={{
                                                    backgroundColor: getPriorityColor(rec.priority),
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {rec.priority}
                                                </span>
                                            </div>
                                            <p style={{color: '#6b7280', margin: '0 0 1rem 0', lineHeight: 1.6}}>
                                                {rec.description}
                                            </p>
                                            <div style={{
                                                backgroundColor: '#f3f4f6',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                color: '#374151'
                                            }}>
                                                <strong>Impact:</strong> {rec.impact}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default ResearchInsights
