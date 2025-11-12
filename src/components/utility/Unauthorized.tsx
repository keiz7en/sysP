import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Unauthorized: React.FC = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    textAlign: 'center',
                    backgroundColor: 'white',
                    padding: '4rem 3rem',
                    borderRadius: '20px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    maxWidth: '600px',
                    width: '100%'
                }}
            >
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2
                    }}
                    style={{ fontSize: '6rem', marginBottom: '1rem' }}
                >
                    🚫
                </motion.div>

                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    margin: '0 0 1rem 0',
                    color: '#dc2626'
                }}>
                    Access Denied
                </h1>

                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '1rem'
                }}>
                    You don't have permission to view this page
                </h2>

                <p style={{
                    color: '#64748b',
                    fontSize: '1.05rem',
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                }}>
                    This area is restricted. If you believe you should have access,
                    please contact your administrator or try logging in with a different account.
                </p>

                {user && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <p style={{
                            color: '#991b1b',
                            fontSize: '0.9rem',
                            margin: 0
                        }}>
                            <strong>Current User:</strong> {user.username} ({user.user_type})
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            color: '#374151',
                            padding: '0.875rem 2rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}
                    >
                        ← Go Back
                    </button>

                    <button
                        onClick={() => {
                            if (user) {
                                if (user.user_type === 'student') {
                                    navigate('/student')
                                } else if (user.user_type === 'teacher') {
                                    navigate('/teacher')
                                } else if (user.user_type === 'admin') {
                                    navigate('/admin')
                                }
                            } else {
                                navigate('/')
                            }
                        }}
                        style={{
                            backgroundColor: '#667eea',
                            border: 'none',
                            color: 'white',
                            padding: '0.875rem 2rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#5568d3'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#667eea'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}
                    >
                        🏠 Go Home
                    </button>

                    {user && (
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#dc2626',
                                border: 'none',
                                color: 'white',
                                padding: '0.875rem 2rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = '#b91c1c'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = '#dc2626'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            🔒 Logout
                        </button>
                    )}
                </div>

                {/* Help Section */}
                <div style={{
                    marginTop: '3rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        marginBottom: '1rem'
                    }}>
                        Need help?
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <a
                            href="/contact"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '600'
                            }}
                        >
                            Contact Support
                        </a>
                        <span style={{ color: '#e5e7eb' }}>•</span>
                        <a
                            href="/login"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '600'
                            }}
                        >
                            Sign In Again
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Unauthorized
