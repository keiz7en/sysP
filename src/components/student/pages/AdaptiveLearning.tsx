import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'

interface LearningPath {
    course_title: string
    course_code: string
    difficulty_level: string
    progress_percentage: number
    estimated_completion: string
    learning_objectives: string[]
    duration_weeks: number
    credits: number
    status: string
    final_score: number
}

interface NextCourse {
    title: string
    reason: string
    difficulty: string
}

interface Milestone {
    milestone: string
    timeframe: string
    actionable: string
}

interface AIRecommendations {
    learning_path_analysis: string
    study_tips: string[]
    next_courses: NextCourse[]
    schedule_optimization: string[]
    learning_style_adjustments: string[]
    milestones: Milestone[]
    motivational_message: string
    ai_powered: boolean
    model: string
}

interface AdaptiveLearningData {
    learning_paths: LearningPath[]
    student_learning_style: string
    preferred_difficulty: string
    overall_progress: number
    total_courses: number
    ai_recommendations: AIRecommendations | null
}

const AdaptiveLearning: React.FC = () => {
    const {user, token} = useAuth()
    const [learningData, setLearningData] = useState<AdaptiveLearningData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && token) {
            fetchAdaptiveLearning()
        }
    }, [user, token])

    const fetchAdaptiveLearning = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/students/adaptive-learning/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch adaptive learning data')
            }

            const data = await response.json()
            setLearningData(data)
        } catch (error: any) {
            console.error('Error fetching adaptive learning:', error)
            // Don't show error toast, just handle empty state
        } finally {
            setLoading(false)
        }
    }

    const getCourseIcon = (courseTitle: string) => {
        const title = courseTitle.toLowerCase()
        if (title.includes('math') || title.includes('calculus') || title.includes('algebra')) return '🧮'
        if (title.includes('physics') || title.includes('chemistry') || title.includes('science')) return '⚛️'
        if (title.includes('computer') || title.includes('programming') || title.includes('coding')) return '💻'
        if (title.includes('english') || title.includes('literature') || title.includes('writing')) return '📚'
        if (title.includes('history') || title.includes('social')) return '🏛️'
        if (title.includes('art') || title.includes('design')) return '🎨'
        if (title.includes('music')) return '🎵'
        if (title.includes('biology') || title.includes('medicine')) return '🧬'
        if (title.includes('data')) return '📊'
        if (title.includes('machine') || title.includes('ai')) return '🤖'
        return '📖'
    }

    const getDifficultyColor = (difficulty: string) => {
        const diff = difficulty.toLowerCase()
        if (diff.includes('beginner') || diff.includes('easy')) return '#10b981'
        if (diff.includes('intermediate') || diff.includes('medium')) return '#3b82f6'
        if (diff.includes('advanced') || diff.includes('hard')) return '#f59e0b'
        if (diff.includes('expert')) return '#dc2626'
        return '#6b7280'
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return '#10b981'
        if (progress >= 60) return '#3b82f6'
        if (progress >= 40) return '#f59e0b'
        return '#dc2626'
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
                    Analyzing your learning patterns...
                </div>
            </div>
        )
    }

    if (!learningData || learningData.learning_paths.length === 0) {
        return (
            <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    🧠 Adaptive Learning
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '2rem'
                }}>
                    AI-powered personalized learning paths tailored to your learning style
                </p>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        padding: '3rem',
                        textAlign: 'center'
                    }}
                >
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🤖</div>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                        AI Learning Paths Coming Soon
                    </h3>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        Once you're enrolled in courses and start completing assignments, AI will analyze your learning
                        patterns and create personalized learning paths for you.
                    </p>

                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem'}}>
                            AI will provide:
                        </h4>
                        <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Personalized study recommendations</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Adaptive difficulty adjustments</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Learning style optimization</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Progress tracking and insights</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Next steps and milestone planning</p>
                            <p style={{margin: '0'}}>• Detailed achievement roadmaps</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    🧠 Adaptive Learning
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    AI-powered personalized learning paths tailored to your learning style
                </p>
            </div>

            {/* Progress Overview */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                }}
            >
                <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem'}}>
                    📊 Your Learning Profile
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem'
                }}>
                    <div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {learningData.overall_progress.toFixed(0)}%
                        </div>
                        <div style={{opacity: 0.9}}>Overall Progress</div>
                    </div>
                    <div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {learningData.total_courses}
                        </div>
                        <div style={{opacity: 0.9}}>Active Courses</div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'capitalize'
                        }}>
                            {learningData.student_learning_style}
                        </div>
                        <div style={{opacity: 0.9}}>Learning Style</div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'capitalize'
                        }}>
                            {learningData.preferred_difficulty || 'Adaptive'}
                        </div>
                        <div style={{opacity: 0.9}}>Difficulty Preference</div>
                    </div>
                </div>
            </motion.div>

            {/* Course Learning Paths */}
            <div style={{display: 'grid', gap: '1.5rem', marginBottom: '2rem'}}>
                {learningData.learning_paths.map((path, index) => (
                    <motion.div
                        key={index}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: index * 0.1}}
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '2rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                <span style={{fontSize: '2.5rem'}}>{getCourseIcon(path.course_title)}</span>
                                <div>
                                    <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0}}>
                                        {path.course_title}
                                    </h3>
                                    <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>
                                        {path.course_code} • {path.credits} Credits • {path.duration_weeks} Weeks
                                    </p>
                                </div>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: `${getDifficultyColor(path.difficulty_level)}20`,
                                    color: getDifficultyColor(path.difficulty_level),
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {path.difficulty_level}
                                </span>
                                <div style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    textTransform: 'capitalize'
                                }}>
                                    {path.status.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{marginBottom: '1.5rem'}}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{fontSize: '0.875rem', color: '#374151', fontWeight: '600'}}>
                                    Progress
                                </span>
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    color: getProgressColor(path.progress_percentage)
                                }}>
                                    {path.progress_percentage.toFixed(1)}%
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${path.progress_percentage}%`,
                                    height: '100%',
                                    backgroundColor: getProgressColor(path.progress_percentage),
                                    borderRadius: '4px',
                                    transition: 'width 0.3s ease'
                                }}/>
                            </div>
                        </div>

                        {/* Learning Objectives */}
                        {path.learning_objectives && path.learning_objectives.length > 0 && (
                            <div>
                                <h4 style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.75rem'
                                }}>
                                    🎯 Learning Objectives
                                </h4>
                                <div style={{display: 'grid', gap: '0.5rem'}}>
                                    {path.learning_objectives.slice(0, 3).map((obj, i) => (
                                        <div key={i} style={{
                                            padding: '0.5rem',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            color: '#374151'
                                        }}>
                                            • {obj}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {path.estimated_completion && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: '#eff6ff',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                color: '#1e40af'
                            }}>
                                📅 Estimated Completion: {path.estimated_completion}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* AI-Powered Recommendations */}
            {learningData.ai_recommendations && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4}}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        padding: '2rem',
                        color: 'white'
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
                        <div style={{fontSize: '2.5rem'}}>🤖</div>
                        <div>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '700'}}>
                                AI-Powered Learning Recommendations
                            </h3>
                            <p style={{margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem'}}>
                                {learningData.ai_recommendations.ai_powered ? `Generated by ${learningData.ai_recommendations.model}` : 'Based on your learning data'}
                            </p>
                        </div>
                    </div>

                    {/* Learning Path Analysis */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <h4 style={{margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: '600'}}>
                            🎓 Your Learning Journey
                        </h4>
                        <p style={{margin: 0, lineHeight: '1.6', fontSize: '1rem'}}>
                            {learningData.ai_recommendations.learning_path_analysis}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        {/* Study Tips */}
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h4 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{fontSize: '1.3rem'}}>📚</span> Study Tips
                            </h4>
                            <ul style={{margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8'}}>
                                {learningData.ai_recommendations.study_tips?.map((tip, idx) => (
                                    <li key={idx} style={{marginBottom: '0.5rem'}}>{tip}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Schedule Optimization */}
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h4 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{fontSize: '1.3rem'}}>⏰</span> Schedule Optimization
                            </h4>
                            <ul style={{margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8'}}>
                                {learningData.ai_recommendations.schedule_optimization?.map((opt, idx) => (
                                    <li key={idx} style={{marginBottom: '0.5rem'}}>{opt}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Next Courses */}
                    {learningData.ai_recommendations.next_courses && learningData.ai_recommendations.next_courses.length > 0 && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem'
                        }}>
                            <h4 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{fontSize: '1.3rem'}}>📖</span> Recommended Next Courses
                            </h4>
                            <div style={{display: 'grid', gap: '1rem'}}>
                                {learningData.ai_recommendations.next_courses.map((course, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <h5 style={{margin: 0, fontSize: '1rem', fontWeight: '600'}}>
                                                {course.title}
                                            </h5>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                background: getDifficultyColor(course.difficulty),
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {course.difficulty}
                                            </span>
                                        </div>
                                        <p style={{margin: 0, fontSize: '0.875rem', opacity: 0.9}}>
                                            {course.reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Learning Style Adjustments */}
                    {learningData.ai_recommendations.learning_style_adjustments && learningData.ai_recommendations.learning_style_adjustments.length > 0 && (
                        <div style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h4 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{fontSize: '1.3rem'}}>🎯</span> Learning Style Optimization
                            </h4>
                            <ul style={{margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8'}}>
                                {learningData.ai_recommendations.learning_style_adjustments.map((adj, idx) => (
                                    <li key={idx} style={{marginBottom: '0.5rem'}}>{adj}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Milestones */}
                    {learningData.ai_recommendations.milestones && learningData.ai_recommendations.milestones.length > 0 && (
                        <div style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h4 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{fontSize: '1.3rem'}}>🏆</span> Progress Milestones
                            </h4>
                            <div style={{display: 'grid', gap: '1rem'}}>
                                {learningData.ai_recommendations.milestones.map((milestone, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <h5 style={{margin: 0, fontSize: '1rem', fontWeight: '600'}}>
                                                {milestone.milestone}
                                            </h5>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(59, 130, 246, 0.3)',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {milestone.timeframe}
                                            </span>
                                        </div>
                                        <p style={{margin: 0, fontSize: '0.875rem', opacity: 0.9}}>
                                            ✓ {milestone.actionable}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Motivational Message */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}>
                        <div style={{fontSize: '2rem', marginBottom: '0.75rem'}}>✨</div>
                        <p style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            fontStyle: 'italic',
                            lineHeight: '1.6'
                        }}>
                            "{learningData.ai_recommendations.motivational_message}"
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default AdaptiveLearning
