import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

// Import shared components
import Sidebar from '../shared/Sidebar'
import Navbar from '../shared/Navbar'

// Teacher specific pages
import TeacherHome from './pages/TeacherHome'
import TeacherSubjectManagement from './pages/TeacherSubjectManagement'
import StudentManagement from './pages/StudentManagement'
import CourseManagement from './pages/CourseManagement'
import TeacherProfile from './pages/TeacherProfile'
import TeachingAnalytics from './pages/TeachingAnalytics'
import AssignmentManagement from './pages/AssignmentManagement'
import Gradebook from './pages/Gradebook'
import StudentApprovals from './pages/StudentApprovals'
import EnrollmentRequests from './pages/EnrollmentRequests'
import TeacherExams from './pages/TeacherExams'

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const teacherMenuItems = [
        {
            id: 'home',
            label: 'Dashboard',
            icon: '🏠',
            path: '/teacher',
            description: 'Overview & Analytics'
        },
        {
            id: 'exams',
            label: 'Exams',
            icon: '📝',
            path: '/teacher/exams',
            description: 'Create and manage exams (Quiz/Mid/Final)'
        },
        {
            id: 'subjects',
            label: 'Subject Management',
            icon: '📖',
            path: '/teacher/subjects',
            description: 'Request and manage subjects'
        },
        {
            id: 'courses',
            label: 'Course Management',
            icon: '📚',
            path: '/teacher/courses',
            description: 'Manage courses and content'
        },
        {
            id: 'approvals',
            label: 'Student Approvals',
            icon: '✅',
            path: '/teacher/approvals',
            description: 'Approve student enrollments'
        },
        {
            id: 'enrollments',
            label: 'Enrollment Requests',
            icon: '📝',
            path: '/teacher/enrollments',
            description: 'Manage enrollment requests'
        },
        {
            id: 'students',
            label: 'Student Management',
            icon: '👨‍🎓',
            path: '/teacher/students',
            description: 'View your students'
        },
        {
            id: 'analytics',
            label: 'Teaching Analytics',
            icon: '📊',
            path: '/teacher/analytics',
            description: 'Student progress and insights'
        },
        {
            id: 'assignments',
            label: 'Assignments',
            icon: '📝',
            path: '/teacher/assignments',
            description: 'Create and grade assignments'
        },
        {
            id: 'gradebook',
            label: 'Gradebook',
            icon: '📋',
            path: '/teacher/gradebook',
            description: 'Track student grades'
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: '👤',
            path: '/teacher/profile',
            description: 'Account settings and info'
        }
    ]

    // Check if user is approved teacher
    useEffect(() => {
        if (user && user.user_type === 'teacher') {
            // Check if teacher is approved using the correct fields
            if (user.approval_status !== 'approved') {
                toast.error('Your teacher account is pending approval. Please contact admin.', {
                    duration: 6000,
                    icon: '⏳'
                })
            } else if (!user.employee_id) {
                toast.success('Setting up your teacher profile...', {
                    duration: 3000,
                    icon: '⚙️'
                })
            }
        }
    }, [user])

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                menuItems={teacherMenuItems}
                userType="teacher"
                user={user}
            />

            {/* Main Content */}
            <div
                style={{
                    flex: 1,
                    marginLeft: sidebarOpen ? '280px' : '80px',
                    transition: 'margin-left 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                }}
            >
                {/* Navbar */}
                <Navbar
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    user={user}
                    sidebarOpen={sidebarOpen}
                />

                {/* Page Content */}
                <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        flex: 1,
                        padding: '2rem',
                        paddingTop: '100px' // Account for fixed navbar
                    }}
                >
                    <Routes>
                        <Route index element={<TeacherHome />} />
                        <Route path="exams" element={<TeacherExams/>}/>
                        <Route path="subjects" element={<TeacherSubjectManagement />} />
                        <Route path="courses" element={<CourseManagement />} />
                        <Route path="approvals" element={<StudentApprovals />} />
                        <Route path="enrollments" element={<EnrollmentRequests/>}/>
                        <Route path="students" element={<StudentManagement />} />
                        <Route path="analytics" element={<TeachingAnalytics />} />
                        <Route path="assignments" element={<AssignmentManagement />} />
                        <Route path="gradebook" element={<Gradebook />} />
                        <Route path="profile" element={<TeacherProfile />} />
                        <Route path="*" element={<Navigate to="/teacher" replace />} />
                    </Routes>
                    {/* Check if teacher profile exists and show setup message if needed */}
                    {user && user.user_type === 'teacher' && user.approval_status === 'approved' && !user.employee_id && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                padding: '2rem',
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffeaa7',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                marginBottom: '2rem',
                                textAlign: 'center'
                            }}
                        >
                            <h2 style={{ color: '#856404', marginBottom: '1rem' }}>
                                🏗️ Complete Your Teacher Profile
                            </h2>
                            <p style={{ color: '#856404', marginBottom: '1.5rem' }}>
                                Your teacher account is approved! Please complete your profile to access all features.
                            </p>
                            <button
                                onClick={() => window.location.href = '/teacher/profile'}
                                style={{
                                    backgroundColor: '#fd7e14',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Setup Profile Now
                            </button>
                        </motion.div>
                    )}
                </motion.main>
            </div>
        </div>
    )
}

export default TeacherDashboard