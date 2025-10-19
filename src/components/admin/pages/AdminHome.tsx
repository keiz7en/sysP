import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {adminAPI} from '../../../services/api'
import toast from 'react-hot-toast'

interface DashboardData {
    user: any;
    stats: {
        total_users: number;
        pending_teachers: number;
        pending_students: number;
        students: number;
        teachers: number;
    };
    recent_activity: Array<{
        time: string;
        activity: string;
        score: string;
    }>;
}

const AdminHome: React.FC = () => {
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

            const data = await adminAPI.getDashboard(token)
            setDashboardData(data)
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error)
            const errorMessage = error.message || 'Error loading dashboard'

            if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
                setError('Access denied. Admin privileges required.')
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
                    Loading admin dashboard...
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

    // Real system statistics
    const systemStats = [
        {label: 'Total Users', value: dashboardData.stats.total_users.toString(), color: '#3b82f6', icon: '👥'},
        {label: 'Active Students', value: dashboardData.stats.students.toString(), color: '#10b981', icon: '🎓'},
        {label: 'Teachers', value: dashboardData.stats.teachers.toString(), color: '#f59e0b', icon: '👨‍🏫'},
        {
            label: 'Pending Approvals',
            value: (dashboardData.stats.pending_teachers + dashboardData.stats.pending_students).toString(),
            color: '#ef4444',
            icon: '⏳'
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent':
                return '#10b981'
            case 'good':
                return '#3b82f6'
            case 'warning':
                return '#f59e0b'
            case 'error':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'registration':
                return '✨'
            case 'approval':
                return '✅'
            case 'completion':
                return '🎉'
            case 'application':
                return '📝'
            default:
                return '📌'
        }
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
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
                    Welcome, {user?.first_name}! 👑
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    System administration dashboard and overview
                </p>
            </motion.div>

            {/* System Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {systemStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: index * 0.1}}
                        style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                            <div style={{fontSize: '2rem'}}>{stat.icon}</div>
                            <div>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    color: stat.color,
                                    lineHeight: 1
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    {stat.label}
                                </div>
                            </div>
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
                {/* Recent Activity */}
                <motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.2}}
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
                            📈 Recent System Activity
                        </h3>
                    </div>

                    <div style={{padding: '1rem'}}>
                        {dashboardData.recent_activity && dashboardData.recent_activity.length > 0 ? (
                            dashboardData.recent_activity.map((activity, index) => (
                                <motion.div
                                    key={index}
                                    initial={{opacity: 0, x: -10}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.3 + (index * 0.1)}}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        marginBottom: '0.5rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div style={{fontSize: '1.5rem'}}>
                                        {getActivityIcon('approval')}
                                    </div>
                                    <div style={{flex: 1}}>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            marginBottom: '0.2rem'
                                        }}>
                                            {activity.activity}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: '#6b7280'
                                        }}>
                                            {activity.time}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                color: '#6b7280'
                            }}>
                                <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>📊</div>
                                <p>No recent activity to display</p>
                                <p style={{fontSize: '0.9rem'}}>System activities will appear here</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* System Health */}
                <motion.div
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.3}}
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
                            🔧 System Status
                        </h3>
                    </div>

                    <div style={{padding: '1rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <div style={{fontSize: '0.9rem', color: '#374151', fontWeight: '500'}}>
                                Backend Status
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#10b981'
                            }}>
                                Online
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <div style={{fontSize: '0.9rem', color: '#374151', fontWeight: '500'}}>
                                Database
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#10b981'
                            }}>
                                Connected
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <div style={{fontSize: '0.9rem', color: '#374151', fontWeight: '500'}}>
                                Active Users
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#3b82f6'
                            }}>
                                {dashboardData.stats.students + dashboardData.stats.teachers}
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0'
                        }}>
                            <div style={{fontSize: '0.9rem', color: '#374151', fontWeight: '500'}}>
                                Pending Reviews
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: dashboardData.stats.pending_teachers + dashboardData.stats.pending_students > 0 ? '#f59e0b' : '#10b981'
                            }}>
                                {dashboardData.stats.pending_teachers + dashboardData.stats.pending_students}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.4}}
                style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                    padding: '2rem',
                    borderRadius: '12px',
                    color: 'white'
                }}
            >
                <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'white'
                }}>
                    ⚡ Admin Quick Actions
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <button
                        onClick={() => window.location.href = '/admin/teachers'}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>✅</div>
                        <div><strong>Approve Teachers ({dashboardData.stats.pending_teachers}):</strong> Review pending
                            teacher applications and manage
                            approvals.
                        </div>
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/students'}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🎓</div>
                        <div><strong>Approve Students ({dashboardData.stats.pending_students}):</strong> Review and
                            approve student registrations.
                        </div>
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/users'}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>👥</div>
                        <div><strong>Manage Users:</strong> View, edit, and manage all system users and their
                            permissions.
                        </div>
                    </button>
                    <button
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                        <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📊</div>
                        <div><strong>System Analytics:</strong> Monitor platform usage, performance metrics, and user
                            engagement.
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default AdminHome