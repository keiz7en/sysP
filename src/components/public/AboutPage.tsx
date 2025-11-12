import React from 'react'
import {motion} from 'framer-motion'
import {useNavigate} from 'react-router-dom'

const AboutPage: React.FC = () => {
    const navigate = useNavigate()

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
                        About EduAI
                    </h1>
                    <p style={{fontSize: '1.3rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto'}}>
                        Revolutionizing education through the power of artificial intelligence
                    </p>
                </motion.div>
            </section>

            {/* Mission */}
            <section style={{padding: '5rem 3rem', maxWidth: '1200px', margin: '0 auto'}}>
                <motion.div
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.6}}
                    viewport={{once: true}}
                >
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        color: '#1e293b'
                    }}>
                        Our Mission
                    </h2>
                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.8',
                        color: '#64748b',
                        textAlign: 'center',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}>
                        At EduAI, we believe that every student deserves access to world-class education tailored to
                        their unique learning style. Our mission is to democratize education through AI technology,
                        making personalized learning accessible to everyone, everywhere. We leverage Google Gemini AI
                        to create adaptive learning experiences that evolve with each student's needs, ensuring
                        optimal learning outcomes and career success.
                    </p>
                </motion.div>
            </section>

            {/* Values */}
            <section style={{padding: '3rem', backgroundColor: 'white'}}>
                <div style={{maxWidth: '1200px', margin: '0 auto'}}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        color: '#1e293b'
                    }}>
                        Our Core Values
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {[
                            {
                                icon: '🎯',
                                title: 'Student-Centric',
                                description: 'Every decision we make puts student success and well-being first.'
                            },
                            {
                                icon: '🚀',
                                title: 'Innovation',
                                description: 'We continuously evolve our platform with cutting-edge AI technology.'
                            },
                            {
                                icon: '🤝',
                                title: 'Accessibility',
                                description: 'Education should be accessible to everyone, regardless of circumstances.'
                            },
                            {
                                icon: '📊',
                                title: 'Data-Driven',
                                description: 'We use analytics and AI insights to continuously improve outcomes.'
                            },
                            {
                                icon: '🌍',
                                title: 'Inclusivity',
                                description: 'We celebrate diversity and create an inclusive learning environment.'
                            },
                            {
                                icon: '⚡',
                                title: 'Excellence',
                                description: 'We strive for excellence in everything we do, from code to support.'
                            }
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{opacity: 0, y: 30}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.1, duration: 0.5}}
                                viewport={{once: true}}
                                style={{
                                    padding: '2rem',
                                    borderRadius: '15px',
                                    backgroundColor: '#f8fafc',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>{value.icon}</div>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '700',
                                    marginBottom: '0.5rem',
                                    color: '#1e293b'
                                }}>
                                    {value.title}
                                </h3>
                                <p style={{color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0}}>
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology */}
            <section style={{padding: '5rem 3rem', maxWidth: '1200px', margin: '0 auto'}}>
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    marginBottom: '3rem',
                    color: '#1e293b'
                }}>
                    Powered by Advanced AI
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {[
                        {name: 'Google Gemini AI', desc: 'Advanced language model for personalized learning'},
                        {name: 'React & TypeScript', desc: 'Modern, type-safe frontend development'},
                        {name: 'Django REST Framework', desc: 'Robust, scalable backend architecture'},
                        {name: 'Real-time Analytics', desc: 'Instant insights on student performance'}
                    ].map((tech, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, scale: 0.9}}
                            whileInView={{opacity: 1, scale: 1}}
                            transition={{delay: index * 0.1, duration: 0.4}}
                            viewport={{once: true}}
                            style={{
                                padding: '2rem',
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}
                        >
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                marginBottom: '0.5rem',
                                color: '#667eea'
                            }}>
                                {tech.name}
                            </h3>
                            <p style={{color: '#64748b', fontSize: '0.95rem', margin: 0}}>
                                {tech.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{
                padding: '4rem 3rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem'}}>
                    Join the Future of Education
                </h2>
                <p style={{fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9}}>
                    Experience AI-powered learning today
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
                    Get Started Free
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

export default AboutPage
