# Registration Form - Visual Guide

## Form Layout

```
┌───────────────────────────────────────────┐
│                                           │
│              Register                     │
│          Create your account              │
│                                           │
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────┐  ┌─────────────────┐ │
│  │ First Name      │  │ Last Name       │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │ │
│  │ │ John        │ │  │ │ Doe         │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │ │
│  └─────────────────┘  └─────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Email Address                       │  │
│  │ ┌─────────────────────────────────┐ │  │
│  │ │ john.doe@example.com            │ │  │
│  │ └─────────────────────────────────┘ │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Password                            │  │
│  │ ┌─────────────────────────────────┐ │  │
│  │ │ ••••••••••••••                  │ │  │
│  │ └─────────────────────────────────┘ │  │
│  │ At least 8 characters with uppercase, │
│  │ lowercase, and numbers              │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Confirm Password                    │  │
│  │ ┌─────────────────────────────────┐ │  │
│  │ │ ••••••••••••••                  │ │  │
│  │ └─────────────────────────────────┘ │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ User Role                           │  │
│  │ ┌─────────────────────────────────┐ │  │
│  │ │ ▼ Applicant                     │ │  │
│  │ │ - Applicant                     │ │  │
│  │ │ - Reviewer                      │ │  │
│  │ │ - Administrator                 │ │  │
│  │ └─────────────────────────────────┘ │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │    Register                         │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Have an account?  Login                  │
│                                           │
└───────────────────────────────────────────┘
```

---

## Form Fields Description

### First Name
- **Type**: Text input
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 50 characters
- **Validation**: Required field
- **Example**: John, Jane, Ahmed

### Last Name
- **Type**: Text input
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 50 characters
- **Validation**: Required field
- **Example**: Doe, Smith, Al-Rashid

### Email Address
- **Type**: Email input
- **Required**: Yes
- **Validation**:
  - Must be valid email format
  - Must be unique (not already registered)
- **Example**: john.doe@example.com
- **Error Cases**:
  - Invalid format: "test@" ❌
  - Already exists: "used@example.com" ❌

### Password
- **Type**: Password input (hidden characters)
- **Required**: Yes
- **Validation Rules**:
  - Minimum 8 characters
  - At least 1 UPPERCASE letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
- **Valid Examples**:
  - `SecurePass123` ✅
  - `AdminPass456` ✅
  - `TestPass789` ✅
- **Invalid Examples**:
  - `password123` ❌ (no uppercase)
  - `PASSWORD123` ❌ (no lowercase)
  - `Password` ❌ (no number)
  - `Pass1` ❌ (too short)

### Confirm Password
- **Type**: Password input (hidden characters)
- **Required**: Yes
- **Validation**: Must match Password field exactly
- **Error**: "Passwords do not match" if different

### User Role (Dropdown)
- **Type**: Select dropdown
- **Required**: Yes
- **Options**:
  1. **Applicant** (Default)
     - For students, alumni, innovators
     - Access: My Applications, Funding Opportunities
  
  2. **Reviewer**
     - For lecturers, committee members, experts
     - Access: Reviews, Assigned Applications
  
  3. **Administrator** ⭐ NEW
     - For TTI staff
     - Access: Admin Dashboard, Funding Management
- **Default**: Applicant (if not changed)

---

## Form Validation Flow

```
User Fills Form
     ↓
User Clicks "Register"
     ↓
Frontend Validates:
  ✓ All fields filled
  ✓ Email format valid
  ✓ Passwords match
  ✓ Password strong (8+, uppercase, lowercase, number)
     ↓
  If validation fails → Show error alert (stay on form)
  If validation passes → Continue
     ↓
Disable "Register" button (show "Creating account...")
     ↓
Send to Backend
     ↓
Backend Validates:
  ✓ Email unique
  ✓ Password strong
  ✓ All fields present
     ↓
  If fails → Return error message
  If passes → Create user
     ↓
Create Firebase Auth User
Create Firestore User Document
Generate JWT Token
     ↓
Return success + token + user data
     ↓
Frontend Stores:
  ✓ Token in localStorage
  ✓ User data in localStorage
     ↓
Show "Registration successful! Redirecting..."
     ↓
Wait 1.5 seconds
     ↓
Redirect Based on Role:
  ✓ Applicant → /my-applications
  ✓ Reviewer → /reviews
  ✓ Administrator → /admin/dashboard
     ↓
User sees dashboard
```

---

## Error States

### Error: Invalid Email Format
```
┌──────────────────────────────────────────┐
│ ❌ Invalid email format                   │
└──────────────────────────────────────────┘
```

### Error: User Already Exists
```
┌──────────────────────────────────────────┐
│ ❌ User already exists                    │
└──────────────────────────────────────────┘
```

### Error: Weak Password
```
┌──────────────────────────────────────────┐
│ ❌ Password must be at least 8 characters │
│    with uppercase, lowercase, and numbers │
└──────────────────────────────────────────┘
```

### Error: Passwords Don't Match
```
┌──────────────────────────────────────────┐
│ ❌ Passwords do not match                 │
└──────────────────────────────────────────┘
```

### Error: Backend Unreachable
```
┌──────────────────────────────────────────┐
│ ❌ Registration failed. Please try again. │
└──────────────────────────────────────────┘
```

---

## Success State

### After Registration Success
```
┌──────────────────────────────────────────┐
│ ✅ Registration successful!               │
│    Redirecting...                         │
└──────────────────────────────────────────┘

[Waiting 1.5 seconds...]

Redirect to dashboard:
- Applicant  → /my-applications
- Reviewer   → /reviews
- Admin      → /admin/dashboard
```

---

## Field Focus & Interaction

### Password Field
```
On Focus:
- Show password requirements
- Clear any errors

On Input:
- Check password strength in real-time
- Show validation indicators

On Type:
```
✓ At least 8 characters
✓ Includes uppercase (A-Z)
✓ Includes lowercase (a-z)
✓ Includes numbers (0-9)
```
```

### Role Dropdown
```
Applicant (Selected)
▼
  ┌─────────────────────────┐
  │ Applicant               │
  │ Reviewer                │
  │ Administrator (NEW!)    │
  └─────────────────────────┘
```

---

## Responsive Design

### Mobile View (< 768px)
```
┌──────────────────┐
│   Register       │
│ Create account   │
├──────────────────┤
│ First Name       │
│ ┌──────────────┐ │
│ │              │ │
│ └──────────────┘ │
│ Last Name        │
│ ┌──────────────┐ │
│ │              │ │
│ └──────────────┘ │
│ Email Address    │
│ ┌──────────────┐ │
│ │              │ │
│ └──────────────┘ │
│ Password         │
│ ┌──────────────┐ │
│ │              │ │
│ └──────────────┘ │
│ Confirm Password │
│ ┌──────────────┐ │
│ │              │ │
│ └──────────────┘ │
│ User Role        │
│ ┌──────────────┐ │
│ │ Applicant ▼  │ │
│ └──────────────┘ │
│ [Register]       │
└──────────────────┘
```

### Desktop View (> 768px)
```
┌────────────────────────────────────┐
│        Register                    │
│     Create your account            │
├────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐ │
│ │ First Name   │  │ Last Name    │ │
│ │ ┌──────────┐ │  │ ┌──────────┐ │ │
│ │ │          │ │  │ │          │ │ │
│ │ └──────────┘ │  │ └──────────┘ │ │
│ └──────────────┘  └──────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Email Address                    │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │                              │ │ │
│ │ └──────────────────────────────┘ │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Password                         │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │                              │ │ │
│ │ └──────────────────────────────┘ │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Confirm Password                 │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │                              │ │ │
│ │ └──────────────────────────────┘ │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ User Role                        │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │ ▼ Applicant                  │ │ │
│ │ └──────────────────────────────┘ │ │
│ └──────────────────────────────────┘ │
│ [Register]                           │
└────────────────────────────────────┘
```

---

## Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Full | Recommended |
| Firefox 88+ | ✅ Full | Works great |
| Safari 14+ | ✅ Full | All features |
| Edge 90+ | ✅ Full | Chromium-based |
| Mobile Chrome | ✅ Full | Touch-optimized |
| Mobile Safari | ✅ Full | iOS support |

---

## Accessibility Features

✅ Form labels associated with inputs
✅ Clear error messages
✅ Password strength indicators
✅ Keyboard navigation support
✅ Required field indicators
✅ Focus states visible
✅ Mobile-friendly layout

