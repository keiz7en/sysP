import React from 'react'

const LoadingScreen: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(255,255,255,0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '2rem'
            }}/>
            <h1 style={{fontSize: '3rem', marginBottom: '1rem', fontWeight: 700}}>
                🎓 EduAI System
            </h1>
            <p style={{fontSize: '1.25rem', opacity: 0.9, textAlign: 'center', maxWidth: '500px'}}>
                Initializing your AI-powered education experience...
            </p>
            <div style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
            }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}/>
                <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                }}/>
                <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                }}/>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 0.4; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                `
            }}/>
        </div>
    )
}

export default LoadingScreen