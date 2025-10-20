import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import toast from 'react-hot-toast'
import {useAuth} from '../../../contexts/AuthContext'
import {getTeacherDashboard} from '../../../services/api'

interface DashboardData {
    teacher_info: {
        name: string
        employee_id: string
        department: string
        experience_years: number
        teaching_rating: number
    }
    statistics: {
        total_courses: number
        total_students: number
        active_students: number
        completion_rate: number
    }
    recent_enrollments: Array<{
        student_name: string
        student_id: string
        course_title: string
        enrollment_date: string
        progress: number
    }>
}

const TeacherHome: React.FC = () => {
    const {user, token} = useAuth()
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && token) {
            fetchDashboardData()
        }
    }, [user, token])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!token) {
                setError('Authentication required')
                return
            }

            const data = await getTeacherDashboard(token)
            setDashboardData(data)
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error)
            const errorMessage = error.message || 'Error loading dashboard'

            if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
                setError('Access denied. Your teacher account may be pending approval or not activated.')
            } else if (errorMessage.includes('404')) {
                setError('Teacher profile not found. Please contact administrator.')
            } else {
                setError(errorMessage)
            }
        } finally {
            setLoading(false)
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
                    Loading dashboard...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '500px',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem', color: '#ef4444'}}>⚠️</div>
                <p style={{fontSize: '1.2rem', color: '#ef4444', marginBottom: '2rem', maxWidth: '600px'}}>{error}</p>

                {error.includes('pending approval') && (
                    <div style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        maxWidth: '500px'
                    }}>
                        <div style={{fontWeight: '600', marginBottom: '0.5rem'}}>⏳ Teacher Account Pending Approval
                        </div>
                        <p style={{margin: 0, fontSize: '0.9rem'}}>
                            Your teacher application is being reviewed by administrators. You will be notified once
                            approved and can access the teaching dashboard.
                        </p>
                    </div>
                )}

                <button
                    onClick={fetchDashboardData}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (!dashboardData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>
                    No dashboard data available
                </div>
            </div>
        )
    }

    // Check if teacher has no courses/students (empty state)
    const hasNoData = dashboardData.statistics.total_courses === 0 && dashboardData.statistics.total_students === 0;

    return (
        <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            {/* Welcome Header */}
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
                    Welcome back, {dashboardData.teacher_info.name}! 👨‍🏫
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    {hasNoData ? 'Ready to start teaching!' : 'Here\'s your teaching dashboard overview'}
                </p>
            </motion.div>

            {/* Teacher Profile Card */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1}}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                }}
            >
                <div
                    style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem'}}>
                    <div>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                            👨‍🏫 Teacher Information
                        </h3>
                        <p style={{margin: 0, opacity: 0.9}}>
                            Employee ID: {dashboardData.teacher_info.employee_id}
                        </p>
                        <p style={{margin: 0, opacity: 0.9}}>
                            Department: {dashboardData.teacher_info.department}
                        </p>
                    </div>
                    <div>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                            📊 Teaching Profile
                        </h3>
                        <p style={{margin: 0, opacity: 0.9}}>
                            Experience: {dashboardData.teacher_info.experience_years} years
                        </p>
                        <p style={{margin: 0, opacity: 0.9}}>
                            Rating: {dashboardData.teacher_info.teaching_rating.toFixed(1)}/5.0 ⭐
                        </p>
                    </div>
                </div>
            </motion.div>

            {hasNoData ? (
                // Empty State for New Teachers
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        padding: '3rem',
                        textAlign: 'center'
                    }}
                >
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🚀</div>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                        Ready to Start Teaching!
                    </h3>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        Welcome to your teaching dashboard! You don't have any courses or students yet, but you can get
                        started by managing students and creating courses.
                    </p>

                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        textAlign: 'left'
                    }}>
                        <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem'}}>
                            Getting Started:
                        </h4>
                        <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Use "Student Management" to add students to your
                                courses</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Create and manage course content and materials</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Set up assessments and track student progress</p>
                            <p style={{margin: '0'}}>• Access AI-powered teaching analytics and insights</p>
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                        <button
                            onClick={() => window.location.href = '/teacher/students'}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            👥 Manage Students
                        </button>
                        <button
                            onClick={() => window.location.href = '/teacher/courses'}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            📚 View Courses
                        </button>
                    </div>
                </motion.div>
            ) : (
                // Dashboard with Data
                <>
                    {/* Statistics Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
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
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#3b82f6',
                                marginBottom: '0.5rem'
                            }}>
                                {dashboardData.statistics.total_courses}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                📚 Total Courses
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
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#10b981',
                                marginBottom: '0.5rem'
                            }}>
                                {dashboardData.statistics.total_students}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                👥 Total Students
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.4}}
                            style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#f59e0b',
                                marginBottom: '0.5rem'
                            }}>
                                {dashboardData.statistics.active_students}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                ✅ Active Students
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.5}}
                            style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#8b5cf6',
                                marginBottom: '0.5rem'
                            }}>
                                {dashboardData.statistics.completion_rate.toFixed(1)}%
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                🎯 Completion Rate
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Enrollments */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.6}}
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden',
                            marginBottom: '2rem'
                        }}
                    >
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            background: '#f9fafb'
                        }}>
                            <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
                                📝 Recent Student Enrollments
                            </h3>
                        </div>

                        {dashboardData.recent_enrollments.length === 0 ? (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                color: '#6b7280'
                            }}>
                                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📚</div>
                                <p>No recent enrollments</p>
                                <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>
                                    Student enrollments will appear here when they join your courses
                                </p>
                            </div>
                        ) : (
                            <div style={{padding: '1rem'}}>
                                {dashboardData.recent_enrollments.map((enrollment, index) => (
                                    <motion.div
                                        key={`${enrollment.student_id}-${index}`}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: 0.7 + (index * 0.1)}}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem',
                                            marginBottom: '0.5rem',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{flex: 1}}>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {enrollment.student_name}
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: '#6b7280'
                                            }}>
                                                ID: {enrollment.student_id} • {enrollment.course_title}
                                            </div>
                                        </div>

                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontSize: '0.8rem', color: '#6b7280'}}>
                                                    Progress
                                                </div>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    color: '#3b82f6'
                                                }}>
                                                    {enrollment.progress.toFixed(0)}%
                                                </div>
                                            </div>

                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontSize: '0.8rem', color: '#6b7280'}}>
                                                    Enrolled
                                                </div>
                                                <div style={{fontSize: '0.8rem', color: '#1f2937'}}>
                                                    {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            {/* Quick Actions */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: hasNoData ? 0.3 : 0.8}}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    padding: '1.5rem'
                }}
            >
                <h3 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937'
                }}>
                    ⚡ Quick Actions
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <button
                        onClick={() => window.location.href = '/teacher/students'}
                        style={{
                            padding: '1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>👥</div>
                        <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>Manage Students</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.9}}>Add, view, and manage students</div>
                    </button>

                    <button
                        onClick={() => window.location.href = '/teacher/courses'}
                        style={{
                            padding: '1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📚</div>
                        <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>View Courses</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.9}}>Manage your course content</div>
                    </button>

                    <button
                        onClick={() => toast.success('Assessment tools coming soon!')}
                        style={{
                            padding: '1rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📝</div>
                        <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>Create Assessment</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.9}}>Design tests and quizzes</div>
                    </button>

                    <button
                        onClick={() => toast.success('Analytics coming soon!')}
                        style={{
                            padding: '1rem',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📊</div>
                        <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>Analytics</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.9}}>View performance reports</div>
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default TeacherHome