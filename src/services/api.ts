const API_BASE_URL = 'http://localhost:8000/api'

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
    }
}
