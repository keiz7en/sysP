const API_BASE_URL = 'http://localhost:8000/api'
const API_BASE = API_BASE_URL // Add this for compatibility

const getAuthHeaders = (token: string | null) => ({
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
})

export const studentAPI = {
    getDashboard: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/students/dashboard/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch student dashboard')
        }
        return response.json()
    },

    getStudentDashboard: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/dashboard/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch student dashboard')
        }
        return response.json()
    },

    getAcademicRecords: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/students/academic-records/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch academic records')
        }
        return response.json()
    },

    getAdaptiveLearning: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/students/adaptive-learning/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch adaptive learning data')
        }
        return response.json()
    },

    getCareerGuidance: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/students/career-guidance/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch career guidance data')
        }
        return response.json()
    },

    getAssessments: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/students/assessments/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch assessments')
        }
        return response.json()
    },

    getLearningInsights: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/students/learning-insights/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch learning insights')
        }
        return response.json()
    }
}

export const teacherAPI = {
    getDashboard: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/teachers/dashboard/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch teacher dashboard')
        }
        return response.json()
    },

    getTeacherDashboard: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/dashboard/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch teacher dashboard')
        }
        return response.json()
    },

    getStudents: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/teachers/students/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch students')
        }
        return response.json()
    },

    getCourses: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/teachers/courses/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch courses')
        }
        return response.json()
    },

    getPendingStudents: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/pending-students/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch pending students')
        }
        return response.json()
    },

    approveStudent: async (token: string, studentId: number) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/approve-student/${studentId}/`, {
            method: 'POST',
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to approve student')
        }
        return response.json()
    },

    rejectStudent: async (token: string, studentId: number, rejectionReason: string) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/reject-student/${studentId}/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({rejection_reason: rejectionReason})
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to reject student')
        }
        return response.json()
    },

    addStudent: async (token: string, studentData: any) => {
        const response = await fetch(`${API_BASE_URL}/teachers/students/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(studentData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to add student')
        }
        return response.json()
    },

    removeStudent: async (token: string, studentId: string) => {
        const response = await fetch(`${API_BASE_URL}/teachers/students/remove/${studentId}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to remove student')
        }
        return response.json()
    },

    bulkUploadStudents: async (token: string, uploadData: any) => {
        const response = await fetch(`${API_BASE_URL}/teachers/students/bulk-upload/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(uploadData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to bulk upload students')
        }
        return response.json()
    }
}

export const adminAPI = {
    getDashboard: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/dashboard/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch admin dashboard')
        }
        return response.json()
    },

    getAdminDashboard: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/dashboard/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch admin dashboard')
        }
        return response.json()
    },

    getPendingTeachers: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/pending-teachers/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch pending teachers')
        }
        return response.json()
    },

    getPendingStudents: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/pending-students/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch pending students')
        }
        return response.json()
    },

    getAllUsers: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/all-users/`, {
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch all users')
        }
        return response.json()
    },

    toggleUserStatus: async (token: string, userId: number, isActive: boolean) => {
        const response = await fetch(`${API_BASE_URL}/users/toggle-status/${userId}/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({is_active: isActive})
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to toggle user status')
        }
        return response.json()
    },

    approveTeacher: async (token: string, teacherId: number, adminNotes?: string) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/approve-teacher/${teacherId}/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({admin_notes: adminNotes})
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to approve teacher')
        }
        return response.json()
    },

    rejectTeacher: async (token: string, teacherId: number, rejectionReason: string, adminNotes?: string) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/reject-teacher/${teacherId}/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({
                rejection_reason: rejectionReason,
                admin_notes: adminNotes || rejectionReason
            })
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to reject teacher')
        }
        return response.json()
    },

    approveStudent: async (token: string, studentId: number) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/approve-student/${studentId}/`, {
            method: 'POST',
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to approve student')
        }
        return response.json()
    },

    rejectStudent: async (token: string, studentId: number, rejectionReason: string) => {
        const response = await fetch(`${API_BASE_URL}/users/admin/reject-student/${studentId}/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({rejection_reason: rejectionReason})
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to reject student')
        }
        return response.json()
    }
}

export const userAPI = {
    verifyToken: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/verify-token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({token})
        })
        if (!response.ok) {
            throw new Error('Token verification failed')
        }
        return response.json()
    },

    login: async (username: string, password: string, userType: string) => {
        const response = await fetch(`${API_BASE_URL}/users/login/`, {
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
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Login failed')
        }
        return response.json()
    },

    register: async (userData: any) => {
        const response = await fetch(`${API_BASE_URL}/users/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Registration failed')
        }
        return response.json()
    },

    logout: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/users/logout/`, {
            method: 'POST',
            headers: getAuthHeaders(token)
        })
        if (!response.ok) {
            throw new Error('Logout failed')
        }
        return response.json()
    },

    updateProfile: async (token: string, profileData: any) => {
        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(profileData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to update profile')
        }
        return response.json()
    },

    changePassword: async (token: string, passwordData: {
        current_password: string
        new_password: string
        confirm_password: string
    }) => {
        const response = await fetch(`${API_BASE_URL}/users/change-password/`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(passwordData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to change password')
        }
        return response.json()
    },

    deleteAccount: async (token: string, confirmation: string) => {
        const response = await fetch(`${API_BASE_URL}/users/delete-account/`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
            body: JSON.stringify({confirmation})
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to delete account')
        }
        return response.json()
    },

    deleteUserAccount: async (token: string, userId: number, confirmation: string, reason?: string) => {
        const response = await fetch(`${API_BASE}/users/delete-user/${userId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                confirmation: confirmation,
                reason: reason || 'Account deleted by administrator'
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to delete user account')
        }

        return response.json()
    },

}

// ===========================
// COMPREHENSIVE EDUCATION & CAREER APIs - All Missing Features
// ===========================

// Enhanced Student APIs with AI Analysis
export const getStudentDashboard = async (token: string) => {
    return studentAPI.getDashboard(token)
}

export const getAcademicRecords = async (token: string) => {
    return studentAPI.getAcademicRecords(token)
}

export const getAcademicTranscript = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/students/transcript/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch transcript')
    return response.json()
}

export const getAIProgressAnalysis = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/students/ai-analysis/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch AI analysis')
    return response.json()
}

export const getPersonalizedLearningPath = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/students/learning-path/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch learning path')
    return response.json()
}

export const getEngagementAnalytics = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/students/engagement/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch engagement analytics')
    return response.json()
}

export const getAssessments = async (token: string) => {
    return studentAPI.getAssessments(token)
}

export const getCareerGuidance = async (token: string) => {
    return studentAPI.getCareerGuidance(token)
}

// Enhanced Teacher APIs with AI Features
export const getTeacherDashboard = async (token: string) => {
    return teacherAPI.getDashboard(token)
}

export const getTeachingAnalytics = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/teaching-analytics/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch teaching analytics')
    return response.json()
}

export const getStudentPerformanceInsights = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/performance-insights/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch performance insights')
    return response.json()
}

export const getAIContentOptions = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/ai-content/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch AI content options')
    return response.json()
}

export const generateAIContent = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/teachers/ai-content/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to generate AI content')
    return response.json()
}

export const speechToTextTranscription = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/teachers/speech-to-text/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to process speech-to-text')
    return response.json()
}

export const getAssessmentTools = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/assessment-tools/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch assessment tools')
    return response.json()
}

export const generateAIAssessment = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/teachers/assessment-tools/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to generate AI assessment')
    return response.json()
}

export const getTeachingResources = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/teaching-resources/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch teaching resources')
    return response.json()
}

// Career Guidance & Job Matching APIs
export const analyzeResumeWithAI = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/career/ai-resume-analysis/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to analyze resume')
    return response.json()
}

export const getSkillGapAnalysis = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/career/skill-gap-analysis/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch skill gap analysis')
    return response.json()
}

export const getCareerRecommendations = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/career/career-recommendations/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch career recommendations')
    return response.json()
}

export const getTrainingPrograms = async (token: string, params?: any) => {
    const queryParams = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/career/training-programs/${queryParams}`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch training programs')
    return response.json()
}

export const getMarketInsights = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/career/market-insights/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch market insights')
    return response.json()
}

// Admin System Analytics APIs
export const getSystemAnalytics = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-analytics/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch system analytics')
    return response.json()
}

export const getInstitutionalInsights = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/institutional-insights/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch institutional insights')
    return response.json()
}

// Research & Policy APIs
export const getDropoutPredictions = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/research/dropout-predictions/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch dropout predictions')
    return response.json()
}

export const getPerformanceTrends = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/research/performance-trends/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch performance trends')
    return response.json()
}

// Accessibility & Engagement APIs
export const getAccessibilityFeatures = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/accessibility/features/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch accessibility features')
    return response.json()
}

export const processVoiceInput = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/accessibility/voice-recognition/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to process voice input')
    return response.json()
}

// Gamification APIs
export const getGamificationProgress = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/students/gamification/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch gamification progress')
    return response.json()
}

// Automated Systems APIs
export const processOCRGrading = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/automation/ocr-grading/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to process OCR grading')
    return response.json()
}

export const getAutomatedEssayScoring = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/automation/essay-scoring/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to get automated essay scoring')
    return response.json()
}

// Chatbot & AI Assistance APIs
export const sendChatMessage = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/message/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to send chat message')
    return response.json()
}

export const getChatHistory = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/history/`, {
        headers: getAuthHeaders(token)
    })
    if (!response.ok) throw new Error('Failed to fetch chat history')
    return response.json()
}

export const getAcademicAdvice = async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/academic-advice/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to get academic advice')
    return response.json()
}
