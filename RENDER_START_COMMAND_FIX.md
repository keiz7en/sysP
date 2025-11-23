# 🔧 Fix: ModuleNotFoundError: No module named 'sysP'

## Problem

Your deployment is failing with:

```
ModuleNotFoundError: No module named 'sysP'
==> Running 'gunicorn sysP.wsgi:application'
```

## Root Cause

Render is using the **wrong start command**. It's looking for `sysP.wsgi` but your Django project is named
`education_system`.

The start command in your Render dashboard is set to:

```bash
gunicorn sysP.wsgi:application  # ❌ WRONG
```

But it should be:

```bash
gunicorn education_system.wsgi:application  # ✅ CORRECT
```

## Good News! ✅

The **build succeeded**! All dependencies installed correctly, static files collected, and migrations would run. You
just need to fix the start command.

## Solution: Update Start Command in Render

### Step 1: Go to Your Web Service Settings

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click on your web service (e.g., "eduai-backend")
3. Click **"Settings"** tab

### Step 2: Update Start Command

Scroll down to **"Build & Deploy"** section and find **"Start Command"**

Change from:

```bash
gunicorn sysP.wsgi:application
```

To:

```bash
gunicorn education_system.wsgi:application --bind 0.0.0.0:$PORT
```

### Step 3: Save and Redeploy

1. Click **"Save Changes"** button at the bottom
2. Render will automatically trigger a new deployment
3. This time it will use the correct module name

## Alternative: Use render.yaml (Recommended)

If you want Render to automatically use the correct configuration:

### Option A: Deploy as Blueprint

1. In Render dashboard, click **"New +"**
2. Select **"Blueprint"**
3. Connect your GitHub repository
4. Render will read `render.yaml` and configure everything automatically!

The `render.yaml` already has the correct start command:

```yaml
startCommand: "gunicorn education_system.wsgi:application --bind 0.0.0.0:$PORT"
```

### Option B: Update Existing Service

If you want to keep your existing service:

1. Go to **Settings** tab
2. Update **Start Command** to:
   ```bash
   gunicorn education_system.wsgi:application --bind 0.0.0.0:$PORT
   ```
3. Ensure **Root Directory** is set to: `backend`
4. Save changes

## Expected Result

After fixing the start command, you should see:

```
==> Running 'gunicorn education_system.wsgi:application --bind 0.0.0.0:$PORT'
[INFO] Starting gunicorn 21.2.0
[INFO] Listening at: http://0.0.0.0:10000
[INFO] Using worker: sync
[INFO] Booting worker with pid: 123
==> Your service is live 🎉
```

## Verification

After deployment succeeds:

1. **Check Logs**: Look for "Booting worker with pid"
2. **Test API**: Visit `https://your-app.onrender.com/admin/`
3. **Create Superuser** (in Render Shell):
   ```bash
   python manage.py createsuperuser
   ```

## Why Did This Happen?

When you manually created the web service in Render, you probably entered `sysP.wsgi:application` as the start command (
maybe based on your repository name "sysP").

However, the actual Django project folder inside your `backend` directory is called `education_system`, so the correct
WSGI module path is `education_system.wsgi`.

## Django Project Structure

Your project structure is:

```
sysP/                          # Git repository name
└── backend/                   # Root directory in Render
    ├── manage.py
    ├── education_system/      # Django project name (THIS is what matters!)
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py           # This file!
    ├── students/
    ├── teachers/
    ├── courses/
    └── ...
```

The start command must reference the **Django project folder name**, which is `education_system`, not the git repository
name `sysP`.

## Complete Settings Summary

Here's what your Render settings should be:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` |
| **Start Command** | `gunicorn education_system.wsgi:application --bind 0.0.0.0:$PORT` |
| **Python Version** | 3.11.9 (from runtime.txt) |

## Environment Variables

Don't forget to set these in Render:

```bash
# Required
GEMINI_API_KEY=your-actual-api-key
ALLOWED_HOSTS=your-app.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.com

# Auto-generated
SECRET_KEY=<render-auto-generates>
DATABASE_URL=<postgres-connection-string>
DEBUG=False
```

## Quick Fix Checklist

- [ ] Go to Render Dashboard → Your Service → Settings
- [ ] Update Start Command to: `gunicorn education_system.wsgi:application --bind 0.0.0.0:$PORT`
- [ ] Verify Root Directory is: `backend`
- [ ] Click "Save Changes"
- [ ] Wait for automatic redeploy (2-3 minutes)
- [ ] Check logs for success message
- [ ] Test your app!

## Summary

✅ **Build successful** - All dependencies installed  
✅ **Static files collected** - WhiteNoise ready  
✅ **Database ready** - PostgreSQL configured  
❌ **Wrong start command** - Fix: Change `sysP` to `education_system`

**Status**: One setting change away from success! 🚀

---

**Next Steps**:

1. Update start command in Render dashboard
2. Wait for redeploy (2-3 min)
3. Create superuser
4. Your app is live!

**Last Updated**: 2025  
**Issue**: Start command module name mismatch  
**Fix**: 30 seconds to update setting
