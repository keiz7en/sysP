import React, {useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import toast from 'react-hot-toast'
import {useAuth, RegisterData} from '../contexts/AuthContext'

const AuthScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [userType, setUserType] = useState<'student' | 'teacher' | 'admin'>('student')
    const [showAdminOption, setShowAdminOption] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const {login, register} = useAuth()

    // Login form state
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: ''
    })

    // Registration form state
    const [registerForm, setRegisterForm] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone_number: '',
        address: ''
    })

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateRegistration = (): boolean => {
        const newErrors: Record<string, string> = {}

        // Required field validation
        if (!registerForm.username.trim()) {
            newErrors.username = 'Username is required'
        } else if (registerForm.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores'
        }

        if (!registerForm.first_name.trim()) {
            newErrors.first_name = 'First name is required'
        }

        if (!registerForm.last_name.trim()) {
            newErrors.last_name = 'Last name is required'
        }

        if (!registerForm.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        if (!registerForm.password) {
            newErrors.password = 'Password is required'
        } else if (registerForm.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (!registerForm.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (registerForm.password !== registerForm.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!loginForm.username || !loginForm.password) {
            toast.error('Please fill in all fields')
            return
        }

        setIsLoading(true)
        try {
            const success = await login(loginForm.username, loginForm.password, userType)
            if (!success) {
                toast.error('Invalid credentials. Please check your username and password.')
            }
        } catch (error) {
            toast.error('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        // Clear previous errors
        setErrors({})

        // Validate form
        if (!validateRegistration()) {
            toast.error('Please fix the validation errors')
            return
        }

        const userData: RegisterData = {
            username: registerForm.username.trim(),
            first_name: registerForm.first_name.trim(),
            last_name: registerForm.last_name.trim(),
            email: registerForm.email.trim().toLowerCase(),
            password: registerForm.password,
            user_type: userType,
            phone_number: registerForm.phone_number.trim(),
            address: registerForm.address.trim()
        }

        setIsLoading(true)
        try {
            const success = await register(userData)
            if (success) {
                // Clear form on success
                setRegisterForm({
                    username: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone_number: '',
                    address: ''
                })
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const clearErrors = (field: string) => {
        if (errors[field]) {
            setErrors({...errors, [field]: ''})
        }
    }

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
                <div style={{textAlign: 'center', marginBottom: '2rem', position: 'relative'}}>
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
                    <button style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6366f1',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(10px)'
                    }}
                            onClick={() => {
                                setShowAdminOption(!showAdminOption)
                                if (!showAdminOption) {
                                    toast.success('Admin login option revealed!', {
                                        icon: '🔓',
                                        duration: 3000
                                    })
                                }
                            }}
                            onMouseEnter={(e) => {
                                const target = e.target as HTMLButtonElement
                                target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'
                                target.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                                const target = e.target as HTMLButtonElement
                                target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                                target.style.transform = 'scale(1)'
                            }}
                    >?
                    </button>
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
                        onClick={() => {
                            setIsLogin(true)
                            setErrors({})
                        }}
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
                        onClick={() => {
                            setIsLogin(false)
                            setErrors({})
                        }}
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
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '2rem',
                    gap: '4px'
                }}>
                    <button
                        onClick={() => setUserType('student')}
                        style={{
                            padding: '12px 8px',
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
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        🎓 Student
                    </button>
                    <button
                        onClick={() => setUserType('teacher')}
                        style={{
                            padding: '12px 8px',
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
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        👨‍🏫 Teacher
                    </button>
                    <button
                        onClick={() => {
                            setUserType('admin')
                            setShowAdminOption(true)
                        }}
                        style={{
                            padding: '12px 8px',
                            backgroundColor: userType === 'admin' ? '#6366f1' : 'transparent',
                            color: userType === 'admin' ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem',
                            visibility: showAdminOption ? 'visible' : 'hidden'
                        }}
                    >
                        👮 Admin
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
                                type="text"
                                placeholder="Username or Email"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
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
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isLoading && <span>⏳</span>}
                                {isLoading ? 'Signing In...' : 'Sign In'}
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
                            {/* Username */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={registerForm.username}
                                    onChange={(e) => {
                                        setRegisterForm({...registerForm, username: e.target.value})
                                        clearErrors('username')
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        border: `2px solid ${errors.username ? '#ef4444' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {errors.username && (
                                    <p style={{color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0'}}>
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Name Fields */}
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={registerForm.first_name}
                                        onChange={(e) => {
                                            setRegisterForm({...registerForm, first_name: e.target.value})
                                            clearErrors('first_name')
                                        }}
                                        style={{
                                            padding: '16px',
                                            border: `2px solid ${errors.first_name ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    {errors.first_name && (
                                        <p style={{color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0'}}>
                                            {errors.first_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={registerForm.last_name}
                                        onChange={(e) => {
                                            setRegisterForm({...registerForm, last_name: e.target.value})
                                            clearErrors('last_name')
                                        }}
                                        style={{
                                            padding: '16px',
                                            border: `2px solid ${errors.last_name ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    {errors.last_name && (
                                        <p style={{color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0'}}>
                                            {errors.last_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={registerForm.email}
                                    onChange={(e) => {
                                        setRegisterForm({...registerForm, email: e.target.value})
                                        clearErrors('email')
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        border: `2px solid ${errors.email ? '#ef4444' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {errors.email && (
                                    <p style={{color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0'}}>
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone and Address */}
                            <input
                                type="tel"
                                placeholder="Phone Number (optional)"
                                value={registerForm.phone_number}
                                onChange={(e) => setRegisterForm({...registerForm, phone_number: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <input
                                type="text"
                                placeholder="Address (optional)"
                                value={registerForm.address}
                                onChange={(e) => setRegisterForm({...registerForm, address: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />

                            {/* Password Fields */}
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={registerForm.password}
                                        onChange={(e) => {
                                            setRegisterForm({...registerForm, password: e.target.value})
                                            clearErrors('password')
                                        }}
                                        style={{
                                            padding: '16px',
                                            border: `2px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    {errors.password && (
                                        <p style={{color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0'}}>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={registerForm.confirmPassword}
                                        onChange={(e) => {
                                            setRegisterForm({...registerForm, confirmPassword: e.target.value})
                                            clearErrors('confirmPassword')
                                        }}
                                        style={{
                                            padding: '16px',
                                            border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    {errors.confirmPassword && (
                                        <p style={{color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0'}}>
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>

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
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isLoading && <span>⏳</span>}
                                {isLoading ? 'Creating Account...' : '✨ Create Account'}
                            </button>

                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Information Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                }}>
                    <p style={{color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>
                        🔐 <strong>Secure Registration Process</strong>
                    </p>
                    <div style={{display: 'grid', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b'}}>
                        <div>🎓 <strong>Students:</strong> Account requires teacher/admin approval</div>
                        <div>👨‍🏫 <strong>Teachers:</strong> Application reviewed by administrators</div>
                        <div style={{marginTop: '0.5rem', fontSize: '0.75rem', fontStyle: 'italic'}}>
                            All users will receive email notifications about their account status
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default AuthScreen