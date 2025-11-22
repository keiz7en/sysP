# 🎓 AI-Powered Education Management System

> A comprehensive educational platform with AI-powered features including adaptive learning, career guidance, academic
> records, assignment management, and intelligent assessment tools.

[![Django](https://img.shields.io/badge/Django-5.1-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-orange.svg)](https://ai.google.dev/)

---

## 🌟 Features

### 👨‍🎓 Student Features

- **Dashboard**: Personalized dashboard with course enrollments, progress tracking, and announcements
- **Course Enrollment**: Browse and enroll in courses with teacher approval workflow
- **Academic Records**: Real-time GPA tracking, grade history, and AI-powered performance analysis
- **Assignment Submission**: Submit assignments with text and file uploads, view feedback and grades
- **Exam Taking**: Take teacher-created exams, submit answers with file uploads
- **AI-Powered Learning**:
    - Adaptive learning paths with personalized recommendations
    - AI study tips based on learning style
    - Progress milestones and next steps
    - Learning velocity optimization
- **Career Guidance**:
    - AI-powered career recommendations based on courses
    - Skill gap analysis with market demand insights
    - Training program recommendations
    - Job market insights and salary predictions
- **AI Chatbot**: Context-aware AI assistant for course-related questions

### 👨‍🏫 Teacher Features

- **Course Management**: Create and manage courses for approved subjects
- **Student Management**: View enrolled students, approve/reject enrollment requests
- **Assignment Creation**: Create assignments with file attachments and due dates
- **Exam Creation**: Create exams with questions, duration, and file uploads
- **Grading System**: Grade assignments and exams with feedback
- **AI Content Detection**: Automatic detection of AI-generated content in submissions
- **Analytics Dashboard**: Track student performance, submission rates, and course statistics
- **Subject Approval**: Request to teach new subjects pending admin approval

### 👨‍💼 Admin Features

- **User Management**: Manage all users (students, teachers, admins)
- **Subject Management**: Create subjects and approve teacher requests
- **Course Oversight**: View and manage all courses across the platform
- **System Analytics**: Comprehensive analytics and reporting
- **Approval Workflows**: Approve teacher subject requests and monitor enrollment chains
- **Settings Management**: System-wide configuration and preferences

### 🤖 AI-Powered Features (Gemini Integration)

1. **Academic Performance Analysis**
    - Overall assessment with AI insights
    - Identification of strengths and weaknesses
    - Personalized recommendations
    - Risk level assessment (low/medium/high)
    - Next steps with actionable items

2. **Adaptive Learning Paths**
    - Personalized learning journey analysis
    - Study tips based on learning style
    - Course recommendations with difficulty matching
    - Schedule optimization suggestions
    - Progress milestones with timelines

3. **Career Guidance**
    - Career path recommendations with match percentages
    - Skill gap analysis (current vs. required skills)
    - Training program recommendations
    - Market insights and salary predictions
    - Next steps for career preparation

4. **AI Content Detection**
    - 10 sophisticated heuristic checks
    - Confidence scoring (0-100%)
    - Detailed analysis for teachers
    - Automatic flagging of suspicious content

5. **AI Chatbot**
    - Context-aware responses
    - Subject-specific knowledge
    - Study assistance and clarification

---

## 🛠️ Technology Stack

### Backend

- **Framework**: Django 5.1 with Django REST Framework
- **Database**: SQLite (development), PostgreSQL-ready (production)
- **AI Engine**: Google Gemini AI (gemini-1.5-flash)
- **Authentication**: Token-based authentication
- **File Storage**: Django file uploads with validation

### Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI/Animation**: Framer Motion
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Key Python Packages

```
Django==5.1
djangorestframework
django-cors-headers
google-generativeai (Gemini AI)
python-dateutil
```

### Key Node Packages

```
react
react-dom
react-router-dom
typescript
vite
framer-motion
react-hot-toast
```

---

## 📋 Prerequisites

- Python 3.11+ installed
- Node.js 18+ and npm installed
- Google Gemini API key ([Get one here](https://aistudio.google.com))
- Git (for cloning the repository)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sysP
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

### 3. Configure Gemini AI

1. Get your API key from [Google AI Studio](https://aistudio.google.com)
2. Open `backend/education_system/settings.py`
3. Add your API key:

```python
GEMINI_API_KEY = 'your-api-key-here'
```

### 4. Frontend Setup

```bash
# Navigate to project root (if in backend/)
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## 🎯 Quick Start Scripts

### Windows PowerShell Scripts

**Start Backend Only:**

```powershell
.\start-backend.ps1
```

**Start Frontend Only:**

```powershell
.\start-frontend.ps1
```

**Start Both (Recommended):**

```powershell
.\start-all.ps1
```

**Clear Cache and Restart:**

```powershell
.\clear-cache-simple.ps1
```

---

## 📁 Project Structure

```
sysP/
├── backend/
│   ├── ai_services/           # Gemini AI integration
│   │   ├── gemini_service.py  # AI service implementation
│   │   └── ...
│   ├── courses/               # Course and enrollment management
│   │   ├── models.py          # Course, Subject, Enrollment models
│   │   ├── views.py           # Course API endpoints
│   │   └── ...
│   ├── students/              # Student features and AI views
│   │   ├── models.py          # Student profile model
│   │   ├── views.py           # Student API endpoints
│   │   ├── exam_views.py      # Exam-related views
│   │   └── ...
│   ├── teachers/              # Teacher features
│   │   ├── models.py          # Teacher profile model
│   │   ├── views.py           # Teacher API endpoints
│   │   ├── assignment_views.py # Assignment management
│   │   ├── exam_views.py      # Exam creation and grading
│   │   └── ...
│   ├── users/                 # Authentication and user management
│   │   ├── models.py          # Custom user model
│   │   ├── views.py           # Auth endpoints
│   │   └── ...
│   ├── career/                # Career guidance features
│   │   ├── models.py          # Job market data models
│   │   ├── views.py           # Career API endpoints
│   │   └── ...
│   ├── education_system/      # Django project settings
│   │   ├── settings.py        # Main configuration
│   │   ├── urls.py            # URL routing
│   │   └── ...
│   ├── db.sqlite3             # SQLite database
│   └── manage.py              # Django management script
│
├── src/
│   ├── components/
│   │   ├── admin/             # Admin dashboard components
│   │   │   └── pages/
│   │   ├── teacher/           # Teacher dashboard components
│   │   │   └── pages/
│   │   ├── student/           # Student dashboard components
│   │   │   └── pages/
│   │   │       ├── StudentDashboard.tsx
│   │   │       ├── StudentRecords.tsx
│   │   │       ├── AssignmentSubmission.tsx
│   │   │       ├── ExamTaking.tsx
│   │   │       ├── AdaptiveLearning.tsx
│   │   │       ├── CareerGuidance.tsx
│   │   │       └── ...
│   │   └── AuthScreen.tsx     # Login/Register component
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── services/
│   │   └── api.ts             # API service layer
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
│
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json               # Node dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

---

## 🔑 Default User Accounts

After creating a superuser, you can create additional users:

### Creating Users via Django Admin

1. Go to `http://localhost:8000/admin`
2. Login with superuser credentials
3. Navigate to Users → Add User
4. Set `user_type` field:
    - `admin` - Full system access
    - `teacher` - Teacher features
    - `student` - Student features

### User Roles

- **Admin**: Can only login (no signup), manages entire system
- **Teacher**: Can signup and request subjects to teach
- **Student**: Can signup and enroll in courses

---

## 📡 API Endpoints Overview

### Authentication

- `POST /api/users/register/` - User registration (student/teacher only)
- `POST /api/users/login/` - User login (all roles)
- `POST /api/users/logout/` - User logout
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update profile
- `POST /api/users/change-password/` - Change password

### Student Endpoints

- `GET /api/students/dashboard/` - Student dashboard data
- `GET /api/students/academic-records/` - Academic records with AI analysis
- `GET /api/students/adaptive-learning/` - Adaptive learning recommendations
- `GET /api/students/assignments/` - List assignments
- `POST /api/students/assignments/submit/` - Submit assignment
- `GET /api/students/assessments/` - List exams/assessments
- `POST /api/students/ai/career-guidance/` - AI career guidance

### Teacher Endpoints

- `GET /api/teachers/assignments/` - List assignments
- `POST /api/teachers/assignments/create/` - Create assignment
- `GET /api/teachers/exams/` - List exams
- `POST /api/teachers/exams/create/` - Create exam
- `GET /api/teachers/submissions/` - View submissions
- `POST /api/teachers/grade/` - Grade submission
- `GET /api/teachers/students/` - Enrolled students

### Career Guidance

- `GET /api/career/skill-gap-analysis/` - Skill gap analysis
- `GET /api/career/training-resources/` - Training programs
- `GET /api/career/market-insights/` - Job market insights

### Course Management

- `GET /api/courses/subjects/` - List subjects
- `POST /api/courses/subject-requests/` - Request subject (teacher)
- `GET /api/courses/courses/` - List courses
- `POST /api/courses/enrollments/enroll/` - Enroll in course

---

## 🔐 Approval Chain Workflow

```
1. Admin creates Subjects
   ↓
2. Teacher requests Subject approval
   ↓
3. Admin approves Teacher's Subject request
   ↓
4. Teacher creates Course for approved Subject
   ↓
5. Student browses and requests Enrollment
   ↓
6. Teacher approves Student Enrollment
   ↓
7. AI Features UNLOCKED for Student
   ↓
8. Student accesses AI-powered learning tools
```

---

## ✨ Recent Updates & Fixes

### ✅ Latest (November 23, 2025)

**AI-Powered Features Implemented:**

- ✅ Adaptive Learning with real AI recommendations
- ✅ Career Guidance with Gemini AI integration
- ✅ Academic Records with AI performance analysis
- ✅ Skill gap analysis with market insights
- ✅ Training program recommendations

**Backend Fixes:**

- ✅ Fixed `AttributeError` in academic records (enrolled_at → enrollment_date)
- ✅ Fixed `AttributeError` in adaptive learning (learning_objectives removed)
- ✅ Fixed career guidance 500 error (progress_percentage → completion_percentage)
- ✅ Admin signup now blocked (login only)
- ✅ All users can change password and username via settings

**Frontend Enhancements:**

- ✅ Beautiful AI feedback display with color-coded sections
- ✅ Adaptive learning page with milestones and recommendations
- ✅ Career guidance with comprehensive visualizations
- ✅ Error handling and loading states

### Previous Updates

**Assignment & Exam System:**

- ✅ File upload support for assignments and exams
- ✅ AI content detection in submissions
- ✅ Student exam display fixed
- ✅ Real instructor data validation

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
python manage.py test
```

### API Testing

Use tools like Postman or Thunder Client:

1. Login to get authentication token
2. Include token in headers: `Authorization: Token <your-token>`
3. Test endpoints with different user roles

---

## 🐛 Troubleshooting

### Common Issues

**1. Backend Won't Start**
```bash
# Ensure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt

# Check for migration issues
python manage.py migrate
```

**2. Frontend Won't Start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
npm run dev -- --force
```

**3. Database Issues**
```bash
# Reset database (WARNING: Deletes all data)
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

**4. Gemini AI Errors**

- Verify API key is set in `settings.py`
- Check API key is active at https://aistudio.google.com
- Ensure internet connection is stable
- Check API rate limits

**5. CORS Issues**

- Ensure `django-cors-headers` is installed
- Verify `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:3000`

---

## 📊 Database Models

### Key Models

**User Models:**

- `User` - Custom user model with role-based types
- `StudentProfile` - Extended student information
- `TeacherProfile` - Extended teacher information

**Course Models:**

- `Subject` - Subject categories and codes
- `Course` - Courses created by teachers
- `CourseEnrollment` - Student enrollments with approval status

**Assignment Models:**

- `Assignment` - Teacher-created assignments
- `AssignmentSubmission` - Student submissions with AI detection

**Exam Models:**

- `Exam` - Teacher-created exams
- `ExamAttempt` - Student exam attempts with answers

**Career Models:**

- `JobMarketData` - Job market information
- `StudentSkillProfile` - Student skill assessments
- `TrainingProgram` - Recommended training programs

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Contact the development team
- Check the troubleshooting section

---

## 🎓 Acknowledgments

- Built with Django and React
- Powered by Google Gemini AI
- UI components inspired by modern design principles
- Community feedback and contributions

---

**Made with ❤️ for Education**
