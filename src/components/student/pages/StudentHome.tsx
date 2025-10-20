import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {studentAPI} from '../../../services/api'

interface DashboardStats {
    gpa: number;
    courses: number;
    assignments: number;
    study_hours: number;
    grade_level?: string;
}

interface RecentActivity {
    time: string;
    activity: string;
    score: string;
}

interface UpcomingTask {
    task: string;
    due: string;
    priority: 'high' | 'medium' | 'low';
    course: string;
}

interface DashboardData {
    stats?: DashboardStats;
    recent_activity?: RecentActivity[];
    upcoming_tasks?: UpcomingTask[];
    student_info?: any;
    enrollments_count?: number;
    has_courses?: boolean;
}

interface AcademicRecord {
    course_title: string;
    course_code: string;
    instructor: string;
    grade: string;
    credits: number;
    progress_percentage: number;
}

const StudentHome: React.FC = () => {
    const {user, token} = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Ensure we have both user and token before making API calls
                if (!user || !token) {
                    setError('Authentication required. Please login again.');
                    return;
                }

                // Fetch student dashboard data
                const dashboardRes = await studentAPI.getStudentDashboard(token);
                setDashboardData(dashboardRes);

                // Only fetch additional data if student has courses
                if (dashboardRes.has_courses) {
                    try {
                        const recordsRes = await studentAPI.getAcademicRecords(token);
                        setAcademicRecords(recordsRes.academic_records || []);
                    } catch (recordsError) {
                        console.log('No academic records yet');
                    }
                }

            } catch (error: any) {
                console.error('Error fetching student data:', error);
                setError(error.message || 'Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user && token) {
            fetchAllData();
        }
    }, [user, token]);

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    fontSize: '1.2rem',
                    color: '#6b7280'
                }}
            >
                <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🔄</div>
                    Loading your dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '500px',
                    fontSize: '1.2rem',
                    color: '#ef4444',
                    textAlign: 'center',
                    padding: '2rem'
                }}
            >
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚠️</div>
                <p style={{marginBottom: '2rem', maxWidth: '600px', lineHeight: '1.6'}}>{error}</p>

                {error.includes('pending approval') && (
                    <div
                        style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '2rem',
                            maxWidth: '500px'
                        }}
                    >
                        <div style={{fontWeight: '600', marginBottom: '0.5rem'}}>
                            ⏳ Account Status: Pending Approval
                        </div>
                        <p style={{margin: 0, fontSize: '0.9rem'}}>
                            Your student registration has been received. Teachers or administrators will review and
                            approve your
                            account. You will receive an email notification once approved.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => window.location.reload()}
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
        );
    }

    // Show welcome message for new students with no courses
    if (dashboardData && !dashboardData.has_courses) {
        return (
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.5}}
                style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}
            >
                {/* Header */}
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    style={{marginBottom: '2rem'}}
                >
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        Welcome, {user?.first_name}! 🎓
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#6b7280',
                        marginBottom: '0'
                    }}>
                        Your student account has been approved! Get started with your learning journey.
                    </p>
                </motion.div>

                {/* Student Info Card */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        marginBottom: '2rem'
                    }}
                >
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>
                        🎓 Your Student Profile
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem'
                    }}>
                        <div>
                            <p style={{margin: 0, opacity: 0.9}}>
                                Student ID: {dashboardData.student_info?.student_id}
                            </p>
                            <p style={{margin: 0, opacity: 0.9}}>
                                Grade Level: {dashboardData.student_info?.grade_level || 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p style={{margin: 0, opacity: 0.9}}>
                                Current GPA: {dashboardData.student_info?.current_gpa?.toFixed(2) || '0.00'}
                            </p>
                            <p style={{margin: 0, opacity: 0.9}}>
                                Status: {dashboardData.student_info?.academic_status || 'Active'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* No Courses Message */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
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
                        Ready to Start Learning!
                    </h3>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        You haven't been enrolled in any courses yet. Teachers will add you to courses once they're
                        available.
                        Check back soon or contact your teachers for course enrollment.
                    </p>

                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginTop: '2rem',
                        textAlign: 'left'
                    }}>
                        <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem'}}>
                            What happens next?
                        </h4>
                        <div style={{color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Teachers will review available students and add you to
                                appropriate courses</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• You'll receive notifications when enrolled in new
                                courses</p>
                            <p style={{margin: '0 0 0.5rem 0'}}>• Once enrolled, you'll see course materials,
                                assignments, and progress tracking</p>
                            <p style={{margin: '0'}}>• Your dashboard will show real-time academic data and AI-powered
                                insights</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    // Show dashboard with courses (only if has_courses is true)
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
            style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}
        >
            {/* Header */}
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                style={{marginBottom: '2rem'}}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    Welcome back, {user?.first_name}! 👋
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Here's your personalized learning dashboard
                </p>
            </motion.div>

            {/* Academic Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Academic Overview</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Current GPA:</span>
                            <span
                                className="font-bold text-blue-600">{dashboardData?.student_info?.current_gpa?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Enrolled Courses:</span>
                            <span className="font-bold">{dashboardData?.enrollments_count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Grade Level:</span>
                            <span className="font-bold">{dashboardData?.student_info?.grade_level || 'Not set'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🎯 Study Progress</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-green-100">Status:</span>
                            <p className="font-bold capitalize">{dashboardData?.student_info?.academic_status || 'Active'}</p>
                        </div>
                        <div>
                            <span className="text-green-100">Total Credits:</span>
                            <p className="font-bold">{dashboardData?.student_info?.total_credits || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🤖 AI Features</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-purple-100">Learning Style:</span>
                            <p className="font-bold capitalize">{dashboardData?.student_info?.learning_style || 'Adaptive'}</p>
                        </div>
                        <div>
                            <span className="text-purple-100">AI Analysis:</span>
                            <p className="font-bold">Available</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📈 Quick Stats</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-blue-100">Active Courses:</span>
                            <p className="font-bold">{dashboardData?.enrollments_count || 0}</p>
                        </div>
                        <div>
                            <span className="text-blue-100">Performance:</span>
                            <p className="font-bold">Tracking</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Records */}
            {academicRecords.length > 0 && (
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
                        marginBottom: '2rem'
                    }}
                >
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f9fafb'
                    }}>
                        <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
                            📊 Your Academic Records
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
                            </tr>
                            </thead>
                            <tbody>
                            {academicRecords.map((record, index) => (
                                <tr key={index} style={{borderBottom: '1px solid #e5e7eb'}}>
                                    <td style={{padding: '1rem'}}>
                                        <div>
                                            <div style={{
                                                fontWeight: '600',
                                                color: '#1f2937'
                                            }}>{record.course_title}</div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280'
                                            }}>{record.course_code}</div>
                                        </div>
                                    </td>
                                    <td style={{padding: '1rem', color: '#1f2937'}}>{record.instructor}</td>
                                    <td style={{padding: '1rem'}}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            backgroundColor: record.grade === 'In Progress' ? '#fef3c7' : '#dcfce7',
                                            color: record.grade === 'In Progress' ? '#92400e' : '#166534'
                                        }}>
                                            {record.grade}
                                        </span>
                                    </td>
                                    <td style={{padding: '1rem', color: '#1f2937'}}>{record.credits}</td>
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
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default StudentHome;
