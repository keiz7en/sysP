# 🔧 Fix: Publish Directory Error

## Problem

Your build succeeded but deployment failed with:

```
✓ built in 5.36s
==> Publish directory npm run dev does not exist!
==> Build failed 😞
```

## Root Cause

The **Publish Directory** setting in Render is incorrect. It's set to `npm run dev` (a command) but should be `dist` (
the output folder).

## What Happened

1. ✅ `npm install` - Success
2. ✅ `tsc && vite build` - Success
3. ✅ Build created files in `dist/` folder
4. ❌ Render looked for folder named "npm run dev" (doesn't exist!)

## Solution: Update Publish Directory

### Go to Render Dashboard

1. **Login**: https://dashboard.render.com/
2. **Click** your static site "sysP-1"
3. **Click** "Settings" tab
4. **Find** "Publish Directory" section
5. **Change** from `npm run dev` to `dist`
6. **Click** "Save Changes"
7. **Trigger** manual deploy

### Expected Settings

| Setting | Correct Value |
|---------|---------------|
| **Build Command** | `npm install; npm run build` |
| **Publish Directory** | `dist` |
| **Root Directory** | (empty or `/`) |

## Quick Fix Steps

### Option 1: Via Dashboard (Easiest)

1. Go to https://dashboard.render.com/
2. Select "sysP-1" static site
3. Settings → Build & Deploy
4. **Publish Directory**: Change to `dist`
5. Save Changes
6. Manual Deploy → "Clear build cache & deploy"

### Option 2: Add render.yaml for Static Site

Create `render-frontend.yaml` in root:

```yaml
services:
  - type: web
    name: sysp-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## What Vite Build Creates

When you run `npm run build`, Vite creates:

```
dist/
├── index.html              ← Entry point
├── assets/
│   ├── index-B-V5z_s3.css   ← Styles
│   └── index-ogRrKC-F.js    ← JavaScript bundle
└── ...other assets
```

Render needs to serve files from the `dist` folder.

## Common Mistakes

| Wrong | Right |
|-------|-------|
| `npm run dev` | `dist` |
| `build` | `dist` |
| `public` | `dist` |
| `/dist` | `dist` |
| `./dist` | `dist` |

## Verification

After fixing the publish directory:

```
==> Running build command 'npm install; npm run build'
✓ built in 5.36s
==> Publishing directory dist
==> Uploading files...
==> Uploaded 3 files
==> Deploy successful 🎉
==> Your site is live at https://sysp-1.onrender.com
```

## Warning: Large Bundle Size

You also got this warning:

```
(!) Some chunks are larger than 500 kB after minification.
dist/assets/index-ogRrKC-F.js   817.07 kB
```

This is **not critical** but you may want to optimize later by:

- Code splitting
- Lazy loading routes
- Tree shaking unused code

For now, ignore this warning. Your site will still work fine!

## Security Vulnerabilities

```
3 moderate severity vulnerabilities
```

**Optional**: Run this locally to fix:

```bash
npm audit fix
```

Then commit and push the updated `package-lock.json`.

## Complete Configuration

Here's what your Render static site settings should be:

```yaml
Name: sysP-1
Type: Static Site
Repository: keiz7en/sysP
Branch: main
Root Directory: (empty)
Build Command: npm install; npm run build
Publish Directory: dist  ← THIS IS THE FIX!
Auto-Deploy: Yes
```

## Expected Deploy Flow

```
1. Git push to main
   ↓
2. Render detects change
   ↓
3. npm install (install dependencies)
   ↓
4. npm run build (run tsc && vite build)
   ↓
5. Vite creates dist/ folder
   ↓
6. Render publishes files from dist/
   ↓
7. Site live at https://sysp-1.onrender.com ✅
```

## Summary

✅ **Build**: Successful (375 modules transformed)  
✅ **Output**: Created in `dist/` folder  
❌ **Publish Directory**: Set to wrong value  
🔧 **Fix**: Change "Publish Directory" to `dist`

**Status**: One setting away from success! 🚀

## After Fix

Once you change the publish directory to `dist` and redeploy:

1. Visit: https://sysp-1.onrender.com
2. Your React app should load
3. All routes should work
4. Assets should load correctly

## Troubleshooting

### If site shows 404 for routes

Add this to your Render settings under "Redirects/Rewrites":

```
/* -> /index.html (200)
```

This ensures React Router works correctly with client-side routing.

### If assets don't load

Check your `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/',  // Should be '/' for Render
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

---

**Next Step**: Change Publish Directory to `dist` in Render dashboard and redeploy! 🎉

**Time to Fix**: 30 seconds  
**Time to Deploy**: 2-3 minutes  
**Last Updated**: 2025
