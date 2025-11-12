import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NotFound: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 10 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'reverse',
                        duration: 1
                    }}
                    style={{ fontSize: '6rem', marginBottom: '1rem' }}
                >
                    🔍
                </motion.div>

                <h1 style={{
                    fontSize: '5rem',
                    fontWeight: '800',
                    margin: '0 0 1rem 0',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    404
                </h1>

                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '1rem'
                }}>
                    Page Not Found
                </h2>

                <p style={{
                    color: '#64748b',
                    fontSize: '1.1rem',
                    marginBottom: '2.5rem',
                    lineHeight: '1.6'
                }}>
                    Oops! The page you're looking for seems to have wandered off.
                    Let's get you back on track!
                </p>

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
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            color: 'white',
                            padding: '0.875rem 2rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'transform 0.3s',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        🏠 Go Home
                    </button>
                </div>

                {/* Helpful Links */}
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
                        Looking for something specific?
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <a
                            href="/about"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '600'
                            }}
                        >
                            About Us
                        </a>
                        <span style={{ color: '#e5e7eb' }}>•</span>
                        <a
                            href="/contact"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '600'
                            }}
                        >
                            Contact
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
                            Sign In
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default NotFound
