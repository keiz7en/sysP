import React from 'react'
import {motion} from 'framer-motion'

const UserManagement: React.FC = () => {
    return (
        <div style={{padding: '2rem'}}>
            <h1 style={{fontSize: '2.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
                👥 User Management
            </h1>
            <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem'}}>
                Manage all system users, view profiles, and handle permissions
            </p>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}
            >
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>👥</div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937'}}>User Management Portal</h3>
                <p style={{color: '#6b7280', marginBottom: '2rem'}}>
                    Comprehensive user management system with full CRUD operations, role management, and detailed user
                    analytics.
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#1e40af'}}>View Users</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Browse all registered users</div>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#166534'}}>Edit Profiles</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Modify user information</div>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#d97706'}}>Manage Roles</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Assign user permissions</div>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#1f2937'}}>Student Approvals</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Approve pending student registrations</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default UserManagement