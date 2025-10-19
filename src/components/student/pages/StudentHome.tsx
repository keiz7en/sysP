import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../contexts/AuthContext'
import {userAPI} from '../../../services/api'
import toast from 'react-hot-toast'

interface DashboardStats {
    gpa: number;
    courses: number;
    assignments: number;
    study_hours: number;
}

interface RecentActivity {
    time: string;
    activity: string;
    score: string;
}

interface UpcomingTask {
    task: string;
    due: string;
    priority: 'high' | 'medium' | 'low';
    course: string;
}

interface DashboardData {
    stats: DashboardStats;
    recent_activity: RecentActivity[];
    upcoming_tasks: UpcomingTask[];
}

const StudentHome: React.FC = () => {
    const { user, token } = useAuth()
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

            const response = await fetch('http://localhost:8000/api/users/dashboard/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                if (response.status === 403) {
                    const errorData = await response.json()
                    if (errorData.approval_status === 'pending') {
                        setError('Your student account is pending approval from teachers/administrators. You will be notified when approved.')
                        return
                    } else if (errorData.approval_status === 'rejected') {
                        setError('Your student account has been rejected. Please contact administrator for more information.')
                        return
                    }
                }
                throw new Error('Failed to fetch dashboard data')
            }

            const data = await response.json()
            setDashboardData(data)

        } catch (err: any) {
            console.error('Dashboard fetch error:', err)
            setError(err.message || 'Failed to load dashboard data. Please try again.')
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
                height: '400px',
                fontSize: '1.2rem',
                color: '#6b7280'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                    Loading your personalized dashboard...
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
                fontSize: '1.2rem',
                color: '#ef4444',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚠️</div>
                <p style={{marginBottom: '2rem', maxWidth: '600px', lineHeight: '1.6'}}>{error}</p>

                {error.includes('pending approval') && (
                    <div style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        maxWidth: '500px'
                    }}>
                        <div style={{fontWeight: '600', marginBottom: '0.5rem'}}>⏳ Account Status: Pending Approval
                        </div>
                        <p style={{margin: 0, fontSize: '0.9rem'}}>
                            Your student registration has been received. Teachers or administrators will review and
                            approve your account.
                            You will receive an email notification once approved.
                        </p>
                    </div>
                )}

                {error.includes('rejected') && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        maxWidth: '500px'
                    }}>
                        <div style={{fontWeight: '600', marginBottom: '0.5rem'}}>❌ Account Rejected</div>
                        <p style={{margin: 0, fontSize: '0.9rem'}}>
                            Please contact the administrator at admin@eduai.com for more information about your
                            application.
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
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                No dashboard data available
            </div>
        )
    }

    const quickStats = [
        {
            label: 'Current GPA',
            value: dashboardData.stats.gpa.toFixed(1),
            color: '#10b981',
            icon: '📊'
        },
        {
            label: 'Active Courses',
            value: dashboardData.stats.courses.toString(),
            color: '#3b82f6',
            icon: '📚'
        },
        {
            label: 'Assignments',
            value: dashboardData.stats.assignments.toString(),
            color: '#f59e0b',
            icon: '📝'
        },
        {
            label: 'Study Hours',
            value: dashboardData.stats.study_hours.toString(),
            color: '#8b5cf6',
            icon: '⏰'
        }
    ]

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444'
            case 'medium': return '#f59e0b'
            case 'low': return '#10b981'
            default: return '#6b7280'
        }
    }

    const getGPAColor = (gpa: number) => {
        if (gpa >= 3.7) return '#10b981'  // Green for excellent
        if (gpa >= 3.0) return '#f59e0b'  // Yellow for good
        return '#ef4444'  // Red for needs improvement
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}
        >
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    Welcome back, {user?.first_name}!
                    <span style={{ fontSize: '2rem' }}>👋</span>
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Here's your personalized learning dashboard
                </p>
            </motion.div>

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {quickStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '16px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            fontSize: '1.5rem',
                            opacity: 0.3
                        }}>
                            {stat.icon}
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: stat.color,
                            marginBottom: '0.5rem'
                        }}>
                            {stat.value}
                        </div>
                        <div style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            fontWeight: '600'
                        }}>
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                {/* Recent Activities */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📚 Recent Activities
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {dashboardData.recent_activity && dashboardData.recent_activity.length > 0 ? (
                            dashboardData.recent_activity.map((activity, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    style={{
                                        padding: '1.25rem',
                                        background: index % 2 === 0 ? '#f8fafc' : '#f1f5f9',
                                        borderRadius: '12px',
                                        borderLeft: '4px solid #3b82f6',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {activity.activity}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.9rem',
                                        color: '#6b7280'
                                    }}>
                                        <span>{activity.time}</span>
                                        <span style={{
                                            fontWeight: '700',
                                            color: activity.score === 'Pending' ? '#f59e0b' : '#10b981',
                                            background: activity.score === 'Pending' ? '#fef3c7' : '#d1fae5',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {activity.score}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                color: '#6b7280',
                                fontStyle: 'italic'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                                <p>No recent activities yet.</p>
                                <p>Enroll in courses to see your progress here!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Upcoming Tasks */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ⏰ Upcoming Tasks
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {dashboardData.upcoming_tasks && dashboardData.upcoming_tasks.length > 0 ? (
                            dashboardData.upcoming_tasks.map((task, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    style={{
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        borderRadius: '12px',
                                        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {task.task}
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#6b7280',
                                        marginBottom: '0.5rem'
                                    }}>
                                        📖 {task.course}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.8rem'
                                    }}>
                                        <span style={{ color: '#6b7280' }}>
                                            Due: {task.due}
                                        </span>
                                        <span style={{
                                            background: getPriorityColor(task.priority),
                                            color: 'white',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: '#6b7280',
                                fontStyle: 'italic'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                                <p>No upcoming tasks!</p>
                                <p>Check back after enrolling in courses!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* AI-Powered Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '2.5rem',
                    borderRadius: '16px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                }}></div>

                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    🤖 Learning Insights
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {dashboardData.stats.courses > 0 ? (
                        <>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📈</span>
                                    <strong>Performance Analysis:</strong>
                                </div>
                                <p style={{ margin: 0, lineHeight: '1.5' }}>
                                    {dashboardData.stats.gpa >= 3.7
                                        ? "Outstanding academic performance! You're excelling in your studies. Keep up the excellent work!"
                                        : dashboardData.stats.gpa >= 3.0
                                            ? "Good academic progress! Focus on challenging subjects to reach excellence."
                                            : dashboardData.stats.gpa > 0
                                                ? "Your GPA needs attention. Consider connecting with tutors for personalized help."
                                                : "Start taking assessments to see your performance analysis."}
                                </p>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🎯</span>
                                    <strong>Next Steps:</strong>
                                </div>
                                <p style={{ margin: 0, lineHeight: '1.5' }}>
                                    {dashboardData.stats.assignments > 3
                                        ? "You have multiple assignments due. Prioritize by deadline and break large tasks into smaller chunks."
                                        : dashboardData.stats.assignments > 0
                                            ? "Stay on track with your current assignments. Use focused study sessions for better results."
                                            : "Great! No pending assignments. Use this time to review materials or explore additional topics."}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            padding: '2rem',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌟</div>
                            <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>
                                Welcome to Your Learning Journey!
                            </strong>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>
                                Get started by enrolling in courses. Once enrolled, you'll see personalized insights,
                                progress tracking, and adaptive learning recommendations tailored just for you!
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    marginTop: '2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }}
            >
                {[
                    { label: 'Browse Courses', icon: '🎓', color: '#3b82f6' },
                    { label: 'Take Assessment', icon: '✍️', color: '#10b981' },
                    { label: 'Career Guidance', icon: '💼', color: '#8b5cf6' },
                    { label: 'AI Chat Help', icon: '💬', color: '#f59e0b' }
                ].map((action, index) => (
                    <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: 'white',
                            border: `2px solid ${action.color}`,
                            padding: '1rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: action.color
                        }}
                        onClick={() => {
                            // Add navigation logic here
                            console.log(`Navigate to ${action.label}`)
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                        {action.label}
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    )
}

export default StudentHome
