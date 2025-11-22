# Security Policy

## 🔒 Security Overview

EduAI is an AI-powered Learning Management System that handles sensitive educational data, personal information, and
authentication credentials. We take security seriously and have implemented multiple layers of protection to ensure the
safety of our users' data.

**Current Version**: 3.0  
**Security Level**: Production Ready  
**Last Security Audit**: 2025  
**Classification**: Educational Platform with PII

---

## 🚨 Reporting a Vulnerability

### How to Report

If you discover a security vulnerability in EduAI, please report it responsibly:

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please use one of these methods:

1. **Email**: security@eduai.com (Recommended)
2. **Private GitHub Security Advisory**: Use the "Security" tab → "Report a vulnerability"
3. **Encrypted Communication**: PGP Key available on request

### What to Include

Please provide the following information:

- **Type of vulnerability** (e.g., XSS, SQL Injection, CSRF, Authentication bypass)
- **Affected component(s)** (e.g., login system, API endpoint, file upload)
- **Steps to reproduce** (detailed, step-by-step)
- **Proof of concept** (if applicable)
- **Potential impact** (data exposure, privilege escalation, etc.)
- **Suggested fix** (optional but appreciated)
- **Your contact information** (for follow-up questions)

### Response Timeline

| Action | Timeline |
|--------|----------|
| Initial Response | Within 48 hours |
| Vulnerability Assessment | Within 1 week |
| Fix Development | 1-4 weeks (depending on severity) |
| Security Patch Release | As soon as possible |
| Public Disclosure | 30 days after fix (coordinated) |

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Complete system compromise, data breach | 24-48 hours |
| **High** | Major data exposure, authentication bypass | 1 week |
| **Medium** | Limited data exposure, privilege escalation | 2-4 weeks |
| **Low** | Minor issues, information disclosure | 1-2 months |

---

## 🛡️ Security Features

### 1. Authentication & Authorization

#### Implemented Security Measures

✅ **Token-Based Authentication (REST API)**

- Django REST Framework Token Authentication
- Tokens stored securely in database (hashed)
- Token expiration after 24 hours
- Automatic token rotation on login

✅ **Password Security**

- PBKDF2 algorithm with SHA256 hash (Django default)
- Minimum 8 characters required
- Password validation against common passwords
- Password complexity requirements:
    - Cannot be too similar to username
    - Cannot be entirely numeric
    - Cannot be in common password list

✅ **Role-Based Access Control (RBAC)**

- 4 user types: Student, Teacher, Admin, Parent
- Permission enforcement at API level
- View-level permission decorators
- Model-level permission checks

✅ **Session Management**

- Session timeout: 24 hours (configurable)
- `SESSION_SAVE_EVERY_REQUEST = True` (activity tracking)
- Secure session cookies in production

✅ **Multi-Factor Authentication (MFA) Ready**

- Infrastructure prepared for TOTP implementation
- Google Authenticator integration ready

#### Authentication Endpoints

```
POST /api/users/login/           # User login
POST /api/users/register/        # User registration
POST /api/users/logout/          # User logout
POST /api/users/verify-token/    # Token verification
POST /api/users/change-password/ # Password change
POST /api/users/reset-password/  # Password reset (future)
```

---

### 2. API Security

#### CORS (Cross-Origin Resource Sharing)

✅ **Configured CORS Origins**

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',  # Vite dev server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
]
```

⚠️ **Production Configuration Required**

```python
# In production, replace with:
CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
]
```

#### CSRF Protection

✅ **Django CSRF Middleware Enabled**

- CSRF tokens required for all POST/PUT/DELETE requests
- `CsrfViewMiddleware` in middleware stack
- Token validation on every state-changing request

✅ **API Token Authentication**

- Exempt from CSRF for token-authenticated requests
- `@csrf_exempt` decorator only where necessary

#### Rate Limiting

⚠️ **Not Currently Implemented** (Recommended for production)

**Recommended Implementation**:

```python
# Install django-ratelimit
pip install django-ratelimit

# Apply to login endpoint
from ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
def login_view(request):
    # Login logic
    pass
```

**Suggested Rate Limits**:

- Login: 5 attempts per minute per IP
- Registration: 3 attempts per minute per IP
- API calls: 100 requests per minute per user
- Password reset: 3 attempts per hour per email

---

### 3. Input Validation & Sanitization

#### Backend Validation

✅ **Django REST Framework Serializers**

- All API inputs validated through serializers
- Type checking (string, int, email, date, etc.)
- Field-level validation methods
- Model-level validation on save

✅ **Django Model Validators**

```python
phone_number = models.CharField(
    max_length=15,
    validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')]
)
```

✅ **SQL Injection Prevention**

- Django ORM parameterized queries
- No raw SQL without parameters
- User input never directly concatenated into queries

✅ **XSS Prevention**

- Django template auto-escaping enabled
- DRF JSON serialization escapes HTML
- `SECURE_BROWSER_XSS_FILTER = True`

#### Frontend Validation

✅ **TypeScript Type Safety**

- Strong typing for all data structures
- Type checking at compile time
- Interface definitions for API responses

✅ **React Input Sanitization**

- React auto-escapes JSX content
- No `dangerouslySetInnerHTML` usage
- Input validation before API calls

⚠️ **Recommendation**: Add DOMPurify for user-generated content

```bash
npm install dompurify @types/dompurify
```

---

### 4. File Upload Security

#### Current Implementation

✅ **File Type Restrictions**

- Allowed extensions: PDF, DOC, DOCX, TXT, JPG, PNG
- MIME type validation
- File size limits (configurable)

✅ **Upload Location**

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

⚠️ **Production Recommendations**:

1. **Virus Scanning**

```python
# Install ClamAV
pip install pyclamd

def scan_uploaded_file(file):
    cd = pyclamd.ClamdUnixSocket()
    result = cd.scan_stream(file.read())
    return result is None  # None = clean
```

2. **Cloud Storage** (AWS S3, Azure Blob, GCS)

```python
# Install django-storages
pip install django-storages boto3

# Settings
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
AWS_S3_REGION_NAME = 'us-east-1'
```

3. **File Name Sanitization**

```python
import uuid
import os

def generate_secure_filename(original_filename):
    ext = os.path.splitext(original_filename)[1]
    return f"{uuid.uuid4().hex}{ext}"
```

---

### 5. Data Protection & Privacy

#### Database Security

✅ **SQLite Development** (Current)

- File-based database
- OS-level file permissions

⚠️ **PostgreSQL Production** (Recommended)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',  # Enforce SSL
        }
    }
}
```

#### Sensitive Data Storage

✅ **Environment Variables**

- `.env` file for secrets (gitignored)
- Gemini API key stored securely
- Database credentials in environment

✅ **Secrets Not in Version Control**

```bash
# .gitignore includes:
.env
db.sqlite3
*.pyc
__pycache__/
media/
staticfiles/
```

⚠️ **Recommendations**:

1. **Encrypt Sensitive Fields**

```python
# Install django-encrypted-model-fields
pip install django-encrypted-model-fields

from encrypted_model_fields.fields import EncryptedCharField

class StudentProfile(models.Model):
    ssn = EncryptedCharField(max_length=11)  # Social Security Number
    medical_info = EncryptedTextField()
```

2. **Django Secret Key Rotation**

```bash
# Generate new secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

3. **Audit Logging**

```python
# Track who accesses sensitive data
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=50)
    resource = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

#### GDPR Compliance

✅ **User Data Rights**

- Right to access: Users can view their data
- Right to deletion: `DELETE /api/users/delete-account/`
- Right to portability: Export functionality ready

⚠️ **Additional Requirements**:

- [ ] Privacy policy page
- [ ] Cookie consent banner
- [ ] Data processing agreements
- [ ] Data retention policies
- [ ] Automated data deletion after X days

---

### 6. Third-Party Integrations

#### Google Gemini AI

✅ **API Key Security**

```python
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
```

⚠️ **Security Concerns**:

- API key has full access to Gemini features
- Rate limiting handled by Google
- No sensitive data should be sent in prompts
- Implement data anonymization before AI processing

**Recommendation**: Sanitize student data before sending to AI

```python
def anonymize_student_data(student):
    return {
        'performance': student.gpa,
        'courses': [course.subject for course in student.courses],
        # DO NOT SEND: names, emails, SSN, addresses
    }
```

#### External APIs

✅ **Job Market Data APIs**

- Read-only access
- No authentication credentials stored
- Public data only

---

## 🔐 Production Security Checklist

### Critical (Must Do Before Production)

- [ ] **Change Django SECRET_KEY**
  ```python
  SECRET_KEY = os.getenv('SECRET_KEY')  # 50+ character random string
  ```

- [ ] **Set DEBUG = False**
  ```python
  DEBUG = False  # Never True in production
  ```

- [ ] **Configure ALLOWED_HOSTS**
  ```python
  ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
  ```

- [ ] **Enable HTTPS/SSL**
  ```python
  SECURE_SSL_REDIRECT = True
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True
  SECURE_HSTS_SECONDS = 31536000  # 1 year
  SECURE_HSTS_INCLUDE_SUBDOMAINS = True
  SECURE_HSTS_PRELOAD = True
  ```

- [ ] **Update CORS Origins**
  ```python
  CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']
  ```

- [ ] **Database Migration to PostgreSQL**
  ```bash
  pip install psycopg2-binary
  # Update DATABASES setting
  ```

- [ ] **Implement Rate Limiting**
  ```bash
  pip install django-ratelimit
  ```

- [ ] **Setup Redis for Caching & Sessions**
  ```python
  CACHES = {
      'default': {
          'BACKEND': 'django_redis.cache.RedisCache',
          'LOCATION': 'redis://127.0.0.1:6379/1',
      }
  }
  ```

- [ ] **Configure Email Backend**
  ```python
  EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
  EMAIL_HOST = 'smtp.gmail.com'
  EMAIL_PORT = 587
  EMAIL_USE_TLS = True
  EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
  EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
  ```

### High Priority

- [ ] **Setup Logging**
  ```python
  LOGGING = {
      'version': 1,
      'disable_existing_loggers': False,
      'handlers': {
          'file': {
              'level': 'ERROR',
              'class': 'logging.FileHandler',
              'filename': '/var/log/eduai/error.log',
          },
      },
      'loggers': {
          'django': {
              'handlers': ['file'],
              'level': 'ERROR',
              'propagate': True,
          },
      },
  }
  ```

- [ ] **Implement Content Security Policy (CSP)**
  ```python
  # Install django-csp
  pip install django-csp
  
  CSP_DEFAULT_SRC = ("'self'",)
  CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")
  CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
  ```

- [ ] **Setup Fail2Ban** (server-level protection)
  ```bash
  sudo apt-get install fail2ban
  # Configure for repeated login failures
  ```

- [ ] **Database Backups**
  ```bash
  # Daily automated backups
  0 2 * * * pg_dump eduai_db > /backups/eduai_$(date +\%Y\%m\%d).sql
  ```

- [ ] **Monitoring & Alerting** (Sentry, New Relic, Datadog)
  ```python
  import sentry_sdk
  sentry_sdk.init(dsn="your-sentry-dsn", traces_sample_rate=1.0)
  ```

### Medium Priority

- [ ] **Implement 2FA/MFA**
- [ ] **Add honeypot fields to forms** (anti-bot)
- [ ] **Setup Web Application Firewall (WAF)**
- [ ] **Implement audit logging**
- [ ] **Regular security scans** (OWASP ZAP, Nessus)
- [ ] **Dependency vulnerability scanning** (Snyk, Dependabot)
- [ ] **API versioning** (`/api/v1/`, `/api/v2/`)
- [ ] **GraphQL security** (if implemented)
- [ ] **Implement API documentation authentication**

---

## 🔍 Security Testing

### Automated Testing

#### Backend Security Tests

```bash
cd backend

# Django system check
python manage.py check --deploy

# Check for common security issues
pip install django-security-check
python manage.py security_check

# Dependency vulnerability scan
pip install safety
safety check

# Static code analysis
pip install bandit
bandit -r . -ll
```

#### Frontend Security Tests

```bash
cd frontend

# Dependency vulnerability scan
npm audit

# Fix vulnerabilities
npm audit fix

# Check for known vulnerabilities
npm install -g snyk
snyk test
```

### Manual Testing

#### Recommended Security Tests

1. **Authentication Testing**
    - [ ] Brute force login attempts
    - [ ] Password reset flow
    - [ ] Session fixation
    - [ ] Token expiration
    - [ ] Logout functionality

2. **Authorization Testing**
    - [ ] Horizontal privilege escalation (access other student's data)
    - [ ] Vertical privilege escalation (student → admin)
    - [ ] Direct object reference (modify IDs in URLs)
    - [ ] API endpoint permissions

3. **Input Validation Testing**
    - [ ] SQL injection (all input fields)
    - [ ] XSS (cross-site scripting)
    - [ ] Command injection
    - [ ] Path traversal (`../../etc/passwd`)
    - [ ] XML external entity (XXE)

4. **Business Logic Testing**
    - [ ] Enrollment bypass
    - [ ] Grade manipulation
    - [ ] AI feature access without approval
    - [ ] File upload abuse

5. **API Security Testing**
    - [ ] CORS misconfiguration
    - [ ] Rate limiting
    - [ ] Mass assignment vulnerabilities
    - [ ] API key exposure

### Penetration Testing Tools

```bash
# OWASP ZAP (Web Application Scanner)
# https://www.zaproxy.org/

# Burp Suite (HTTP Proxy & Scanner)
# https://portswigger.net/burp

# SQLMap (SQL Injection)
sqlmap -u "http://localhost:8000/api/users/login/" --data="username=test&password=test"

# Nikto (Web Server Scanner)
nikto -h http://localhost:8000
```

---

## 🚀 Deployment Security

### Docker Security

```dockerfile
# Use non-root user
FROM python:3.10-slim
RUN useradd -m -u 1000 eduai
USER eduai

# Don't expose unnecessary ports
EXPOSE 8000

# Use secrets management
RUN --mount=type=secret,id=django_secret \
    SECRET_KEY=$(cat /run/secrets/django_secret)
```

### Environment Variables (Production)

```bash
# .env.production (DO NOT COMMIT)
SECRET_KEY=<50-char-random-string>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_ENGINE=postgresql
DB_NAME=eduai_prod
DB_USER=eduai_user
DB_PASSWORD=<strong-password>
DB_HOST=localhost
DB_PORT=5432

# Gemini AI
GEMINI_API_KEY=<your-api-key>

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=<app-password>

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Redis
REDIS_URL=redis://localhost:6379/0

# Sentry (Error Tracking)
SENTRY_DSN=<your-sentry-dsn>
```

### Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    location /api/users/login/ {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://127.0.0.1:8000;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📋 Security Incident Response

### In Case of Security Breach

1. **Immediate Actions** (within 1 hour)
    - [ ] Assess the extent of the breach
    - [ ] Isolate affected systems
    - [ ] Preserve logs and evidence
    - [ ] Notify security team

2. **Containment** (within 24 hours)
    - [ ] Patch the vulnerability
    - [ ] Reset all compromised passwords
    - [ ] Revoke compromised tokens/API keys
    - [ ] Block malicious IP addresses
    - [ ] Review access logs

3. **Eradication** (within 1 week)
    - [ ] Remove malware/backdoors
    - [ ] Close all security holes
    - [ ] Update all dependencies
    - [ ] Conduct security audit

4. **Recovery** (within 2 weeks)
    - [ ] Restore from clean backups
    - [ ] Rebuild compromised systems
    - [ ] Implement additional security measures
    - [ ] Monitor for suspicious activity

5. **Post-Incident** (within 1 month)
    - [ ] Conduct post-mortem analysis
    - [ ] Document lessons learned
    - [ ] Update security policies
    - [ ] Notify affected users (if required by law)
    - [ ] Submit incident report

### Legal Requirements

- **FERPA** (Family Educational Rights and Privacy Act) - US
- **GDPR** (General Data Protection Regulation) - EU
- **COPPA** (Children's Online Privacy Protection Act) - US
- **Data Breach Notification Laws** (varies by state/country)

**Notification Timeline**: Within 72 hours of discovery (GDPR)

---

## 🔗 Security Resources

### Official Documentation

- [Django Security](https://docs.djangoproject.com/en/4.2/topics/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Security Tools

- [Snyk](https://snyk.io/) - Dependency scanning
- [Bandit](https://github.com/PyCQA/bandit) - Python security linter
- [OWASP ZAP](https://www.zaproxy.org/) - Web app scanner
- [Burp Suite](https://portswigger.net/burp) - Security testing
- [Nmap](https://nmap.org/) - Network scanner
- [Wireshark](https://www.wireshark.org/) - Network analysis

### Learning Resources

- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackerOne CTF](https://www.hackerone.com/for-hackers/capture-the-flag)
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [Damn Vulnerable Web Application (DVWA)](https://dvwa.co.uk/)

---

## 📜 Compliance & Standards

### Security Standards

- ✅ OWASP Top 10 (2021)
- ✅ CWE/SANS Top 25
- ⏳ ISO 27001 (in progress)
- ⏳ SOC 2 Type II (planned)

### Data Privacy Regulations

- ⏳ GDPR compliance (EU)
- ⏳ FERPA compliance (US education)
- ⏳ COPPA compliance (under 13)
- ⏳ CCPA compliance (California)

---

## 🤝 Security Team

### Contact Information

- **Security Email**: security@eduai.com
- **Bug Bounty**: Not currently active (planned)
- **Security Team Lead**: TBD
- **Response Time**: 24-48 hours

### Hall of Fame

We recognize and thank security researchers who responsibly disclose vulnerabilities:

- *Your name here* - First security researcher to report a vulnerability
- (Hall of Fame will be updated as researchers contribute)

---

## 📅 Security Updates

### Version History

| Version | Date | Security Changes |
|---------|------|------------------|
| 3.0 | 2025 | Initial security documentation, RBAC implementation |
| 2.0 | 2024 | AI integration security review |
| 1.0 | 2024 | Initial release |

### Planned Security Enhancements

- [ ] Two-factor authentication (Q2 2025)
- [ ] Bug bounty program (Q3 2025)
- [ ] Security audit by third party (Q4 2025)
- [ ] ISO 27001 certification (2026)

---

## 📝 License

This security policy is part of the EduAI project and is licensed under the MIT License.

---

**Last Updated**: 2025  
**Next Review**: Quarterly  
**Maintained By**: EduAI Security Team

**Remember**: Security is everyone's responsibility. If you see something, say something! 🔐
