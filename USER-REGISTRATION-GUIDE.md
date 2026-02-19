# User Registration & Role Management Guide

## Overview
The TTI Funding Application Management System supports three user roles, each with specific permissions and workflows:

1. **Applicant** - DUT Students, Alumni, Innovators
2. **Reviewer** - Lecturers, Committee Members, External Experts
3. **Administrator** - TTI Staff

---

## Registration Process

### Step 1: Navigate to Register Page
- Go to http://localhost:3000/register
- Fill in the registration form with:
  - **First Name**: Your first name
  - **Last Name**: Your last name
  - **Email Address**: Valid email (will be used for login)
  - **Password**: Minimum 8 characters with uppercase, lowercase, and numbers
  - **Confirm Password**: Re-enter the password
  - **User Role**: Select from Applicant, Reviewer, or Administrator

### Step 2: Submit Registration
- Click the "Register" button
- System validates all fields
- User is created in Firebase Authentication
- User profile is stored in Firestore

### Step 3: Post-Registration Redirect
After successful registration, users are automatically redirected based on their role:

| Role | Redirected To | Purpose |
|------|---------------|---------|
| **Applicant** | `/my-applications` | Browse and manage funding applications |
| **Reviewer** | `/reviews` | View and evaluate assigned applications |
| **Administrator** | `/admin/dashboard` | Manage funding calls and applications |

---

## User Roles & Permissions

### 1. Applicant
**Who**: DUT Students, Alumni, Innovators
**Access Level**: User-specific data only

#### Permissions:
- ✅ View all open funding opportunities
- ✅ Browse funding opportunity details
- ✅ Submit applications for open funding calls
- ✅ View personal application history
- ✅ Track application status (Submitted, Under Review, Approved, Rejected)
- ✅ Edit applications before deadline
- ✅ Upload supporting documents
- ✅ View feedback and reviewer comments
- ❌ Cannot view other applicants' applications
- ❌ Cannot create funding opportunities
- ❌ Cannot review applications

#### Dashboard Features:
- Personal application list with status filters
- Filter by status (All, Submitted, Under Review, Approved, Rejected)
- Quick view of funding opportunity details
- Application timeline/history

#### Navigation Menu:
```
- Home
- Funding Opportunities
- My Applications (custom menu item)
- Profile
```

---

### 2. Reviewer
**Who**: Lecturers, Committee Members, External Experts
**Access Level**: Assigned applications only

#### Permissions:
- ✅ View assigned applications only
- ✅ View application details and documents
- ✅ Submit evaluation scores and comments
- ✅ Provide recommendations
- ✅ View review history
- ❌ Cannot view other reviewers' reviews (initially)
- ❌ Cannot view all applications
- ❌ Cannot approve/reject applications (system decides)
- ❌ Cannot modify applications

#### Dashboard Features:
- List of applications assigned for review
- Filter by review status
- Application details view with all supporting documents
- Evaluation form with criteria-based scoring
- Comments and recommendations field

#### Navigation Menu:
```
- Home
- Funding Opportunities
- Reviews (custom menu item)
- Profile
```

---

### 3. Administrator
**Who**: TTI Staff
**Access Level**: All system data

#### Permissions:
- ✅ Create new funding opportunities
- ✅ Edit funding opportunity details
- ✅ Publish/close funding calls
- ✅ Set eligibility criteria and deadlines
- ✅ View all submitted applications
- ✅ Filter and search applications
- ✅ Assign applications to reviewers
- ✅ View reviewer evaluations
- ✅ Approve or reject applications
- ✅ Send application status notifications
- ✅ View system statistics and reports
- ✅ Manage user accounts

#### Dashboard Features:
- System overview with key statistics:
  - Total funding calls
  - Total applications received
  - Applications under review
  - Decisions pending
- Recent funding opportunities list
- Recent applications list
- Quick action buttons (Create Funding, Manage Applications)
- Application management table with bulk actions

#### Navigation Menu:
```
- Home
- Funding Opportunities
- Dashboard (admin dashboard)
- Create Funding (direct link)
- Manage Applications (direct link)
- Profile
```

---

## Registration Validation Rules

### Email Validation
- Must be a valid email format
- Must be unique (no duplicate registrations)
- Example: `user@example.com`

### Password Validation
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)
- Example: `SecurePass123`

### Name Validation
- First Name: Required, 1-50 characters
- Last Name: Required, 1-50 characters
- No special characters except hyphens and apostrophes

### Role Selection
- Must select one of: Applicant, Reviewer, Administrator
- Default: Applicant (if not specified)

---

## Backend User Storage

### Firestore Users Collection
Each registered user creates a document in the `users` collection:

```javascript
{
  uid: "firebase_user_id",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "applicant", // or "reviewer" or "admin"
  status: "active",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Authentication
- Users are created in Firebase Authentication
- Email/password authentication
- JWT tokens generated for session management
- Token stored in localStorage

---

## Error Handling

### Common Registration Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Missing required fields" | Not all fields filled | Fill all form fields |
| "Invalid email format" | Email doesn't match pattern | Use valid email (user@domain.com) |
| "User already exists" | Email already registered | Use different email or login |
| "Password must be at least 8 characters..." | Weak password | Use stronger password with uppercase, lowercase, and numbers |
| "Passwords do not match" | Confirm password differs | Ensure both passwords are identical |
| "Registration failed. Please try again." | Backend error | Check backend is running, see console for details |

---

## Testing User Registration

### Test Scenario 1: Applicant Registration
```
Email: applicant@tti.edu
Password: TestPass123
First Name: Jane
Last Name: Student
Role: Applicant
Expected: Redirects to /my-applications
```

### Test Scenario 2: Reviewer Registration
```
Email: reviewer@tti.edu
Password: ReviewPass123
First Name: Prof
Last Name: Lecturer
Role: Reviewer
Expected: Redirects to /reviews
```

### Test Scenario 3: Admin Registration
```
Email: admin@tti.edu
Password: AdminPass123
First Name: Admin
Last Name: Staff
Role: Administrator
Expected: Redirects to /admin/dashboard
```

---

## API Integration

### Registration Endpoint
**POST** `/api/auth/register`

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "applicant"
}
```

#### Response (Success - 201):
```json
{
  "message": "User registered successfully",
  "user": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "applicant",
    "status": "active",
    "createdAt": "2026-01-29T10:30:00Z",
    "updatedAt": "2026-01-29T10:30:00Z"
  },
  "token": "jwt_token_here"
}
```

#### Response (Error - 400/500):
```json
{
  "error": "User already exists"
}
```

---

## Next Steps

1. **Deploy Backend**: Ensure Node.js server is running on port 5000
2. **Configure Firebase**: Add Firebase credentials to backend .env
3. **Test Registration**: Try registering with different roles
4. **Verify Redirects**: Confirm each role redirects to correct dashboard
5. **Check Console**: Monitor browser console for any errors

---

## Support

For registration issues:
1. Check browser console (F12 → Console tab)
2. Verify backend is running (`npm run dev` in backend folder)
3. Ensure Firebase credentials are configured
4. Check network tab in DevTools for API response details

