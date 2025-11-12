import React from 'react'
import {motion} from 'framer-motion'
import {useNavigate} from 'react-router-dom'

const LandingPage: React.FC = () => {
    const navigate = useNavigate()

    const features = [
        {
            icon: '🤖',
            title: 'AI-Powered Learning',
            description: 'Personalized learning paths powered by Google Gemini AI that adapt to your pace and style.'
        },
        {
            icon: '💼',
            title: 'Career Guidance',
            description: 'Get AI-driven career recommendations, skill gap analysis, and job matching tailored to your profile.'
        },
        {
            icon: '📊',
            title: 'Smart Analytics',
            description: 'Track progress with intelligent insights, performance predictions, and actionable recommendations.'
        },
        {
            icon: '🎯',
            title: 'Adaptive Assessments',
            description: 'Take adaptive quizzes that adjust difficulty in real-time based on your performance.'
        },
        {
            icon: '👨‍🏫',
            title: 'Teacher Tools',
            description: 'Comprehensive course management, automated grading, and detailed student analytics.'
        },
        {
            icon: '♿',
            title: 'Accessibility First',
            description: 'Voice recognition, speech-to-text, and adaptive tools ensure learning for everyone.'
        }
    ]

    const stats = [
        {value: '10K+', label: 'Active Students'},
        {value: '500+', label: 'Expert Teachers'},
        {value: '95%', label: 'Success Rate'},
        {value: '24/7', label: 'AI Support'}
    ]

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        }}>
            {/* Navigation Header */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span style={{fontSize: '2rem'}}>🎓</span>
                    <h1 style={{margin: 0, fontSize: '1.8rem', fontWeight: '700'}}>EduAI</h1>
                </div>
                <div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'transparent',
                            border: '2px solid white',
                            color: 'white',
                            padding: '0.75rem 2rem',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.color = '#667eea'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'white'
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            background: 'white',
                            border: 'none',
                            color: '#667eea',
                            padding: '0.75rem 2rem',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            transition: 'transform 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{padding: '5rem 3rem', textAlign: 'center'}}>
                <motion.div
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8}}
                >
                    <h1 style={{
                        fontSize: '4rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        lineHeight: '1.2'
                    }}>
                        The Future of Education<br/>is AI-Powered
                    </h1>
                    <p style={{
                        fontSize: '1.5rem',
                        marginBottom: '3rem',
                        opacity: 0.9,
                        maxWidth: '800px',
                        margin: '0 auto 3rem'
                    }}>
                        Experience personalized learning, intelligent career guidance, and adaptive assessments
                        powered by Google Gemini AI.
                    </p>
                    <div style={{display: 'flex', gap: '1.5rem', justifyContent: 'center'}}>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                background: 'white',
                                border: 'none',
                                color: '#667eea',
                                padding: '1.25rem 3rem',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '1.2rem',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                                transition: 'transform 0.3s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            🚀 Start Learning Free
                        </button>
                        <button
                            onClick={() => {
                                const featuresSection = document.getElementById('features')
                                featuresSection?.scrollIntoView({behavior: 'smooth'})
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '2px solid white',
                                color: 'white',
                                padding: '1.25rem 3rem',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '1.2rem',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            📖 Explore Features
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section style={{
                padding: '3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, scale: 0.5}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{delay: index * 0.1, duration: 0.5}}
                            style={{textAlign: 'center'}}
                        >
                            <div style={{fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem'}}>
                                {stat.value}
                            </div>
                            <div style={{fontSize: '1.1rem', opacity: 0.9}}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{padding: '5rem 3rem', backgroundColor: '#f8fafc'}}>
                <div style={{maxWidth: '1400px', margin: '0 auto'}}>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Powerful Features for Modern Learning
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        color: '#64748b',
                        marginBottom: '4rem',
                        maxWidth: '700px',
                        margin: '0 auto 4rem'
                    }}>
                        Everything you need to succeed in education, powered by cutting-edge AI technology
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{opacity: 0, y: 50}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.1, duration: 0.5}}
                                viewport={{once: true}}
                                style={{
                                    backgroundColor: 'white',
                                    padding: '2.5rem',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.3s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{
                                    fontSize: '4rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    marginBottom: '1rem',
                                    color: '#1e293b'
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    margin: 0
                                }}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '5rem 3rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    whileInView={{opacity: 1, scale: 1}}
                    transition={{duration: 0.6}}
                    viewport={{once: true}}
                >
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem'
                    }}>
                        Ready to Transform Your Learning?
                    </h2>
                    <p style={{
                        fontSize: '1.3rem',
                        marginBottom: '3rem',
                        opacity: 0.9
                    }}>
                        Join thousands of students already learning smarter with AI
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            background: 'white',
                            border: 'none',
                            color: '#667eea',
                            padding: '1.25rem 3rem',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '1.2rem',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                            transition: 'transform 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        🎓 Get Started for Free
                    </button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '3rem',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                textAlign: 'center'
            }}>
                <div style={{marginBottom: '2rem'}}>
                    <span style={{fontSize: '2.5rem'}}>🎓</span>
                    <h3 style={{fontSize: '1.5rem', margin: '0.5rem 0'}}>EduAI</h3>
                    <p style={{opacity: 0.8}}>Empowering education through AI innovation</p>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }}>
                    <a href="/about" style={{color: 'white', textDecoration: 'none', opacity: 0.8}}>About</a>
                    <a href="/features" style={{color: 'white', textDecoration: 'none', opacity: 0.8}}>Features</a>
                    <a href="/contact" style={{color: 'white', textDecoration: 'none', opacity: 0.8}}>Contact</a>
                    <a href="/login" style={{color: 'white', textDecoration: 'none', opacity: 0.8}}>Sign In</a>
                </div>
                <p style={{opacity: 0.6, fontSize: '0.9rem'}}>
                    © 2024 EduAI. All rights reserved. Powered by Google Gemini AI.
                </p>
            </footer>
        </div>
    )
}

export default LandingPage
