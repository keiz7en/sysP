import React, {useState} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import Navbar from '../shared/Navbar'
import Sidebar from '../shared/Sidebar'
import AdminHome from './pages/AdminHome'
import UserManagement from './pages/UserManagement'
import TeacherApprovals from './pages/TeacherApprovals'
import SystemSettings from './pages/SystemSettings'
import StudentApprovals from './pages/StudentApprovals'
import {useAuth} from '../../contexts/AuthContext'

const AdminDashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const {user} = useAuth()

    const adminMenuItems = [
        {
            id: 'home',
            label: 'Dashboard',
            icon: '🏠',
            path: '/admin',
            description: 'Overview & Analytics'
        },
        {
            id: 'users',
            label: 'User Management',
            icon: '👥',
            path: '/admin/users',
            description: 'Manage all users'
        },
        {
            id: 'teachers',
            label: 'Teacher Approval',
            icon: '✅',
            path: '/admin/teachers',
            description: 'Approve new teachers'
        },
        {
            id: 'students',
            label: 'Student Approval',
            icon: '🎓',
            path: '/admin/students',
            description: 'Approve new students'
        },
        {
            id: 'settings',
            label: 'System Settings',
            icon: '⚙️',
            path: '/admin/settings',
            description: 'Configure system'
        }
    ]

    return (
        <div style={{display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc'}}>
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                menuItems={adminMenuItems}
                userType="admin"
                user={user}
            />

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
                <Navbar
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    user={user}
                    sidebarOpen={sidebarOpen}
                />

                <main style={{flex: 1, padding: '2rem'}}>
                    <Routes>
                        <Route index element={<AdminHome/>}/>
                        <Route path="users" element={<UserManagement/>}/>
                        <Route path="teachers" element={<TeacherApprovals/>}/>
                        <Route path="students" element={<StudentApprovals/>}/>
                        <Route path="settings" element={<SystemSettings/>}/>
                        <Route path="*" element={<Navigate to="/admin" replace/>}/>
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default AdminDashboard