import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    user_type: 'student' | 'teacher' | 'admin'
    approval_status: 'pending' | 'approved' | 'rejected'
    date_joined: string
    is_active: boolean
    phone_number?: string
    address?: string
}

const UserManagement: React.FC = () => {
    const {user, token} = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUserType, setSelectedUserType] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user && token) {
            fetchUsers()
        }
    }, [user, token])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/users/all-users/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            } else {
                // No mock data - show empty state
                console.error('Failed to fetch users:', response.status)
                setUsers([])
                toast.error('Failed to load users. Please try again.')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            setUsers([])
            toast.error('Unable to connect to server. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const handleUserStatusToggle = async (userId: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`http://localhost:8000/api/users/toggle-status/${userId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({is_active: !currentStatus})
            })

            if (response.ok) {
                toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
                fetchUsers()
            } else {
                toast.error('Failed to update user status')
            }
        } catch (error) {
            console.error('Error updating user status:', error)
            toast.error('Error updating user status')
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesType = selectedUserType === 'all' || u.user_type === selectedUserType
        const matchesSearch = u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesType && matchesSearch
    })

    const getUserTypeColor = (userType: string) => {
        switch (userType) {
            case 'admin':
                return '#dc2626'
            case 'teacher':
                return '#7c3aed'
            case 'student':
                return '#059669'
            default:
                return '#6b7280'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return '#059669'
            case 'pending':
                return '#d97706'
            case 'rejected':
                return '#dc2626'
            default:
                return '#6b7280'
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
                    Loading users...
                </div>
            </div>
        )
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }}>
                    👥 User Management
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    marginBottom: '0'
                }}>
                    Manage all system users, view profiles, and handle permissions
                </p>
            </div>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem'}}>
                        {users.length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Total Users
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#059669', marginBottom: '0.5rem'}}>
                        {users.filter(u => u.user_type === 'student').length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Students
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#7c3aed', marginBottom: '0.5rem'}}>
                        {users.filter(u => u.user_type === 'teacher').length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Teachers
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                    style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.5rem'}}>
                        {users.filter(u => u.approval_status === 'pending').length}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '500'}}>
                        Pending Approval
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.4}}
                style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    marginBottom: '2rem'
                }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <div>
                        <input
                            type="text"
                            placeholder="Search users by name, email, or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        <select
                            value={selectedUserType}
                            onChange={(e) => setSelectedUserType(e.target.value)}
                            style={{
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                minWidth: '150px'
                            }}
                        >
                            <option value="all">All Users</option>
                            <option value="student">Students</option>
                            <option value="teacher">Teachers</option>
                            <option value="admin">Administrators</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Users Table */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.5}}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#f9fafb'
                }}>
                    <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
                        System Users ({filteredUsers.length})
                    </h3>
                </div>

                {filteredUsers.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>👤</div>
                        <p>No users found matching your criteria</p>
                    </div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                            <tr style={{backgroundColor: '#f9fafb'}}>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>User
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Role
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Status
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Joined
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map((userData, index) => (
                                <motion.tr
                                    key={userData.id}
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: index * 0.05}}
                                    style={{borderBottom: '1px solid #e5e7eb'}}
                                >
                                    <td style={{padding: '1rem'}}>
                                        <div>
                                            <div style={{fontWeight: '600', color: '#1f2937'}}>
                                                {userData.first_name} {userData.last_name}
                                            </div>
                                            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                                {userData.email}
                                            </div>
                                            <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>
                                                @{userData.username}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: `${getUserTypeColor(userData.user_type)}20`,
                                                color: getUserTypeColor(userData.user_type),
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {userData.user_type}
                                            </span>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: `${getStatusColor(userData.approval_status)}20`,
                                                    color: getStatusColor(userData.approval_status),
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {userData.approval_status}
                                                </span>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: userData.is_active ? '#dcfce7' : '#fee2e2',
                                                color: userData.is_active ? '#166534' : '#dc2626',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                    {userData.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                        </div>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                            <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
                                                {new Date(userData.date_joined).toLocaleDateString()}
                                            </span>
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button
                                                onClick={() => handleUserStatusToggle(userData.id, userData.is_active)}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    backgroundColor: userData.is_active ? '#fef2f2' : '#f0fdf4',
                                                    color: userData.is_active ? '#dc2626' : '#166534',
                                                    border: `1px solid ${userData.is_active ? '#fecaca' : '#bbf7d0'}`,
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {userData.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default UserManagement