import React from 'react'
import {motion} from 'framer-motion'

const StudentHome: React.FC = () => {
    const quickStats = [
        {label: 'Current GPA', value: '3.8', color: '#10b981'},
        {label: 'Courses', value: '6', color: '#3b82f6'},
        {label: 'Assignments Due', value: '3', color: '#f59e0b'},
        {label: 'Study Hours', value: '24', color: '#8b5cf6'}
    ]

    const recentActivities = [
        {time: '2 hours ago', activity: 'Completed Physics Quiz', score: '92%'},
        {time: '1 day ago', activity: 'Submitted Math Assignment', score: 'Pending'},
        {time: '2 days ago', activity: 'AI Career Assessment', score: '85%'},
        {time: '3 days ago', activity: 'Literature Essay Review', score: '88%'}
    ]

    const upcomingTasks = [
        {task: 'Chemistry Lab Report', due: 'Tomorrow', priority: 'high'},
        {task: 'History Presentation', due: '2 days', priority: 'medium'},
        {task: 'English Essay Draft', due: '1 week', priority: 'low'}
    ]

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
            style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}
        >
            {/* Welcome Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    Welcome back! 👋
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Here's your personalized learning dashboard powered by AI
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {quickStats.map((stat, index) => (
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
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: stat.color,
                            marginBottom: '0.5rem'
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
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '2rem',
                '@media (max-width: 1024px)': {
                    gridTemplateColumns: '1fr'
                }
            }}>
                {/* Recent Activities */}
                <motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.2}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem'
                    }}>
                        📚 Recent Activities
                    </h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        {recentActivities.map((activity, index) => (
                            <div key={index} style={{
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                borderLeft: '4px solid #3b82f6'
                            }}>
                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '0.3rem'
                                }}>
                                    {activity.activity}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.8rem',
                                    color: '#6b7280'
                                }}>
                                    <span>{activity.time}</span>
                                    <span style={{
                                        fontWeight: '600',
                                        color: activity.score === 'Pending' ? '#f59e0b' : '#10b981'
                                    }}>
                                        {activity.score}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Upcoming Tasks */}
                <motion.div
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.3}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem'
                    }}>
                        ⏰ Upcoming Tasks
                    </h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                        {upcomingTasks.map((task, index) => (
                            <div key={index} style={{
                                padding: '0.8rem',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                borderLeft: `4px solid ${
                                    task.priority === 'high' ? '#ef4444' :
                                        task.priority === 'medium' ? '#f59e0b' : '#10b981'
                                }`
                            }}>
                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '0.3rem'
                                }}>
                                    {task.task}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280'
                                }}>
                                    Due: {task.due}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* AI Recommendations */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.4}}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '2rem',
                    borderRadius: '12px',
                    marginTop: '2rem',
                    color: 'white'
                }}
            >
                <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'white'
                }}>
                    🤖 AI Recommendations
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '1rem',
                        borderRadius: '8px'
                    }}>
                        <strong>📈 Study Pattern:</strong> Your focus is best between 2-4 PM. Schedule important tasks
                        during this time.
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '1rem',
                        borderRadius: '8px'
                    }}>
                        <strong>📚 Weak Subject:</strong> Consider extra practice in Calculus. Your recent scores suggest
                        review needed.
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '1rem',
                        borderRadius: '8px'
                    }}>
                        <strong>🎯 Career Match:</strong> Based on your interests, explore Data Science opportunities.
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default StudentHome