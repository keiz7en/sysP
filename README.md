# AI Education & Career Platform

## 🎉 Latest Updates - Assignment & Exam Enhancements

### ⚡ Latest Fix (Just Now)

✅ **Student Exam Display Fixed**

- Fixed issue where teacher-created exams weren't showing in student panel
- Students can now see all published exams from their enrolled courses
- Backend now fetches from both Exam model (teacher-created) and Assessment model
- Real-time data - no dummy or hardcoded data

✅ **Exam Endpoints Working**
- Fixed 404 error on `/api/teachers/exams/` endpoint
- Teachers can create exams for their assigned courses
- Subject validation ensures teachers only create exams for approved subjects

✅ **Real Instructor Data Only**

- Students only see courses with actual assigned instructors
- No dummy or placeholder instructor names
- Backend validates all instructor assignments

### New Features (Latest Release)

✅ **File Upload Support**

- Teachers can upload assignment files (PDF, DOC, DOCX, TXT) when creating assignments
- Students can submit assignments as text, file, or both
- Exam question paper uploads for teachers
- Student answer file submissions for exams
- Drag-and-drop file upload interface
- File size limit: 10MB per file

✅ **AI Detection System**

- Automatic detection of AI-generated content in submissions
- 10 sophisticated heuristic checks
- Confidence scoring (0-100%)
- Detailed analysis and reporting
- Teacher alerts for flagged submissions
- Detection flags displayed to both teachers and students

✅ **Enhanced Student Panel**

- Renamed "AI Practice & Assessment" to "Assignment Submission"
- New dedicated Assignment Submission component
- Beautiful gradient statistics cards
- Filter assignments by status (pending, submitted, graded)
- View teacher feedback and AI detection results
- Download teacher-uploaded assignment files

✅ **Improved Teacher Panel**

- View all submissions with AI detection results
- Access detailed AI analysis for each submission
- Manage assignment attachments
- Enhanced grading workflow

## Teacher-Course Management System with Strict Approval Chains

## System Overview

Complete educational platform with AI-powered features controlled by a strict approval chain:
**Admin → Teacher → Student → AI Features**

## Core Features

### 1. **Approval Chain System**

- **Admin** creates subjects and approves teacher requests
- **Teachers** request subjects, create courses, approve student enrollments
- **Students** enroll in courses, get AI features unlocked after approval
- **AI** features only work for approved teacher-student-course relationships

### 2. **Subject & Course Management**

- Subjects organized by category (Math, Science, AI/ML, etc.)
- Teachers request subjects they want to teach
- Courses linked to approved teacher-subject relationships
- No cross-subject AI queries allowed

### 3. **AI Features (Gemini-Powered)**

All AI features require approval chain completion:

- Academic analysis & dropout prediction
- Personalized learning content
- Adaptive quiz generation
- Essay grading & feedback
- Career guidance (based on enrolled courses)
- AI chatbot (strict subject enforcement)

### 4. **Role-Based Access**

**Admin:**

- Manage subjects and categories
- Approve/reject teacher subject requests
- View all courses and enrollments
- System-wide analytics

**Teacher:**

- Request subjects to teach
- Create courses for approved subjects
- Approve/reject student enrollments
- Access teaching analytics
- Grade assignments

**Student:**

- Browse approved courses
- Request enrollment
- Access AI features (after teacher approval)
- Track progress and grades
- AI assistant limited to enrolled course subjects

## Technology Stack

**Backend:**

- Django 5.1
- Django REST Framework
- SQLite (development)
- Google Gemini AI (aistudio.google.com)

**Frontend:**

- React 18+ with TypeScript
- Vite
- Framer Motion
- React Hot Toast

## Installation

### Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
npm install
npm run dev
```

## Configuration

### Gemini AI Setup

1. Get API key from https://aistudio.google.com
2. Add to `backend/education_system/settings.py`:
```python
GEMINI_API_KEY = 'your-api-key-here'
```

## API Endpoints

### Course Management

- `GET /api/courses/subjects/` - List all subjects
- `POST /api/courses/subject-requests/` - Request subject (teacher)
- `GET /api/courses/approved-subjects/my_subjects/` - Teacher's approved subjects
- `POST /api/courses/courses/` - Create course (requires approved subject)
- `GET /api/courses/enrollments/pending_enrollments/` - Pending enrollments (teacher)
- `POST /api/courses/enrollments/{id}/approve/` - Approve enrollment
- `POST /api/courses/enrollments/{id}/reject/` - Reject enrollment

### AI Features (Requires Approval Chain)

- `POST /api/students/ai/academic-analysis/` - Academic analysis
- `POST /api/students/ai/personalized-content/` - Personalized learning
- `POST /api/students/ai/generate-quiz/` - Generate quiz
- `POST /api/students/ai/grade-essay/` - Grade essay
- `POST /api/students/ai/career-guidance/` - Career guidance
- `POST /api/students/ai/chatbot/` - AI chatbot (subject-restricted)

## Approval Chain Flow

```
1. Teacher requests Subject
   ↓
2. Admin approves Subject Request
   ↓
3. Teacher creates Course for approved Subject
   ↓
4. Course becomes visible to Students
   ↓
5. Student requests Enrollment
   ↓
6. Teacher approves Enrollment
   ↓
7. AI Features UNLOCKED for Student
   ↓
8. Student can use AI (ONLY for this course's subject)
```

## AI Access Control

**Strict Rules:**

- AI chatbot can ONLY answer questions about enrolled course subject
- Questions about other subjects are rejected
- AI features locked if:
    - Course not approved
    - Enrollment not approved
    - Teacher hasn't unlocked AI features

**Example:**

- Student enrolled in "Mathematics 101"
- AI chatbot will ONLY answer math questions
- Asking about physics → **REJECTED**

## Database Models

### Key Models

- `Subject` - Subject categories
- `TeacherSubjectRequest` - Teacher requests to teach subjects
- `TeacherApprovedSubject` - Admin-approved subject assignments
- `Course` - Courses created by teachers
- `CourseEnrollment` - Student enrollments (with AI unlock status)

### Approval Tracking

Each model tracks:

- `status` - pending/approved/rejected
- `approved_by` - Who approved
- `approved_at` - Timestamp
- `ai_features_unlocked` - AI access flag

## Security

- Token-based authentication
- Role-based permissions
- Course-subject scope enforcement
- AI access validation middleware
- Approval chain validation at every step

## Scripts

**Start Backend:**

```bash
.\start-backend.ps1
```

**Start Frontend:**

```bash
.\start-frontend.ps1
```

**Start Both:**
```bash
.\start-all.ps1
```

**Clear Cache & Restart:**
```bash
.\clean-and-restart.ps1
```

## Development

### Running Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Create Superuser

```bash
python manage.py createsuperuser
```

### Access Admin Panel

http://localhost:8000/admin

## Project Structure

```
backend/
├── courses/          # Course management & approval chain
├── students/         # Student features & AI views
├── teachers/         # Teacher features
├── users/            # Authentication & user management
├── ai_services/      # Gemini AI integration
├── education_system/ # Django settings
└── db.sqlite3

src/
├── components/
│   ├── admin/        # Admin dashboard
│   ├── teacher/      # Teacher dashboard
│   ├── student/      # Student dashboard
│   └── shared/       # Shared components
├── contexts/         # React contexts
└── services/         # API services
```

## Key Features Implemented

✅ Subject request & approval system
✅ Course creation with subject validation
✅ Student enrollment approval workflow
✅ AI access control with approval chain
✅ Subject-scoped AI chatbot
✅ Personalized learning content
✅ Adaptive quiz generation
✅ Essay grading with AI
✅ Career guidance based on enrolled courses
✅ Real-time notifications
✅ Comprehensive dashboards for all roles

## License

MIT License

## Support

For issues and questions, contact the development team.
