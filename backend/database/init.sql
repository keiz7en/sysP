-- EduAI Education System Database Schema
-- Initial database setup with all required tables

-- ==========================================
-- USERS AND AUTHENTICATION TABLES
-- ==========================================

-- Main users table
CREATE TABLE IF NOT EXISTS users
(
    id
    SERIAL
    PRIMARY
    KEY,
    username
    VARCHAR
(
    150
) UNIQUE NOT NULL,
    email VARCHAR
(
    254
) UNIQUE NOT NULL,
    password_hash VARCHAR
(
    128
) NOT NULL,
    first_name VARCHAR
(
    50
) NOT NULL,
    last_name VARCHAR
(
    50
) NOT NULL,
    user_type VARCHAR
(
    20
) NOT NULL CHECK
(
    user_type
    IN
(
    'student',
    'teacher',
    'admin'
)),
    phone_number VARCHAR
(
    20
),
    address TEXT,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    profile_image VARCHAR
(
    255
)
    );

-- User profiles table (extended information)
CREATE TABLE IF NOT EXISTS user_profiles
(
    id
    SERIAL
    PRIMARY
    KEY,
    user_id
    INTEGER
    UNIQUE
    NOT
    NULL
    REFERENCES
    users
(
    id
) ON DELETE CASCADE,
    bio TEXT,
    preferred_language VARCHAR
(
    10
) DEFAULT 'en',
    timezone VARCHAR
(
    50
) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Authentication tokens table
CREATE TABLE IF NOT EXISTS auth_tokens
(
    id
    SERIAL
    PRIMARY
    KEY,
    user_id
    INTEGER
    NOT
    NULL
    REFERENCES
    users
(
    id
) ON DELETE CASCADE,
    token VARCHAR
(
    255
) UNIQUE NOT NULL,
    token_type VARCHAR
(
    20
) DEFAULT 'auth' CHECK
(
    token_type
    IN
(
    'auth',
    'reset',
    'verify'
)),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
    );

-- ==========================================
-- STUDENT-SPECIFIC TABLES
-- ==========================================

-- Student profiles with academic information
CREATE TABLE IF NOT EXISTS student_profiles
(
    id
    SERIAL
    PRIMARY
    KEY,
    user_id
    INTEGER
    UNIQUE
    NOT
    NULL
    REFERENCES
    users
(
    id
) ON DELETE CASCADE,
    student_id VARCHAR
(
    10
) UNIQUE NOT NULL,
    grade_level VARCHAR
(
    20
) DEFAULT 'Freshman',
    current_gpa DECIMAL
(
    3,
    2
) DEFAULT 0.00,
    total_credits INTEGER DEFAULT 0,
    academic_status VARCHAR
(
    20
) DEFAULT 'active' CHECK
(
    academic_status
    IN
(
    'active',
    'inactive',
    'graduated',
    'suspended'
)),
    learning_style VARCHAR
(
    20
) DEFAULT 'adaptive',
    enrollment_date DATE DEFAULT CURRENT_DATE,
    expected_graduation DATE,
    guardian_name VARCHAR
(
    100
),
    guardian_phone VARCHAR
(
    20
),
    guardian_email VARCHAR
(
    254
),
    emergency_contact VARCHAR
(
    100
),
    emergency_phone VARCHAR
(
    20
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Student academic records
CREATE TABLE IF NOT EXISTS student_academic_records
(
    id
    SERIAL
    PRIMARY
    KEY,
    student_id
    INTEGER
    NOT
    NULL
    REFERENCES
    student_profiles
(
    id
) ON DELETE CASCADE,
    semester VARCHAR
(
    20
) NOT NULL,
    year INTEGER NOT NULL,
    course_code VARCHAR
(
    20
) NOT NULL,
    course_name VARCHAR
(
    100
) NOT NULL,
    credits INTEGER NOT NULL,
    grade VARCHAR
(
    5
),
    grade_points DECIMAL
(
    3,
    2
),
    status VARCHAR
(
    20
) DEFAULT 'in_progress' CHECK
(
    status
    IN
(
    'in_progress',
    'completed',
    'withdrawn',
    'failed'
)),
    instructor VARCHAR
(
    100
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Student learning analytics
CREATE TABLE IF NOT EXISTS student_learning_analytics
(
    id
    SERIAL
    PRIMARY
    KEY,
    student_id
    INTEGER
    NOT
    NULL
    REFERENCES
    student_profiles
(
    id
) ON DELETE CASCADE,
    subject VARCHAR
(
    50
) NOT NULL,
    study_hours INTEGER DEFAULT 0,
    completion_rate DECIMAL
(
    5,
    2
) DEFAULT 0.00,
    performance_score DECIMAL
(
    5,
    2
) DEFAULT 0.00,
    learning_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    insights JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- ==========================================
-- TEACHER-SPECIFIC TABLES
-- ==========================================

-- Teacher profiles with professional information
CREATE TABLE IF NOT EXISTS teacher_profiles
(
    id
    SERIAL
    PRIMARY
    KEY,
    user_id
    INTEGER
    UNIQUE
    NOT
    NULL
    REFERENCES
    users
(
    id
) ON DELETE CASCADE,
    employee_id VARCHAR
(
    10
) UNIQUE NOT NULL,
    department VARCHAR
(
    50
) DEFAULT 'General',
    specialization VARCHAR
(
    100
),
    qualification VARCHAR
(
    200
),
    experience_years INTEGER DEFAULT 0,
    teaching_rating DECIMAL
(
    3,
    2
) DEFAULT 0.00,
    hire_date DATE DEFAULT CURRENT_DATE,
    salary DECIMAL
(
    10,
    2
),
    employment_status VARCHAR
(
    20
) DEFAULT 'active' CHECK
(
    employment_status
    IN
(
    'active',
    'inactive',
    'terminated',
    'retired'
)),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users
(
    id
),
    approved_at TIMESTAMP,
    office_location VARCHAR
(
    100
),
    office_hours VARCHAR
(
    200
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Teacher-student relationships (which teacher manages which students)
CREATE TABLE IF NOT EXISTS teacher_students
(
    id
    SERIAL
    PRIMARY
    KEY,
    teacher_id
    INTEGER
    NOT
    NULL
    REFERENCES
    teacher_profiles
(
    id
) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES student_profiles
(
    id
)
  ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users
(
    id
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE
(
    teacher_id,
    student_id
)
    );

-- Teacher performance metrics
CREATE TABLE IF NOT EXISTS teacher_performance
(
    id
    SERIAL
    PRIMARY
    KEY,
    teacher_id
    INTEGER
    NOT
    NULL
    REFERENCES
    teacher_profiles
(
    id
) ON DELETE CASCADE,
    semester VARCHAR
(
    20
) NOT NULL,
    year INTEGER NOT NULL,
    total_students INTEGER DEFAULT 0,
    average_student_rating DECIMAL
(
    3,
    2
) DEFAULT 0.00,
    course_completion_rate DECIMAL
(
    5,
    2
) DEFAULT 0.00,
    student_success_rate DECIMAL
(
    5,
    2
) DEFAULT 0.00,
    professional_development_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- ==========================================
-- COURSES AND CURRICULUM TABLES
-- ==========================================

-- Courses offered by the institution
CREATE TABLE IF NOT EXISTS courses
(
    id
    SERIAL
    PRIMARY
    KEY,
    course_code
    VARCHAR
(
    20
) UNIQUE NOT NULL,
    course_name VARCHAR
(
    100
) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    department VARCHAR
(
    50
),
    level VARCHAR
(
    20
) DEFAULT 'undergraduate',
    prerequisites TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments
(
    id
    SERIAL
    PRIMARY
    KEY,
    student_id
    INTEGER
    NOT
    NULL
    REFERENCES
    student_profiles
(
    id
) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses
(
    id
)
  ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teacher_profiles
(
    id
),
    semester VARCHAR
(
    20
) NOT NULL,
    year INTEGER NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR
(
    20
) DEFAULT 'enrolled' CHECK
(
    status
    IN
(
    'enrolled',
    'completed',
    'withdrawn',
    'failed'
)),
    final_grade VARCHAR
(
    5
),
    grade_points DECIMAL
(
    3,
    2
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE
(
    student_id,
    course_id,
    semester,
    year
)
    );

-- ==========================================
-- ASSESSMENTS AND ASSIGNMENTS TABLES
-- ==========================================

-- Assignments and assessments
CREATE TABLE IF NOT EXISTS assignments
(
    id
    SERIAL
    PRIMARY
    KEY,
    course_id
    INTEGER
    NOT
    NULL
    REFERENCES
    courses
(
    id
) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teacher_profiles
(
    id
)
  ON DELETE CASCADE,
    title VARCHAR
(
    200
) NOT NULL,
    description TEXT,
    assignment_type VARCHAR
(
    20
) DEFAULT 'assignment' CHECK
(
    assignment_type
    IN
(
    'assignment',
    'quiz',
    'exam',
    'project'
)),
    max_points DECIMAL
(
    5,
    2
) NOT NULL,
    due_date TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Student assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions
(
    id
    SERIAL
    PRIMARY
    KEY,
    assignment_id
    INTEGER
    NOT
    NULL
    REFERENCES
    assignments
(
    id
) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES student_profiles
(
    id
)
  ON DELETE CASCADE,
    submission_text TEXT,
    file_attachments JSONB DEFAULT '[]',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_earned DECIMAL
(
    5,
    2
),
    feedback TEXT,
    graded_by INTEGER REFERENCES teacher_profiles
(
    id
),
    graded_at TIMESTAMP,
    status VARCHAR
(
    20
) DEFAULT 'submitted' CHECK
(
    status
    IN
(
    'draft',
    'submitted',
    'graded',
    'returned'
)),
    UNIQUE
(
    assignment_id,
    student_id
)
    );

-- ==========================================
-- SYSTEM ADMINISTRATION TABLES
-- ==========================================

-- System settings
CREATE TABLE IF NOT EXISTS system_settings
(
    id
    SERIAL
    PRIMARY
    KEY,
    setting_key
    VARCHAR
(
    50
) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log
(
    id
    SERIAL
    PRIMARY
    KEY,
    user_id
    INTEGER
    REFERENCES
    users
(
    id
),
    action VARCHAR
(
    50
) NOT NULL,
    table_name VARCHAR
(
    50
) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications
(
    id
    SERIAL
    PRIMARY
    KEY,
    user_id
    INTEGER
    NOT
    NULL
    REFERENCES
    users
(
    id
) ON DELETE CASCADE,
    title VARCHAR
(
    200
) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR
(
    20
) DEFAULT 'info' CHECK
(
    notification_type
    IN
(
    'info',
    'success',
    'warning',
    'error'
)),
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR
(
    500
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
    );

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Student profiles indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_academic_status ON student_profiles(academic_status);

-- Teacher profiles indexes
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_employee_id ON teacher_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_department ON teacher_profiles(department);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_is_approved ON teacher_profiles(is_approved);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_semester_year ON course_enrollments(semester, year);

-- Assignments indexes
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- Auth tokens indexes
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- ==========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==========================================

-- Function to update timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at
= CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$
language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE
    ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE
    ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at
    BEFORE UPDATE
    ON teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE
    ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE
    ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INITIAL DATA INSERTS
-- ==========================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public)
VALUES ('app_name', 'EduAI Education System', 'Application name', true),
       ('app_version', '1.0.0', 'Application version', true),
       ('max_students_per_teacher', '100', 'Maximum students a teacher can manage', false),
       ('default_semester_duration', '16', 'Default semester duration in weeks', false),
       ('grade_scale', 'A,B,C,D,F', 'Available grade options', false),
       ('academic_year_start', '09-01', 'Academic year start date (MM-DD)', true),
       ('academic_year_end', '05-31', 'Academic year end date (MM-DD)', true) ON CONFLICT (setting_key) DO NOTHING;

-- Insert default admin user (password should be changed immediately)
INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, is_active, is_verified)
VALUES ('admin', 'admin@eduai.com', 'pbkdf2_sha256$320000$dummy$hash', 'System', 'Administrator', 'admin', true,
        true) ON CONFLICT (username) DO NOTHING;

-- Create default user profile for admin
INSERT INTO user_profiles (user_id, bio)
SELECT id, 'System Administrator Account'
FROM users
WHERE username = 'admin' ON CONFLICT (user_id) DO NOTHING;

-- ==========================================
-- VIEWS FOR COMMON QUERIES
-- ==========================================

-- View for complete student information
CREATE
OR REPLACE VIEW student_complete_info AS
SELECT u.id         as user_id,
       u.username,
       u.email,
       u.first_name,
       u.last_name,
       u.phone_number,
       u.address,
       u.is_active,
       u.created_at as user_created_at,
       sp.id        as student_profile_id,
       sp.student_id,
       sp.grade_level,
       sp.current_gpa,
       sp.total_credits,
       sp.academic_status,
       sp.learning_style,
       sp.enrollment_date,
       sp.guardian_name,
       sp.guardian_phone,
       sp.guardian_email
FROM users u
         INNER JOIN student_profiles sp ON u.id = sp.user_id
WHERE u.user_type = 'student';

-- View for complete teacher information
CREATE
OR REPLACE VIEW teacher_complete_info AS
SELECT u.id         as user_id,
       u.username,
       u.email,
       u.first_name,
       u.last_name,
       u.phone_number,
       u.address,
       u.is_active,
       u.created_at as user_created_at,
       tp.id        as teacher_profile_id,
       tp.employee_id,
       tp.department,
       tp.specialization,
       tp.qualification,
       tp.experience_years,
       tp.teaching_rating,
       tp.hire_date,
       tp.employment_status,
       tp.is_approved,
       tp.office_location,
       tp.office_hours
FROM users u
         INNER JOIN teacher_profiles tp ON u.id = tp.user_id
WHERE u.user_type = 'teacher';

-- View for teacher-student relationships
CREATE
OR REPLACE VIEW teacher_student_relationships AS
SELECT t.employee_id                            as teacher_employee_id,
       CONCAT(tu.first_name, ' ', tu.last_name) as teacher_name,
       t.department                             as teacher_department,
       s.student_id,
       CONCAT(su.first_name, ' ', su.last_name) as student_name,
       s.grade_level,
       s.current_gpa,
       ts.assigned_date,
       ts.is_active
FROM teacher_students ts
         INNER JOIN teacher_profiles t ON ts.teacher_id = t.id
         INNER JOIN users tu ON t.user_id = tu.id
         INNER JOIN student_profiles s ON ts.student_id = s.id
         INNER JOIN users su ON s.user_id = su.id
WHERE ts.is_active = true;

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

-- Procedure to create a new student account
CREATE
OR REPLACE FUNCTION create_student_account(
    p_username VARCHAR(150),
    p_email VARCHAR(254),
    p_password_hash VARCHAR(128),
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_phone_number VARCHAR(20) DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_guardian_name VARCHAR(100) DEFAULT NULL,
    p_guardian_phone VARCHAR(20) DEFAULT NULL,
    p_guardian_email VARCHAR(254) DEFAULT NULL
) RETURNS TABLE(user_id INTEGER, student_id VARCHAR(10)) AS $$
DECLARE
new_user_id INTEGER;
    new_student_id
VARCHAR(10);
    attempt_count
INTEGER := 0;
BEGIN
    -- Generate unique student ID
    LOOP
new_student_id := LPAD(FLOOR(random() * 9000000 + 1000000)::TEXT, 7, '0');
        EXIT
WHEN NOT EXISTS (SELECT 1 FROM student_profiles WHERE student_profiles.student_id = new_student_id);
        attempt_count
:= attempt_count + 1;
        IF
attempt_count > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique student ID';
END IF;
END LOOP;

    -- Insert user
INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, phone_number, address, is_active,
                   is_verified)
VALUES (p_username, p_email, p_password_hash, p_first_name, p_last_name, 'student', p_phone_number, p_address, true,
        true) RETURNING id
INTO new_user_id;

-- Insert user profile
INSERT INTO user_profiles (user_id, bio)
VALUES (new_user_id, 'Student at EduAI Education System');

-- Insert student profile
INSERT INTO student_profiles (user_id, student_id, guardian_name, guardian_phone, guardian_email,
                              grade_level, current_gpa, academic_status, learning_style)
VALUES (new_user_id, new_student_id, p_guardian_name, p_guardian_phone, p_guardian_email,
        'Freshman', 0.00, 'active', 'adaptive');

-- Log the creation
INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
VALUES (new_user_id, 'CREATE', 'users', new_user_id,
        json_build_object('user_type', 'student', 'student_id', new_student_id));

RETURN QUERY SELECT new_user_id, new_student_id;
END;
$$
LANGUAGE plpgsql;

-- Procedure to create a new teacher account
CREATE
OR REPLACE FUNCTION create_teacher_account(
    p_username VARCHAR(150),
    p_email VARCHAR(254),
    p_password_hash VARCHAR(128),
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_phone_number VARCHAR(20) DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_department VARCHAR(50) DEFAULT 'General',
    p_specialization VARCHAR(100) DEFAULT NULL,
    p_qualification VARCHAR(200) DEFAULT NULL
) RETURNS TABLE(user_id INTEGER, employee_id VARCHAR(10)) AS $$
DECLARE
new_user_id INTEGER;
    new_employee_id
VARCHAR(10);
    attempt_count
INTEGER := 0;
BEGIN
    -- Generate unique employee ID
    LOOP
new_employee_id := 'EMP' || LPAD(FLOOR(random() * 9000 + 1000)::TEXT, 4, '0');
        EXIT
WHEN NOT EXISTS (SELECT 1 FROM teacher_profiles WHERE teacher_profiles.employee_id = new_employee_id);
        attempt_count
:= attempt_count + 1;
        IF
attempt_count > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique employee ID';
END IF;
END LOOP;

    -- Insert user
INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, phone_number, address, is_active,
                   is_verified)
VALUES (p_username, p_email, p_password_hash, p_first_name, p_last_name, 'teacher', p_phone_number, p_address, true,
        false) RETURNING id
INTO new_user_id;

-- Insert user profile
INSERT INTO user_profiles (user_id, bio)
VALUES (new_user_id, CONCAT('Teacher in ', p_department, ' department at EduAI Education System'));

-- Insert teacher profile (needs approval)
INSERT INTO teacher_profiles (user_id, employee_id, department, specialization, qualification,
                              experience_years, teaching_rating, employment_status, is_approved)
VALUES (new_user_id, new_employee_id, p_department, p_specialization, p_qualification,
        0, 0.00, 'active', false);

-- Log the creation
INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
VALUES (new_user_id, 'CREATE', 'users', new_user_id,
        json_build_object('user_type', 'teacher', 'employee_id', new_employee_id));

RETURN QUERY SELECT new_user_id, new_employee_id;
END;
$$
LANGUAGE plpgsql;

-- Procedure to delete user account (soft delete)
CREATE
OR REPLACE FUNCTION delete_user_account(p_user_id INTEGER, p_deleted_by INTEGER DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
user_record RECORD;
BEGIN
    -- Get user information for logging
SELECT *
INTO user_record
FROM users
WHERE id = p_user_id;

IF
NOT FOUND THEN
        RETURN FALSE;
END IF;

    -- Log the deletion
INSERT INTO audit_log (user_id, action, table_name, record_id, old_values)
VALUES (p_deleted_by, 'DELETE', 'users', p_user_id,
        json_build_object('username', user_record.username, 'email', user_record.email, 'user_type',
                          user_record.user_type));

-- Soft delete - mark as inactive instead of actual deletion
UPDATE users
SET is_active  = false,
    updated_at = CURRENT_TIMESTAMP
WHERE id = p_user_id;

-- Update related profiles
IF
user_record.user_type = 'student' THEN
UPDATE student_profiles
SET academic_status = 'inactive'
WHERE user_id = p_user_id;
ELSIF
user_record.user_type = 'teacher' THEN
UPDATE teacher_profiles
SET employment_status = 'terminated'
WHERE user_id = p_user_id;
END IF;

RETURN TRUE;
END;
$$
LANGUAGE plpgsql;

-- ==========================================
-- DATABASE MAINTENANCE FUNCTIONS
-- ==========================================

-- Function to clean up expired tokens
CREATE
OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
deleted_count INTEGER;
BEGIN
DELETE
FROM auth_tokens
WHERE expires_at < CURRENT_TIMESTAMP;
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$$
LANGUAGE plpgsql;

-- Function to get database statistics
CREATE
OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE(
    total_users INTEGER,
    active_students INTEGER,
    active_teachers INTEGER,
    pending_teacher_approvals INTEGER,
    total_courses INTEGER,
    active_enrollments INTEGER
) AS $$
BEGIN
RETURN QUERY
SELECT (SELECT COUNT(*) ::INTEGER FROM users WHERE is_active = true)                 as total_users,
       (SELECT COUNT(*) ::INTEGER
        FROM student_profiles sp
                 JOIN users u ON sp.user_id = u.id
        WHERE u.is_active = true
          AND sp.academic_status = 'active')                                         as active_students,
       (SELECT COUNT(*) ::INTEGER
        FROM teacher_profiles tp
                 JOIN users u ON tp.user_id = u.id
        WHERE u.is_active = true
          AND tp.employment_status = 'active'
          AND tp.is_approved = true)                                                 as active_teachers,
       (SELECT COUNT(*) ::INTEGER
        FROM teacher_profiles tp
                 JOIN users u ON tp.user_id = u.id
        WHERE u.is_active = true
          AND tp.is_approved = false)                                                as pending_teacher_approvals,
       (SELECT COUNT(*) ::INTEGER FROM courses WHERE is_active = true)               as total_courses,
       (SELECT COUNT(*) ::INTEGER FROM course_enrollments WHERE status = 'enrolled') as active_enrollments;
END;
$$
LANGUAGE plpgsql;

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

-- Insert a completion log
INSERT INTO audit_log (action, table_name, record_id, new_values)
VALUES ('SYSTEM', 'database_init', 0,
        json_build_object('status', 'completed', 'timestamp', CURRENT_TIMESTAMP, 'version', '1.0.0'));

-- Display completion message
DO
$$
BEGIN
    RAISE
NOTICE 'EduAI Education System Database Schema has been successfully initialized!';
    RAISE
NOTICE 'Database version: 1.0.0';
    RAISE
NOTICE 'Total tables created: 19';
    RAISE
NOTICE 'Total views created: 3';
    RAISE
NOTICE 'Total functions created: 6';
    RAISE
NOTICE 'Total triggers created: 6';
    RAISE
NOTICE 'Database is ready for use!';
END $$;