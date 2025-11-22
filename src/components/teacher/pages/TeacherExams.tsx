import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'
import {COURSE_SYLLABI, getAllCourseCodes, getCourseByCode} from '../../../data/courseSyllabi'

interface Exam {
    id: number;
    title: string;
    type: 'Quiz' | 'Mid' | 'Final';
    course_id: number;
    course_title: string;
    course_code: string;
    total_marks: number;
    duration: number;
    due_date: string;
    status: 'draft' | 'published' | 'completed';
    questions_count: number;
    students_attempted: number;
    students_enrolled: number;
}

const TeacherExams: React.FC = () => {
    const {token} = useAuth()
    const [activeTab, setActiveTab] = useState<'all' | 'create'>('all')
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)

    // Get all available courses from syllabus
    const availableCourses = Object.values(COURSE_SYLLABI)

    // Create Exam Form
    const [examForm, setExamForm] = useState({
        title: '',
        type: 'Quiz' as 'Quiz' | 'Mid' | 'Final',
        course_code: '',
        total_marks: 10,
        duration: 30,
        due_date: '',
        questions_count: 10,
        description: '',
        materials: ''
    })

    useEffect(() => {
        if (token) {
            fetchExams()
        }
    }, [token])

    const fetchExams = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/teachers/exams/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setExams(data)
            } else {
                setExams([])
            }
        } catch (error) {
            console.error('Error fetching exams:', error)
            setExams([])
        } finally {
            setLoading(false)
        }
    }

    const handleCreateExam = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!examForm.course_code || !examForm.title || !examForm.due_date) {
            toast.error('Please fill in all required fields')
            return
        }

        setCreating(true)

        try {
            const response = await fetch('http://localhost:8000/api/teachers/exams/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(examForm)
            })

            if (response.ok) {
                const data = await response.json()
                toast.success(`Exam "${examForm.title}" created successfully!`)
                setExams([data, ...exams])
                setActiveTab('all')
                // Reset form
                setExamForm({
                    title: '',
                    type: 'Quiz',
                    course_code: '',
                    total_marks: 10,
                    duration: 30,
                    due_date: '',
                    questions_count: 10,
                    description: '',
                    materials: ''
                })
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to create exam')
            }
        } catch (error) {
            console.error('Error creating exam:', error)
            toast.error('Failed to create exam')
        } finally {
            setCreating(false)
        }
    }

    const handlePublishExam = async (examId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/teachers/exams/${examId}/publish/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                toast.success('Exam published successfully!')
                fetchExams()
            } else {
                toast.error('Failed to publish exam')
            }
        } catch (error) {
            console.error('Error publishing exam:', error)
            toast.error('Failed to publish exam')
        }
    }

    const handleDeleteExam = async (examId: number) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return

        try {
            const response = await fetch(`http://localhost:8000/api/teachers/exams/${examId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                toast.success('Exam deleted successfully!')
                setExams(exams.filter(e => e.id !== examId))
            } else {
                toast.error('Failed to delete exam')
            }
        } catch (error) {
            console.error('Error deleting exam:', error)
            toast.error('Failed to delete exam')
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Quiz':
                return '#10b981'
            case 'Mid':
                return '#f59e0b'
            case 'Final':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return '#6b7280'
            case 'published':
                return '#3b82f6'
            case 'completed':
                return '#10b981'
            default:
                return '#6b7280'
        }
    }

    const defaultMarks = {
        'Quiz': 10,
        'Mid': 25,
        'Final': 40
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}}>
                {/* Header */}
                <div style={{marginBottom: '2rem'}}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📝 Exam Management
                    </h1>
                    <p style={{color: '#6b7280', fontSize: '1.1rem'}}>
                        Create and manage quizzes, mid-terms, and final exams
                    </p>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {exams.length}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Total Exams</div>
                    </motion.div>

                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {exams.filter(e => e.type === 'Quiz').length}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Quizzes</div>
                    </motion.div>

                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {exams.filter(e => e.type === 'Mid').length}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Mid Terms</div>
                    </motion.div>

                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(250, 112, 154, 0.4)'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {exams.filter(e => e.type === 'Final').length}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Final Exams</div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <button
                        onClick={() => setActiveTab('all')}
                        style={{
                            padding: '1rem 2rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: activeTab === 'all' ? '#667eea' : '#6b7280',
                            borderBottom: activeTab === 'all' ? '3px solid #667eea' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        📋 All Exams ({exams.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        style={{
                            padding: '1rem 2rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: activeTab === 'create' ? '#667eea' : '#6b7280',
                            borderBottom: activeTab === 'create' ? '3px solid #667eea' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        ➕ Create New Exam
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{textAlign: 'center', padding: '4rem'}}>
                        <div style={{fontSize: '1.2rem', color: '#6b7280'}}>Loading exams...</div>
                    </div>
                ) : (
                    <>
                        {/* All Exams Tab */}
                        {activeTab === 'all' && (
                            <div>
                                {exams.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '4rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '16px',
                                        border: '2px dashed #d1d5db'
                                    }}>
                                        <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📝</div>
                                        <h3 style={{fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem'}}>
                                            No Exams Created Yet
                                        </h3>
                                        <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                                            Create your first exam to get started
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('create')}
                                            style={{
                                                padding: '0.875rem 2rem',
                                                backgroundColor: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            Create Exam
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{display: 'grid', gap: '1.5rem'}}>
                                        {exams.map((exam, index) => (
                                            <motion.div
                                                key={exam.id}
                                                initial={{opacity: 0, y: 20}}
                                                animate={{opacity: 1, y: 0}}
                                                transition={{delay: index * 0.1}}
                                                style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '16px',
                                                    padding: '2rem',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                                                            <h3 style={{
                                                                margin: 0,
                                                                fontSize: '1.3rem',
                                                                fontWeight: '600',
                                                                color: '#1f2937'
                                                            }}>
                                                                {exam.title}
                                                            </h3>
                                                            <span style={{
                                                                padding: '0.25rem 0.75rem',
                                                                backgroundColor: `${getTypeColor(exam.type)}20`,
                                                                color: getTypeColor(exam.type),
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                {exam.type}
                                                            </span>
                                                            <span style={{
                                                                padding: '0.25rem 0.75rem',
                                                                backgroundColor: `${getStatusColor(exam.status)}20`,
                                                                color: getStatusColor(exam.status),
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {exam.status}
                                                            </span>
                                                        </div>

                                                        <div style={{
                                                            color: '#6b7280',
                                                            fontSize: '0.95rem',
                                                            marginBottom: '1rem'
                                                        }}>
                                                            {exam.course_title} ({exam.course_code})
                                                        </div>

                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                                            gap: '1rem'
                                                        }}>
                                                            <div>
                                                                <div style={{
                                                                    fontSize: '0.8rem',
                                                                    color: '#6b7280',
                                                                    marginBottom: '0.25rem'
                                                                }}>
                                                                    Total Marks
                                                                </div>
                                                                <div style={{fontWeight: '600', color: '#374151'}}>
                                                                    {exam.total_marks}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{
                                                                    fontSize: '0.8rem',
                                                                    color: '#6b7280',
                                                                    marginBottom: '0.25rem'
                                                                }}>
                                                                    Duration
                                                                </div>
                                                                <div style={{fontWeight: '600', color: '#374151'}}>
                                                                    {exam.duration} min
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{
                                                                    fontSize: '0.8rem',
                                                                    color: '#6b7280',
                                                                    marginBottom: '0.25rem'
                                                                }}>
                                                                    Questions
                                                                </div>
                                                                <div style={{fontWeight: '600', color: '#374151'}}>
                                                                    {exam.questions_count}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{
                                                                    fontSize: '0.8rem',
                                                                    color: '#6b7280',
                                                                    marginBottom: '0.25rem'
                                                                }}>
                                                                    Due Date
                                                                </div>
                                                                <div style={{fontWeight: '600', color: '#374151'}}>
                                                                    {new Date(exam.due_date).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '1rem'
                                                    }}>
                                                        <div style={{
                                                            textAlign: 'center',
                                                            padding: '1rem',
                                                            backgroundColor: '#f9fafb',
                                                            borderRadius: '8px'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '1.5rem',
                                                                fontWeight: '700',
                                                                color: '#667eea'
                                                            }}>
                                                                {exam.students_attempted}/{exam.students_enrolled}
                                                            </div>
                                                            <div style={{fontSize: '0.8rem', color: '#6b7280'}}>
                                                                Students Attempted
                                                            </div>
                                                        </div>

                                                        {exam.status === 'draft' && (
                                                            <button
                                                                onClick={() => handlePublishExam(exam.id)}
                                                                style={{
                                                                    padding: '0.75rem 1.5rem',
                                                                    backgroundColor: '#10b981',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                📢 Publish
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDeleteExam(exam.id)}
                                                            style={{
                                                                padding: '0.75rem 1.5rem',
                                                                backgroundColor: '#ef4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600',
                                                                fontSize: '0.9rem'
                                                            }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Create Exam Tab */}
                        {activeTab === 'create' && (
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    marginBottom: '1.5rem',
                                    color: '#1f2937'
                                }}>
                                    Create New Exam
                                </h2>

                                <form onSubmit={handleCreateExam}>
                                    <div style={{display: 'grid', gap: '1.5rem'}}>
                                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600',
                                                    color: '#374151'
                                                }}>
                                                    Exam Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={examForm.title}
                                                    onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                                                    placeholder="e.g., Chapter 1-3 Quiz"
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600',
                                                    color: '#374151'
                                                }}>
                                                    Exam Type *
                                                </label>
                                                <select
                                                    value={examForm.type}
                                                    onChange={(e) => {
                                                        const type = e.target.value as 'Quiz' | 'Mid' | 'Final'
                                                        setExamForm({
                                                            ...examForm,
                                                            type,
                                                            total_marks: defaultMarks[type]
                                                        })
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    <option value="Quiz">Quiz (10 marks)</option>
                                                    <option value="Mid">Mid Term (25 marks)</option>
                                                    <option value="Final">Final Exam (40 marks)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Course *
                                            </label>
                                            <select
                                                value={examForm.course_code}
                                                onChange={(e) => setExamForm({
                                                    ...examForm,
                                                    course_code: e.target.value
                                                })}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                <option value="">-- Select a course --</option>
                                                {availableCourses.map(course => (
                                                    <option key={course.code} value={course.code}>
                                                        {course.code} - {course.title} ({course.credits} credits)
                                                        [{course.level}]
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {examForm.course_code && (
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '8px',
                                                border: '1px solid #bbf7d0'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <span style={{fontSize: '1.2rem'}}>📚</span>
                                                    <strong style={{color: '#166534'}}>Course Syllabus</strong>
                                                </div>
                                                <div style={{color: '#166534', fontSize: '0.9rem'}}>
                                                    {getCourseByCode(examForm.course_code)?.units.length} units
                                                    available •
                                                    Students can practice with AI based on this syllabus
                                                </div>
                                            </div>
                                        )}

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            gap: '1.5rem'
                                        }}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600',
                                                    color: '#374151'
                                                }}>
                                                    Total Marks *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={examForm.total_marks}
                                                    onChange={(e) => setExamForm({
                                                        ...examForm,
                                                        total_marks: Number(e.target.value)
                                                    })}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                        backgroundColor: '#f9fafb'
                                                    }}
                                                    readOnly
                                                />
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600',
                                                    color: '#374151'
                                                }}>
                                                    Duration (minutes) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={examForm.duration}
                                                    onChange={(e) => setExamForm({
                                                        ...examForm,
                                                        duration: Number(e.target.value)
                                                    })}
                                                    min="10"
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600',
                                                    color: '#374151'
                                                }}>
                                                    Questions Count *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={examForm.questions_count}
                                                    onChange={(e) => setExamForm({
                                                        ...examForm,
                                                        questions_count: Number(e.target.value)
                                                    })}
                                                    min="1"
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Due Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={examForm.due_date}
                                                onChange={(e) => setExamForm({
                                                    ...examForm,
                                                    due_date: e.target.value
                                                })}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Description
                                            </label>
                                            <textarea
                                                value={examForm.description}
                                                onChange={(e) => setExamForm({
                                                    ...examForm,
                                                    description: e.target.value
                                                })}
                                                rows={3}
                                                placeholder="Exam instructions and topics covered..."
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    resize: 'vertical'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Study Materials / Chapter References
                                            </label>
                                            <textarea
                                                value={examForm.materials}
                                                onChange={(e) => setExamForm({...examForm, materials: e.target.value})}
                                                rows={2}
                                                placeholder="Chapter 1-3, Slides 10-25, etc."
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    resize: 'vertical'
                                                }}
                                            />
                                        </div>

                                        <div style={{
                                            padding: '1rem',
                                            backgroundColor: '#f0f9ff',
                                            borderRadius: '8px',
                                            border: '1px solid #bfdbfe'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <span style={{fontSize: '1.2rem'}}>💡</span>
                                                <strong style={{color: '#1e40af'}}>Exam Guidelines</strong>
                                            </div>
                                            <ul style={{
                                                margin: 0,
                                                paddingLeft: '1.5rem',
                                                color: '#1e40af',
                                                fontSize: '0.9rem'
                                            }}>
                                                <li>Quiz: 10 marks - Best 2 out of 3+ attempts count</li>
                                                <li>Mid Term: 25 marks - Single attempt</li>
                                                <li>Final: 40 marks - Single attempt</li>
                                                <li>Students can use AI assistant for practice based on syllabus</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('all')}
                                            style={{
                                                flex: 1,
                                                padding: '1rem 2rem',
                                                backgroundColor: '#f3f4f6',
                                                color: '#374151',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={creating}
                                            style={{
                                                flex: 2,
                                                padding: '1rem 2rem',
                                                backgroundColor: creating ? '#9ca3af' : '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: creating ? 'not-allowed' : 'pointer',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {creating ? 'Creating...' : '✨ Create Exam'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default TeacherExams
