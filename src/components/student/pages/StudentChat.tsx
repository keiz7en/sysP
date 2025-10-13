import React, { useState } from 'react'

const StudentChat: React.FC = () => {
    const [message, setMessage] = useState('')

    const handleSend = () => {
        if (message.trim()) {
            // Handle message sending logic here
            setMessage('')
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖 AI Assistant</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                24/7 AI-powered help and tutoring
            </p>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: '400px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ flex: 1, marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, textAlign: 'center', color: '#6b7280' }}>
                        Chat with your AI assistant. Ask questions about your courses, assignments, or anything else!
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask your AI assistant..."
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StudentChat
