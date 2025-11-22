import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {teacherAPI} from '../../../services/api'
import toast from 'react-hot-toast'
import {COURSE_SYLLABI, CourseSyllabus} from '../../../data/courseSyllabi'

interface Course {
    id: number
    title: string
    code: string
    description: string
    credits: number
    difficulty_level: string
    subject_id: number
    subject_name: string
    enrollment_limit: number
    current_enrollments: number
    start_date: string | null
    end_date: string | null
}

interface Subject {
    id: number
    name: string
    code: string
    department: string
}

const CourseManagement: React.FC = () => {
    const {token} = useAuth()
    const [courses, setCourses] = useState<Course[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [showDetails, setShowDetails] = useState(false)

    const [courseForm, setCourseForm] = useState({
        subject_id: 0,
        course_code: '',
        title: '',
        description: '',
        credits: 3,
        difficulty_level: 'Beginner',
        enrollment_limit: 50,
        start_date: '',
        end_date: ''
    })

    useEffect(() => {
        if (token) {
            fetchCourses()
            fetchSubjects()
        }
    }, [token])

    const fetchSubjects = async () => {
        try {
            const data = await teacherAPI.getApprovedSubjects(token!)
            setSubjects(data)
        } catch (error) {
            console.error('Error fetching subjects:', error)
        }
    }

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const data = await teacherAPI.getMyCourses(token!)
            // Ensure data is an array
            setCourses(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching courses:', error)
            setCourses([]) // Set to empty array on error
        } finally {
            setLoading(false)
        }
    }

    const handleCourseCodeChange = (code: string) => {
        const syllabus = COURSE_SYLLABI[code]
        if (syllabus) {
            setCourseForm({
                ...courseForm,
                course_code: code,
                title: syllabus.title,
                credits: syllabus.credits,
                difficulty_level: syllabus.level,
                description: `${syllabus.title} - ${syllabus.level} Level (${syllabus.credits} Credits)\n\nCourse covers ${syllabus.units.length} comprehensive units including: ${syllabus.units.slice(0, 3).map(u => u.title).join(', ')}, and more.`
            })
        } else {
            setCourseForm({
                ...courseForm,
                course_code: code
            })
        }
    }

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!courseForm.subject_id || !courseForm.course_code) {
            toast.error('Please fill in all required fields')
            return
        }

        setCreating(true)

        try {
            const newCourse = await teacherAPI.createCourse(token!, courseForm)
            toast.success('Course created successfully!')
            setCourses([newCourse, ...courses])
            setActiveTab('list')
            setCourseForm({
                subject_id: 0,
                course_code: '',
                title: '',
                description: '',
                credits: 3,
                difficulty_level: 'Beginner',
                enrollment_limit: 50,
                start_date: '',
                end_date: ''
            })
        } catch (error: any) {
            toast.error(error.message || 'Failed to create course')
        } finally {
            setCreating(false)
        }
    }

    const availableCourses = Object.values(COURSE_SYLLABI)

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}}>
                <div style={{marginBottom: '2rem'}}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📚 Course Management
                    </h1>
                    <p style={{color: '#6b7280', fontSize: '1.1rem'}}>
                        Create and manage courses from standardized syllabi
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700'}}>{courses.length}</div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Active Courses</div>
                    </motion.div>

                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700'}}>{subjects.length}</div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Approved Subjects</div>
                    </motion.div>

                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700'}}>
                            {Array.isArray(courses) ? courses.reduce((sum, c) => sum + (c.current_enrollments || 0), 0) : 0}
                        </div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Total Students</div>
                    </motion.div>

                    <motion.div whileHover={{scale: 1.02}} style={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{fontSize: '2.5rem', fontWeight: '700'}}>{Object.keys(COURSE_SYLLABI).length}</div>
                        <div style={{fontSize: '0.95rem', opacity: 0.9}}>Available Syllabi</div>
                    </motion.div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <button
                        onClick={() => setActiveTab('list')}
                        style={{
                            padding: '1rem 2rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: activeTab === 'list' ? '#667eea' : '#6b7280',
                            borderBottom: activeTab === 'list' ? '3px solid #667eea' : 'none'
                        }}
                    >
                        📋 My Courses ({courses.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        style={{
                            padding: '1rem 2rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: activeTab === 'create' ? '#667eea' : '#6b7280',
                            borderBottom: activeTab === 'create' ? '3px solid #667eea' : 'none'
                        }}
                    >
                        ➕ Create Course
                    </button>
                </div>

                {activeTab === 'create' && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            marginBottom: '2rem'
                        }}
                    >
                        <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem'}}>
                            Create New Course from Syllabus
                        </h2>

                        <form onSubmit={handleCreateCourse}>
                            <div style={{display: 'grid', gap: '1.5rem'}}>
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    border: '1px solid #bfdbfe'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span>📚</span>
                                        <strong style={{color: '#1e40af'}}>Standardized Course Syllabi</strong>
                                    </div>
                                    <p style={{margin: 0, color: '#1e40af', fontSize: '0.9rem'}}>
                                        Select from {Object.keys(COURSE_SYLLABI).length} predefined courses with
                                        complete 12-unit syllabi
                                    </p>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Select Course Code *
                                    </label>
                                    <select
                                        value={courseForm.course_code}
                                        onChange={(e) => handleCourseCodeChange(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="">-- Select a course --</option>
                                        {availableCourses.map((course) => (
                                            <option key={course.code} value={course.code}>
                                                {course.code} - {course.title} ({course.level}, {course.credits} Credits)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {courseForm.course_code && (
                                    <>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Course Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={courseForm.title}
                                                readOnly
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    backgroundColor: '#f9fafb'
                                                }}
                                            />
                                        </div>

                                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem'}}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600',
                                                    color: '#374151'
                                                }}>
                                                    Credits
                                                </label>
                                                <input
                                                    type="number"
                                                    value={courseForm.credits}
                                                    readOnly
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                        backgroundColor: '#f9fafb'
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
                                                    Level
                                                </label>
                                                <input
                                                    type="text"
                                                    value={courseForm.difficulty_level}
                                                    readOnly
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                        backgroundColor: '#f9fafb'
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
                                                    Enrollment Limit *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={courseForm.enrollment_limit}
                                                    onChange={(e) => setCourseForm({
                                                        ...courseForm,
                                                        enrollment_limit: Number(e.target.value)
                                                    })}
                                                    min="1"
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Subject/Department *
                                            </label>
                                            <select
                                                value={courseForm.subject_id}
                                                onChange={(e) => setCourseForm({
                                                    ...courseForm,
                                                    subject_id: Number(e.target.value)
                                                })}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                <option value={0}>-- Select subject --</option>
                                                {subjects.map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} ({subject.code})
                                                    </option>
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
                                                Description
                                            </label>
                                            <textarea
                                                value={courseForm.description}
                                                onChange={(e) => setCourseForm({
                                                    ...courseForm,
                                                    description: e.target.value
                                                })}
                                                rows={4}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    resize: 'vertical'
                                                }}
                                            />
                                        </div>

                                        {COURSE_SYLLABI[courseForm.course_code] && (
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '8px',
                                                border: '1px solid #86efac'
                                            }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#166534',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    📖 Course Syllabus (12 Units)
                                                </div>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                    gap: '0.5rem',
                                                    color: '#166534',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {COURSE_SYLLABI[courseForm.course_code].units.map((unit) => (
                                                        <div key={unit.number}>• Unit {unit.number}: {unit.title}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('list')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem 2rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !courseForm.course_code}
                                    style={{
                                        flex: 2,
                                        padding: '1rem 2rem',
                                        backgroundColor: creating || !courseForm.course_code ? '#9ca3af' : '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: creating || !courseForm.course_code ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {creating ? 'Creating...' : '✨ Create Course'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'list' && (
                    <div>
                        {loading ? (
                            <div style={{textAlign: 'center', padding: '4rem'}}>
                                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>Loading courses...</div>
                            </div>
                        ) : courses.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '16px'
                            }}>
                                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📚</div>
                                <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>No Courses Yet</h3>
                                <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                                    Create your first course from standardized syllabi
                                </p>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    style={{
                                        padding: '0.875rem 2rem',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create Course
                                </button>
                            </div>
                        ) : (
                            <div style={{display: 'grid', gap: '1.5rem'}}>
                                {courses.map((course, index) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.1}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '16px',
                                            padding: '2rem',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start'
                                        }}>
                                            <div style={{flex: 1}}>
                                                <h3 style={{
                                                    fontSize: '1.3rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    {course.title}
                                                </h3>
                                                <p style={{color: '#6b7280', marginBottom: '1rem'}}>{course.code}</p>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                    gap: '1rem'
                                                }}>
                                                    <div>
                                                        <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Credits
                                                        </div>
                                                        <div style={{fontWeight: '600'}}>{course.credits}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Level</div>
                                                        <div style={{fontWeight: '600'}}>{course.difficulty_level}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Enrolled
                                                        </div>
                                                        <div style={{fontWeight: '600'}}>
                                                            {course.current_enrollments}/{course.enrollment_limit}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedCourse(course)
                                                    setShowDetails(true)
                                                }}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    backgroundColor: '#667eea',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default CourseManagement