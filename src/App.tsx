import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Import components
import LoadingScreen from './components/LoadingScreen'
import OnboardingScreen from './components/OnboardingScreen'
import AuthScreen from './components/AuthScreen'
import StudentDashboard from './components/student/StudentDashboard'

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Temporary TeacherDashboard placeholder
const TeacherDashboard: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #ec4899, #be185d)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    👨‍🏫 Teacher Dashboard
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.2rem' }}>
                    Coming Soon! Teacher features are being developed.
                </p>
            </div>
        </div>
    )
}

// Main App with routing
function AppContent() {
    const { user, isLoading } = useAuth()
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        // Check if user is first time visitor
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
                key={user.userType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Routes>
                    {user.userType === 'student' ? (
                        <Route path="/*" element={<StudentDashboard />} />
                    ) : (
                        <Route path="/*" element={<TeacherDashboard />} />
                    )}
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
                <AppContent />
            </Router>
        </AuthProvider>
    )
}

export default App
