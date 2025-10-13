import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react'
import toast from 'react-hot-toast'

// User types and interfaces
export interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    user_type: 'student' | 'teacher' | 'admin'
    phone_number?: string
    address?: string
    is_verified: boolean
    created_at: string
    // Student specific fields
    student_id?: string
    current_gpa?: number
    grade_level?: string
    academic_status?: string
    // Teacher specific fields
    employee_id?: string
    department?: string
    teaching_rating?: number
    experience_years?: number
    // Computed fields
    name?: string
    role?: string
}

export interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (username: string, password: string, userType: 'student' | 'teacher' | 'admin') => Promise<boolean>
    register: (userData: RegisterData) => Promise<boolean>
    logout: () => void
    updateProfile: (data: Partial<User>) => Promise<boolean>
}

export interface RegisterData {
    username: string
    email: string
    password: string
    first_name: string
    last_name: string
    user_type: 'student' | 'teacher' | 'admin'
    phone_number?: string
    address?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Demo accounts for testing
    const getDemoUsers = (): User[] => {
        return [
            {
                id: 1,
                username: 'student_demo',
                email: 'student@demo.com',
                first_name: 'Sarah',
                last_name: 'Johnson',
                user_type: 'student',
                phone_number: '+1-555-0101',
                address: '123 Student St, College City',
                is_verified: true,
                created_at: '2023-01-15T10:00:00Z',
                student_id: '12345',
                current_gpa: 3.85,
                grade_level: 'Sophomore',
                academic_status: 'active',
                name: 'Sarah Johnson',
                role: 'student'
            },
            {
                id: 2,
                username: 'teacher_demo',
                email: 'teacher@demo.com',
                first_name: 'Dr. Emily',
                last_name: 'Carter',
                user_type: 'teacher',
                phone_number: '+1-555-0102',
                address: '456 Faculty Ave, University Town',
                is_verified: true,
                created_at: '2023-01-10T10:00:00Z',
                employee_id: 'EMP1001',
                department: 'Computer Science',
                teaching_rating: 4.8,
                experience_years: 8,
                name: 'Dr. Emily Carter',
                role: 'teacher'
            },
            {
                id: 3,
                username: 'admin_demo',
                email: 'admin@demo.com',
                first_name: 'John',
                last_name: 'Administrator',
                user_type: 'admin',
                phone_number: '+1-555-0103',
                address: '789 Admin Blvd, Campus Center',
                is_verified: true,
                created_at: '2023-01-01T10:00:00Z',
                name: 'John Administrator',
                role: 'admin'
            }
        ]
    }

    // Check for demo mode or backend
    const isDemo = () => {
        return localStorage.getItem('eduai_demo_mode') === 'true' ||
            !process.env.REACT_APP_API_URL ||
            process.env.NODE_ENV === 'development'
    }

    // Get existing demo users from localStorage
    const getExistingDemoUsers = (): User[] => {
        try {
            const existing = localStorage.getItem('eduai_demo_users')
            return existing ? JSON.parse(existing) : getDemoUsers()
        } catch {
            return getDemoUsers()
        }
    }

    // Save demo users to localStorage
    const saveDemoUsers = (users: User[]) => {
        localStorage.setItem('eduai_demo_users', JSON.stringify(users))
    }

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true)

            // Check for demo mode first
            if (isDemo()) {
                const savedUser = localStorage.getItem('eduai_current_user')
                if (savedUser) {
                    try {
                        const userData = JSON.parse(savedUser)
                        setUser(userData)
                    } catch {
                        localStorage.removeItem('eduai_current_user')
                    }
                }
                return
            }

            // Check backend authentication
            const token = localStorage.getItem('auth_token')
            if (token) {
                try {
                    const response = await fetch('http://localhost:8000/api/users/verify-token/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({token})
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.valid) {
                            const processedUser = {
                                ...data.user,
                                name: `${data.user.first_name} ${data.user.last_name}`,
                                role: data.user.user_type
                            }
                            setUser(processedUser)
                        } else {
                            localStorage.removeItem('auth_token')
                        }
                    } else {
                        localStorage.removeItem('auth_token')
                    }
                } catch (error) {
                    console.log('Backend not available, switching to demo mode')
                    localStorage.setItem('eduai_demo_mode', 'true')
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('auth_token')
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (username: string, password: string, userType: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
        try {
            setIsLoading(true)

            // Always try demo mode first if backend is not available or in development
            const demoUsers = getExistingDemoUsers()
            const foundUser = demoUsers.find(u =>
                (u.username === username || u.email === username) &&
                u.user_type === userType
            )

            if (foundUser) {
                setUser(foundUser)
                localStorage.setItem('eduai_current_user', JSON.stringify(foundUser))
                localStorage.setItem('eduai_demo_mode', 'true')
                toast.success(`Welcome back, ${foundUser.first_name}!`)
                return true
            }

            // If not found in demo and not in demo mode, try backend
            if (!isDemo()) {
                try {
                    const response = await fetch('http://localhost:8000/api/users/login/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username,
                            password,
                            user_type: userType
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        const processedUser = {
                            ...data.user,
                            name: `${data.user.first_name} ${data.user.last_name}`,
                            role: data.user.user_type
                        }

                        setUser(processedUser)
                        localStorage.setItem('auth_token', data.token)
                        localStorage.removeItem('eduai_demo_mode')
                        toast.success(data.message)
                        return true
                    } else {
                        const errorData = await response.json()
                        toast.error(errorData.error || 'Login failed')
                        return false
                    }
                } catch (error) {
                    console.log('Backend login failed, switching to demo mode')
                    localStorage.setItem('eduai_demo_mode', 'true')
                }
            }

            toast.error('Invalid credentials. Try demo accounts: student@demo.com, teacher@demo.com, or admin@demo.com')
            return false

        } catch (error) {
            console.error('Login error:', error)
            toast.error('Login failed. Please try again.')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            setIsLoading(true)

            // Validate input data
            if (!userData.username || !userData.email || !userData.first_name || !userData.last_name || !userData.password) {
                toast.error('Please fill in all required fields')
                return false
            }

            if (userData.password.length < 6) {
                toast.error('Password must be at least 6 characters long')
                return false
            }

            // Check if username or email already exists in demo users
            const existingUsers = getExistingDemoUsers()
            const usernameExists = existingUsers.some(u =>
                u.username.toLowerCase() === userData.username.toLowerCase()
            )
            const emailExists = existingUsers.some(u =>
                u.email.toLowerCase() === userData.email.toLowerCase()
            )

            if (usernameExists) {
                toast.error('Username already exists. Please choose a different username.')
                return false
            }

            if (emailExists) {
                toast.error('Email already registered. Please use a different email address.')
                return false
            }

            // Demo mode registration (always works)
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newUser: User = {
                id: Date.now(),
                username: userData.username,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                user_type: userData.user_type,
                phone_number: userData.phone_number || '',
                address: userData.address || '',
                is_verified: true,
                created_at: new Date().toISOString(),
                name: `${userData.first_name} ${userData.last_name}`,
                role: userData.user_type
            }

            // Add type-specific fields
            if (userData.user_type === 'student') {
                newUser.student_id = Math.floor(Math.random() * 90000 + 10000).toString()
                newUser.current_gpa = 0.0
                newUser.grade_level = 'Freshman'
                newUser.academic_status = 'active'
            } else if (userData.user_type === 'teacher') {
                newUser.employee_id = `EMP${Math.floor(Math.random() * 9000 + 1000)}`
                newUser.department = 'General'
                newUser.teaching_rating = 0.0
                newUser.experience_years = 0
            }

            // Add new user to existing demo users
            const updatedDemoUsers = [...existingUsers, newUser]
            saveDemoUsers(updatedDemoUsers)

            // Set as current user
            setUser(newUser)
            localStorage.setItem('eduai_current_user', JSON.stringify(newUser))
            localStorage.setItem('eduai_demo_mode', 'true')

            toast.success(`Account created successfully! Welcome to EduAI, ${newUser.first_name}!`)
            return true

        } catch (error) {
            console.error('Registration error:', error)
            toast.error('Registration failed. Please try again.')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            // Demo mode logout
            if (isDemo()) {
                setUser(null)
                localStorage.removeItem('eduai_current_user')
                localStorage.removeItem('eduai_demo_mode')
                toast.success('Logged out successfully')
                return
            }

            // Backend logout
            const token = localStorage.getItem('auth_token')
            if (token) {
                try {
                    await fetch('http://localhost:8000/api/users/logout/', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json',
                        }
                    })
                } catch (error) {
                    console.log('Backend logout failed, clearing local data')
                }
            }

            setUser(null)
            localStorage.removeItem('auth_token')
            toast.success('Logged out successfully')
        } catch (error) {
            console.error('Logout error:', error)
            setUser(null)
            localStorage.removeItem('auth_token')
            toast.success('Logged out successfully')
        }
    }

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        try {
            if (!user) return false
            setIsLoading(true)

            // Demo mode update
            if (isDemo()) {
                await new Promise(resolve => setTimeout(resolve, 500))
                const updatedUser = {
                    ...user,
                    ...data,
                    name: `${data.first_name || user.first_name} ${data.last_name || user.last_name}`
                }

                // Update in demo users list
                const existingUsers = getExistingDemoUsers()
                const updatedUsers = existingUsers.map(u =>
                    u.id === user.id ? updatedUser : u
                )
                saveDemoUsers(updatedUsers)

                setUser(updatedUser)
                localStorage.setItem('eduai_current_user', JSON.stringify(updatedUser))
                toast.success('Profile updated successfully')
                return true
            }

            // Backend update
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/users/profile/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                const updatedUser = {...user, ...data}
                setUser(updatedUser)
                toast.success('Profile updated successfully')
                return true
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to update profile')
                return false
            }
        } catch (error) {
            console.error('Update profile error:', error)
            toast.error('Failed to update profile')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}