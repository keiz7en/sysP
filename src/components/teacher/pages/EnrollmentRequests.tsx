import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {enrollmentAPI} from '../../../services/api'
import toast from 'react-hot-toast'

interface EnrollmentRequest {
    id: number
    student: {
        id: number
        user: {
            first_name: string
            last_name: string
            email: string
        }
        student_id: string
    }
    course: {
        id: number
        title: string
        code: string
    }
    status: string
    enrollment_date: string
}

const EnrollmentRequests: React.FC = () => {
    const {token} = useAuth()
    const [requests, setRequests] = useState<EnrollmentRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)
    const [rejectingId, setRejectingId] = useState<number | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        if (token) {
            fetchRequests()
        }
    }, [token])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const data = await enrollmentAPI.getPendingEnrollments(token!)
            console.log('Enrollment requests data:', data)
            console.log('First request:', data[0])
            setRequests(data || [])
        } catch (error) {
            console.error('Error fetching requests:', error)
            toast.error('Failed to load enrollment requests')
            setRequests([])
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (enrollmentId: number) => {
        setProcessingId(enrollmentId)
        try {
            await enrollmentAPI.approveEnrollment(token!, enrollmentId)
            toast.success('Enrollment approved! Student can now access the course.')
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve enrollment')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (enrollmentId: number) => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setProcessingId(enrollmentId)
        try {
            await enrollmentAPI.rejectEnrollment(token!, enrollmentId, rejectionReason)
            toast.success('Enrollment rejected')
            setRejectingId(null)
            setRejectionReason('')
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject enrollment')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div style={{padding: '2rem', textAlign: 'center'}}>
                <div style={{
                    display: 'inline-block',
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f4f6',
                    borderTop: '4px solid #6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}/>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    📥 Enrollment Requests
                </h1>
                <p style={{color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem'}}>
                    Review and approve student enrollment requests for your courses
                </p>

                {/* Statistics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        <div style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                            {requests.length}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>
                            Pending Requests
                        </div>
                    </motion.div>
                </div>

                {/* Requests List */}
                {requests.length === 0 ? (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        style={{
                            textAlign: 'center',
                            padding: '4rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '16px',
                            border: '2px dashed #d1d5db'
                        }}
                    >
                        <div style={{fontSize: '4rem', marginBottom: '1rem'}}>✅</div>
                        <h3 style={{fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem'}}>
                            No Pending Requests
                        </h3>
                        <p style={{color: '#6b7280'}}>
                            All enrollment requests have been processed
                        </p>
                    </motion.div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        {requests.map((request, index) => (
                            <motion.div
                                key={request.id}
                                initial={{opacity: 0, x: -20}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: index * 0.1}}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{flex: 1}}>
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {request.student?.user?.first_name || 'Unknown'} {request.student?.user?.last_name || 'Student'}
                                        </h3>
                                        <p style={{color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                                            📧 {request.student?.user?.email || 'No email'}
                                        </p>
                                        <p style={{color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                                            🆔 Student ID: {request.student?.student_id || 'N/A'}
                                        </p>
                                        <p style={{
                                            color: '#6366f1',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            📚 {request.course?.code || 'N/A'}: {request.course?.title || 'Unknown Course'}
                                        </p>
                                        <p style={{color: '#9ca3af', fontSize: '0.85rem'}}>
                                            Requested: {request.enrollment_date && new Date(request.enrollment_date).toLocaleString()}
                                        </p>
                                    </div>

                                    <div style={{display: 'flex', gap: '1rem', marginLeft: '1rem'}}>
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            disabled={processingId === request.id}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: processingId === request.id ? '#9ca3af' : '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: processingId === request.id ? 'wait' : 'pointer',
                                                fontSize: '0.95rem',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (processingId !== request.id) {
                                                    e.currentTarget.style.backgroundColor = '#059669'
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (processingId !== request.id) {
                                                    e.currentTarget.style.backgroundColor = '#10b981'
                                                }
                                            }}
                                        >
                                            {processingId === request.id ? '⏳' : '✓'} Approve
                                        </button>

                                        <button
                                            onClick={() => setRejectingId(request.id)}
                                            disabled={processingId === request.id}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: processingId === request.id ? '#9ca3af' : '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: processingId === request.id ? 'wait' : 'pointer',
                                                fontSize: '0.95rem',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (processingId !== request.id) {
                                                    e.currentTarget.style.backgroundColor = '#dc2626'
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (processingId !== request.id) {
                                                    e.currentTarget.style.backgroundColor = '#ef4444'
                                                }
                                            }}
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Rejection Modal */}
            <AnimatePresence>
                {rejectingId && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={() => setRejectingId(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            initial={{scale: 0.9, y: 20}}
                            animate={{scale: 1, y: 0}}
                            exit={{scale: 0.9, y: 20}}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '2.5rem',
                                maxWidth: '500px',
                                width: '100%',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                            }}
                        >
                            <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937'}}>
                                Reject Enrollment Request
                            </h3>
                            <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                                Please provide a reason for rejecting this enrollment request:
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '1rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    marginBottom: '1.5rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                                <button
                                    onClick={() => {
                                        setRejectingId(null)
                                        setRejectionReason('')
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(rejectingId)}
                                    disabled={!rejectionReason.trim() || processingId === rejectingId}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: !rejectionReason.trim() || processingId === rejectingId ? '#9ca3af' : '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: !rejectionReason.trim() || processingId === rejectingId ? 'not-allowed' : 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {processingId === rejectingId ? 'Rejecting...' : 'Reject Request'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default EnrollmentRequests