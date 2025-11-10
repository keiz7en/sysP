import React, {useState, useEffect} from 'react';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Axios instance with auth
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// AI Dashboard Component
const StudentAIDashboard: React.FC = () => {
    const [aiStatus, setAiStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // State for different AI features
    const [academicAnalysis, setAcademicAnalysis] = useState<any>(null);
    const [personalizedContent, setPersonalizedContent] = useState<any>(null);
    const [aiQuiz, setAiQuiz] = useState<any>(null);
    const [careerGuidance, setCareerGuidance] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');

    // Load AI Dashboard Status
    useEffect(() => {
        loadAIDashboard();
    }, []);

    const loadAIDashboard = async () => {
        try {
            const response = await api.get('/students/ai/dashboard/');
            setAiStatus(response.data.dashboard);
        } catch (error) {
            console.error('Error loading AI dashboard:', error);
        }
    };

    // 1. Academic Analysis - Dropout Risk Prediction
    const getAcademicAnalysis = async () => {
        setLoading(true);
        try {
            const response = await api.post('/students/ai/academic-analysis/');
            setAcademicAnalysis(response.data.analysis);
            setActiveTab('academic');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Personalized Learning Content
    const generatePersonalizedContent = async (topic: string, difficulty: string) => {
        setLoading(true);
        try {
            const response = await api.post('/students/ai/personalized-content/', {
                topic,
                difficulty,
            });
            setPersonalizedContent(response.data.content);
            setActiveTab('learning');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 3. AI Quiz Generation
    const generateAIQuiz = async (topic: string, difficulty: string, numQuestions: number) => {
        setLoading(true);
        try {
            const response = await api.post('/students/ai/generate-quiz/', {
                topic,
                difficulty,
                num_questions: numQuestions,
            });
            setAiQuiz(response.data.quiz);
            setActiveTab('quiz');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 4. Career Guidance
    const getCareerGuidance = async (interests: string) => {
        setLoading(true);
        try {
            const response = await api.post('/students/ai/career-guidance/', {
                interests,
            });
            setCareerGuidance(response.data.guidance);
            setActiveTab('career');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 5. AI Chatbot
    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage = {role: 'user', content: chatInput};
        setChatMessages([...chatMessages, userMessage]);
        setChatInput('');

        try {
            const response = await api.post('/students/ai/chatbot/', {
                message: chatInput,
                context: 'Student support',
            });

            const aiMessage = {role: 'ai', content: response.data.response};
            setChatMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1>🤖 AI-Powered Learning Dashboard</h1>
                {aiStatus && (
                    <div style={styles.aiStatus}>
            <span style={aiStatus.gemini_available ? styles.statusActive : styles.statusInactive}>
              {aiStatus.gemini_available ? '✅ AI Active' : '⚠️ AI Offline'}
            </span>
                        <span style={styles.modelInfo}>Model: {aiStatus.model}</span>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div style={styles.tabs}>
                <button
                    style={activeTab === 'dashboard' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    style={activeTab === 'academic' ? styles.tabActive : styles.tab}
                    onClick={getAcademicAnalysis}
                >
                    📈 Academic Analysis
                </button>
                <button
                    style={activeTab === 'learning' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('learning')}
                >
                    📚 Personalized Learning
                </button>
                <button
                    style={activeTab === 'quiz' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('quiz')}
                >
                    ✍️ AI Quizzes
                </button>
                <button
                    style={activeTab === 'career' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('career')}
                >
                    💼 Career Guidance
                </button>
                <button
                    style={activeTab === 'chat' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('chat')}
                >
                    💬 AI Assistant
                </button>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>AI is thinking...</p>
                </div>
            )}

            {/* Content Area */}
            <div style={styles.content}>
                {/* Dashboard Overview */}
                {activeTab === 'dashboard' && (
                    <div style={styles.dashboardGrid}>
                        <div style={styles.card} onClick={getAcademicAnalysis}>
                            <h3>📈 Academic Analysis</h3>
                            <p>Get AI-powered insights on your academic performance and dropout risk prediction</p>
                            <button style={styles.button}>Analyze Now</button>
                        </div>

                        <div style={styles.card} onClick={() => setActiveTab('learning')}>
                            <h3>📚 Personalized Learning</h3>
                            <p>AI generates custom content adapted to your learning style and pace</p>
                            <button style={styles.button}>Start Learning</button>
                        </div>

                        <div style={styles.card} onClick={() => setActiveTab('quiz')}>
                            <h3>✍️ AI Quizzes</h3>
                            <p>Get adaptive quizzes generated specifically for your level</p>
                            <button style={styles.button}>Generate Quiz</button>
                        </div>

                        <div style={styles.card} onClick={() => setActiveTab('career')}>
                            <h3>💼 Career Guidance</h3>
                            <p>AI-powered career recommendations and job matching</p>
                            <button style={styles.button}>Explore Careers</button>
                        </div>

                        <div style={styles.card} onClick={() => setActiveTab('chat')}>
                            <h3>💬 AI Assistant</h3>
                            <p>24/7 AI chatbot for instant help with courses and career</p>
                            <button style={styles.button}>Chat Now</button>
                        </div>
                    </div>
                )}

                {/* Academic Analysis Tab */}
                {activeTab === 'academic' && academicAnalysis && (
                    <div style={styles.analysisPanel}>
                        <h2>📈 Academic Performance Analysis</h2>

                        <div style={styles.riskCard}>
                            <h3>Risk Level: <span style={getRiskStyle(academicAnalysis.risk_level)}>
                {academicAnalysis.risk_level?.toUpperCase()}
              </span></h3>
                            <p>Risk Score: {academicAnalysis.risk_score}/100</p>
                            <p>Trend: {academicAnalysis.trend}</p>
                        </div>

                        <div style={styles.section}>
                            <h3>✅ Your Strengths</h3>
                            <ul>
                                {academicAnalysis.strengths?.map((strength: string, idx: number) => (
                                    <li key={idx} style={styles.strengthItem}>{strength}</li>
                                ))}
                            </ul>
                        </div>

                        {academicAnalysis.concerns?.length > 0 && (
                            <div style={styles.section}>
                                <h3>⚠️ Areas of Concern</h3>
                                <ul>
                                    {academicAnalysis.concerns.map((concern: string, idx: number) => (
                                        <li key={idx} style={styles.concernItem}>{concern}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={styles.section}>
                            <h3>💡 AI Recommendations</h3>
                            <ul>
                                {academicAnalysis.recommendations?.map((rec: string, idx: number) => (
                                    <li key={idx} style={styles.recommendationItem}>{rec}</li>
                                ))}
                            </ul>
                        </div>

                        {academicAnalysis.ai_powered && (
                            <div style={styles.aiTag}>
                                ✨ Powered by {academicAnalysis.model || 'Gemini AI'}
                            </div>
                        )}
                    </div>
                )}

                {/* Personalized Learning Tab */}
                {activeTab === 'learning' && (
                    <div style={styles.learningPanel}>
                        <h2>📚 Personalized Learning</h2>

                        <div style={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Enter topic (e.g., Machine Learning)"
                                style={styles.input}
                                id="topic-input"
                            />
                            <select style={styles.select} id="difficulty-select">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            <button
                                style={styles.button}
                                onClick={() => {
                                    const topic = (document.getElementById('topic-input') as HTMLInputElement).value;
                                    const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value;
                                    generatePersonalizedContent(topic, difficulty);
                                }}
                            >
                                Generate Content
                            </button>
                        </div>

                        {personalizedContent && (
                            <div style={styles.contentCard}>
                                <h3>📖 Explanation</h3>
                                <p style={styles.explanation}>{personalizedContent.explanation}</p>

                                <h3>❓ Practice Questions</h3>
                                <ul>
                                    {personalizedContent.practice_questions?.map((q: string, idx: number) => (
                                        <li key={idx} style={styles.questionItem}>{q}</li>
                                    ))}
                                </ul>

                                <h3>💡 Examples</h3>
                                <ul>
                                    {personalizedContent.examples?.map((ex: string, idx: number) => (
                                        <li key={idx} style={styles.exampleItem}>{ex}</li>
                                    ))}
                                </ul>

                                <h3>➡️ Next Topics</h3>
                                <div style={styles.nextTopics}>
                                    {personalizedContent.next_topics?.map((topic: string, idx: number) => (
                                        <span key={idx} style={styles.topicBadge}>{topic}</span>
                                    ))}
                                </div>

                                {personalizedContent.ai_powered && (
                                    <div style={styles.aiTag}>
                                        ✨ Powered by {personalizedContent.model || 'Gemini AI'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* AI Quiz Tab */}
                {activeTab === 'quiz' && (
                    <div style={styles.quizPanel}>
                        <h2>✍️ AI-Generated Quiz</h2>

                        <div style={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Quiz topic"
                                style={styles.input}
                                id="quiz-topic-input"
                            />
                            <select style={styles.select} id="quiz-difficulty-select">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Questions"
                                style={styles.input}
                                id="quiz-num-input"
                                defaultValue={5}
                                min={1}
                                max={10}
                            />
                            <button
                                style={styles.button}
                                onClick={() => {
                                    const topic = (document.getElementById('quiz-topic-input') as HTMLInputElement).value;
                                    const difficulty = (document.getElementById('quiz-difficulty-select') as HTMLSelectElement).value;
                                    const num = parseInt((document.getElementById('quiz-num-input') as HTMLInputElement).value);
                                    generateAIQuiz(topic, difficulty, num);
                                }}
                            >
                                Generate Quiz
                            </button>
                        </div>

                        {aiQuiz && (
                            <div style={styles.quizCard}>
                                <h3>{aiQuiz.title}</h3>
                                <p>Questions: {aiQuiz.total_questions} | Difficulty: {aiQuiz.difficulty}</p>

                                {aiQuiz.questions?.map((q: any, idx: number) => (
                                    <div key={idx} style={styles.questionCard}>
                                        <h4>Question {idx + 1}: {q.question_text}</h4>
                                        <div style={styles.options}>
                                            {q.options?.map((option: string, optIdx: number) => (
                                                <div key={optIdx} style={styles.option}>
                                                    <input type="radio" name={`q${idx}`} id={`q${idx}-${optIdx}`}/>
                                                    <label htmlFor={`q${idx}-${optIdx}`}>{option}</label>
                                                </div>
                                            ))}
                                        </div>
                                        <p style={styles.hint}>💡 Points: {q.points}</p>
                                    </div>
                                ))}

                                <button style={styles.submitButton}>Submit Quiz</button>

                                {aiQuiz.ai_powered && (
                                    <div style={styles.aiTag}>
                                        ✨ Generated by {aiQuiz.difficulty} AI
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Career Guidance Tab */}
                {activeTab === 'career' && (
                    <div style={styles.careerPanel}>
                        <h2>💼 AI Career Guidance</h2>

                        <div style={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Your interests (e.g., Data Science, AI, Web Development)"
                                style={styles.input}
                                id="career-interests-input"
                            />
                            <button
                                style={styles.button}
                                onClick={() => {
                                    const interests = (document.getElementById('career-interests-input') as HTMLInputElement).value;
                                    getCareerGuidance(interests);
                                }}
                            >
                                Get Guidance
                            </button>
                        </div>

                        {careerGuidance && (
                            <div style={styles.careerCard}>
                                <h3>🎯 Recommended Careers</h3>
                                {careerGuidance.recommended_careers?.map((career: any, idx: number) => (
                                    <div key={idx} style={styles.careerItem}>
                                        <h4>{career.title}</h4>
                                        <p>Match: {career.match_score}%</p>
                                        <p>{career.why}</p>
                                        <p style={styles.salary}>💰 {career.salary_range}</p>
                                    </div>
                                ))}

                                <h3>📊 Skill Gaps</h3>
                                <div style={styles.skillGaps}>
                                    {careerGuidance.skill_gaps?.map((skill: string, idx: number) => (
                                        <span key={idx} style={styles.skillBadge}>{skill}</span>
                                    ))}
                                </div>

                                <h3>🛤️ Learning Path</h3>
                                <ol>
                                    {careerGuidance.learning_path?.map((step: string, idx: number) => (
                                        <li key={idx} style={styles.pathItem}>{step}</li>
                                    ))}
                                </ol>

                                <h3>📈 Market Outlook</h3>
                                <p style={styles.outlook}>{careerGuidance.market_outlook}</p>

                                {careerGuidance.ai_powered && (
                                    <div style={styles.aiTag}>
                                        ✨ Powered by {careerGuidance.model || 'Gemini AI'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* AI Chatbot Tab */}
                {activeTab === 'chat' && (
                    <div style={styles.chatPanel}>
                        <h2>💬 AI Assistant</h2>

                        <div style={styles.chatMessages}>
                            {chatMessages.length === 0 && (
                                <div style={styles.chatWelcome}>
                                    <h3>👋 Hello! I'm your AI assistant</h3>
                                    <p>Ask me about:</p>
                                    <ul>
                                        <li>Course recommendations</li>
                                        <li>Career guidance</li>
                                        <li>Study tips</li>
                                        <li>Scholarship information</li>
                                        <li>Admission advice</li>
                                    </ul>
                                </div>
                            )}

                            {chatMessages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}
                                >
                                    <strong>{msg.role === 'user' ? 'You' : '🤖 AI'}:</strong>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                        </div>

                        <div style={styles.chatInput}>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                style={styles.input}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                            />
                            <button style={styles.button} onClick={sendChatMessage}>
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function for risk level styling
const getRiskStyle = (riskLevel: string) => {
    const styles = {
        low: {color: '#10b981', fontWeight: 'bold'},
        medium: {color: '#f59e0b', fontWeight: 'bold'},
        high: {color: '#ef4444', fontWeight: 'bold'},
    };
    return styles[riskLevel as keyof typeof styles] || styles.medium;
};

// Styles
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px',
    },
    aiStatus: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
    },
    statusActive: {
        background: '#10b981',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
    },
    statusInactive: {
        background: '#f59e0b',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
    },
    modelInfo: {
        fontSize: '14px',
        opacity: 0.9,
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        overflowX: 'auto',
    },
    tab: {
        padding: '12px 24px',
        border: '2px solid #e5e7eb',
        background: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    } as React.CSSProperties,
    tabActive: {
        padding: '12px 24px',
        border: '2px solid #667eea',
        background: '#667eea',
        color: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    } as React.CSSProperties,
    loading: {
        textAlign: 'center' as const,
        padding: '40px',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f4f6',
        borderTop: '5px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
    },
    content: {
        minHeight: '400px',
    },
    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        padding: '30px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.3s, box-shadow 0.3s',
    } as React.CSSProperties,
    button: {
        padding: '10px 20px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    } as React.CSSProperties,
    analysisPanel: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    riskCard: {
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    section: {
        marginBottom: '20px',
    },
    strengthItem: {
        color: '#10b981',
        marginBottom: '8px',
    },
    concernItem: {
        color: '#f59e0b',
        marginBottom: '8px',
    },
    recommendationItem: {
        color: '#667eea',
        marginBottom: '8px',
    },
    aiTag: {
        marginTop: '20px',
        padding: '10px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '8px',
        textAlign: 'center' as const,
        fontSize: '14px',
    },
    learningPanel: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    inputGroup: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap' as const,
    },
    input: {
        flex: 1,
        minWidth: '200px',
        padding: '12px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '16px',
    } as React.CSSProperties,
    select: {
        padding: '12px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '16px',
    } as React.CSSProperties,
    contentCard: {
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
    },
    explanation: {
        lineHeight: '1.8',
        marginBottom: '20px',
    },
    questionItem: {
        marginBottom: '10px',
        color: '#374151',
    },
    exampleItem: {
        marginBottom: '10px',
        color: '#6b7280',
    },
    nextTopics: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap' as const,
    },
    topicBadge: {
        padding: '8px 16px',
        background: '#667eea',
        color: 'white',
        borderRadius: '20px',
        fontSize: '14px',
    },
    quizPanel: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    quizCard: {
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
    },
    questionCard: {
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    options: {
        marginTop: '10px',
    },
    option: {
        padding: '10px',
        marginBottom: '8px',
        background: '#f9fafb',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    hint: {
        color: '#6b7280',
        fontSize: '14px',
        marginTop: '10px',
    },
    submitButton: {
        padding: '12px 40px',
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '20px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    careerPanel: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    careerCard: {
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
    },
    careerItem: {
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    salary: {
        color: '#10b981',
        fontWeight: 'bold',
    },
    skillGaps: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap' as const,
        marginBottom: '20px',
    },
    skillBadge: {
        padding: '8px 16px',
        background: '#fef3c7',
        color: '#92400e',
        borderRadius: '20px',
        fontSize: '14px',
    },
    pathItem: {
        marginBottom: '10px',
        color: '#374151',
        lineHeight: '1.6',
    },
    outlook: {
        padding: '15px',
        background: 'white',
        borderRadius: '8px',
        color: '#374151',
        lineHeight: '1.6',
    },
    chatPanel: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        height: '600px',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    chatMessages: {
        flex: 1,
        overflowY: 'auto' as const,
        marginBottom: '20px',
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
    },
    chatWelcome: {
        textAlign: 'center' as const,
        color: '#6b7280',
    },
    userMessage: {
        padding: '12px',
        background: '#667eea',
        color: 'white',
        borderRadius: '12px',
        marginBottom: '10px',
        maxWidth: '80%',
        marginLeft: 'auto',
    },
    aiMessage: {
        padding: '12px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        marginBottom: '10px',
        maxWidth: '80%',
    },
    chatInput: {
        display: 'flex',
        gap: '10px',
    },
};

export default StudentAIDashboard;
