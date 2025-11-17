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

// Import public pages
import LandingPage from './components/public/LandingPage'
import AboutPage from './components/public/AboutPage'
import ContactPage from './components/public/ContactPage'
import FeaturesPage from './components/public/FeaturesPage'

// Import utility pages
import NotFound from './components/utility/NotFound'
import Unauthorized from './components/utility/Unauthorized'

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Settings page component
const SettingsPage: React.FC = () => {
    const {user, updateProfile, changePassword, deleteAccount} = useAuth()
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences' | 'danger'>('profile')
    const [profileFormData, setProfileFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        address: user?.address || ''
    })
    const [passwordFormData, setPasswordFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [deleteFormData, setDeleteFormData] = useState({
        confirmation: '',
        reason: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (user) {
            setProfileFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                address: user.address || ''
            })
        }
    }, [user])

    const validatePasswordForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!passwordFormData.current_password) {
            newErrors.current_password = 'Current password is required'
        }

        if (!passwordFormData.new_password) {
            newErrors.new_password = 'New password is required'
        } else if (passwordFormData.new_password.length < 6) {
            newErrors.new_password = 'Password must be at least 6 characters long'
        }

        if (!passwordFormData.confirm_password) {
            newErrors.confirm_password = 'Please confirm your new password'
        } else if (passwordFormData.new_password !== passwordFormData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match'
        }

        if (passwordFormData.current_password === passwordFormData.new_password) {
            newErrors.new_password = 'New password must be different from current password'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const success = await updateProfile(profileFormData)
            if (success) {
                // Profile updated successfully - handled by AuthContext
            }
        } catch (error) {
            console.error('Profile update error:', error)
        }

        setLoading(false)
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!validatePasswordForm()) {
            return
        }

        setLoading(true)

        try {
            const success = await changePassword(passwordFormData)
            if (success) {
                // Clear form on success
                setPasswordFormData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                })
            }
        } catch (error) {
            console.error('Password change error:', error)
        }

        setLoading(false)
    }

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!deleteFormData.confirmation) {
            setErrors({confirmation: 'Password is required to delete account'})
            return
        }

        // Show confirmation modal
        setShowDeleteModal(true)
    }

    const confirmDeleteAccount = async () => {
        setLoading(true)

        try {
            const confirmation = `delete ${user?.username}`
            const success = await deleteAccount(confirmation)
            if (success) {
                // User will be automatically logged out and redirected
                setShowDeleteModal(false)
            }
        } catch (error) {
            console.error('Delete account error:', error)
        }

        setLoading(false)
    }

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        boxSizing: 'border-box' as const,
        fontSize: '0.875rem'
    }

    const errorInputStyle = {
        ...inputStyle,
        borderColor: '#dc2626',
        backgroundColor: '#fef2f2'
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            marginRight: '1rem',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            color: '#6b7280'
                        }}
                    >
                        ←
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: 0
                        }}>
                            ⚙️ Settings
                        </h1>
                        <p style={{
                            margin: '0.5rem 0 0 0',
                            color: '#6b7280',
                            fontSize: '0.9rem'
                        }}>
                            Manage your account settings and preferences
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px 12px 0 0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        padding: '0'
                    }}>
                        {[
                            {key: 'profile', label: '👤 Profile', description: 'Personal information'},
                            {key: 'password', label: '🔒 Password', description: 'Change password'},
                            {key: 'preferences', label: '🎨 Preferences', description: 'App preferences'},
                            {key: 'danger', label: '⚠️ Account', description: 'Delete account'}
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.key ? '#f3f4f6' : 'transparent',
                                    borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    borderRadius: activeTab === tab.key ? '12px 12px 0 0' : '0'
                                }}
                            >
                                <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>
                                    {tab.label}
                                </div>
                                <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                                    {tab.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0 0 12px 12px',
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit}>
                            <div style={{marginBottom: '2rem'}}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '1rem'
                                }}>
                                    Personal Information
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    Update your personal details and contact information.
                                </p>
                            </div>

                            <div style={{display: 'grid', gap: '1.5rem', marginBottom: '2rem'}}>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={profileFormData.first_name}
                                            onChange={(e) => setProfileFormData({
                                                ...profileFormData,
                                                first_name: e.target.value
                                            })}
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={profileFormData.last_name}
                                            onChange={(e) => setProfileFormData({
                                                ...profileFormData,
                                                last_name: e.target.value
                                            })}
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={profileFormData.email}
                                        onChange={(e) => setProfileFormData({
                                            ...profileFormData,
                                            email: e.target.value
                                        })}
                                        style={inputStyle}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileFormData.phone_number}
                                        onChange={(e) => setProfileFormData({
                                            ...profileFormData,
                                            phone_number: e.target.value
                                        })}
                                        style={inputStyle}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Address
                                    </label>
                                    <textarea
                                        value={profileFormData.address}
                                        onChange={(e) => setProfileFormData({
                                            ...profileFormData,
                                            address: e.target.value
                                        })}
                                        rows={3}
                                        style={{
                                            ...inputStyle,
                                            resize: 'vertical'
                                        }}
                                        placeholder="Enter your address"
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
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit}>
                            <div style={{marginBottom: '2rem'}}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '1rem'
                                }}>
                                    Change Password
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    Update your password to keep your account secure. Password must be at least 6
                                    characters long.
                                </p>
                            </div>

                            <div style={{display: 'grid', gap: '1.5rem', marginBottom: '2rem'}}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Current Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordFormData.current_password}
                                        onChange={(e) => setPasswordFormData({
                                            ...passwordFormData,
                                            current_password: e.target.value
                                        })}
                                        style={errors.current_password ? errorInputStyle : inputStyle}
                                        placeholder="Enter your current password"
                                        required
                                    />
                                    {errors.current_password && (
                                        <p style={{
                                            color: '#dc2626',
                                            fontSize: '0.75rem',
                                            marginTop: '0.25rem'
                                        }}>
                                            {errors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        New Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordFormData.new_password}
                                        onChange={(e) => setPasswordFormData({
                                            ...passwordFormData,
                                            new_password: e.target.value
                                        })}
                                        style={errors.new_password ? errorInputStyle : inputStyle}
                                        placeholder="Enter new password (min 6 characters)"
                                        required
                                    />
                                    {errors.new_password && (
                                        <p style={{
                                            color: '#dc2626',
                                            fontSize: '0.75rem',
                                            marginTop: '0.25rem'
                                        }}>
                                            {errors.new_password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Confirm New Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordFormData.confirm_password}
                                        onChange={(e) => setPasswordFormData({
                                            ...passwordFormData,
                                            confirm_password: e.target.value
                                        })}
                                        style={errors.confirm_password ? errorInputStyle : inputStyle}
                                        placeholder="Confirm your new password"
                                        required
                                    />
                                    {errors.confirm_password && (
                                        <p style={{
                                            color: '#dc2626',
                                            fontSize: '0.75rem',
                                            marginTop: '0.25rem'
                                        }}>
                                            {errors.confirm_password}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                padding: '1rem',
                                marginBottom: '2rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span>🔒</span>
                                    <span style={{fontWeight: '600', color: '#1e40af'}}>
                                        Password Security Tips
                                    </span>
                                </div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '1.5rem',
                                    color: '#1e40af',
                                    fontSize: '0.875rem'
                                }}>
                                    <li>Use at least 6 characters</li>
                                    <li>Include uppercase and lowercase letters</li>
                                    <li>Add numbers and special characters</li>
                                    <li>Avoid common words and personal information</li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    backgroundColor: loading ? '#9ca3af' : '#dc2626',
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
                                {loading ? 'Changing Password...' : '🔒 Change Password'}
                            </button>
                        </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div>
                            <div style={{marginBottom: '2rem'}}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '1rem'
                                }}>
                                    App Preferences
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    Customize your experience and notification settings.
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '2rem',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎨</div>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '0.5rem'
                                }}>
                                    Preferences Coming Soon
                                </h4>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    margin: 0
                                }}>
                                    Theme settings, notification preferences, and language options will be available
                                    soon.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone Tab */}
                    {activeTab === 'danger' && (
                        <div>
                            <div style={{marginBottom: '2rem'}}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '1rem'
                                }}>
                                    Danger Zone
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    Be careful when making changes in this section.
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '2rem',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚠️</div>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '0.5rem'
                                }}>
                                    Delete Account
                                </h4>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    margin: 0
                                }}>
                                    Deleting your account will remove all associated data. Please enter your password
                                    to confirm.
                                </p>

                                <form onSubmit={handleDeleteAccount}>
                                    <div style={{display: 'grid', gap: '1.5rem', marginBottom: '2rem'}}>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Password *
                                            </label>
                                            <input
                                                type="password"
                                                value={deleteFormData.confirmation}
                                                onChange={(e) => setDeleteFormData({
                                                    ...deleteFormData,
                                                    confirmation: e.target.value
                                                })}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Reason for deletion (optional)
                                            </label>
                                            <textarea
                                                value={deleteFormData.reason}
                                                onChange={(e) => setDeleteFormData({
                                                    ...deleteFormData,
                                                    reason: e.target.value
                                                })}
                                                rows={3}
                                                style={{
                                                    ...inputStyle,
                                                    resize: 'vertical'
                                                }}
                                                placeholder="Enter reason for deletion"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        style={{
                                            backgroundColor: '#dc2626',
                                            color: 'white',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete Account
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '500px'
                    }}>
                        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>⚠️</div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                marginBottom: '1rem'
                            }}>
                                Delete Account Permanently?
                            </h3>
                            <p style={{
                                color: '#6b7280',
                                fontSize: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                This action cannot be undone. All your data will be permanently deleted.
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <h4 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#dc2626',
                                marginBottom: '0.5rem'
                            }}>
                                What will be deleted:
                            </h4>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '1.5rem',
                                color: '#dc2626',
                                fontSize: '0.875rem'
                            }}>
                                <li>Your account and profile information</li>
                                <li>All course enrollments and progress</li>
                                <li>Assessment attempts and grades</li>
                                <li>Learning analytics and history</li>
                                <li>Settings and preferences</li>
                            </ul>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteAccount}
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: loading ? '#9ca3af' : '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {loading && <span>⏳</span>}
                                {loading ? 'Deleting...' : '🗑️ Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={user ? user.user_type : 'public'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Routes>
                    {/* Public Routes - accessible without login */}
                    {!user && (
                        <>
                            <Route path="/" element={<LandingPage/>}/>
                            <Route path="/about" element={<AboutPage/>}/>
                            <Route path="/contact" element={<ContactPage/>}/>
                            <Route path="/features" element={<FeaturesPage/>}/>
                            <Route path="/login" element={<AuthScreen/>}/>
                            <Route path="/register" element={<AuthScreen/>}/>
                        </>
                    )}

                    {/* Authenticated Routes */}
                    {user && (
                        <>
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
                        </>
                    )}

                    {/* Utility Routes - accessible to all */}
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/404" element={<NotFound/>}/>

                    {/* Fallback routes */}
                    {!user && <Route path="*" element={<Navigate to="/" replace/>}/>}
                    {user && <Route path="*" element={<NotFound/>}/>}
                </Routes>
            </motion.div>
        </AnimatePresence>
    )
}

function App() {
    return (
        <AuthProvider>
            <Router
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
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
