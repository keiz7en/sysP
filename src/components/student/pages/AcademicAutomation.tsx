import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Assessment {
    id: number;
    title: string;
    type: 'Quiz' | 'Exam' | 'Assignment';
    subject: string;
    dueDate: string;
    duration: number; // in minutes
    status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
    score?: number;
    totalQuestions?: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface AssessmentStats {
    completed: number;
    pending: number;
    averageScore: number;
    totalAssessments: number;
}

interface AIQuestion {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    points: number;
    type: string;
}

interface AIAssessment {
    assessment_title: string;
    total_duration: number;
    questions: AIQuestion[];
    passing_score: number;
    ai_generated: boolean;
    model: string;
}

const AcademicAutomation: React.FC = () => {
    const {token} = useAuth()
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
    const [showSubmissionModal, setShowSubmissionModal] = useState(false)
    const [stats, setStats] = useState<AssessmentStats>({
        completed: 0,
        pending: 0,
        averageScore: 0,
        totalAssessments: 0
    })
    const [selectedType, setSelectedType] = useState<'all' | 'Quiz' | 'Exam' | 'Assignment'>('all')

    // AI Assessment Generation State
    const [showAIGenerator, setShowAIGenerator] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)
    const [aiAssessment, setAiAssessment] = useState<AIAssessment | null>(null)
    const [assessmentForm, setAssessmentForm] = useState({
        topic: '',
        difficulty: 'intermediate',
        num_questions: 5,
        assessment_type: 'quiz'
    })

    useEffect(() => {
        fetchAssessments()
    }, [token])

    const fetchAssessments = async () => {
        try {
            setLoading(true)

            if (!token) {
                setAssessments([])
                setStats({
                    completed: 0,
                    pending: 0,
                    averageScore: 0,
                    totalAssessments: 0
                })
                return
            }

            // Try to fetch real assessment data from API
            try {
                const response = await fetch('/api/students/assessments/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const data = await response.json()

                    // Convert API data to our Assessment format
                    const apiAssessments: Assessment[] = []

                    // Add upcoming assessments
                    if (data.upcoming_assessments) {
                        data.upcoming_assessments.forEach((assessment: any) => {
                            apiAssessments.push({
                                id: assessment.id,
                                title: assessment.title,
                                type: assessment.type as 'Quiz' | 'Exam' | 'Assignment',
                                subject: assessment.course,
                                dueDate: assessment.due_date,
                                duration: 60, // Default duration
                                status: 'upcoming',
                                totalQuestions: assessment.total_marks,
                                difficulty: 'Medium' // Default difficulty
                            })
                        })
                    }

                    // Add completed assessments
                    if (data.recent_results) {
                        data.recent_results.forEach((result: any) => {
                            apiAssessments.push({
                                id: result.assessment_id || Math.random(),
                                title: result.assessment_title,
                                type: 'Quiz', // Default type
                                subject: result.course,
                                dueDate: result.submitted_at,
                                duration: 60,
                                status: 'completed',
                                score: result.score,
                                totalQuestions: result.total_marks,
                                difficulty: 'Medium'
                            })
                        })
                    }

                    setAssessments(apiAssessments)

                    // Use API stats if available
                    if (data.summary) {
                        setStats({
                            completed: data.summary.completed_total || 0,
                            pending: data.summary.total_upcoming || 0,
                            averageScore: data.summary.average_score || 0,
                            totalAssessments: apiAssessments.length
                        })
                    }
                } else {
                    // No real assessment data available
                    setAssessments([])
                    setStats({
                        completed: 0,
                        pending: 0,
                        averageScore: 0,
                        totalAssessments: 0
                    })
                }
            } catch (apiError) {
                console.log('API not available, showing empty state')
                setAssessments([])
                setStats({
                    completed: 0,
                    pending: 0,
                    averageScore: 0,
                    totalAssessments: 0
                })
            }
        } catch (error) {
            console.error('Error fetching assessments:', error)
            toast.error('Failed to load assessments')
            setAssessments([])
            setStats({
                completed: 0,
                pending: 0,
                averageScore: 0,
                totalAssessments: 0
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: Assessment['status']) => {
        switch (status) {
            case 'upcoming':
                return '#3b82f6'
            case 'in-progress':
                return '#f59e0b'
            case 'completed':
                return '#10b981'
            case 'overdue':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const getStatusIcon = (status: Assessment['status']) => {
        switch (status) {
            case 'upcoming':
                return '⏰'
            case 'in-progress':
                return '⚡'
            case 'completed':
                return '✅'
            case 'overdue':
                return '⚠️'
            default:
                return '📝'
        }
    }

    const getDifficultyColor = (difficulty: Assessment['difficulty']) => {
        switch (difficulty) {
            case 'Easy':
                return '#10b981'
            case 'Medium':
                return '#f59e0b'
            case 'Hard':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const filteredAssessments = selectedType === 'all'
        ? assessments
        : assessments.filter(a => a.type === selectedType)

    const handleStartAssessment = (assessment: Assessment) => {
        toast.success(`Starting ${assessment.title}...`)
        // Here you would implement the actual assessment taking functionality
    }

    const generateAIAssessment = async () => {
        if (!assessmentForm.topic.trim()) {
            toast.error('Please enter a topic')
            return
        }

        setAiGenerating(true)
        const loadingToast = toast.loading('🤖 AI is generating your assessment...')

        try {
            console.log('🔥 Sending request to generate AI assessment:', assessmentForm)

            const response = await fetch('/api/students/generate-ai-assessment/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assessmentForm)
            })

            const data = await response.json()
            console.log('📥 Response received:', data)

            if (response.ok) {
                setAiAssessment(data)
                toast.dismiss(loadingToast)
                toast.success(`✨ Generated: ${data.assessment_title}`, {duration: 5000})
            } else {
                console.error('❌ API Error:', data)
                toast.dismiss(loadingToast)
                toast.error(data.error || 'Failed to generate AI assessment')
            }
        } catch (error) {
            console.error('❌ Network Error:', error)
            toast.dismiss(loadingToast)
            toast.error('Network error. Please check your connection and try again.')
        } finally {
            setAiGenerating(false)
        }
    }

    const handleGenerateSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        generateAIAssessment()
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
                    Loading your assessments...
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937'}}>
                        ⚡ AI Assessments
                    </h1>
                    <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                        AI-powered automated testing, instant grading, and smart academic evaluations
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
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
                        {stats.totalAssessments}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Total Assessments</div>
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
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⏳</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {stats.pending}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Pending</div>
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
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✅</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {stats.completed}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Completed</div>
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
                        {stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Average Score</div>
                </motion.div>
            </div>

            {/* AI Assessment Generation */}
            <div style={{marginBottom: '2rem'}}>
                <button
                    onClick={() => setShowAIGenerator(!showAIGenerator)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        minWidth: '120px'
                    }}
                >
                    Generate AI Assessment
                </button>
                {showAIGenerator && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <form onSubmit={handleGenerateSubmit}>
                            <div style={{marginBottom: '1rem'}}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>Topic:</label>
                                <input
                                    type="text"
                                    value={assessmentForm.topic}
                                    onChange={(e) => setAssessmentForm({...assessmentForm, topic: e.target.value})}
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div style={{marginBottom: '1rem'}}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>Difficulty:</label>
                                <select
                                    value={assessmentForm.difficulty}
                                    onChange={(e) => setAssessmentForm({...assessmentForm, difficulty: e.target.value})}
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <div style={{marginBottom: '1rem'}}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>Number of Questions:</label>
                                <input
                                    type="number"
                                    value={assessmentForm.num_questions}
                                    onChange={(e) => setAssessmentForm({
                                        ...assessmentForm,
                                        num_questions: parseInt(e.target.value)
                                    })}
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div style={{marginBottom: '1rem'}}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>Assessment Type:</label>
                                <select
                                    value={assessmentForm.assessment_type}
                                    onChange={(e) => setAssessmentForm({
                                        ...assessmentForm,
                                        assessment_type: e.target.value
                                    })}
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}
                                >
                                    <option value="quiz">Quiz</option>
                                    <option value="exam">Exam</option>
                                    <option value="assignment">Assignment</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    minWidth: '120px'
                                }}
                            >
                                {aiGenerating ? 'Generating...' : 'Generate'}
                            </button>
                        </form>
                        {aiAssessment && (
                            <div style={{marginTop: '1rem'}}>
                                <h3 style={{fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#1f2937'}}>
                                    {aiAssessment.assessment_title}
                                </h3>
                                <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem'}}>
                                    Total Duration: {aiAssessment.total_duration} minutes
                                </div>
                                <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem'}}>
                                    Passing Score: {aiAssessment.passing_score}%
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                    {aiAssessment.questions.map((question, index) => (
                                        <li key={index} style={{marginBottom: '1rem'}}>
                                            <div style={{
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Question {index + 1}: {question.question}
                                            </div>
                                            <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                                                Options: {question.options.join(', ')}
                                            </div>
                                            <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                                                Correct Answer: {question.correct_answer}
                                            </div>
                                            <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                                                Explanation: {question.explanation}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
            }}>
                {(['all', 'Quiz', 'Exam', 'Assignment'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            backgroundColor: selectedType === type ? '#3b82f6' : '#f3f4f6',
                            color: selectedType === type ? 'white' : '#374151'
                        }}
                    >
                        {type === 'all' ? 'All' :
                            type === 'Quiz' ? 'Quizzes' :
                                type === 'Exam' ? 'Exams' :
                                    'Assignments'}
                    </button>
                ))}
            </div>

            {/* Assessments List */}
            {filteredAssessments.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '12px',
                    color: '#6b7280',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📝</div>
                    <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937'}}>No Assessments Found</h3>
                    <p style={{fontSize: '1rem', marginBottom: '0'}}>
                        {selectedType === 'all'
                            ? 'No assessments available at the moment.'
                            : `No ${selectedType.toLowerCase()}s available.`}
                    </p>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <AnimatePresence>
                        {filteredAssessments.map((assessment, index) => (
                            <motion.div
                                key={assessment.id}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                transition={{delay: index * 0.1}}
                                style={{
                                    background: 'white',
                                    padding: '2rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr',
                                    gap: '2rem',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{fontSize: '1.5rem'}}>
                                                {assessment.type === 'Quiz' ? '❓' :
                                                    assessment.type === 'Exam' ? '📊' : '📝'}
                                            </div>
                                            <div>
                                                <h3 style={{
                                                    fontSize: '1.3rem',
                                                    fontWeight: '600',
                                                    margin: 0,
                                                    color: '#1f2937'
                                                }}>
                                                    {assessment.title}
                                                </h3>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    marginTop: '0.5rem'
                                                }}>
                                                    <span style={{
                                                        color: '#6b7280',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {assessment.subject}
                                                    </span>
                                                    <span style={{
                                                        background: getDifficultyColor(assessment.difficulty),
                                                        color: 'white',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {assessment.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div>
                                                <div style={{fontWeight: '600', color: '#374151', fontSize: '0.9rem'}}>
                                                    Due Date
                                                </div>
                                                <div style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                    {new Date(assessment.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{fontWeight: '600', color: '#374151', fontSize: '0.9rem'}}>
                                                    Duration
                                                </div>
                                                <div style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                    {assessment.duration} minutes
                                                </div>
                                            </div>
                                            {assessment.totalQuestions && (
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: '#374151',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        Questions
                                                    </div>
                                                    <div style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                        {assessment.totalQuestions}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: getStatusColor(assessment.status) + '20',
                                            borderRadius: '20px',
                                            border: `1px solid ${getStatusColor(assessment.status)}40`
                                        }}>
                                            <span style={{fontSize: '1rem'}}>
                                                {getStatusIcon(assessment.status)}
                                            </span>
                                            <span style={{
                                                color: getStatusColor(assessment.status),
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {assessment.status.replace('-', ' ')}
                                            </span>
                                        </div>

                                        {assessment.status === 'upcoming' || assessment.status === 'in-progress' ? (
                                            <motion.button
                                                whileHover={{scale: 1.05}}
                                                whileTap={{scale: 0.95}}
                                                onClick={() => handleStartAssessment(assessment)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    minWidth: '120px'
                                                }}
                                            >
                                                {assessment.status === 'upcoming' ? 'Start' : 'Continue'}
                                            </motion.button>
                                        ) : assessment.status === 'completed' && assessment.score !== undefined ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '0.75rem',
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '8px',
                                                border: '1px solid #10b981'
                                            }}>
                                                <div style={{fontSize: '1.2rem', fontWeight: '700', color: '#10b981'}}>
                                                    {assessment.score}%
                                                </div>
                                                <div style={{fontSize: '0.8rem', color: '#6b7280'}}>
                                                    Final Score
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    )
}

export default AcademicAutomation
