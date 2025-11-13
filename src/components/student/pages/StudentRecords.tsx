import React, {useState, useEffect} from 'react'
import { motion } from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {getAcademicRecords} from '../../../services/api'
import toast from 'react-hot-toast'

interface AcademicRecord {
    course_title: string
    course_code: string
    instructor: string
    grade: string
    credits: number
    semester: string
    progress_percentage: number
    final_score: number
    status: 'in_progress' | 'completed' | 'dropped'
}

interface TranscriptData {
    student_info: {
        student_id: string
        full_name: string
        current_gpa: number
        total_credits: number
        academic_standing: string
        enrollment_date: string
    }
    academic_records: AcademicRecord[]
    gpa_by_semester: {
        [semester: string]: number
    }
}

const StudentRecords: React.FC = () => {
    const {user, token} = useAuth()
    const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedSemester, setSelectedSemester] = useState('all')

    useEffect(() => {
        if (user && token) {
            fetchAcademicRecords()
        }
    }, [user, token])

    const fetchAcademicRecords = async () => {
        try {
            setLoading(true)
            const data = await getAcademicRecords(token!)
            setTranscriptData(data)
        } catch (error: any) {
            console.error('Error fetching academic records:', error)
            toast.error('Error loading academic records')
        } finally {
            setLoading(false)
        }
    }

    const getGradeColor = (grade: string, score: number) => {
        if (grade === 'In Progress') return '#d97706'
        if (score >= 90) return '#059669'
        if (score >= 80) return '#3b82f6'
        if (score >= 70) return '#f59e0b'
        return '#dc2626'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return '#059669'
            case 'in_progress':
                return '#d97706'
            case 'dropped':
                return '#dc2626'
            default:
                return '#6b7280'
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
                    Loading academic records...
                </div>
            </div>
        )
    }

    if (!transcriptData || transcriptData.academic_records.length === 0) {
        return (
            <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    📊 Academic Records
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '2rem'
                }}>
                    Track your grades, view transcripts, and get AI-powered academic insights
                </p>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        padding: '3rem',
                        textAlign: 'center'
                    }}
                >
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📚</div>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                        No Academic Records Yet
                    </h3>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        Your academic records and transcripts will appear here once you're enrolled in courses and
                        complete coursework.
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
                            What you'll see here:
                        </h4>
                        <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Course grades and transcripts</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• GPA calculation and tracking</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Semester-wise academic performance</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Progress analytics and insights</p>
                            <p style={{margin: '0'}}>• AI-powered academic recommendations</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    const semesters = [...new Set(transcriptData?.academic_records?.map(record => record.semester) || [])]
    const filteredRecords = selectedSemester === 'all' ?
        (transcriptData?.academic_records || []) :
        (transcriptData?.academic_records?.filter(record => record.semester === selectedSemester) || [])

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    📊 Academic Records
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Track your grades, view transcripts, and get AI-powered academic insights
                </p>
            </div>

            {/* Student Info Card */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem'
                }}>
                    <div>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                            Student Information
                        </h3>
                        <p style={{margin: 0, opacity: 0.9}}>
                            {transcriptData?.student_info?.full_name || 'N/A'}
                        </p>
                        <p style={{margin: 0, opacity: 0.9}}>
                            ID: {transcriptData?.student_info?.student_id || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                            Academic Standing
                        </h3>
                        <p style={{margin: 0, opacity: 0.9}}>
                            GPA: {transcriptData?.student_info?.current_gpa?.toFixed(2) || 'N/A'}
                        </p>
                        <p style={{margin: 0, opacity: 0.9}}>
                            Status: {transcriptData?.student_info?.academic_standing || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                            Credit Summary
                        </h3>
                        <p style={{margin: 0, opacity: 0.9}}>
                            Total Credits: {transcriptData?.student_info?.total_credits || 'N/A'}
                        </p>
                        <p style={{margin: 0, opacity: 0.9}}>
                            Enrolled: {transcriptData?.student_info?.enrollment_date ? new Date(transcriptData?.student_info?.enrollment_date).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1}}
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
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <div>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                            Filter by Semester
                        </label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            style={{
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                minWidth: '200px'
                            }}
                        >
                            <option value="all">All Semesters</option>
                            {semesters.map(semester => (
                                <option key={semester} value={semester}>
                                    {semester}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        📄 Download Transcript
                    </button>
                </div>
            </motion.div>

            {/* Academic Records Table */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.2}}
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
                        Course History ({filteredRecords.length} courses)
                    </h3>
                </div>

                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
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
                            }}>Instructor
                            </th>
                            <th style={{
                                padding: '1rem',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#374151'
                            }}>Semester
                            </th>
                            <th style={{
                                padding: '1rem',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#374151'
                            }}>Grade
                            </th>
                            <th style={{
                                padding: '1rem',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#374151'
                            }}>Credits
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
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRecords.map((record, index) => (
                            <motion.tr
                                key={`${record.course_code}-${index}`}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.05}}
                                style={{borderBottom: '1px solid #e5e7eb'}}
                            >
                                <td style={{padding: '1rem'}}>
                                    <div>
                                        <div style={{fontWeight: '600', color: '#1f2937'}}>
                                            {record.course_title}
                                        </div>
                                        <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                            {record.course_code}
                                        </div>
                                    </div>
                                </td>
                                <td style={{padding: '1rem', color: '#1f2937'}}>
                                    {record.instructor}
                                </td>
                                <td style={{padding: '1rem', color: '#1f2937'}}>
                                    {record.semester}
                                </td>
                                <td style={{padding: '1rem'}}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        backgroundColor: record.status === 'in_progress' ? '#fef3c7' : '#dcfce7',
                                        color: getGradeColor(record.grade, record.final_score)
                                    }}>
                                        {record.grade}
                                    </span>
                                    {record.final_score > 0 && (
                                        <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                                            {record.final_score.toFixed(1)}%
                                        </div>
                                    )}
                                </td>
                                <td style={{padding: '1rem', color: '#1f2937', fontWeight: '600'}}>
                                    {record.credits}
                                </td>
                                <td style={{padding: '1rem'}}>
                                    <div style={{width: '100px'}}>
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '3px'
                                        }}>
                                            <div style={{
                                                width: `${record.progress_percentage}%`,
                                                height: '100%',
                                                backgroundColor: '#3b82f6',
                                                borderRadius: '3px'
                                            }}/>
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280'
                                        }}>{record.progress_percentage.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td style={{padding: '1rem'}}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: record.status === 'completed' ? '#dcfce7' :
                                            record.status === 'in_progress' ? '#fef3c7' : '#fee2e2',
                                        color: getStatusColor(record.status),
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {record.status.replace('_', ' ')}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* GPA by Semester */}
            {transcriptData?.gpa_by_semester && Object.keys(transcriptData.gpa_by_semester).length > 0 && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        marginTop: '2rem'
                    }}
                >
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f9fafb'
                    }}>
                        <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
                            GPA by Semester
                        </h3>
                    </div>

                    <div style={{padding: '1.5rem'}}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem'
                        }}>
                            {Object.entries(transcriptData.gpa_by_semester).map(([semester, gpa]) => (
                                <div
                                    key={semester}
                                    style={{
                                        background: '#f9fafb',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: getGradeColor('', gpa * 25), // Convert 4.0 scale to percentage for color
                                        marginBottom: '0.5rem'
                                    }}>
                                        {gpa.toFixed(2)}
                                    </div>
                                    <div style={{fontSize: '0.875rem', color: '#6b7280', fontWeight: '600'}}>
                                        {semester}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default StudentRecords
