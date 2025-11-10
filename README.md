# 🎓 EduAI - AI-Powered Education Platform

A comprehensive education management system with advanced AI integration for students, teachers, and administrators.

## 🚀 Features

### For Students

- **🏠 Dashboard**: Personal academic overview and progress tracking
- **🤖 AI Learning Assistant**: 24/7 AI-powered academic support with Gemini AI
- **📊 Academic Records**: Real-time grades and transcript management
- **🧠 Adaptive Learning**: Personalized learning paths and content
- **💼 Career Guidance**: AI-driven career recommendations and job matching
- **⚡ AI Assessments**: Automated testing and instant feedback
- **🔬 Learning Insights**: Performance analytics and progress tracking
- **♿ Accessibility**: Voice recognition and adaptive learning tools
- **👤 Profile Management**: Personal settings and preferences

### For Teachers

- **📈 Teaching Analytics**: Comprehensive classroom insights
- **👥 Student Management**: Add, manage, and track student progress
- **📚 Course Creation**: Design and manage educational content
- **🎯 Assessment Tools**: Create and grade assignments with AI assistance
- **💬 Communication**: Direct messaging with students and administrators
- **📊 Performance Insights**: Class-wide analytics and reporting

### For Administrators

- **🏛️ System Overview**: Platform-wide statistics and management
- **✅ User Approval**: Manage teacher and student registrations
- **👥 User Management**: Comprehensive user administration
- **📊 Analytics Dashboard**: System performance and usage metrics
- **🔧 System Configuration**: Platform settings and maintenance

### AI-Powered Features

- **🧠 Gemini AI Integration**: Advanced natural language processing
- **📝 Automated Essay Grading**: Intelligent assessment with detailed feedback
- **🎯 Personalized Content**: Adaptive learning materials generation
- **🔍 Performance Analysis**: Dropout risk prediction and academic insights
- **💼 Career Matching**: Skills assessment and job recommendations
- **💬 24/7 Chat Assistant**: Instant academic and career support

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Framer Motion** for smooth animations
- **Modern CSS** with responsive design
- **Context API** for state management

### Backend

- **Django 4.2** with Django REST Framework
- **SQLite** database (production-ready)
- **Google Gemini AI** integration
- **Token Authentication** with secure user management
- **CORS** enabled for frontend integration

### AI Services

- **Google Gemini 2.5 Flash** model
- **Natural Language Processing** for educational content
- **Machine Learning** for performance prediction
- **Automated Assessment** and feedback generation

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ and pip
- **Git** for version control

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd EduAI
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
# In project root
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 👥 User Accounts

### Account Types

1. **Students**: Access learning materials, AI assistant, and track progress
2. **Teachers**: Manage classes, create content, and view analytics
3. **Administrators**: System management and user approval

### Registration Flow

1. Users register with their preferred role
2. Administrators approve teacher accounts
3. Students can register directly
4. All users get access to role-specific features

## 🤖 AI Features

### Gemini AI Integration

- **Model**: gemini-2.5-flash
- **Features**: Content generation, assessment, career guidance
- **Availability**: 24/7 with intelligent fallback
- **Security**: Secure API key management

### AI Capabilities

- **Academic Analysis**: Performance prediction and risk assessment
- **Content Generation**: Personalized learning materials
- **Assessment Automation**: Intelligent grading and feedback
- **Career Guidance**: Skills matching and job recommendations
- **Chat Assistant**: Natural language academic support

## 📊 Database Structure

### Core Models

- **Users**: Authentication and basic profile information
- **StudentProfile**: Academic records and learning preferences
- **TeacherProfile**: Teaching credentials and specializations
- **Courses**: Educational content and enrollment management
- **Assessments**: Automated testing and grading
- **Analytics**: Performance tracking and insights

## 🔧 Configuration

### Environment Variables

```bash
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# AI Integration
GEMINI_API_KEY=your-gemini-api-key
```

### Production Deployment

1. Set `DEBUG=False` in Django settings
2. Configure proper database (PostgreSQL/MySQL)
3. Set up static file serving
4. Configure HTTPS and security headers
5. Set up monitoring and logging

## 📱 API Endpoints

### Authentication

- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User authentication
- `POST /api/users/logout/` - User logout

### Student APIs

- `GET /api/students/dashboard/` - Student dashboard
- `GET /api/students/academic-records/` - Academic history
- `POST /api/students/ai/academic-analysis/` - AI performance analysis
- `POST /api/students/ai/personalized-content/` - AI content generation
- `POST /api/students/ai/chatbot/` - AI chat assistant

### Teacher APIs

- `GET /api/teachers/dashboard/` - Teacher dashboard
- `GET /api/teachers/students/` - Student management
- `POST /api/teachers/courses/` - Course creation
- `GET /api/teachers/analytics/` - Teaching analytics

### Admin APIs

- `GET /api/users/admin/dashboard/` - System overview
- `GET /api/users/admin/pending-teachers/` - Approval management
- `PUT /api/users/admin/users/{id}/` - User management

## 🔒 Security Features

- **Token-based Authentication**
- **Role-based Access Control**
- **CORS Protection**
- **SQL Injection Prevention**
- **XSS Protection**
- **Secure API Key Management**

## 📈 Performance

- **Fast Loading**: Vite-optimized frontend
- **Efficient APIs**: Django REST Framework
- **Caching**: Strategic data caching
- **Database Optimization**: Indexed queries
- **AI Integration**: Optimized API calls with fallbacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Check the documentation
- Review API endpoints
- Contact system administrators

## 🎯 Future Roadmap

- **Mobile App**: React Native implementation
- **Advanced AI**: More sophisticated learning algorithms
- **Integration**: Third-party educational tools
- **Analytics**: Enhanced reporting and insights
- **Scalability**: Multi-tenant architecture

---
