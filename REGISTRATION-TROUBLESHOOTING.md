# Registration Error Troubleshooting

## Issue: "Registration failed. Please try again."

The error message you're seeing indicates the frontend is unable to communicate with the backend API. Here's how to fix it:

---

## Step 1: Verify Backend is Running

### Check Backend Status
Open a **NEW terminal** and run:

```powershell
cd C:\TTI_Prototype\backend
npm run dev
```

**Expected Output:**
```
Server is running on port 5000
Firebase Admin SDK initialized
```

**If you see these messages**, the backend is working. Move to Step 2.

**If you see errors**, continue below.

---

## Step 2: Check Backend Dependencies

If backend won't start, reinstall dependencies:

```powershell
cd C:\TTI_Prototype\backend
rm -r node_modules
npm install
npm run dev
```

---

## Step 3: Verify Firebase Credentials

The backend needs Firebase credentials to work. Check your `.env` file:

```powershell
type C:\TTI_Prototype\backend\.env
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

**If missing values**, update your `.env` file with your Firebase project details.

---

## Step 4: Check API Connection

In your browser's Developer Tools (F12):

1. Open **Console** tab
2. Go to http://localhost:3000/register
3. Fill in the form and click Register
4. Look at the console output

**You should see:**
```
Registering user: {
  email: "...",
  password: "...",
  firstName: "...",
  lastName: "...",
  role: "..."
}
```

If you see an error about the backend URL, the API client isn't configured correctly.

---

## Step 5: Verify Frontend .env

Check your frontend configuration:

```powershell
type C:\TTI_Prototype\frontend\.env
```

Should contain:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

If the URL is wrong, update it and restart the frontend:
```powershell
cd C:\TTI_Prototype\frontend
npm start
```

---

## Step 6: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to register
4. Look for a request to `POST http://localhost:5000/api/auth/register`

**If request shows:**
- **Red X**: Backend not running or CORS issue
- **200-201**: Success! Check response in Response tab
- **400-500**: Backend error - check response message

---

## Step 7: Full Restart

If still not working, do a complete restart:

```powershell
# Terminal 1 - Backend
cd C:\TTI_Prototype\backend
npm run dev

# Terminal 2 - Frontend (wait for backend to start first)
cd C:\TTI_Prototype\frontend
npm start
```

Wait for both to say they're running before trying to register.

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` in backend folder |
| "Port 5000 already in use" | Kill existing process or use different port |
| "CORS error" | Ensure backend has correct CORS_ORIGIN in .env |
| "Firebase error" | Add Firebase credentials to .env |
| "Cannot POST /api/auth/register" | Backend not running on port 5000 |

---

## Successful Registration Flow

1. ✅ Frontend validates form (8+ char password, emails match, etc.)
2. ✅ Frontend logs "Registering user: {...}"
3. ✅ Frontend sends POST to `http://localhost:5000/api/auth/register`
4. ✅ Backend receives request
5. ✅ Backend validates email doesn't exist
6. ✅ Backend creates Firebase Auth user
7. ✅ Backend stores user in Firestore
8. ✅ Backend returns JWT token
9. ✅ Frontend stores token in localStorage
10. ✅ Frontend redirects to dashboard (based on role)

---

## Debugging Commands

```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check if node process is running
Get-Process node

# Kill Node process (if stuck)
Stop-Process -Name node -Force
```

---

## Support

If still having issues:

1. Check browser console (F12 → Console tab) for error messages
2. Check backend terminal for server errors
3. Verify both terminals show "running" status
4. Try in an incognito window (clears cache)
5. Clear browser cache (Ctrl + Shift + Delete)

