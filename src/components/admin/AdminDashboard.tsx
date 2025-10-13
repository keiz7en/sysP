import React, {useState} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import {motion} from 'framer-motion'
import Navbar from '../shared/Navbar'
import Sidebar from '../shared/Sidebar'
import AdminHome from './pages/AdminHome'
import UserManagement from './pages/UserManagement'
import TeacherApproval from './pages/TeacherApproval'
import SystemSettings from './pages/SystemSettings'
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
                    userType="admin"
                />

                <main style={{flex: 1, padding: '2rem'}}>
                    <Routes>
                        <Route path="/" element={<AdminHome/>}/>
                        <Route path="/admin" element={<AdminHome/>}/>
                        <Route path="/admin/users" element={<UserManagement/>}/>
                        <Route path="/admin/teachers" element={<TeacherApproval/>}/>
                        <Route path="/admin/settings" element={<SystemSettings/>}/>
                        <Route path="*" element={<Navigate to="/admin" replace/>}/>
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default AdminDashboard