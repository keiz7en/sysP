import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {Toaster} from 'react-hot-toast'

// Import components
import LoadingScreen from './components/LoadingScreen'
import OnboardingScreen from './components/OnboardingScreen'
import AuthScreen from './components/AuthScreen'
import StudentDashboard from './components/student/StudentDashboard'
import TeacherDashboard from './components/teacher/TeacherDashboard'
import AdminDashboard from './components/admin/AdminDashboard'

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Settings page component
const SettingsPage: React.FC = () => {
    const {user, updateProfile} = useAuth()
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        address: user?.address || ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                address: user.address || ''
            })
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const success = await updateProfile(formData)
        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '2rem'}}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            marginRight: '1rem'
                        }}
                    >
                        ←
                    </button>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: 0
                    }}>
                        ⚙️ Settings
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{display: 'grid', gap: '1rem', marginBottom: '2rem'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                            <div>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                                Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading && <span>⏳</span>}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// Main App content with routing
function AppContent() {
    const { user, isLoading } = useAuth()
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('eduai_onboarding_complete')
        if (!hasSeenOnboarding && !user) {
            setShowOnboarding(true)
        }
    }, [user])

    const handleOnboardingComplete = () => {
        localStorage.setItem('eduai_onboarding_complete', 'true')
        setShowOnboarding(false)
    }

    if (isLoading) {
        return <LoadingScreen />
    }

    if (showOnboarding) {
        return <OnboardingScreen onComplete={handleOnboardingComplete} />
    }

    if (!user) {
        return <AuthScreen />
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={user.user_type}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Routes>
                    {/* Settings route accessible to all user types */}
                    <Route path="/settings" element={<SettingsPage/>}/>

                    {/* User type specific routes */}
                    {user.user_type === 'student' && (
                        <>
                            <Route path="/student/*" element={<StudentDashboard/>}/>
                            <Route path="/" element={<Navigate to="/student" replace/>}/>
                        </>
                    )}

                    {user.user_type === 'teacher' && (
                        <>
                            <Route path="/teacher/*" element={<TeacherDashboard/>}/>
                            <Route path="/" element={<Navigate to="/teacher" replace/>}/>
                        </>
                    )}

                    {user.user_type === 'admin' && (
                        <>
                            <Route path="/admin/*" element={<AdminDashboard/>}/>
                            <Route path="/" element={<Navigate to="/admin" replace/>}/>
                        </>
                    )}

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    )
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AppContent/>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App
