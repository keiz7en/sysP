import React from 'react'

const CareerGuidance: React.FC = () => {
    const careerRecommendations = [
        { title: 'Software Engineer', match: 92, salary: '$85,000 - $150,000', icon: '💻' },
        { title: 'Data Scientist', match: 88, salary: '$90,000 - $160,000', icon: '📊' },
        { title: 'Research Scientist', match: 85, salary: '$80,000 - $140,000', icon: '🔬' }
    ]

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>💼 Career Guidance</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                AI-powered career recommendations and professional development
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {careerRecommendations.map((career, index) => (
                    <div key={index} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>{career.icon}</span>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{career.title}</h3>
                                    <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>{career.salary}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                }}>
                                    {career.match}%
                                </div>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>Match</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CareerGuidance
