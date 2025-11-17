import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react'
import toast from 'react-hot-toast'
import {userAPI} from '../services/api'

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
    approval_status: 'pending' | 'approved' | 'rejected'
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
    name: string
    role: string
}

export interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (username: string, password: string, userType: 'student' | 'teacher' | 'admin') => Promise<boolean>
    register: (userData: {
        username: string
        first_name: string
        last_name: string
        email: string
        password: string
        user_type: 'student' | 'teacher' | 'admin'
        phone_number?: string
        address?: string
    }) => Promise<boolean>
    logout: () => void
    updateProfile: (data: Partial<User>) => Promise<boolean>
    changePassword: (passwordData: {
        current_password: string
        new_password: string
        confirm_password: string
    }) => Promise<boolean>
    deleteAccount: (confirmation: string) => Promise<boolean>
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
    // Student specific
    grade_level?: string
    guardian_name?: string
    guardian_phone?: string
    guardian_email?: string
    learning_style?: string
    // Teacher specific
    department?: string
    specialization?: string[]
    experience_years?: number
    qualifications?: string[]
    reason_for_joining?: string
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
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true)
            const storedToken = localStorage.getItem('auth_token')

            if (storedToken) {
                try {
                    const response = await userAPI.verifyToken(storedToken)
                    if (response.valid) {
                        const processedUser = {
                            ...response.user,
                            name: `${response.user.first_name} ${response.user.last_name}`,
                            role: response.user.user_type
                        }
                        setUser(processedUser)
                        setToken(storedToken)
                    } else {
                        // Token is invalid, clear it
                        localStorage.removeItem('auth_token')
                        setToken(null)
                        setUser(null)
                    }
                } catch (error) {
                    console.error('Token verification failed:', error)
                    // Clear invalid token
                    localStorage.removeItem('auth_token')
                    setToken(null)
                    setUser(null)
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setToken(null)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (username: string, password: string, userType: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
        try {
            setIsLoading(true)
            // Accepts all three user types: student, teacher, admin
            const response = await userAPI.login(username, password, userType)

            const processedUser = {
                ...response.user,
                name: `${response.user.first_name} ${response.user.last_name}`,
                role: response.user.user_type
            }

            setUser(processedUser)
            setToken(response.token)
            localStorage.setItem('auth_token', response.token)

            toast.success(response.message || `Welcome back, ${processedUser.first_name}!`)
            return true

        } catch (error: any) {
            const errorMessage = error.message || 'Login failed. Please try again.'

            // Handle specific approval status errors
            if (errorMessage.includes('pending approval')) {
                toast.error('Your account is pending approval. You will be notified when approved.', {
                    duration: 6000
                })
            } else if (errorMessage.includes('rejected')) {
                toast.error('Your account has been rejected. Please contact administrator.', {
                    duration: 6000
                })
            } else if (errorMessage.includes('not registered as a')) {
                toast.error('Please select the correct account type for your registered account.')
            } else {
                toast.error(errorMessage)
            }

            console.error('Login error:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (userData: {
        username: string
        first_name: string
        last_name: string
        email: string
        password: string
        user_type: 'student' | 'teacher' | 'admin'
        phone_number?: string
        address?: string
    }): Promise<boolean> => {
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

            const response = await userAPI.register(userData)

            // Handle registration response based on approval status
            if (response.approval_status === 'pending') {
                if (userData.user_type === 'student') {
                    toast.success(
                        'Registration successful! Your student account is pending approval from teachers/administrators. You will receive notification when approved.',
                        {duration: 8000}
                    )
                } else if (userData.user_type === 'teacher') {
                    toast.success(
                        'Registration successful! Your teacher application is being reviewed by administrators. You will be notified once approved.',
                        {duration: 8000}
                    )
                }

                // Don't auto-login for pending users
                return true
            } else if (response.approval_status === 'approved') {
                // Auto-login for approved users (like admins)
                const processedUser = {
                    ...response.user,
                    name: `${response.user.first_name} ${response.user.last_name}`,
                    role: response.user.user_type
                }

                setUser(processedUser)
                setToken(response.token)
                localStorage.setItem('auth_token', response.token)

                toast.success(`Account created successfully! Welcome to EduAI, ${processedUser.first_name}!`)
                return true
            }

            return true

        } catch (error: any) {
            const errorMessage = error.message || 'Registration failed. Please try again.'
            toast.error(errorMessage)
            console.error('Registration error:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            if (token) {
                try {
                    await userAPI.logout(token)
                } catch (error) {
                    console.log('Backend logout failed, clearing local data')
                }
            }

            setUser(null)
            setToken(null)
            localStorage.removeItem('auth_token')
            toast.success('Logged out successfully')
        } catch (error) {
            console.error('Logout error:', error)
            // Force clear even if backend fails
            setUser(null)
            setToken(null)
            localStorage.removeItem('auth_token')
            toast.success('Logged out successfully')
        }
    }

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        try {
            if (!user || !token) return false
            setIsLoading(true)

            await userAPI.updateProfile(token, data)

            const updatedUser = {
                ...user,
                ...data,
                name: `${data.first_name || user.first_name} ${data.last_name || user.last_name}`
            }

            setUser(updatedUser)
            toast.success('Profile updated successfully')
            return true
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update profile'
            toast.error(errorMessage)
            console.error('Update profile error:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const changePassword = async (passwordData: {
        current_password: string
        new_password: string
        confirm_password: string
    }): Promise<boolean> => {
        try {
            if (!user || !token) return false
            setIsLoading(true)

            if (passwordData.new_password.length < 6) {
                toast.error('New password must be at least 6 characters long')
                return false
            }

            if (passwordData.new_password !== passwordData.confirm_password) {
                toast.error('New password and confirm password do not match')
                return false
            }

            await userAPI.changePassword(token, passwordData)

            toast.success('Password changed successfully')
            return true
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to change password'
            toast.error(errorMessage)
            console.error('Change password error:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const deleteAccount = async (confirmation: string): Promise<boolean> => {
        try {
            if (!user || !token) return false
            setIsLoading(true)

            await userAPI.deleteAccount(token, confirmation)

            setUser(null)
            setToken(null)
            localStorage.removeItem('auth_token')
            toast.success('Account deleted successfully')
            return true
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to delete account'
            toast.error(errorMessage)
            console.error('Delete account error:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}