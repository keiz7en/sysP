import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../../contexts/AuthContext'
import { teacherAPI } from '../../../services/api'

interface Subject {
    id: number
    name: string
    code: string
    category: string
    description: string
}

interface SubjectRequest {
    id: number
    subject_id: number
    subject_name: string
    subject_code: string
    status: 'pending' | 'approved' | 'rejected'
    request_date: string
    rejection_reason?: string
}

const TeacherSubjectManagement: React.FC = () => {
    const { user, token } = useAuth()
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [requests, setRequests] = useState<SubjectRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<'available' | 'requests'>('available')

    useEffect(() => {
        console.log('TeacherSubjectManagement mounted')
        if (user && token) {
            console.log('TeacherSubjectManagement: User and token available, fetching data')
            fetchData()
        } else {
            console.log('TeacherSubjectManagement: Missing user or token', { user, token })
            setLoading(false)
            if (!token) {
                setError('Authentication required')
            }
        }
    }, [user, token])

    const fetchData = async () => {
        if (!token) {
            setError('Not authenticated')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            console.log('Fetching subjects data...')

            const [subjectsRes, requestsRes] = await Promise.all([
                teacherAPI.getAvailableSubjects(token),
                teacherAPI.getMySubjectRequests(token)
            ])

            console.log('Subjects:', subjectsRes)
            console.log('Requests:', requestsRes)

            // Handle paginated response - extract results array
            const subjectsArray = subjectsRes?.results || subjectsRes || []
            const requestsArray = requestsRes?.results || requestsRes || []

            setSubjects(subjectsArray)
            setRequests(requestsArray)
        } catch (error: any) {
            console.error('Error fetching data:', error)
            setError(error.message || 'Failed to load subjects')
            toast.error('Failed to load subjects')
        } finally {
            setLoading(false)
        }
    }

    const handleRequestSubject = async (subjectId: number) => {
        if (!token) return

        try {
            setSubmitting(true)
            const result = await teacherAPI.requestSubject(token, subjectId)
            setRequests([...requests, result])
            toast.success('Subject request submitted')
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to request subject')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return '#10b981'
            case 'rejected':
                return '#ef4444'
            case 'pending':
                return '#f59e0b'
            default:
                return '#6b7280'
        }
    }

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'approved':
                return '#ecfdf5'
            case 'rejected':
                return '#fef2f2'
            case 'pending':
                return '#fffbeb'
            default:
                return '#f9fafb'
        }
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f4f6',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{color: '#6b7280'}}>Loading subjects...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                padding: '2rem',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    border: '2px solid #fca5a5'
                }}>
                    <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.25rem'}}>Error</h3>
                    <p style={{margin: 0}}>{error}</p>
                </div>
                <button
                    onClick={() => fetchData()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                    }}
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div style={{padding: '0', minHeight: '100vh', background: '#f8fafc'}}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '2rem'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0 0 0.5rem 0'
                        }}>
                            📚 Subject Management
                        </h2>
                        <p style={{color: '#6b7280', margin: 0}}>
                            Request subjects to teach and manage your approved subjects
                        </p>
                    </div>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <button
                            onClick={() => setActiveTab('available')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: activeTab === 'available' ? '#3b82f6' : '#e5e7eb',
                                color: activeTab === 'available' ? 'white' : '#1f2937',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Available Subjects
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: activeTab === 'requests' ? '#3b82f6' : '#e5e7eb',
                                color: activeTab === 'requests' ? 'white' : '#1f2937',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            My Requests ({requests.length})
                        </button>
                    </div>
                </div>

                {/* Available Subjects Tab */}
                {activeTab === 'available' && (
                    <div>
                        {subjects.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '2px dashed #d1d5db'
                            }}>
                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📚</div>
                                <h3 style={{fontSize: '1.25rem', color: '#374151', marginBottom: '0.5rem'}}>
                                    No Available Subjects
                                </h3>
                                <p style={{color: '#6b7280'}}>
                                    All subjects have been requested or there are no subjects in the system yet.
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {subjects.map(subject => (
                                    <motion.div
                                        key={subject.id}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        style={{
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={(e: any) => {
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                                            e.currentTarget.style.transform = 'translateY(-2px)'
                                        }}
                                        onMouseLeave={(e: any) => {
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                                            e.currentTarget.style.transform = 'translateY(0)'
                                        }}
                                    >
                                        <div style={{marginBottom: '1rem'}}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: '#1f2937',
                                                margin: '0 0 0.5rem 0'
                                            }}>
                                                {subject.name}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                margin: 0
                                            }}>
                                                {subject.code}
                                            </p>
                                        </div>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: '#4b5563',
                                            marginBottom: '1rem',
                                            lineHeight: '1.5'
                                        }}>
                                            {subject.description}
                                        </p>
                                        <button
                                            onClick={() => handleRequestSubject(subject.id)}
                                            disabled={submitting}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: submitting ? '#9ca3af' : '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            {submitting ? 'Requesting...' : 'Request Subject'}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* My Requests Tab */}
                {activeTab === 'requests' && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        {requests.length === 0 ? (
                            <div style={{
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                color: '#6b7280'
                            }}>
                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📝</div>
                                <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151'}}>
                                    No Subject Requests Yet
                                </h3>
                                <p>Start by requesting subjects from the Available Subjects tab</p>
                            </div>
                        ) : (
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead>
                                <tr style={{background: '#f9fafb', borderBottom: '2px solid #e5e7eb'}}>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>Subject
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>Code
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>Status
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>Request Date
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>Notes
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {requests.map((req, idx) => (
                                    <tr key={req.id} style={{
                                        borderBottom: idx < requests.length - 1 ? '1px solid #e5e7eb' : 'none'
                                    }}>
                                        <td style={{padding: '1rem', fontWeight: '600', color: '#1f2937'}}>
                                            {req.subject_name}
                                        </td>
                                        <td style={{padding: '1rem', color: '#6b7280'}}>
                                            {req.subject_code}
                                        </td>
                                        <td style={{padding: '1rem'}}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.5rem 1rem',
                                                    background: getStatusBgColor(req.status),
                                                    color: getStatusColor(req.status),
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    fontSize: '0.875rem',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {req.status}
                                                </span>
                                        </td>
                                        <td style={{padding: '1rem', color: '#6b7280'}}>
                                            {new Date(req.request_date).toLocaleDateString()}
                                        </td>
                                        <td style={{padding: '1rem', color: '#6b7280', fontSize: '0.875rem'}}>
                                            {req.rejection_reason || '-'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherSubjectManagement
