import React from 'react'
import {motion} from 'framer-motion'

const TeacherApproval: React.FC = () => {
    return (
        <div style={{padding: '2rem'}}>
            <h1 style={{fontSize: '2.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
                ✅ Teacher Approval
            </h1>
            <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem'}}>
                Review and approve teacher applications for platform access
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
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>✅</div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937'}}>Teacher Approval System</h3>
                <p style={{color: '#6b7280', marginBottom: '2rem'}}>
                    Review teacher applications, verify credentials, and grant platform access to qualified educators.
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#d97706'}}>Pending Reviews</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Applications awaiting approval</div>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#166534'}}>Approved Teachers</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Active teacher accounts</div>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#dc2626'}}>Rejected Applications
                        </div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Previously rejected requests</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default TeacherApproval