import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {getPersonalizedLearningPath} from '../../../services/api'
import toast from 'react-hot-toast'

interface LearningPath {
    id: number
    course_title: string
    current_module: string
    progress_percentage: number
    difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
    learning_style: string
    estimated_completion: string
    next_milestone: string
    ai_recommendations: string[]
    strengths: string[]
    areas_for_improvement: string[]
    icon?: string
}

interface LearningData {
    learning_paths: LearningPath[]
    overall_progress: number
    learning_style: string
    ai_insights: {
        learning_velocity: number
        engagement_score: number
        difficulty_preference: string
        recommended_study_time: number
    }
}

const AdaptiveLearning: React.FC = () => {
    const {user, token} = useAuth()
    const [learningData, setLearningData] = useState<LearningData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)

    useEffect(() => {
        if (user && token) {
            fetchLearningPath()
        }
    }, [user, token])

    const fetchLearningPath = async () => {
        try {
            setLoading(true)
            const data = await getPersonalizedLearningPath(token!)
            setLearningData(data)
        } catch (error: any) {
            console.error('Error fetching learning path:', error)
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
        return '📖'
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner':
                return '#10b981'
            case 'Intermediate':
                return '#3b82f6'
            case 'Advanced':
                return '#f59e0b'
            case 'Expert':
                return '#dc2626'
            default:
                return '#6b7280'
        }
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
                    Loading learning paths...
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
                            <p style={{margin: '0'}}>• Next steps and milestone planning</p>
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

            {/* AI Insights Card */}
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
                    🤖 AI Learning Insights
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem'
                }}>
                    <div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {learningData.ai_insights.learning_velocity.toFixed(1)}x
                        </div>
                        <div style={{opacity: 0.9}}>Learning Velocity</div>
                    </div>
                    <div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {learningData.ai_insights.engagement_score.toFixed(0)}%
                        </div>
                        <div style={{opacity: 0.9}}>Engagement Score</div>
                    </div>
                    <div>
                        <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {learningData.overall_progress.toFixed(0)}%
                        </div>
                        <div style={{opacity: 0.9}}>Overall Progress</div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'capitalize'
                        }}>
                            {learningData.learning_style}
                        </div>
                        <div style={{opacity: 0.9}}>Learning Style</div>
                    </div>
                </div>
            </motion.div>

            {/* Learning Paths */}
            <div style={{display: 'grid', gap: '1.5rem'}}>
                {learningData.learning_paths.map((path, index) => (
                    <motion.div
                        key={path.id}
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
                                        Current: {path.current_module}
                                    </p>
                                </div>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: `${getDifficultyColor(path.difficulty_level)}20`,
                                    color: getDifficultyColor(path.difficulty_level),
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {path.difficulty_level}
                                </span>
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

                        {/* Details */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem'
                        }}>
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '0.5rem'
                                }}>
                                    Next Milestone
                                </h4>
                                <p style={{margin: 0, fontSize: '0.875rem', color: '#6b7280'}}>
                                    {path.next_milestone}
                                </p>
                                <p style={{
                                    margin: '0.5rem 0 0 0',
                                    fontSize: '0.8rem',
                                    color: '#9ca3af'
                                }}>
                                    Est. completion: {path.estimated_completion}
                                </p>
                            </div>
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '0.5rem'
                                }}>
                                    AI Recommendations
                                </h4>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    {path.ai_recommendations.slice(0, 2).map((rec, i) => (
                                        <p key={i} style={{margin: '0 0 0.25rem 0'}}>• {rec}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div style={{marginTop: '1.5rem', textAlign: 'right'}}>
                            <button
                                onClick={() => setSelectedPath(path)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detailed Modal */}
            {selectedPath && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setSelectedPath(null)}
                >
                    <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.9}}
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
                            <span style={{fontSize: '3rem'}}>{getCourseIcon(selectedPath.course_title)}</span>
                            <div>
                                <h2 style={{fontSize: '1.5rem', fontWeight: '700', margin: 0}}>
                                    {selectedPath.course_title}
                                </h2>
                                <p style={{margin: 0, color: '#6b7280'}}>
                                    {selectedPath.current_module}
                                </p>
                            </div>
                        </div>

                        <div style={{display: 'grid', gap: '2rem'}}>
                            <div>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '1rem'
                                }}>
                                    🎯 Your Strengths
                                </h4>
                                <div style={{display: 'grid', gap: '0.5rem'}}>
                                    {selectedPath.strengths.map((strength, i) => (
                                        <div key={i} style={{
                                            padding: '0.5rem',
                                            backgroundColor: '#dcfce7',
                                            color: '#166534',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem'
                                        }}>
                                            ✅ {strength}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '1rem'
                                }}>
                                    📈 Areas for Improvement
                                </h4>
                                <div style={{display: 'grid', gap: '0.5rem'}}>
                                    {selectedPath.areas_for_improvement.map((area, i) => (
                                        <div key={i} style={{
                                            padding: '0.5rem',
                                            backgroundColor: '#fef3c7',
                                            color: '#92400e',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem'
                                        }}>
                                            📊 {area}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '1rem'
                                }}>
                                    🤖 AI Recommendations
                                </h4>
                                <div style={{display: 'grid', gap: '0.5rem'}}>
                                    {selectedPath.ai_recommendations.map((rec, i) => (
                                        <div key={i} style={{
                                            padding: '0.5rem',
                                            backgroundColor: '#f0f9ff',
                                            color: '#1e40af',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem'
                                        }}>
                                            💡 {rec}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '2rem'}}>
                            <button
                                onClick={() => setSelectedPath(null)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}

export default AdaptiveLearning
