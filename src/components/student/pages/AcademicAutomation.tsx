import React from 'react'

const AcademicAutomation: React.FC = () => {
    const assessments = [
        { title: 'Calculus Midterm', type: 'Exam', dueDate: '2024-12-15', status: 'upcoming' },
        { title: 'Physics Lab Report', type: 'Assignment', dueDate: '2024-12-12', status: 'in-progress' },
        { title: 'Programming Quiz', type: 'Quiz', dueDate: '2024-12-10', status: 'upcoming' }
    ]

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡ Academic Automation</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                AI-powered assessments, instant grading, and smart academic tools
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {assessments.map((assessment, index) => (
                    <div key={index} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0' }}>{assessment.title}</h3>
                                <p style={{ margin: 0, color: '#6b7280' }}>
                                    {assessment.type} • Due: {assessment.dueDate}
                                </p>
                            </div>
                            <button style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: assessment.status === 'upcoming' ? '#3b82f6' : '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>
                                {assessment.status === 'upcoming' ? 'Start' : 'Continue'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AcademicAutomation
