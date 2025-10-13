import React from 'react'

const AdaptiveLearning: React.FC = () => {
    const learningPaths = [
        { title: 'Advanced Mathematics', progress: 75, difficulty: 'Intermediate', icon: '🧮' },
        { title: 'Physics Mastery', progress: 60, difficulty: 'Advanced', icon: '⚛️' },
        { title: 'Computer Science', progress: 90, difficulty: 'Expert', icon: '💻' }
    ]

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧠 Adaptive Learning</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                AI-powered personalized learning paths tailored to your learning style
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {learningPaths.map((path, index) => (
                    <div key={index} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>{path.icon}</span>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0' }}>{path.title}</h3>
                                <p style={{ margin: 0, color: '#6b7280' }}>{path.difficulty}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Progress</span>
                                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{path.progress}%</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${path.progress}%`,
                                    height: '100%',
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '4px'
                                }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdaptiveLearning
