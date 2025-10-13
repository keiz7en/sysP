# 🎓 EduAI - AI-Powered Education Management System

A comprehensive, modern education management platform with AI-powered features for students, teachers, and
administrators.

## ✨ Features

### 🎯 **For Students**

- **Interactive Dashboard** with GPA tracking, course progress, and study analytics
- **AI-Powered Chat Assistant** for learning support
- **Adaptive Learning Paths** personalized to learning style
- **Career Guidance** with AI-driven recommendations
- **Academic Progress Tracking** with detailed analytics

### 👨‍🏫 **For Teachers**

- **Student Management** - Add/remove students with auto-generated IDs (4-7 digits)
- **Course Management** - Create and manage courses with enrollment tracking
- **Bulk Student Import** - Upload multiple students via CSV
- **Academic Analytics** - Track student progress and performance
- **AI-Powered Grading** and assessment tools

### 👑 **For Administrators**

- **Teacher Approval System** - Review and approve teacher registrations
- **User Management** - Complete CRUD operations for all user types
- **System Analytics** - Platform usage statistics and insights
- **Role-Based Access Control** - Secure permission management

## 🚀 Quick Start

### **Option 1: Demo Mode (No Backend Required)**

```bash
# Clone the repository
git clone <repository-url>
cd eduai-system

# Install dependencies
npm install

# Start the application
npm run dev
```

**Demo Accounts:**

- **Student**: `student@demo.com` / any password
- **Teacher**: `teacher@demo.com` / any password
- **Admin**: `admin@demo.com` / any password

### **Option 2: Full Backend Mode**

#### Frontend Setup:

```bash
npm install
npm run dev
```

#### Backend Setup:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start the server
python manage.py runserver
```


## 🏗️ Project Structure

```
eduai-system/
├── src/                          # Frontend React Application
│   ├── components/
│   │   ├── student/             # Student-specific components
│   │   │   ├── StudentDashboard.tsx
│   │   │   └── pages/           # Student pages
│   │   ├── teacher/             # Teacher-specific components
│   │   │   ├── TeacherDashboard.tsx
│   │   │   └── pages/           # Teacher pages
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── pages/           # Admin pages
│   │   └── shared/              # Shared components
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication & user management
│   └── App.tsx                  # Main application component
├── backend/                     # Django REST API
│   ├── education_system/        # Django project settings
│   ├── users/                   # User management app
│   ├── students/               # Student-specific models
│   ├── teachers/               # Teacher-specific models
│   └── manage.py
└── package.json
```

## 🔧 Technical Stack

### **Frontend**

- **React 18** with TypeScript
- **React Router** for navigation
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Modern CSS** with inline styles

### **Backend**

- **Django 4.2** with REST Framework
- **Token Authentication** for security
- **PostgreSQL/SQLite** database
- **CORS** enabled for frontend integration

## 🎨 Key Features

### **Authentication System**

- **Multi-Role Login** - Separate authentication for each user type
- **Demo Mode** - Works without backend for testing
- **Token-Based Security** - Secure API authentication
- **Auto-Generated IDs** - Students (4-7 digits) and Teachers (EMP####)

### **Student Management**

- **Bulk Operations** - Add multiple students via CSV
- **Auto-Generated Credentials** - Usernames and temporary passwords
- **Profile Management** - Complete student information tracking
- **Academic Status** - GPA, grade level, and progress tracking

### **Modern UI/UX**

- **Responsive Design** - Works on all screen sizes
- **Beautiful Animations** - Smooth transitions and interactions
- **Dark/Light Themes** - Modern color schemes
- **Interactive Components** - Hover effects and feedback

## 📊 API Endpoints

### **Authentication**

```
POST /api/users/register/     # User registration
POST /api/users/login/        # User login
POST /api/users/logout/       # User logout
POST /api/users/verify-token/ # Token verification
```

### **User Management**

```
GET  /api/users/profile/      # Get user profile
PUT  /api/users/profile/      # Update user profile
GET  /api/users/dashboard/    # Get dashboard data
```

### **Teacher Management**

```
GET  /api/teachers/students/               # Get teacher's students
POST /api/teachers/students/add/           # Add new student
POST /api/teachers/students/bulk-upload/   # Bulk upload students
DELETE /api/teachers/students/<id>/        # Remove student
```

## 🔐 Security Features

- **Role-Based Access Control** - Users only access appropriate features
- **Token Authentication** - Secure API communication
- **Input Validation** - Both frontend and backend validation
- **Error Handling** - Comprehensive error management
- **Data Sanitization** - Protection against malicious input

## 📱 Demo Mode Features

- **Instant Authentication** - No backend setup required
- **Persistent Storage** - Data saved in localStorage
- **Full Feature Access** - All functionality available
- **Realistic Data** - Pre-populated with meaningful content
- **Seamless Experience** - Indistinguishable from full backend

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**
```bash
npm run build
# Deploy the 'build' folder
```

### **Backend (Heroku/Railway)**
```bash
# Configure environment variables
# Deploy with your preferred platform
```


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Real-time Chat** - Live messaging between users
- [ ] **Advanced Analytics** - ML-powered insights
- [ ] **Mobile App** - React Native version
- [ ] **Video Conferencing** - Integrated virtual classrooms
- [ ] **Assignment Submission** - File upload and grading system
- [ ] **Calendar Integration** - Schedule and event management

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎉 Acknowledgments

- **React Team** for the amazing framework
- **Django Team** for the robust backend framework
- **Framer Motion** for beautiful animations
- **All Contributors** who helped build this project

---

**Made with ❤️ for education**
