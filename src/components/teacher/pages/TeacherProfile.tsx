import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

const TeacherProfile: React.FC = () => {
    const {user} = useAuth()
    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        bio: '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        specialization: [],
        department: user?.department || '',
        experience_years: user?.experience_years || 0,
        address: user?.address || ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number || '',
                bio: '',
                department: user.department || '',
                specialization: [],
                experience_years: user.experience_years || 0,
                address: user.address || ''
            })
        }
    }, [user])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/users/profile/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            })

            if (response.ok) {
                toast.success('Profile updated successfully!')
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Error updating profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{padding: '2rem', maxWidth: '800px', margin: '0 auto'}}>
            {/* Header */}
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                style={{marginBottom: '2rem'}}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    👤 Teacher Profile
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Manage your account settings and personal information
                </p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1}}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}
            >
                {/* Profile Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        fontSize: '2rem',
                        fontWeight: '600'
                    }}>
                        {user?.first_name?.charAt(0) || '👤'}
                    </div>
                    <h2 style={{margin: '0 0 0.5rem 0', fontSize: '1.5rem'}}>
                        {user?.first_name} {user?.last_name}
                    </h2>
                    <p style={{margin: 0, opacity: 0.9}}>
                        {user?.employee_id && `Employee ID: ${user.employee_id}`}
                    </p>
                    <p style={{margin: 0, opacity: 0.9}}>
                        {user?.department && `Department: ${user.department}`}
                    </p>
                </div>

                {/* Profile Form */}
                <div style={{padding: '2rem'}}>
                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
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
                                    name="first_name"
                                    value={profileData.first_name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
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
                                    name="last_name"
                                    value={profileData.last_name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{marginBottom: '1rem'}}>
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
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div style={{marginBottom: '1rem'}}>
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
                                name="phone_number"
                                value={profileData.phone_number}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div style={{marginBottom: '1rem'}}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={profileData.address}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div style={{marginBottom: '2rem'}}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={profileData.bio}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Tell us about yourself..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                            <button
                                type="button"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.2}}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    padding: '1.5rem',
                    marginTop: '1.5rem'
                }}
            >
                <h3 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937'
                }}>
                    📊 Account Information
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div>
                        <div style={{fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem'}}>
                            Account Created
                        </div>
                        <div style={{fontSize: '0.875rem', fontWeight: '500', color: '#1f2937'}}>
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem'}}>
                            Account Status
                        </div>
                        <div style={{fontSize: '0.875rem', fontWeight: '500', color: '#10b981'}}>
                            ✅ Verified Teacher
                        </div>
                    </div>
                    <div>
                        <div style={{fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem'}}>
                            Teaching Rating
                        </div>
                        <div style={{fontSize: '0.875rem', fontWeight: '500', color: '#f59e0b'}}>
                            {user?.teaching_rating ? `${user.teaching_rating.toFixed(1)}/5.0 ⭐` : 'Not rated yet'}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default TeacherProfile