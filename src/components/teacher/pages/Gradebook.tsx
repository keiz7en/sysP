import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface StudentGrade {
    student_id: string
    student_name: string
    email: string
    course_name: string
    grades: {
        [assignment_id: string]: {
            score: number
            max_points: number
            percentage: number
            submitted_at: string
            assignment_name: string
            assignment_type: string
        }
    }
    overall_grade: number
    grade_letter: string
    attendance_rate: number
    participation_score: number
}

interface Assignment {
    id: string
    name: string
    type: string
    max_points: number
    due_date: string
}

interface Course {
    id: number
    title: string
    code: string
}

const Gradebook: React.FC = () => {
    const {user, token} = useAuth()
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
    const [gradeFilter, setGradeFilter] = useState<'all' | 'pending' | 'graded'>('all')

    // Grading modal state
    const [showGradeModal, setShowGradeModal] = useState(false)
    const [gradingData, setGradingData] = useState<{
        studentId: string
        studentName: string
        assignmentId: string
        assignmentName: string
        maxPoints: number
        currentScore: number | null
    } | null>(null)
    const [gradeScore, setGradeScore] = useState('')
    const [gradeFeedback, setGradeFeedback] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (user && token) {
            fetchGradebook()
            fetchCourses()
        }
    }, [user, token, selectedCourse])

    const fetchGradebook = async () => {
        try {
            setLoading(true)
            const courseParam = selectedCourse !== 'all' ? `?course=${selectedCourse}` : ''
            const response = await fetch(`http://localhost:8000/api/teachers/gradebook/${courseParam}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setStudentGrades(data.students || [])
                setAssignments(data.assignments || [])
            } else {
                // No gradebook data available
                console.log('No gradebook data available from API')
                setStudentGrades([])
                setAssignments([])
            }
        } catch (error) {
            console.error('Error fetching gradebook:', error)
            setStudentGrades([])
            setAssignments([])
            toast.error('Unable to load gradebook. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/teachers/courses/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setCourses(data.courses || [])
            }
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    const exportGrades = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/teachers/export-grades/?course=${selectedCourse}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.style.display = 'none'
                a.href = url
                a.download = `gradebook_${selectedCourse}_${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                toast.success('Gradebook exported successfully')
            } else {
                toast.error('Failed to export gradebook')
            }
        } catch (error) {
            console.error('Error exporting grades:', error)
            toast.error('Error exporting gradebook')
        }
    }

    const sortedStudents = [...studentGrades].sort((a, b) => {
        let aValue, bValue
        switch (sortBy) {
            case 'name':
                aValue = a.student_name.toLowerCase()
                bValue = b.student_name.toLowerCase()
                break
            case 'grade':
                aValue = a.overall_grade
                bValue = b.overall_grade
                break
            case 'attendance':
                aValue = a.attendance_rate
                bValue = b.attendance_rate
                break
            default:
                return 0
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
    })

    const getGradeColor = (percentage: number) => {
        if (percentage >= 80) return '#059669'  // A - green
        if (percentage >= 75) return '#10b981'  // A- - lighter green
        if (percentage >= 70) return '#3b82f6'  // B - blue
        if (percentage >= 65) return '#60a5fa'  // B- - lighter blue
        if (percentage >= 50) return '#d97706'  // C - orange
        if (percentage >= 40) return '#f59e0b'  // D - yellow
        return '#dc2626'  // F - red
    }

    const getGradeLetter = (percentage: number) => {
        if (percentage >= 80) return 'A'
        if (percentage >= 75) return 'A-'
        if (percentage >= 70) return 'B'
        if (percentage >= 65) return 'B-'
        if (percentage >= 50) return 'C'
        if (percentage >= 40) return 'D'
        return 'F'
    }

    const handleGradeClick = (studentId: string, assignmentId: string, assignmentName: string, maxPoints: number, currentScore: number | null) => {
        setGradingData({
            studentId,
            studentName: studentGrades.find(s => s.student_id === studentId)?.student_name || '',
            assignmentId,
            assignmentName,
            maxPoints,
            currentScore
        })
        setShowGradeModal(true)
    }

    const handleGradeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (submitting) return
        setSubmitting(true)
        try {
            const response = await fetch(`http://localhost:8000/api/teachers/gradebook/grade/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: gradingData?.studentId,
                    assignmentId: gradingData?.assignmentId,
                    score: parseInt(gradeScore, 10)
                })
            })

            if (response.ok) {
                toast.success('Grade updated successfully')
                fetchGradebook()
                setShowGradeModal(false)
                setGradeScore('')
                setGradeFeedback('')
            } else {
                const errorData = await response.json()
                console.error('Error response:', errorData)
                toast.error(`Failed to update grade: ${errorData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error updating grade:', error)
            toast.error('Error updating grade')
        } finally {
            setSubmitting(false)
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
                    Loading gradebook...
                </div>
            </div>
        )
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1600px', margin: '0 auto'}}>
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
                        📋 Gradebook
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        Track and manage student grades and performance
                    </p>
                </div>

                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <button
                        onClick={exportGrades}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        📊 Export CSV
                    </button>
                </div>
            </div>

            {/* Grading Scale Legend */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1.5rem'
                }}
            >
                <h4 style={{margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: '600', color: '#374151'}}>
                    📊 Grading Scale
                </h4>
                <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem'}}>
                    <span><strong style={{color: '#059669'}}>A</strong> = 80-100%</span>
                    <span><strong style={{color: '#10b981'}}>A-</strong> = 75-79%</span>
                    <span><strong style={{color: '#3b82f6'}}>B</strong> = 70-74%</span>
                    <span><strong style={{color: '#60a5fa'}}>B-</strong> = 65-69%</span>
                    <span><strong style={{color: '#d97706'}}>C</strong> = 50-64%</span>
                    <span><strong style={{color: '#f59e0b'}}>D</strong> = 40-49%</span>
                    <span><strong style={{color: '#dc2626'}}>F</strong> = 0-39%</span>
                </div>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    marginBottom: '2rem'
                }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <div>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                            Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title} ({course.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="name">Student Name</option>
                            <option value="grade">Overall Grade</option>
                            <option value="attendance">Attendance Rate</option>
                        </select>
                    </div>

                    <div>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                            Order
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>
            </motion.div>

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
                    transition={{delay: 0.1}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem'}}>
                        {studentGrades.length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Students
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
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem'}}>
                        {studentGrades.length > 0 ?
                            (studentGrades.reduce((sum, s) => sum + s.overall_grade, 0) / studentGrades.length).toFixed(1)
                            : '0.0'}%
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Class Average
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
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#059669', marginBottom: '0.5rem'}}>
                        {studentGrades.filter(s => s.overall_grade >= 70).length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Passing Grades
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem'}}>
                        {assignments.length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Assignments
                    </div>
                </motion.div>
            </div>

            {/* Gradebook Table */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.5}}
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
                        Student Grades ({studentGrades.length} students)
                    </h3>
                </div>

                {studentGrades.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📋</div>
                        <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                            No Grades Yet
                        </h3>
                        <p style={{
                            fontSize: '1rem',
                            marginBottom: '2rem',
                            maxWidth: '600px',
                            margin: '0 auto 2rem auto'
                        }}>
                            Grades will appear here once you have students enrolled in courses and assignments created.
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
                                To get started:
                            </h4>
                            <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                                <p style={{margin: '0 0 0.5rem 0'}}>• Add students to your courses</p>
                                <p style={{margin: '0 0 0.5rem 0'}}>• Create assignments and assessments</p>
                                <p style={{margin: '0 0 0.5rem 0'}}>• Students submit their work</p>
                                <p style={{margin: '0'}}>• Grade submissions and track progress</p>
                            </div>
                        </div>
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
                                    color: '#374151',
                                    position: 'sticky',
                                    left: 0,
                                    backgroundColor: '#f9fafb',
                                    zIndex: 1
                                }}>
                                    Student
                                </th>
                                {assignments.map(assignment => (
                                    <th key={assignment.id} style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: '#374151',
                                        minWidth: '100px'
                                    }}>
                                        <div style={{fontSize: '0.875rem'}}>{assignment.name}</div>
                                        <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                                            {assignment.max_points} pts
                                        </div>
                                    </th>
                                ))}
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: '#374151',
                                    backgroundColor: '#f3f4f6'
                                }}>
                                    Overall Grade
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Attendance
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedStudents.map((student) => (
                                <tr key={student.student_id} style={{borderBottom: '1px solid #e5e7eb'}}>
                                    <td style={{
                                        padding: '1rem',
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: 'white',
                                        zIndex: 1
                                    }}>
                                        <div>
                                            <div style={{fontWeight: '600', color: '#1f2937'}}>
                                                {student.student_name}
                                            </div>
                                            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                                {student.email}
                                            </div>
                                        </div>
                                    </td>
                                    {assignments.map(assignment => {
                                        const grade = student.grades[assignment.id]
                                        return (
                                            <td key={assignment.id} style={{
                                                padding: '1rem',
                                                textAlign: 'center'
                                            }}>
                                                {grade ? (
                                                    <div>
                                                        <div style={{
                                                            fontWeight: '600',
                                                            color: getGradeColor(grade.percentage)
                                                        }}>
                                                            {grade.score}/{grade.max_points}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: '#6b7280'
                                                        }}>
                                                            {grade.percentage.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleGradeClick(student.student_id, assignment.id, assignment.name, assignment.max_points, null)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Grade
                                                    </button>
                                                )}
                                            </td>
                                        )
                                    })}
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        backgroundColor: '#f9fafb'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: getGradeColor(student.overall_grade)
                                            }}>
                                                {student.overall_grade.toFixed(1)}%
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontWeight: '600'
                                            }}>
                                                {getGradeLetter(student.overall_grade)}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontWeight: '600',
                                            color: student.attendance_rate >= 90 ? '#059669' :
                                                student.attendance_rate >= 75 ? '#d97706' : '#dc2626'
                                        }}>
                                            {student.attendance_rate.toFixed(1)}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
            {showGradeModal && gradingData && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        width: '500px',
                        maxWidth: '90%'
                    }}>
                        <h2 style={{margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
                            Grade Assignment
                        </h2>
                        <div style={{
                            marginBottom: '1rem',
                            padding: '1rem',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '8px'
                        }}>
                            <div style={{fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.25rem'}}>
                                <strong>Student:</strong> {gradingData.studentName}
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.25rem'}}>
                                <strong>Assignment:</strong> {gradingData.assignmentName}
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#1e40af'}}>
                                <strong>Max Points:</strong> {gradingData.maxPoints}
                            </div>
                        </div>
                        <form onSubmit={handleGradeSubmit}>
                            <div style={{margin: '1rem 0'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Score (0 - {gradingData.maxPoints})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={gradingData.maxPoints}
                                    value={gradeScore}
                                    onChange={(e) => setGradeScore(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
                                    placeholder={`Enter score (0-${gradingData.maxPoints})`}
                                />
                            </div>
                            <div style={{margin: '1rem 0'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Feedback (optional)
                                </label>
                                <textarea
                                    value={gradeFeedback}
                                    onChange={(e) => setGradeFeedback(e.target.value)}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Enter feedback for the student..."
                                />
                            </div>
                            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowGradeModal(false)
                                        setGradeScore('')
                                        setGradeFeedback('')
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !gradeScore}
                                    style={{
                                        flex: 2,
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: (submitting || !gradeScore) ? '#9ca3af' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: (submitting || !gradeScore) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Grade'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Gradebook