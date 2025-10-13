import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react'
import toast from 'react-hot-toast'

// User types and interfaces
export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    userType: 'student' | 'teacher'
    profilePicture?: string
    createdAt: string
    lastLogin: string
    isActive: boolean
    // Student specific fields
    studentId?: string
    major?: string
    year?: string
    gpa?: number
    // Teacher specific fields
    teacherId?: string
    department?: string
    expertise?: string[]
    yearsExperience?: number
}

export interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string, userType: 'student' | 'teacher') => Promise<boolean>
    register: (userData: RegisterData) => Promise<boolean>
    logout: () => void
    updateProfile: (data: Partial<User>) => Promise<boolean>
}

export interface RegisterData {
    email: string
    password: string
    firstName: string
    lastName: string
    userType: 'student' | 'teacher'
    // Student specific
    studentId?: string
    major?: string
    year?: string
    // Teacher specific
    teacherId?: string
    department?: string
    expertise?: string[]
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

    // Mock database for demo purposes
    const getMockUsers = (): User[] => {
        const saved = localStorage.getItem('eduai_mock_users')
        if (saved) {
            return JSON.parse(saved)
        }
        // Default demo users
        const defaultUsers: User[] = [
            {
                id: 'student_1',
                email: 'student@demo.com',
                firstName: 'Sarah',
                lastName: 'Johnson',
                userType: 'student',
                profilePicture: '👩‍🎓',
                createdAt: '2023-01-15T10:00:00Z',
                lastLogin: new Date().toISOString(),
                isActive: true,
                studentId: 'ST2023001',
                major: 'Computer Science',
                year: 'Sophomore',
                gpa: 3.85
            },
            {
                id: 'teacher_1',
                email: 'teacher@demo.com',
                firstName: 'Dr. Emily',
                lastName: 'Carter',
                userType: 'teacher',
                profilePicture: '👩‍🏫',
                createdAt: '2023-01-10T10:00:00Z',
                lastLogin: new Date().toISOString(),
                isActive: true,
                teacherId: 'T2023001',
                department: 'Computer Science',
                expertise: ['Machine Learning', 'AI', 'Statistics'],
                yearsExperience: 8
            }
        ]
        localStorage.setItem('eduai_mock_users', JSON.stringify(defaultUsers))
        return defaultUsers
    }

    const saveMockUsers = (users: User[]) => {
        localStorage.setItem('eduai_mock_users', JSON.stringify(users))
    }

    useEffect(() => {
        // Check for existing session
        const savedUser = localStorage.getItem('eduai_current_user')
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser)
                setUser(userData)
                // Update last login
                const users = getMockUsers()
                const updatedUsers = users.map(u =>
                    u.id === userData.id ? {...u, lastLogin: new Date().toISOString()} : u
                )
                saveMockUsers(updatedUsers)
            } catch (error) {
                console.error('Error parsing saved user:', error)
                localStorage.removeItem('eduai_current_user')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string, userType: 'student' | 'teacher'): Promise<boolean> => {
        try {
            setIsLoading(true)

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            const users = getMockUsers()
            const foundUser = users.find(u =>
                u.email.toLowerCase() === email.toLowerCase() &&
                u.userType === userType
            )

            if (foundUser) {
                // Update last login
                const updatedUser = {...foundUser, lastLogin: new Date().toISOString()}
                const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u)
                saveMockUsers(updatedUsers)

                setUser(updatedUser)
                localStorage.setItem('eduai_current_user', JSON.stringify(updatedUser))

                toast.success(`Welcome back, ${foundUser.firstName}!`)
                return true
            } else {
                toast.error('Invalid credentials or user type')
                return false
            }
        } catch (error) {
            toast.error('Login failed. Please try again.')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            setIsLoading(true)

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            const users = getMockUsers()

            // Check if user already exists
            const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())
            if (existingUser) {
                toast.error('User with this email already exists')
                return false
            }

            // Create new user
            const newUser: User = {
                id: `${userData.userType}_${Date.now()}`,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                userType: userData.userType,
                profilePicture: userData.userType === 'student' ? '👨‍🎓' : '👨‍🏫',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
                // Add user type specific fields
                ...(userData.userType === 'student' ? {
                    studentId: userData.studentId || `ST${Date.now()}`,
                    major: userData.major || 'Undeclared',
                    year: userData.year || 'Freshman',
                    gpa: 0.0
                } : {
                    teacherId: userData.teacherId || `T${Date.now()}`,
                    department: userData.department || 'General',
                    expertise: userData.expertise || ['Teaching'],
                    yearsExperience: 0
                })
            }

            const updatedUsers = [...users, newUser]
            saveMockUsers(updatedUsers)

            setUser(newUser)
            localStorage.setItem('eduai_current_user', JSON.stringify(newUser))

            toast.success(`Account created successfully! Welcome, ${newUser.firstName}!`)
            return true
        } catch (error) {
            toast.error('Registration failed. Please try again.')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('eduai_current_user')
        toast.success('Logged out successfully')
    }

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        try {
            if (!user) return false

            setIsLoading(true)

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            const users = getMockUsers()
            const updatedUser = {...user, ...data}
            const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u)

            saveMockUsers(updatedUsers)
            setUser(updatedUser)
            localStorage.setItem('eduai_current_user', JSON.stringify(updatedUser))

            toast.success('Profile updated successfully')
            return true
        } catch (error) {
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