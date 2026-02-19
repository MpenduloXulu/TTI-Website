# TTI Funding Application Management System - Requirements

## Executive Summary
This document outlines the functional and non-functional requirements for the TTI Funding Application Management System, designed to streamline the management of funding opportunities and application processes.

## 1. Functional Requirements

### 1.1 User Management

#### 1.1.1 User Registration
- Users must be able to create an account with email and password
- Email validation and uniqueness check required
- Password must meet security requirements (minimum 8 characters, uppercase, lowercase, numbers)
- User roles assigned during registration or by admin

#### 1.1.2 User Authentication
- Secure login with email and password
- JWT token-based authentication
- Session management with token expiry
- Logout functionality
- Password recovery/reset functionality

#### 1.1.3 User Profiles
- Users can view and update their profile information
- Support for different profile types (Applicant, Reviewer, Administrator)
- Profile data includes: name, email, organization, department

### 1.2 Role-Based Access Control (RBAC)

#### 1.2.1 Administrator Role
- Create and manage funding opportunities
- Set opening and closing dates for funding calls
- Define eligibility criteria
- View all submitted applications
- Assign applications to reviewers
- Make funding decisions (approve/reject)
- Generate reports and analytics

#### 1.2.2 Applicant Role
- View available funding opportunities
- Read funding requirements and eligibility criteria
- Complete and submit application forms
- Upload supporting documents
- Track application status
- Receive notifications about application progress
- Withdraw applications (if within deadline)

#### 1.2.3 Reviewer Role
- View assigned applications
- Access application documents
- Provide scores and feedback
- Submit recommendations
- View review guidelines

### 1.3 Funding Opportunity Management

#### 1.3.1 Create Funding Calls
- Define funding call name and description
- Specify funding type (e.g., AIF, I2P)
- Set application opening date and closing date
- Define funding amount per application
- Specify funding allocation (budget cap)
- Define eligibility criteria

#### 1.3.2 Manage Funding Calls
- Edit funding call details before opening
- Publish funding call information
- Close funding calls after deadline
- Archive completed funding calls
- View funding call history

#### 1.3.3 View Funding Opportunities
- Display all open funding opportunities
- Show funding details: title, amount, deadline, eligibility
- Filter and search functionality
- Sorting options (by date, amount, status)

### 1.4 Application Management

#### 1.4.1 Application Submission
- Users complete structured application forms
- Form validation before submission
- Submit before closing deadline
- Confirmation message after successful submission
- Save application as draft functionality

#### 1.4.2 Document Upload
- Upload supporting documents (PDF, DOC, DOCX, images)
- File size restrictions (max 10MB per file)
- Multiple file upload support
- File virus scan before storage
- Secure storage in Firebase Storage

#### 1.4.3 Application Status Tracking
- Display application status: submitted, under review, approved, rejected
- Show timeline of status changes
- Provide feedback comments from reviewers
- Receive status update notifications

#### 1.4.4 Application Management (Admin)
- View all applications with filters
- Search applications by applicant name, funding call, status
- Assign applications to reviewers
- View application details and documents
- Add internal notes
- Make funding decisions

### 1.5 Application Review System

#### 1.5.1 Review Assignment
- Admin assigns applications to reviewers
- Reviewers can view assigned applications
- Review deadline setting

#### 1.5.2 Application Evaluation
- Reviewers access application documents
- Provide evaluation scores
- Add detailed feedback and comments
- Submit review recommendation (approve/reject)
- Save review as draft before submission

#### 1.5.3 Review Dashboard
- Reviewers see list of assigned applications
- Filter by status (pending, completed)
- Track review progress

### 1.6 Notifications

#### 1.6.1 Email Notifications
- Application submission confirmation
- Application status updates
- Review assignment notifications
- Funding decision notifications
- Deadline reminder notifications

#### 1.6.2 In-App Notifications
- Real-time notification display
- Notification history
- Mark notifications as read

### 1.7 Reporting and Analytics

#### 1.7.1 Admin Reports
- Application statistics by funding call
- Application approval/rejection rates
- Applicant demographics
- Timeline reports

## 2. Non-Functional Requirements

### 2.1 Security
- HTTPS/TLS encryption for all data in transit
- Password hashing using BCrypt
- SQL injection prevention
- Cross-site scripting (XSS) prevention
- Cross-site request forgery (CSRF) protection
- Role-based access control enforcement
- Secure file upload and storage
- Data encryption at rest (Firebase)

### 2.2 Performance
- Page load time < 3 seconds
- API response time < 1 second for 95th percentile
- Support for 1000+ concurrent users
- Database query optimization
- Caching strategies implementation

### 2.3 Scalability
- Horizontal scaling capability
- Cloud-based deployment (Firebase)
- Auto-scaling for backend services
- CDN for static assets

### 2.4 Usability
- Responsive design (mobile, tablet, desktop)
- Intuitive user interface
- Accessibility compliance (WCAG 2.1)
- Clear error messages
- User onboarding/help documentation

### 2.5 Reliability
- 99.9% uptime SLA
- Automatic backups
- Disaster recovery procedures
- Error logging and monitoring

### 2.6 Maintainability
- Clean, well-documented code
- Modular architecture
- API documentation
- Database schema documentation
- Deployment procedures

### 2.7 Compatibility
- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design
- Progressive web app (PWA) capabilities

## 3. Data Requirements

### 3.1 User Data
- Registration information
- Profile details
- Authentication credentials
- User roles and permissions
- Account creation and modification timestamps

### 3.2 Funding Call Data
- Funding opportunity details
- Eligibility criteria
- Funding amounts
- Opening and closing dates
- Status information

### 3.3 Application Data
- Applicant information
- Application form responses
- Submitted documents
- Application status and timeline
- Submission timestamps

### 3.4 Review Data
- Review assignments
- Review comments and scores
- Review status
- Review submission timestamps

## 4. Integration Requirements

### 4.1 Email Service
- Email notifications integration
- SMTP configuration for sending emails

### 4.2 File Storage
- Firebase Storage integration for document uploads

### 4.3 Authentication
- Firebase Authentication for user management

## 5. Constraints and Assumptions

### 5.1 Constraints
- Maximum file upload size: 10MB
- Maximum number of documents per application: 20
- Application form submission deadline is strict (no submissions after deadline)

### 5.2 Assumptions
- Users have stable internet connection
- Users have valid email addresses
- Admin users are pre-created by system administrator

## 6. Future Enhancements (Phase 4+)

- SMS notifications
- Mobile application (iOS/Android)
- API for third-party integrations
- Advanced analytics and dashboards
- Bulk operations (import/export)
- Payment gateway integration
- Multi-language support
- Interview/assessment scheduling
