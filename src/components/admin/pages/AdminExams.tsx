import React from 'react'
import TeacherExams from '../../teacher/pages/TeacherExams'

// Admin has same exam management powers as teachers
// They can create, publish, and manage all exams in the system
const AdminExams: React.FC = () => {
    return <TeacherExams/>
}

export default AdminExams
