import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { aiStudentAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import {getCourseByCode} from '../../../data/courseSyllabi';

interface CourseModule {
    id: number;
    title: string;
    description: string;
    order: number;
}

interface EnrolledCourse {
    id: number;
    course_id: number;
    course_title: string;
    subject: string;
    status: string;
    ai_enabled: boolean;
    modules?: CourseModule[];
}

const AILearningAssistant: React.FC = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [loading, setLoading] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);
    const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [syllabusInfo, setSyllabusInfo] = useState<{ aiGenerated: boolean, description: string } | null>(null);

    // State for different AI features
    const [academicAnalysis, setAcademicAnalysis] = useState<any>(null);
    const [personalizedContent, setPersonalizedContent] = useState<any>(null);
    const [aiQuiz, setAiQuiz] = useState<any>(null);
    const [careerGuidance, setCareerGuidance] = useState<any>(null);
    const [essayGrading, setEssayGrading] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [key: number]: string }>({});

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Load enrolled courses on component mount
    useEffect(() => {
        loadEnrolledCourses();
    }, [token]);

    // Load course modules when selectedCourse changes
    useEffect(() => {
        if (selectedCourse) {
            loadCourseModules(selectedCourse.course_id);
        } else {
            setCourseModules([]);
            setSelectedChapter('');
            setSyllabusInfo(null);
        }
    }, [selectedCourse]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const loadEnrolledCourses = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/students/dashboard/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.current_enrollments) {
                    // Only keep enrolled (status=active) courses the user is truly enrolled in
                    const enrolledActive = data.current_enrollments.filter((course: EnrolledCourse) => course.status === 'active');
                    setEnrolledCourses(enrolledActive);
                    if (enrolledActive.length > 0) {
                        setSelectedCourse(enrolledActive[0]);
                    } else {
                        setSelectedCourse(null);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            toast.error('Failed to load your courses');
        } finally {
            setLoading(false);
        }
    };

    // Load course modules for the selected course using standardized syllabi from courseSyllabi.ts
    const loadCourseModules = async (courseId: number) => {
        if (!token) return;

        try {
            // First fetch the course details to get the course code
            const dashResponse = await fetch('http://localhost:8000/api/students/dashboard/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (dashResponse.ok) {
                const dashData = await dashResponse.json();
                const courseEnrollment = dashData.current_enrollments?.find(
                    (enrollment: any) => enrollment.course_id === courseId
                );

                if (courseEnrollment) {
                    const courseCode = courseEnrollment.course_code;
                    const syllabus = getCourseByCode(courseCode);

                    if (syllabus && syllabus.units.length > 0) {
                        // Use standardized syllabus
                        const modulesArray: CourseModule[] = syllabus.units.map((unit, idx) => ({
                            id: idx + 1,
                            title: unit.title,
                            description: unit.topics.join(', '),
                            order: unit.number,
                        }));

                        setCourseModules(modulesArray);
                        setSelectedChapter(modulesArray[0].title);
                        setSyllabusInfo({
                            aiGenerated: false,
                            description: `Standardized ${syllabus.level} level course with ${syllabus.units.length} comprehensive units.`
                        });
                        return;
                    }
                }
            }

            // Fallback to default chapters if no syllabus found
            const fallbackChapters = [
                {id: 1, title: 'Introduction & Fundamentals', description: '', order: 1},
                {id: 2, title: 'Core Concepts', description: '', order: 2},
                {id: 3, title: 'Advanced Topics', description: '', order: 3},
                {id: 4, title: 'Practical Applications', description: '', order: 4},
                {id: 5, title: 'Final Review', description: '', order: 5}
            ];
            setCourseModules(fallbackChapters);
            setSelectedChapter('Introduction & Fundamentals');
            setSyllabusInfo({aiGenerated: false, description: ''});
        } catch (error) {
            console.error('Error loading course syllabus:', error);
            // Set default chapters if API fails
            const fallbackChapters = [
                {id: 1, title: 'Introduction & Fundamentals', description: '', order: 1},
                {id: 2, title: 'Core Concepts', description: '', order: 2},
                {id: 3, title: 'Advanced Topics', description: '', order: 3},
                {id: 4, title: 'Practical Applications', description: '', order: 4},
                {id: 5, title: 'Final Review', description: '', order: 5}
            ];
            setCourseModules(fallbackChapters);
            setSelectedChapter('Introduction & Fundamentals');
            setSyllabusInfo({aiGenerated: false, description: ''});
        }
    };

    const handleAcademicAnalysis = async () => {
        if (!token || !selectedCourse) {
            toast.error('Please select a course first');
            return;
        }
        setLoading(true);
        try {
            const response = await aiStudentAPI.getAcademicAnalysis(token, {
                course_id: selectedCourse.course_id
            });
            setAcademicAnalysis(response.analysis);
            setActiveTab('academic');
        } catch (error: any) {
            toast.error(error.message || 'Failed to analyze academic progress');
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalizedContent = async (chapter: string, difficulty: string) => {
        if (!token || !selectedCourse) {
            toast.error('Please select a course first');
            return;
        }
        if (!chapter || chapter.trim() === '') {
            toast.error('Please select a chapter from the syllabus');
            return;
        }
        setLoading(true);
        try {
            const response = await aiStudentAPI.generatePersonalizedContent(token, {
                course_id: selectedCourse.course_id,
                topic: `${selectedCourse.course_title} - ${chapter}`,
                difficulty
            });

            // Also generate learning resources for this topic
            const learningResources = await generateLearningResourcesForTopic(
                selectedCourse.course_title,
                chapter,
                difficulty
            );

            setPersonalizedContent({
                ...response.content,
                learning_resources: learningResources
            });
            setActiveTab('learning');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate personalized content');
        } finally {
            setLoading(false);
        }
    };

    const generateLearningResourcesForTopic = async (
        courseTitle: string,
        chapter: string,
        difficulty: string
    ): Promise<any[]> => {
        if (!token) return [];

        try {
            const response = await aiStudentAPI.sendChatMessage(token, {
                message: `You are an educational AI assistant. A student is learning "${courseTitle}" and specifically the chapter "${chapter}" at ${difficulty} level.

Recommend EXACTLY 5 high-quality, SPECIFIC learning resources to help them master this topic.

For each resource, provide:
1. A SPECIFIC title (actual course/video name, not generic)
2. Type: video, course, article, or tutorial
3. The actual provider/creator (specific YouTube channel, platform name, author)
4. A REAL, working URL (actual course/video link, NOT a search page)
5. Estimated duration
6. Whether it's free or paid
7. A one-sentence description of what they'll learn

Return ONLY a valid JSON array, nothing else:
[
  {
    "title": "Exact Course/Video Name",
    "type": "video",
    "provider": "Specific Provider/Channel",
    "url": "https://actual-specific-url.com/course",
    "duration": "2 hours",
    "free": true,
    "description": "Learn X by doing Y"
  }
]

IMPORTANT: Provide REAL course/video names and specific URLs, not search URLs. Think like you're recommending actual resources you know about.`,
                context: 'Learning resource finder - must return valid JSON array'
            });

            // Try to parse JSON from AI response
            if (response.response) {
                try {
                    // Remove markdown code blocks
                    let jsonText = response.response.trim();
                    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

                    // Find and parse JSON array
                    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const resources = JSON.parse(jsonMatch[0]);

                        // Validate resources
                        if (Array.isArray(resources) && resources.length > 0) {
                            const validResources = resources.filter(r =>
                                r.title && r.type && r.provider && r.url &&
                                ['video', 'course', 'article', 'tutorial'].includes(r.type)
                            );

                            if (validResources.length > 0) {
                                console.log('✅ Gemini AI generated', validResources.length, 'learning resources for', chapter);
                                return validResources;
                            }
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse AI learning resources:', parseError);
                    console.log('AI Response preview:', response.response.substring(0, 300));
                }
            }

            // Fallback to curated resources
            console.warn('AI did not return valid resources, using curated fallback');
            const encodedTopic = encodeURIComponent(`${courseTitle} ${chapter}`);
            return [
                {
                    title: `${chapter} - Complete Tutorial 2024`,
                    type: 'video',
                    provider: 'YouTube',
                    url: `https://www.youtube.com/results?search_query=${encodedTopic}+tutorial+2024`,
                    duration: '30-60 min',
                    free: true,
                    description: 'Comprehensive video tutorial covering all concepts'
                },
                {
                    title: `${chapter} Specialization`,
                    type: 'course',
                    provider: 'Coursera',
                    url: `https://www.coursera.org/search?query=${encodedTopic}`,
                    duration: '2-4 weeks',
                    free: false,
                    description: 'Professional course with certificate'
                },
                {
                    title: `Learn ${chapter} Interactively`,
                    type: 'tutorial',
                    provider: 'freeCodeCamp',
                    url: `https://www.freecodecamp.org/news/search?query=${encodeURIComponent(chapter)}`,
                    duration: '1-3 hours',
                    free: true,
                    description: 'Hands-on coding exercises and projects'
                },
                {
                    title: `${chapter} Documentation & Guide`,
                    type: 'article',
                    provider: 'Official Docs',
                    url: `https://www.google.com/search?q=${encodedTopic}+documentation+guide`,
                    free: true,
                    description: 'Official documentation and best practices'
                },
                {
                    title: `${chapter} Masterclass`,
                    type: 'course',
                    provider: 'Udemy',
                    url: `https://www.udemy.com/courses/search/?q=${encodedTopic}`,
                    duration: 'Self-paced',
                    free: false,
                    description: 'In-depth course with practical examples'
                }
            ];
        } catch (error) {
            console.error('Error generating learning resources:', error);
            return [];
        }
    };

    const handleQuizGeneration = async (chapter: string, difficulty: string, numQuestions: number) => {
        if (!token || !selectedCourse) {
            toast.error('Please select a course first');
            return;
        }
        if (!chapter || chapter.trim() === '') {
            toast.error('Please select a chapter from the syllabus');
            return;
        }
        setLoading(true);
        try {
            const response = await aiStudentAPI.generateQuiz(token, {
                course_id: selectedCourse.course_id,
                topic: `${selectedCourse.course_title} - ${chapter}`,
                difficulty,
                num_questions: numQuestions
            });
            setAiQuiz(response.quiz);
            setSelectedQuizAnswers({});
            setActiveTab('quiz');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleCareerGuidance = async (interests: string) => {
        if (!token) {
            toast.error('Authentication required');
            return;
        }
        setLoading(true);
        try {
            const response = await aiStudentAPI.getCareerGuidance(token, { interests });
            setCareerGuidance(response.guidance);
            setActiveTab('career');
        } catch (error: any) {
            toast.error(error.message || 'Failed to get career guidance');
        } finally {
            setLoading(false);
        }
    };

    const handleEssayGrading = async (essayText: string, rubric: any) => {
        if (!token || !selectedCourse) {
            toast.error('Please select a course first');
            return;
        }
        setLoading(true);
        try {
            const response = await aiStudentAPI.gradeEssay(token, {
                course_id: selectedCourse.course_id,
                essay_text: essayText,
                rubric
            });
            setEssayGrading(response.grading);
            setActiveTab('essay');
        } catch (error: any) {
            toast.error(error.message || 'Failed to grade essay');
        } finally {
            setLoading(false);
        }
    };

    const handleChatMessage = async () => {
        if (!chatInput.trim() || !token) return;

        const userMessage = { role: 'user', content: chatInput, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMessage]);
        const currentInput = chatInput;
        setChatInput('');

        setLoading(true);

        try {
            const response = await aiStudentAPI.sendChatMessage(token, {
                message: currentInput,
                course_id: selectedCourse?.course_id,
                context: 'Student learning assistant - provide helpful, educational responses',
            });

            const aiMessage = {
                role: 'ai',
                content: response.response,
                timestamp: new Date(),
                ai_powered: response.ai_powered,
            };
            setChatMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            console.error('Error:', error);
            const errorMessage = {
                role: 'ai',
                content: error.message || 'Sorry, I encountered an error processing your request.',
                timestamp: new Date(),
                ai_powered: false,
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizAnswer = (questionIndex: number, answer: string) => {
        setSelectedQuizAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const submitQuiz = () => {
        if (!aiQuiz) return;

        let correctAnswers = 0;
        aiQuiz.questions.forEach((question: any, index: number) => {
            if (selectedQuizAnswers[index] === question.correct_answer) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / aiQuiz.questions.length) * 100;
        alert(`Quiz completed! Your score: ${score.toFixed(1)}% (${correctAnswers}/${aiQuiz.questions.length})`);
    };

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>

            <div style={styles.container}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.header}
                >
                    <div style={styles.headerContent}>
                        <h1 style={styles.title}>
                            🤖 AI Learning Assistant
                        </h1>
                        <p style={styles.subtitle}>
                            24/7 AI-powered academic support, career guidance, and personalized help
                        </p>
                    </div>

                    {/* Course Selector */}
                    <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', minWidth: '250px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0c4a6e' }}>
                            📚 Select Course
                        </label>
                        {enrolledCourses.length > 0 ? (
                            <select
                                value={selectedCourse?.id || ''}
                                onChange={(e) => {
                                    const course = enrolledCourses.find(c => c.id === parseInt(e.target.value));
                                    setSelectedCourse(course || null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '2px solid #0284c7',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {enrolledCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.course_title} ({course.subject})
                                        {!(course.ai_enabled && course.status === 'active') ? ' - Awaiting Approval' : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{ color: '#b91c1c', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                                ⚠️ No approved courses found. Enroll in a course first.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Warning if no AI unlocked */}
                {selectedCourse && !(selectedCourse.ai_enabled && selectedCourse.status === 'active') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            padding: '1rem',
                            backgroundColor: '#fef3c7',
                            border: '2px solid #f59e0b',
                            borderRadius: '8px',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <p style={{ color: '#92400e', margin: 0 }}>
                            ⏳ <strong>AI Features Locked</strong> - Awaiting teacher approval for enrollment in {selectedCourse.course_title}
                        </p>
                    </motion.div>
                )}

                {/* Navigation Tabs */}
                <div style={styles.tabsContainer}>
                    <div style={styles.tabs}>
                        {[
                            { id: 'home', label: '🏠 Home', desc: 'Overview' },
                            {
                                id: 'academic',
                                label: '📈 Analysis',
                                desc: 'Academic Insights',
                                locked: !(selectedCourse?.ai_enabled && selectedCourse?.status === 'active')
                            },
                            {
                                id: 'learning',
                                label: '📚 Learning',
                                desc: 'Personalized Content',
                                locked: !(selectedCourse?.ai_enabled && selectedCourse?.status === 'active')
                            },
                            {
                                id: 'quiz',
                                label: '✍️ Quiz',
                                desc: 'AI Generated Quizzes',
                                locked: !(selectedCourse?.ai_enabled && selectedCourse?.status === 'active')
                            },
                            { id: 'career', label: '💼 Career', desc: 'Career Guidance' },
                            {
                                id: 'essay',
                                label: '📝 Essay',
                                desc: 'Essay Grading',
                                locked: !(selectedCourse?.ai_enabled && selectedCourse?.status === 'active')
                            },
                            { id: 'chat', label: '💬 Chat', desc: 'AI Assistant' },
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                style={activeTab === tab.id ? styles.tabActive : { ...styles.tab, opacity: tab.locked ? 0.6 : 1 }}
                                onClick={() => {
                                    if (!tab.locked || tab.id === 'home' || tab.id === 'career' || tab.id === 'chat') {
                                        setActiveTab(tab.id);
                                    }
                                }}
                                whileHover={{ scale: tab.locked ? 1 : 1.05 }}
                                whileTap={{ scale: 1 }}
                                disabled={tab.locked}
                            >
                                <div>{tab.label}</div>
                                <div style={styles.tabDesc}>{tab.desc}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Loading Indicator */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={styles.loadingOverlay}
                        >
                            <div style={styles.loadingContent}>
                                <div style={styles.spinner}></div>
                                <p>🤖 AI is processing your request...</p>
                                <p style={styles.loadingSubtext}>This may take a few seconds</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={styles.content}
                >
                    {/* Home Tab */}
                    {activeTab === 'home' && (
                        <div style={styles.homeGrid}>
                            <motion.div
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={styles.featureCard}
                                onClick={handleAcademicAnalysis}
                            >
                                <div style={styles.featureIcon}>📈</div>
                                <h3>Academic Analysis</h3>
                                <p>Get AI-powered insights on your academic performance, dropout risk prediction, and
                                    personalized recommendations.</p>
                                <div style={styles.cardButton}>Analyze Performance</div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={styles.featureCard}
                                onClick={() => setActiveTab('learning')}
                            >
                                <div style={styles.featureIcon}>📚</div>
                                <h3>Personalized Learning</h3>
                                <p>AI generates custom content adapted to your learning style, difficulty level, and
                                    academic
                                    progress.</p>
                                <div style={styles.cardButton}>Start Learning</div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={styles.featureCard}
                                onClick={() => setActiveTab('quiz')}
                            >
                                <div style={styles.featureIcon}>✍️</div>
                                <h3>AI Quiz Generator</h3>
                                <p>Get adaptive quizzes generated specifically for your level with instant feedback and
                                    explanations.</p>
                                <div style={styles.cardButton}>Generate Quiz</div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={styles.featureCard}
                                onClick={() => setActiveTab('career')}
                            >
                                <div style={styles.featureIcon}>💼</div>
                                <h3>Career Guidance</h3>
                                <p>AI-powered career recommendations, job matching, skill gap analysis, and personalized
                                    career
                                    paths.</p>
                                <div style={styles.cardButton}>Explore Careers</div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={styles.featureCard}
                                onClick={() => setActiveTab('essay')}
                            >
                                <div style={styles.featureIcon}>📝</div>
                                <h3>Essay Grading</h3>
                                <p>Get instant AI-powered essay feedback with detailed scoring, strengths, and
                                    improvement
                                    suggestions.</p>
                                <div style={styles.cardButton}>Grade Essay</div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={styles.featureCard}
                                onClick={() => setActiveTab('chat')}
                            >
                                <div style={styles.featureIcon}>💬</div>
                                <h3>AI Assistant</h3>
                                <p>24/7 intelligent chatbot for instant help with courses, career advice, study tips,
                                    and academic
                                    support.</p>
                                <div style={styles.cardButton}>Chat Now</div>
                            </motion.div>
                        </div>
                    )}

                    {/* Academic Analysis Tab */}
                    {activeTab === 'academic' && (
                        <div style={styles.panel}>
                            <h2>📈 Academic Performance Analysis</h2>

                            {!academicAnalysis ? (
                                <div style={styles.promptCard}>
                                    <div style={styles.promptIcon}>🔍</div>
                                    <h3>Analyze Your Academic Performance</h3>
                                    <p>Get AI-powered insights about your academic progress, identify strengths and
                                        areas
                                        for improvement, and receive personalized recommendations.</p>
                                    <button style={styles.primaryButton} onClick={handleAcademicAnalysis}>
                                        Start Analysis
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.analysisResults}>
                                    <div style={styles.riskCard}>
                                        <h3>
                                            Risk Level: <span style={getRiskStyle(academicAnalysis.risk_level)}>
                                                {academicAnalysis.risk_level?.toUpperCase()}
                                            </span>
                                        </h3>
                                        <p>Risk Score: {academicAnalysis.risk_score}/100</p>
                                        <p>Trend: <span style={styles.trendText}>{academicAnalysis.trend}</span></p>
                                    </div>

                                    <div style={styles.section}>
                                        <h3 style={styles.sectionTitle}>✅ Your Strengths</h3>
                                        <div style={styles.strengthsGrid}>
                                            {academicAnalysis.strengths?.map((strength: string, idx: number) => (
                                                <div key={idx} style={styles.strengthCard}>{strength}</div>
                                            ))}
                                        </div>
                                    </div>

                                    {academicAnalysis.concerns?.length > 0 && (
                                        <div style={styles.section}>
                                            <h3 style={styles.sectionTitle}>⚠️ Areas of Concern</h3>
                                            <div style={styles.concernsGrid}>
                                                {academicAnalysis.concerns.map((concern: string, idx: number) => (
                                                    <div key={idx} style={styles.concernCard}>{concern}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={styles.section}>
                                        <h3 style={styles.sectionTitle}>💡 AI Recommendations</h3>
                                        <div style={styles.recommendationsGrid}>
                                            {academicAnalysis.recommendations?.map((rec: string, idx: number) => (
                                                <div key={idx} style={styles.recommendationCard}>{rec}</div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.aiTag}>
                                        ✨ Powered by {academicAnalysis.model || 'Gemini AI'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Personalized Learning Tab */}
                    {activeTab === 'learning' && (
                        <div style={styles.panel}>
                            <h2>📚 Personalized Learning Content</h2>

                            <div style={styles.inputSection}>
                                <div style={styles.inputGroup}>
                                    <select
                                        style={styles.select}
                                        id="learning-chapter"
                                        value={selectedChapter}
                                        onChange={(e) => setSelectedChapter(e.target.value)}
                                        disabled={!Array.isArray(courseModules) || courseModules.length === 0}
                                    >
                                        {(!Array.isArray(courseModules) || courseModules.length === 0) && (
                                            <option value="">No chapters available. Select a course.</option>
                                        )}
                                        {Array.isArray(courseModules) && courseModules.map(module => (
                                            <option key={module.id} value={module.title}>
                                                {module.order}. {module.title}
                                            </option>
                                        ))}
                                    </select>
                                    <select style={styles.select} id="learning-difficulty">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                    <button
                                        style={styles.primaryButton}
                                        onClick={() => {
                                            const chapter = (document.getElementById('learning-chapter') as HTMLSelectElement).value;
                                            const difficulty = (document.getElementById('learning-difficulty') as HTMLSelectElement).value;
                                            if (chapter && chapter.trim()) {
                                                handlePersonalizedContent(chapter, difficulty);
                                            } else {
                                                toast.error('Please select a chapter from the syllabus');
                                            }
                                        }}
                                        disabled={courseModules.length === 0}
                                    >
                                        Generate Content
                                    </button>
                                </div>
                                {syllabusInfo && (
                                    <div style={{marginTop: '1rem', fontSize: '14px', color: '#64748b'}}>
                                        Syllabus Type:&nbsp;
                                        <span
                                            style={{
                                                color: syllabusInfo.aiGenerated ? '#7c3aed' : '#0369a1',
                                                fontWeight: 600
                                            }}
                                        >
                                            {syllabusInfo.aiGenerated ? 'AI-generated Chapters' : 'Manual Chapters'}
                                        </span>
                                        {syllabusInfo.description && (
                                            <>
                                                <br/>
                                                <span style={{fontStyle: 'italic'}}>
                                                    {syllabusInfo.description}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {personalizedContent && (
                                <div style={styles.contentResults}>
                                    <div style={styles.contentSection}>
                                        <h3>📖 Explanation</h3>
                                        <div style={styles.explanation}>{personalizedContent.explanation}</div>
                                    </div>

                                    <div style={styles.contentSection}>
                                        <h3>❓ Practice Questions</h3>
                                        <div style={styles.questionsGrid}>
                                            {personalizedContent.practice_questions?.map((q: string, idx: number) => (
                                                <div key={idx} style={styles.questionItem}>
                                                    <div style={styles.questionNumber}>{idx + 1}</div>
                                                    <span>{q}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.contentSection}>
                                        <h3>💡 Examples</h3>
                                        <div style={styles.examplesGrid}>
                                            {personalizedContent.examples?.map((ex: string, idx: number) => (
                                                <div key={idx} style={styles.exampleItem}>
                                                    <div style={styles.exampleIcon}>💡</div>
                                                    <span>{ex}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.contentSection}>
                                        <h3>➡️ Next Topics</h3>
                                        <div style={styles.topicsGrid}>
                                            {personalizedContent.next_topics?.map((topic: string, idx: number) => (
                                                <span key={idx} style={styles.topicBadge}>{topic}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {Array.isArray(personalizedContent.learning_resources) && personalizedContent.learning_resources.length > 0 && (
                                        <div style={styles.contentSection}>
                                            <h3>🌐 Learning Resources</h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                                                gap: '1rem'
                                            }}>
                                                {personalizedContent.learning_resources.map((resource: any, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'block',
                                                            padding: '1.5rem',
                                                            background: resource.free
                                                                ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                                                                : 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',
                                                            borderRadius: '14px',
                                                            border: '1px solid #e2e8f0',
                                                            color: '#1e293b',
                                                            textDecoration: 'none',
                                                            boxShadow: '0 2px 8px rgba(102,126,234,0.08)',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <div style={{
                                                            fontSize: '1.1rem',
                                                            fontWeight: 700,
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            {resource.title}
                                                        </div>
                                                        <div style={{marginBottom: '0.5rem'}}>
                                                            <span style={{
                                                                background: '#667eea',
                                                                color: 'white',
                                                                borderRadius: '8px',
                                                                padding: '2px 10px',
                                                                fontSize: '12px',
                                                                marginRight: '8px'
                                                            }}>{resource.type}</span>
                                                            <span style={{
                                                                background: '#cffafe',
                                                                color: '#0891b2',
                                                                borderRadius: '8px',
                                                                padding: '2px 10px',
                                                                fontSize: '12px'
                                                            }}>{resource.provider}</span>
                                                            {resource.free && <span style={{
                                                                background: '#bbf7d0',
                                                                color: '#065f46',
                                                                borderRadius: '8px',
                                                                padding: '2px 10px',
                                                                fontSize: '12px',
                                                                marginLeft: '8px'
                                                            }}>Free</span>}
                                                        </div>
                                                        {resource.duration && <div style={{
                                                            fontSize: '13px',
                                                            color: '#64748b',
                                                            marginBottom: '0.5rem'
                                                        }}>⏱️ {resource.duration}</div>}
                                                        <div style={{
                                                            color: '#334155',
                                                            fontSize: '14px',
                                                            marginBottom: '0.35rem'
                                                        }}>
                                                            {resource.description}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#6366f1'
                                                        }}>🔗 {resource.url}</div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={styles.aiTag}>
                                        ✨ Powered by {personalizedContent.model || 'Gemini AI'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quiz Tab */}
                    {activeTab === 'quiz' && (
                        <div style={styles.panel}>
                            <h2>✍️ AI-Generated Quiz</h2>

                            <div style={styles.inputSection}>
                                <div style={styles.inputGroup}>
                                    <select
                                        style={styles.select}
                                        id="quiz-chapter"
                                        value={selectedChapter}
                                        onChange={(e) => setSelectedChapter(e.target.value)}
                                        disabled={!Array.isArray(courseModules) || courseModules.length === 0}
                                    >
                                        {(!Array.isArray(courseModules) || courseModules.length === 0) && (
                                            <option value="">No chapters available. Select a course.</option>
                                        )}
                                        {Array.isArray(courseModules) && courseModules.map(module => (
                                            <option key={module.id} value={module.title}>
                                                {module.order}. {module.title}
                                            </option>
                                        ))}
                                    </select>
                                    <select style={styles.select} id="quiz-difficulty">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Questions"
                                        style={styles.numberInput}
                                        id="quiz-num"
                                        defaultValue={5}
                                        min={1}
                                        max={10}
                                    />
                                    <button
                                        style={styles.primaryButton}
                                        onClick={() => {
                                            const chapter = (document.getElementById('quiz-chapter') as HTMLSelectElement).value;
                                            const difficulty = (document.getElementById('quiz-difficulty') as HTMLSelectElement).value;
                                            const num = parseInt((document.getElementById('quiz-num') as HTMLInputElement).value);
                                            if (chapter && chapter.trim()) {
                                                handleQuizGeneration(chapter, difficulty, num);
                                            } else {
                                                toast.error('Please select a chapter from the syllabus');
                                            }
                                        }}
                                        disabled={courseModules.length === 0}
                                    >
                                        Generate Quiz
                                    </button>
                                </div>
                                {syllabusInfo && (
                                    <div style={{marginTop: '1rem', fontSize: '14px', color: '#64748b'}}>
                                        Syllabus Type:&nbsp;
                                        <span
                                            style={{
                                                color: syllabusInfo.aiGenerated ? '#7c3aed' : '#0369a1',
                                                fontWeight: 600
                                            }}
                                        >
                                            {syllabusInfo.aiGenerated ? 'AI-generated Chapters' : 'Manual Chapters'}
                                        </span>
                                        {syllabusInfo.description && (
                                            <>
                                                <br/>
                                                <span style={{fontStyle: 'italic'}}>
                                                    {syllabusInfo.description}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {aiQuiz && (
                                <div style={styles.quizResults}>
                                    <div style={styles.quizHeader}>
                                        <h3>{aiQuiz.title}</h3>
                                        <p>Questions: {aiQuiz.total_questions} | Difficulty: {aiQuiz.difficulty}</p>
                                    </div>

                                    <div style={styles.questionsContainer}>
                                        {aiQuiz.questions?.map((q: any, idx: number) => (
                                            <div key={idx} style={styles.questionCard}>
                                                <div style={styles.questionTitle}>
                                                    <div style={styles.questionBadge}>{idx + 1}</div>
                                                    <h4>Question {idx + 1}: {q.question_text}</h4>
                                                </div>
                                                <div style={styles.optionsContainer}>
                                                    {q.options?.map((option: string, optIdx: number) => (
                                                        <label key={optIdx} style={selectedQuizAnswers[idx] === option ?
                                                            { ...styles.optionLabel, ...styles.optionSelected } : styles.optionLabel}>
                                                            <input
                                                                type="radio"
                                                                name={`question-${idx}`}
                                                                value={option}
                                                                checked={selectedQuizAnswers[idx] === option}
                                                                onChange={() => handleQuizAnswer(idx, option)}
                                                                style={styles.radioInput}
                                                            />
                                                            <span style={styles.optionText}>{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div style={styles.questionFooter}>
                                                    💡 Points: {q.points}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        style={Object.keys(selectedQuizAnswers).length === aiQuiz.questions?.length ?
                                            styles.submitButton : styles.submitButtonDisabled}
                                        onClick={submitQuiz}
                                        disabled={Object.keys(selectedQuizAnswers).length !== aiQuiz.questions?.length}
                                    >
                                        Submit Quiz
                                    </button>

                                    <div style={styles.aiTag}>
                                        ✨ Generated by Gemini AI
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Career Guidance Tab */}
                    {activeTab === 'career' && (
                        <div style={styles.panel}>
                            <h2>💼 AI Career Guidance</h2>

                            <div style={styles.inputSection}>
                                <div style={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Your interests (e.g., Data Science, Software Engineering, AI)"
                                        style={styles.input}
                                        id="career-interests"
                                    />
                                    <button
                                        style={styles.primaryButton}
                                        onClick={() => {
                                            const interests = (document.getElementById('career-interests') as HTMLInputElement).value;
                                            if (interests.trim()) {
                                                handleCareerGuidance(interests);
                                            }
                                        }}
                                    >
                                        Get Career Guidance
                                    </button>
                                </div>
                            </div>

                            {careerGuidance && (
                                <div style={styles.careerResults}>
                                    <div style={styles.section}>
                                        <h3 style={styles.sectionTitle}>🎯 Recommended Careers</h3>
                                        <div style={styles.careersGrid}>
                                            {careerGuidance.recommended_careers?.map((career: any, idx: number) => (
                                                <div key={idx} style={styles.careerCard}>
                                                    <div style={styles.careerHeader}>
                                                        <h4>{career.title}</h4>
                                                        <div style={styles.matchScore}>Match: {career.match_score}%
                                                        </div>
                                                    </div>
                                                    <div style={styles.careerWhy}>{career.why}</div>
                                                    <div style={styles.salaryRange}>💰 {career.salary_range}</div>
                                                    <button style={styles.exploreButton}>Explore</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.section}>
                                        <h3 style={styles.sectionTitle}>📊 Skill Gaps</h3>
                                        <div style={styles.skillsGrid}>
                                            {careerGuidance.skill_gaps?.map((skill: string, idx: number) => (
                                                <span key={idx} style={styles.skillGap}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.section}>
                                        <h3 style={styles.sectionTitle}>🛤️ Learning Path</h3>
                                        <div style={styles.learningPath}>
                                            {careerGuidance.learning_path?.map((step: string, idx: number) => (
                                                <div key={idx} style={styles.pathStep}>
                                                    <div style={styles.stepNumber}>{idx + 1}</div>
                                                    <div style={styles.stepContent}>{step}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.section}>
                                        <h3 style={styles.sectionTitle}>📈 Market Outlook</h3>
                                        <div style={styles.marketOutlook}>{careerGuidance.market_outlook}</div>
                                    </div>

                                    <div style={styles.aiTag}>
                                        ✨ Powered by {careerGuidance.model || 'Gemini AI'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Essay Grading Tab */}
                    {activeTab === 'essay' && (
                        <div style={styles.panel}>
                            <h2>📝 AI Essay Grading</h2>

                            <div style={styles.inputSection}>
                                <textarea
                                    placeholder="Paste your essay here for AI analysis and feedback..."
                                    style={styles.textarea}
                                    id="essay-text"
                                    rows={10}
                                />
                                <div style={styles.rubricSection}>
                                    <h4>Grading Rubric (out of 100 points):</h4>
                                    <div style={styles.rubricInputs}>
                                        <div style={styles.rubricItem}>
                                            <label>Content:</label>
                                            <input type="number" defaultValue={40} min={0} max={100} id="content-points"
                                                style={styles.rubricInput} />
                                        </div>
                                        <div style={styles.rubricItem}>
                                            <label>Grammar:</label>
                                            <input type="number" defaultValue={30} min={0} max={100} id="grammar-points"
                                                style={styles.rubricInput} />
                                        </div>
                                        <div style={styles.rubricItem}>
                                            <label>Structure:</label>
                                            <input type="number" defaultValue={30} min={0} max={100}
                                                id="structure-points" style={styles.rubricInput} />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    style={styles.primaryButton}
                                    onClick={() => {
                                        const essayText = (document.getElementById('essay-text') as HTMLTextAreaElement).value;
                                        const contentPoints = parseInt((document.getElementById('content-points') as HTMLInputElement).value);
                                        const grammarPoints = parseInt((document.getElementById('grammar-points') as HTMLInputElement).value);
                                        const structurePoints = parseInt((document.getElementById('structure-points') as HTMLInputElement).value);

                                        if (essayText.trim()) {
                                            handleEssayGrading(essayText, {
                                                content: contentPoints,
                                                grammar: grammarPoints,
                                                structure: structurePoints
                                            });
                                        }
                                    }}
                                >
                                    Grade Essay
                                </button>
                            </div>

                            {essayGrading && (
                                <div style={styles.gradingResults}>
                                    <div style={styles.scoreCard}>
                                        <div style={styles.overallScore}>
                                            <div style={styles.scoreNumber}>{essayGrading.overall_score}</div>
                                            <div style={styles.scoreGrade}>
                                                {essayGrading.overall_score >= 90 ? 'A' :
                                                    essayGrading.overall_score >= 80 ? 'B' :
                                                        essayGrading.overall_score >= 70 ? 'C' :
                                                            essayGrading.overall_score >= 60 ? 'D' : 'F'}
                                            </div>
                                        </div>
                                        <div style={styles.criteriaScores}>
                                            {Object.entries(essayGrading.criteria_scores || {}).map(([criteria, score]: [string, any]) => (
                                                <div key={criteria} style={styles.criteriaItem}>
                                                    <div style={styles.criteriaLabel}>{criteria}</div>
                                                    <div style={styles.criteriaScore}>{score}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.feedbackGrid}>
                                        <div style={styles.section}>
                                            <h3 style={styles.sectionTitle}>✅ Strengths</h3>
                                            <div style={styles.strengthsGrid}>
                                                {essayGrading.strengths?.map((strength: string, idx: number) => (
                                                    <div key={idx} style={styles.strengthCard}>{strength}</div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={styles.section}>
                                            <h3 style={styles.sectionTitle}>📈 Areas for Improvement</h3>
                                            <div style={styles.improvementsGrid}>
                                                {essayGrading.improvements?.map((improvement: string, idx: number) => (
                                                    <div key={idx} style={styles.improvementCard}>{improvement}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.section}>
                                        <h3 style={styles.sectionTitle}>💬 Detailed Feedback</h3>
                                        <div style={styles.detailedFeedback}>{essayGrading.feedback}</div>
                                    </div>

                                    <div style={styles.aiTag}>
                                        ✨ Graded by {essayGrading.model || 'Gemini AI'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Assistant Tab */}
                    {activeTab === 'chat' && (
                        <div style={styles.chatPanel}>
                            <h2>💬 AI Assistant</h2>

                            <div style={styles.chatContainer}>
                                <div style={styles.chatMessages}>
                                    {chatMessages.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={styles.chatWelcome}
                                        >
                                            <div style={styles.welcomeIcon}>👋</div>
                                            <h3>Hello {user?.first_name}! I'm your AI learning assistant</h3>
                                            <p>I can help you with:</p>
                                            <div style={styles.helpGrid}>
                                                <div style={styles.helpCard}>
                                                    <div style={styles.helpIcon}>📚</div>
                                                    <span>Course recommendations</span>
                                                </div>
                                                <div style={styles.helpCard}>
                                                    <div style={styles.helpIcon}>💼</div>
                                                    <span>Career guidance</span>
                                                </div>
                                                <div style={styles.helpCard}>
                                                    <div style={styles.helpIcon}>📖</div>
                                                    <span>Study strategies</span>
                                                </div>
                                                <div style={styles.helpCard}>
                                                    <div style={styles.helpIcon}>🎓</div>
                                                    <span>Academic support</span>
                                                </div>
                                                <div style={styles.helpCard}>
                                                    <div style={styles.helpIcon}>💰</div>
                                                    <span>Scholarships</span>
                                                </div>
                                                <div style={styles.helpCard}>
                                                    <div style={styles.helpIcon}>🚀</div>
                                                    <span>Motivation & tips</span>
                                                </div>
                                            </div>
                                            <div style={styles.quickQuestions}>
                                                <h4>Try these questions:</h4>
                                                <div style={styles.quickButtons}>
                                                    <button
                                                        style={styles.quickButton}
                                                        onClick={() => {
                                                            setChatInput("What courses should I take to become a data scientist?");
                                                        }}
                                                    >
                                                        "Data science career path?"
                                                    </button>
                                                    <button
                                                        style={styles.quickButton}
                                                        onClick={() => {
                                                            setChatInput("How can I improve my study habits?");
                                                        }}
                                                    >
                                                        "Study tips?"
                                                    </button>
                                                    <button
                                                        style={styles.quickButton}
                                                        onClick={() => {
                                                            setChatInput("What are good programming languages to learn?");
                                                        }}
                                                    >
                                                        "Programming languages?"
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {chatMessages.map((message, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={message.role === 'user' ? styles.userMessage : styles.aiMessage}
                                        >
                                            <div style={styles.messageHeader}>
                                                <strong>
                                                    {message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                                                </strong>
                                                <span style={styles.timestamp}>
                                                    {message.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div style={styles.messageContent}>{message.content}</div>
                                            {message.ai_powered && (
                                                <div style={styles.aiIndicator}>✨ Powered by Gemini AI</div>
                                            )}
                                        </motion.div>
                                    ))}
                                    <div ref={chatEndRef}></div>
                                </div>

                                <div style={styles.chatInputContainer}>
                                    <input
                                        type="text"
                                        placeholder="Ask me anything about your studies, career, or academic goals..."
                                        style={styles.chatInput}
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={chatInput.trim() ? styles.sendButton : styles.sendButtonDisabled}
                                        onClick={handleChatMessage}
                                        disabled={!chatInput.trim()}
                                    >
                                        Send
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

// Helper function for risk level styling
const getRiskStyle = (riskLevel: string) => {
    const riskStyles = {
        low: { color: '#10b981', fontWeight: 'bold' as const },
        medium: { color: '#f59e0b', fontWeight: 'bold' as const },
        high: { color: '#ef4444', fontWeight: 'bold' as const },
    };
    return riskStyles[riskLevel as keyof typeof riskStyles] || riskStyles.medium;
};

// Enhanced Styles with modern design
const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
    },
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '0 0 24px 24px',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    } as React.CSSProperties,
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        margin: '0 0 0.5rem 0',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '1.1rem',
        margin: 0,
        opacity: 0.9,
        fontWeight: '400',
    },
    aiStatus: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'flex-end',
        gap: '0.5rem',
    },
    statusActive: {
        background: 'rgba(16, 185, 129, 0.9)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        border: '1px solid rgba(255,255,255,0.2)',
    },
    statusInactive: {
        background: 'rgba(245, 158, 11, 0.9)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        border: '1px solid rgba(255,255,255,0.2)',
    },
    modelInfo: {
        fontSize: '12px',
        opacity: 0.8,
        textAlign: 'right' as const,
    },
    tabsContainer: {
        padding: '0 2rem',
        marginBottom: '2rem',
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto' as const,
        padding: '0.5rem',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
    },
    tab: {
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'transparent',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: '130px',
        textAlign: 'center' as const,
        color: '#64748b',
        fontSize: '14px',
    } as React.CSSProperties,
    tabActive: {
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        minWidth: '130px',
        textAlign: 'center' as const,
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        fontSize: '14px',
    } as React.CSSProperties,
    tabDesc: {
        fontSize: '10px',
        opacity: 0.8,
        marginTop: '2px',
    },
    loadingOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
    },
    loadingContent: {
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        textAlign: 'center' as const,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid #e2e8f0',
    },
    loadingSubtext: {
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '0.5rem',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1.5rem auto',
    },
    content: {
        padding: '0 2rem 2rem 2rem',
    },
    homeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '2rem',
    },
    featureCard: {
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid #e2e8f0',
        position: 'relative' as const,
        overflow: 'hidden',
    } as React.CSSProperties,
    featureIcon: {
        fontSize: '3.5rem',
        marginBottom: '1.5rem',
        textShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    cardButton: {
        marginTop: '1.5rem',
        padding: '0.875rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        textAlign: 'center' as const,
        fontWeight: '600',
        transition: 'all 0.3s ease',
        fontSize: '16px',
    },
    panel: {
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem',
    },
    inputSection: {
        marginBottom: '2rem',
    },
    inputGroup: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
    },
    input: {
        flex: 1,
        minWidth: '250px',
        padding: '1rem 1.25rem',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: '#fafbfc',
    } as React.CSSProperties,
    select: {
        padding: '1rem 1.25rem',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        background: '#fafbfc',
        minWidth: '170px',
    } as React.CSSProperties,
    numberInput: {
        width: '120px',
        padding: '1rem 1.25rem',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        textAlign: 'center' as const,
    } as React.CSSProperties,
    primaryButton: {
        padding: '1rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap' as const,
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    } as React.CSSProperties,
    promptCard: {
        textAlign: 'center' as const,
        padding: '4rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        border: '2px dashed #cbd5e1',
    },
    promptIcon: {
        fontSize: '5rem',
        marginBottom: '2rem',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
    },

    // Analysis Results
    analysisResults: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
    },
    riskCard: {
        padding: '2rem',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        textAlign: 'center' as const,
    },
    trendText: {
        fontWeight: '600',
        color: '#10b981',
    },
    section: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },

    // Strengths/Concerns/Recommendations
    strengthsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    strengthCard: {
        padding: '1rem',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        color: '#065f46',
        borderRadius: '12px',
        fontWeight: '500',
        border: '1px solid #a7f3d0',
    },
    concernsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    concernCard: {
        padding: '1rem',
        background: 'linear-gradient(135deg, #fefbf0 0%, #fef3c7 100%)',
        color: '#92400e',
        borderRadius: '12px',
        fontWeight: '500',
        border: '1px solid #fcd34d',
    },
    recommendationsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
    },
    recommendationCard: {
        padding: '1.25rem',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        color: '#1e40af',
        borderRadius: '12px',
        fontWeight: '500',
        border: '1px solid #93c5fd',
    },

    // Content Results
    contentResults: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
    },
    contentSection: {
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
    },
    explanation: {
        lineHeight: '1.8',
        color: '#374151',
        fontSize: '16px',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    questionsGrid: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.75rem',
    },
    questionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        color: '#374151',
    },
    questionNumber: {
        background: '#667eea',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '600',
        flexShrink: 0,
    },
    examplesGrid: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
    },
    exampleItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.25rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        color: '#6b7280',
    },
    exampleIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    topicsGrid: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap' as const,
    },
    topicBadge: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
    },

    // Quiz Results
    quizResults: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
    },
    quizHeader: {
        textAlign: 'center' as const,
        padding: '2rem',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
    },
    questionsContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1.5rem',
    },
    questionCard: {
        padding: '2rem',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    questionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        fontSize: '1.1rem',
        fontWeight: '600',
    },
    questionBadge: {
        background: '#667eea',
        color: 'white',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600',
        flexShrink: 0,
    },
    optionsContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.75rem',
    },
    optionLabel: {
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid #e2e8f0',
    } as React.CSSProperties,
    optionSelected: {
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '2px solid #3b82f6',
        color: '#1e40af',
    },
    radioInput: {
        marginRight: '1rem',
    },
    optionText: {
        flex: 1,
        fontWeight: '500',
    },
    questionFooter: {
        marginTop: '1rem',
        fontSize: '14px',
        color: '#6b7280',
        textAlign: 'center' as const,
    },
    submitButton: {
        padding: '1.25rem 3rem',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: '700',
        alignSelf: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
    } as React.CSSProperties,
    submitButtonDisabled: {
        padding: '1.25rem 3rem',
        background: '#e5e7eb',
        color: '#9ca3af',
        border: 'none',
        borderRadius: '16px',
        cursor: 'not-allowed',
        fontSize: '18px',
        fontWeight: '700',
        alignSelf: 'center',
    } as React.CSSProperties,

    // Career Results
    careerResults: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
    },
    careersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
    },
    careerCard: {
        padding: '2rem',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
    },
    careerHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    matchScore: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '700',
    },
    careerWhy: {
        color: '#6b7280',
        marginBottom: '1rem',
        lineHeight: '1.6',
    },
    salaryRange: {
        color: '#6366f1',
        fontWeight: '700',
        marginBottom: '1rem',
        fontSize: '1.1rem',
    },
    exploreButton: {
        padding: '0.75rem 1.5rem',
        background: 'transparent',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    } as React.CSSProperties,
    skillsGrid: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap' as const,
    },
    skillGap: {
        padding: '0.75rem 1.25rem',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        color: '#92400e',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        border: '1px solid #f59e0b',
    },
    learningPath: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
    },
    pathStep: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    stepNumber: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '700',
        flexShrink: 0,
    },
    stepContent: {
        flex: 1,
        color: '#374151',
        lineHeight: '1.6',
        fontSize: '16px',
    },
    marketOutlook: {
        padding: '2rem',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: '16px',
        color: '#0c4a6e',
        lineHeight: '1.7',
        border: '1px solid #7dd3fc',
        fontSize: '16px',
    },

    // Essay Grading
    textarea: {
        width: '100%',
        padding: '1.25rem',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        fontFamily: 'inherit',
        resize: 'vertical' as const,
        marginBottom: '1.5rem',
        backgroundColor: '#fafbfc',
        lineHeight: '1.6',
    } as React.CSSProperties,
    rubricSection: {
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    rubricInputs: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap' as const,
        marginTop: '1rem',
    },
    rubricItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    rubricInput: {
        padding: '0.75rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '16px',
        textAlign: 'center' as const,
        width: '80px',
    },
    gradingResults: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
    },
    scoreCard: {
        padding: '2rem',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: '16px',
        textAlign: 'center' as const,
        border: '1px solid #cbd5e1',
    },
    overallScore: {
        marginBottom: '2rem',
    },
    scoreNumber: {
        fontSize: '4rem',
        fontWeight: '800',
        color: '#667eea',
        margin: '1rem 0',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    scoreGrade: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#10b981',
    },
    criteriaScores: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap' as const,
        gap: '1.5rem',
    },
    criteriaItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '0.5rem',
    },
    criteriaLabel: {
        fontSize: '14px',
        color: '#6b7280',
        textTransform: 'capitalize' as const,
    },
    criteriaScore: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#374151',
    },
    feedbackGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
    },
    improvementsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    improvementCard: {
        padding: '1rem',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        color: '#4338ca',
        borderRadius: '12px',
        fontWeight: '500',
        border: '1px solid #a5b4fc',
    },
    detailedFeedback: {
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        lineHeight: '1.7',
        color: '#374151',
        border: '1px solid #e2e8f0',
        fontSize: '16px',
    },

    // Chat-specific styles
    chatPanel: {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
    },
    chatContainer: {
        height: '650px',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    chatMessages: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0',
    },
    chatWelcome: {
        textAlign: 'center' as const,
        color: '#6b7280',
        padding: '2rem',
    },
    welcomeIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
    },
    helpGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        margin: '2rem 0',
    },
    helpCard: {
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        textAlign: 'center' as const,
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
    },
    helpIcon: {
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
    },
    quickQuestions: {
        marginTop: '2rem',
    },
    quickButtons: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap' as const,
        justifyContent: 'center',
    },
    quickButton: {
        padding: '0.5rem 1rem',
        background: 'rgba(102, 126, 234, 0.1)',
        color: '#667eea',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    } as React.CSSProperties,
    userMessage: {
        marginBottom: '1.5rem',
        marginLeft: '20%',
    },
    aiMessage: {
        marginBottom: '1.5rem',
        marginRight: '20%',
    },
    messageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        fontSize: '14px',
    },
    messageContent: {
        padding: '1.25rem',
        borderRadius: '16px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        lineHeight: '1.7',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    timestamp: {
        color: '#6b7280',
        fontSize: '12px',
    },
    aiIndicator: {
        fontSize: '12px',
        color: '#667eea',
        fontWeight: '500',
        marginTop: '0.5rem',
        textAlign: 'center' as const,
    },
    chatInputContainer: {
        display: 'flex',
        gap: '1rem',
    },
    chatInput: {
        flex: 1,
        padding: '1rem 1.25rem',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: '#fafbfc',
    } as React.CSSProperties,
    sendButton: {
        padding: '1rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    } as React.CSSProperties,
    sendButtonDisabled: {
        padding: '1rem 2rem',
        background: '#e2e8f0',
        color: '#9ca3af',
        border: 'none',
        borderRadius: '12px',
        cursor: 'not-allowed',
        fontSize: '16px',
        fontWeight: '600',
    } as React.CSSProperties,

    // Final common style
    aiTag: {
        marginTop: '2rem',
        padding: '1rem 1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        textAlign: 'center' as const,
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
    },
};

export default AILearningAssistant;