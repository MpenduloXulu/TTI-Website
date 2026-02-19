# User Roles & Permissions - TTI Funding Application Management System

## Overview
This document defines the user roles, responsibilities, and permissions in the TTI Funding Application Management System.

## Role Definitions

### 1. Administrator (Admin)
**Description**: System administrator responsible for managing the entire platform, creating funding opportunities, and making funding decisions.

**Responsibilities**:
- Create and manage funding calls
- Set funding call opening and closing dates
- Define eligibility criteria
- Publish funding opportunities
- View all submitted applications
- Assign applications to reviewers
- Make final funding decisions (approve/reject)
- Generate reports and analytics
- Manage reviewer assignments
- Monitor system health and usage

**Permissions**:
| Feature | View | Create | Edit | Delete | Approve |
|---------|------|--------|------|--------|---------|
| Funding Calls | ✓ | ✓ | ✓ | ✓ | ✓ |
| Users | ✓ | Limited | Limited | Limited | - |
| All Applications | ✓ | - | ✓ | - | ✓ |
| Reviews | ✓ | - | - | - | ✓ |
| Reports | ✓ | - | - | - | - |
| System Settings | ✓ | ✓ | ✓ | - | - |

**Dashboard Access**:
- Admin Dashboard with statistics
- Application management interface
- Reviewer assignment tools
- Reporting and analytics

---

### 2. Applicant
**Description**: Users who apply for funding opportunities (DUT students, alumni, innovators).

**Responsibilities**:
- Create and manage account
- View available funding opportunities
- Read eligibility criteria and requirements
- Complete application forms
- Upload supporting documents
- Submit applications before deadline
- Track application status
- Receive notifications about applications
- Withdraw applications (if within deadline)

**Permissions**:
| Feature | View | Create | Edit | Delete | Submit |
|---------|------|--------|------|--------|--------|
| Funding Calls | ✓ | - | - | - | - |
| Own Applications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Other Applications | - | - | - | - | - |
| Reviews | Limited | - | - | - | - |
| Documents | ✓ | ✓ | ✓ | ✓ | - |

**Constraints**:
- Cannot see other applicants' applications
- Cannot modify applications after submission
- Cannot access reviewer interface
- Limited to maximum applications per funding call (defined by admin)
- Cannot submit application after deadline

**Dashboard Access**:
- My Applications page
- Funding Opportunities list
- Application status tracking
- Profile management

---

### 3. Reviewer
**Description**: Evaluates applications assigned to them (lecturers, committee members, external experts).

**Responsibilities**:
- Review assigned applications
- Assess submitted documents
- Provide evaluation scores and feedback
- Provide recommendations (approve/reject/conditional)
- Submit completed reviews
- View review guidelines

**Permissions**:
| Feature | View | Create | Edit | Delete | Submit |
|---------|------|--------|------|--------|--------|
| Assigned Applications | ✓ | - | - | - | - |
| Application Documents | ✓ | - | - | - | - |
| Own Reviews | ✓ | ✓ | ✓ | ✓ | ✓ |
| Other Reviews | - | - | - | - | - |
| Funding Calls | ✓ | - | - | - | - |
| All Applications | - | - | - | - | - |

**Constraints**:
- Can only access applications assigned to them
- Cannot modify reviews after submission
- Cannot access admin features
- Cannot create or modify applications
- Cannot manage funding calls

**Dashboard Access**:
- Review Dashboard (assigned applications)
- Application details and documents
- Review submission form
- Review history

---

## Permission Matrix

### Funding Call Management
```
                    Admin    Applicant    Reviewer
Create              ✓        ✗            ✗
View Open           ✓        ✓            ✓
View All            ✓        ✗            ✗
Edit                ✓        ✗            ✗
Publish             ✓        ✗            ✗
Close/Archive       ✓        ✗            ✗
Delete              ✓        ✗            ✗
```

### Application Management
```
                    Admin    Applicant    Reviewer
View Own            ✓        ✓            ✗
View All            ✓        ✗            ✗
View Assigned       ✓        ✗            ✓
Create              ✗        ✓            ✗
Submit              ✗        ✓            ✗
Edit (Draft)        ✗        ✓            ✗
Edit (Submitted)    ✓        ✗            ✗
Delete              ✓        ✓(Draft)     ✗
Assign Reviewer     ✓        ✗            ✗
Update Status       ✓        ✗            ✗
Make Decision       ✓        ✗            ✗
```

### Review Management
```
                    Admin    Applicant    Reviewer
Create Review       ✓        ✗            ✓
View Own Reviews    ✓        ✗            ✓
View All Reviews    ✓        ✗            ✗
View Assigned       ✗        ✗            ✓
Edit Reviews        ✓        ✗            ✓
Submit Review       ✓        ✗            ✓
Delete Review       ✓        ✗            ✓
```

### Document Management
```
                    Admin    Applicant    Reviewer
Upload              ✓        ✓            ✗
View Own            ✓        ✓            ✓
View All            ✓        ✗            ✗
Delete              ✓        ✓            ✗
```

### User Management
```
                    Admin    Applicant    Reviewer
View All Users      ✓        ✗            ✗
View Own Profile    ✓        ✓            ✓
Edit Own Profile    ✓        ✓            ✓
Create User         ✓        ✗            ✗
Edit Other User     ✓        ✗            ✗
Delete User         ✓        ✗            ✗
Assign Role         ✓        ✗            ✗
```

### Reports & Analytics
```
                    Admin    Applicant    Reviewer
View Dashboard      ✓        ✓            ✓
View Statistics     ✓        Limited      Limited
Export Data         ✓        ✗            ✗
View Audit Log      ✓        ✗            ✗
```

---

## Access Control Rules

### Data Access
1. **Applicants** can only access:
   - Public funding call information
   - Their own applications
   - Feedback on their applications
   - Their own profile

2. **Reviewers** can only access:
   - Applications assigned to them
   - Public funding call information
   - Their own reviews
   - Review guidelines

3. **Admins** can access:
   - All data in the system
   - All applications and reviews
   - User information
   - System configuration

### Application Lifecycle Permissions
```
Draft Stage:
  - Applicant: Can create, edit, delete, submit
  - Admin: Can view, edit, delete
  - Reviewer: No access

Submitted Stage:
  - Applicant: Can view only
  - Admin: Can view, edit, assign reviewer
  - Reviewer: No access (until assigned)

Under Review Stage:
  - Applicant: Can view status only
  - Admin: Can view, assign/reassign reviewers
  - Reviewer: Can view, add review (if assigned)

Decision Stage:
  - Applicant: Can view final decision and feedback
  - Admin: Can view, make decision
  - Reviewer: No access
```

---

## Role-Based Navigation

### Admin Views
- Dashboard (statistics and analytics)
- Funding Calls Management
- Applications Management
- Reviewer Management
- User Management
- Reports

### Applicant Views
- Home/Funding Opportunities
- My Applications
- User Profile
- Notifications

### Reviewer Views
- My Reviews (Assigned Applications)
- Review Dashboard
- User Profile
- Notifications

---

## Security Notes

1. **Authentication**: All users must authenticate with email and password
2. **Authorization**: Every API endpoint verifies user role before granting access
3. **Data Isolation**: Users can only access data they have permission to view
4. **Audit Trail**: All actions are logged with user, timestamp, and action type
5. **Session Management**: Sessions expire after inactivity; tokens must be refreshed
6. **HTTPS**: All communications must be encrypted with HTTPS/TLS

---

## Role Assignment

### Creating Users
- **Admin Role**: Can only be assigned by system administrator via backend
- **Applicant Role**: Can self-register through public registration form
- **Reviewer Role**: Can self-register or be invited by admin

### Changing Roles
- Only admins can change user roles
- Role changes should be logged in audit trail
- Role change notifications should be sent to user

---

## Future Enhancements

- Delegation of reviewer permissions
- Temporary access grants
- Custom role creation
- Fine-grained permission management
- Audit trail visualization
- Permission templates for bulk operations
