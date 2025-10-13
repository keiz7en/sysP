import React, {useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import toast from 'react-hot-toast'
import {useAuth, RegisterData} from '../contexts/AuthContext'

const AuthScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [userType, setUserType] = useState<'student' | 'teacher'>('student')
    const [isLoading, setIsLoading] = useState(false)
    const {login, register} = useAuth()

    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    })

    // Registration form state
    const [registerForm, setRegisterForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Student specific
        studentId: '',
        major: '',
        year: '',
        // Teacher specific
        teacherId: '',
        department: '',
        expertise: [] as string[]
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!loginForm.email || !loginForm.password) {
            toast.error('Please fill in all fields')
            return
        }

        setIsLoading(true)
        const success = await login(loginForm.email, loginForm.password, userType)
        setIsLoading(false)

        if (!success) {
            // Show demo credentials hint
            toast.info(`Demo ${userType} credentials: ${userType}@demo.com / any password`)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.password) {
            toast.error('Please fill in all required fields')
            return
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (registerForm.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        const userData: RegisterData = {
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            email: registerForm.email,
            password: registerForm.password,
            userType,
            ...(userType === 'student' ? {
                studentId: registerForm.studentId,
                major: registerForm.major,
                year: registerForm.year
            } : {
                teacherId: registerForm.teacherId,
                department: registerForm.department,
                expertise: registerForm.expertise
            })
        }

        setIsLoading(true)
        const success = await register(userData)
        setIsLoading(false)
    }

    const loadDemoCredentials = () => {
        setLoginForm({
            email: userType === 'student' ? 'student@demo.com' : 'teacher@demo.com',
            password: 'demo123'
        })
        toast.info('Demo credentials loaded!')
    }

    const majors = [
        'Computer Science', 'Business Administration', 'Engineering', 'Mathematics',
        'Physics', 'Biology', 'Psychology', 'Art & Design', 'Literature', 'Medicine'
    ]

    const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']

    const departments = [
        'Computer Science', 'Mathematics', 'Physics', 'Business', 'Engineering',
        'Biology', 'Psychology', 'Art & Design', 'Literature', 'Medicine'
    ]

    const expertiseOptions = [
        'Machine Learning', 'AI', 'Statistics', 'Web Development', 'Mobile Development',
        'Data Science', 'Cybersecurity', 'Cloud Computing', 'Teaching Methodology', 'Research'
    ]

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            <motion.div
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '3rem',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                }}
            >
                {/* Header */}
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🎓 EduAI System
                    </h1>
                    <p style={{color: '#64748b', fontSize: '1.1rem'}}>
                        {isLogin ? 'Welcome back!' : 'Create your account'}
                    </p>
                </div>

                {/* Auth Toggle */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '2rem'
                }}>
                    <button
                        onClick={() => setIsLogin(true)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: isLogin ? '#6366f1' : 'transparent',
                            color: isLogin ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: !isLogin ? '#6366f1' : 'transparent',
                            color: !isLogin ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {/* User Type Selection */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '2rem'
                }}>
                    <button
                        onClick={() => setUserType('student')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: userType === 'student' ? '#10b981' : 'transparent',
                            color: userType === 'student' ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        🎓 Student
                    </button>
                    <button
                        onClick={() => setUserType('teacher')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: userType === 'teacher' ? '#ec4899' : 'transparent',
                            color: userType === 'teacher' ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        👨‍🏫 Teacher
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {isLogin ? (
                        /* Login Form */
                        <motion.form
                            key="login"
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: 20}}
                            onSubmit={handleLogin}
                            style={{display: 'grid', gap: '1rem'}}
                        >
                            <input
                                type="email"
                                placeholder="Email address"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: isLoading ? '#94a3b8' : '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    marginTop: '0.5rem'
                                }}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>

                            <button
                                type="button"
                                onClick={loadDemoCredentials}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'transparent',
                                    color: '#6366f1',
                                    border: '2px solid #6366f1',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                🚀 Load Demo Credentials
                            </button>
                        </motion.form>
                    ) : (
                        /* Registration Form */
                        <motion.form
                            key="register"
                            initial={{opacity: 0, x: 20}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: -20}}
                            onSubmit={handleRegister}
                            style={{display: 'grid', gap: '1rem'}}
                        >
                            {/* Basic Info */}
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={registerForm.firstName}
                                    onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                                    style={{
                                        padding: '16px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '16px'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={registerForm.lastName}
                                    onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                                    style={{
                                        padding: '16px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <input
                                type="email"
                                placeholder="Email address"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                    style={{
                                        padding: '16px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '16px'
                                    }}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={registerForm.confirmPassword}
                                    onChange={(e) => setRegisterForm({
                                        ...registerForm,
                                        confirmPassword: e.target.value
                                    })}
                                    style={{
                                        padding: '16px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            {/* User Type Specific Fields */}
                            {userType === 'student' ? (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Student ID (optional)"
                                        value={registerForm.studentId}
                                        onChange={(e) => setRegisterForm({...registerForm, studentId: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                        <select
                                            value={registerForm.major}
                                            onChange={(e) => setRegisterForm({...registerForm, major: e.target.value})}
                                            style={{
                                                padding: '16px',
                                                border: '2px solid #e2e8f0',
                                                borderRadius: '12px',
                                                fontSize: '16px'
                                            }}
                                        >
                                            <option value="">Select Major</option>
                                            {majors.map(major => (
                                                <option key={major} value={major}>{major}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={registerForm.year}
                                            onChange={(e) => setRegisterForm({...registerForm, year: e.target.value})}
                                            style={{
                                                padding: '16px',
                                                border: '2px solid #e2e8f0',
                                                borderRadius: '12px',
                                                fontSize: '16px'
                                            }}
                                        >
                                            <option value="">Select Year</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Teacher ID (optional)"
                                        value={registerForm.teacherId}
                                        onChange={(e) => setRegisterForm({...registerForm, teacherId: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <select
                                        value={registerForm.department}
                                        onChange={(e) => setRegisterForm({...registerForm, department: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: isLoading ? '#94a3b8' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    marginTop: '0.5rem'
                                }}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                }}>
                    <p style={{color: '#64748b', fontSize: '0.9rem', margin: 0}}>
                        🚀 Demo Mode: Any credentials work for existing accounts
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default AuthScreen