# 🚀 Getting Started - Complete Setup Guide

## What's New

✅ **Added Admin Role** to registration system
✅ **Added Reviews Page** for reviewer role
✅ **Enhanced Error Handling** with detailed console logging
✅ **Role-Based Navigation** redirects users to correct dashboards
✅ **User Registration Guide** (USER-REGISTRATION-GUIDE.md)
✅ **Troubleshooting Guide** (REGISTRATION-TROUBLESHOOTING.md)

---

## Three User Roles Available

### 1. Applicant
- Browse funding opportunities
- Submit applications
- Track status
- View feedback

### 2. Reviewer  
- View assigned applications
- Submit evaluations
- Provide scores and feedback

### 3. Administrator
- Manage funding calls
- View all applications
- Assign reviewers
- Approve/reject applications

---

## Step-by-Step Setup

### Step 1: Open TWO Terminal Windows

You need **two separate terminals** - one for backend, one for frontend.

**Terminal 1 - Backend:**
```powershell
cd C:\TTI_Prototype\backend
npm run dev
```

**Expected output:**
```
Server is running on port 5000
Firebase Admin SDK initialized
```

⏳ **Wait until you see this message before continuing to Step 2.**

---

### Step 2: Start Frontend (in Terminal 2)

```powershell
cd C:\TTI_Prototype\frontend
npm start
```

**Expected output:**
```
Compiled successfully!
On Your Network: http://localhost:3000
```

🎉 Browser should auto-open to http://localhost:3000

---

## Register Your Users

### Test User 1 - Applicant
```
First Name: John
Last Name: Doe
Email: john@example.com
Password: SecurePass123
Confirm Password: SecurePass123
Role: Applicant
```
✅ **Redirects to**: My Applications Dashboard

### Test User 2 - Reviewer
```
First Name: Jane
Last Name: Smith
Email: jane@example.com
Password: ReviewPass123
Confirm Password: ReviewPass123
Role: Reviewer
```
✅ **Redirects to**: Reviews Page

### Test User 3 - Administrator
```
First Name: Admin
Last Name: Staff
Email: admin@example.com
Password: AdminPass123
Confirm Password: AdminPass123
Role: Administrator
```
✅ **Redirects to**: Admin Dashboard

---

## Troubleshooting

### Backend won't start?
```powershell
cd C:\TTI_Prototype\backend
rm -r node_modules
npm install
npm run dev
```

### Registration fails?
1. ✅ Check backend is running (Terminal 1)
2. ✅ Check .env has `REACT_APP_API_BASE_URL=http://localhost:5000/api`
3. ✅ Open DevTools (F12) → Network tab to see API calls
4. ✅ See REGISTRATION-TROUBLESHOOTING.md for detailed steps

### CORS Error?
Make sure backend .env has:
```
CORS_ORIGIN=http://localhost:3000
```

### Port already in use?
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it
Stop-Process -Id <PID> -Force
```

---

## File Updates

### Frontend Changes
- ✅ **Register.jsx** - Added admin role, improved error handling
- ✅ **App.jsx** - Added Reviews route
- ✅ **Navigation.jsx** - Updated reviewer link
- ✅ **Reviews.jsx** - NEW page for reviewers

### New Documentation
- ✅ **USER-REGISTRATION-GUIDE.md** - Complete user role reference
- ✅ **REGISTRATION-TROUBLESHOOTING.md** - Error diagnosis & fixes

---

## API Endpoints

### Registration
```
POST http://localhost:5000/api/auth/register
Body: {
  email, password, firstName, lastName, role
}
Response: { user, token }
```

### Login
```
POST http://localhost:5000/api/auth/login
Body: { email, password }
Response: { user, token }
```

---

## Key Features Now Working

| Feature | Status |
|---------|--------|
| User Registration | ✅ All 3 roles |
| Role-Based Routing | ✅ Auto-redirects |
| Admin Dashboard | ✅ Ready |
| Applicant Dashboard | ✅ Ready |
| Reviewer Dashboard | ✅ Ready |
| Error Handling | ✅ Enhanced |
| Console Logging | ✅ Detailed |

---

## Next Steps

1. ✅ **Register test users** (one of each role)
2. ✅ **Test role-based navigation** (each should see different menu)
3. ✅ **Check localStorage** (F12 → Application → LocalStorage)
4. ✅ **Create funding opportunities** (Admin dashboard)
5. ✅ **Submit applications** (Applicant dashboard)
6. ✅ **Review applications** (Reviewer dashboard)

---

## Project Structure

```
TTI_Prototype/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx ⭐ UPDATED
│   │   │   ├── FundingOpportunities.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Reviews.jsx ⭐ NEW
│   │   ├── utils/
│   │   └── App.jsx ⭐ UPDATED
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── server.js
│   └── package.json
│
└── docs/
    ├── USER-REGISTRATION-GUIDE.md ⭐ NEW
    ├── REGISTRATION-TROUBLESHOOTING.md ⭐ NEW
    └── ...
```

---

## Questions?

Check these guides in order:
1. **USER-REGISTRATION-GUIDE.md** - How registration works
2. **REGISTRATION-TROUBLESHOOTING.md** - Fix errors
3. **SETUP.md** - General setup
4. **docs/api-documentation.md** - API reference

---

**✨ Your app is now ready to use!**

