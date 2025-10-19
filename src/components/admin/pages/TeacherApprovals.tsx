import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../contexts/AuthContext'
import {adminAPI} from '../../../services/api'
import toast from 'react-hot-toast'

interface PendingTeacher {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    qualifications: string[];
    department_preference: string;
    specialization: string[];
    reason_for_joining: string;
    experience_years: number;
    applied_at: string;
}

const TeacherApprovals: React.FC = () => {
    const { token } = useAuth()
    const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchPendingTeachers()
    }, [])

    const fetchPendingTeachers = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!token) {
                setError('Authentication required')
                return
            }

            const data = await adminAPI.getPendingTeachers(token)
            setPendingTeachers(data.pending_teachers || [])
        } catch (error: any) {
            console.error('Error fetching pending teachers:', error)
            const errorMessage = error.message || 'Error fetching pending teachers'

            if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
                setError('Access denied. Admin privileges required.')
            } else {
                setError(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (teacherId: number) => {
        setProcessingId(teacherId)
        try {
            if (!token) return

            await adminAPI.approveTeacher(token, teacherId, 'Approved by administrator')
            toast.success('Teacher approved successfully!')
            setPendingTeachers(prev => prev.filter(teacher => teacher.id !== teacherId))
        } catch (error: any) {
            console.error('Error approving teacher:', error)
            toast.error(error.message || 'Failed to approve teacher')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (teacherId: number) => {
        const reason = prompt('Enter rejection reason:')
        if (!reason) return

        setProcessingId(teacherId)
        try {
            if (!token) return

            await adminAPI.rejectTeacher(token, teacherId, reason, reason)
            toast.success('Teacher application rejected')
            setPendingTeachers(prev => prev.filter(teacher => teacher.id !== teacherId))
        } catch (error: any) {
            console.error('Error rejecting teacher:', error)
            toast.error(error.message || 'Failed to reject teacher')
        } finally {
            setProcessingId(null)
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
                    Loading pending teacher applications...
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
                    onClick={fetchPendingTeachers}
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937'}}>
                        👨‍🏫 Teacher Approval Requests
                    </h1>
                    <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                        Review and approve teacher applications ({pendingTeachers.length} pending)
                    </p>
                </div>

                <button
                    onClick={fetchPendingTeachers}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {pendingTeachers.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '12px',
                    color: '#6b7280',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>✅</div>
                    <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937'}}>All Caught Up!</h3>
                    <p style={{fontSize: '1rem', marginBottom: '0'}}>
                        No pending teacher applications to review at this time.
                    </p>
                    <p style={{fontSize: '0.9rem', marginTop: '0.5rem', color: '#9ca3af'}}>
                        New applications will appear here when teachers register for accounts.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {pendingTeachers.map((teacher, index) => (
                        <motion.div
                            key={teacher.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.1}}
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: '600',
                                            margin: 0,
                                            color: '#1f2937'
                                        }}>
                                            {teacher.first_name} {teacher.last_name}
                                        </h3>
                                        <span style={{
                                            background: '#ddd6fe',
                                            color: '#7c3aed',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            PENDING
                                        </span>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div>
                                                <strong style={{color: '#374151'}}>Email:</strong>
                                                <p style={{margin: '0.25rem 0', color: '#6b7280'}}>{teacher.email}</p>
                                            </div>
                                            <div>
                                                <strong style={{color: '#374151'}}>Experience:</strong>
                                                <p style={{
                                                    margin: '0.25rem 0',
                                                    color: '#6b7280'
                                                }}>{teacher.experience_years} years</p>
                                            </div>
                                        </div>

                                        <div style={{marginBottom: '1rem'}}>
                                            <strong style={{color: '#374151'}}>Department:</strong>
                                            <p style={{
                                                margin: '0.25rem 0',
                                                color: '#6b7280'
                                            }}>{teacher.department_preference}</p>
                                        </div>

                                        <div style={{marginBottom: '1rem'}}>
                                            <strong style={{color: '#374151'}}>Specialization:</strong>
                                            <div style={{
                                                margin: '0.5rem 0',
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '0.5rem'
                                            }}>
                                                {teacher.specialization && teacher.specialization.length > 0 ? (
                                                    teacher.specialization.map((spec, i) => (
                                                        <span key={i} style={{
                                                            background: '#e0f2fe',
                                                            color: '#0369a1',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            {spec}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{color: '#9ca3af', fontStyle: 'italic'}}>No specialization specified</span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{marginBottom: '1rem'}}>
                                            <strong style={{color: '#374151'}}>Qualifications:</strong>
                                            <ul style={{marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#6b7280'}}>
                                                {teacher.qualifications && teacher.qualifications.length > 0 ? (
                                                    teacher.qualifications.map((qual, i) => (
                                                        <li key={i} style={{marginBottom: '0.25rem'}}>{qual}</li>
                                                    ))
                                                ) : (
                                                    <li style={{fontStyle: 'italic', color: '#9ca3af'}}>No
                                                        qualifications listed</li>
                                                )}
                                            </ul>
                                        </div>

                                        <div>
                                            <strong style={{color: '#374151'}}>Reason for Joining:</strong>
                                            <p style={{
                                                marginTop: '0.5rem',
                                                fontStyle: 'italic',
                                                color: '#6b7280',
                                                background: '#f9fafb',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                {teacher.reason_for_joining || 'No reason provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#6b7280',
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{marginBottom: '0.5rem'}}>📅 Applied</div>
                                        <strong>{new Date(teacher.applied_at).toLocaleDateString()}</strong>
                                    </div>

                                    <button
                                        onClick={() => handleApprove(teacher.id)}
                                        disabled={processingId === teacher.id}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            backgroundColor: processingId === teacher.id ? '#9ca3af' : '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: processingId === teacher.id ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (processingId !== teacher.id) {
                                                e.currentTarget.style.backgroundColor = '#059669'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (processingId !== teacher.id) {
                                                e.currentTarget.style.backgroundColor = '#10b981'
                                            }
                                        }}
                                    >
                                        {processingId === teacher.id ? (
                                            <>🔄 Processing...</>
                                        ) : (
                                            <>✅ Approve Teacher</>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleReject(teacher.id)}
                                        disabled={processingId === teacher.id}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            backgroundColor: processingId === teacher.id ? '#9ca3af' : '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: processingId === teacher.id ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (processingId !== teacher.id) {
                                                e.currentTarget.style.backgroundColor = '#dc2626'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (processingId !== teacher.id) {
                                                e.currentTarget.style.backgroundColor = '#ef4444'
                                            }
                                        }}
                                    >
                                        {processingId === teacher.id ? (
                                            <>🔄 Processing...</>
                                        ) : (
                                            <>❌ Reject Application</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default TeacherApprovals
