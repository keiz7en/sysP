import React from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useNavigate, useLocation} from 'react-router-dom'
import {useAuth, User} from '../../contexts/AuthContext'

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
    const {logout} = useAuth()

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/auth')
        } catch (error) {
            console.error('Logout error:', error)
            // Force navigation even if logout fails
            navigate('/auth')
        }
    }

    const handleSettings = () => {
        navigate('/settings')
    }

    const isActiveRoute = (itemPath: string) => {
        const currentPath = location.pathname

        if (itemPath === '/student' || itemPath === '/teacher' || itemPath === '/admin') {
            return currentPath === itemPath || currentPath === '/'
        }

        return currentPath === itemPath || currentPath.startsWith(itemPath)
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
                        fontSize: '1.75rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
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
                                const isActive = isActiveRoute(item.path)

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
                                            fontSize: '1.75rem',
                                            flexShrink: 0,
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
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

                                        {isActive && (
                                            <motion.div
                                                initial={{scale: 0}}
                                                animate={{scale: 1}}
                                                style={{
                                                    position: 'absolute',
                                                    right: '0.5rem',
                                                    width: '4px',
                                                    height: '20px',
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    borderRadius: '2px'
                                                }}
                                            />
                                        )}
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
                        {isOpen && user && (
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
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: '#6366f1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            color: 'white',
                                            fontWeight: '600',
                                            marginRight: '0.75rem'
                                        }}
                                    >
                                        {user?.name?.charAt(0) || '👤'}
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
                            onClick={handleSettings}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: location.pathname === '/settings'
                                    ? 'rgba(99, 102, 241, 0.2)'
                                    : 'transparent',
                                color: location.pathname === '/settings' ? '#6366f1' : '#9ca3af',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (location.pathname !== '/settings') {
                                    e.currentTarget.style.color = 'white'
                                    e.currentTarget.style.backgroundColor = '#374151'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (location.pathname !== '/settings') {
                                    e.currentTarget.style.color = '#9ca3af'
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                }
                            }}
                        >
                            <span style={{
                                fontSize: '1.5rem',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>⚙️</span>
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
                            <span style={{
                                fontSize: '1.5rem',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>🚪</span>
                            {isOpen && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    )
}

export default Sidebar