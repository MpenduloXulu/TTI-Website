# Complete User Registration Workflow

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
└────────┬────────┘
         │
         │ POST /api/auth/register
         │ { email, password, firstName, lastName, role }
         │
         ▼
┌─────────────────────────┐
│   Backend (Express)     │
│   Route: POST /register │
└────────┬────────────────┘
         │
         │ 1. Validate input
         │ 2. Check email unique
         │ 3. Create Firebase user
         │ 4. Store in Firestore
         │ 5. Generate JWT
         │
         ▼
┌─────────────────────────┐
│   Firebase Services     │
│   - Authentication      │
│   - Firestore Database  │
└────────┬────────────────┘
         │
         │ Return: user + token
         │
         ▼
┌─────────────────┐
│   Frontend      │
│   Store token   │
│   Redirect      │
└─────────────────┘
```

---

## Detailed Registration Flow

### 1. User Navigates to Register Page

**URL**: `http://localhost:3000/register`

**Page Components**:
- First Name input
- Last Name input
- Email input
- Password input (with validation rules)
- Confirm Password input
- Role dropdown (Applicant, Reviewer, Administrator)
- Register button

---

### 2. User Fills Form

```javascript
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
  role: "applicant"
}
```

---

### 3. Frontend Validation

**File**: `frontend/src/pages/Register.jsx`

```javascript
// Check passwords match
if (formData.password !== formData.confirmPassword) {
  error: 'Passwords do not match'
}

// Check password strength
if (formData.password.length < 8) {
  error: 'Password must be at least 8 characters'
}

// Check all required fields
if (!email || !password || !firstName || !lastName) {
  error: 'Missing required fields'
}
```

**Valid Password Rules:**
- Minimum 8 characters
- Contains uppercase (A-Z)
- Contains lowercase (a-z)
- Contains number (0-9)
- Example: `SecurePass123` ✅

---

### 4. API Call to Backend

**File**: `frontend/src/utils/api.js`

```javascript
// Prepare registration data
const registrationData = {
  email: "john@example.com",
  password: "SecurePass123",
  firstName: "John",
  lastName: "Doe",
  role: "applicant"
};

// Send to backend
const response = await authAPI.register(registrationData);
// POST http://localhost:5000/api/auth/register
```

**Console Output:**
```javascript
Registering user: {
  email: "john@example.com",
  password: "SecurePass123",
  firstName: "John",
  lastName: "Doe",
  role: "applicant"
}
```

---

### 5. Backend Processing

**File**: `backend/src/controllers/authController.js`

#### Step 5a: Receive Request
```javascript
const { email, password, firstName, lastName, role = 'applicant' } = req.body;
```

#### Step 5b: Validate Input
```javascript
// Check all fields present
if (!email || !password || !firstName || !lastName) {
  return { error: 'Missing required fields' }
}

// Validate email format
if (!validateEmail(email)) {
  return { error: 'Invalid email format' }
}

// Validate password strength
if (!validatePassword(password)) {
  return { error: 'Password must be at least 8 characters...' }
}
```

#### Step 5c: Check Email Unique
```javascript
const existingUser = await db.collection('users')
  .where('email', '==', email)
  .get();

if (!existingUser.empty) {
  return { error: 'User already exists' }
}
```

#### Step 5d: Create Firebase Auth User
```javascript
const userRecord = await auth.createUser({
  email: email,
  password: password
});
// Returns: { uid: "firebase_unique_id" }
```

#### Step 5e: Store in Firestore
```javascript
const userData = {
  uid: userRecord.uid,
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "applicant",
  status: "active",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
};

await db.collection('users').doc(userRecord.uid).set(userData);
```

**Firestore Document Created:**
```
Collection: users
Document ID: firebase_uid_12345
Data:
{
  uid: "firebase_uid_12345",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "applicant",
  status: "active",
  createdAt: 2026-01-29T10:30:00Z,
  updatedAt: 2026-01-29T10:30:00Z
}
```

#### Step 5f: Generate JWT Token
```javascript
const token = jwt.sign(
  {
    uid: userRecord.uid,
    email: email,
    role: role
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Step 5g: Send Response
```javascript
res.status(201).json({
  message: 'User registered successfully',
  user: userData,
  token: token
});
```

---

### 6. Frontend Receives Response

**Console Output:**
```javascript
Registration response: {
  message: 'User registered successfully',
  user: {
    uid: "firebase_uid_12345",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "applicant",
    status: "active",
    createdAt: ...,
    updatedAt: ...
  },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 7. Frontend Stores User Data

**File**: `frontend/src/utils/auth.js`

```javascript
storeUserData(response.data.user, response.data.token);

// Stores in localStorage:
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
localStorage.setItem('user', JSON.stringify({
  uid: "firebase_uid_12345",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "applicant"
}));
```

---

### 8. Role-Based Redirect

**File**: `frontend/src/pages/Register.jsx`

```javascript
if (formData.role === 'admin') {
  navigate('/admin/dashboard');
} else if (formData.role === 'reviewer') {
  navigate('/reviews');
} else {
  navigate('/my-applications'); // applicant
}
```

| Role | Redirect URL | Component |
|------|--------------|-----------|
| Applicant | `/my-applications` | MyApplications.jsx |
| Reviewer | `/reviews` | Reviews.jsx |
| Administrator | `/admin/dashboard` | AdminDashboard.jsx |

---

### 9. User Sees Dashboard

Based on role, user is now in:

#### Applicant Dashboard (`/my-applications`)
- List of available funding opportunities to apply for
- Status of submitted applications
- Filter by status
- View feedback from reviewers

#### Reviewer Dashboard (`/reviews`)
- List of applications assigned for review
- Filter by review status
- Submit evaluations
- Add comments and scores

#### Administrator Dashboard (`/admin/dashboard`)
- System statistics
- Create new funding calls
- Manage applications
- Assign reviewers
- View reports

---

## Error Handling

### Frontend Catches Errors

```javascript
try {
  const response = await authAPI.register(registrationData);
  // Success - proceed
} catch (err) {
  console.error('Registration error:', err);
  const errorMessage = err.response?.data?.error || 
                       err.message || 
                       'Registration failed. Please try again.';
  setError(errorMessage);
}
```

### User Sees Error Alert

```
┌─────────────────────────────────────┐
│ ❌ User already exists               │
│                                  ✕ │
└─────────────────────────────────────┘
```

---

## Complete Data Flow

```
User Input
   ↓
Frontend Validation ✅
   ↓
API Call (POST /api/auth/register)
   ↓
Backend Receives Request
   ↓
Validate Inputs ✅
   ↓
Check Email Unique ✅
   ↓
Create Firebase Auth User ✅
   ↓
Store in Firestore ✅
   ↓
Generate JWT Token ✅
   ↓
Return Response
   ↓
Frontend Stores Token + User Data
   ↓
Frontend Redirects to Dashboard
   ↓
User Logged In & Ready ✅
```

---

## Session Management

### After Registration

1. **Token Stored**: JWT in localStorage
2. **User Stored**: User profile in localStorage
3. **Authentication**: Token sent with every API request

### API Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### On Page Refresh
1. Frontend checks localStorage for token
2. If token exists, user stays logged in
3. If token missing/invalid, redirect to login

---

## Security Features

✅ **Password Hashing**: bcryptjs - never stored in plain text
✅ **JWT Tokens**: Secure token-based authentication
✅ **Email Validation**: Format checking
✅ **Password Validation**: Strength requirements
✅ **CORS Protection**: Only accept requests from localhost:3000
✅ **Input Sanitization**: Remove malicious characters
✅ **Firebase Security**: Industry-standard authentication

---

## Testing Checklist

- [ ] Frontend shows registration form
- [ ] Password validation works (reject weak passwords)
- [ ] Email field validates format
- [ ] Role dropdown has 3 options (Applicant, Reviewer, Admin)
- [ ] Backend API receives request (check Network tab)
- [ ] User created in Firebase Authentication
- [ ] User document created in Firestore
- [ ] Token generated and returned
- [ ] Frontend redirects based on role
- [ ] Token stored in localStorage
- [ ] User can refresh page and stay logged in
- [ ] Can login with registered email/password

