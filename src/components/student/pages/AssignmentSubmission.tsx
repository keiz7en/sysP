import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Assignment {
    id: number
    title: string
    description: string
    course_title: string
    course_id: number
    due_date: string
    max_points: number
    assignment_type: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab'
    status: 'pending' | 'submitted' | 'graded' | 'overdue'
    attachment?: {
        url: string
        filename: string
        size: number
    }
    submission?: {
        id: number
        submitted_at: string
        submission_text: string
        file?: {
            url: string
            filename: string
            size: number
        }
        points_earned?: number
        feedback?: string
        is_late: boolean
        ai_detection?: {
            score: number
            is_flagged: boolean
            flag_reason: string
            result: any
        }
    }
}

const AssignmentSubmission: React.FC = () => {
    const {token} = useAuth()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
    const [submissionText, setSubmissionText] = useState('')
    const [submissionFile, setSubmissionFile] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

    useEffect(() => {
        if (token) {
            fetchAssignments()
        }
    }, [token])

    const fetchAssignments = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/students/assignments/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setAssignments(data.assignments || [])
            } else {
                setAssignments([])
            }
        } catch (error) {
            console.error('Error fetching assignments:', error)
            toast.error('Failed to load assignments')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const allowedTypes = ['application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain']

            if (!allowedTypes.includes(file.type)) {
                toast.error('Only PDF, DOC, DOCX, and TXT files are allowed')
                return
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File size must be less than 10MB')
                return
            }

            setSubmissionFile(file)
            toast.success(`File "${file.name}" selected`)
        }
    }

    const handleSubmitAssignment = async () => {
        if (!selectedAssignment) return

        if (!submissionText && !submissionFile) {
            toast.error('Please provide either text submission or file upload')
            return
        }

        setSubmitting(true)
        const loadingToast = toast.loading('Submitting assignment...')

        try {
            const formData = new FormData()
            formData.append('assignment_id', selectedAssignment.id.toString())
            if (submissionText) {
                formData.append('submission_text', submissionText)
            }
            if (submissionFile) {
                formData.append('file', submissionFile)
            }

            const response = await fetch('http://localhost:8000/api/students/submit-assignment/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                toast.dismiss(loadingToast)
                toast.success('Assignment submitted successfully!')

                // Show AI detection results if available
                if (data.ai_detection && data.ai_detection.is_flagged) {
                    toast.error(`⚠️ AI Detection: ${data.ai_detection.warning}`, {duration: 6000})
                }

                setSelectedAssignment(null)
                setSubmissionText('')
                setSubmissionFile(null)
                fetchAssignments()
            } else {
                const error = await response.json()
                toast.dismiss(loadingToast)
                toast.error(error.error || 'Failed to submit assignment')
            }
        } catch (error) {
            console.error('Error submitting assignment:', error)
            toast.dismiss(loadingToast)
            toast.error('Network error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusColor = (status: Assignment['status']) => {
        switch (status) {
            case 'pending':
                return '#3b82f6'
            case 'submitted':
                return '#f59e0b'
            case 'graded':
                return '#10b981'
            case 'overdue':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const getStatusIcon = (status: Assignment['status']) => {
        switch (status) {
            case 'pending':
                return '⏰'
            case 'submitted':
                return '📤'
            case 'graded':
                return '✅'
            case 'overdue':
                return '⚠️'
            default:
                return '📝'
        }
    }

    const filteredAssignments = filterStatus === 'all'
        ? assignments
        : assignments.filter(a => a.status === filterStatus)

    if (loading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px'}}>
                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>Loading assignments...</div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}
        >
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                }}>
                    📋 Assignment Submission
                </h1>
                <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                    Submit your assignments and view feedback from teachers
                </p>
            </div>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <motion.div whileHover={{scale: 1.02}} style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📊</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {assignments.length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Total Assignments</div>
                </motion.div>

                <motion.div whileHover={{scale: 1.02}} style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⏳</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {assignments.filter(a => a.status === 'pending').length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Pending</div>
                </motion.div>

                <motion.div whileHover={{scale: 1.02}} style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📤</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {assignments.filter(a => a.status === 'submitted').length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Submitted</div>
                </motion.div>

                <motion.div whileHover={{scale: 1.02}} style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✅</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {assignments.filter(a => a.status === 'graded').length}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Graded</div>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
            }}>
                {(['all', 'pending', 'submitted', 'graded'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            backgroundColor: filterStatus === status ? '#3b82f6' : '#f3f4f6',
                            color: filterStatus === status ? 'white' : '#374151',
                            textTransform: 'capitalize'
                        }}
                    >
                        {status} ({status === 'all' ? assignments.length : assignments.filter(a => a.status === status).length})
                    </button>
                ))}
            </div>

            {/* Assignments List */}
            {filteredAssignments.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '12px',
                    color: '#6b7280',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📋</div>
                    <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937'}}>No Assignments Found</h3>
                    <p style={{fontSize: '1rem', margin: 0}}>
                        {filterStatus === 'all'
                            ? 'No assignments available at the moment.'
                            : `No ${filterStatus} assignments.`}
                    </p>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <AnimatePresence>
                        {filteredAssignments.map((assignment, index) => (
                            <motion.div
                                key={assignment.id}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                transition={{delay: index * 0.05}}
                                style={{
                                    background: 'white',
                                    padding: '2rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr',
                                    gap: '2rem',
                                    alignItems: 'start'
                                }}>
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
                                                {assignment.title}
                                            </h3>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: '#f3f4f6',
                                                color: '#374151',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {assignment.assignment_type}
                                            </span>
                                        </div>

                                        <p style={{
                                            color: '#6b7280',
                                            fontSize: '0.9rem',
                                            marginBottom: '1rem'
                                        }}>
                                            {assignment.description}
                                        </p>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div>
                                                <div style={{fontWeight: '600', color: '#374151', fontSize: '0.85rem'}}>
                                                    Course
                                                </div>
                                                <div style={{color: '#6b7280', fontSize: '0.85rem'}}>
                                                    {assignment.course_title}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{fontWeight: '600', color: '#374151', fontSize: '0.85rem'}}>
                                                    Due Date
                                                </div>
                                                <div style={{color: '#6b7280', fontSize: '0.85rem'}}>
                                                    {new Date(assignment.due_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{fontWeight: '600', color: '#374151', fontSize: '0.85rem'}}>
                                                    Max Points
                                                </div>
                                                <div style={{color: '#6b7280', fontSize: '0.85rem'}}>
                                                    {assignment.max_points}
                                                </div>
                                            </div>
                                        </div>

                                        {assignment.attachment && (
                                            <div style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#f0f9ff',
                                                borderRadius: '8px',
                                                border: '1px solid #bfdbfe',
                                                marginBottom: '1rem'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <span>📎</span>
                                                    <a
                                                        href={assignment.attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: '#3b82f6',
                                                            textDecoration: 'none',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {assignment.attachment.filename}
                                                    </a>
                                                    <span style={{color: '#6b7280', fontSize: '0.8rem'}}>
                                                        ({(assignment.attachment.size / 1024).toFixed(2)} KB)
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {assignment.submission && (
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '8px',
                                                border: '1px solid #86efac'
                                            }}>
                                                <h4 style={{
                                                    margin: '0 0 0.5rem 0',
                                                    fontSize: '0.95rem',
                                                    fontWeight: '600',
                                                    color: '#166534'
                                                }}>
                                                    Your Submission
                                                </h4>
                                                {assignment.submission.submission_text && (
                                                    <p style={{
                                                        color: '#166534',
                                                        fontSize: '0.85rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        {assignment.submission.submission_text.slice(0, 200)}
                                                        {assignment.submission.submission_text.length > 200 && '...'}
                                                    </p>
                                                )}
                                                {assignment.submission.file && (
                                                    <div style={{fontSize: '0.85rem', color: '#166534'}}>
                                                        📎 {assignment.submission.file.filename}
                                                    </div>
                                                )}

                                                {assignment.submission.ai_detection && (
                                                    <div style={{
                                                        marginTop: '0.75rem',
                                                        padding: '0.75rem',
                                                        backgroundColor: assignment.submission.ai_detection.is_flagged ? '#fef2f2' : '#f0fdf4',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${assignment.submission.ai_detection.is_flagged ? '#fecaca' : '#86efac'}`
                                                    }}>
                                                        <div style={{
                                                            fontWeight: '600',
                                                            marginBottom: '0.5rem',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            🤖 AI Detection Results
                                                        </div>
                                                        <div style={{fontSize: '0.8rem'}}>
                                                            Confidence: {assignment.submission.ai_detection.score.toFixed(1)}%
                                                            {assignment.submission.ai_detection.is_flagged && (
                                                                <div style={{
                                                                    color: '#dc2626',
                                                                    marginTop: '0.25rem',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    ⚠️ {assignment.submission.ai_detection.flag_reason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: getStatusColor(assignment.status) + '20',
                                            borderRadius: '20px',
                                            border: `1px solid ${getStatusColor(assignment.status)}40`
                                        }}>
                                            <span style={{fontSize: '1rem'}}>{getStatusIcon(assignment.status)}</span>
                                            <span style={{
                                                color: getStatusColor(assignment.status),
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {assignment.status}
                                            </span>
                                        </div>

                                        {assignment.status === 'graded' && assignment.submission?.points_earned !== undefined && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '1rem',
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '8px',
                                                border: '1px solid #10b981',
                                                width: '100%'
                                            }}>
                                                <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#10b981'}}>
                                                    {assignment.submission.points_earned}/{assignment.max_points}
                                                </div>
                                                <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Points Earned</div>
                                                {assignment.submission.feedback && (
                                                    <div style={{
                                                        marginTop: '0.75rem',
                                                        padding: '0.75rem',
                                                        backgroundColor: 'white',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8rem',
                                                        color: '#374151',
                                                        textAlign: 'left'
                                                    }}>
                                                        <strong>Feedback:</strong> {assignment.submission.feedback}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {assignment.status === 'pending' && (
                                            <motion.button
                                                whileHover={{scale: 1.05}}
                                                whileTap={{scale: 0.95}}
                                                onClick={() => setSelectedAssignment(assignment)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    width: '100%'
                                                }}
                                            >
                                                Submit
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Submission Modal */}
            <AnimatePresence>
                {selectedAssignment && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }}
                        onClick={() => setSelectedAssignment(null)}
                    >
                        <motion.div
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.9}}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '2rem',
                                width: '100%',
                                maxWidth: '700px',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{
                                margin: '0 0 1.5rem 0',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                Submit Assignment: {selectedAssignment.title}
                            </h2>

                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Text Submission (Optional)
                                </label>
                                <textarea
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    rows={8}
                                    placeholder="Enter your submission text here..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    File Upload (Optional)
                                </label>
                                <div style={{
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                     onDragOver={(e) => {
                                         e.preventDefault()
                                         e.currentTarget.style.borderColor = '#3b82f6'
                                         e.currentTarget.style.backgroundColor = '#f0f9ff'
                                     }}
                                     onDragLeave={(e) => {
                                         e.currentTarget.style.borderColor = '#d1d5db'
                                         e.currentTarget.style.backgroundColor = 'transparent'
                                     }}
                                     onDrop={(e) => {
                                         e.preventDefault()
                                         e.currentTarget.style.borderColor = '#d1d5db'
                                         e.currentTarget.style.backgroundColor = 'transparent'

                                         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                             const file = e.dataTransfer.files[0]
                                             const fakeEvent = {
                                                 target: {files: [file]}
                                             } as any
                                             handleFileChange(fakeEvent)
                                         }
                                     }}>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.txt"
                                        style={{display: 'none'}}
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" style={{cursor: 'pointer'}}>
                                        {submissionFile ? (
                                            <>
                                                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✅</div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#10b981',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {submissionFile.name}
                                                </div>
                                                <div style={{fontSize: '0.85rem', color: '#6b7280'}}>
                                                    {(submissionFile.size / 1024).toFixed(2)} KB
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setSubmissionFile(null)
                                                    }}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Remove File
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📁</div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    Click to upload or drag and drop
                                                </div>
                                                <div style={{fontSize: '0.85rem', color: '#6b7280'}}>
                                                    PDF, DOC, DOCX, or TXT (Max 10MB)
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#fffbeb',
                                borderRadius: '8px',
                                border: '1px solid #fbbf24',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span>🤖</span>
                                    <strong style={{color: '#92400e'}}>AI Detection Notice</strong>
                                </div>
                                <p style={{margin: 0, fontSize: '0.85rem', color: '#92400e'}}>
                                    Your submission will be analyzed for AI-generated content. Make sure your work is
                                    original.
                                </p>
                            </div>

                            <div style={{display: 'flex', gap: '1rem'}}>
                                <button
                                    onClick={() => {
                                        setSelectedAssignment(null)
                                        setSubmissionText('')
                                        setSubmissionFile(null)
                                    }}
                                    disabled={submitting}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem 1.5rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAssignment}
                                    disabled={submitting || (!submissionText && !submissionFile)}
                                    style={{
                                        flex: 2,
                                        padding: '0.875rem 1.5rem',
                                        backgroundColor: submitting || (!submissionText && !submissionFile) ? '#9ca3af' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: submitting || (!submissionText && !submissionFile) ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {submitting ? '📤 Submitting...' : '📤 Submit Assignment'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default AssignmentSubmission
