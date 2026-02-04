# TTI Funding Application Management System

## Overview
An online Funding Application Management System that simplifies how TTI manages funding opportunities and processes applications. The system provides a centralized platform for posting funding calls and managing the complete application lifecycle.

## Project Structure

```
TTI_Prototype/
├── frontend/                 # React/Angular frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Utility functions
│   │   ├── App.html         # Main app component
│   │   └── index.html       # Entry point
│   ├── package.json
│   └── README.md
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # Data models
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Server entry point
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── README.md
│
├── docs/                     # Project documentation
│   ├── requirements.md       # Functional and non-functional requirements
│   ├── database-schema.md    # Database design
│   ├── api-documentation.md # API endpoints documentation
│   └── user-roles.md        # User roles and permissions
│
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Styling**: CSS3 with Responsive Design
- **State Management**: Context API
- **HTTP Client**: Axios 1.3.0

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js 4.18.2
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication with JWT
- **Environment**: .env for configuration

### Database
- **Platform**: Firebase
  - Firestore for structured data storage
  - Firebase Storage for document uploads
  - Firebase Authentication for user management

## User Roles

1. **TTI Administrator**
   - Create and manage funding opportunities
   - Set opening and closing dates
   - View and manage applications
   - Assign applications for review
   - Make funding decisions

2. **Applicant** (DUT Students, Alumni, Innovators)
   - Register and login
   - View available funding opportunities
   - Submit applications
   - Upload supporting documents
   - Track application status

3. **Reviewer** (Lecturer, Committee Member, External Expert)
   - Review assigned applications
   - Provide scores and feedback
   - Submit recommendations

## Core Features (Phase 1 & 2)

- [x] User Registration and Authentication
- [x] Role-Based Access Control (RBAC)
- [x] Funding Opportunity Management
- [x] Application Submission
- [x] Document Upload (Framework)
- [x] Application Review System
- [x] Status Tracking
- [x] Notification System (Framework)

## Getting Started

### Quick Start
For detailed setup instructions, see [SETUP.md](./SETUP.md)

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
```bash
cd TTI_Prototype
```

2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

3. Backend Setup (in another terminal)
```bash
cd backend
npm install
cp .env.example .env
# Configure Firebase credentials in .env
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Completion Status

### Phase 1: Requirements & Planning ✅
- [x] Project structure created
- [x] Requirements documented
- [x] Database schema designed
- [x] User roles defined
- [x] Tech stack selected

### Phase 2: Design & Architecture ✅
- [x] Database schema implementation
- [x] API endpoints designed
- [x] Backend controllers implemented
- [x] Frontend components created
- [x] Authentication system setup
- [x] API integration layer created

### Phase 3: MVP Development ✅
- [x] User registration and login
- [x] Funding opportunity management (CRUD)
- [x] Application submission system
- [x] Application review workflow
- [x] Admin dashboard (basic)
- [x] Frontend pages and components
- [x] Responsive CSS styling

### Phase 4: Enhancements (Future)
- [ ] Reviewer dashboard enhancements
- [ ] Advanced reporting and analytics
- [ ] Email notification system
- [ ] File upload and document management
- [ ] Advanced filtering and search
- [ ] Export/Import functionality

## Environment Variables

Create a `.env` file in the backend directory:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
NODE_ENV=development
PORT=5000
```

## Development Phases

### Phase 1: Requirements & Planning
- [ ] Gather detailed requirements
- [ ] Define use cases
- [ ] Document user workflows
- [ ] Create entity relationship diagram

### Phase 2: Design & Architecture
- [ ] Design database schema
- [ ] Define API endpoints
- [ ] Create UI mockups
- [ ] Plan authentication flow

### Phase 3: Development
- [ ] Build MVP features
- [ ] Implement user authentication
- [ ] Create funding management module
- [ ] Build application submission system
- [ ] Implement document uploads

### Phase 4: Enhancements
- [ ] Reviewer dashboard
- [ ] Reporting and analytics
- [ ] Notification system
- [ ] Additional features

## Documentation

- [Requirements Document](docs/requirements.md)
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api-documentation.md)
- [User Roles & Permissions](docs/user-roles.md)

## License

[Your License Here]

## Contact

For questions or feedback, contact the development team.
