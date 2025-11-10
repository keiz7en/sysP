import React, {useState} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import {motion} from 'framer-motion'
import {useAuth} from '../../contexts/AuthContext'

// Import Student-specific pages
import StudentHome from './pages/StudentHome'
import StudentRecords from './pages/StudentRecords'
import AdaptiveLearning from './pages/AdaptiveLearning'
import CareerGuidance from './pages/CareerGuidance'
import AcademicAutomation from './pages/AcademicAutomation'
import ResearchInsights from './pages/ResearchInsights'
import EngagementAccessibility from './pages/EngagementAccessibility'
import StudentProfile from './pages/StudentProfile'
import StudentChat from './pages/StudentChat'
import AILearningAssistant from './pages/AILearningAssistant'

// Import shared components
import Sidebar from '../shared/Sidebar'
import Navbar from '../shared/Navbar'

const StudentDashboard: React.FC = () => {
    const {user} = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const studentMenuItems = [
        {
            id: 'home',
            label: 'Dashboard',
            icon: '🏠',
            path: '/student',
            description: 'Overview and quick access'
        },
        {
            id: 'ai-assistant',
            label: 'AI Learning Assistant',
            icon: '🤖',
            path: '/student/ai-assistant',
            description: '24/7 AI-powered academic support, career guidance, and personalized help'
        },
        {
            id: 'records',
            label: 'Academic Records',
            icon: '📊',
            path: '/student/records',
            description: 'Grades, transcripts, and AI analysis'
        },
        {
            id: 'learning',
            label: 'Adaptive Learning',
            icon: '🧠',
            path: '/student/learning',
            description: 'Personalized learning paths'
        },
        {
            id: 'career',
            label: 'Career Guidance',
            icon: '💼',
            path: '/student/career',
            description: 'Job matching and resume analysis'
        },
        {
            id: 'assessments',
            label: 'AI Assessments',
            icon: '⚡',
            path: '/student/assessments',
            description: 'Automated testing and grading'
        },
        {
            id: 'insights',
            label: 'Learning Insights',
            icon: '🔬',
            path: '/student/insights',
            description: 'Performance analytics and trends'
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            icon: '♿',
            path: '/student/accessibility',
            description: 'Voice recognition and adaptive tools'
        },
        {
            id: 'chat',
            label: 'AI Assistant',
            icon: '🤖',
            path: '/student/chat',
            description: '24/7 AI-powered help'
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: '👤',
            path: '/student/profile',
            description: 'Account settings and preferences'
        }
    ]

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, sans-serif',
            display: 'flex'
        }}>
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                menuItems={studentMenuItems}
                userType="student"
                user={user}
            />

            {/* Main Content */}
            <div style={{
                flex: 1,
                marginLeft: sidebarOpen ? '280px' : '80px',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh'
            }}>
                {/* Navbar */}
                <Navbar
                    user={user}
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                />

                {/* Page Content */}
                <motion.main
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                    style={{
                        padding: '2rem',
                        paddingTop: '100px' // Account for fixed navbar
                    }}
                >
                    <Routes>
                        <Route index element={<StudentHome/>}/>
                        <Route path="ai-assistant" element={<AILearningAssistant/>}/>
                        <Route path="records" element={<StudentRecords/>}/>
                        <Route path="learning" element={<AdaptiveLearning/>}/>
                        <Route path="career" element={<CareerGuidance/>}/>
                        <Route path="assessments" element={<AcademicAutomation/>}/>
                        <Route path="insights" element={<ResearchInsights/>}/>
                        <Route path="accessibility" element={<EngagementAccessibility/>}/>
                        <Route path="chat" element={<StudentChat/>}/>
                        <Route path="profile" element={<StudentProfile/>}/>
                        <Route path="*" element={<Navigate to="/student" replace/>}/>
                    </Routes>
                </motion.main>
            </div>
        </div>
    )
}

export default StudentDashboard