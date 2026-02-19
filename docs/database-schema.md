# Database Schema Design - TTI Funding Application Management System

## Overview
This document outlines the Firestore database structure for the TTI Funding Application Management System.

## Collections and Data Models

### 1. Users Collection
```
users/
├── {userId}
│   ├── email: string (unique)
│   ├── password: string (hashed - stored by Firebase Auth)
│   ├── firstName: string
│   ├── lastName: string
│   ├── role: string (enum: 'admin', 'applicant', 'reviewer')
│   ├── organization: string
│   ├── department: string
│   ├── phoneNumber: string
│   ├── profilePicture: string (URL)
│   ├── status: string (enum: 'active', 'inactive', 'suspended')
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── lastLogin: timestamp
```

### 2. Funding Calls Collection
```
fundingCalls/
├── {fundingCallId}
│   ├── title: string
│   ├── description: string
│   ├── fundingType: string (enum: 'AIF', 'I2P', 'Other')
│   ├── totalBudget: number
│   ├── fundingPerApplication: number
│   ├── status: string (enum: 'draft', 'open', 'closed', 'archived')
│   ├── openingDate: timestamp
│   ├── closingDate: timestamp
│   ├── eligibilityCriteria: array of strings
│   ├── maxApplicationsPerApplicant: number (default: 1)
│   ├── requiredDocuments: array of objects
│   │   └── { name: string, description: string, required: boolean }
│   ├── description: string
│   ├── adminNotes: string
│   ├── createdBy: string (userId of admin)
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── publishedAt: timestamp
```

### 3. Applications Collection
```
applications/
├── {applicationId}
│   ├── fundingCallId: string (reference to fundingCalls)
│   ├── applicantId: string (reference to users)
│   ├── applicantEmail: string
│   ├── applicantName: string
│   ├── organizationName: string
│   ├── organizationDetails: string
│   ├── status: string (enum: 'draft', 'submitted', 'under-review', 'approved', 'rejected')
│   ├── submissionDate: timestamp
│   ├── formData: object
│   │   ├── projectTitle: string
│   │   ├── projectDescription: string
│   │   ├── budget: number
│   │   ├── timeline: string
│   │   ├── objectives: array of strings
│   │   └── ... (other form fields)
│   ├── documents: array of objects
│   │   └── { 
│   │       documentId: string,
│   │       name: string,
│   │       type: string,
│   │       url: string (Firebase Storage URL),
│   │       uploadDate: timestamp,
│   │       size: number
│   │     }
│   ├── reviewAssignments: array of objects
│   │   └── {
│   │       reviewerId: string,
│   │       assignedDate: timestamp,
│   │       status: string (enum: 'pending', 'completed')
│   │     }
│   ├── overallScore: number
│   ├── adminDecision: string (enum: 'pending', 'approved', 'rejected')
│   ├── adminNotes: string
│   ├── decisionDate: timestamp
│   ├── decisionBy: string (userId of admin)
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── withdrawnAt: timestamp (optional)
```

### 4. Reviews Collection
```
reviews/
├── {reviewId}
│   ├── applicationId: string (reference to applications)
│   ├── fundingCallId: string (reference to fundingCalls)
│   ├── reviewerId: string (reference to users)
│   ├── applicantName: string
│   ├── status: string (enum: 'pending', 'submitted')
│   ├── overallScore: number (0-100)
│   ├── criteria: array of objects
│   │   └── {
│   │       name: string,
│   │       score: number (0-10),
│   │       comment: string
│   │     }
│   ├── generalComments: string
│   ├── recommendation: string (enum: 'approve', 'reject', 'conditional')
│   ├── submissionDate: timestamp
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── savedAsDraft: boolean
```

### 5. Notifications Collection
```
notifications/
├── {notificationId}
│   ├── userId: string (recipient - reference to users)
│   ├── type: string (enum: 'application_submitted', 'status_updated', 'review_assigned', 'decision_made', 'deadline_reminder')
│   ├── title: string
│   ├── message: string
│   ├── relatedId: string (applicationId, fundingCallId, etc.)
│   ├── relatedType: string (enum: 'application', 'fundingCall', 'review')
│   ├── isRead: boolean (default: false)
│   ├── actionUrl: string (link to related resource)
│   ├── createdAt: timestamp
│   └── expiresAt: timestamp (optional)
```

### 6. Application Tracking Collection (Optional - for audit trail)
```
applicationTracking/
├── {trackingId}
│   ├── applicationId: string (reference to applications)
│   ├── event: string (enum: 'created', 'submitted', 'under_review', 'assigned_to_reviewer', 'review_completed', 'approved', 'rejected')
│   ├── details: string
│   ├── performedBy: string (userId)
│   ├── timestamp: timestamp
│   └── previousStatus: string
```

### 7. System Configuration Collection (Optional)
```
config/
├── appSettings
│   ├── appName: string
│   ├── appVersion: string
│   ├── maxFileSize: number (in bytes)
│   ├── allowedFileTypes: array of strings
│   ├── emailNotificationsEnabled: boolean
│   └── maintenanceMode: boolean
```

## Indexes

### Recommended Firestore Indexes

1. **fundingCalls** - Query by status and closing date
   - Status (Ascending)
   - Closing Date (Descending)

2. **applications** - Query by applicant and funding call
   - Applicant ID (Ascending)
   - Funding Call ID (Ascending)
   - Status (Ascending)

3. **applications** - Query by status and submission date
   - Status (Ascending)
   - Submission Date (Descending)

4. **reviews** - Query by reviewer
   - Reviewer ID (Ascending)
   - Status (Ascending)
   - Created At (Descending)

5. **notifications** - Query by user and read status
   - User ID (Ascending)
   - Is Read (Ascending)
   - Created At (Descending)

## Security Rules

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if hasRole(['admin', 'reviewer']);
    }

    // Everyone can read open funding calls
    match /fundingCalls/{fundingCallId} {
      allow read: if true;
      allow write: if hasRole(['admin']);
    }

    // Users can read applications they're involved with
    match /applications/{applicationId} {
      allow read: if isApplicant(applicationId) || isAssignedReviewer(applicationId) || hasRole(['admin']);
      allow write: if isApplicant(applicationId) || hasRole(['admin']);
    }

    // Reviewers can read/write reviews they're assigned to
    match /reviews/{reviewId} {
      allow read, write: if request.auth.uid == resource.data.reviewerId || hasRole(['admin']);
    }

    // Users can read their notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }

  // Helper functions
  function hasRole(roles) {
    return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in roles;
  }

  function isApplicant(applicationId) {
    return request.auth.uid == get(/databases/$(database)/documents/applications/$(applicationId)).data.applicantId;
  }

  function isAssignedReviewer(applicationId) {
    let reviewers = get(/databases/$(database)/documents/applications/$(applicationId)).data.reviewAssignments;
    return request.auth.uid in reviewers.map(r, r.reviewerId);
  }
}
```

## Storage Structure (Firebase Storage)

```
gs://tti-funding-bucket/
├── applications/
│   └── {applicationId}/
│       └── {documentId}/
│           └── {filename}
├── profilePictures/
│   └── {userId}/
│       └── {filename}
└── fundingCallAttachments/
    └── {fundingCallId}/
        └── {filename}
```

## Data Relationships

```
User (Admin)
    ↓ (creates)
    → Funding Call
        ↓ (has many)
        → Applications
            ├─ (submitted by) User (Applicant)
            ├─ (contains) Documents
            ├─ (assigned to) User (Reviewer)
            └─ (has many) Reviews
                └─ (submitted by) User (Reviewer)

    → (sends) Notifications
        └─ (to) User (Applicant/Reviewer)
```

## Notes

- All timestamps are server-side generated
- Email is stored in both users collection and Firebase Auth for easier querying
- Documents are stored in Firebase Storage, with metadata in Firestore
- All sensitive data (passwords) is managed by Firebase Authentication
- The system uses Firestore's real-time capabilities for notifications
- Indexes should be created automatically or manually in Firebase Console
