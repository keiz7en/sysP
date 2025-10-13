import React, {useState} from 'react'
import {motion} from 'framer-motion'

const CareerGuidance: React.FC = () => {
    const [activeTab, setActiveTab] = useState('opportunities')

    const jobRecommendations = [
        {
            title: 'Software Developer',
            company: 'TechCorp Inc.',
            match: 95,
            salary: '$75,000 - $95,000',
            location: 'Remote',
            description: 'Join our team building cutting-edge web applications',
            skills: ['React', 'TypeScript', 'Node.js']
        },
        {
            title: 'Data Scientist',
            company: 'DataFlow Solutions',
            match: 88,
            salary: '$80,000 - $110,000',
            location: 'New York, NY',
            description: 'Analyze complex datasets to drive business decisions',
            skills: ['Python', 'Machine Learning', 'SQL']
        },
        {
            title: 'UX Designer',
            company: 'Design Studio',
            match: 82,
            salary: '$65,000 - $85,000',
            location: 'San Francisco, CA',
            description: 'Create intuitive user experiences for mobile apps',
            skills: ['Figma', 'User Research', 'Prototyping']
        }
    ]

    const skillAssessments = [
        {skill: 'Programming', level: 85, recommendation: 'Strong foundation, practice advanced algorithms'},
        {skill: 'Communication', level: 72, recommendation: 'Good skills, work on public speaking'},
        {skill: 'Problem Solving', level: 90, recommendation: 'Excellent analytical thinking'},
        {skill: 'Leadership', level: 65, recommendation: 'Join group projects to build experience'}
    ]

    const careerPaths = [
        {
            title: 'Software Engineering',
            timeline: '2-4 years',
            steps: ['Learn Programming', 'Build Projects', 'Internship', 'Junior Developer', 'Senior Developer'],
            icon: '💻'
        },
        {
            title: 'Data Science',
            timeline: '3-5 years',
            steps: ['Statistics & Math', 'Python/R', 'Machine Learning', 'Data Analyst', 'Data Scientist'],
            icon: '📊'
        },
        {
            title: 'Product Management',
            timeline: '4-6 years',
            steps: ['Business Basics', 'Tech Understanding', 'Project Management', 'Product Analyst', 'Product Manager'],
            icon: '🚀'
        }
    ]

    const getMatchColor = (match: number) => {
        if (match >= 90) return '#10b981'
        if (match >= 80) return '#f59e0b'
        return '#6b7280'
    }

    return (
        <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    💼 Career Guidance
                </h1>
                <p style={{color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem'}}>
                    AI-powered career recommendations, skill assessments, and personalized career paths
                </p>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '2rem',
                    maxWidth: '600px'
                }}>
                    {[
                        {id: 'opportunities', label: '🎯 Job Opportunities'},
                        {id: 'skills', label: '📈 Skill Assessment'},
                        {id: 'paths', label: '🗺️ Career Paths'}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                fontSize: '0.9rem'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                >
                    {activeTab === 'opportunities' && (
                        <div style={{display: 'grid', gap: '1.5rem'}}>
                            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                Recommended Job Opportunities
                            </h2>
                            {jobRecommendations.map((job, index) => (
                                <motion.div
                                    key={index}
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: index * 0.1}}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem'
                                    }}>
                                        <div>
                                            <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.3rem'}}>{job.title}</h3>
                                            <p style={{
                                                margin: '0 0 0.5rem 0',
                                                color: '#6b7280',
                                                fontWeight: '600'
                                            }}>{job.company}</p>
                                            <p style={{
                                                margin: '0 0 0.5rem 0',
                                                color: '#10b981',
                                                fontWeight: '600'
                                            }}>{job.salary}</p>
                                            <p style={{margin: 0, color: '#6b7280'}}>{job.location}</p>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            backgroundColor: `${getMatchColor(job.match)}20`,
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px'
                                        }}>
                                            <span style={{fontWeight: '700', color: getMatchColor(job.match)}}>
                                                {job.match}% Match
                                            </span>
                                        </div>
                                    </div>

                                    <p style={{color: '#4b5563', marginBottom: '1rem', lineHeight: 1.6}}>
                                        {job.description}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap',
                                        marginBottom: '1rem'
                                    }}>
                                        {job.skills.map((skill, skillIndex) => (
                                            <span
                                                key={skillIndex}
                                                style={{
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <button style={{
                                        backgroundColor: '#6366f1',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}>
                                        Learn More
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div>
                            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                Skill Assessment Results
                            </h2>
                            <div style={{display: 'grid', gap: '1rem'}}>
                                {skillAssessments.map((skill, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: index * 0.1}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem'
                                        }}>
                                            <h3 style={{margin: 0, fontSize: '1.1rem'}}>{skill.skill}</h3>
                                            <span style={{fontWeight: '700', color: '#6366f1', fontSize: '1.1rem'}}>
                                                {skill.level}%
                                            </span>
                                        </div>

                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginBottom: '1rem'
                                        }}>
                                            <motion.div
                                                initial={{width: 0}}
                                                animate={{width: `${skill.level}%`}}
                                                transition={{duration: 1, delay: index * 0.2}}
                                                style={{
                                                    height: '100%',
                                                    backgroundColor: '#6366f1',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>

                                        <p style={{color: '#6b7280', margin: 0, fontSize: '0.9rem'}}>
                                            💡 {skill.recommendation}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'paths' && (
                        <div>
                            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                Recommended Career Paths
                            </h2>
                            <div style={{display: 'grid', gap: '1.5rem'}}>
                                {careerPaths.map((path, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.1}}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '16px',
                                            padding: '2rem',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <span style={{fontSize: '2.5rem'}}>{path.icon}</span>
                                            <div>
                                                <h3 style={{
                                                    margin: '0 0 0.25rem 0',
                                                    fontSize: '1.3rem'
                                                }}>{path.title}</h3>
                                                <p style={{margin: 0, color: '#6b7280'}}>Timeline: {path.timeline}</p>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            {path.steps.map((step, stepIndex) => (
                                                <React.Fragment key={stepIndex}>
                                                    <div style={{
                                                        backgroundColor: '#f3f4f6',
                                                        color: '#374151',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {step}
                                                    </div>
                                                    {stepIndex < path.steps.length - 1 && (
                                                        <span style={{color: '#6b7280'}}>→</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}

export default CareerGuidance
