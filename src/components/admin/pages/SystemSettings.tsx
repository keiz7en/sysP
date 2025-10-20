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
            const response = await fetch('http://localhost:8000/api/admin/system-settings/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error('Error loading system settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        try {
            setSaving(true)
            const response = await fetch('http://localhost:8000/api/admin/system-settings/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({settings})
            })

            if (response.ok) {
                toast.success('System settings saved successfully!')
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
            const [parent, child] = key.split('.')
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof SystemSettings],
                    [child]: value
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
                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>
                    Loading system settings...
                </div>
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
                    color: '#1f2937',
                    marginBottom: '0.5rem'
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

            <div style={{display: 'grid', gap: '2rem'}}>
                {/* User Management Settings */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        👥 User Management
                    </h3>

                    <div style={{display: 'grid', gap: '1rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Auto-approve Students</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Automatically approve student registrations
                                </div>
                            </div>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                <input
                                    type="checkbox"
                                    checked={settings.auto_approve_students}
                                    onChange={(e) => handleSettingChange('auto_approve_students', e.target.checked)}
                                    style={{marginRight: '0.5rem'}}
                                />
                                <span>{settings.auto_approve_students ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Auto-approve Teachers</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Automatically approve teacher applications
                                </div>
                            </div>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                <input
                                    type="checkbox"
                                    checked={settings.auto_approve_teachers}
                                    onChange={(e) => handleSettingChange('auto_approve_teachers', e.target.checked)}
                                    style={{marginRight: '0.5rem'}}
                                />
                                <span>{settings.auto_approve_teachers ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Public Registration</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Allow users to register without invitation
                                </div>
                            </div>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                <input
                                    type="checkbox"
                                    checked={settings.allow_public_registration}
                                    onChange={(e) => handleSettingChange('allow_public_registration', e.target.checked)}
                                    style={{marginRight: '0.5rem'}}
                                />
                                <span>{settings.allow_public_registration ? 'Enabled' : 'Disabled'}</span>
                            </label>
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
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🔒 Security Settings
                    </h3>

                    <div style={{display: 'grid', gap: '1rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Email Verification</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Require email verification for new accounts
                                </div>
                            </div>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                <input
                                    type="checkbox"
                                    checked={settings.require_email_verification}
                                    onChange={(e) => handleSettingChange('require_email_verification', e.target.checked)}
                                    style={{marginRight: '0.5rem'}}
                                />
                                <span>{settings.require_email_verification ? 'Required' : 'Optional'}</span>
                            </label>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Max Login Attempts</div>
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
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    textAlign: 'center'
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Session Timeout</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Minutes before user session expires
                                </div>
                            </div>
                            <input
                                type="number"
                                min="15"
                                max="10080" // 1 week
                                value={settings.session_timeout}
                                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                                style={{
                                    width: '100px',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    textAlign: 'center'
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
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🔧 System Maintenance
                    </h3>

                    <div style={{display: 'grid', gap: '1rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: settings.maintenance_mode ? '#fef2f2' : '#f9fafb',
                            borderRadius: '8px',
                            border: settings.maintenance_mode ? '1px solid #fecaca' : 'none'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Maintenance Mode</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    {settings.maintenance_mode ?
                                        'System is currently in maintenance mode' :
                                        'System is running normally'
                                    }
                                </div>
                            </div>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                <input
                                    type="checkbox"
                                    checked={settings.maintenance_mode}
                                    onChange={(e) => handleSettingChange('maintenance_mode', e.target.checked)}
                                    style={{marginRight: '0.5rem'}}
                                />
                                <span style={{
                                    color: settings.maintenance_mode ? '#dc2626' : '#059669',
                                    fontWeight: '600'
                                }}>
                                    {settings.maintenance_mode ? 'ON' : 'OFF'}
                                </span>
                            </label>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Backup Frequency</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    How often system backups are created
                                </div>
                            </div>
                            <select
                                value={settings.backup_frequency}
                                onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    minWidth: '120px'
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
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🔔 Notification Settings
                    </h3>

                    <div style={{display: 'grid', gap: '1rem'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>Email Notifications</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Send system notifications via email
                                </div>
                            </div>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                <input
                                    type="checkbox"
                                    checked={settings.notification_settings.email_notifications}
                                    onChange={(e) => handleSettingChange('notification_settings.email_notifications', e.target.checked)}
                                    style={{marginRight: '0.5rem'}}
                                />
                                <span>{settings.notification_settings.email_notifications ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{fontWeight: '600', color: '#1f2937'}}>In-App Notifications</div>
                                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                    Show notifications within the platform
                                </div>
                            </div>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                <input
                                    type="checkbox"
                                    checked={settings.notification_settings.in_app_notifications}
                                    onChange={(e) => handleSettingChange('notification_settings.in_app_notifications', e.target.checked)}
                                    style={{marginRight: '0.5rem'}}
                                />
                                <span>{settings.notification_settings.in_app_notifications ? 'Enabled' : 'Disabled'}</span>
                            </label>
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
                        padding: '2rem',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <button
                        onClick={() => fetchSettings()}
                        disabled={saving}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Reset
                    </button>

                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: saving ? '#94a3b8' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {saving && <span>⏳</span>}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </motion.div>
            </div>
        </div>
    )
}

export default SystemSettings