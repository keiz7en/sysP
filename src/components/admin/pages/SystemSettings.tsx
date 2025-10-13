import React from 'react'
import {motion} from 'framer-motion'

const SystemSettings: React.FC = () => {
    return (
        <div style={{padding: '2rem'}}>
            <h1 style={{fontSize: '2.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
                ⚙️ System Settings
            </h1>
            <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem'}}>
                Configure system parameters, security settings, and platform features
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
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>⚙️</div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937'}}>System Configuration</h3>
                <p style={{color: '#6b7280', marginBottom: '2rem'}}>
                    Advanced system configuration panel for managing platform settings, security policies, and feature
                    toggles.
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#374151'}}>Security</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Authentication & permissions</div>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#1e40af'}}>Features</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>Platform feature toggles</div>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: '#fdf4ff', borderRadius: '8px'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: '600', color: '#7c3aed'}}>Performance</div>
                        <div style={{fontSize: '0.9rem', color: '#64748b'}}>System optimization settings</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default SystemSettings