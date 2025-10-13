import React from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useNavigate, useLocation} from 'react-router-dom'

interface User {
    name: string
    email: string
    avatar?: string
    role: string
}

interface MenuItem {
    id: string
    label: string
    icon: string
    path: string
    description: string
}

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
    menuItems: MenuItem[]
    userType: 'student' | 'teacher' | 'admin'
    user: User | null
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, onToggle, menuItems, userType, user}) => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = () => {
        // This would typically clear auth state
        navigate('/auth')
    }

    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={onToggle}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 40,
                            display: 'block'
                        }}
                        className="lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isOpen ? '280px' : '80px',
                    x: 0
                }}
                transition={{duration: 0.3, ease: 'easeInOut'}}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    backgroundColor: '#1f2937',
                    color: 'white',
                    zIndex: 50,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Logo Section */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    minHeight: '80px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0
                    }}>
                        🎓
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{opacity: 0, x: -20}}
                                animate={{opacity: 1, x: 0}}
                                exit={{opacity: 0, x: -20}}
                                transition={{duration: 0.2}}
                            >
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    lineHeight: 1.2
                                }}>
                                    EduAI
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    textTransform: 'capitalize'
                                }}>
                                    {userType} Portal
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Menu */}
                <nav style={{
                    flex: 1,
                    padding: '1rem 0',
                    overflowY: 'auto'
                }}>
                    <div style={{padding: '0 1rem'}}>
                        {isOpen && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                style={{
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '1rem'
                                }}
                            >
                                Main Menu
                            </motion.div>
                        )}

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path === '/' && location.pathname === '/student') ||
                                    (item.path === '/' && location.pathname === '/teacher') ||
                                    (item.path === '/' && location.pathname === '/admin')

                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => handleNavigate(item.path)}
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: isActive
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = '#374151'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = 'transparent'
                                            }
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '1.25rem',
                                            flexShrink: 0,
                                            width: '24px',
                                            textAlign: 'center'
                                        }}>
                                            {item.icon}
                                        </span>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{opacity: 0, x: -10}}
                                                    animate={{opacity: 1, x: 0}}
                                                    exit={{opacity: 0, x: -10}}
                                                    transition={{duration: 0.2}}
                                                    style={{flex: 1, minWidth: 0}}
                                                >
                                                    <div style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        marginBottom: '0.2rem'
                                                    }}>
                                                        {item.label}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: isActive ? 'rgba(255,255,255,0.8)' : '#9ca3af',
                                                        lineHeight: 1.2
                                                    }}>
                                                        {item.description}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                </nav>

                {/* User Profile & Settings */}
                <div style={{
                    borderTop: '1px solid #374151',
                    padding: '1rem'
                }}>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: 20}}
                                style={{
                                    background: '#374151',
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    marginBottom: '1rem'
                                }}
                            >
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: user?.avatar
                                            ? `url(${user.avatar})`
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        flexShrink: 0
                                    }}>
                                        {!user?.avatar && (user?.name?.charAt(0) || '👤')}
                                    </div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: 'white',
                                            marginBottom: '0.2rem'
                                        }}>
                                            {user?.name || 'User'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#9ca3af'
                                        }}>
                                            {user?.email || 'user@example.com'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Settings & Logout */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                color: '#9ca3af',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                        >
                            <span style={{fontSize: '1.1rem'}}>⚙️</span>
                            {isOpen && <span>Settings</span>}
                        </button>

                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                color: '#9ca3af',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                        >
                            <span style={{fontSize: '1.1rem'}}>🚪</span>
                            {isOpen && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    )
}

export default Sidebar