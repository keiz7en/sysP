# 📊 Populate Database with Sample Data

## The Problem

Your database is empty because:

1. ✅ You deployed to **new PostgreSQL database** on Render
2. ❌ Only tables were created (via migrations)
3. ❌ No actual data was added

## Solution: Run the Population Script

### Step 1: Go to Render Shell

1. Open https://dashboard.render.com/
2. Click your backend service: **education-career**
3. Click **"Shell"** tab (top navigation)
4. Wait for shell to open

### Step 2: Run the Population Script

In the Render Shell, run:

```bash
cd backend
python load_initial_data.py
```

**This will create**:

- ✅ 3 Teachers (teacher1, teacher2, teacher3)
- ✅ 5 Students (student1-5)
- ✅ 4 Subjects (CS101, CS102, MATH101, PHY101)
- ✅ 3 Courses (Python, Data Structures, Calculus)
- ✅ 6 Enrollments
- ✅ 3 Assignments
- ✅ Multiple Submissions
- ✅ 2 Assessments (Exams/Quizzes)
- ✅ Multiple Questions

### Step 3: Verify in Admin Panel

1. Visit: https://education-career.onrender.com/admin/
2. Login with: `kausar` (your existing user)
3. Check:
    - ✅ Courses Management → Courses → Should see 3 courses
    - ✅ Courses Management → Assignments → Should see 3 assignments
    - ✅ Students → Student profiles → Should see 5 students
    - ✅ Users → Users → Should see teachers and students

## 🔐 Login Credentials (After Population)

### Teachers

- Username: `teacher1` Password: `teacher123`
- Username: `teacher2` Password: `teacher123`
- Username: `teacher3` Password: `teacher123`

### Students

- Username: `student1` Password: `student123`
- Username: `student2` Password: `student123`
- Username: `student3` Password: `student123`
- Username: `student4` Password: `student123`
- Username: `student5` Password: `student123`

### Your Existing Admin

- Username: `kausar` Password: (your password)

## What Gets Created

### Subjects

1. **CS101** - Introduction to Programming
2. **CS102** - Data Structures and Algorithms
3. **MATH101** - Calculus I
4. **PHY101** - Physics I

### Courses

1. **Introduction to Python Programming** (CS101, Teacher: John Smith)
2. **Advanced Data Structures** (CS102, Teacher: John Smith)
3. **Calculus Fundamentals** (MATH101, Teacher: Sarah Johnson)

### Assignments

1. **Python Basics** - Variables and Data Types
2. **Python Project** - Build a Calculator
3. **Implement Binary Search Tree**

### Enrollments

- Alice (student1) → Python + Data Structures
- Bob (student2) → Python + Data Structures
- Charlie (student3) → Python + Data Structures

### Submissions

- Each enrolled student has submitted assignments
- Scores: ~85% of total points
- Status: Graded

## Alternative: Run Locally Then Sync

If you want to test locally first:

```powershell
# In your local backend folder
cd backend
python load_initial_data.py
```

Then check your local admin: http://localhost:8000/admin/

## Troubleshooting

### If script fails with import errors:

Run migrations first:

```bash
python manage.py migrate
```

Then run the script again.

### If you see "already exists" messages:

That's fine! The script won't duplicate data.

### To clear database and start fresh:

```bash
python manage.py flush --no-input
python load_initial_data.py
```

⚠️ **Warning**: `flush` deletes ALL data including your admin user!

## Why Database Was Empty

On Render:

1. ✅ Migrations ran → Created tables (structure)
2. ❌ No seed data → Tables are empty
3. ✅ This script → Fills tables with data

Think of it like:

- **Migrations** = Building an empty house (rooms exist)
- **This script** = Moving furniture in (house is usable)

## Next Steps After Population

1. ✅ Refresh admin panel
2. ✅ Browse courses, assignments, students
3. ✅ Test teacher login
4. ✅ Test student login
5. ✅ Check API endpoints work

## 🎉 After Running Script

Your admin panel will show:

- **Courses** with actual data
- **Assignments** with submissions
- **Students** with profiles and GPAs
- **Teachers** with specializations
- **Enrollments** with active students
- **Assessments** with questions

**Everything will be functional!** 🚀
