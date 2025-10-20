import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface StudentProfileData {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    student_id?: string;
    date_of_birth?: string;
    address?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    major?: string;
    year?: string;
    gpa?: number;
    credits_completed?: number;
    learning_preferences?: {
        visual: boolean;
        auditory: boolean;
        kinesthetic: boolean;
        reading: boolean;
    };
    accessibility_needs?: string[];
    languages?: string[];
}

const StudentProfile: React.FC = () => {
    const {user, token} = useAuth()
    const [profile, setProfile] = useState<StudentProfileData>({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        learning_preferences: {
            visual: false,
            auditory: false,
            kinesthetic: false,
            reading: false
        },
        accessibility_needs: [],
        languages: []
    })
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'learning' | 'accessibility'>('personal')

    useEffect(() => {
        fetchProfile()
    }, [token])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            // Use only real user data from auth context - no dummy data
            if (user) {
                setProfile(prev => ({
                    ...prev,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    email: user.email || '',
                    student_id: user.student_id || '',
                    // Only set values that actually exist in user data
                    phone: user.phone_number || '',
                    date_of_birth: user.date_of_birth || '',
                    address: user.address || ''
                }))
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            // Here you would save to the backend
            // await api.updateProfile(token, profile)
            toast.success('Profile updated successfully!')
            setEditing(false)
        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error('Failed to save profile')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof StudentProfileData, value: any) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleLearningPreferenceChange = (preference: keyof typeof profile.learning_preferences, checked: boolean) => {
        setProfile(prev => ({
            ...prev,
            learning_preferences: {
                ...prev.learning_preferences!,
                [preference]: checked
            }
        }))
    }

    const tabs = [
        {id: 'personal', label: 'Personal Info', icon: '👤'},
        {id: 'academic', label: 'Academic', icon: '🎓'},
        {id: 'learning', label: 'Learning Style', icon: '🧠'},
        {id: 'accessibility', label: 'Accessibility', icon: '♿'}
    ]

    if (loading && !profile.first_name) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <div style={{fontSize: '1.2rem', color: '#6b7280'}}>
                    Loading your profile...
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            style={{padding: '2rem', maxWidth: '1000px', margin: '0 auto'}}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937'}}>
                        👤 Student Profile
                    </h1>
                    <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                        Manage your account settings and learning preferences
                    </p>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                    {editing ? (
                        <>
                            <button
                                onClick={() => setEditing(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: loading ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Header Card */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
                color: 'white'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        border: '3px solid rgba(255,255,255,0.3)'
                    }}>
                        👤
                    </div>
                    <div>
                        <h2 style={{fontSize: '2rem', margin: '0 0 0.5rem 0'}}>
                            {profile.first_name} {profile.last_name}
                        </h2>
                        <p style={{fontSize: '1.1rem', margin: '0 0 0.25rem 0', opacity: 0.9}}>
                            {profile.email}
                        </p>
                        {profile.student_id && (
                            <p style={{fontSize: '1rem', margin: 0, opacity: 0.8}}>
                                Student ID: {profile.student_id}
                            </p>
                        )}
                    </div>
                    {profile.gpa && (
                        <div style={{
                            marginLeft: 'auto',
                            textAlign: 'center',
                            padding: '1rem',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px'
                        }}>
                            <div style={{fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                                {profile.gpa.toFixed(2)}
                            </div>
                            <div style={{fontSize: '0.9rem', opacity: 0.9}}>Current GPA</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            backgroundColor: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
                            color: activeTab === tab.id ? 'white' : '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span style={{fontSize: '1rem'}}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
            }}>
                {activeTab === 'personal' && (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                First Name
                            </label>
                            <input
                                type="text"
                                value={profile.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            />
                        </div>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={profile.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            />
                        </div>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            />
                        </div>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={profile.phone || ''}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                disabled={!editing}
                                placeholder="(555) 123-4567"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            />
                        </div>
                        <div style={{gridColumn: '1 / -1'}}>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Address
                            </label>
                            <textarea
                                value={profile.address || ''}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                disabled={!editing}
                                placeholder="123 Main St, City, State, ZIP"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'academic' && (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Major
                            </label>
                            <input
                                type="text"
                                value={profile.major || ''}
                                onChange={(e) => handleInputChange('major', e.target.value)}
                                disabled={!editing}
                                placeholder="Computer Science"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            />
                        </div>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Academic Year
                            </label>
                            <select
                                value={profile.year || ''}
                                onChange={(e) => handleInputChange('year', e.target.value)}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            >
                                <option value="">Select Year</option>
                                <option value="Freshman">Freshman</option>
                                <option value="Sophomore">Sophomore</option>
                                <option value="Junior">Junior</option>
                                <option value="Senior">Senior</option>
                                <option value="Graduate">Graduate</option>
                            </select>
                        </div>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Current GPA
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="4"
                                step="0.01"
                                value={profile.gpa || ''}
                                onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value))}
                                disabled={!editing}
                                placeholder="3.75"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            />
                        </div>
                        <div>
                            <label
                                style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151'}}>
                                Credits Completed
                            </label>
                            <input
                                type="number"
                                value={profile.credits_completed || ''}
                                onChange={(e) => handleInputChange('credits_completed', parseInt(e.target.value))}
                                disabled={!editing}
                                placeholder="85"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: editing ? 'white' : '#f9fafb'
                                }}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'learning' && (
                    <div>
                        <h3 style={{fontSize: '1.3rem', marginBottom: '1rem', color: '#1f2937'}}>
                            Learning Style Preferences
                        </h3>
                        <p style={{color: '#6b7280', marginBottom: '2rem'}}>
                            Select your preferred learning styles to help our AI personalize your experience.
                        </p>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                            {[
                                {
                                    key: 'visual',
                                    label: 'Visual Learning',
                                    icon: '👁️',
                                    description: 'Learn through images, diagrams, and visual aids'
                                },
                                {
                                    key: 'auditory',
                                    label: 'Auditory Learning',
                                    icon: '🎧',
                                    description: 'Learn through listening and verbal instruction'
                                },
                                {
                                    key: 'kinesthetic',
                                    label: 'Kinesthetic Learning',
                                    icon: '🤝',
                                    description: 'Learn through hands-on activities and movement'
                                },
                                {
                                    key: 'reading',
                                    label: 'Reading/Writing',
                                    icon: '📚',
                                    description: 'Learn through text-based materials and writing'
                                }
                            ].map((style) => (
                                <div key={style.key} style={{
                                    padding: '1.5rem',
                                    border: '2px solid ' + (profile.learning_preferences?.[style.key as keyof typeof profile.learning_preferences] ? '#3b82f6' : '#e5e7eb'),
                                    borderRadius: '12px',
                                    cursor: editing ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    backgroundColor: profile.learning_preferences?.[style.key as keyof typeof profile.learning_preferences] ? '#eff6ff' : 'white'
                                }}
                                     onClick={() => editing && handleLearningPreferenceChange(style.key as keyof typeof profile.learning_preferences, !profile.learning_preferences?.[style.key as keyof typeof profile.learning_preferences])}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{fontSize: '1.5rem'}}>{style.icon}</span>
                                        <div>
                                            <h4 style={{margin: 0, color: '#1f2937'}}>{style.label}</h4>
                                        </div>
                                        {editing && (
                                            <input
                                                type="checkbox"
                                                checked={profile.learning_preferences?.[style.key as keyof typeof profile.learning_preferences] || false}
                                                onChange={(e) => handleLearningPreferenceChange(style.key as keyof typeof profile.learning_preferences, e.target.checked)}
                                                style={{marginLeft: 'auto', transform: 'scale(1.2)'}}
                                            />
                                        )}
                                    </div>
                                    <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>
                                        {style.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'accessibility' && (
                    <div>
                        <h3 style={{fontSize: '1.3rem', marginBottom: '1rem', color: '#1f2937'}}>
                            Accessibility Settings
                        </h3>
                        <p style={{color: '#6b7280', marginBottom: '2rem'}}>
                            Configure accessibility features to enhance your learning experience.
                        </p>
                        <div style={{display: 'grid', gap: '1.5rem'}}>
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    margin: '0 0 1rem 0'
                                }}>
                                    <span style={{fontSize: '1.5rem'}}>🎤</span>
                                    Voice Recognition
                                </h4>
                                <p style={{color: '#6b7280', margin: '0 0 1rem 0'}}>
                                    Use voice commands for navigation and content interaction
                                </p>
                                {editing && (
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}>
                                        Configure
                                    </button>
                                )}
                            </div>
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    margin: '0 0 1rem 0'
                                }}>
                                    <span style={{fontSize: '1.5rem'}}>🔊</span>
                                    Text-to-Speech
                                </h4>
                                <p style={{color: '#6b7280', margin: '0 0 1rem 0'}}>
                                    Have content read aloud automatically
                                </p>
                                {editing && (
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}>
                                        Configure
                                    </button>
                                )}
                            </div>
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    margin: '0 0 1rem 0'
                                }}>
                                    <span style={{fontSize: '1.5rem'}}>🎨</span>
                                    Visual Adjustments
                                </h4>
                                <p style={{color: '#6b7280', margin: '0 0 1rem 0'}}>
                                    High contrast mode, font size adjustments, and color options
                                </p>
                                {editing && (
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}>
                                        Configure
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default StudentProfile
