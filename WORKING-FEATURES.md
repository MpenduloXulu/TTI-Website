# TTI Funding Application Management System - Working Features

## Overview
The TTI (Technology Transfer & Innovation) Funding Application Management System is a web-based platform designed for DUT (Durban University of Technology) to manage funding opportunities, applications, and disbursements for innovation and technology projects.

---

## 🔐 1. Authentication & User Management

### 1.1 User Registration
- **Email/Password Registration**: Users can create accounts with email and password
- **Password Validation**: Enforces strong passwords requiring:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Automatic Profile Creation**: User profiles are automatically created in Firebase Firestore upon registration
- **Default Role Assignment**: New users are automatically assigned the "applicant" role

### 1.2 User Login
- **Email/Password Authentication**: Secure login using Firebase Authentication
- **Persistent Sessions**: Uses browser local storage persistence for session management
- **Role-Based Redirection**: After login, users are redirected based on their role:
  - Applicants → Applicant Dashboard
  - Admins → Admin Dashboard
- **Error Handling**: Clear error messages for invalid credentials

### 1.3 Password Recovery
- **Forgot Password**: Users can request a password reset link via email
- **Email Verification**: Reset link sent to registered email address

### 1.4 User Logout
- **Secure Sign Out**: Clears session data and Firebase authentication state
- **Redirect to Landing Page**: Users are redirected to the home page after logout

---

## 👤 2. User Profile Management

### 2.1 View Profile
- **Personal Information Display**: Shows user's name, email, phone, organization, and bio
- **Role Display**: Shows the user's assigned role (Applicant/Admin)

### 2.2 Edit Profile
- **Editable Fields**:
  - First Name
  - Last Name
  - Phone Number
  - Organization
  - Bio/Description
- **Real-time Validation**: Form validation before saving
- **Change Detection**: Only saves when actual changes are made

### 2.3 Delete Account
- **Account Deletion**: Users can permanently delete their account
- **Confirmation Required**: Confirmation dialog before deletion
- **Data Cleanup**: Removes user profile from Firestore and Firebase Auth

---

## 📋 3. Applicant Features

### 3.1 Applicant Dashboard
- **Welcome Message**: Personalized greeting with user's name
- **Funding Opportunities List**: Displays all available funding opportunities
- **Quick Actions**: Easy navigation to applications, funding, and profile

### 3.2 View Funding Opportunities
- **Opportunity Cards**: Visual cards displaying funding opportunities with:
  - Title and description
  - Funding type (I2P, TDF, AIF, IBF)
  - Total budget/amount
  - Opening and closing dates
  - Eligibility criteria
  - Availability status (Open/Upcoming/Closed)
- **Filtering**: Filter opportunities by funding type
- **Search**: Search opportunities by keyword
- **Sorting**: Opportunities sorted by availability (Open first, then Upcoming, then Closed)

### 3.3 Submit Applications
- **Dynamic Application Forms**: Forms adapt based on the selected funding opportunity
- **Structured Sections**:
  - **Personal Profile Section**:
    - Name & Surname
    - Staff/Student Number
    - Email Address
    - Cellphone Number
  - **Innovation/Project Section**:
    - Project Title
    - Project Details (with word count limit - 250 words max)
    - Total Funding Requested
    - Purpose of Funding
    - Technology Innovation Description
    - Technology Readiness Level
- **Document Uploads**:
  - Upload supporting documents (PDF, DOC, DOCX, images)
  - Multiple document types supported (Project Proposal, Budget Breakdown, CV)
  - File size restrictions
  - Secure storage in Firebase Storage
- **Draft Saving**: Save applications as drafts before submission
- **Form Validation**: Required field validation before submission
- **Submission Confirmation**: Success message after successful submission

### 3.4 Application Status Tracking
- **My Applications Page**: View all submitted applications
- **Status Indicators**: Visual status pills showing:
  - Submitted (Blue)
  - Under Review (Yellow)
  - Approved (Green)
  - Rejected (Red)
  - Withdrawn (Gray)
- **Status Filtering**: Filter applications by status
- **Status Counts**: Summary showing count of applications in each status
- **Detailed View**: Click to view full application details including:
  - All submitted responses
  - Attached documents
  - Submission date
  - Last update date
  - Admin notes/feedback

---

## 🔧 4. Administrator Features

### 4.1 Admin Dashboard
- **Funding Opportunity Management**: Create and manage bursary/funding opportunities
- **Create New Opportunity**: Form to create new funding calls with:
  - Title
  - Funding Type Selection (I2P, TDF, AIF, IBF)
  - Total Budget
  - Opening Date
  - Closing Date
  - Description
  - Eligibility Criteria
  - Custom Application Attributes/Questions
- **Edit Opportunities**: Modify existing funding opportunities
- **Delete Opportunities**: Remove funding opportunities (with confirmation)
- **View All Opportunities**: List of all created funding opportunities

### 4.2 Funding Programs Supported
1. **IDEA TO PROTOTYPE PROGRAMME (I2P)**: Early-stage innovation funding
2. **DUT-TTI TECHNOLOGY DEVELOPMENT FUND (TDF)**: Technology development support
3. **DUT - ALUMNI INNOVATION FUND (AIF)**: Alumni innovation support
4. **DUT-TTI INNOVATION BUILDER FUND (IBF)**: Innovation building support

### 4.3 Applicant Management
- **All Applicants View**: Table listing all submitted applications with:
  - Applicant Name
  - Email
  - Submission Date
  - Funding Opportunity
  - Current Status
- **View Application Details**: Modal popup showing full application details
- **Application Review Actions**:
  - **Approve**: Approve pending applications
  - **Decline**: Decline pending applications with notes
- **Add Admin Notes**: Add internal notes to applications

### 4.4 Fund Allocation
- **Approved Applicants List**: View all approved applicants
- **Allocate Funds**: Assign specific amounts to approved applicants
- **Allocation Fields**:
  - Allocation Amount (in Rands)
  - Allocation Notes
- **Allocation Tracking**: View when allocations were last updated
- **Save Allocations**: Persist allocation data

### 4.5 Declined Applicants
- **Audit Log**: View history of declined/rejected applications
- **Details Shown**:
  - Applicant Name
  - Email
  - Funding Opportunity
  - Decision Date
  - Admin Notes/Reason

---

## 🎨 5. User Interface Features

### 5.1 Navigation
- **Header Navigation**: Consistent header across protected pages
- **Admin Sidebar**: Dedicated sidebar for admin pages with links to:
  - Dashboard
  - Applicants
  - Fund Allocation
  - Declined Applicants
- **Breadcrumb Navigation**: Easy navigation back to previous pages

### 5.2 Responsive Design
- **Mobile-Friendly**: Responsive layouts for various screen sizes
- **Modern Styling**: Clean, professional CSS styling

### 5.3 Loading States
- **Loading Spinners**: Visual feedback during data loading
- **Loading Messages**: Contextual messages (e.g., "Loading applicants...")

### 5.4 Alerts & Notifications
- **Success Alerts**: Green alerts for successful operations
- **Error Alerts**: Red alerts for errors
- **Warning Alerts**: Yellow alerts for warnings
- **Info Alerts**: Blue alerts for informational messages
- **Dismissible**: All alerts can be closed by the user

### 5.5 Modals
- **Application Detail Modal**: View full application details
- **Success Modal**: Registration success confirmation
- **Role Selection Modal**: Select dashboard after login

---

## 🔒 6. Security Features

### 6.1 Authentication
- **Firebase Authentication**: Industry-standard authentication
- **JWT Token Management**: Secure token storage and management
- **Session Persistence**: Browser local storage for session persistence

### 6.2 Protected Routes
- **Route Protection**: All dashboard pages require authentication
- **Role-Based Access Control**: 
  - Applicant routes protected from admin-only features
  - Admin routes require admin role
- **Automatic Redirect**: Unauthenticated users redirected to login

### 6.3 Data Security
- **Firestore Security Rules**: Database-level security rules
- **Secure File Storage**: Firebase Storage for document uploads
- **Input Validation**: Client-side validation before submission

---

## 🗄️ 7. Database Structure (Firestore)

### Collections
1. **users**: User profiles and authentication data
2. **bursaries/opportunities**: Funding opportunities
3. **applications**: Submitted applications with responses and documents

---

## 🔄 8. Real-time Features

### 8.1 Data Synchronization
- **Live Updates**: Dashboard data refreshes from Firebase
- **State Management**: React state management for UI updates

---

## 📱 9. Technical Stack

- **Frontend**: React 18 with React Router v6
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Styling**: Custom CSS with component-specific stylesheets
- **State Management**: React useState/useEffect hooks
- **API Communication**: Firebase SDK

---

## 🚀 10. How to Use

### For Applicants:
1. Register or login at the landing page
2. View available funding opportunities on the dashboard
3. Click "Apply" on an open opportunity
4. Fill out the application form with project details
5. Upload required documents
6. Submit the application
7. Track application status on the "Application Status" page

### For Administrators:
1. Login with admin credentials
2. Create new funding opportunities from the Dashboard
3. Review submitted applications in "Applicants" section
4. Approve or decline applications
5. Allocate funds to approved applicants in "Fund Allocation"
6. View declined applicants audit log

---

## 📝 Notes

- The system uses Firebase for all backend services (no separate server required)
- All dates support opening/closing functionality for funding windows
- Currency is displayed in South African Rand (R)
- Document uploads are stored securely in Firebase Storage
