import React from 'react'
import {motion} from 'framer-motion'
import {useNavigate} from 'react-router-dom'

const FeaturesPage: React.FC = () => {
    const navigate = useNavigate()

    const allFeatures = [
        {
            category: '🧠 AI-Powered Learning',
            features: [
                {
                    icon: '🎯',
                    name: 'Personalized Learning Paths',
                    description: 'AI analyzes your progress and creates custom learning paths tailored to your pace and style.'
                },
                {
                    icon: '📊',
                    name: 'Adaptive Assessments',
                    description: 'Quizzes that adjust difficulty in real-time based on your performance.'
                },
                {
                    icon: '🤖',
                    name: '24/7 AI Assistant',
                    description: 'Get instant help with homework, concepts, and study strategies anytime.'
                },
                {
                    icon: '📈',
                    name: 'Progress Tracking',
                    description: 'Visual analytics show your learning journey and areas for improvement.'
                }
            ]
        },
        {
            category: '💼 Career Development',
            features: [
                {
                    icon: '🎓',
                    name: 'Career Recommendations',
                    description: 'AI-powered career suggestions based on your skills, interests, and performance.'
                },
                {
                    icon: '🔍',
                    name: 'Skill Gap Analysis',
                    description: 'Identify missing skills and get personalized training recommendations.'
                },
                {
                    icon: '💼',
                    name: 'Job Matching',
                    description: 'Connect with relevant job opportunities from major job boards.'
                },
                {
                    icon: '📄',
                    name: 'Resume Builder',
                    description: 'AI-assisted resume creation and optimization for better job prospects.'
                }
            ]
        },
        {
            category: '👨‍🏫 Teacher Tools',
            features: [
                {
                    icon: '📚',
                    name: 'Course Management',
                    description: 'Create, organize, and manage courses with intuitive tools.'
                },
                {
                    icon: '✍️',
                    name: 'Automated Grading',
                    description: 'AI-powered essay grading with detailed feedback and rubric scoring.'
                },
                {
                    icon: '👥',
                    name: 'Student Analytics',
                    description: 'Comprehensive insights into student performance and engagement.'
                },
                {
                    icon: '🎤',
                    name: 'Speech-to-Text',
                    description: 'Automatically transcribe lectures and create accessible content.'
                }
            ]
        },
        {
            category: '📊 Analytics & Insights',
            features: [
                {
                    icon: '🔮',
                    name: 'Predictive Analytics',
                    description: 'AI predicts learning outcomes and identifies students at risk.'
                },
                {
                    icon: '📉',
                    name: 'Dropout Prevention',
                    description: 'Machine learning identifies early warning signs and suggests interventions.'
                },
                {
                    icon: '📈',
                    name: 'Performance Trends',
                    description: 'Track performance over time with advanced visualizations.'
                },
                {
                    icon: '🎯',
                    name: 'Goal Tracking',
                    description: 'Set and monitor learning goals with AI-powered recommendations.'
                }
            ]
        },
        {
            category: '♿ Accessibility',
            features: [
                {
                    icon: '🎤',
                    name: 'Voice Commands',
                    description: 'Control the platform with voice commands for hands-free operation.'
                },
                {
                    icon: '🔊',
                    name: 'Text-to-Speech',
                    description: 'Have any content read aloud in multiple languages.'
                },
                {
                    icon: '👁️',
                    name: 'Screen Reader Support',
                    description: 'Full accessibility compliance for visually impaired users.'
                },
                {
                    icon: '🌐',
                    name: 'Multi-Language',
                    description: 'Support for multiple languages and localization.'
                }
            ]
        },
        {
            category: '🔐 Security & Privacy',
            features: [
                {
                    icon: '🔒',
                    name: 'Data Encryption',
                    description: 'End-to-end encryption for all sensitive data.'
                },
                {
                    icon: '🛡️',
                    name: 'Privacy Controls',
                    description: 'Granular control over data sharing and visibility.'
                },
                {
                    icon: '✅',
                    name: 'GDPR Compliant',
                    description: 'Full compliance with international data protection regulations.'
                },
                {
                    icon: '🔑',
                    name: 'Secure Authentication',
                    description: 'Token-based authentication with optional two-factor authentication.'
                }
            ]
        }
    ]

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
            {/* Navigation */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 3rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer'}}
                     onClick={() => navigate('/')}>
                    <span style={{fontSize: '2rem'}}>🎓</span>
                    <h1 style={{margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#667eea'}}>EduAI</h1>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <button
                        onClick={() => navigate('/about')}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            padding: '0.75rem 1.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                        }}
                    >
                        About
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            padding: '0.75rem 1.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                        }}
                    >
                        Contact
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 2rem',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                        }}
                    >
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                padding: '5rem 3rem 3rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{opacity: 0, y: 30}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                >
                    <h1 style={{fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem'}}>
                        Comprehensive Features
                    </h1>
                    <p style={{fontSize: '1.3rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto'}}>
                        Everything you need for modern, AI-powered education
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section style={{padding: '5rem 3rem', maxWidth: '1400px', margin: '0 auto'}}>
                {allFeatures.map((category, categoryIndex) => (
                    <div key={categoryIndex} style={{marginBottom: '5rem'}}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            marginBottom: '3rem',
                            color: '#1e293b',
                            textAlign: 'center'
                        }}>
                            {category.category}
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem'
                        }}>
                            {category.features.map((feature, featureIndex) => (
                                <motion.div
                                    key={featureIndex}
                                    initial={{opacity: 0, y: 30}}
                                    whileInView={{opacity: 1, y: 0}}
                                    transition={{delay: featureIndex * 0.1, duration: 0.5}}
                                    viewport={{once: true}}
                                    style={{
                                        backgroundColor: 'white',
                                        padding: '2rem',
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-5px)'
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                                    }}
                                >
                                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>
                                        {feature.icon}
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '700',
                                        marginBottom: '0.75rem',
                                        color: '#1e293b'
                                    }}>
                                        {feature.name}
                                    </h3>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        margin: 0
                                    }}>
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA */}
            <section style={{
                padding: '4rem 3rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem'}}>
                    Ready to Experience the Future?
                </h2>
                <p style={{fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9}}>
                    Join thousands already transforming their learning journey
                </p>
                <button
                    onClick={() => navigate('/register')}
                    style={{
                        background: 'white',
                        border: 'none',
                        color: '#667eea',
                        padding: '1rem 2.5rem',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                >
                    Get Started for Free
                </button>
            </section>

            {/* Footer */}
            <footer style={{padding: '2rem 3rem', backgroundColor: '#1e293b', color: 'white', textAlign: 'center'}}>
                <p style={{opacity: 0.8, margin: 0}}>
                    © 2024 EduAI. All rights reserved. Powered by Google Gemini AI.
                </p>
            </footer>
        </div>
    )
}

export default FeaturesPage
