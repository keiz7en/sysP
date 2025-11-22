import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'
import {COURSE_SYLLABI, getCourseByCode, getCourseUnitTitles} from '../../../data/courseSyllabi'

interface Assessment {
    id: number;
    title: string;
    type: 'Quiz' | 'Mid' | 'Final';
    subject: string;
    course_id: number;
    dueDate: string;
    duration: number;
    status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
    score?: number;
    totalMarks: number;
    questionsCount: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    attempts: number;
    bestAttempt?: number;
}

interface AssessmentStats {
    completed: number;
    pending: number;
    averageScore: number;
    totalAssessments: number;
}

interface AIQuestion {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    points: number;
    type: string;
}

interface AIPracticeQuiz {
    assessment_title: string;
    total_duration: number;
    questions: AIQuestion[];
    passing_score: number;
    ai_generated: boolean;
    model: string;
}

interface EnrolledCourse {
    id: number;
    title: string;
    code: string;
    chapters: string[];
}

const AcademicAutomation: React.FC = () => {
    const {token} = useAuth()
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<AssessmentStats>({
        completed: 0,
        pending: 0,
        averageScore: 0,
        totalAssessments: 0
    })
    const [selectedType, setSelectedType] = useState<'all' | 'Quiz' | 'Mid' | 'Final'>('all')

    // AI Practice State
    const [showAIPractice, setShowAIPractice] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)
    const [aiPracticeQuiz, setAiPracticeQuiz] = useState<AIPracticeQuiz | null>(null)
    const [practiceForm, setPracticeForm] = useState({
        course_id: 0,
        exam_type: 'quiz',
        chapter: '',
        difficulty: 'intermediate',
        num_questions: 5
    })

    // Take Exam State
    const [takingExam, setTakingExam] = useState<Assessment | null>(null)
    const [examAnswers, setExamAnswers] = useState<{ [key: number]: string }>({})
    const [examTimeRemaining, setExamTimeRemaining] = useState(0)
    const [examAttemptId, setExamAttemptId] = useState<number | null>(null)
    const [examData, setExamData] = useState<any>(null)
    const [answerText, setAnswerText] = useState('')
    const [answerFile, setAnswerFile] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (token) {
            fetchAssessments()
            fetchEnrolledCourses()
        }
    }, [token])

    useEffect(() => {
        if (takingExam && examTimeRemaining > 0) {
            const timer = setTimeout(() => {
                setExamTimeRemaining(examTimeRemaining - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else if (takingExam && examTimeRemaining === 0) {
            handleSubmitExam()
        }
    }, [examTimeRemaining, takingExam])

    const fetchEnrolledCourses = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/students/dashboard/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                const courses = data.current_enrollments?.map((enrollment: any) => {
                    const courseCode = enrollment.course_code
                    const syllabus = getCourseByCode(courseCode)
                    const chapters = syllabus ? syllabus.units.map(unit => unit.title) : []

                    return {
                        id: enrollment.course_id,
                        title: enrollment.course_title,
                        code: courseCode,
                        chapters: chapters
                    }
                }) || []

                setEnrolledCourses(courses)
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error)
        }
    }

    const fetchCourseSyllabus = async (courseId: number) => {
        // Removed - syllabus now comes from courseSyllabi.ts
    }

    const fetchAssessments = async () => {
        try {
            setLoading(true)

            if (!token) {
                setAssessments([])
                setStats({completed: 0, pending: 0, averageScore: 0, totalAssessments: 0})
                return
            }

            const response = await fetch('http://localhost:8000/api/students/assessments/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                const apiAssessments: Assessment[] = []

                if (data.upcoming_assessments) {
                    data.upcoming_assessments.forEach((assessment: any) => {
                        apiAssessments.push({
                            id: assessment.id,
                            title: assessment.title,
                            type: assessment.type as 'Quiz' | 'Mid' | 'Final',
                            subject: assessment.course,
                            course_id: assessment.course_id,
                            dueDate: assessment.due_date,
                            duration: assessment.duration || 60,
                            status: 'upcoming',
                            totalMarks: assessment.total_marks,
                            questionsCount: assessment.questions_count || 10,
                            difficulty: 'Medium',
                            attempts: 0
                        })
                    })
                }

                if (data.recent_results) {
                    data.recent_results.forEach((result: any) => {
                        apiAssessments.push({
                            id: result.assessment_id || Math.random(),
                            title: result.assessment_title,
                            type: result.type || 'Quiz',
                            subject: result.course,
                            course_id: result.course_id,
                            dueDate: result.submitted_at,
                            duration: 60,
                            status: 'completed',
                            score: result.score,
                            totalMarks: result.total_marks,
                            questionsCount: result.questions_count || 10,
                            difficulty: 'Medium',
                            attempts: result.attempts || 1,
                            bestAttempt: result.score
                        })
                    })
                }

                setAssessments(apiAssessments)

                if (data.summary) {
                    setStats({
                        completed: data.summary.completed_total || 0,
                        pending: data.summary.total_upcoming || 0,
                        averageScore: data.summary.average_score || 0,
                        totalAssessments: apiAssessments.length
                    })
                }
            } else {
                setAssessments([])
                setStats({completed: 0, pending: 0, averageScore: 0, totalAssessments: 0})
            }
        } catch (error) {
            console.error('Error fetching assessments:', error)
            toast.error('Failed to load assessments')
        } finally {
            setLoading(false)
        }
    }

    const generateAIPracticeQuiz = async () => {
        if (!practiceForm.course_id || !practiceForm.chapter) {
            toast.error('Please select a course and chapter')
            return
        }

        setAiGenerating(true)
        const loadingToast = toast.loading('🤖 AI is generating practice questions...')

        try {
            const selectedCourse = enrolledCourses.find(c => c.id === practiceForm.course_id)

            const response = await fetch('http://localhost:8000/api/students/generate-ai-assessment/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: `${selectedCourse?.title} - ${practiceForm.chapter}`,
                    difficulty: practiceForm.difficulty,
                    num_questions: practiceForm.num_questions,
                    assessment_type: practiceForm.exam_type
                })
            })

            const data = await response.json()

            if (response.ok) {
                setAiPracticeQuiz(data)
                toast.dismiss(loadingToast)
                toast.success(`✨ Generated ${practiceForm.num_questions} practice questions!`, {duration: 5000})
            } else {
                toast.dismiss(loadingToast)
                toast.error(data.error || 'Failed to generate practice quiz')
            }
        } catch (error) {
            console.error('Error generating practice quiz:', error)
            toast.dismiss(loadingToast)
            toast.error('Network error. Please try again.')
        } finally {
            setAiGenerating(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const maxSize = 25 * 1024 * 1024 // 25MB

            if (file.size > maxSize) {
                toast.error('File size exceeds 25MB limit')
                e.target.value = ''
                return
            }

            const allowedTypes = ['.pdf', '.doc', '.docx', '.txt']
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            if (!allowedTypes.includes(fileExt)) {
                toast.error('File type not allowed. Please upload PDF, DOC, DOCX, or TXT files.')
                e.target.value = ''
                return
            }

            setAnswerFile(file)
            toast.success(`File "${file.name}" selected`)
        }
    }

    const handleStartExam = async (assessment: Assessment) => {
        try {
            const response = await fetch(`http://localhost:8000/api/students/exams/${assessment.id}/start/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (response.ok) {
                setTakingExam(assessment)
                setExamAttemptId(data.attempt_id)
                setExamData(data.exam)
                setExamTimeRemaining(data.time_remaining_seconds)
                setExamAnswers({})
                setAnswerText('')
                setAnswerFile(null)

                if (data.is_resumed) {
                    toast.success(`Resuming ${assessment.title}. You have ${Math.floor(data.time_remaining_seconds / 60)} minutes remaining.`)
                } else {
                    toast.success(`Starting ${assessment.title}. Good luck!`)
                }
            } else {
                toast.error(data.error || 'Failed to start exam')
            }
        } catch (error) {
            console.error('Error starting exam:', error)
            toast.error('Network error. Please try again.')
        }
    }

    const handleSubmitExam = async () => {
        if (!takingExam || !examAttemptId) return

        if (!answerText && !answerFile) {
            toast.error('Please provide answers (either text or file upload)')
            return
        }

        if (window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
            setSubmitting(true)
            const loadingToast = toast.loading('Submitting your exam...')

            try {
                const formData = new FormData()
                formData.append('answer_text', answerText)
                if (answerFile) {
                    formData.append('answer_file', answerFile)
                }

                const response = await fetch(`http://localhost:8000/api/students/exam-attempts/${examAttemptId}/submit/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`
                    },
                    body: formData
                })

                const data = await response.json()

                toast.dismiss(loadingToast)

                if (response.ok) {
                    toast.success(data.message || 'Exam submitted successfully!')
                    setTakingExam(null)
                    setExamAttemptId(null)
                    setExamData(null)
                    setExamAnswers({})
                    setAnswerText('')
                    setAnswerFile(null)
                    fetchAssessments() // Refresh assessments
                } else {
                    toast.error(data.error || 'Failed to submit exam')
                }
            } catch (error) {
                toast.dismiss(loadingToast)
                console.error('Error submitting exam:', error)
                toast.error('Network error. Please try again.')
            } finally {
                setSubmitting(false)
            }
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getStatusColor = (status: Assessment['status']) => {
        switch (status) {
            case 'upcoming':
                return '#3b82f6'
            case 'in-progress':
                return '#f59e0b'
            case 'completed':
                return '#10b981'
            case 'overdue':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const getStatusIcon = (status: Assessment['status']) => {
        switch (status) {
            case 'upcoming':
                return '⏰'
            case 'in-progress':
                return '⚡'
            case 'completed':
                return '✅'
            case 'overdue':
                return '⚠️'
            default:
                return '📝'
        }
    }

    const filteredAssessments = selectedType === 'all'
        ? assessments
        : assessments.filter(a => a.type === selectedType)

    if (loading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px'}}>
                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>Loading assessments...</div>
            </div>
        )
    }

    // Exam Taking View
    if (takingExam) {
        return (
            <div style={{padding: '2rem', maxWidth: '900px', margin: '0 auto'}}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '2px solid #3b82f6'
                }}>
                    {/* Exam Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid #e5e7eb'
                    }}>
                        <div>
                            <h2 style={{margin: 0, color: '#1f2937', fontSize: '1.8rem'}}>{takingExam.title}</h2>
                            <p style={{margin: '0.5rem 0 0 0', color: '#6b7280'}}>
                                {takingExam.subject} • {takingExam.totalMarks} marks
                                • {takingExam.questionsCount} questions
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: examTimeRemaining < 300 ? '#fef2f2' : '#eff6ff',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            border: `2px solid ${examTimeRemaining < 300 ? '#ef4444' : '#3b82f6'}`
                        }}>
                            <div style={{fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem'}}>
                                Time Remaining
                            </div>
                            <div style={{
                                fontSize: '1.8rem',
                                fontWeight: '700',
                                color: examTimeRemaining < 300 ? '#ef4444' : '#3b82f6'
                            }}>
                                {formatTime(examTimeRemaining)}
                            </div>
                        </div>
                    </div>

                    {/* Question File Download */}
                    {examData?.questions_file_url && (
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '12px',
                            border: '2px solid #3b82f6'
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                <div style={{fontSize: '2.5rem'}}>📄</div>
                                <div style={{flex: 1}}>
                                    <h3 style={{margin: 0, fontSize: '1.1rem', color: '#1f2937'}}>
                                        Exam Questions File
                                    </h3>
                                    <p style={{margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem'}}>
                                        {examData.questions_filename || 'Download questions file'}
                                    </p>
                                </div>
                                <a
                                    href={`http://localhost:8000${examData.questions_file_url}`}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    📥 Download
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Answer Section */}
                    <div style={{marginBottom: '2rem'}}>
                        <h3 style={{marginBottom: '1rem', color: '#1f2937', fontSize: '1.3rem'}}>
                            ✍️ Your Answers
                        </h3>

                        {/* Text Answer Area */}
                        <div style={{marginBottom: '1.5rem'}}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Write your answers here:
                            </label>
                            <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Type your answers here... You can write your complete answers or provide question numbers with answers."
                                style={{
                                    width: '100%',
                                    minHeight: '300px',
                                    padding: '1rem',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{
                                marginTop: '0.5rem',
                                fontSize: '0.85rem',
                                color: '#6b7280'
                            }}>
                                {answerText.length} characters
                            </div>
                        </div>

                        {/* OR Divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{flex: 1, height: '1px', backgroundColor: '#d1d5db'}}/>
                            <span style={{color: '#6b7280', fontWeight: '600'}}>OR</span>
                            <div style={{flex: 1, height: '1px', backgroundColor: '#d1d5db'}}/>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Upload your answer file (PDF, DOC, DOCX, TXT - Max 25MB):
                            </label>
                            <div style={{
                                border: '2px dashed #d1d5db',
                                borderRadius: '8px',
                                padding: '2rem',
                                textAlign: 'center',
                                backgroundColor: '#f9fafb'
                            }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt"
                                    style={{display: 'none'}}
                                    id="answer-file-upload"
                                />
                                {answerFile ? (
                                    <div>
                                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✅</div>
                                        <div style={{
                                            fontWeight: '600',
                                            color: '#10b981',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {answerFile.name}
                                        </div>
                                        <div style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem'}}>
                                            {(answerFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                        <button
                                            onClick={() => {
                                                setAnswerFile(null)
                                                const input = document.getElementById('answer-file-upload') as HTMLInputElement
                                                if (input) input.value = ''
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📎</div>
                                        <label
                                            htmlFor="answer-file-upload"
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'inline-block',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Choose File
                                        </label>
                                        <div style={{
                                            marginTop: '1rem',
                                            fontSize: '0.85rem',
                                            color: '#6b7280'
                                        }}>
                                            Supported formats: PDF, DOC, DOCX, TXT (Max 25MB)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!answerText && !answerFile && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: '#fef3c7',
                                borderRadius: '8px',
                                border: '1px solid #fbbf24',
                                color: '#92400e',
                                fontSize: '0.9rem'
                            }}>
                                ⚠️ Please provide your answers either by typing them above OR uploading a file.
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to cancel? Your progress will be saved and you can resume later.')) {
                                    setTakingExam(null)
                                }
                            }}
                            disabled={submitting}
                            style={{
                                flex: 1,
                                padding: '1rem 2rem',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                opacity: submitting ? 0.5 : 1
                            }}
                        >
                            Save & Exit
                        </button>
                        <button
                            onClick={handleSubmitExam}
                            disabled={submitting || (!answerText && !answerFile)}
                            style={{
                                flex: 2,
                                padding: '1rem 2rem',
                                backgroundColor: (!answerText && !answerFile) || submitting ? '#9ca3af' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: (!answerText && !answerFile) || submitting ? 'not-allowed' : 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {submitting ? '📤 Submitting...' : '✅ Submit Exam'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}}
                    style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            {/* Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div>
                    <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937'}}>
                        ⚡ AI Assessments & Exams
                    </h1>
                    <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                        Take exams, practice with AI-generated questions, and track your performance
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <motion.div
                    whileHover={{scale: 1.02}}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📊</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {stats.totalAssessments}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Total Assessments</div>
                </motion.div>

                <motion.div
                    whileHover={{scale: 1.02}}
                    style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⏳</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {stats.pending}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Pending</div>
                </motion.div>

                <motion.div
                    whileHover={{scale: 1.02}}
                    style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✅</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {stats.completed}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Completed</div>
                </motion.div>

                <motion.div
                    whileHover={{scale: 1.02}}
                    style={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🎯</div>
                    <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                        {stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
                    </div>
                    <div style={{fontSize: '0.9rem', opacity: 0.9}}>Average Score</div>
                </motion.div>
            </div>

            {/* AI Practice Section */}
            <div style={{
                marginBottom: '2rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <h2 style={{fontSize: '1.5rem', fontWeight: '600', margin: 0, color: '#1f2937'}}>
                            🤖 AI Practice Assistant
                        </h2>
                        <p style={{margin: '0.5rem 0 0 0', color: '#6b7280'}}>
                            Generate personalized practice questions from your course materials
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAIPractice(!showAIPractice)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        {showAIPractice ? 'Hide' : 'Generate Practice Quiz'}
                    </button>
                </div>

                {showAIPractice && (
                    <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}}
                                style={{marginTop: '1.5rem'}}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Select Course *
                                </label>
                                <select
                                    value={practiceForm.course_id}
                                    onChange={(e) => setPracticeForm({
                                        ...practiceForm,
                                        course_id: Number(e.target.value),
                                        chapter: ''
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <option value={0}>-- Select a course --</option>
                                    {enrolledCourses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Select Chapter/Topic *
                                </label>
                                <select
                                    value={practiceForm.chapter}
                                    onChange={(e) => setPracticeForm({...practiceForm, chapter: e.target.value})}
                                    disabled={!practiceForm.course_id}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        backgroundColor: !practiceForm.course_id ? '#f3f4f6' : 'white'
                                    }}
                                >
                                    <option value="">-- Select a chapter --</option>
                                    {enrolledCourses
                                        .find(c => c.id === practiceForm.course_id)
                                        ?.chapters.map((chapter, idx) => (
                                            <option key={idx} value={chapter}>{chapter}</option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Exam Type
                                </label>
                                <select
                                    value={practiceForm.exam_type}
                                    onChange={(e) => setPracticeForm({...practiceForm, exam_type: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <option value="quiz">Quiz</option>
                                    <option value="mid">Mid Term</option>
                                    <option value="final">Final Exam</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Difficulty
                                </label>
                                <select
                                    value={practiceForm.difficulty}
                                    onChange={(e) => setPracticeForm({...practiceForm, difficulty: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Number of Questions
                                </label>
                                <input
                                    type="number"
                                    min="3"
                                    max="20"
                                    value={practiceForm.num_questions}
                                    onChange={(e) => setPracticeForm({
                                        ...practiceForm,
                                        num_questions: parseInt(e.target.value)
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={generateAIPracticeQuiz}
                            disabled={aiGenerating || !practiceForm.course_id || !practiceForm.chapter}
                            style={{
                                width: '100%',
                                padding: '1rem 2rem',
                                backgroundColor: aiGenerating || !practiceForm.course_id || !practiceForm.chapter ? '#9ca3af' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: aiGenerating || !practiceForm.course_id || !practiceForm.chapter ? 'not-allowed' : 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {aiGenerating ? '🤖 Generating Practice Questions...' : '✨ Generate AI Practice Quiz'}
                        </button>

                        {aiPracticeQuiz && (
                            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} style={{
                                marginTop: '2rem',
                                padding: '2rem',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '12px',
                                border: '2px solid #3b82f6'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <span style={{fontSize: '2.5rem'}}>✨</span>
                                    <div>
                                        <h3 style={{margin: 0, fontSize: '1.3rem', color: '#1f2937'}}>
                                            {aiPracticeQuiz.assessment_title}
                                        </h3>
                                        <p style={{margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem'}}>
                                            Duration: {aiPracticeQuiz.total_duration} min •
                                            Passing: {aiPracticeQuiz.passing_score}%
                                            • {aiPracticeQuiz.questions.length} Questions
                                        </p>
                                    </div>
                                </div>

                                <div style={{display: 'grid', gap: '1.5rem'}}>
                                    {aiPracticeQuiz.questions.map((question, index) => (
                                        <div key={index} style={{
                                            backgroundColor: 'white',
                                            padding: '1.5rem',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                                                <div style={{
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    width: '35px',
                                                    height: '35px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '700',
                                                    flexShrink: 0
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <div style={{flex: 1}}>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: '#1f2937',
                                                        marginBottom: '0.5rem',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {question.question}
                                                    </div>
                                                    <div style={{fontSize: '0.85rem', color: '#6b7280'}}>
                                                        {question.points} points
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{display: 'grid', gap: '0.75rem', marginBottom: '1rem'}}>
                                                {question.options.map((option, optIdx) => (
                                                    <div key={optIdx} style={{
                                                        padding: '0.75rem 1rem',
                                                        backgroundColor: '#f9fafb',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        fontSize: '0.95rem',
                                                        color: '#374151'
                                                    }}>
                                                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {option}
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#dcfce7',
                                                borderRadius: '8px',
                                                border: '1px solid #86efac'
                                            }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#166534',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    ✓ Correct Answer: {question.correct_answer}
                                                </div>
                                                <div style={{fontSize: '0.9rem', color: '#166534'}}>
                                                    {question.explanation}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    color: '#6b7280'
                                }}>
                                    ✨ Powered by {aiPracticeQuiz.model} • AI-Generated Practice Questions
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
            }}>
                {(['all', 'Quiz', 'Mid', 'Final'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            backgroundColor: selectedType === type ? '#3b82f6' : '#f3f4f6',
                            color: selectedType === type ? 'white' : '#374151'
                        }}
                    >
                        {type === 'all' ? 'All Assessments' : `${type}${type === 'Quiz' ? 'zes' : ' Exams'}`}
                        {type !== 'all' && ` (${assessments.filter(a => a.type === type).length})`}
                    </button>
                ))}
            </div>

            {/* Assessments List */}
            {filteredAssessments.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '12px',
                    color: '#6b7280',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📝</div>
                    <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937'}}>No Assessments Found</h3>
                    <p style={{fontSize: '1rem', marginBottom: '1rem'}}>
                        {selectedType === 'all'
                            ? 'No assessments available at the moment.'
                            : `No ${selectedType.toLowerCase()} assessments available.`}
                    </p>
                    <p style={{fontSize: '0.9rem', color: '#9ca3af'}}>
                        Use the AI Practice Assistant above to generate practice questions!
                    </p>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <AnimatePresence>
                        {filteredAssessments.map((assessment, index) => (
                            <motion.div
                                key={assessment.id}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                transition={{delay: index * 0.1}}
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
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{fontSize: '1.5rem'}}>
                                                {assessment.type === 'Quiz' ? '❓' : assessment.type === 'Mid' ? '📊' : '📝'}
                                            </div>
                                            <div>
                                                <h3 style={{
                                                    fontSize: '1.3rem',
                                                    fontWeight: '600',
                                                    margin: 0,
                                                    color: '#1f2937'
                                                }}>
                                                    {assessment.title}
                                                </h3>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    marginTop: '0.5rem'
                                                }}>
                                                    <span style={{
                                                        color: '#6b7280',
                                                        fontSize: '0.9rem'
                                                    }}>{assessment.subject}</span>
                                                    <span style={{
                                                        background: '#f3f4f6',
                                                        color: '#374151',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {assessment.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    fontSize: '0.9rem'
                                                }}>Due Date
                                                </div>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.9rem'
                                                }}>{new Date(assessment.dueDate).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    fontSize: '0.9rem'
                                                }}>Duration
                                                </div>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.9rem'
                                                }}>{assessment.duration} minutes
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    fontSize: '0.9rem'
                                                }}>Questions
                                                </div>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.9rem'
                                                }}>{assessment.questionsCount}</div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#374151',
                                                    fontSize: '0.9rem'
                                                }}>Total Marks
                                                </div>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.9rem'
                                                }}>{assessment.totalMarks}</div>
                                            </div>
                                        </div>
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
                                            backgroundColor: getStatusColor(assessment.status) + '20',
                                            borderRadius: '20px',
                                            border: `1px solid ${getStatusColor(assessment.status)}40`
                                        }}>
                                            <span style={{fontSize: '1rem'}}>{getStatusIcon(assessment.status)}</span>
                                            <span style={{
                                                color: getStatusColor(assessment.status),
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {assessment.status.replace('-', ' ')}
                                            </span>
                                        </div>

                                        {assessment.status === 'upcoming' ? (
                                            <motion.button
                                                whileHover={{scale: 1.05}}
                                                whileTap={{scale: 0.95}}
                                                onClick={() => handleStartExam(assessment)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    minWidth: '120px'
                                                }}
                                            >
                                                Start Exam
                                            </motion.button>
                                        ) : assessment.status === 'completed' && assessment.score !== undefined ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '0.75rem',
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '8px',
                                                border: '1px solid #10b981'
                                            }}>
                                                <div style={{fontSize: '1.2rem', fontWeight: '700', color: '#10b981'}}>
                                                    {assessment.score}%
                                                </div>
                                                <div style={{fontSize: '0.8rem', color: '#6b7280'}}>
                                                    {assessment.attempts > 1 && `Best of ${assessment.attempts} attempts`}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    )
}

export default AcademicAutomation
