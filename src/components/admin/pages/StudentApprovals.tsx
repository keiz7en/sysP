import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {adminAPI} from '../../../services/api'
import toast from 'react-hot-toast'

interface PendingStudent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    student_id: string;
    grade_level?: string;
    guardian_name?: string;
    guardian_email?: string;
    applied_at: string;
}

const StudentApprovals: React.FC = () => {
    const {user, token} = useAuth()
    const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && token) {
            fetchPendingStudents()
        }
    }, [user, token])

    const fetchPendingStudents = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!token) {
                setError('Authentication required')
                return
            }

            const data = await adminAPI.getPendingStudents(token)
            setPendingStudents(data.pending_students || [])
        } catch (error: any) {
            console.error('Error fetching pending students:', error)
            const errorMessage = error.message || 'Error fetching pending students'

            if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
                setError('Access denied. Admin or teacher privileges required.')
            } else {
                setError(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (studentId: number) => {
        setProcessingId(studentId)
        try {
            if (!token) return

            await adminAPI.approveStudent(token, studentId)
            toast.success('Student approved successfully!')
            setPendingStudents(prev => prev.filter(student => student.id !== studentId))
        } catch (error: any) {
            console.error('Error approving student:', error)
            toast.error(error.message || 'Failed to approve student')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (studentId: number) => {
        const reason = prompt('Enter rejection reason:')
        if (!reason) return

        setProcessingId(studentId)
        try {
            if (!token) return

            await adminAPI.rejectStudent(token, studentId, reason)
            toast.success('Student application rejected')
            setPendingStudents(prev => prev.filter(student => student.id !== studentId))
        } catch (error: any) {
            console.error('Error rejecting student:', error)
            toast.error(error.message || 'Failed to reject student')
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
                    Loading pending student applications...
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
                    onClick={fetchPendingStudents}
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
            initial={{opacity: 0}}
            animate={{opacity: 1}}
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
                        🎓 Student Approval Requests
                    </h1>
                    <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                        Review and approve student registrations ({pendingStudents.length} pending)
                    </p>
                </div>

                <button
                    onClick={fetchPendingStudents}
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

            {pendingStudents.length === 0 ? (
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
                        No pending student applications to review at this time.
                    </p>
                    <p style={{fontSize: '0.9rem', marginTop: '0.5rem', color: '#9ca3af'}}>
                        New applications will appear here when students register for accounts.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {pendingStudents.map((student, index) => (
                        <motion.div
                            key={student.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.1}}
                            style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Student Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <div>
                                    <h3 style={{fontSize: '1.2rem', fontWeight: '600', margin: 0, color: '#1f2937'}}>
                                        {student.first_name} {student.last_name}
                                    </h3>
                                    <p style={{margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#6b7280'}}>
                                        ID: {student.student_id}
                                    </p>
                                </div>
                                <span style={{
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    PENDING
                                </span>
                            </div>

                            {/* Student Info */}
                            <div style={{marginBottom: '1.5rem', flex: 1}}>
                                <div style={{marginBottom: '0.75rem'}}>
                                    <div style={{fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem'}}>Email
                                    </div>
                                    <div style={{fontSize: '0.9rem', color: '#1f2937'}}>{student.email}</div>
                                </div>

                                {student.phone_number && (
                                    <div style={{marginBottom: '0.75rem'}}>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: '#6b7280',
                                            marginBottom: '0.25rem'
                                        }}>Phone
                                        </div>
                                        <div style={{fontSize: '0.9rem', color: '#1f2937'}}>{student.phone_number}</div>
                                    </div>
                                )}

                                {student.grade_level && (
                                    <div style={{marginBottom: '0.75rem'}}>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: '#6b7280',
                                            marginBottom: '0.25rem'
                                        }}>Grade Level
                                        </div>
                                        <div style={{fontSize: '0.9rem', color: '#1f2937'}}>{student.grade_level}</div>
                                    </div>
                                )}

                                {student.guardian_name && (
                                    <div style={{marginBottom: '0.75rem'}}>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: '#6b7280',
                                            marginBottom: '0.25rem'
                                        }}>Guardian
                                        </div>
                                        <div style={{fontSize: '0.9rem', color: '#1f2937'}}>
                                            {student.guardian_name}
                                            {student.guardian_email && (
                                                <div style={{fontSize: '0.8rem', color: '#6b7280'}}>
                                                    {student.guardian_email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280',
                                    background: '#f9fafb',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    textAlign: 'center'
                                }}>
                                    Applied: {new Date(student.applied_at).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{display: 'flex', gap: '0.75rem'}}>
                                <button
                                    onClick={() => handleApprove(student.id)}
                                    disabled={processingId === student.id}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: processingId === student.id ? '#9ca3af' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: processingId === student.id ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (processingId !== student.id) {
                                            e.currentTarget.style.backgroundColor = '#059669'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (processingId !== student.id) {
                                            e.currentTarget.style.backgroundColor = '#10b981'
                                        }
                                    }}
                                >
                                    {processingId === student.id ? (
                                        <>🔄 Processing...</>
                                    ) : (
                                        <>✅ Approve</>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleReject(student.id)}
                                    disabled={processingId === student.id}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: processingId === student.id ? '#9ca3af' : '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: processingId === student.id ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (processingId !== student.id) {
                                            e.currentTarget.style.backgroundColor = '#dc2626'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (processingId !== student.id) {
                                            e.currentTarget.style.backgroundColor = '#ef4444'
                                        }
                                    }}
                                >
                                    {processingId === student.id ? (
                                        <>🔄 Processing...</>
                                    ) : (
                                        <>❌ Reject</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default StudentApprovals