-- Common Database Queries for EduAI Education System
-- This file contains frequently used queries for the application

-- ==========================================
-- USER MANAGEMENT QUERIES
-- ==========================================

-- Get all users with their profiles
SELECT u.id,
       u.username,
       u.email,
       u.first_name,
       u.last_name,
       u.user_type,
       u.phone_number,
       u.address,
       u.is_active,
       u.created_at,
       up.bio,
       up.preferred_language
FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
ORDER BY u.created_at DESC;

-- Get user statistics by type
SELECT user_type,
       COUNT(*) as total,
       COUNT(*)    FILTER (WHERE is_active = true) as active, COUNT(*) FILTER (WHERE is_verified = true) as verified
FROM users
GROUP BY user_type;

-- ==========================================
-- STUDENT MANAGEMENT QUERIES
-- ==========================================

-- Get all students with complete information
SELECT *
FROM student_complete_info
WHERE is_active = true
ORDER BY student_id;

-- Get students by teacher
SELECT s.student_id,
       s.first_name,
       s.last_name,
       s.email,
       s.current_gpa,
       s.grade_level,
       s.academic_status,
       ts.assigned_date
FROM student_complete_info s
         JOIN teacher_students ts ON s.student_profile_id = ts.student_id
         JOIN teacher_profiles tp ON ts.teacher_id = tp.id
WHERE tp.employee_id = 'EMP1001' -- Replace with actual employee ID
  AND ts.is_active = true;

-- Get student academic performance
SELECT sp.student_id,
       CONCAT(u.first_name, ' ', u.last_name) as student_name,
       sp.current_gpa,
       sp.total_credits,
       COUNT(ce.id)                           as total_courses,
       COUNT(ce.id)                              FILTER (WHERE ce.status = 'completed') as completed_courses, AVG(ce.grade_points) as average_grade_points
FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
         LEFT JOIN course_enrollments ce ON sp.id = ce.student_id
WHERE u.is_active = true
GROUP BY sp.id, sp.student_id, u.first_name, u.last_name, sp.current_gpa, sp.total_credits
ORDER BY sp.current_gpa DESC;

-- Get top performing students
SELECT sp.student_id,
       CONCAT(u.first_name, ' ', u.last_name) as student_name,
       sp.current_gpa,
       sp.grade_level,
       sp.academic_status
FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
WHERE u.is_active = true
  AND sp.academic_status = 'active'
ORDER BY sp.current_gpa DESC LIMIT 10;

-- ==========================================
-- TEACHER MANAGEMENT QUERIES  
-- ==========================================

-- Get all teachers with complete information
SELECT *
FROM teacher_complete_info
WHERE is_active = true
ORDER BY employee_id;

-- Get teachers pending approval
SELECT t.employee_id,
       t.first_name,
       t.last_name,
       t.email,
       t.department,
       t.specialization,
       t.qualification,
       t.user_created_at
FROM teacher_complete_info t
WHERE t.is_approved = false
  AND t.is_active = true
ORDER BY t.user_created_at;

-- Get teacher performance summary
SELECT tp.employee_id,
       CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
       tp.department,
       tp.teaching_rating,
       COUNT(ts.id)                           as total_students,
       COUNT(ce.id)                           as total_enrollments,
       AVG(ce.grade_points)                   as average_student_grade
FROM teacher_profiles tp
         JOIN users u ON tp.user_id = u.id
         LEFT JOIN teacher_students ts ON tp.id = ts.teacher_id AND ts.is_active = true
         LEFT JOIN course_enrollments ce ON ts.student_id = ce.student_id
WHERE u.is_active = true
  AND tp.is_approved = true
GROUP BY tp.id, tp.employee_id, u.first_name, u.last_name, tp.department, tp.teaching_rating
ORDER BY tp.teaching_rating DESC;

-- ==========================================
-- COURSE AND ENROLLMENT QUERIES
-- ==========================================

-- Get all courses with enrollment statistics
SELECT c.course_code,
       c.course_name,
       c.credits,
       c.department,
       COUNT(ce.id) as total_enrollments,
       COUNT(ce.id)    FILTER (WHERE ce.status = 'enrolled') as active_enrollments, COUNT(ce.id) FILTER (WHERE ce.status = 'completed') as completed_enrollments, AVG(ce.grade_points) as average_grade
FROM courses c
         LEFT JOIN course_enrollments ce ON c.id = ce.course_id
WHERE c.is_active = true
GROUP BY c.id, c.course_code, c.course_name, c.credits, c.department
ORDER BY total_enrollments DESC;

-- Get student course enrollment details
SELECT ce.semester,
       ce.year,
       c.course_code,
       c.course_name,
       c.credits,
       CONCAT(tu.first_name, ' ', tu.last_name) as instructor,
       ce.status,
       ce.final_grade,
       ce.grade_points,
       ce.enrollment_date
FROM course_enrollments ce
         JOIN courses c ON ce.course_id = c.id
         JOIN teacher_profiles tp ON ce.teacher_id = tp.id
         JOIN users tu ON tp.user_id = tu.id
WHERE ce.student_id = (SELECT id FROM student_profiles WHERE student_id = '12345') -- Replace with actual student ID
ORDER BY ce.year DESC, ce.semester, c.course_code;

-- ==========================================
-- ASSIGNMENT AND ASSESSMENT QUERIES
-- ==========================================

-- Get assignments for a specific course
SELECT a.id,
       a.title,
       a.assignment_type,
       a.max_points,
       a.due_date,
       a.is_published,
       COUNT(asub.id) as submission_count,
       COUNT(asub.id)    FILTER (WHERE asub.status = 'graded') as graded_count
FROM assignments a
         LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
WHERE a.course_id = (SELECT id FROM courses WHERE course_code = 'CS101') -- Replace with actual course ID
GROUP BY a.id, a.title, a.assignment_type, a.max_points, a.due_date, a.is_published
ORDER BY a.due_date;

-- Get student assignment submissions with grades
SELECT a.title                                                       as assignment_title,
       a.assignment_type,
       a.max_points,
       a.due_date,
       asub.submitted_at,
       asub.points_earned,
       asub.feedback,
       asub.status,
       ROUND((asub.points_earned / a.max_points * 100):: numeric, 2) as percentage_score
FROM assignment_submissions asub
         JOIN assignments a ON asub.assignment_id = a.id
WHERE asub.student_id = (SELECT id FROM student_profiles WHERE student_id = '12345') -- Replace with actual student ID
ORDER BY a.due_date DESC;

-- ==========================================
-- ANALYTICS AND REPORTING QUERIES
-- ==========================================

-- Student learning analytics summary
SELECT sla.subject,
       sla.study_hours,
       sla.completion_rate,
       sla.performance_score,
       sla.learning_streak,
       sla.last_activity,
       sla.insights,
       sla.recommendations
FROM student_learning_analytics sla
         JOIN student_profiles sp ON sla.student_id = sp.id
WHERE sp.student_id = '12345' -- Replace with actual student ID
ORDER BY sla.performance_score DESC;

-- Teacher performance analytics
SELECT tp.employee_id,
       CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
       tp.department,
       tperf.semester,
       tperf.year,
       tperf.total_students,
       tperf.average_student_rating,
       tperf.course_completion_rate,
       tperf.student_success_rate,
       tperf.professional_development_hours
FROM teacher_performance tperf
         JOIN teacher_profiles tp ON tperf.teacher_id = tp.id
         JOIN users u ON tp.user_id = u.id
WHERE tp.is_approved = true
ORDER BY tperf.year DESC, tperf.semester, tperf.average_student_rating DESC;

-- Department performance summary
SELECT tp.department,
       COUNT(DISTINCT tp.id)         as teacher_count,
       COUNT(DISTINCT ts.student_id) as student_count,
       AVG(tp.teaching_rating)       as avg_teaching_rating,
       AVG(sp.current_gpa)           as avg_student_gpa,
       COUNT(DISTINCT ce.course_id)  as courses_offered
FROM teacher_profiles tp
         JOIN users u ON tp.user_id = u.id
         LEFT JOIN teacher_students ts ON tp.id = ts.teacher_id AND ts.is_active = true
         LEFT JOIN student_profiles sp ON ts.student_id = sp.id
         LEFT JOIN course_enrollments ce ON sp.id = ce.student_id
WHERE u.is_active = true
  AND tp.is_approved = true
GROUP BY tp.department
ORDER BY avg_student_gpa DESC;

-- ==========================================
-- SYSTEM MONITORING QUERIES
-- ==========================================

-- Recent system activity
SELECT al.created_at,
       al.action,
       al.table_name,
       CONCAT(u.first_name, ' ', u.last_name) as user_name,
       u.user_type,
       al.new_values ->>'user_type' as affected_user_type
FROM audit_log al
    LEFT JOIN users u
ON al.user_id = u.id
WHERE al.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY al.created_at DESC
    LIMIT 50;

-- User login activity
SELECT u.username,
       u.user_type,
       u.last_login,
       CASE
           WHEN u.last_login > CURRENT_TIMESTAMP - INTERVAL '1 day' THEN 'Today'
    WHEN u.last_login > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 'This Week'
    WHEN u.last_login > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 'This Month'
    ELSE 'Older'
END
as last_seen
FROM users u
WHERE u.is_active = true AND u.last_login IS NOT NULL
ORDER BY u.last_login DESC;

-- Token usage statistics
SELECT
    DATE (at.created_at) as date, COUNT (*) as tokens_created, COUNT (*) FILTER (WHERE at.is_active = true) as active_tokens, COUNT (DISTINCT at.user_id) as unique_users
FROM auth_tokens at
WHERE at.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE (at.created_at)
ORDER BY date DESC;

-- ==========================================
-- MAINTENANCE QUERIES
-- ==========================================

-- Find duplicate student IDs (should return empty)
SELECT student_id, COUNT(*)
FROM student_profiles
GROUP BY student_id
HAVING COUNT(*) > 1;

-- Find duplicate employee IDs (should return empty)
SELECT employee_id, COUNT(*)
FROM teacher_profiles
GROUP BY employee_id
HAVING COUNT(*) > 1;

-- Find users without profiles
SELECT u.id, u.username, u.user_type
FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.id IS NULL
  AND u.is_active = true;

-- Find orphaned profiles
SELECT 'student_profiles' as table_name, sp.id, sp.user_id
FROM student_profiles sp
         LEFT JOIN users u ON sp.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'teacher_profiles' as table_name, tp.id, tp.user_id
FROM teacher_profiles tp
         LEFT JOIN users u ON tp.user_id = u.id
WHERE u.id IS NULL;

-- ==========================================
-- CLEANUP QUERIES
-- ==========================================

-- Clean up expired tokens
SELECT cleanup_expired_tokens() as expired_tokens_removed;

-- Get database size information
SELECT schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Get table row counts
SELECT schemaname,
       tablename,
       n_tup_ins  as inserts,
       n_tup_upd  as updates,
       n_tup_del  as deletes,
       n_live_tup as live_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY live_rows DESC;

-- ==========================================
-- BACKUP AND RESTORE HELPERS
-- ==========================================

-- Generate backup script for essential data
SELECT 'COPY ' || table_name || ' TO ''/tmp/' || table_name || '.csv'' WITH CSV HEADER;' as backup_command
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'user_profiles', 'student_profiles', 'teacher_profiles');

-- ==========================================
-- PERFORMANCE MONITORING
-- ==========================================

-- Check for slow queries and missing indexes
SELECT query,
       calls,
       total_time,
       mean_time, rows
FROM pg_stat_statements
WHERE mean_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_time DESC
    LIMIT 10;

-- Check index usage
SELECT schemaname,
       tablename,
       indexname,
       idx_scan      as index_scans,
       idx_tup_read  as tuples_read,
       idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ==========================================
-- DATA VALIDATION QUERIES
-- ==========================================

-- Validate student data integrity
SELECT 'Missing student profiles' as issue,
       COUNT(*) as count
FROM users u
    LEFT JOIN student_profiles sp
ON u.id = sp.user_id
WHERE u.user_type = 'student' AND u.is_active = true AND sp.id IS NULL

UNION ALL

SELECT 'Students with invalid GPA' as issue,
       COUNT(*) as count
FROM student_profiles sp
WHERE sp.current_gpa < 0.00 OR sp.current_gpa > 4.00

UNION ALL

SELECT 'Students with negative credits' as issue,
       COUNT(*) as count
FROM student_profiles sp
WHERE sp.total_credits < 0;

-- Validate teacher data integrity  
SELECT 'Missing teacher profiles' as issue,
       COUNT(*) as count
FROM users u
    LEFT JOIN teacher_profiles tp
ON u.id = tp.user_id
WHERE u.user_type = 'teacher' AND u.is_active = true AND tp.id IS NULL

UNION ALL

SELECT 'Teachers with invalid rating' as issue,
       COUNT(*) as count
FROM teacher_profiles tp
WHERE tp.teaching_rating < 0.00 OR tp.teaching_rating > 5.00

UNION ALL

SELECT 'Unapproved active teachers' as issue,
       COUNT(*) as count
FROM teacher_profiles tp
    JOIN users u
ON tp.user_id = u.id
WHERE u.is_active = true AND tp.employment_status = 'active' AND tp.is_approved = false;

-- ==========================================
-- REPORTING QUERIES
-- ==========================================

-- Monthly registration report
SELECT DATE_TRUNC('month', u.created_at) as month,
    u.user_type,
    COUNT(*) as registrations
FROM users u
WHERE u.created_at > CURRENT_TIMESTAMP - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', u.created_at), u.user_type
ORDER BY month DESC, u.user_type;

-- Course popularity report
SELECT c.course_code,
       c.course_name,
       c.department,
       COUNT(ce.id) as total_enrollments,
       COUNT(ce.id)    FILTER (WHERE ce.status = 'completed') as completions, ROUND(
        COUNT(ce.id) FILTER (WHERE ce.status = 'completed')::numeric / 
        NULLIF(COUNT(ce.id), 0) * 100, 2
                                                                              ) as completion_rate
FROM courses c
         LEFT JOIN course_enrollments ce ON c.id = ce.course_id
WHERE c.is_active = true
GROUP BY c.id, c.course_code, c.course_name, c.department
ORDER BY total_enrollments DESC;

-- Teacher workload report
SELECT tp.employee_id,
       CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
       tp.department,
       COUNT(DISTINCT ts.student_id)          as students_managed,
       COUNT(DISTINCT ce.course_id)           as courses_teaching,
       COUNT(a.id)                            as assignments_created,
       COUNT(asub.id)                         as submissions_to_grade
FROM teacher_profiles tp
         JOIN users u ON tp.user_id = u.id
         LEFT JOIN teacher_students ts ON tp.id = ts.teacher_id AND ts.is_active = true
         LEFT JOIN course_enrollments ce ON ts.student_id = ce.student_id
         LEFT JOIN assignments a ON tp.id = a.teacher_id
         LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.status IN ('submitted')
WHERE u.is_active = true
  AND tp.is_approved = true
GROUP BY tp.id, tp.employee_id, u.first_name, u.last_name, tp.department
ORDER BY students_managed DESC;

-- ==========================================
-- SEARCH QUERIES
-- ==========================================

-- Search students by name or ID
SELECT sp.student_id,
       CONCAT(u.first_name, ' ', u.last_name) as full_name,
       u.email,
       sp.grade_level,
       sp.current_gpa,
       sp.academic_status
FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
WHERE u.is_active = true
  AND (
    LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER('%search_term%') -- Replace search_term
        OR LOWER(u.email) LIKE LOWER('%search_term%')
        OR sp.student_id LIKE '%search_term%'
    )
ORDER BY u.first_name, u.last_name;

-- Search teachers by name or department
SELECT tp.employee_id,
       CONCAT(u.first_name, ' ', u.last_name) as full_name,
       u.email,
       tp.department,
       tp.specialization,
       tp.teaching_rating,
       tp.is_approved
FROM teacher_profiles tp
         JOIN users u ON tp.user_id = u.id
WHERE u.is_active = true
  AND (
    LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER('%search_term%') -- Replace search_term
        OR LOWER(u.email) LIKE LOWER('%search_term%')
        OR LOWER(tp.department) LIKE LOWER('%search_term%')
        OR tp.employee_id LIKE '%search_term%'
    )
ORDER BY tp.is_approved DESC, u.first_name, u.last_name;

-- ==========================================
-- UTILITY FUNCTIONS USAGE
-- ==========================================

-- Get current database statistics
SELECT *
FROM get_database_stats();

-- Create a new student (example usage)
-- SELECT * FROM create_student_account(
--     'new_student', 
--     'newstudent@example.com', 
--     'hashed_password_here',
--     'Jane', 
--     'Smith',
--     '+1-555-9999',
--     '123 New Street',
--     'Parent Name',
--     '+1-555-8888',
--     'parent@example.com'
-- );

-- Create a new teacher (example usage)
-- SELECT * FROM create_teacher_account(
--     'new_teacher',
--     'newteacher@example.com',
--     'hashed_password_here',
--     'Prof. John',
--     'Smith',
--     '+1-555-7777',
--     '456 Faculty Lane',
--     'Biology',
--     'Molecular Biology',
--     'Ph.D. in Biology'
-- );

-- Soft delete a user (example usage)
-- SELECT delete_user_account(user_id_here, admin_user_id);

-- ==========================================
-- MAINTENANCE SCHEDULE
-- ==========================================

-- Run these queries periodically for maintenance:
-- 1. Clean up expired tokens: SELECT cleanup_expired_tokens();
-- 2. Update statistics: ANALYZE;
-- 3. Check data integrity: Run validation queries above
-- 4. Monitor performance: Check slow queries and index usage