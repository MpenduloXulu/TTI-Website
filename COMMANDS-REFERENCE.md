# 🚀 Quick Command Reference

## Copy & Paste These Commands

### Terminal 1 - Start Backend

```powershell
cd C:\TTI_Prototype\backend
npm run dev
```

**Expected output:**
```
Server is running on port 5000
Firebase Admin SDK initialized
```

**WAIT for this before moving to Terminal 2** ⏳

---

### Terminal 2 - Start Frontend

```powershell
cd C:\TTI_Prototype\frontend
npm start
```

**Expected output:**
```
Compiled successfully!
On Your Network: http://localhost:3000
```

Browser should auto-open to: `http://localhost:3000`

---

## Register Test Users

### Go to: http://localhost:3000/register

### User 1: Applicant
```
First Name:        John
Last Name:         Doe
Email:             john@example.com
Password:          JohnPass123
Confirm Password:  JohnPass123
User Role:         Applicant
[Click Register]
```
✅ Should redirect to: http://localhost:3000/my-applications

---

### User 2: Reviewer
```
First Name:        Jane
Last Name:         Smith
Email:             jane@example.com
Password:          JanePass123
Confirm Password:  JanePass123
User Role:         Reviewer
[Click Register]
```
✅ Should redirect to: http://localhost:3000/reviews

---

### User 3: Administrator ⭐
```
First Name:        Admin
Last Name:         Staff
Email:             admin@example.com
Password:          AdminPass123
Confirm Password:  AdminPass123
User Role:         Administrator
[Click Register]
```
✅ Should redirect to: http://localhost:3000/admin/dashboard

---

## Troubleshooting Commands

### If backend fails to start:

```powershell
cd C:\TTI_Prototype\backend
rm -r node_modules
npm install
npm run dev
```

### If frontend fails to start:

```powershell
cd C:\TTI_Prototype\frontend
npm install
npm start
```

### If port 5000 is already in use:

```powershell
# Find and kill the process
netstat -ano | findstr :5000
# Then run (replace PID with actual number):
taskkill /PID <PID> /F

# Or simply:
Stop-Process -Name node -Force
```

### If port 3000 is already in use:

```powershell
Stop-Process -Name node -Force
```

---

## Check System Status

### Verify Node.js installed:
```powershell
node --version
```
Expected: `v25.4.0` or higher

### Verify npm installed:
```powershell
npm --version
```
Expected: `11.7.0` or higher

---

## Development Workflow

### When you make code changes:

**Backend changes** → Automatically restarts (nodemon)
- No need to restart, it auto-reloads

**Frontend changes** → Automatically reloads
- No need to restart, it hot-reloads

---

## Browser DevTools

### Open DevTools (any of these):
- Press: `F12`
- Right-click → Inspect
- Ctrl + Shift + I (Windows)
- Cmd + Option + I (Mac)

### Check for errors:
1. Click "Console" tab
2. Should see no red errors for registration
3. Blue warnings are OK

### Check API calls:
1. Click "Network" tab  
2. Try registering
3. Look for POST to `localhost:5000/api/auth/register`
4. Should see: 200 or 201 response (success)

### Check stored data:
1. Click "Application" tab
2. Click "Local Storage"
3. Click `http://localhost:3000`
4. Should see:
   - `token` → JWT token
   - `user` → User data object

---

## First Time Setup Checklist

- [ ] Both Node.js and npm installed?
- [ ] Navigate to backend directory
- [ ] Run `npm run dev`
- [ ] See "Server is running on port 5000"?
- [ ] Navigate to frontend directory
- [ ] Run `npm start`
- [ ] Browser opened to localhost:3000?
- [ ] See Register page?
- [ ] Form has all 6 fields visible?
- [ ] Role dropdown shows 3 options?
- [ ] Can type in all fields?

---

## Testing Checklist

- [ ] Register as Applicant
- [ ] Redirects to /my-applications
- [ ] Navigation menu shows "My Applications"
- [ ] Logout button visible
- [ ] Register as Reviewer
- [ ] Redirects to /reviews
- [ ] Navigation menu shows "Reviews"
- [ ] Register as Administrator
- [ ] Redirects to /admin/dashboard
- [ ] Navigation menu shows "Dashboard"

---

## Common Error Solutions

| Error | Solution |
|-------|----------|
| Cannot find module 'express' | Run `npm install` in backend |
| Port 5000 in use | Kill with `Stop-Process -Name node -Force` |
| Cannot find module 'react' | Run `npm install` in frontend |
| CORS error | Check backend `.env` has `CORS_ORIGIN=http://localhost:3000` |
| Registration fails | Check backend is running in Terminal 1 |
| Page won't load | Refresh browser, check console for errors |

---

## Firebase Configuration

If you haven't set up Firebase credentials yet:

1. Go to: https://console.firebase.google.com
2. Create new project (or use existing)
3. Download service account key
4. In `backend/.env`, add Firebase project ID:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   ```
5. Restart backend: `npm run dev`

---

## Environment Files

### Backend `.env` location:
```
C:\TTI_Prototype\backend\.env
```

Should contain:
```
FIREBASE_PROJECT_ID=tti-application-management
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### Frontend `.env` location:
```
C:\TTI_Prototype\frontend\.env
```

Should contain:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## URLs & Ports

| Service | URL | Port |
|---------|-----|------|
| Frontend App | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| Register Page | http://localhost:3000/register | 3000 |
| Login Page | http://localhost:3000/login | 3000 |
| My Applications | http://localhost:3000/my-applications | 3000 |
| Reviews | http://localhost:3000/reviews | 3000 |
| Admin Dashboard | http://localhost:3000/admin/dashboard | 3000 |

---

## Useful PowerShell Commands

```powershell
# Navigate to folder
cd C:\TTI_Prototype\backend

# Run npm command
npm run dev

# Install dependencies
npm install

# Clear npm cache
npm cache clean --force

# Check what's running on port 5000
netstat -ano | findstr :5000

# Kill Node process
Stop-Process -Name node -Force

# List all node processes
Get-Process node

# Check current directory
Get-Location

# List files in current directory
Get-ChildItem
```

---

## Quick Links

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Register: http://localhost:3000/register
- Documentation: See DOCUMENTATION-INDEX.md

---

## Still Need Help?

1. Read: QUICKSTART.md
2. Read: REGISTRATION-TROUBLESHOOTING.md
3. Check browser console (F12)
4. Check backend terminal output
5. Verify both servers say "running"

---

**Ready? Copy the backend command above and run it now! 🚀**

