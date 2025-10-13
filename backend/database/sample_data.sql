-- Sample Data for EduAI Education System
-- This file creates demo accounts and test data for development/testing

-- ==========================================
-- DEMO USER ACCOUNTS
-- ==========================================

-- Demo Students (passwords: demo123)
SELECT create_student_account(
               'student_demo',
               'student@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Sarah',
               'Johnson',
               '+1-555-0101',
               '123 Student St, College City',
               'Mary Johnson',
               '+1-555-0102',
               'mary.johnson@email.com'
       );

SELECT create_student_account(
               'john_doe',
               'john.doe@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'John',
               'Doe',
               '+1-555-0201',
               '456 Oak Ave, University Town',
               'Robert Doe',
               '+1-555-0202',
               'robert.doe@email.com'
       );

SELECT create_student_account(
               'emma_wilson',
               'emma.wilson@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Emma',
               'Wilson',
               '+1-555-0301',
               '789 Pine St, Campus City',
               'Linda Wilson',
               '+1-555-0302',
               'linda.wilson@email.com'
       );

SELECT create_student_account(
               'michael_brown',
               'michael.brown@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Michael',
               'Brown',
               '+1-555-0401',
               '321 Elm St, Student Village',
               'Patricia Brown',
               '+1-555-0402',
               'patricia.brown@email.com'
       );

SELECT create_student_account(
               'sophia_davis',
               'sophia.davis@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Sophia',
               'Davis',
               '+1-555-0501',
               '654 Maple Dr, Education City',
               'James Davis',
               '+1-555-0502',
               'james.davis@email.com'
       );

-- Demo Teachers (passwords: demo123)
SELECT create_teacher_account(
               'teacher_demo',
               'teacher@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Dr. Emily',
               'Carter',
               '+1-555-1001',
               '456 Faculty Ave, University Town',
               'Computer Science',
               'Machine Learning and AI',
               'Ph.D. in Computer Science, Stanford University'
       );

SELECT create_teacher_account(
               'prof_martinez',
               'prof.martinez@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Prof. Carlos',
               'Martinez',
               '+1-555-1101',
               '789 Academic Blvd, Faculty Heights',
               'Mathematics',
               'Applied Mathematics and Statistics',
               'Ph.D. in Mathematics, MIT'
       );

SELECT create_teacher_account(
               'dr_thompson',
               'dr.thompson@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Dr. Lisa',
               'Thompson',
               '+1-555-1201',
               '123 Research Rd, Campus Center',
               'Physics',
               'Quantum Physics and Materials Science',
               'Ph.D. in Physics, Caltech'
       );

SELECT create_teacher_account(
               'prof_anderson',
               'prof.anderson@demo.com',
               'pbkdf2_sha256$320000$demo$hashedpassword123',
               'Prof. David',
               'Anderson',
               '+1-555-1301',
               '987 Education St, Teacher Town',
               'English Literature',
               'Modern Literature and Creative Writing',
               'Ph.D. in English Literature, Harvard University'
       );

-- Approve demo teachers
UPDATE teacher_profiles
SET is_approved      = true,
    approved_at      = CURRENT_TIMESTAMP,
    approved_by      = (SELECT id FROM users WHERE username = 'admin'),
    teaching_rating  = ROUND((random() * 2 + 3):: numeric, 2), -- Random rating between 3.0-5.0
    experience_years = FLOOR(random() * 15 + 5),               -- Random experience 5-20 years
    office_location  = CASE
                           WHEN department = 'Computer Science' THEN 'CS Building, Room 201'
                           WHEN department = 'Mathematics' THEN 'Math Building, Room 305'
                           WHEN department = 'Physics' THEN 'Physics Lab, Room 150'
                           WHEN department = 'English Literature' THEN 'Humanities Building, Room 220'
                           ELSE 'Academic Building, Room 100'
        END,
    office_hours     = 'Monday-Friday: 2:00 PM - 4:00 PM'
WHERE user_id IN (SELECT id
                  FROM users
                  WHERE user_type = 'teacher' AND username LIKE '%demo%'
                     OR username LIKE 'prof_%'
                     OR username LIKE 'dr_%');

-- ==========================================
-- COURSE DATA
-- ==========================================

INSERT INTO courses (course_code, course_name, description, credits, department, level, prerequisites)
VALUES ('CS101', 'Introduction to Computer Science', 'Fundamental concepts of programming and computer science', 4,
        'Computer Science', 'undergraduate', 'None'),
       ('CS201', 'Data Structures and Algorithms', 'Study of fundamental data structures and algorithms', 4,
        'Computer Science', 'undergraduate', 'CS101'),
       ('CS301', 'Database Systems', 'Design and implementation of database systems', 3, 'Computer Science',
        'undergraduate', 'CS201'),
       ('CS401', 'Machine Learning', 'Introduction to machine learning algorithms and applications', 4,
        'Computer Science', 'undergraduate', 'CS201, MATH201'),

       ('MATH101', 'Calculus I', 'Differential and integral calculus', 4, 'Mathematics', 'undergraduate',
        'High School Algebra'),
       ('MATH201', 'Calculus II', 'Advanced calculus and applications', 4, 'Mathematics', 'undergraduate', 'MATH101'),
       ('MATH301', 'Linear Algebra', 'Vector spaces, matrices, and linear transformations', 3, 'Mathematics',
        'undergraduate', 'MATH101'),
       ('MATH401', 'Statistics and Probability', 'Statistical analysis and probability theory', 3, 'Mathematics',
        'undergraduate', 'MATH201'),

       ('PHYS101', 'Physics I: Mechanics', 'Classical mechanics and motion', 4, 'Physics', 'undergraduate', 'MATH101'),
       ('PHYS201', 'Physics II: Electricity and Magnetism', 'Electromagnetic theory and applications', 4, 'Physics',
        'undergraduate', 'PHYS101'),
       ('PHYS301', 'Modern Physics', 'Quantum mechanics and relativity', 4, 'Physics', 'undergraduate', 'PHYS201'),

       ('ENG101', 'English Composition', 'Academic writing and communication skills', 3, 'English Literature',
        'undergraduate', 'None'),
       ('ENG201', 'World Literature', 'Survey of global literary works', 3, 'English Literature', 'undergraduate',
        'ENG101'),
       ('ENG301', 'Creative Writing', 'Fiction and poetry writing workshop', 3, 'English Literature', 'undergraduate',
        'ENG201');

-- ==========================================
-- STUDENT ACADEMIC RECORDS
-- ==========================================

-- Update student profiles with realistic GPA and credits
DO
$$
DECLARE
student_record RECORD;
    random_gpa
DECIMAL(3,2);
    random_credits
INTEGER;
BEGIN
FOR student_record IN
SELECT sp.id, sp.user_id, u.username
FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
WHERE u.user_type = 'student' LOOP
        -- Generate realistic academic data
        random_gpa := ROUND((random() * 2 + 2.5)::numeric, 2); -- GPA between 2.5-4.5
random_credits
:= FLOOR(random() * 60 + 30); -- Credits between 30-90

UPDATE student_profiles
SET current_gpa   = random_gpa,
    total_credits = random_credits,
    grade_level   = CASE
                        WHEN random_credits < 30 THEN 'Freshman'
                        WHEN random_credits < 60 THEN 'Sophomore'
                        WHEN random_credits < 90 THEN 'Junior'
                        ELSE 'Senior'
        END
WHERE id = student_record.id;

-- Add some academic records
INSERT INTO student_academic_records (student_id, semester, year, course_code, course_name, credits, grade,
                                      grade_points, status, instructor)
VALUES (student_record.id, 'Fall', 2024, 'CS101', 'Introduction to Computer Science', 4,
        CASE WHEN random() > 0.8 THEN 'A' WHEN random() > 0.6 THEN 'B' WHEN random() > 0.4 THEN 'C' ELSE 'B+' END,
        CASE WHEN random() > 0.8 THEN 4.0 WHEN random() > 0.6 THEN 3.0 WHEN random() > 0.4 THEN 2.0 ELSE 3.3 END,
        'completed', 'Dr. Emily Carter'),
       (student_record.id, 'Fall', 2024, 'MATH101', 'Calculus I', 4,
        CASE WHEN random() > 0.7 THEN 'A-' WHEN random() > 0.5 THEN 'B+' WHEN random() > 0.3 THEN 'B' ELSE 'C+' END,
        CASE WHEN random() > 0.7 THEN 3.7 WHEN random() > 0.5 THEN 3.3 WHEN random() > 0.3 THEN 3.0 ELSE 2.3 END,
        'completed', 'Prof. Carlos Martinez'),
       (student_record.id, 'Spring', 2024, 'ENG101', 'English Composition', 3,
        CASE WHEN random() > 0.6 THEN 'A' WHEN random() > 0.4 THEN 'B+' WHEN random() > 0.2 THEN 'B' ELSE 'A-' END,
        CASE WHEN random() > 0.6 THEN 4.0 WHEN random() > 0.4 THEN 3.3 WHEN random() > 0.2 THEN 3.0 ELSE 3.7 END,
        'completed', 'Prof. David Anderson');
END LOOP;
END $$;

-- ==========================================
-- STUDENT LEARNING ANALYTICS
-- ==========================================

-- Generate learning analytics for each student
DO
$$
DECLARE
student_record RECORD;
    subjects
TEXT[] := ARRAY['Mathematics', 'Computer Science', 'Physics', 'English', 'Chemistry'];
    subject
TEXT;
BEGIN
FOR student_record IN
SELECT sp.id
FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
WHERE u.user_type = 'student' LOOP
        FOREACH subject IN ARRAY subjects
        LOOP
INSERT
INTO student_learning_analytics (student_id, subject, study_hours, completion_rate, performance_score,
                                 learning_streak, last_activity, insights, recommendations)
VALUES (
    student_record.id, subject, FLOOR(random() * 50 + 10), -- 10-60 study hours
    ROUND((random() * 40 + 60):: numeric, 2),              -- 60-100% completion rate
    ROUND((random() * 30 + 70):: numeric, 2),              -- 70-100% performance score
    FLOOR(random() * 20 + 1),                              -- 1-20 day learning streak
    CURRENT_TIMESTAMP - (random() * INTERVAL '7 days'),    -- Last activity within 7 days
    json_build_object(
    'peak_learning_time', CASE WHEN random() > 0.5 THEN 'morning' ELSE 'evening' END, 'preferred_method', CASE WHEN random() > 0.7 THEN 'visual' WHEN random() > 0.4 THEN 'auditory' ELSE 'kinesthetic' END, 'difficulty_areas', ARRAY['complex_problems', 'time_management']
    ), json_build_object(
    'study_schedule', 'Focus on ' || subject || ' during peak hours', 'improvement_areas', 'Practice more problem-solving exercises', 'next_steps', 'Review fundamentals and advance to next level'
    )
    );
END LOOP;
END LOOP;
END $$;

-- ==========================================
-- TEACHER-STUDENT ASSIGNMENTS
-- ==========================================

-- Assign students to teachers
DO
$$
DECLARE
teacher_record RECORD;
    student_record
RECORD;
    assigned_count
INTEGER := 0;
BEGIN
    -- Get approved teachers
FOR teacher_record IN
SELECT tp.id, tp.user_id, tp.department
FROM teacher_profiles tp
         JOIN users u ON tp.user_id = u.id
WHERE tp.is_approved = true LOOP
        assigned_count := 0;

-- Assign students to each teacher (limit to 3-5 students per teacher for demo)
FOR student_record IN
SELECT sp.id
FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
WHERE u.user_type = 'student'
ORDER BY random() LIMIT FLOOR(random() * 3 + 3) -- 3-5 students per teacher
        LOOP
            -- Check if this assignment already exists
            IF NOT EXISTS (
                SELECT 1 FROM teacher_students 
                WHERE teacher_id = teacher_record.id AND student_id = student_record.id
            ) THEN
INSERT
INTO teacher_students (teacher_id, student_id, assigned_date, created_by)
VALUES (
    teacher_record.id, student_record.id, CURRENT_DATE - (random() * INTERVAL '30 days'):: INTEGER, -- Assigned within last 30 days
    teacher_record.user_id
    );
assigned_count
:= assigned_count + 1;
END IF;
END LOOP;
        
        RAISE
NOTICE 'Assigned % students to teacher ID %', assigned_count, teacher_record.id;
END LOOP;
END $$;

-- ==========================================
-- COURSE ENROLLMENTS
-- ==========================================

-- Enroll students in courses
DO
$$
DECLARE
student_record RECORD;
    course_record
RECORD;
    teacher_record
RECORD;
    enrollment_count
INTEGER := 0;
BEGIN
FOR student_record IN
SELECT sp.id, sp.grade_level
FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
WHERE u.user_type = 'student' LOOP
        enrollment_count := 0;

-- Enroll each student in 3-5 courses appropriate for their level
FOR course_record IN
SELECT c.id, c.course_code, c.department
FROM courses c
WHERE c.is_active = true
  AND (
    (student_record.grade_level IN ('Freshman', 'Sophomore') AND c.course_code LIKE '%101') OR
    (student_record.grade_level IN ('Sophomore', 'Junior') AND c.course_code LIKE '%201') OR
    (student_record.grade_level IN ('Junior', 'Senior') AND c.course_code LIKE '%301')
    )
ORDER BY random() LIMIT FLOOR(random() * 3 + 3) -- 3-5 courses per student
        LOOP
-- Find a teacher for this course
SELECT tp.id
INTO teacher_record
FROM teacher_profiles tp
WHERE tp.department = course_record.department
  AND tp.is_approved = true LIMIT 1;

-- Enroll student
INSERT INTO course_enrollments (student_id, course_id, teacher_id, semester, year,
                                enrollment_date, status, final_grade, grade_points)
VALUES (student_record.id,
        course_record.id,
        teacher_record,
        CASE WHEN random() > 0.5 THEN 'Fall' ELSE 'Spring' END,
        2024,
        CURRENT_DATE - (random() * INTERVAL '60 days')::INTEGER,
        CASE WHEN random() > 0.8 THEN 'completed' ELSE 'enrolled' END,
        CASE
            WHEN random() > 0.8 THEN
                CASE WHEN random() > 0.7 THEN 'A' WHEN random() > 0.5 THEN 'B' ELSE 'C' END
            ELSE NULL END,
        CASE
            WHEN random() > 0.8 THEN
                CASE WHEN random() > 0.7 THEN 4.0 WHEN random() > 0.5 THEN 3.0 ELSE 2.0 END
            ELSE NULL END) ON CONFLICT (student_id, course_id, semester, year) DO NOTHING;

enrollment_count
:= enrollment_count + 1;
END LOOP;
        
        RAISE
NOTICE 'Enrolled student ID % in % courses', student_record.id, enrollment_count;
END LOOP;
END $$;

-- ==========================================
-- ASSIGNMENTS AND ASSESSMENTS
-- ==========================================

-- Create sample assignments
DO
$$
DECLARE
course_record RECORD;
    teacher_record
RECORD;
    assignment_types
TEXT[] := ARRAY['assignment', 'quiz', 'exam', 'project'];
    assignment_type
TEXT;
BEGIN
FOR course_record IN
SELECT id, course_code, course_name, department
FROM courses
WHERE is_active = true
    LOOP
-- Find teacher for this course
SELECT tp.id
INTO teacher_record
FROM teacher_profiles tp
WHERE tp.department = course_record.department
  AND tp.is_approved = true LIMIT 1;

IF
teacher_record IS NOT NULL THEN
            -- Create 2-4 assignments per course
            FOR i IN 1..FLOOR(random() * 3 + 2)
            LOOP
                assignment_type := assignment_types[FLOOR(random() * array_length(assignment_types, 1) + 1)];

INSERT INTO assignments (course_id, teacher_id, title, description, assignment_type,
                         max_points, due_date, is_published, instructions)
VALUES (course_record.id,
        teacher_record,
        course_record.course_code || ' ' || assignment_type || ' ' || i,
        'This is a ' || assignment_type || ' for ' || course_record.course_name,
        assignment_type,
        CASE assignment_type
            WHEN 'quiz' THEN FLOOR(random() * 50 + 50)
            WHEN 'exam' THEN FLOOR(random() * 50 + 100)
            WHEN 'project' THEN FLOOR(random() * 100 + 100)
            ELSE FLOOR(random() * 50 + 50)
            END,
        CURRENT_TIMESTAMP + (random() * INTERVAL '30 days'),
        true,
        'Complete this ' || assignment_type || ' according to the course guidelines.');
END LOOP;
END IF;
END LOOP;
END $$;

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

-- Create sample notifications for users
DO
$$
DECLARE
user_record RECORD;
    notification_types
TEXT[] := ARRAY['info', 'success', 'warning'];
    notification_type
TEXT;
BEGIN
FOR user_record IN
SELECT id, user_type, first_name
FROM users
WHERE is_active = true LOOP
        -- Create 1-3 notifications per user
        FOR i IN 1..FLOOR(random() * 3 + 1)
        LOOP
            notification_type := notification_types[FLOOR(random() * array_length(notification_types, 1) + 1)];

INSERT INTO notifications (user_id, title, message, notification_type, is_read, created_at)
VALUES (user_record.id,
        CASE user_record.user_type
            WHEN 'student' THEN
                CASE i
                    WHEN 1 THEN 'Assignment Due Soon'
                    WHEN 2 THEN 'Grade Posted'
                    ELSE 'Course Update'
                    END
            WHEN 'teacher' THEN
                CASE i
                    WHEN 1 THEN 'New Student Enrolled'
                    WHEN 2 THEN 'Assignment Submissions'
                    ELSE 'Department Meeting'
                    END
            ELSE
                CASE i
                    WHEN 1 THEN 'System Update'
                    WHEN 2 THEN 'Teacher Approval Required'
                    ELSE 'Monthly Report Available'
                    END
            END,
        'Hello ' || user_record.first_name || ', this is a sample notification for your account.',
        notification_type,
        random() > 0.5, -- Randomly mark some as read
        CURRENT_TIMESTAMP - (random() * INTERVAL '7 days'));
END LOOP;
END LOOP;
END $$;

-- ==========================================
-- TEACHER PERFORMANCE DATA
-- ==========================================

-- Generate teacher performance metrics
DO
$$
DECLARE
teacher_record RECORD;
BEGIN
FOR teacher_record IN
SELECT tp.id
FROM teacher_profiles tp
WHERE tp.is_approved = true
    LOOP
INSERT
INTO teacher_performance (teacher_id, semester, year, total_students, average_student_rating,
                          course_completion_rate, student_success_rate, professional_development_hours)
VALUES (
    teacher_record.id, 'Fall', 2024, FLOOR(random() * 30 + 20), -- 20-50 students
    ROUND((random() * 1.5 + 3.5):: numeric, 2),                 -- 3.5-5.0 rating
    ROUND((random() * 20 + 80):: numeric, 2),                   -- 80-100% completion
    ROUND((random() * 20 + 75):: numeric, 2),                   -- 75-95% success rate
    FLOOR(random() * 20 + 10)                                   -- 10-30 hours professional development
    );
END LOOP;
END $$;

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

-- Insert completion log
INSERT INTO audit_log (action, table_name, record_id, new_values)
VALUES ('SYSTEM', 'sample_data', 0,
        json_build_object('status', 'completed', 'timestamp', CURRENT_TIMESTAMP));

-- Display summary
DO
$$
DECLARE
stats RECORD;
BEGIN
SELECT *
FROM get_database_stats() INTO stats;

RAISE
NOTICE 'Sample data has been successfully loaded!';
    RAISE
NOTICE 'Total Users: %', stats.total_users;
    RAISE
NOTICE 'Active Students: %', stats.active_students;
    RAISE
NOTICE 'Active Teachers: %', stats.active_teachers;
    RAISE
NOTICE 'Pending Teacher Approvals: %', stats.pending_teacher_approvals;
    RAISE
NOTICE 'Total Courses: %', stats.total_courses;
    RAISE
NOTICE 'Active Enrollments: %', stats.active_enrollments;
    RAISE
NOTICE 'Database is ready with sample data!';
END $$;