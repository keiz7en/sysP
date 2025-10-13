import React, { useState } from 'react'
import { motion } from 'framer-motion'

const StudentRecords: React.FC = () => {
    const [activeTab, setActiveTab] = useState('grades')

    const courses = [
        { name: 'Advanced Mathematics', grade: 'A-', credits: 4, semester: 'Fall 2024', progress: 95 },
        { name: 'Physics II', grade: 'B+', credits: 3, semester: 'Fall 2024', progress: 88 },
        { name: 'Computer Science', grade: 'A', credits: 4, semester: 'Fall 2024', progress: 98 },
        { name: 'English Literature', grade: 'B', credits: 3, semester: 'Fall 2024', progress: 85 },
        { name: 'Chemistry', grade: 'A-', credits: 4, semester: 'Spring 2024', progress: 92 }
    ]

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊 Academic Records</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Track your grades, view transcripts, and get AI-powered academic insights
            </p>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginBottom: '1rem' }}>Current Semester - Fall 2024</h3>
                {courses.map((course, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        marginBottom: '0.5rem',
                        borderRadius: '8px'
                    }}>
                        <div>
                            <h4 style={{ margin: '0 0 0.25rem 0' }}>{course.name}</h4>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{course.semester}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                                {course.grade}
                            </span>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                                {course.credits} credits
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StudentRecords
