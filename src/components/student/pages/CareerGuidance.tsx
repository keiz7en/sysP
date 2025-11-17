import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'

// Career data interfaces
interface LearningResource {
    title: string
    type: 'video' | 'course' | 'article' | 'tutorial'
    provider: string
    url: string
    duration?: string
    rating?: number
    free: boolean
    description?: string
    ai_generated?: boolean
}

interface CareerRecommendation {
    title: string
    match_percentage: number
    salary_range: { min: number; max: number } | string
    job_growth: string
    required_skills: string[]
    student_skill_match: string[]
    missing_skills: string[]
    preparation_timeline: string
    industry_sectors: string[]
    learning_resources?: LearningResource[]
    relevant_courses?: string[]
}

interface SkillGap {
    skill: string
    demand_level: string
    growth_rate: string
    average_salary_boost: string
    student_proficiency: number
    gap_severity: string
    learning_resources?: LearningResource[]
}

interface TrainingProgram {
    title: string
    provider: string
    duration: string
    format: string
    cost: string
    difficulty: string
    certification: boolean
    job_placement_rate: string
    rating: number
    skills_covered: string[]
    career_outcomes: string[]
}

interface MarketInsight {
    skill: string
    growth_rate: string
    job_postings: number
    average_salary: string
    trend: string
}

const CareerGuidance: React.FC = () => {
    const {token} = useAuth()
    const [activeTab, setActiveTab] = useState('recommendations')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Data states
    const [careerRecommendations, setCareerRecommendations] = useState<CareerRecommendation[]>([])
    const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
    const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([])
    const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([])
    const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null)

    // Generate learning resources for a career using Gemini AI
    const generateLearningResources = async (careerTitle: string, skills: string[]): Promise<LearningResource[]> => {
        if (!token) return generateFallbackResources(careerTitle, skills)

        try {
            const response = await fetch('http://localhost:8000/api/students/ai/chatbot/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `You are a career guidance AI. For someone pursuing a career as "${careerTitle}", recommend EXACTLY 5 high-quality learning resources.

For each resource, provide:
1. A SPECIFIC course/video/article title (not generic)
2. The type: video, course, article, or tutorial
3. The actual provider name (YouTube channel, Coursera, Udemy, freeCodeCamp, etc.)
4. A real, working URL (specific course/video link, not just search page)
5. Estimated duration
6. Whether it's free or paid
7. A brief description (one sentence)

Focus on these skills: ${skills.join(', ')}

Return ONLY a valid JSON array in this exact format, nothing else:
[
  {
    "title": "Specific Course Name",
    "type": "course",
    "provider": "Coursera",
    "url": "https://www.coursera.org/learn/actual-course-name",
    "duration": "4 weeks",
    "rating": 4.7,
    "free": false,
    "description": "Brief description"
  }
]

Make sure URLs are real and specific, not search pages. Provide actual course/video names.`,
                    context: 'Career learning resource recommendation - must return valid JSON'
                })
            })

            if (!response.ok) {
                console.warn('AI API failed, using fallback resources')
                return generateFallbackResources(careerTitle, skills)
            }

            const data = await response.json()

            // Try to extract JSON array from AI response
            if (data.response) {
                try {
                    // Remove any markdown code blocks
                    let jsonText = data.response.trim()
                    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

                    // Find JSON array
                    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
                    if (jsonMatch) {
                        const resources = JSON.parse(jsonMatch[0])

                        // Validate the resources
                        if (Array.isArray(resources) && resources.length > 0) {
                            const validResources = resources.filter(r =>
                                r.title && r.type && r.provider && r.url &&
                                ['video', 'course', 'article', 'tutorial'].includes(r.type)
                            ).map(r => ({
                                title: r.title,
                                type: r.type,
                                provider: r.provider,
                                url: r.url,
                                duration: r.duration || 'Self-paced',
                                rating: r.rating || undefined,
                                free: typeof r.free === 'boolean' ? r.free : true,
                                description: r.description
                            }))

                            if (validResources.length > 0) {
                                console.log('✅ Gemini AI generated', validResources.length, 'resources for', careerTitle)
                                return validResources
                            }
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse AI response:', parseError)
                    console.log('AI Response:', data.response.substring(0, 500))
                }
            }

            console.warn('AI did not return valid resources, using fallback')
            return generateFallbackResources(careerTitle, skills)

        } catch (error) {
            console.error('Error calling AI for learning resources:', error)
            return generateFallbackResources(careerTitle, skills)
        }
    }

    // Fallback learning resources based on career - improved with better URLs
    const generateFallbackResources = (careerTitle: string, skills: string[]): LearningResource[] => {
        const encodedCareer = encodeURIComponent(careerTitle)
        const primarySkill = skills[0] || careerTitle
        const encodedSkill = encodeURIComponent(primarySkill)

        return [
            {
                title: `${careerTitle} Professional Certificate`,
                type: 'course',
                provider: 'Coursera',
                url: `https://www.coursera.org/search?query=${encodedCareer}`,
                duration: '3-6 months',
                rating: 4.7,
                free: false,
                description: 'Professional certification program',
                ai_generated: false
            },
            {
                title: `${primarySkill} Full Course - 2024`,
                type: 'video',
                provider: 'YouTube',
                url: `https://www.youtube.com/results?search_query=${encodedSkill}+full+course+2024`,
                duration: '3-5 hours',
                free: true,
                description: 'Complete tutorial on YouTube',
                ai_generated: false
            },
            {
                title: `${careerTitle} Bootcamp`,
                type: 'course',
                provider: 'Udemy',
                url: `https://www.udemy.com/courses/search/?q=${encodedCareer}`,
                duration: 'Self-paced',
                rating: 4.5,
                free: false,
                description: 'Comprehensive hands-on bootcamp',
                ai_generated: false
            },
            {
                title: `${primarySkill} Interactive Tutorial`,
                type: 'tutorial',
                provider: 'freeCodeCamp',
                url: `https://www.freecodecamp.org/news/search?query=${encodedSkill}`,
                duration: '2-4 hours',
                free: true,
                description: 'Step-by-step interactive learning',
                ai_generated: false
            },
            {
                title: `${careerTitle} Career Guide 2024`,
                type: 'article',
                provider: 'Medium',
                url: `https://medium.com/search?q=${encodedCareer}+guide`,
                free: true,
                description: 'Comprehensive career roadmap article',
                ai_generated: false
            }
        ]
    }

    // Fetch career recommendations
    const fetchCareerRecommendations = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:8000/api/students/ai/career-guidance/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({interests: 'General'})
            })

            if (!response.ok) throw new Error('Failed to fetch career recommendations')
            const data = await response.json()

            // Parse the response to match our interface
            const careers = data.guidance?.recommended_careers || []

            // Generate learning resources for each career
            const careersWithResources = await Promise.all(
                careers.map(async (career: CareerRecommendation) => {
                    const resources = await generateLearningResources(career.title, career.missing_skills)
                    return {...career, learning_resources: resources}
                })
            )

            setCareerRecommendations(careersWithResources)
        } catch (err: any) {
            setError(err.message)
            console.error('Error fetching career recommendations:', err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch skill gap analysis
    const fetchSkillGaps = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:8000/api/career/skill-gap-analysis/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                // If this endpoint doesn't exist, provide mock data for now
                console.warn('Skill gap endpoint not available, using sample data')
                const mockSkills = [
                    {
                        skill: 'Python Programming',
                        demand_level: 'Very High',
                        growth_rate: '+25%',
                        average_salary_boost: '$15,000',
                        student_proficiency: 0,
                        gap_severity: 'critical'
                    },
                    {
                        skill: 'Machine Learning',
                        demand_level: 'High',
                        growth_rate: '+30%',
                        average_salary_boost: '$20,000',
                        student_proficiency: 0,
                        gap_severity: 'high'
                    },
                    {
                        skill: 'Cloud Computing (AWS/Azure)',
                        demand_level: 'Very High',
                        growth_rate: '+35%',
                        average_salary_boost: '$18,000',
                        student_proficiency: 0,
                        gap_severity: 'high'
                    }
                ]

                // Generate learning resources for each skill
                const skillsWithResources = await Promise.all(
                    mockSkills.map(async (skill) => {
                        const resources = await Promise.resolve(generateFallbackResources(skill.skill, [skill.skill]))
                        return {...skill, learning_resources: resources.slice(0, 3)}
                    })
                )

                setSkillGaps(skillsWithResources)
                setLoading(false)
                return
            }
            const data = await response.json()
            const skills = data.market_demand_skills || []

            // Generate learning resources for each skill
            const skillsWithResources = await Promise.all(
                skills.map(async (skill: SkillGap) => {
                    const resources = await Promise.resolve(generateFallbackResources(skill.skill, [skill.skill]))
                    return {...skill, learning_resources: resources.slice(0, 3)}
                })
            )

            setSkillGaps(skillsWithResources)
        } catch (err: any) {
            console.error('Error fetching skill gaps:', err)
            // Provide fallback data
            const fallbackSkillResources = await Promise.resolve(generateFallbackResources('Python Programming', ['Python Programming']))
            const fallbackSkill = {
                skill: 'Python Programming',
                demand_level: 'Very High',
                growth_rate: '+25%',
                average_salary_boost: '$15,000',
                student_proficiency: 0,
                gap_severity: 'critical',
                learning_resources: fallbackSkillResources.slice(0, 3)
            }
            setSkillGaps([fallbackSkill])
        } finally {
            setLoading(false)
        }
    }

    // Fetch training programs
    const fetchTrainingPrograms = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:8000/api/career/training-resources/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                // If this endpoint doesn't exist, provide mock data
                console.warn('Training programs endpoint not available, using sample data')
                setTrainingPrograms([
                    {
                        title: 'Complete Python Developer Bootcamp',
                        provider: 'TechEdu Academy',
                        duration: '12 weeks',
                        format: 'Online + Live Sessions',
                        cost: '$1,499',
                        difficulty: 'Beginner to Advanced',
                        certification: true,
                        job_placement_rate: '85%',
                        rating: 4.8,
                        skills_covered: ['Python', 'Web Development', 'Data Analysis', 'APIs'],
                        career_outcomes: ['Python Developer', 'Backend Engineer', 'Data Analyst']
                    },
                    {
                        title: 'Machine Learning Engineer Track',
                        provider: 'AI Learning Institute',
                        duration: '16 weeks',
                        format: 'Self-paced Online',
                        cost: '$2,299',
                        difficulty: 'Intermediate to Advanced',
                        certification: true,
                        job_placement_rate: '78%',
                        rating: 4.9,
                        skills_covered: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'Python'],
                        career_outcomes: ['ML Engineer', 'Data Scientist', 'AI Researcher']
                    }
                ])
                setLoading(false)
                return
            }
            const data = await response.json()
            setTrainingPrograms(data.recommended_programs || [])
        } catch (err: any) {
            console.error('Error fetching training programs:', err)
            setTrainingPrograms([])
        } finally {
            setLoading(false)
        }
    }

    // Fetch market insights
    const fetchMarketInsights = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:8000/api/career/market-insights/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                // If this endpoint doesn't exist, provide mock data
                console.warn('Market insights endpoint not available, using sample data')
                setMarketInsights([
                    {
                        skill: 'Artificial Intelligence',
                        growth_rate: '+45%',
                        job_postings: 12500,
                        average_salary: '$95,000',
                        trend: 'increasing'
                    },
                    {
                        skill: 'Cloud Computing',
                        growth_rate: '+38%',
                        job_postings: 18900,
                        average_salary: '$88,000',
                        trend: 'increasing'
                    },
                    {
                        skill: 'Data Science',
                        growth_rate: '+28%',
                        job_postings: 15600,
                        average_salary: '$92,000',
                        trend: 'stable'
                    }
                ])
                setLoading(false)
                return
            }
            const data = await response.json()
            setMarketInsights(data.trending_skills || [])
        } catch (err: any) {
            console.error('Error fetching market insights:', err)
            setMarketInsights([])
        } finally {
            setLoading(false)
        }
    }

    // Load data based on active tab
    useEffect(() => {
        if (!token) return

        switch (activeTab) {
            case 'recommendations':
                if (careerRecommendations.length === 0) fetchCareerRecommendations()
                break
            case 'skills':
                if (skillGaps.length === 0) fetchSkillGaps()
                break
            case 'training':
                if (trainingPrograms.length === 0) fetchTrainingPrograms()
                break
            case 'market':
                if (marketInsights.length === 0) fetchMarketInsights()
                break
        }
    }, [activeTab, token])

    const getMatchColor = (match: number) => {
        if (match >= 90) return '#10b981'
        if (match >= 80) return '#f59e0b'
        if (match >= 70) return '#3b82f6'
        return '#6b7280'
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return '#ef4444'
            case 'high':
                return '#f59e0b'
            case 'medium':
                return '#3b82f6'
            case 'low':
                return '#10b981'
            default:
                return '#6b7280'
        }
    }

    // Function to generate job search URLs
    const getJobSearchUrls = (careerTitle: string) => {
        const encodedTitle = encodeURIComponent(careerTitle)
        return {
            linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}`,
            indeed: `https://www.indeed.com/jobs?q=${encodedTitle}`,
            glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedTitle}`,
            monster: `https://www.monster.com/jobs/search?q=${encodedTitle}`,
            ziprecruiter: `https://www.ziprecruiter.com/jobs-search?search=${encodedTitle}`,
            dice: `https://www.dice.com/jobs?q=${encodedTitle}`, // Tech-focused
            cyberseek: `https://www.cyberseek.org/`, // For cybersecurity careers
            usajobs: `https://www.usajobs.gov/Search/Results?k=${encodedTitle}` // Government jobs
        }
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
                    💼 AI Career Guidance
                </h1>
                <p style={{color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem'}}>
                    Get personalized career recommendations, skill gap analysis, training programs, and market insights
                </p>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '4px'
                }}>
                    {[
                        {id: 'recommendations', label: '🎯 Recommended Careers'},
                        {id: 'skills', label: '📈 Skill Gap Analysis'},
                        {id: 'training', label: '📚 Training Programs'},
                        {id: 'market', label: '📊 Market Insights'}
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                minWidth: '200px',
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

                {/* Error Display */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div style={{textAlign: 'center', padding: '3rem'}}>
                        <div style={{
                            display: 'inline-block',
                            width: '50px',
                            height: '50px',
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #6366f1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}/>
                        <p style={{marginTop: '1rem', color: '#6b7280'}}>Loading career data...</p>
                    </div>
                )}

                {/* Tab Content */}
                {!loading && (
                    <motion.div
                        key={activeTab}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                    >
                        {/* Career Recommendations Tab */}
                        {activeTab === 'recommendations' && (
                            <div style={{display: 'grid', gap: '1.5rem'}}>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                    🎯 Recommended Careers
                                </h2>
                                {careerRecommendations.length === 0 ? (
                                    <p style={{color: '#6b7280', textAlign: 'center', padding: '2rem'}}>
                                        No career recommendations available yet. Complete more courses to get
                                        personalized
                                        recommendations.
                                    </p>
                                ) : (
                                    careerRecommendations.map((career, index) => (
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
                                                marginBottom: '1.5rem'
                                            }}>
                                                <div>
                                                    <h3 style={{
                                                        margin: '0 0 0.5rem 0',
                                                        fontSize: '1.5rem',
                                                        color: '#1f2937'
                                                    }}>{career.title}</h3>
                                                    <p style={{
                                                        margin: '0 0 0.5rem 0',
                                                        color: '#10b981',
                                                        fontWeight: '700',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        💰 {typeof career.salary_range === 'string'
                                                        ? career.salary_range
                                                        : career.salary_range && career.salary_range.min && career.salary_range.max
                                                            ? `${career.salary_range.min.toLocaleString()} - ${career.salary_range.max.toLocaleString()}`
                                                            : 'Salary info not available'}
                                                    </p>
                                                    <p style={{margin: 0, color: '#6b7280', fontSize: '0.95rem'}}>
                                                        📈 Growth: {career.job_growth}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    backgroundColor: `${getMatchColor(career.match_percentage)}20`,
                                                    padding: '0.75rem 1.25rem',
                                                    borderRadius: '25px'
                                                }}>
                                                    <span style={{
                                                        fontWeight: '700',
                                                        color: getMatchColor(career.match_percentage),
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        {career.match_percentage}% Match
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Required Skills */}
                                            <div style={{marginBottom: '1rem'}}>
                                                <h4 style={{
                                                    fontSize: '0.9rem',
                                                    color: '#6b7280',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600'
                                                }}>Required Skills:</h4>
                                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                                    {(career.required_skills || []).map((skill, skillIndex) => {
                                                        const hasSkill = (career.student_skill_match || []).includes(skill)
                                                        return (
                                                            <span
                                                                key={skillIndex}
                                                                style={{
                                                                    backgroundColor: hasSkill ? '#d1fae5' : '#fee2e2',
                                                                    color: hasSkill ? '#065f46' : '#991b1b',
                                                                    padding: '0.4rem 0.8rem',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '600',
                                                                    border: `1px solid ${hasSkill ? '#a7f3d0' : '#fecaca'}`
                                                                }}
                                                            >
                                                                {hasSkill ? '✓' : '✗'} {skill}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* Industry Sectors */}
                                            <div style={{marginBottom: '1.5rem'}}>
                                                <h4 style={{
                                                    fontSize: '0.9rem',
                                                    color: '#6b7280',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600'
                                                }}>Industry Sectors:</h4>
                                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                                    {(career.industry_sectors || []).map((sector, idx) => (
                                                        <span
                                                            key={idx}
                                                            style={{
                                                                backgroundColor: '#ede9fe',
                                                                color: '#5b21b6',
                                                                padding: '0.3rem 0.7rem',
                                                                borderRadius: '10px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            {sector}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Preparation Timeline */}
                                            <p style={{
                                                color: '#4b5563',
                                                marginBottom: '1.5rem',
                                                fontSize: '0.95rem',
                                                padding: '0.75rem',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '8px',
                                                borderLeft: '4px solid #6366f1'
                                            }}>
                                                ⏱️ <strong>Preparation Timeline:</strong> {career.preparation_timeline}
                                            </p>

                                            {/* Relevant Courses */}
                                            {career.relevant_courses && career.relevant_courses.length > 0 && (
                                                <div style={{
                                                    marginBottom: '1rem'
                                                }}>
                                                    <h4 style={{
                                                        fontSize: '0.95rem',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: '600'
                                                    }}>✅ Relevant Courses You've Taken:</h4>
                                                    <div style={{display: 'flex', gap: '0.6rem', flexWrap: 'wrap'}}>
                                                        {(career.relevant_courses || []).map((course, rcidx) => (
                                                            <span key={rcidx}
                                                                  style={{
                                                                      backgroundColor: '#cffafe',
                                                                      color: '#075985',
                                                                      padding: '0.4rem 0.8rem',
                                                                      borderRadius: '10px',
                                                                      fontSize: '0.85rem',
                                                                      fontWeight: '600'
                                                                  }}>
                                                                {course}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Gemini AI generated learning resources */}
                                            {career.learning_resources && career.learning_resources.length > 0 && (
                                                <div style={{marginBottom: '1.5rem'}}>
                                                    <h4 style={{
                                                        fontSize: '0.95rem',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: '600'
                                                    }}>📚 Recommended Learning Resources (Gemini AI):</h4>
                                                    <div style={{
                                                        display: 'grid',
                                                        gap: '0.7rem',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
                                                    }}>
                                                        {career.learning_resources.map((res, lridx) => (
                                                            <a
                                                                key={lridx}
                                                                href={res.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    backgroundColor: '#f3f4f6',
                                                                    padding: '0.9rem',
                                                                    borderRadius: '10px',
                                                                    textDecoration: 'none',
                                                                    color: '#22223b',
                                                                    transition: 'background 0.2s, box-shadow 0.2s',
                                                                    boxShadow: '0 2px 4px rgba(99,102,241,0.04)',
                                                                    border: '1px solid #e5e7eb',
                                                                    display: 'block'
                                                                }}
                                                                onMouseEnter={e => {
                                                                    e.currentTarget.style.backgroundColor = '#e0e7ff'
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.13)'
                                                                }}
                                                                onMouseLeave={e => {
                                                                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(99,102,241,0.05)'
                                                                }}
                                                            >
                                                                <div style={{
                                                                    fontWeight: 700,
                                                                    fontSize: '1.01rem',
                                                                    marginBottom: '0.25rem'
                                                                }}>
                                                                    {res.title}
                                                                </div>
                                                                <div style={{fontSize: '0.87rem', color: '#64748b'}}>
                                                                    {res.type === 'course' && '🧑‍🏫 Course '}
                                                                    {res.type === 'video' && '🎬 Video '}
                                                                    {res.type === 'article' && '📑 Article '}
                                                                    {res.type === 'tutorial' && '🔍 Tutorial '}
                                                                    {res.provider && `· ${res.provider} `}
                                                                    {res.duration && `· ${res.duration} `}
                                                                    {typeof res.free === 'boolean' && (res.free
                                                                            ? '· Free'
                                                                            : '· Paid'
                                                                    )}
                                                                </div>
                                                                {res.rating && (<div style={{
                                                                    marginTop: '0.25rem',
                                                                    fontSize: '0.93rem',
                                                                    color: '#f59e0b',
                                                                    fontWeight: 600
                                                                }}>⭐ {res.rating}</div>)}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setSelectedCareer(career)}
                                                style={{
                                                    backgroundColor: '#6366f1',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.875rem 1.75rem',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '1rem',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
                                                    marginRight: '0.6rem'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#4f46e5'
                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.4)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#6366f1'
                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.3)'
                                                }}
                                            >
                                                🚀 Explore Career Path
                                            </button>
                                            <a
                                                href={getJobSearchUrls(career.title).linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#0077b5',
                                                    color: 'white',
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '10px',
                                                    fontWeight: '600',
                                                    fontSize: '1rem',
                                                    textDecoration: 'none',
                                                    transition: 'background-color 0.2s, transform 0.2s',
                                                    boxShadow: '0 2px 4px rgba(0, 119, 181, 0.3)'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.backgroundColor = '#005983'
                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 119, 181, 0.4)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = '#0077b5'
                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 119, 181, 0.3)'
                                                }}
                                            >
                                                🔎 Find Jobs
                                            </a>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Skill Gap Analysis Tab */}
                        {activeTab === 'skills' && (
                            <div>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                    📈 Skill Gap Analysis
                                </h2>
                                <div style={{display: 'grid', gap: '1rem'}}>
                                    {skillGaps.length === 0 ? (
                                        <p style={{color: '#6b7280', textAlign: 'center', padding: '2rem'}}>
                                            No skill gap data available.
                                        </p>
                                    ) : (
                                        skillGaps.map((skill, index) => (
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
                                                    border: '1px solid #e5e7eb',
                                                    borderLeft: `4px solid ${getSeverityColor(skill.gap_severity)}`
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '1rem'
                                                }}>
                                                    <div>
                                                        <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem'}}>
                                                            {skill.skill}
                                                        </h3>
                                                        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                                                            <span style={{
                                                                color: '#6b7280',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                📊 Demand: <strong>{skill.demand_level}</strong>
                                                            </span>
                                                            <span style={{
                                                                color: '#6b7280',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                📈 Growth: <strong>{skill.growth_rate}</strong>
                                                            </span>
                                                            <span style={{
                                                                color: '#10b981',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                💰 Salary Boost: <strong>{skill.average_salary_boost}</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        backgroundColor: `${getSeverityColor(skill.gap_severity)}20`,
                                                        color: getSeverityColor(skill.gap_severity),
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {skill.gap_severity}
                                                    </span>
                                                </div>

                                                <div style={{marginBottom: '0.5rem'}}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            color: '#6b7280'
                                                        }}>Your Proficiency</span>
                                                        <span style={{
                                                            fontWeight: '700',
                                                            color: '#6366f1'
                                                        }}>{skill.student_proficiency}%</span>
                                                    </div>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '10px',
                                                        backgroundColor: '#e5e7eb',
                                                        borderRadius: '5px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <motion.div
                                                            initial={{width: 0}}
                                                            animate={{width: `${skill.student_proficiency}%`}}
                                                            transition={{duration: 1, delay: index * 0.2}}
                                                            style={{
                                                                height: '100%',
                                                                backgroundColor: getSeverityColor(skill.gap_severity),
                                                                borderRadius: '5px'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Learning resources for this skill */}
                                                {skill.learning_resources && skill.learning_resources.length > 0 && (
                                                    <div style={{marginTop: '1rem'}}>
                                                        <h4 style={{
                                                            fontSize: '0.85rem',
                                                            color: '#6b7280',
                                                            marginBottom: '0.5rem',
                                                            fontWeight: '600'
                                                        }}>📚 Learn This Skill:</h4>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.5rem'
                                                        }}>
                                                            {skill.learning_resources.map((res: LearningResource, resIdx: number) => (
                                                                <a
                                                                    key={resIdx}
                                                                    href={res.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        backgroundColor: '#f9fafb',
                                                                        padding: '0.75rem',
                                                                        borderRadius: '8px',
                                                                        textDecoration: 'none',
                                                                        color: '#1f2937',
                                                                        fontSize: '0.85rem',
                                                                        border: '1px solid #e5e7eb',
                                                                        transition: 'all 0.2s',
                                                                        display: 'block'
                                                                    }}
                                                                    onMouseEnter={e => {
                                                                        e.currentTarget.style.backgroundColor = '#e0e7ff'
                                                                        e.currentTarget.style.borderColor = '#6366f1'
                                                                    }}
                                                                    onMouseLeave={e => {
                                                                        e.currentTarget.style.backgroundColor = '#f9fafb'
                                                                        e.currentTarget.style.borderColor = '#e5e7eb'
                                                                    }}
                                                                >
                                                                    <div style={{
                                                                        fontWeight: '600',
                                                                        marginBottom: '0.25rem'
                                                                    }}>
                                                                        {res.type === 'video' && '🎥 '}
                                                                        {res.type === 'course' && '🎓 '}
                                                                        {res.type === 'article' && '📄 '}
                                                                        {res.type === 'tutorial' && '💻 '}
                                                                        {res.title}
                                                                    </div>
                                                                    <div style={{color: '#6b7280', fontSize: '0.8rem'}}>
                                                                        {res.provider} {res.duration && `· ${res.duration}`} {res.free && '· Free'}
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Training Programs Tab */}
                        {activeTab === 'training' && (
                            <div>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                    📚 Recommended Training Programs
                                </h2>
                                <div style={{display: 'grid', gap: '1.5rem'}}>
                                    {trainingPrograms.length === 0 ? (
                                        <p style={{color: '#6b7280', textAlign: 'center', padding: '2rem'}}>
                                            No training programs available.
                                        </p>
                                    ) : (
                                        trainingPrograms.map((program, index) => (
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
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '1rem'
                                                }}>
                                                    <div style={{flex: 1}}>
                                                        <h3 style={{
                                                            margin: '0 0 0.5rem 0',
                                                            fontSize: '1.3rem',
                                                            color: '#1f2937'
                                                        }}>{program.title}</h3>
                                                        <p style={{
                                                            margin: '0 0 0.5rem 0',
                                                            color: '#6b7280',
                                                            fontWeight: '600'
                                                        }}>by {program.provider}</p>
                                                        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                                                            <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                                ⏱️ {program.duration}
                                                            </span>
                                                            <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                                💻 {program.format}
                                                            </span>
                                                            <span style={{
                                                                color: '#10b981',
                                                                fontWeight: '700',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                💰 {program.cost}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        backgroundColor: '#fef3c7',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '1.5rem',
                                                            fontWeight: '700',
                                                            color: '#92400e'
                                                        }}>⭐ {program.rating}</div>
                                                        <div style={{fontSize: '0.7rem', color: '#78350f'}}>Rating</div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    marginBottom: '1rem',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <span style={{
                                                        backgroundColor: '#dbeafe',
                                                        color: '#1e40af',
                                                        padding: '0.3rem 0.7rem',
                                                        borderRadius: '10px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {program.difficulty}
                                                    </span>
                                                    {program.certification && (
                                                        <span style={{
                                                            backgroundColor: '#d1fae5',
                                                            color: '#065f46',
                                                            padding: '0.3rem 0.7rem',
                                                            borderRadius: '10px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            ✓ Certificate
                                                        </span>
                                                    )}
                                                    <span style={{
                                                        backgroundColor: '#fce7f3',
                                                        color: '#9f1239',
                                                        padding: '0.3rem 0.7rem',
                                                        borderRadius: '10px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {program.job_placement_rate} Placement
                                                    </span>
                                                </div>

                                                {/* Skills Covered */}
                                                <div style={{marginBottom: '1rem'}}>
                                                    <h4 style={{
                                                        fontSize: '0.9rem',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem'
                                                    }}>Skills You'll Learn:</h4>
                                                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                                        {(program.skills_covered || []).map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    backgroundColor: '#f3f4f6',
                                                                    color: '#374151',
                                                                    padding: '0.3rem 0.7rem',
                                                                    borderRadius: '10px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Career Outcomes */}
                                                <div style={{marginBottom: '1.5rem'}}>
                                                    <h4 style={{
                                                        fontSize: '0.9rem',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem'
                                                    }}>Career Outcomes:</h4>
                                                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                                        {(program.career_outcomes || []).map((outcome, idx) => (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    backgroundColor: '#ede9fe',
                                                                    color: '#5b21b6',
                                                                    padding: '0.3rem 0.7rem',
                                                                    borderRadius: '10px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                {outcome}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button style={{
                                                    backgroundColor: '#6366f1',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s',
                                                    fontSize: '0.95rem'
                                                }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#4f46e5'
                                                            e.currentTarget.style.transform = 'translateY(-2px)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#6366f1'
                                                            e.currentTarget.style.transform = 'translateY(0)'
                                                        }}
                                                >
                                                    📝 Learn More & Enroll
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Market Insights Tab */}
                        {activeTab === 'market' && (
                            <div>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
                                    📊 Job Market Insights
                                </h2>
                                <div style={{display: 'grid', gap: '1rem'}}>
                                    {marketInsights.length === 0 ? (
                                        <p style={{color: '#6b7280', textAlign: 'center', padding: '2rem'}}>
                                            No market insights available.
                                        </p>
                                    ) : (
                                        marketInsights.map((insight, index) => (
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
                                                    border: '1px solid #e5e7eb',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{flex: 1}}>
                                                    <h3 style={{
                                                        margin: '0 0 0.5rem 0',
                                                        fontSize: '1.1rem',
                                                        color: '#1f2937'
                                                    }}>
                                                        {insight.skill}
                                                    </h3>
                                                    <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
                                                        <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                            📈 Growth: <strong
                                                            style={{color: '#10b981'}}>{insight.growth_rate}</strong>
                                                        </span>
                                                        <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                            💼 Jobs: <strong>{insight.job_postings.toLocaleString()}</strong>
                                                        </span>
                                                        <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                            💰 Avg Salary: <strong
                                                            style={{color: '#10b981'}}>{insight.average_salary}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    backgroundColor: insight.trend === 'increasing' ? '#d1fae5' : '#fef3c7',
                                                    color: insight.trend === 'increasing' ? '#065f46' : '#92400e',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    fontWeight: '700',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {insight.trend === 'increasing' ? '📈 Trending' : '📊 Stable'}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Career Details Modal */}
            <AnimatePresence>
                {selectedCareer && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={() => setSelectedCareer(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            initial={{scale: 0.9, y: 20}}
                            animate={{scale: 1, y: 0}}
                            exit={{scale: 0.9, y: 20}}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '2.5rem',
                                maxWidth: '700px',
                                maxHeight: '90vh',
                                overflow: 'auto',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '2rem'
                            }}>
                                <div>
                                    <h2 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '2rem',
                                        color: '#1f2937'
                                    }}>{selectedCareer.title}</h2>
                                    <p style={{
                                        margin: '0 0 0.5rem 0',
                                        color: '#10b981',
                                        fontWeight: '700',
                                        fontSize: '1.2rem'
                                    }}>
                                        💰 {typeof selectedCareer.salary_range === 'string'
                                        ? selectedCareer.salary_range
                                        : selectedCareer.salary_range && selectedCareer.salary_range.min && selectedCareer.salary_range.max
                                            ? `${selectedCareer.salary_range.min.toLocaleString()} - ${selectedCareer.salary_range.max.toLocaleString()}`
                                            : 'Salary info not available'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedCareer(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151'
                                }}>📈 Job Growth</h3>
                                <p style={{color: '#6b7280', lineHeight: 1.6}}>{selectedCareer.job_growth}</p>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151'
                                }}>✅ Skills You Have</h3>
                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                    {(selectedCareer.student_skill_match || []).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                backgroundColor: '#d1fae5',
                                                color: '#065f46',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✓ {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151'
                                }}>📚 Skills to Learn</h3>
                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                    {(selectedCareer.missing_skills || []).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                backgroundColor: '#fee2e2',
                                                color: '#991b1b',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Relevant courses for selected career */}
                            {selectedCareer.relevant_courses && selectedCareer.relevant_courses.length > 0 && (
                                <div style={{marginBottom: '1.5rem'}}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        marginBottom: '0.75rem',
                                        color: '#374151'
                                    }}>✅ Your Relevant Courses</h3>
                                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                        {(selectedCareer.relevant_courses || []).map((rcourse, rci) => (
                                            <span key={rci}
                                                  style={{
                                                      backgroundColor: '#cffafe',
                                                      color: '#075985',
                                                      padding: '0.5rem 1.1rem',
                                                      borderRadius: '10px',
                                                      fontSize: '0.97rem',
                                                      fontWeight: '600'
                                                  }}
                                            >
                                                {rcourse}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Gemini AI generated learning resources for selected career */}
                            {selectedCareer.learning_resources && selectedCareer.learning_resources.length > 0 && (
                                <div style={{marginBottom: '1.5rem'}}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        marginBottom: '0.75rem',
                                        color: '#374151'
                                    }}>📚 Gemini AI Learning Resources</h3>
                                    <div style={{
                                        display: 'grid',
                                        gap: '0.7rem',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                                    }}>
                                        {selectedCareer.learning_resources.map((res, lidx) => (
                                            <a
                                                key={lidx}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    backgroundColor: '#f3f4f6',
                                                    padding: '1rem',
                                                    borderRadius: '10px',
                                                    textDecoration: 'none',
                                                    color: '#22223b',
                                                    transition: 'background 0.2s, box-shadow 0.2s',
                                                    boxShadow: '0 2px 4px rgba(99,102,241,0.04)',
                                                    border: '1px solid #e5e7eb',
                                                    display: 'block'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.backgroundColor = '#e0e7ff'
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.13)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(99,102,241,0.05)'
                                                }}
                                            >
                                                <div style={{
                                                    fontWeight: 700,
                                                    fontSize: '1.08rem',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {res.title}
                                                </div>
                                                <div style={{fontSize: '0.94rem', color: '#64748b'}}>
                                                    {res.type === 'course' && '🧑‍🏫 Course '}
                                                    {res.type === 'video' && '🎬 Video '}
                                                    {res.type === 'article' && '📑 Article '}
                                                    {res.type === 'tutorial' && '🔍 Tutorial '}
                                                    {res.provider && `· ${res.provider} `}
                                                    {res.duration && `· ${res.duration} `}
                                                    {typeof res.free === 'boolean' && (res.free
                                                            ? '· Free'
                                                            : '· Paid'
                                                    )}
                                                </div>
                                                {res.rating && (<div style={{
                                                    marginTop: '0.25rem',
                                                    fontSize: '0.97rem',
                                                    color: '#f59e0b',
                                                    fontWeight: 600
                                                }}>⭐ {res.rating}</div>)}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{marginBottom: '1.5rem'}}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151'
                                }}>🏢 Industry Sectors</h3>
                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                    {(selectedCareer.industry_sectors || []).map((sector, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                backgroundColor: '#ede9fe',
                                                color: '#5b21b6',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {sector}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                                borderLeft: '4px solid #6366f1'
                            }}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '0.5rem',
                                    color: '#374151'
                                }}>⏱️ Preparation Timeline</h3>
                                <p style={{
                                    color: '#6b7280',
                                    margin: 0,
                                    fontSize: '1rem'
                                }}>{selectedCareer.preparation_timeline}</p>
                            </div>

                            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                                <button
                                    onClick={() => {
                                        setSelectedCareer(null)
                                        setActiveTab('training')
                                    }}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#6366f1',
                                        color: 'white',
                                        border: 'none',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem'
                                    }}
                                >
                                    📚 View Training Programs
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedCareer(null)
                                        setActiveTab('skills')
                                    }}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem'
                                    }}
                                >
                                    📊 Analyze My Skills
                                </button>
                                {/* Direct links to job boards */}
                                <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap'}}>
                                    {Object.entries(getJobSearchUrls(selectedCareer.title)).map(([site, url]) => (
                                        <a
                                            key={site}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                backgroundColor: site === 'linkedin' ? '#0077b5' : site === 'indeed' ? '#2557a7' :
                                                    site === 'glassdoor' ? '#0caa41' : site === 'monster' ? '#6f2c91' :
                                                        site === 'ziprecruiter' ? '#24b647' : site === 'dice' ? '#e44c2e' :
                                                            site === 'cyberseek' ? '#0d2538' : site === 'usajobs' ? '#09386b' :
                                                                '#374151',
                                                color: 'white',
                                                padding: '0.7rem 1.1rem',
                                                borderRadius: '7px',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                textDecoration: 'none',
                                                transition: 'background-color 0.2s, transform 0.2s',
                                                display: 'inline-block'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = '#333'
                                                e.currentTarget.style.transform = 'translateY(-2px)'
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = site === 'linkedin' ? '#0077b5' : site === 'indeed' ? '#2557a7' :
                                                    site === 'glassdoor' ? '#0caa41' : site === 'monster' ? '#6f2c91' :
                                                        site === 'ziprecruiter' ? '#24b647' : site === 'dice' ? '#e44c2e' :
                                                            site === 'cyberseek' ? '#0d2538' : site === 'usajobs' ? '#09386b' :
                                                                '#374151'
                                                e.currentTarget.style.transform = 'translateY(0)'
                                            }}
                                        >
                                            {site.charAt(0).toUpperCase() + site.slice(1)}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add spinning animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default CareerGuidance
