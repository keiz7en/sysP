import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {enrollmentAPI} from '../../../services/api'
import toast from 'react-hot-toast'
import {getCourseByCode, CourseSyllabus as StandardSyllabus, CourseUnit} from '../../../data/courseSyllabi'

interface Course {
    id: number
    title: string
    code: string
    description: string
    credits: number
    difficulty_level: string
    instructor_name: string
    current_enrollments: number
    enrollment_limit: number
    is_enrolled: boolean
    is_full: boolean
    can_enroll: boolean
    start_date: string | null
    end_date: string | null
}

interface Enrollment {
    id: number
    course_title: string
    course_code: string
    instructor_name: string
    progress_percentage: number
    enrollment_date: string
    status: string
    course_id: number
    credits: number
    difficulty_level: string
}

interface CourseSyllabus {
    course_title: string
    course_code: string
    course_id: number
    credits: number
    level: string
    units: CourseUnit[]
    description: string
}

const StudentCourses: React.FC = () => {
    const {token} = useAuth()
    const [activeTab, setActiveTab] = useState<'browse' | 'enrolled'>('enrolled')
    const [loading, setLoading] = useState(false)
    const [enrolling, setEnrolling] = useState<number | null>(null)
    const [availableCourses, setAvailableCourses] = useState<Course[]>([])
    const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([])
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [selectedSyllabus, setSelectedSyllabus] = useState<CourseSyllabus | null>(null)
    const [loadingSyllabus, setLoadingSyllabus] = useState(false)
    const [filterLevel, setFilterLevel] = useState<string>('all')

    useEffect(() => {
        if (token) {
            fetchCourses()
            fetchEnrollments()
        }
    }, [token])

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/students/courses/available/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setAvailableCourses(data.available_courses || [])
            } else {
                console.error('Failed to fetch courses')
            }
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEnrollments = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/students/dashboard/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setEnrolledCourses(data.current_enrollments || [])
            }
        } catch (error) {
            console.error('Error fetching enrollments:', error)
        }
    }

    const getDifficultyColor = (level: string) => {
        switch (level?.toLowerCase()) {
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

    const filteredCourses = availableCourses.filter(course => {
        if (filterLevel === 'all') return true
        return course.difficulty_level.toLowerCase() === filterLevel.toLowerCase()
    })

    const handleEnrollRequest = async (courseId: number) => {
        if (!token) return

        setEnrolling(courseId)
        try {
            await enrollmentAPI.requestEnrollment(token, courseId)
            toast.success('Enrollment request sent! Waiting for teacher approval.')
            fetchCourses() // Refresh course list
        } catch (error: any) {
            toast.error(error.message || 'Failed to request enrollment')
        } finally {
            setEnrolling(null)
        }
    }

    const fetchSyllabus = async (courseId: number) => {
        try {
            setLoadingSyllabus(true)

            // Find the enrolled course to get its course code
            const enrolledCourse = enrolledCourses.find(c => c.course_id === courseId)

            if (enrolledCourse) {
                const syllabus = getCourseByCode(enrolledCourse.course_code)

                if (syllabus) {
                    setSelectedSyllabus({
                        course_title: syllabus.title,
                        course_code: syllabus.code,
                        course_id: courseId,
                        credits: syllabus.credits,
                        level: syllabus.level,
                        units: syllabus.units,
                        description: `A comprehensive ${syllabus.level.toLowerCase()}-level course covering ${syllabus.units.length} major topics in ${syllabus.title}.`
                    })
                } else {
                    toast.error('Syllabus not found for this course')
                }
            }
        } catch (error) {
            console.error('Error loading syllabus:', error)
            toast.error('Failed to load syllabus')
        } finally {
            setLoadingSyllabus(false)
        }
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    📚 My Courses
                </h1>
                <p style={{color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem'}}>
                    Browse available courses and track your enrollment progress
                </p>

                {/* Stats Cards */}
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
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {enrolledCourses.length}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>
                            Enrolled Courses
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.1}}
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)'
                        }}
                    >
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {availableCourses.length}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>
                            Available Courses
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.2}}
                        style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                        }}
                    >
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {enrolledCourses.reduce((sum, c) => sum + (c.credits || 0), 0)}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>
                            Total Credits
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.3}}
                        style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(250, 112, 154, 0.4)'
                        }}
                    >
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {enrolledCourses.length > 0
                                ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress_percentage, 0) / enrolledCourses.length)
                                : 0}%
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>
                            Avg. Progress
                        </div>
                    </motion.div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        style={{
                            padding: '1rem 2rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: activeTab === 'enrolled' ? '#6366f1' : '#6b7280',
                            borderBottom: activeTab === 'enrolled' ? '3px solid #6366f1' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        📖 My Enrolled Courses ({enrolledCourses.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('browse')}
                        style={{
                            padding: '1rem 2rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: activeTab === 'browse' ? '#6366f1' : '#6b7280',
                            borderBottom: activeTab === 'browse' ? '3px solid #6366f1' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        🔍 Browse All Courses ({availableCourses.length})
                    </button>
                </div>

                {/* Filter for Browse Tab */}
                {activeTab === 'browse' && (
                    <div style={{marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
                        <span style={{fontWeight: '600', color: '#374151'}}>Filter by Level:</span>
                        {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                            <button
                                key={level}
                                onClick={() => setFilterLevel(level)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '20px',
                                    border: filterLevel === level ? '2px solid #6366f1' : '1px solid #d1d5db',
                                    background: filterLevel === level ? '#eef2ff' : 'white',
                                    color: filterLevel === level ? '#6366f1' : '#6b7280',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div style={{textAlign: 'center', padding: '4rem'}}>
                        <div style={{
                            display: 'inline-block',
                            width: '50px',
                            height: '50px',
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #6366f1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}/>
                        <p style={{marginTop: '1rem', color: '#6b7280'}}>Loading courses...</p>
                    </div>
                ) : (
                    <>
                        {/* Enrolled Courses Tab */}
                        {activeTab === 'enrolled' && (
                            <div>
                                {enrolledCourses.length === 0 ? (
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        style={{
                                            textAlign: 'center',
                                            padding: '4rem',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '16px',
                                            border: '2px dashed #d1d5db'
                                        }}
                                    >
                                        <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📚</div>
                                        <h3 style={{fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem'}}>
                                            No Courses Enrolled Yet
                                        </h3>
                                        <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                                            Your teachers will enroll you in courses. Check back soon!
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('browse')}
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
                                            Browse Available Courses
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {enrolledCourses.map((enrollment, index) => (
                                            <motion.div
                                                key={enrollment.id}
                                                initial={{opacity: 0, y: 20}}
                                                animate={{opacity: 1, y: 0}}
                                                transition={{delay: index * 0.1}}
                                                style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    border: '1px solid #e5e7eb'
                                                }}
                                            >
                                                {/* Course Header */}
                                                <div style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                                            fontSize: '1.3rem',
                                                            fontWeight: '600',
                                                            lineHeight: 1.3
                                                        }}>
                                                            {enrollment.course_title}
                                                        </h3>
                                                        <span style={{
                                                            padding: '0.25rem 0.6rem',
                                                            backgroundColor: getDifficultyColor(enrollment.difficulty_level),
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {enrollment.difficulty_level}
                                                        </span>
                                                    </div>
                                                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>
                                                        {enrollment.course_code} • {enrollment.credits} Credits
                                                    </div>
                                                </div>

                                                {/* Course Body */}
                                                <div style={{padding: '1.5rem'}}>
                                                    <div style={{marginBottom: '1rem'}}>
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            color: '#6b7280',
                                                            fontWeight: '500'
                                                        }}>
                                                            👨‍🏫 Instructor: <strong style={{color: '#374151'}}>
                                                            {enrollment.instructor_name}
                                                        </strong>
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div style={{marginBottom: '1rem'}}>
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            <span style={{
                                                                fontSize: '0.85rem',
                                                                color: '#6b7280',
                                                                fontWeight: '500'
                                                            }}>
                                                                Progress
                                                            </span>
                                                            <span style={{
                                                                fontSize: '0.85rem',
                                                                fontWeight: '700',
                                                                color: '#6366f1'
                                                            }}>
                                                                {Math.round(enrollment.progress_percentage)}%
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            width: '100%',
                                                            height: '10px',
                                                            backgroundColor: '#e5e7eb',
                                                            borderRadius: '5px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <motion.div
                                                                initial={{width: 0}}
                                                                animate={{width: `${enrollment.progress_percentage}%`}}
                                                                transition={{duration: 1, delay: index * 0.2}}
                                                                style={{
                                                                    height: '100%',
                                                                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Enrollment Date */}
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        color: '#6b7280',
                                                        marginBottom: '1rem'
                                                    }}>
                                                        📅
                                                        Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                    </div>

                                                    {/* Action Button */}
                                                    <button
                                                        onClick={() => fetchSyllabus(enrollment.course_id)}
                                                        disabled={loadingSyllabus}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.875rem',
                                                            backgroundColor: loadingSyllabus ? '#9ca3af' : '#6366f1',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            fontWeight: '600',
                                                            cursor: loadingSyllabus ? 'wait' : 'pointer',
                                                            fontSize: '0.95rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!loadingSyllabus) {
                                                                e.currentTarget.style.backgroundColor = '#4f46e5'
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!loadingSyllabus) {
                                                                e.currentTarget.style.backgroundColor = '#6366f1'
                                                            }
                                                        }}
                                                    >
                                                        {loadingSyllabus ? '⏳ Loading Syllabus...' : '📚 View Course Syllabus →'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Browse All Courses Tab */}
                        {activeTab === 'browse' && (
                            <div>
                                {filteredCourses.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '4rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '16px'
                                    }}>
                                        <p style={{color: '#6b7280', fontSize: '1.1rem'}}>
                                            No courses found for this filter.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {filteredCourses.map((course, index) => (
                                            <motion.div
                                                key={course.id}
                                                initial={{opacity: 0, y: 20}}
                                                animate={{opacity: 1, y: 0}}
                                                transition={{delay: index * 0.1}}
                                                style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    border: course.is_enrolled ? '2px solid #10b981' : '1px solid #e5e7eb',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Enrollment Badge */}
                                                {course.is_enrolled && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '1rem',
                                                        right: '1rem',
                                                        backgroundColor: '#10b981',
                                                        color: 'white',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        zIndex: 10
                                                    }}>
                                                        ✓ ENROLLED
                                                    </div>
                                                )}

                                                {/* Course Header */}
                                                <div style={{
                                                    padding: '1.5rem',
                                                    background: course.is_full
                                                        ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                                            fontSize: '1.3rem',
                                                            fontWeight: '600',
                                                            lineHeight: 1.3,
                                                            flex: 1
                                                        }}>
                                                            {course.title}
                                                        </h3>
                                                        {!course.is_enrolled && (
                                                            <span style={{
                                                                padding: '0.25rem 0.6rem',
                                                                backgroundColor: getDifficultyColor(course.difficulty_level),
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                textTransform: 'capitalize',
                                                                marginLeft: '0.5rem'
                                                            }}>
                                                                {course.difficulty_level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>
                                                        {course.code} • {course.credits} Credits
                                                    </div>
                                                </div>

                                                {/* Course Body */}
                                                <div style={{padding: '1.5rem'}}>
                                                    <p style={{
                                                        color: '#6b7280',
                                                        fontSize: '0.9rem',
                                                        lineHeight: 1.6,
                                                        marginBottom: '1rem'
                                                    }}>
                                                        {course.description}
                                                    </p>

                                                    <div style={{marginBottom: '1rem'}}>
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            color: '#6b7280',
                                                            fontWeight: '500'
                                                        }}>
                                                            👨‍🏫 <strong style={{color: '#374151'}}>
                                                            {course.instructor_name}
                                                        </strong>
                                                        </span>
                                                    </div>

                                                    {/* Enrollment Info */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '1rem',
                                                        padding: '0.75rem',
                                                        backgroundColor: '#f9fafb',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <span style={{fontSize: '0.85rem', color: '#6b7280'}}>
                                                            Enrollment
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            fontWeight: '700',
                                                            color: course.is_full ? '#ef4444' : '#6366f1'
                                                        }}>
                                                            {course.current_enrollments}/{course.enrollment_limit}
                                                        </span>
                                                    </div>

                                                    {/* View Details Button */}
                                                    {course.is_enrolled ? (
                                                        <button
                                                            onClick={() => setSelectedCourse(course)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.875rem',
                                                                backgroundColor: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '10px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                fontSize: '0.95rem',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                                        >
                                                            View Course Details
                                                        </button>
                                                    ) : course.is_full ? (
                                                        <button
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.875rem',
                                                                backgroundColor: '#6b7280',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '10px',
                                                                fontWeight: '600',
                                                                cursor: 'not-allowed',
                                                                fontSize: '0.95rem'
                                                            }}
                                                            disabled
                                                        >
                                                            🔒 Course Full
                                                        </button>
                                                    ) : !course.instructor_name || course.instructor_name.trim() === '' || course.instructor_name === 'TBD' || course.instructor_name === 'No instructor' ? (
                                                        <div style={{
                                                            width: '100%',
                                                            padding: '0.875rem',
                                                            backgroundColor: '#fef3c7',
                                                            color: '#92400e',
                                                            border: '1px solid #fbbf24',
                                                            borderRadius: '10px',
                                                            fontWeight: '600',
                                                            fontSize: '0.85rem',
                                                            textAlign: 'center',
                                                            lineHeight: 1.5
                                                        }}>
                                                            <div style={{
                                                                marginBottom: '0.25rem',
                                                                fontSize: '1.2rem'
                                                            }}>👨‍🏫
                                                            </div>
                                                            <div style={{marginBottom: '0.25rem'}}>No Teacher Assigned
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: '500',
                                                                opacity: 0.9
                                                            }}>
                                                                If teacher available we will notify you
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEnrollRequest(course.id)}
                                                            disabled={enrolling === course.id}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.875rem',
                                                                backgroundColor: enrolling === course.id ? '#9ca3af' : '#6366f1',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '10px',
                                                                fontWeight: '600',
                                                                cursor: enrolling === course.id ? 'wait' : 'pointer',
                                                                fontSize: '0.95rem',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (enrolling !== course.id) {
                                                                    e.currentTarget.style.backgroundColor = '#4f46e5'
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (enrolling !== course.id) {
                                                                    e.currentTarget.style.backgroundColor = '#6366f1'
                                                                }
                                                            }}
                                                        >
                                                            {enrolling === course.id ? '⏳ Requesting...' : '📝 Request Enrollment'}
                                                        </button>
                                                    )}

                                                    {!course.is_enrolled && !course.is_full && course.instructor_name && course.instructor_name.trim() !== '' && course.instructor_name !== 'TBD' && course.instructor_name !== 'No instructor' && (
                                                        <p style={{
                                                            marginTop: '0.75rem',
                                                            fontSize: '0.8rem',
                                                            color: '#6b7280',
                                                            textAlign: 'center'
                                                        }}>
                                                            💡 Teacher will review your request
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Course Details Modal */}
            <AnimatePresence>
                {selectedCourse && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={() => setSelectedCourse(null)}
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
                            initial={{scale: 0.9, y: 20}}
                            animate={{scale: 1, y: 0}}
                            exit={{scale: 0.9, y: 20}}
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
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1.5rem'
                            }}>
                                <div>
                                    <h2 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1.8rem',
                                        color: '#1f2937'
                                    }}>
                                        {selectedCourse.title}
                                    </h2>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        color: '#6b7280',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {selectedCourse.code} • {selectedCourse.credits} Credits
                                    </div>
                                    <span style={{
                                        padding: '0.3rem 0.7rem',
                                        backgroundColor: `${getDifficultyColor(selectedCourse.difficulty_level)}20`,
                                        color: getDifficultyColor(selectedCourse.difficulty_level),
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {selectedCourse.difficulty_level}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedCourse(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: '0.5rem'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151'
                                }}>
                                    Course Description
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    lineHeight: 1.7,
                                    fontSize: '0.95rem'
                                }}>
                                    {selectedCourse.description}
                                </p>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151'
                                }}>
                                    Course Details
                                </h3>
                                <div style={{display: 'grid', gap: '0.75rem'}}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{color: '#6b7280'}}>👨‍🏫 Instructor</span>
                                        <span style={{fontWeight: '600', color: '#374151'}}>
                                            {selectedCourse.instructor_name}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{color: '#6b7280'}}>📊 Enrollment</span>
                                        <span style={{
                                            fontWeight: '600',
                                            color: selectedCourse.is_full ? '#ef4444' : '#10b981'
                                        }}>
                                            {selectedCourse.current_enrollments}/{selectedCourse.enrollment_limit}
                                        </span>
                                    </div>
                                    {selectedCourse.start_date && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px'
                                        }}>
                                            <span style={{color: '#6b7280'}}>📅 Duration</span>
                                            <span style={{fontWeight: '600', color: '#374151'}}>
                                                {new Date(selectedCourse.start_date).toLocaleDateString()} - {' '}
                                                {selectedCourse.end_date ? new Date(selectedCourse.end_date).toLocaleDateString() : 'TBD'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedCourse.is_enrolled ? (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: '#d1fae5',
                                    borderRadius: '10px',
                                    border: '1px solid #a7f3d0',
                                    color: '#065f46',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    ✓ You are enrolled in this course
                                </div>
                            ) : selectedCourse.is_full ? (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: '#fee2e2',
                                    borderRadius: '10px',
                                    border: '1px solid #fecaca',
                                    color: '#991b1b',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    🔒 This course is currently full
                                </div>
                            ) : (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: '#dbeafe',
                                    borderRadius: '10px',
                                    border: '1px solid #bfdbfe',
                                    color: '#1e40af',
                                    textAlign: 'center'
                                }}>
                                    <p style={{margin: '0 0 0.5rem 0', fontWeight: '600'}}>
                                        Interested in this course?
                                    </p>
                                    <p style={{margin: 0, fontSize: '0.9rem'}}>
                                        Contact your teacher or advisor to enroll
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Course Syllabus Modal */}
            <AnimatePresence>
                {selectedSyllabus && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={() => setSelectedSyllabus(null)}
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
                            initial={{scale: 0.9, y: 20}}
                            animate={{scale: 1, y: 0}}
                            exit={{scale: 0.9, y: 20}}
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
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1.5rem'
                            }}>
                                <div>
                                    <h2 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1.8rem',
                                        color: '#1f2937'
                                    }}>
                                        {selectedSyllabus.course_title}
                                    </h2>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        color: '#6b7280',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {selectedSyllabus.course_code} • {selectedSyllabus.credits} Credits
                                    </div>
                                    <span style={{
                                        padding: '0.3rem 0.7rem',
                                        backgroundColor: `${getDifficultyColor(selectedSyllabus.level)}20`,
                                        color: getDifficultyColor(selectedSyllabus.level),
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {selectedSyllabus.level}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedSyllabus(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: '0.5rem'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151'
                                }}>
                                    Course Syllabus
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    lineHeight: 1.7,
                                    fontSize: '0.95rem'
                                }}>
                                    {selectedSyllabus.description}
                                </p>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    📑 Standardized Course Units
                                </h3>
                                <div style={{display: 'grid', gap: '0.75rem'}}>
                                    {selectedSyllabus.units.map((unit, index) => (
                                        <div key={index} style={{
                                            padding: '1rem',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '10px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '30px',
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.95rem',
                                                    fontWeight: '700',
                                                    flexShrink: 0
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <div style={{flex: 1}}>
                                                    <div style={{
                                                        color: '#374151',
                                                        fontWeight: '700',
                                                        fontSize: '1rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        {unit.title}
                                                    </div>
                                                    <ul style={{
                                                        margin: 0,
                                                        paddingLeft: '1.2em',
                                                        color: '#6b7280',
                                                        fontSize: '0.95rem'
                                                    }}>
                                                        {unit.topics.map((topic, i) => (
                                                            <li key={i} style={{
                                                                marginBottom: '0.3em',
                                                                lineHeight: 1.6
                                                            }}>{topic}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#eff6ff',
                                borderRadius: '10px',
                                border: '1px solid #bfdbfe',
                                color: '#1e40af',
                                fontSize: '0.85rem',
                                textAlign: 'center'
                            }}>
                                💡 This syllabus is standardized for this course. Instructors may make minor adjustments.
                            </div>
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

export default StudentCourses
