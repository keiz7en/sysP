import React, {useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'

interface OnboardingScreenProps {
    onComplete: () => void
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({onComplete}) => {
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = [
        {
            icon: '🧠',
            title: 'AI-Powered Learning',
            subtitle: 'Personalized Education Revolution',
            description: 'Experience adaptive learning paths that adjust to your unique pace, learning style, and performance. Our AI analyzes your progress in real-time to create the most effective study journey.',
            features: [
                'Dynamic difficulty adjustment',
                'Personalized content recommendations',
                'Real-time progress analytics'
            ],
            color: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
        },
        {
            icon: '📊',
            title: 'Smart Academic Records',
            subtitle: 'Comprehensive Student Profiles',
            description: 'Centralized system maintains detailed academic histories with AI-powered analysis to identify strengths, predict risks, and optimize learning outcomes.',
            features: [
                'Automated transcript generation',
                'Dropout risk prediction',
                'Performance trend analysis'
            ],
            color: 'linear-gradient(135deg, #10b981, #059669)'
        },
        {
            icon: '💼',
            title: 'Career Guidance',
            subtitle: 'AI-Driven Job Matching',
            description: 'Connect your skills with market opportunities through NLP-powered job matching, resume analysis, and personalized career path recommendations.',
            features: [
                'Resume optimization with AI',
                'Job-skill matching algorithms',
                '24/7 career chatbot advisor'
            ],
            color: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        {
            icon: '🤖',
            title: 'Intelligent Automation',
            subtitle: 'Streamlined Education Management',
            description: 'OCR-enabled grading, automated essay scoring, and voice recognition systems reduce manual workload while ensuring consistent, unbiased evaluations.',
            features: [
                'Automated grading systems',
                'Essay scoring with NLP',
                'Voice-to-text accessibility'
            ],
            color: 'linear-gradient(135deg, #ec4899, #be185d)'
        }
    ]

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1)
        } else {
            onComplete()
        }
    }

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1)
        }
    }

    const skipOnboarding = () => {
        onComplete()
    }

    const slide = slides[currentSlide]

    return (
        <div style={{
            minHeight: '100vh',
            background: slide.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif',
            position: 'relative'
        }}>
            {/* Skip Button */}
            <button
                onClick={skipOnboarding}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    backdropFilter: 'blur(10px)'
                }}
            >
                Skip
            </button>

            <div style={{
                maxWidth: '900px',
                width: '100%',
                textAlign: 'center'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{opacity: 0, y: 50}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -50}}
                        transition={{duration: 0.5, ease: "easeOut"}}
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            padding: '4rem 3rem',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                            color: '#1e293b'
                        }}
                    >
                        <motion.div
                            initial={{scale: 0.5}}
                            animate={{scale: 1}}
                            transition={{delay: 0.2, duration: 0.3}}
                            style={{
                                fontSize: '6rem',
                                margin: '0 auto 2rem auto',
                                width: '120px',
                                height: '120px',
                                background: slide.color,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                            }}
                        >
                            {slide.icon}
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{delay: 0.4, duration: 0.5}}
                        >
                            <h1 style={{
                                fontSize: '3rem',
                                fontWeight: 700,
                                marginBottom: '0.5rem',
                                background: slide.color,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {slide.title}
                            </h1>

                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 500,
                                color: '#64748b',
                                marginBottom: '2rem'
                            }}>
                                {slide.subtitle}
                            </h2>

                            <p style={{
                                fontSize: '1.2rem',
                                color: '#475569',
                                marginBottom: '3rem',
                                lineHeight: 1.7,
                                maxWidth: '600px',
                                margin: '0 auto 3rem auto'
                            }}>
                                {slide.description}
                            </p>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1rem',
                                marginBottom: '3rem'
                            }}>
                                {slide.features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.6 + index * 0.1, duration: 0.3}}
                                        style={{
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            borderLeft: '4px solid #6366f1'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#1e293b',
                                            fontWeight: 500
                                        }}>
                                            <span style={{color: '#6366f1'}}>✓</span>
                                            {feature}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2rem'
                }}>
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: currentSlide === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                            color: currentSlide === 0 ? 'rgba(255,255,255,0.5)' : '#1e293b',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: '16px',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s'
                        }}
                    >
                        ← Previous
                    </button>

                    {/* Slide Indicators */}
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                style={{
                                    width: index === currentSlide ? '32px' : '12px',
                                    height: '12px',
                                    borderRadius: '6px',
                                    backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: index === currentSlide ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextSlide}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#1e293b',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '16px',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        {currentSlide === slides.length - 1 ? 'Get Started →' : 'Next →'}
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{
                    marginTop: '2rem',
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${((currentSlide + 1) / slides.length) * 100}%`,
                        height: '100%',
                        backgroundColor: 'white',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease'
                    }}/>
                </div>
            </div>
        </div>
    )
}

export default OnboardingScreen