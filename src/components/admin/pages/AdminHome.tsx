import React from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'

const AdminHome: React.FC = () => {
    const {user} = useAuth()

    // Demo statistics
    const systemStats = [
        {label: 'Total Users', value: '1,247', color: '#3b82f6', icon: '👥'},
        {label: 'Active Students', value: '956', color: '#10b981', icon: '🎓'},
        {label: 'Teachers', value: '87', color: '#f59e0b', icon: '👨‍🏫'},
        {label: 'Pending Approvals', value: '12', color: '#ef4444', icon: '⏳'}
    ]

    const recentActivity = [
        {action: 'New student registered', user: 'John Smith', time: '2 minutes ago', type: 'registration'},
        {action: 'Teacher approved', user: 'Dr. Lisa Wilson', time: '15 minutes ago', type: 'approval'},
        {action: 'Course completed', user: 'Sarah Johnson', time: '1 hour ago', type: 'completion'},
        {action: 'New teacher application', user: 'Michael Brown', time: '2 hours ago', type: 'application'}
    ]

    const systemHealth = [
        {metric: 'Server Uptime', value: '99.9%', status: 'excellent'},
        {metric: 'Database Performance', value: '98.5%', status: 'good'},
        {metric: 'API Response Time', value: '145ms', status: 'excellent'},
        {metric: 'Active Sessions', value: '234', status: 'normal'}
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
                        {recentActivity.map((activity, index) => (
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
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div style={{flex: 1}}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '0.2rem'
                                    }}>
                                        {activity.action}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: '#6b7280'
                                    }}>
                                        {activity.user} • {activity.time}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
                            🔧 System Health
                        </h3>
                    </div>

                    <div style={{padding: '1rem'}}>
                        {systemHealth.map((health, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 0',
                                borderBottom: index < systemHealth.length - 1 ? '1px solid #f3f4f6' : 'none'
                            }}>
                                <div style={{fontSize: '0.9rem', color: '#374151', fontWeight: '500'}}>
                                    {health.metric}
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: getStatusColor(health.status)
                                }}>
                                    {health.value}
                                </div>
                            </div>
                        ))}
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
                        <div><strong>Approve Teachers:</strong> Review pending teacher applications and manage
                            approvals.
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