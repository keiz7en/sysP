import React, {useState} from 'react'
import {motion} from 'framer-motion'

const ResearchInsights: React.FC = () => {
    const [activeTab, setActiveTab] = useState('performance')

    const performanceData = [
        {subject: 'Mathematics', score: 92, trend: 'up', change: '+5%'},
        {subject: 'Physics', score: 87, trend: 'up', change: '+3%'},
        {subject: 'Computer Science', score: 95, trend: 'stable', change: '0%'},
        {subject: 'English', score: 84, trend: 'down', change: '-2%'},
        {subject: 'Chemistry', score: 89, trend: 'up', change: '+7%'}
    ]

    const learningPatterns = [
        {pattern: 'Peak Learning Time', value: '10:00 AM - 12:00 PM', icon: '🕙'},
        {pattern: 'Preferred Learning Style', value: 'Visual & Interactive', icon: '👁️'},
        {pattern: 'Study Session Duration', value: '45-60 minutes optimal', icon: '⏱️'},
        {pattern: 'Best Subject Sequence', value: 'Math → Physics → CS', icon: '🔄'}
    ]

    const recommendations = [
        {
            title: 'Optimize Study Schedule',
            description: 'Your performance peaks during morning hours. Schedule challenging subjects between 10-12 PM.',
            priority: 'high',
            icon: '📅'
        },
        {
            title: 'English Language Focus',
            description: 'Recent decline in English scores. Consider additional reading practice and writing exercises.',
            priority: 'medium',
            icon: '📚'
        },
        {
            title: 'Leverage Visual Learning',
            description: 'Your visual learning preference shows great results. Use more diagrams and mind maps.',
            priority: 'low',
            icon: '🎨'
        }
    ]

    const studyInsights = [
        {metric: 'Total Study Hours', value: '127', period: 'This Month', icon: '📊'},
        {metric: 'Average Session', value: '52 min', period: 'Optimal Range', icon: '⏰'},
        {metric: 'Retention Rate', value: '89%', period: 'Above Average', icon: '🧠'},
        {metric: 'Focus Score', value: '8.3/10', period: 'Excellent', icon: '🎯'}
    ]

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#ef4444'
            case 'medium':
                return '#f59e0b'
            case 'low':
                return '#10b981'
            default:
                return '#6b7280'
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return '📈'
            case 'down':
                return '📉'
            case 'stable':
                return '➡️'
            default:
                return '📊'
        }
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    🔬 Learning Insights
                </h1>
                <p style={{color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem'}}>
                    AI-powered analytics to optimize your learning performance and study habits
                </p>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '2rem',
                    maxWidth: '600px'
                }}>
                    {[
                        {id: 'performance', label: '📈 Performance'},
                        {id: 'patterns', label: '🔍 Learning Patterns'},
                        {id: 'recommendations', label: '💡 Recommendations'}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Study Insights Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {studyInsights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.1}}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>
                                {insight.icon}
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#1f2937',
                                marginBottom: '0.25rem'
                            }}>
                                {insight.value}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                marginBottom: '0.25rem'
                            }}>
                                {insight.metric}
                            </div>
                            <div style={{fontSize: '0.8rem', color: '#10b981'}}>
                                {insight.period}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                >
                    {activeTab === 'performance' && (
                        <div>
                            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                Academic Performance Analysis
                            </h2>
                            <div style={{display: 'grid', gap: '1rem'}}>
                                {performanceData.map((subject, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: index * 0.1}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem'}}>
                                                    {subject.subject}
                                                </h3>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                                    <span style={{fontSize: '1.5rem'}}>
                                                        {getTrendIcon(subject.trend)}
                                                    </span>
                                                    <span style={{
                                                        color: subject.trend === 'up' ? '#10b981' : subject.trend === 'down' ? '#ef4444' : '#6b7280',
                                                        fontWeight: '600'
                                                    }}>
                                                        {subject.change}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '2rem',
                                                fontWeight: '700',
                                                color: '#6366f1'
                                            }}>
                                                {subject.score}%
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginTop: '1rem'
                                        }}>
                                            <motion.div
                                                initial={{width: 0}}
                                                animate={{width: `${subject.score}%`}}
                                                transition={{duration: 1, delay: index * 0.2}}
                                                style={{
                                                    height: '100%',
                                                    backgroundColor: '#6366f1',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'patterns' && (
                        <div>
                            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                Discovered Learning Patterns
                            </h2>
                            <div style={{display: 'grid', gap: '1rem'}}>
                                {learningPatterns.map((pattern, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.1}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                            <span style={{fontSize: '2rem'}}>{pattern.icon}</span>
                                            <div>
                                                <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem'}}>
                                                    {pattern.pattern}
                                                </h3>
                                                <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>
                                                    {pattern.value}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'recommendations' && (
                        <div>
                            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                AI-Powered Recommendations
                            </h2>
                            <div style={{display: 'grid', gap: '1.5rem'}}>
                                {recommendations.map((rec, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: index * 0.1}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '16px',
                                            padding: '2rem',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            border: `2px solid ${getPriorityColor(rec.priority)}20`
                                        }}
                                    >
                                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                                            <span style={{fontSize: '2.5rem'}}>{rec.icon}</span>
                                            <div style={{flex: 1}}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <h3 style={{margin: 0, fontSize: '1.2rem'}}>{rec.title}</h3>
                                                    <span style={{
                                                        backgroundColor: getPriorityColor(rec.priority),
                                                        color: 'white',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {rec.priority}
                                                    </span>
                                                </div>
                                                <p style={{color: '#6b7280', margin: 0, lineHeight: 1.6}}>
                                                    {rec.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}

export default ResearchInsights
