import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'

interface AnalyticsData {
    overview: {
        total_students: number
        active_students: number
        average_grade: number
        engagement_rate: number
        completion_rate: number
    }
    student_performance: Array<{
        student_name: string
        student_id: string
        current_grade: number
        attendance_rate: number
        assignment_completion: number
        engagement_score: number
    }>
    course_analytics: Array<{
        course_name: string
        enrolled_students: number
        average_grade: number
        completion_rate: number
        difficulty_rating: number
    }>
    recent_activities: Array<{
        student_name: string
        activity: string
        timestamp: string
        score?: number
    }>
}

const TeachingAnalytics: React.FC = () => {
    const {user, token} = useAuth()
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedTimeRange, setSelectedTimeRange] = useState('week')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && token) {
            fetchAnalytics()
        }
    }, [user, token, selectedTimeRange])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!token) {
                setError('No authentication token available')
                return
            }

            if (!user || user.user_type !== 'teacher') {
                setError(`Invalid user type: ${user?.user_type || 'unknown'}`)
                return
            }

            console.log('🔍 Fetching analytics for teacher:', user.username)

            const response = await fetch(`http://localhost:8000/api/teachers/analytics/?range=${selectedTimeRange}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            console.log('📡 API Response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('📊 Analytics data received:', data)

                // Check if data has the expected structure
                if (data.overview) {
                    setAnalytics(data)
                    setError(null)
                } else {
                    console.warn('⚠️ Unexpected data structure:', data)
                    setError('Unexpected data format received from server')
                }
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('❌ API Error:', response.status, errorData)
                setError(`API Error ${response.status}: ${errorData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('❌ Network error:', error)
            setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
            setAnalytics(null)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                gap: '1rem'
            }}>
                <div style={{fontSize: '2rem'}}>⏳</div>
                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>
                    Loading teaching analytics...
                </div>
                <div style={{fontSize: '0.9rem', color: '#9ca3af'}}>
                    Fetching data from server...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                padding: '2rem',
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '2rem'
                }}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚠️</div>
                    <h3 style={{fontSize: '1.5rem', color: '#dc2626', marginBottom: '1rem'}}>
                        Analytics Page Error
                    </h3>
                    <p style={{fontSize: '1rem', color: '#dc2626', marginBottom: '2rem'}}>
                        {error}
                    </p>

                    {debugInfo && (
                        <div style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '2rem',
                            textAlign: 'left'
                        }}>
                            <h4 style={{fontSize: '1rem', marginBottom: '0.5rem', color: '#374151'}}>
                                Debug Information:
                            </h4>
                            <pre style={{
                                fontSize: '0.8rem',
                                color: '#6b7280',
                                margin: 0,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div style={{
                        background: '#eff6ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        textAlign: 'left',
                        marginBottom: '2rem'
                    }}>
                        <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem'}}>
                            Troubleshooting Steps:
                        </h4>
                        <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Check if Django server is running on port 8000</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Verify your teacher account is approved</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Open browser dev tools → Network tab to see API
                                calls</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Check console for JavaScript errors</p>
                            <p style={{margin: '0'}}>• Try refreshing the page or logging out/in again</p>
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                        <button
                            onClick={fetchAnalytics}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            🔄 Try Again
                        </button>

                        <button
                            onClick={() => window.location.href = '/teacher'}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!analytics) {
        return (
            <div style={{
                padding: '2rem',
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '3rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📊</div>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                        No Analytics Data Available
                    </h3>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        Teaching analytics will be available once you have students enrolled in courses and course
                        activity begins.
                    </p>

                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto 2rem auto'
                    }}>
                        <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem'}}>
                            To get analytics data:
                        </h4>
                        <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Create courses in Course Management</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Add students to your courses</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Create assignments and assessments</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Students submit work and participate</p>
                            <p style={{margin: '0'}}>• Analytics will automatically populate here</p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/teacher/students'}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        👥 Manage Students
                    </button>
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
                        📊 Teaching Analytics
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        Comprehensive insights into student progress and teaching effectiveness
                    </p>
                </div>

                <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        minWidth: '120px'
                    }}
                >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="semester">This Semester</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            {/* Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{fontSize: '2rem'}}>👥</div>
                        <div>
                            <div style={{fontSize: '2rem', fontWeight: '700', color: '#3b82f6'}}>
                                {analytics.overview.total_students}
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                                Total Students
                            </div>
                        </div>
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#059669'}}>
                        {analytics.overview.active_students} active this {selectedTimeRange}
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
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{fontSize: '2rem'}}>📈</div>
                        <div>
                            <div style={{fontSize: '2rem', fontWeight: '700', color: '#10b981'}}>
                                {analytics.overview.average_grade.toFixed(1)}%
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                                Average Grade
                            </div>
                        </div>
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        Class performance indicator
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
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{fontSize: '2rem'}}>🎯</div>
                        <div>
                            <div style={{fontSize: '2rem', fontWeight: '700', color: '#f59e0b'}}>
                                {analytics.overview.engagement_rate.toFixed(1)}%
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                                Engagement Rate
                            </div>
                        </div>
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        Student participation level
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
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{fontSize: '2rem'}}>✅</div>
                        <div>
                            <div style={{fontSize: '2rem', fontWeight: '700', color: '#8b5cf6'}}>
                                {analytics.overview.completion_rate.toFixed(1)}%
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                                Completion Rate
                            </div>
                        </div>
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        Assignment completion average
                    </div>
                </motion.div>
            </div>

            {analytics.overview.total_students === 0 ? (
                /* Empty State */
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4}}
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        padding: '3rem',
                        textAlign: 'center'
                    }}
                >
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📊</div>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                        No Analytics Data Yet
                    </h3>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        Analytics will be populated as you add students to your courses and they begin completing
                        assignments and participating in activities.
                    </p>

                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem'}}>
                            What you'll see here:
                        </h4>
                        <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Student performance trends and insights</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Assignment completion and grading analytics</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Class engagement and participation metrics</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Course difficulty and effectiveness analysis</p>
                            <p style={{margin: '0'}}>• Recommendations for teaching improvements</p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                /* Data Tables and Charts */
                <div style={{display: 'grid', gap: '2rem'}}>
                    {/* Student Performance Table */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.4}}
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
                                Student Performance Overview
                            </h3>
                        </div>

                        {analytics.student_performance.length === 0 ? (
                            <div style={{padding: '3rem', textAlign: 'center', color: '#6b7280'}}>
                                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📚</div>
                                <p>No student performance data available yet</p>
                            </div>
                        ) : (
                            <div style={{overflowX: 'auto'}}>
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                    <tr style={{backgroundColor: '#f9fafb'}}>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>Student
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>Current Grade
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>Attendance
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>Completion
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>Engagement
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {analytics.student_performance.map((student) => (
                                        <tr key={student.student_id} style={{borderBottom: '1px solid #e5e7eb'}}>
                                            <td style={{padding: '1rem'}}>
                                                <div>
                                                    <div style={{fontWeight: '600', color: '#1f2937'}}>
                                                        {student.student_name}
                                                    </div>
                                                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                                        ID: {student.student_id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{padding: '1rem'}}>
                                                    <span style={{
                                                        color: student.current_grade >= 80 ? '#059669' :
                                                            student.current_grade >= 60 ? '#d97706' : '#dc2626',
                                                        fontWeight: '600'
                                                    }}>
                                                        {student.current_grade.toFixed(1)}%
                                                    </span>
                                            </td>
                                            <td style={{padding: '1rem'}}>
                                                    <span style={{
                                                        color: student.attendance_rate >= 90 ? '#059669' :
                                                            student.attendance_rate >= 75 ? '#d97706' : '#dc2626',
                                                        fontWeight: '600'
                                                    }}>
                                                        {student.attendance_rate.toFixed(1)}%
                                                    </span>
                                            </td>
                                            <td style={{padding: '1rem'}}>
                                                    <span style={{
                                                        color: student.assignment_completion >= 90 ? '#059669' :
                                                            student.assignment_completion >= 75 ? '#d97706' : '#dc2626',
                                                        fontWeight: '600'
                                                    }}>
                                                        {student.assignment_completion.toFixed(1)}%
                                                    </span>
                                            </td>
                                            <td style={{padding: '1rem'}}>
                                                <div style={{width: '100px'}}>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '6px',
                                                        backgroundColor: '#e5e7eb',
                                                        borderRadius: '3px'
                                                    }}>
                                                        <div style={{
                                                            width: `${student.engagement_score}%`,
                                                            height: '100%',
                                                            backgroundColor: '#3b82f6',
                                                            borderRadius: '3px'
                                                        }}/>
                                                    </div>
                                                    <span style={{fontSize: '0.75rem', color: '#6b7280'}}>
                                                            {student.engagement_score.toFixed(0)}%
                                                        </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default TeachingAnalytics