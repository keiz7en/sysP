import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Assignment {
    id: number
    title: string
    description: string
    course_title: string
    course_id: number
    due_date: string
    max_points: number
    assignment_type: 'homework' | 'quiz' | 'exam' | 'project'
    status: 'draft' | 'published' | 'closed'
    created_date: string
    submissions_count: number
    avg_score: number
}

interface Course {
    id: number
    title: string
    code: string
    enrolled_students: number
}

const AssignmentManagement: React.FC = () => {
    const {user, token} = useAuth()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState('all')
    const [selectedCourse, setSelectedCourse] = useState('all')

    // Create assignment form state
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        description: '',
        course_id: '',
        due_date: '',
        max_points: 100,
        assignment_type: 'homework' as 'homework' | 'quiz' | 'exam' | 'project',
        instructions: '',
        attachments: [] as File[]
    })

    useEffect(() => {
        if (user && token) {
            fetchAssignments()
            fetchCourses()
        }
    }, [user, token])

    const fetchAssignments = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/teachers/assignments/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setAssignments(data.assignments || [])
            } else {
                // No assignments available
                console.log('No assignments data available from API')
                setAssignments([])
            }
        } catch (error) {
            console.error('Error fetching assignments:', error)
            setAssignments([])
            toast.error('Unable to load assignments. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/teachers/courses/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setCourses(data.courses || [])
            }
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!assignmentForm.title || !assignmentForm.course_id || !assignmentForm.due_date) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const formData = new FormData()
            formData.append('title', assignmentForm.title)
            formData.append('description', assignmentForm.description)
            formData.append('course_id', assignmentForm.course_id)
            formData.append('due_date', assignmentForm.due_date)
            formData.append('max_points', assignmentForm.max_points.toString())
            formData.append('assignment_type', assignmentForm.assignment_type)

            const response = await fetch('http://localhost:8000/api/teachers/assignments/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                },
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                toast.success('Assignment created successfully!')
                setShowCreateModal(false)
                setAssignmentForm({
                    title: '',
                    description: '',
                    course_id: '',
                    due_date: '',
                    max_points: 100,
                    assignment_type: 'homework',
                    instructions: '',
                    attachments: []
                })
                fetchAssignments()
            } else {
                toast.error('Failed to create assignment')
            }
        } catch (error) {
            console.error('Error creating assignment:', error)
            toast.error('Error creating assignment')
        }
    }

    const handleDeleteAssignment = async (assignmentId: number) => {
        if (!confirm('Are you sure you want to delete this assignment?')) {
            return
        }

        try {
            const response = await fetch(`http://localhost:8000/api/teachers/assignments/${assignmentId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                toast.success('Assignment deleted successfully')
                fetchAssignments()
            } else {
                toast.error('Failed to delete assignment')
            }
        } catch (error) {
            console.error('Error deleting assignment:', error)
            toast.error('Error deleting assignment')
        }
    }

    const filteredAssignments = assignments.filter(assignment => {
        const matchesFilter = selectedFilter === 'all' || assignment.status === selectedFilter
        const matchesCourse = selectedCourse === 'all' || assignment.course_id.toString() === selectedCourse
        return matchesFilter && matchesCourse
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return '#059669'
            case 'draft':
                return '#d97706'
            case 'closed':
                return '#dc2626'
            default:
                return '#6b7280'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'exam':
                return '#dc2626'
            case 'quiz':
                return '#7c3aed'
            case 'project':
                return '#059669'
            case 'homework':
                return '#3b82f6'
            default:
                return '#6b7280'
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
                    Loading assignments...
                </div>
            </div>
        )
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                    }}>
                        📝 Assignment Management
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        Create, manage, and track student assignments
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                    ➕ Create Assignment
                </button>
            </div>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem'}}>
                        {assignments.length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Total Assignments
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#059669', marginBottom: '0.5rem'}}>
                        {assignments.filter(a => a.status === 'published').length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Published
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#d97706', marginBottom: '0.5rem'}}>
                        {assignments.filter(a => a.status === 'draft').length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Drafts
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.5rem'}}>
                        {assignments.reduce((sum, a) => sum + a.submissions_count, 0)}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Total Submissions
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.4}}
                style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    marginBottom: '2rem'
                }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <div>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                            Filter by Status
                        </label>
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">All Assignments</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                            Filter by Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title} ({course.code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Assignments List */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.5}}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#f9fafb'
                }}>
                    <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
                        Assignments ({filteredAssignments.length})
                    </h3>
                </div>

                {filteredAssignments.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📝</div>
                        <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                            No Assignments Yet
                        </h3>
                        <p style={{
                            fontSize: '1rem',
                            marginBottom: '2rem',
                            maxWidth: '600px',
                            margin: '0 auto 2rem auto'
                        }}>
                            Create your first assignment to get started with student assessments and track their
                            progress.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >
                            ➕ Create First Assignment
                        </button>
                    </div>
                ) : (
                    <div style={{padding: '1rem'}}>
                        {filteredAssignments.map((assignment, index) => (
                            <motion.div
                                key={assignment.id}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.05}}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.5rem',
                                    marginBottom: '1rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <div style={{flex: 1}}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <h4 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            margin: 0
                                        }}>
                                            {assignment.title}
                                        </h4>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: `${getTypeColor(assignment.assignment_type)}20`,
                                            color: getTypeColor(assignment.assignment_type),
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'capitalize'
                                        }}>
                                            {assignment.assignment_type}
                                        </span>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: `${getStatusColor(assignment.status)}20`,
                                            color: getStatusColor(assignment.status),
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'capitalize'
                                        }}>
                                            {assignment.status}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: '#6b7280',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {assignment.course_title} •
                                        Due: {new Date(assignment.due_date).toLocaleDateString()} • {assignment.max_points} points
                                    </div>
                                    <div style={{fontSize: '0.8rem', color: '#9ca3af'}}>
                                        {assignment.submissions_count} submissions •
                                        Avg: {assignment.avg_score.toFixed(1)}%
                                    </div>
                                </div>

                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: '#f0f9ff',
                                            color: '#3b82f6',
                                            border: '1px solid #bae6fd',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: '#fef2f2',
                                            color: '#dc2626',
                                            border: '1px solid #fecaca',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Create Assignment Modal */}
            <AnimatePresence>
                {showCreateModal && (
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
                        onClick={() => setShowCreateModal(false)}
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
                            <h2 style={{margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '700'}}>
                                ➕ Create New Assignment
                            </h2>

                            <form onSubmit={handleCreateAssignment}>
                                <div style={{display: 'grid', gap: '1rem', marginBottom: '1rem'}}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            Assignment Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={assignmentForm.title}
                                            onChange={(e) => setAssignmentForm({
                                                ...assignmentForm,
                                                title: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                boxSizing: 'border-box'
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
                                            value={assignmentForm.description}
                                            onChange={(e) => setAssignmentForm({
                                                ...assignmentForm,
                                                description: e.target.value
                                            })}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                resize: 'vertical',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '1rem'
                                    }}>
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
                                                required
                                                value={assignmentForm.course_id}
                                                onChange={(e) => setAssignmentForm({
                                                    ...assignmentForm,
                                                    course_id: e.target.value
                                                })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                <option value="">Select a course</option>
                                                {courses.map(course => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.title} ({course.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Assignment Type
                                            </label>
                                            <select
                                                value={assignmentForm.assignment_type}
                                                onChange={(e) => setAssignmentForm({
                                                    ...assignmentForm,
                                                    assignment_type: e.target.value as any
                                                })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                <option value="homework">Homework</option>
                                                <option value="quiz">Quiz</option>
                                                <option value="exam">Exam</option>
                                                <option value="project">Project</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '1rem'
                                    }}>
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
                                                required
                                                value={assignmentForm.due_date}
                                                onChange={(e) => setAssignmentForm({
                                                    ...assignmentForm,
                                                    due_date: e.target.value
                                                })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    boxSizing: 'border-box'
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
                                                Max Points
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="1000"
                                                value={assignmentForm.max_points}
                                                onChange={(e) => setAssignmentForm({
                                                    ...assignmentForm,
                                                    max_points: parseInt(e.target.value)
                                                })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Create Assignment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AssignmentManagement