import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../../contexts/AuthContext'
import { teacherAPI } from '../../../services/api'

interface Course {
    id: number
    title: string
    code: string
    description: string
    credits: number
    difficulty_level: string
    start_date: string
    end_date: string
    enrolled_students: number
    enrollment_limit: number
    status: string
    subject: number
    subject_name: string
}

interface ApprovedSubject {
    id: number
    subject: number
    subject_name: string
    subject_code: string
    approved_date: string
}

interface NewCourseForm {
    title: string
    code: string
    description: string
    subject: number
    credits: number
    difficulty_level: string
    enrollment_limit: number
}

const CourseManagement: React.FC = () => {
    const { token } = useAuth()
    const [courses, setCourses] = useState<Course[]>([])
    const [approvedSubjects, setApprovedSubjects] = useState<ApprovedSubject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [noSubjectsError, setNoSubjectsError] = useState(false)
    const [newCourse, setNewCourse] = useState<NewCourseForm>({
        title: '',
        code: '',
        description: '',
        subject: 0,
        credits: 3,
        difficulty_level: 'intermediate',
        enrollment_limit: 30
    })

    useEffect(() => {
        console.log('CourseManagement mounted')
        if (token) {
            fetchApprovedSubjects()
            fetchCourses()
        } else {
            setLoading(false)
            setError('Not authenticated')
        }
    }, [token])

    const fetchApprovedSubjects = async () => {
        if (!token) return

        try {
            console.log('Fetching approved subjects...')
            const data = await teacherAPI.getApprovedSubjects(token)
            console.log('Approved subjects:', data)

            // Handle paginated response
            const subjectsArray = data?.results || data || []
            setApprovedSubjects(subjectsArray)

            if (subjectsArray.length === 0) {
                setNoSubjectsError(true)
            }
        } catch (error: any) {
            console.error('Error fetching approved subjects:', error)
            toast.error('Failed to fetch approved subjects')
        }
    }

    const fetchCourses = async () => {
        if (!token) return

        try {
            setLoading(true)
            setError(null)
            console.log('Fetching courses...')
            const data = await teacherAPI.getMyCourses(token)
            console.log('Courses:', data)

            // Handle paginated response
            const coursesArray = data?.results || data || []
            setCourses(coursesArray)
        } catch (error: any) {
            console.error('Error fetching courses:', error)
            setError(error.message || 'Failed to fetch courses')
            toast.error('Error fetching courses')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newCourse.subject) {
            toast.error('Please select a subject')
            return
        }

        try {
            const response = await fetch('http://localhost:8000/api/courses/courses/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCourse)
            })

            if (response.ok) {
                toast.success('Course created successfully!')
                setShowCreateModal(false)
                setNewCourse({
                    title: '',
                    code: '',
                    description: '',
                    subject: 0,
                    credits: 3,
                    difficulty_level: 'intermediate',
                    enrollment_limit: 30
                })
                fetchCourses()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to create course')
            }
        } catch (error) {
            console.error('Error creating course:', error)
            toast.error('Error creating course')
        }
    }

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return '#10b981'
            case 'intermediate':
                return '#f59e0b'
            case 'advanced':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: 0
                        }}>
                            📚 Course Management
                        </h1>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#6b7280',
                            margin: '0.5rem 0 0 0'
                        }}>
                            Manage your courses and track enrollment
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (approvedSubjects.length === 0) {
                                toast.error('You need to request and get subjects approved first!')
                                return
                            }
                            setShowCreateModal(true)
                        }}
                        style={{
                            padding: '0.875rem 1.75rem',
                            backgroundColor: approvedSubjects.length === 0 ? '#d1d5db' : '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: approvedSubjects.length === 0 ? 'not-allowed' : 'pointer',
                            boxShadow: approvedSubjects.length === 0 ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
                            transition: 'all 0.2s',
                            opacity: approvedSubjects.length === 0 ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (approvedSubjects.length > 0) {
                                e.currentTarget.style.backgroundColor = '#4f46e5'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (approvedSubjects.length > 0) {
                                e.currentTarget.style.backgroundColor = '#6366f1'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }
                        }}
                    >
                        + Create New Course
                    </button>
                </div>
            </motion.div>

            {/* Warning Message */}
            {noSubjectsError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: '8px',
                        color: '#92400e',
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <div>
                        <strong>⚠️ No Approved Subjects</strong>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                            To create courses, you need to first request subjects and wait for admin approval.
                            Go to <strong>Subject Management</strong> tab to get started.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                >
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {courses.length}
                    </div>
                    <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                        Total Courses
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)'
                    }}
                >
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {courses.filter(c => c.status === 'active').length}
                    </div>
                    <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                        Active Courses
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                    }}
                >
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {courses.reduce((sum, c) => sum + c.enrolled_students, 0)}
                    </div>
                    <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                        Total Enrollments
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(250, 112, 154, 0.4)'
                    }}
                >
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {courses.reduce((sum, c) => sum + c.credits, 0)}
                    </div>
                    <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                        Total Credits
                    </div>
                </motion.div>
            </div>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#b91c1c',
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <span>Error: {error}</span>
                    <button
                        onClick={() => fetchCourses()}
                        style={{
                            background: '#b91c1c',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Retry
                    </button>
                </motion.div>
            )}

            {/* Courses Grid */}
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #6366f1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                </div>
            ) : courses.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '16px',
                    border: '2px dashed #d1d5db'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                    <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
                        No Courses Yet
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Create your first course to get started
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            padding: '0.875rem 2rem',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        + Create Your First Course
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Course Header */}
                            <div style={{
                                padding: '1.5rem',
                                background: course.status === 'active' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6b7280',
                                color: 'white'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        lineHeight: 1.2
                                    }}>
                                        {course.title}
                                    </h3>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: getDifficultyColor(course.difficulty_level),
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {course.difficulty_level}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    {course.code} • {course.credits} Credits
                                </div>
                            </div>

                            {/* Course Body */}
                            <div style={{ padding: '1.5rem' }}>
                                <p style={{
                                    margin: '0 0 1rem 0',
                                    color: '#6b7280',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5
                                }}>
                                    {course.description || 'No description available'}
                                </p>

                                {/* Enrollment Progress */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>
                                            Enrollment
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1f2937' }}>
                                            {course.enrolled_students}/{course.enrollment_limit}
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
                                            width: `${Math.min((course.enrolled_students / course.enrollment_limit) * 100, 100)}%`,
                                            height: '100%',
                                            backgroundColor: course.enrolled_students >= course.enrollment_limit ? '#ef4444' : '#3b82f6',
                                            borderRadius: '4px'
                                        }} />
                                    </div>
                                </div>

                                {/* Course Dates */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                            Start Date
                                        </div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            {new Date(course.start_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                            End Date
                                        </div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            {new Date(course.end_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: course.status === 'active' ? '#dcfce7' : '#f3f4f6',
                                        color: course.status === 'active' ? '#166534' : '#6b7280',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {course.status === 'active' ? '✅ Active' : `⏸️ ${course.status.charAt(0).toUpperCase() + course.status.slice(1)}`}
                                    </span>

                                    <button
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '2.5rem',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                            }}
                        >
                            <h2 style={{
                                margin: '0 0 1.5rem 0',
                                fontSize: '1.8rem',
                                color: '#1f2937'
                            }}>
                                Create New Course
                            </h2>

                            <form onSubmit={handleCreateCourse}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Course Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={newCourse.title}
                                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                        required
                                        placeholder="e.g., Advanced Machine Learning"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Course Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={newCourse.code}
                                        onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                                        required
                                        placeholder="e.g., CS401"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Subject * {approvedSubjects.length === 0 && <span style={{ color: '#ef4444' }}>(No approved subjects)</span>}
                                    </label>
                                    {approvedSubjects.length > 0 ? (
                                        <select
                                            value={newCourse.subject}
                                            onChange={(e) => setNewCourse({ ...newCourse, subject: parseInt(e.target.value) })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <option value={0}>Select a subject...</option>
                                            {approvedSubjects.map(subject => (
                                                <option key={subject.id} value={subject.subject}>
                                                    {subject.subject_name} ({subject.subject_code})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div style={{
                                            padding: '1rem',
                                            backgroundColor: '#fee2e2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '8px',
                                            color: '#991b1b',
                                            fontSize: '0.9rem'
                                        }}>
                                            ⚠️ You don't have any approved subjects yet. <br />
                                            Go to <strong>Subject Management</strong> to request subjects first, then wait for admin approval.
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Description *
                                    </label>
                                    <textarea
                                        value={newCourse.description}
                                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                        required
                                        placeholder="Provide a detailed description of the course"
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            Credits
                                        </label>
                                        <input
                                            type="number"
                                            value={newCourse.credits}
                                            onChange={(e) => setNewCourse({
                                                ...newCourse,
                                                credits: parseInt(e.target.value)
                                            })}
                                            min="1"
                                            max="6"
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
                                            Enrollment Limit
                                        </label>
                                        <input
                                            type="number"
                                            value={newCourse.enrollment_limit}
                                            onChange={(e) => setNewCourse({
                                                ...newCourse,
                                                enrollment_limit: parseInt(e.target.value)
                                            })}
                                            min="10"
                                            max="100"
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

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={newCourse.difficulty_level}
                                        onChange={(e) => setNewCourse({ ...newCourse, difficulty_level: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.875rem',
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
                                        style={{
                                            flex: 1,
                                            padding: '0.875rem',
                                            backgroundColor: '#6366f1',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Create Course
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spinning Animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default CourseManagement