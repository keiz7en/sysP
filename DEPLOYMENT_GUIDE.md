# 🚀 EduAI System - Production Deployment Guide

## Quick Start (For Immediate Use)

### Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

### 1. Clone and Setup Backend

```bash
# Navigate to project directory
cd X:/sysP/backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create admin user (if not exists)
python create_admin.py

# Start Django server
python manage.py runserver
```

### 2. Setup Frontend (New Terminal)

```bash
# Navigate to project root
cd X:/sysP

# Install Node dependencies (if not done)
npm install

# Start React development server
npm run dev
```

### 3. Access the System

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **Admin Login**:
    - Username: `admin`
    - Password: `admin123`

## 🏢 Production Deployment

### Option 1: Traditional Server Deployment

#### Backend (Django) Deployment

```bash
# 1. Install production dependencies
pip install gunicorn psycopg2-binary

# 2. Configure production settings
export DJANGO_SETTINGS_MODULE=education_system.settings_production

# 3. Collect static files
python manage.py collectstatic --noinput

# 4. Run migrations
python manage.py migrate

# 5. Start with Gunicorn
gunicorn education_system.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend (React) Deployment

```bash
# 1. Build for production
npm run build

# 2. Serve with nginx or Apache
# Point document root to /dist folder
```

### Option 2: Docker Deployment

#### Create Dockerfile for Backend

```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "education_system.wsgi:application", "--bind", "0.0.0.0:8000"]
```

#### Create Dockerfile for Frontend

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
```

#### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/eduai
    depends_on:
      - db
  
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: eduai
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Option 3: Cloud Deployment (AWS/Digital Ocean/Heroku)

#### Heroku Deployment

```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create your-eduai-app

# 4. Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# 5. Deploy
git push heroku main

# 6. Run migrations
heroku run python manage.py migrate

# 7. Create admin user
heroku run python create_admin.py
```

## 🔧 Production Configuration

### Environment Variables

```bash
# Django Settings
DJANGO_SETTINGS_MODULE=education_system.settings_production
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# Security
SECURE_SSL_REDIRECT=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
```

### Production Settings File

Create `backend/education_system/settings_production.py`:

```python
from .settings import *
import os

DEBUG = False
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Security Settings
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Static Files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

## 🔐 Security Checklist

### Pre-Deployment Security

- [ ] Change default admin password
- [ ] Set strong SECRET_KEY
- [ ] Configure ALLOWED_HOSTS
- [ ] Enable SSL/HTTPS
- [ ] Configure secure headers
- [ ] Set up CORS properly
- [ ] Enable database backups
- [ ] Configure error logging
- [ ] Set up monitoring

### Post-Deployment Security

- [ ] Regular security updates
- [ ] Monitor error logs
- [ ] Review user permissions
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] Security scanning

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Backend health check
curl http://your-domain.com/api/health/

# Database connectivity
python manage.py dbshell

# Static files serving
curl http://your-domain.com/static/admin/css/base.css
```

### Backup Strategy

```bash
# Database backup
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Media files backup
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz media/

# Code backup
git archive --format=tar.gz --output=code_backup_$(date +%Y%m%d_%H%M%S).tar.gz HEAD
```

### Log Monitoring

```python
# Add to Django settings
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/eduai.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## 🎯 Performance Optimization

### Database Optimization

```python
# Add database indexes
python manage.py dbshell
CREATE INDEX idx_user_email ON users_customuser(email);
CREATE INDEX idx_student_id ON students_studentprofile(student_id);
CREATE INDEX idx_course_enrollment ON courses_courseenrollment(student_id, course_id);
```

### Caching Setup

```python
# Install Redis
pip install redis django-redis

# Add to settings
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Use caching in views
from django.core.cache import cache
cache.set('key', 'value', 300)  # 5 minutes
```

### Frontend Optimization

```javascript
// Build optimization in vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion']
        }
      }
    }
  }
})
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

```bash
# Check database connection
python manage.py dbshell

# Reset migrations (if needed)
python manage.py migrate --fake-initial
```

#### Static Files Not Loading

```bash
# Collect static files
python manage.py collectstatic --clear

# Check static files configuration
python manage.py findstatic admin/css/base.css
```

#### API CORS Issues

```python
# Install django-cors-headers
pip install django-cors-headers

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    'corsheaders',
    # ... other apps
]

# Add middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# Configure CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
    "https://your-domain.com",
]
```

#### Performance Issues

```bash
# Profile database queries
python manage.py shell
from django.db import connection
print(connection.queries)

# Monitor memory usage
pip install memory-profiler
python -m memory_profiler manage.py runserver
```

## 📈 Scaling Considerations

### Horizontal Scaling

- Load balancer configuration
- Database read replicas
- CDN for static files
- Redis cluster for caching
- Container orchestration (Kubernetes)

### Vertical Scaling

- Increase server resources
- Database optimization
- Connection pooling
- Background task processing (Celery)

## 🎓 Go-Live Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Backup system verified
- [ ] Monitoring configured
- [ ] Error handling tested
- [ ] User acceptance testing completed

### Launch Day

- [ ] DNS configured
- [ ] SSL certificates installed
- [ ] Database migrated
- [ ] Static files deployed
- [ ] Admin user created
- [ ] System health verified
- [ ] User notifications sent

### Post-Launch

- [ ] Monitor system metrics
- [ ] Check error logs
- [ ] Verify user registrations
- [ ] Test key workflows
- [ ] Gather user feedback
- [ ] Plan first updates

## 📞 Support and Maintenance

### Regular Maintenance Tasks

- Weekly: Check error logs, backup verification
- Monthly: Security updates, performance review
- Quarterly: Feature updates, user feedback review
- Annually: Security audit, infrastructure review

### Emergency Procedures

1. **System Down**: Check server status, restart services
2. **Database Issues**: Switch to backup, restore if needed
3. **Security Breach**: Disable access, investigate, patch
4. **Data Loss**: Restore from backups, verify integrity

---

## 🌟 Success! Your EduAI System is Ready

The system is now fully deployed and operational. Users can:

✅ **Register and Login** with real authentication
✅ **Access Role-Based Dashboards** with live data  
✅ **Manage Students and Courses** with real enrollment
✅ **Track Academic Progress** with real GPA calculation
✅ **Use AI Features** for personalized learning
✅ **Generate Reports** with actual system data
✅ **Approve/Reject Users** through admin workflows

Your educational management system is ready to serve real institutions with thousands of students and teachers!

---

*Deployment Guide - Version 1.0*
*Last Updated: October 20, 2025*