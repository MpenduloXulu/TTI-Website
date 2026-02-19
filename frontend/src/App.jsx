import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/index.css';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Import Pages
import LandingPage from './pages/LandingPage';
import ApplicantDashboard from './pages/ApplicantDashboard';
import FundingOpportunities from './pages/FundingOpportunities';
import ApplicationStatus from './pages/ApplicationStatus';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicants from './pages/AdminApplicants';
import AdminFundAllocation from './pages/AdminFundAllocation';
import AdminDeclinedApplicants from './pages/AdminDeclinedApplicants';
import SelectFundingOpportunity from './pages/SelectFundingOpportunity';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const protectedRoutes = ['/dashboard', '/funding', '/application-status', '/profile', '/select-funding', '/my-applications', '/admin/dashboard', '/admin/applicants', '/admin/fund-allocation', '/admin/declined'];
  const isProtectedRoute = protectedRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!isLandingPage && !isAdminPage && !isAuthPage && !isProtectedRoute && <Header />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
        <Route path="/register" element={<LandingPage />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ApplicantDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/funding" 
          element={
            <ProtectedRoute>
              <FundingOpportunities />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/application-status" 
          element={
            <ProtectedRoute>
              <ApplicationStatus />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/select-funding"
          element={
            <ProtectedRoute>
              <SelectFundingOpportunity />
            </ProtectedRoute>
          }
        />
        <Route path="/my-applications" element={<Navigate to="/application-status" replace />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applicants" element={<AdminApplicants />} />
          <Route path="fund-allocation" element={<AdminFundAllocation />} />
          <Route path="declined" element={<AdminDeclinedApplicants />} />
        </Route>

        {/* TODO: Add more routes as features are implemented */}
        {/* 
        <Route path="/funding/:fundingId" element={<FundingDetails />} />
        <Route path="/apply/:fundingId" element={<ApplicationForm />} />
        <Route path="/application/:applicationId" element={<ApplicationDetails />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin/create-funding" element={<CreateFunding />} />
        <Route path="/admin/applications" element={<ManageApplications />} />
        <Route path="/review-dashboard" element={<ReviewDashboard />} />
        */}
      </Routes>

      {!isLandingPage && !isProtectedRoute && !isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
