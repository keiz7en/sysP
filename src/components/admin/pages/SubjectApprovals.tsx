import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import toast from 'react-hot-toast'
import {useAuth} from '../../../contexts/AuthContext'
import {adminAPI} from '../../../services/api'

interface SubjectRequest {
    id: number
    teacher: number
    teacher_name: string
    teacher_email: string
    subject: number
    subject_name: string
    subject_code: string
    status: 'pending' | 'approved' | 'rejected'
    request_date: string
    approved_by: number | null
    approved_at: string | null
    rejection_reason: string
}

const SubjectApprovals: React.FC = () => {
    const {token} = useAuth()
    const [requests, setRequests] = useState<SubjectRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
    const [selectedRequest, setSelectedRequest] = useState<SubjectRequest | null>(null)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        if (!token) {
            console.error('SubjectApprovals: No token available')
            return
        }

        try {
            setLoading(true)
            console.log('SubjectApprovals: Fetching requests with token:', token?.substring(0, 10) + '...')

            const data = await adminAPI.getAllSubjectRequests(token)
            console.log('SubjectApprovals: Raw API response:', data)
            console.log('SubjectApprovals: Response type:', typeof data)
            console.log('SubjectApprovals: Has results?', data?.results)
            console.log('SubjectApprovals: Is array?', Array.isArray(data))

            const requestsArray = data?.results || data || []
            console.log('SubjectApprovals: Processed requests array:', requestsArray)
            console.log('SubjectApprovals: Array length:', requestsArray.length)

            setRequests(requestsArray)
        } catch (error: any) {
            console.error('SubjectApprovals: Error fetching requests:', error)
            console.error('SubjectApprovals: Error message:', error.message)
            console.error('SubjectApprovals: Error stack:', error.stack)
            toast.error('Failed to load subject requests: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (requestId: number) => {
        if (!token) return

        try {
            await adminAPI.approveSubjectRequest(token, requestId)
            toast.success('Subject request approved!')
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve request')
        }
    }

    const handleRejectClick = (request: SubjectRequest) => {
        setSelectedRequest(request)
        setShowRejectModal(true)
    }

    const handleRejectConfirm = async () => {
        if (!token || !selectedRequest) return

        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }

        try {
            await adminAPI.rejectSubjectRequest(token, selectedRequest.id, rejectionReason)
            toast.success('Subject request rejected')
            setShowRejectModal(false)
            setRejectionReason('')
            setSelectedRequest(null)
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject request')
        }
    }

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true
        return req.status === filter
    })

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

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'approved':
                return '#d1fae5'
            case 'rejected':
                return '#fee2e2'
            case 'pending':
                return '#fef3c7'
            default:
                return '#f3f4f6'
        }
    }

    if (loading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f4f6',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div style={{padding: '0'}}>
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.5rem 0'}}>
                    📚 Subject Approval Requests
                </h1>
                <p style={{color: '#6b7280', margin: 0}}>
                    Review and approve teacher requests to teach specific subjects
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                        {requests.filter(r => r.status === 'pending').length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Pending Requests</div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                        {requests.filter(r => r.status === 'approved').length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Approved</div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                    style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                        {requests.filter(r => r.status === 'rejected').length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Rejected</div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                        {requests.length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Total Requests</div>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '1rem'
            }}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            background: filter === status ? '#3b82f6' : '#f3f4f6',
                            color: filter === status ? 'white' : '#6b7280',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s'
                        }}
                    >
                        {status}
                        {status !== 'all' && ` (${requests.filter(r => r.status === status).length})`}
                    </button>
                ))}
            </div>

            {/* Requests Table */}
            {filteredRequests.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'white',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                }}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📝</div>
                    <h3 style={{fontSize: '1.25rem', color: '#374151', marginBottom: '0.5rem'}}>
                        No {filter !== 'all' ? filter : ''} requests found
                    </h3>
                    <p style={{color: '#6b7280'}}>
                        Teacher subject requests will appear here
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                        <tr style={{background: '#f9fafb', borderBottom: '2px solid #e5e7eb'}}>
                            <th style={{
                                padding: '1rem',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#374151'
                            }}>Teacher
                            </th>
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
                            }}>Request Date
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
                            }}>Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRequests.map((request, idx) => (
                            <tr key={request.id} style={{
                                borderBottom: idx < filteredRequests.length - 1 ? '1px solid #e5e7eb' : 'none'
                            }}>
                                <td style={{padding: '1rem'}}>
                                    <div style={{fontWeight: '600', color: '#1f2937'}}>{request.teacher_name}</div>
                                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>{request.teacher_email}</div>
                                </td>
                                <td style={{padding: '1rem'}}>
                                    <div style={{fontWeight: '600', color: '#1f2937'}}>{request.subject_name}</div>
                                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>{request.subject_code}</div>
                                </td>
                                <td style={{padding: '1rem', color: '#6b7280'}}>
                                    {new Date(request.request_date).toLocaleDateString()}
                                </td>
                                <td style={{padding: '1rem'}}>
                                        <span style={{
                                            padding: '0.5rem 1rem',
                                            background: getStatusBg(request.status),
                                            color: getStatusColor(request.status),
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            textTransform: 'capitalize'
                                        }}>
                                            {request.status}
                                        </span>
                                </td>
                                <td style={{padding: '1rem'}}>
                                    {request.status === 'pending' ? (
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(request)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{color: '#6b7280', fontSize: '0.875rem'}}>
                                                {request.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                                            </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <motion.div
                        initial={{scale: 0.9, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '100%'
                        }}
                    >
                        <h3 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937'}}>
                            Reject Subject Request
                        </h3>
                        <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                            Teacher: <strong>{selectedRequest.teacher_name}</strong><br/>
                            Subject: <strong>{selectedRequest.subject_name}</strong>
                        </p>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                            Reason for Rejection *
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Explain why this request is being rejected..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                resize: 'vertical',
                                marginBottom: '1.5rem',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectionReason('')
                                    setSelectedRequest(null)
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Reject Request
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default SubjectApprovals
