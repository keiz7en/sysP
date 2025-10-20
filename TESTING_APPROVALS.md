# Testing Approval System - Step by Step Guide

## Quick Test: Is Everything Working?

### 1. Test API Endpoints (Backend)

```bash
cd backend
python test_api_endpoints.py
```

This should show:

- ✅ API Health: Working
- ✅ Admin Login: Working
- ✅ Pending Teachers: Working (3 found)
- ✅ Pending Students: Working (4 found)

### 2. Test Frontend Navigation

#### Admin Login:

- Go to login page
- Select "Admin"
- Username: `admin`
- Password: `admin123`
- Should navigate to admin dashboard

#### Check Admin Menu Items:

The admin sidebar should show:

- 🏠 Dashboard
- 👥 User Management
- ✅ Teacher Approval ← **This should work now!**
- 🎓 Student Approval ← **This should work now!**
- ⚙️ System Settings

#### Teacher Login:

- Username: `john.smith.teacher`
- Password: `teacher123`
- Should show teacher dashboard with Student Approval option

## What Was Fixed:

### 1. Backend Issues Fixed:

- ✅ Import errors in students/views.py
- ✅ Created test approval data (3 teachers + 4 students pending)
- ✅ Fixed TeacherProfile creation with employee IDs

### 2. Frontend Issues Fixed:

- ✅ Added missing API endpoints for user management
- ✅ Teacher can now approve students (uses same backend endpoints)
- ✅ Improved error handling in approval components

### 3. Test Data Created:

**Pending Teachers:**

- john.smith.teacher / teacher123
- sarah.johnson.teacher / teacher123
- mike.wilson.teacher / teacher123

**Pending Students:**

- alice.brown.student / student123
- bob.davis.student / student123
- carol.taylor.student / student123
- david.martinez.student / student123

## Testing Approval Workflow:

### Admin Approving Teachers:

1. Login as admin
2. Go to "Teacher Approval" page
3. You should see 3 pending teachers
4. Click "Approve Teacher" on any teacher
5. Teacher should disappear from pending list
6. Teacher can now login successfully

### Admin/Teacher Approving Students:

1. Login as admin or teacher
2. Go to "Student Approval" page
3. You should see 4 pending students
4. Click "Approve" on any student
5. Student should disappear from pending list
6. Student can now login successfully

## Troubleshooting:

### If approval pages show "No pending applications":

```bash
cd backend  
python create_test_approvals.py
```

### If API endpoints fail:

- Make sure Django server is running: `python manage.py runserver`
- Check console for errors
- Verify admin user exists: `python create_admin.py`

### If frontend navigation doesn't work:

- Check browser console for JavaScript errors
- Make sure React dev server is running
- Clear browser cache and localStorage

## Expected Results:

✅ Admin can see and approve both teachers and students
✅ Teachers can see and approve students  
✅ Approved users can login successfully
✅ Navigation between approval pages works
✅ Real data displayed (not mock data)
✅ Error handling works when no approvals exist

The approval system should now be fully functional!