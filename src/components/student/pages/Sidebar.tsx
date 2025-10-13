import React from 'react'
import { Link, useLocation } from 'react-router-dom'

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
    userType: string
    user: any
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, menuItems, userType, user }) => {
    const location = useLocation()

    return (
        <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: isOpen ? '280px' : '80px',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            transition: 'width 0.3s ease',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    🎓
                </div>
                {isOpen && (
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>EduAI</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>
                            {userType}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '1rem 0' }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1.5rem',
                                textDecoration: 'none',
                                color: isActive ? '#3b82f6' : '#6b7280',
                                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                borderRight: isActive ? '3px solid #3b82f6' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', minWidth: '20px' }}>{item.icon}</span>
                            {isOpen && (
                                <div>
                                    <div style={{ fontWeight: isActive ? '600' : '500' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                        {item.description}
                                    </div>
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section */}
            {isOpen && (
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.9rem'
                        }}>
                            👤
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>
                                {user?.name || 'Student'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                {user?.email || 'student@eduai.com'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Re-export the shared Sidebar component for student pages
export {default} from '../../shared/Sidebar'
