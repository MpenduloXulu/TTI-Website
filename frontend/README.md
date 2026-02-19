# TTI Funding Application Frontend

Frontend application for the TTI Funding Application Management System built with React.

## Project Structure

```
frontend/
├── public/                    # Static files
├── src/
│   ├── components/           # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Navigation.jsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FundingOpportunities.jsx
│   │   ├── ApplicationForm.jsx
│   │   ├── ReviewPanel.jsx
│   │   └── ...
│   ├── styles/              # CSS files
│   │   ├── index.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── api.js          # API calls
│   │   ├── auth.js         # Authentication helpers
│   │   └── ...
│   ├── App.jsx             # Main app component
│   ├── index.jsx           # Entry point
│   └── index.html
├── package.json
└── README.md
```

## Setup

```bash
npm install
npm start
```

## Features

- User registration and login
- View available funding opportunities
- Submit applications
- Upload supporting documents
- Track application status
- Admin dashboard
- Review panel (for reviewers)

## Dependencies

- React 18.2.0
- React Router DOM 6.8.0
- Axios 1.3.0
- Firebase 9.17.0
