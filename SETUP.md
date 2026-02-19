# Project Setup Guide - TTI Funding Application Management System

## Quick Start

This guide walks you through setting up and running the TTI Funding Application Management System locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Firebase Account**: For backend services (https://firebase.google.com)

## Installation Steps

### Step 1: Clone the Repository

```bash
cd c:\TTI_Prototype
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable the following services:
   - Firestore Database
   - Firebase Authentication
   - Firebase Storage
   - Cloud Functions (optional)

4. Create a service account key:
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely
   - Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json`

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env and add your Firebase credentials
```

**Edit `.backend/.env`:**
```
FIREBASE_PROJECT_ID=your_project_id
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### Step 4: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env
```

**Verify `.frontend/.env`:**
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server is running on port 5000
Firebase Admin SDK initialized
```

### Terminal 2: Start Frontend Application

```bash
cd frontend
npm start
```

The application will automatically open at `http://localhost:3000`

## Initial Testing

### Test Admin Account
Once the backend is running, you can test with an admin account. Create one by:

1. Accessing the registration page
2. Register as a new user
3. Contact backend admin to upgrade role to "admin" (manually update in Firestore)

**Direct Database Method** (for development):
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Firestore Database
3. Find your user in the `users` collection
4. Edit the `role` field to `admin`

### Test User Roles

1. **Applicant Account**:
   - Register with role: "Applicant"
   - Navigate to "Funding Opportunities"
   - View and apply for open calls

2. **Reviewer Account**:
   - Register with role: "Reviewer"
   - Admin assigns applications for review
   - Navigate to "My Reviews" to see assigned applications

3. **Admin Account**:
   - Must be manually elevated from user account
   - Access "Admin Dashboard"
   - Create and manage funding calls
   - Assign reviewers to applications

## Project Structure

```
TTI_Prototype/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Firebase config
│   │   ├── utils/           # Utilities
│   │   └── server.js        # Entry point
│   ├── .env.example
│   ├── .env                 # (git ignored)
│   └── package.json
│
└── docs/                     # Documentation
    ├── requirements.md       # Functional requirements
    ├── database-schema.md    # Database design
    ├── api-documentation.md # API reference
    └── user-roles.md        # Role definitions
```

## Available Scripts

### Backend Scripts

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Run tests
npm test
```

### Frontend Scripts

```bash
# Development server with hot reload
npm start

# Build for production
npm build

# Run tests
npm test

# Eject configuration (one-way, be careful!)
npm eject
```

## API Endpoints

The backend provides RESTful API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Funding Calls
- `GET /api/funding` - List all funding calls
- `GET /api/funding/:id` - Get funding call details
- `POST /api/funding` - Create new funding call (Admin)
- `PUT /api/funding/:id` - Update funding call (Admin)
- `POST /api/funding/:id/publish` - Publish funding call (Admin)
- `DELETE /api/funding/:id` - Delete funding call (Admin)

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application (Admin)
- `POST /api/applications/:id/assign-reviewer` - Assign reviewer (Admin)

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews` - List reviews
- `GET /api/reviews/:id` - Get review details
- `GET /api/reviews/assigned/list` - Get assigned reviews (Reviewer)

## Database Structure

Main collections in Firestore:

- **users**: User accounts and profiles
- **fundingCalls**: Available funding opportunities
- **applications**: Submitted applications
- **reviews**: Application reviews from reviewers
- **notifications**: System notifications

See [database-schema.md](./docs/database-schema.md) for detailed schema.

## Troubleshooting

### Backend Issues

**"Firebase Admin SDK not initialized"**
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
- Check service account key file path is correct
- Verify Firebase project ID in .env

**"Cannot find module"**
- Run `npm install` in backend directory
- Clear node_modules: `rm -r node_modules && npm install`

**Port 5000 already in use**
- Change PORT in .env file
- Or kill process using port: `lsof -i :5000` then `kill -9 <PID>`

### Frontend Issues

**"Can't find module"**
- Run `npm install` in frontend directory
- Delete node_modules and reinstall

**"CORS error when calling API"**
- Ensure backend is running on port 5000
- Check `REACT_APP_API_BASE_URL` in .env matches backend URL
- Verify CORS configuration in backend server.js

**White screen or blank page**
- Check browser console for JavaScript errors
- Try clearing browser cache: Ctrl+Shift+Delete
- Verify API backend is running

### Firebase Issues

**"Permission denied" errors**
- Check Firestore security rules
- Verify user authentication status
- Review user roles and permissions

**"Authentication error"**
- Ensure Firebase project is active
- Check Firebase credentials in backend .env
- Verify Firebase services are enabled

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Modify files in `backend/src/`
   - Server auto-reloads with nodemon
   - Test with API client (Postman, Insomnia)

2. **Frontend Changes**:
   - Modify files in `frontend/src/`
   - Browser auto-refreshes
   - Check browser console for errors

### Creating New Features

1. **Backend Feature**:
   - Create controller in `src/controllers/`
   - Add routes in `src/routes/`
   - Update server.js if new route type
   - Test with API client

2. **Frontend Feature**:
   - Create component in `src/components/` or page in `src/pages/`
   - Import in App.jsx or parent component
   - Add route in App.jsx if it's a new page
   - Test in browser

## Deployment Preparation

### Before Deploying to Production

1. **Environment Configuration**:
   - Update .env files for production
   - Use secure, strong JWT_SECRET
   - Configure proper CORS_ORIGIN

2. **Security Checklist**:
   - [ ] Change all default passwords
   - [ ] Enable HTTPS
   - [ ] Implement rate limiting
   - [ ] Review Firestore security rules
   - [ ] Enable API key restrictions
   - [ ] Set up monitoring and logging

3. **Database**:
   - [ ] Backup Firestore database
   - [ ] Set up automated backups
   - [ ] Create appropriate indexes
   - [ ] Test recovery procedures

4. **Frontend Build**:
   ```bash
   cd frontend
   npm run build
   # Deploy 'build' folder to hosting service
   ```

## Support & Documentation

- [Requirements Document](./docs/requirements.md)
- [Database Schema](./docs/database-schema.md)
- [API Documentation](./docs/api-documentation.md)
- [User Roles](./docs/user-roles.md)

## Next Steps

1. ✅ Complete initial setup (you are here)
2. ⬜ Create test accounts for different roles
3. ⬜ Create test funding calls
4. ⬜ Test application submission
5. ⬜ Test reviewer functionality
6. ⬜ Implement additional features as needed
7. ⬜ Prepare for production deployment

## Common Commands

```bash
# Backend - Development
cd backend && npm run dev

# Backend - Production
cd backend && npm start

# Frontend - Development
cd frontend && npm start

# Frontend - Build
cd frontend && npm run build

# Install dependencies (if needed)
cd <project> && npm install

# Clean install
rm -rf node_modules package-lock.json && npm install
```

## Getting Help

- Check documentation in `/docs` folder
- Review error messages in browser console and terminal
- Check Firebase Console for data and configurations
- Refer to source code comments for implementation details

---

**Last Updated**: January 29, 2026
**Version**: 0.1.0
