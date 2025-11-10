import React from 'react'
import {motion} from 'framer-motion'
import {User} from '../../contexts/AuthContext'

interface NavbarProps {
    user: User | null
    onSidebarToggle: () => void
    sidebarOpen: boolean
}

const Navbar: React.FC<NavbarProps> = ({user, onSidebarToggle, sidebarOpen}) => {
    return (
        <motion.nav
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
            style={{
                position: 'fixed',
                top: 0,
                left: sidebarOpen ? '280px' : '80px',
                right: 0,
                height: '70px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                zIndex: 40,
                transition: 'left 0.3s ease'
            }}
        >
            {/* Left Section */}
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <button
                    onClick={onSidebarToggle}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    ☰
                </button>

                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981'
                    }}/>
                    <span style={{
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        fontWeight: '500'
                    }}>
                        System Online
                    </span>
                </div>
            </div>

            {/* Center Section - Search */}
            <div style={{
                flex: 1,
                maxWidth: '400px',
                margin: '0 2rem',
                position: 'relative'
            }}>
                <div style={{position: 'relative'}}>
                    <input
                        type="text"
                        placeholder="Search courses, assignments, or ask AI..."
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            borderRadius: '25px',
                            border: '1px solid #e5e7eb',
                            background: '#f9fafb',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6'
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.backgroundColor = '#f9fafb'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        fontSize: '1rem'
                    }}>
                        🔍
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                {/* Notifications */}
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    🔔
                    <div style={{
                        position: 'absolute',
                        top: '0.3rem',
                        right: '0.3rem',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444'
                    }}/>
                </button>

                {/* Messages */}
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    💬
                </button>

                {/* User Profile */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                     onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = 'white'
                         e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                     }}
                     onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = '#f9fafb'
                         e.currentTarget.style.boxShadow = 'none'
                     }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginRight: '1rem'
                        }}
                    >
                        {user?.name?.charAt(0) || '👤'}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            lineHeight: 1.2
                        }}>
                            {user?.name || 'Student'}
                        </span>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            lineHeight: 1.2,
                            textTransform: 'capitalize'
                        }}>
                            {user?.role || 'Student'}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: '#9ca3af',
                        marginLeft: '0.5rem'
                    }}>
                        ▼
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}

export default Navbar