import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import toast from 'react-hot-toast'
import {useAuth} from '../../../contexts/AuthContext'
import {teacherAPI} from '../../../services/api'

interface Student {
    id: number
    student_id: string
    name: string
    email: string
    phone: string
    grade_level: string
    current_gpa: number
    academic_status: string
    enrollment_date: string
    course_title: string
    progress: number
    status: string
}

interface Course {
    id: number
    title: string
    code: string
    enrolled_students: number
    enrollment_limit: number
}

const StudentManagement: React.FC = () => {
    const {user, token} = useAuth()
    const [students, setStudents] = useState<Student[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState('')

    // Add student form state
    const [addStudentForm, setAddStudentForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        grade_level: '',
        course_id: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        emergency_contact: '',
        emergency_phone: '',
        learning_style: 'adaptive'
    })

    const [bulkStudentData, setBulkStudentData] = useState('')

    useEffect(() => {
        if (user && token) {
            fetchStudents()
            fetchCourses()
        }
    }, [user, token])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            if (!token) return

            const data = await teacherAPI.getStudents(token)
            setStudents(data.students || [])
        } catch (error: any) {
            console.error('Error fetching students:', error)
            toast.error(error.message || 'Error fetching students')
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            if (!token) return

            const data = await teacherAPI.getCourses(token)
            setCourses(data.courses || [])
        } catch (error: any) {
            console.error('Error fetching courses:', error)
            // Don't show error toast for courses as it's not critical
        }
    }

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!addStudentForm.course_id) {
            toast.error('Please select a course')
            return
        }

        try {
            const data = await teacherAPI.addStudent(token!, addStudentForm)

            toast.success(`Student added successfully! 
                Username: ${data.student.username}
                Temporary Password: ${data.student.temporary_password}
                Student ID: ${data.student.student_id}`, {
                duration: 10000
            })

            setShowAddModal(false)
            setAddStudentForm({
                first_name: '',
                last_name: '',
                email: '',
                phone_number: '',
                grade_level: '',
                course_id: '',
                guardian_name: '',
                guardian_phone: '',
                guardian_email: '',
                emergency_contact: '',
                emergency_phone: '',
                learning_style: 'adaptive'
            })
            fetchStudents()
        } catch (error: any) {
            console.error('Error adding student:', error)
            toast.error(error.message || 'Failed to add student')
        }
    }

    const handleRemoveStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to remove this student from the course?')) {
            return
        }

        try {
            await teacherAPI.removeStudent(token!, studentId)
            toast.success('Student removed successfully')
            fetchStudents()
        } catch (error: any) {
            console.error('Error removing student:', error)
            toast.error(error.message || 'Failed to remove student')
        }
    }

    const handleBulkUpload = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedCourse || !bulkStudentData.trim()) {
            toast.error('Please select a course and provide student data')
            return
        }

        try {
            // Parse CSV/JSON data
            const lines = bulkStudentData.trim().split('\n')
            const students = []

            for (let i = 1; i < lines.length; i++) { // Skip header
                const [firstName, lastName, email, phone, gradeLevel, guardianName, guardianPhone, guardianEmail] = lines[i].split(',')

                if (firstName && lastName && email) {
                    students.push({
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        email: email.trim(),
                        phone_number: phone?.trim() || '',
                        grade_level: gradeLevel?.trim() || '',
                        guardian_name: guardianName?.trim() || '',
                        guardian_phone: guardianPhone?.trim() || '',
                        guardian_email: guardianEmail?.trim() || ''
                    })
                }
            }

            const data = await teacherAPI.bulkUploadStudents(token!, {
                course_id: selectedCourse,
                students: students
            })

            toast.success(data.message)

            // Show successful additions
            if (data.successful_additions.length > 0) {
                console.log('Successfully added students:', data.successful_additions)
            }

            // Show failed additions
            if (data.failed_additions.length > 0) {
                console.log('Failed additions:', data.failed_additions)
                toast.error(`${data.failed_additions.length} students failed to add. Check console for details.`)
            }

            setShowBulkModal(false)
            setBulkStudentData('')
            setSelectedCourse('')
            fetchStudents()
        } catch (error: any) {
            console.error('Error bulk uploading students:', error)
            toast.error(error.message || 'Error processing bulk upload')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#10b981'
            case 'dropped':
                return '#ef4444'
            case 'suspended':
                return '#f59e0b'
            default:
                return '#6b7280'
        }
    }

    const getGpaColor = (gpa: number) => {
        if (gpa >= 3.5) return '#10b981'
        if (gpa >= 3.0) return '#3b82f6'
        if (gpa >= 2.5) return '#f59e0b'
        return '#ef4444'
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
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        👥 Student Management
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        Add, view, and manage students in your courses
                    </p>
                </div>

                <div style={{display: 'flex', gap: '1rem'}}>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                    >
                        📤 Bulk Add
                    </button>

                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        ➕ Add Student
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
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
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem'}}>
                        {students.length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Total Students
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
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem'}}>
                        {students.filter(s => s.status === 'active').length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Active Students
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
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem'}}>
                        {courses.length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        My Courses
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
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.5rem'}}>
                        {students.length > 0 ? (students.reduce((sum, s) => sum + s.current_gpa, 0) / students.length).toFixed(1) : '0.0'}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Average GPA
                    </div>
                </motion.div>
            </div>

            {/* Students Table */}
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
                        Students List
                    </h3>
                </div>

                {loading ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        Loading students...
                    </div>
                ) : students.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>👥</div>
                        <p style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>No students enrolled yet</p>
                        <p style={{fontSize: '0.9rem', marginBottom: '2rem'}}>
                            Add your first student to get started with teaching!
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
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
                            ➕ Add First Student
                        </button>
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
                                }}>ID
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Contact
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Course
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>GPA
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Progress
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
                            {students.map((student, index) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: index * 0.05}}
                                    style={{borderBottom: '1px solid #e5e7eb'}}
                                >
                                    <td style={{padding: '1rem'}}>
                                        <div>
                                            <div style={{fontWeight: '600', color: '#1f2937'}}>
                                                {student.name}
                                            </div>
                                            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                                Grade: {student.grade_level || 'Not specified'}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: '#ddd6fe',
                                                color: '#7c3aed',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600'
                                            }}>
                                                {student.student_id}
                                            </span>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                        <div>
                                            <div style={{fontSize: '0.875rem', color: '#1f2937'}}>
                                                {student.email}
                                            </div>
                                            {student.phone && (
                                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                                    {student.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                        <div style={{fontSize: '0.875rem', color: '#1f2937', fontWeight: '500'}}>
                                            {student.course_title}
                                        </div>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                            <span style={{
                                                color: getGpaColor(student.current_gpa),
                                                fontWeight: '600'
                                            }}>
                                                {student.current_gpa.toFixed(1)}
                                            </span>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                        <div style={{width: '100px'}}>
                                            <div style={{
                                                width: '100%',
                                                height: '6px',
                                                backgroundColor: '#e5e7eb',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${student.progress}%`,
                                                    height: '100%',
                                                    backgroundColor: '#3b82f6',
                                                    borderRadius: '3px'
                                                }}/>
                                            </div>
                                            <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                                                {student.progress.toFixed(0)}%
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: student.status === 'active' ? '#dcfce7' : '#fee2e2',
                                                color: getStatusColor(student.status),
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {student.status}
                                            </span>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                        <button
                                            onClick={() => handleRemoveStudent(student.student_id)}
                                            style={{
                                                padding: '0.5rem',
                                                backgroundColor: '#fef2f2',
                                                color: '#dc2626',
                                                border: '1px solid #fecaca',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Add Student Modal */}
            <AnimatePresence>
                {showAddModal && (
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
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.9}}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '2rem',
                                width: '100%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '700'}}>
                                ➕ Add New Student
                            </h2>

                            <form onSubmit={handleAddStudent}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addStudentForm.first_name}
                                            onChange={(e) => setAddStudentForm({
                                                ...addStudentForm,
                                                first_name: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addStudentForm.last_name}
                                            onChange={(e) => setAddStudentForm({
                                                ...addStudentForm,
                                                last_name: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{marginBottom: '1rem'}}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={addStudentForm.email}
                                        onChange={(e) => setAddStudentForm({...addStudentForm, email: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={addStudentForm.phone_number}
                                            onChange={(e) => setAddStudentForm({
                                                ...addStudentForm,
                                                phone_number: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            Grade Level
                                        </label>
                                        <input
                                            type="text"
                                            value={addStudentForm.grade_level}
                                            onChange={(e) => setAddStudentForm({
                                                ...addStudentForm,
                                                grade_level: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{marginBottom: '1rem'}}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Course *
                                    </label>
                                    <select
                                        required
                                        value={addStudentForm.course_id}
                                        onChange={(e) => setAddStudentForm({
                                            ...addStudentForm,
                                            course_id: e.target.value
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <option value="">Select a course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.title} ({course.code})
                                                - {course.enrolled_students}/{course.enrollment_limit} students
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'flex-end',
                                    marginTop: '2rem'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add Student
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {showBulkModal && (
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
                        onClick={() => setShowBulkModal(false)}
                    >
                        <motion.div
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.9}}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '2rem',
                                width: '100%',
                                maxWidth: '700px',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '700'}}>
                                📤 Bulk Add Students
                            </h2>

                            <div style={{
                                marginBottom: '1rem',
                                padding: '1rem',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                border: '1px solid #bae6fd'
                            }}>
                                <h4 style={{margin: '0 0 0.5rem 0', color: '#1e40af'}}>CSV Format:</h4>
                                <code style={{fontSize: '0.875rem', color: '#374151'}}>
                                    First Name,Last Name,Email,Phone,Grade Level,Guardian Name,Guardian Phone,Guardian
                                    Email
                                    <br/>
                                    John,Doe,john@example.com,123-456-7890,Grade 10,Jane
                                    Doe,123-456-7891,jane@example.com
                                </code>
                            </div>

                            <form onSubmit={handleBulkUpload}>
                                <div style={{marginBottom: '1rem'}}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Course *
                                    </label>
                                    <select
                                        required
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
                                        <option value="">Select a course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.title} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{marginBottom: '1rem'}}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Student Data (CSV Format) *
                                    </label>
                                    <textarea
                                        required
                                        value={bulkStudentData}
                                        onChange={(e) => setBulkStudentData(e.target.value)}
                                        placeholder="Paste your CSV data here..."
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkModal(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#8b5cf6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Upload Students
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default StudentManagement