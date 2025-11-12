import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface SystemSettings {
    auto_approve_students: boolean
    auto_approve_teachers: boolean
    require_email_verification: boolean
    allow_public_registration: boolean
    max_login_attempts: number
    session_timeout: number
    backup_frequency: string
    maintenance_mode: boolean
    notification_settings: {
        email_notifications: boolean
        sms_notifications: boolean
        in_app_notifications: boolean
    }
}

const ToggleSwitch: React.FC<{
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
}> = ({checked, onChange, label}) => {
    return (
        <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '52px',
            height: '28px',
            cursor: 'pointer'
        }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                }}
            />
            <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: checked ? '#10b981' : '#d1d5db',
                borderRadius: '28px',
                transition: 'all 0.3s',
                cursor: 'pointer'
            }}>
                <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '20px',
                    width: '20px',
                    left: checked ? '28px' : '4px',
                    bottom: '4px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}/>
            </span>
            <span style={{
                marginLeft: '60px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: checked ? '#10b981' : '#6b7280'
            }}>
                {label}
            </span>
        </label>
    )
}

const SystemSettings: React.FC = () => {
    const {user, token} = useAuth()
    const [settings, setSettings] = useState<SystemSettings>({
        auto_approve_students: false,
        auto_approve_teachers: false,
        require_email_verification: true,
        allow_public_registration: true,
        max_login_attempts: 3,
        session_timeout: 1440, // 24 hours in minutes
        backup_frequency: 'daily',
        maintenance_mode: false,
        notification_settings: {
            email_notifications: true,
            sms_notifications: false,
            in_app_notifications: true
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (user && token) {
            fetchSettings()
        }
    }, [user, token])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/users/admin/system-settings/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache'
            })

            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings)
                console.log('✅ Settings loaded successfully:', data)
            } else {
                const errorData = await response.json()
                console.error('❌ Failed to load settings:', errorData)
                toast.error('Failed to load settings')
            }
        } catch (error) {
            console.error('❌ Error fetching settings:', error)
            toast.error('Error loading system settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        try {
            setSaving(true)
            const response = await fetch('http://localhost:8000/api/users/admin/system-settings/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({settings})
            })

            if (response.ok) {
                toast.success('✅ System settings saved successfully!')
            } else {
                toast.error('Failed to save system settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error('Error saving system settings')
        } finally {
            setSaving(false)
        }
    }

    const handleSettingChange = (key: string, value: any) => {
        if (key.includes('.')) {
            const [section, keyInSection] = key.split('.')
            setSettings(prev => ({
                ...prev,
                [section]: {
                    ...(prev[section] || {}),
                    [keyInSection]: value
                }
            }))
        } else {
            setSettings(prev => ({
                ...prev,
                [key]: value
            }))
        }
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f4f6',
                    borderTop: '4px solid #6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}/>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    ⚙️ System Settings
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Configure system parameters, security settings, and platform features
                </p>
            </div>

            <div style={{display: 'grid', gap: '1.5rem'}}>
                {/* User Management Settings */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        👥 User Management
                    </h3>

                    <div style={{display: 'grid', gap: '1.25rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Auto-approve Students
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Automatically approve student registrations
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={settings.auto_approve_students}
                                onChange={(checked) => handleSettingChange('auto_approve_students', checked)}
                                label={settings.auto_approve_students ? 'Enabled' : 'Disabled'}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Auto-approve Teachers
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Automatically approve teacher applications
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={settings.auto_approve_teachers}
                                onChange={(checked) => handleSettingChange('auto_approve_teachers', checked)}
                                label={settings.auto_approve_teachers ? 'Enabled' : 'Disabled'}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Public Registration
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Allow users to register without invitation
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={settings.allow_public_registration}
                                onChange={(checked) => handleSettingChange('allow_public_registration', checked)}
                                label={settings.allow_public_registration ? 'Enabled' : 'Disabled'}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Security Settings */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🔒 Security Settings
                    </h3>

                    <div style={{display: 'grid', gap: '1.25rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Email Verification
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Require email verification for new accounts
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={settings.require_email_verification}
                                onChange={(checked) => handleSettingChange('require_email_verification', checked)}
                                label={settings.require_email_verification ? 'Required' : 'Optional'}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Max Login Attempts
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Maximum failed login attempts before lockout
                                </div>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={settings.max_login_attempts}
                                onChange={(e) => handleSettingChange('max_login_attempts', parseInt(e.target.value))}
                                style={{
                                    width: '80px',
                                    padding: '0.625rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Session Timeout
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Minutes before user session expires
                                </div>
                            </div>
                            <input
                                type="number"
                                min="15"
                                max="10080"
                                value={settings.session_timeout}
                                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                                style={{
                                    width: '100px',
                                    padding: '0.625rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* System Maintenance */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🔧 System Maintenance
                    </h3>

                    <div style={{display: 'grid', gap: '1.25rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: settings.maintenance_mode ? '#fef2f2' : '#f9fafb',
                            borderRadius: '12px',
                            border: `2px solid ${settings.maintenance_mode ? '#fecaca' : '#e5e7eb'}`
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: settings.maintenance_mode ? '#dc2626' : '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Maintenance Mode
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    {settings.maintenance_mode ?
                                        'System is currently in maintenance mode' :
                                        'System is running normally'
                                    }
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={settings.maintenance_mode}
                                onChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                                label={settings.maintenance_mode ? 'ON' : 'OFF'}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Backup Frequency
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    How often system backups are created
                                </div>
                            </div>
                            <select
                                value={settings.backup_frequency}
                                onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
                                style={{
                                    padding: '0.625rem 1rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    minWidth: '140px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🔔 Notification Settings
                    </h3>

                    <div style={{display: 'grid', gap: '1.25rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    Email Notifications
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Send system notifications via email
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={settings.notification_settings.email_notifications}
                                onChange={(checked) => handleSettingChange('notification_settings.email_notifications', checked)}
                                label={settings.notification_settings.email_notifications ? 'Enabled' : 'Disabled'}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    In-App Notifications
                                </div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Show notifications within the platform
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={settings.notification_settings.in_app_notifications}
                                onChange={(checked) => handleSettingChange('notification_settings.in_app_notifications', checked)}
                                label={settings.notification_settings.in_app_notifications ? 'Enabled' : 'Disabled'}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4}}
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <button
                        onClick={() => fetchSettings()}
                        disabled={saving}
                        style={{
                            padding: '0.875rem 1.75rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '2px solid #d1d5db',
                            borderRadius: '10px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!saving) e.currentTarget.style.backgroundColor = '#e5e7eb'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                        }}
                    >
                        🔄 Reset
                    </button>

                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        style={{
                            padding: '0.875rem 2rem',
                            backgroundColor: saving ? '#94a3b8' : '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!saving) {
                                e.currentTarget.style.backgroundColor = '#4f46e5'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!saving) {
                                e.currentTarget.style.backgroundColor = '#6366f1'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }
                        }}
                    >
                        {saving && <span>⏳</span>}
                        {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                </motion.div>
            </div>
        </div>
    )
}

export default SystemSettings