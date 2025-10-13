import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {Routes, Route, Navigate} from 'react-router-dom'
import {useAuth} from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

// Import shared components
import Sidebar from '../shared/Sidebar'
import Navbar from '../shared/Navbar'

// Teacher specific pages
import TeacherHome from './pages/TeacherHome'
import StudentManagement from './pages/StudentManagement'
import CourseManagement from './pages/CourseManagement'
import TeacherProfile from './pages/TeacherProfile'

const TeacherDashboard: React.FC = () => {
    const {user} = useAuth()
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
            id: 'students',
            label: 'Student Management',
            icon: '👥',
            path: '/teacher/students',
            description: 'Add/remove students with auto IDs'
        },
        {
            id: 'courses',
            label: 'Course Management',
            icon: '📚',
            path: '/teacher/courses',
            description: 'Manage courses and content'
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
            // Check if teacher profile exists (approved)
            if (!user.teacher_profile && !user.employee_id) {
                toast.error('Your teacher account is pending approval. Please contact admin.')
            }
        }
    }, [user])

    return (
        <div style={{display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc'}}>
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
                    userType="teacher"
                />

                {/* Page Content */}
                <motion.main
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                    style={{
                        flex: 1,
                        padding: '2rem',
                        paddingTop: '100px' // Account for fixed navbar
                    }}
                >
                    <Routes>
                        <Route path="/" element={<TeacherHome/>}/>
                        <Route path="/students" element={<StudentManagement/>}/>
                        <Route path="/courses" element={<CourseManagement/>}/>
                        <Route path="/analytics"
                               element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>📊 Teaching
                                   Analytics</h2><p>Detailed analytics coming soon!</p></div>}/>
                        <Route path="/assignments"
                               element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>📝 Assignments</h2>
                                   <p>Assignment management coming soon!</p></div>}/>
                        <Route path="/gradebook"
                               element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>📋 Gradebook</h2><p>Grade
                                   tracking coming soon!</p></div>}/>
                        <Route path="/profile" element={<TeacherProfile/>}/>
                        <Route path="*" element={<Navigate to="/teacher" replace/>}/>
                    </Routes>
                </motion.main>
            </div>
        </div>
    )
}

export default TeacherDashboard