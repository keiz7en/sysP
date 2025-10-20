import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {teacherAPI} from '../../../services/api'
import toast from 'react-hot-toast'

interface PendingStudent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    student_id?: string;
    grade_level?: string;
    guardian_name?: string;
    guardian_email?: string;
    applied_at: string;
}

const StudentApprovals: React.FC = () => {
    const {token} = useAuth()
    const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchPendingStudents()
    }, [])

    const fetchPendingStudents = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!token) {
                setError('Authentication required')
                return
            }

            const data = await teacherAPI.getPendingStudents(token)
            setPendingStudents(data.pending_students || [])
        } catch (error: any) {
            console.error('Error fetching pending students:', error)
            const errorMessage = error.message || 'Error fetching pending students'

            if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
                setError('Access denied. Teacher privileges required.')
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

            await teacherAPI.approveStudent(token, studentId)
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

            await teacherAPI.rejectStudent(token, studentId, reason)
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
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    {pendingStudents.map((student, index) => (
                        <motion.div
                            key={student.id}
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
                                            {student.first_name} {student.last_name}
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

                                    <div style={{marginBottom: '1rem'}}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div>
                                                <strong style={{color: '#374151'}}>Email:</strong>
                                                <p style={{margin: '0.25rem 0', color: '#6b7280'}}>{student.email}</p>
                                            </div>
                                            <div>
                                                <strong style={{color: '#374151'}}>Student ID:</strong>
                                                <p style={{
                                                    margin: '0.25rem 0',
                                                    color: '#6b7280'
                                                }}>{student.student_id || 'Will be assigned'}</p>
                                            </div>
                                        </div>

                                        {student.grade_level && (
                                            <div style={{marginBottom: '1rem'}}>
                                                <strong style={{color: '#374151'}}>Grade Level:</strong>
                                                <p style={{
                                                    margin: '0.25rem 0',
                                                    color: '#6b7280'
                                                }}>{student.grade_level}</p>
                                            </div>
                                        )}

                                        {student.guardian_name && (
                                            <div style={{marginBottom: '1rem'}}>
                                                <strong style={{color: '#374151'}}>Guardian Information:</strong>
                                                <div style={{
                                                    margin: '0.5rem 0',
                                                    padding: '1rem',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <p style={{margin: '0 0 0.5rem 0', color: '#6b7280'}}>
                                                        <strong>Name:</strong> {student.guardian_name}
                                                    </p>
                                                    {student.guardian_email && (
                                                        <p style={{margin: 0, color: '#6b7280'}}>
                                                            <strong>Email:</strong> {student.guardian_email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#6b7280',
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{marginBottom: '0.5rem'}}>📅 Applied</div>
                                        <strong>{new Date(student.applied_at).toLocaleDateString()}</strong>
                                    </div>

                                    <button
                                        onClick={() => handleApprove(student.id)}
                                        disabled={processingId === student.id}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            backgroundColor: processingId === student.id ? '#9ca3af' : '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: processingId === student.id ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
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
                                            <>✅ Approve Student</>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleReject(student.id)}
                                        disabled={processingId === student.id}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            backgroundColor: processingId === student.id ? '#9ca3af' : '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: processingId === student.id ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
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

export default StudentApprovals