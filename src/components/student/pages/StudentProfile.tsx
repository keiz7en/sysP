import React from 'react'

const StudentProfile: React.FC = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>👤 Profile</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Account settings and preferences
            </p>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        fontSize: '2rem',
                        color: 'white'
                    }}>
                        👤
                    </div>
                    <h3 style={{ margin: '1rem 0 0.25rem 0' }}>Student Profile</h3>
                    <p style={{ margin: 0, color: '#6b7280' }}>Manage your account settings</p>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Personal Information</h4>
                        <p style={{ margin: 0, color: '#6b7280' }}>Update your personal details and preferences</p>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Learning Preferences</h4>
                        <p style={{ margin: 0, color: '#6b7280' }}>Customize your AI learning experience</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentProfile
