import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import toast from 'react-hot-toast'

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
    is_active: boolean
}

const CourseManagement: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/teachers/courses/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const data = await response.json()
                setCourses(data.courses || [])
            } else {
                toast.error('Failed to fetch courses')
            }
        } catch (error) {
            console.error('Error fetching courses:', error)
            toast.error('Error fetching courses')
        } finally {
            setLoading(false)
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
        <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            {/* Header */}
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                style={{marginBottom: '2rem'}}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    📚 Course Management
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Manage your courses and track enrollment
                </p>
            </motion.div>

            {/* Statistics */}
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
                        {courses.length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Total Courses
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
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem'}}>
                        {courses.filter(c => c.is_active).length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Active Courses
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
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem'}}>
                        {courses.reduce((sum, c) => sum + c.enrolled_students, 0)}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Total Enrollments
                    </div>
                </motion.div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px'
                }}>
                    <div style={{fontSize: '1.2rem', color: '#6b7280'}}>
                        Loading courses...
                    </div>
                </div>
            ) : courses.length === 0 ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px'
                }}>
                    <div style={{fontSize: '1.2rem', color: '#6b7280'}}>
                        No courses found
                    </div>
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
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.1}}
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
                                background: course.is_active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6b7280',
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
                                <div style={{fontSize: '0.9rem', opacity: 0.9}}>
                                    {course.code} • {course.credits} Credits
                                </div>
                            </div>

                            {/* Course Body */}
                            <div style={{padding: '1.5rem'}}>
                                <p style={{
                                    margin: '0 0 1rem 0',
                                    color: '#6b7280',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5
                                }}>
                                    {course.description || 'No description available'}
                                </p>

                                {/* Enrollment Progress */}
                                <div style={{marginBottom: '1rem'}}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{fontSize: '0.8rem', color: '#6b7280', fontWeight: '500'}}>
                                            Enrollment
                                        </span>
                                        <span style={{fontSize: '0.8rem', fontWeight: '600', color: '#1f2937'}}>
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
                                        }}/>
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
                                        <div style={{fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem'}}>
                                            Start Date
                                        </div>
                                        <div style={{fontSize: '0.875rem', fontWeight: '500', color: '#1f2937'}}>
                                            {new Date(course.start_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem'}}>
                                            End Date
                                        </div>
                                        <div style={{fontSize: '0.875rem', fontWeight: '500', color: '#1f2937'}}>
                                            {new Date(course.end_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: course.is_active ? '#dcfce7' : '#f3f4f6',
                                        color: course.is_active ? '#166534' : '#6b7280',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {course.is_active ? '✅ Active' : '⏸️ Inactive'}
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
        </div>
    )
}

export default CourseManagement