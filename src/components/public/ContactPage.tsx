import React, {useState} from 'react'
import {motion} from 'framer-motion'
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast'

const ContactPage: React.FC = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        setFormData({name: '', email: '', subject: '', message: ''})
    }

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
                        Contact Us
                    </h1>
                    <p style={{fontSize: '1.3rem', opacity: 0.9}}>
                        Have questions? We're here to help!
                    </p>
                </motion.div>
            </section>

            {/* Contact Info & Form */}
            <section style={{padding: '5rem 3rem', maxWidth: '1200px', margin: '0 auto'}}>
                <div
                    style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem'}}>
                    {/* Contact Information */}
                    <motion.div
                        initial={{opacity: 0, x: -50}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.6}}
                    >
                        <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b'}}>
                            Get in Touch
                        </h2>
                        <p style={{color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem'}}>
                            Have any questions about EduAI? Our team is ready to assist you with any inquiries about our
                            AI-powered learning platform.
                        </p>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            {[
                                {icon: '📧', label: 'Email', value: 'support@eduai.com'},
                                {icon: '📞', label: 'Phone', value: '+1 (555) 123-4567'},
                                {icon: '📍', label: 'Address', value: '123 Education St, Learning City, LC 12345'},
                                {icon: '⏰', label: 'Hours', value: 'Mon-Fri: 9AM - 6PM EST'}
                            ].map((info, index) => (
                                <div key={index} style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                                    <span style={{fontSize: '2rem'}}>{info.icon}</span>
                                    <div>
                                        <div style={{fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem'}}>
                                            {info.label}
                                        </div>
                                        <div style={{color: '#64748b'}}>{info.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Social Links */}
                        <div style={{marginTop: '3rem'}}>
                            <h3 style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b'}}>
                                Connect With Us
                            </h3>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                {['💼', '🐦', '📘', '📷'].map((icon, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {icon}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{opacity: 0, x: 50}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.6}}
                        style={{
                            backgroundColor: 'white',
                            padding: '3rem',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <h2 style={{fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b'}}>
                            Send Us a Message
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Your name"
                                />
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="What is this regarding?"
                                />
                            </div>

                            <div style={{marginBottom: '2rem'}}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Message *
                                </label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    rows={5}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Tell us more about your inquiry..."
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    transition: 'transform 0.3s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                📤 Send Message
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section style={{padding: '5rem 3rem', backgroundColor: 'white'}}>
                <div style={{maxWidth: '900px', margin: '0 auto'}}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        color: '#1e293b'
                    }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        {[
                            {
                                q: 'How does the AI-powered learning work?',
                                a: 'Our platform uses Google Gemini AI to create personalized learning paths that adapt to your progress and learning style in real-time.'
                            },
                            {
                                q: 'Is EduAI free to use?',
                                a: 'Yes! Students can sign up and access basic features for free. Premium features and advanced analytics are available for teachers and institutions.'
                            },
                            {
                                q: 'What subjects are covered?',
                                a: 'EduAI supports a wide range of subjects including Computer Science, Mathematics, Sciences, and more. New courses are added regularly.'
                            },
                            {
                                q: 'How secure is my data?',
                                a: 'We take security seriously. All data is encrypted and stored securely. We never share your personal information with third parties.'
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{opacity: 0, y: 20}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.1, duration: 0.5}}
                                viewport={{once: true}}
                                style={{
                                    padding: '1.5rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #667eea'
                                }}
                            >
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    marginBottom: '0.75rem',
                                    color: '#1e293b'
                                }}>
                                    {faq.q}
                                </h3>
                                <p style={{color: '#64748b', margin: 0, lineHeight: '1.6'}}>{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
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

export default ContactPage
