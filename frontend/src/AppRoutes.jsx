import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Layouts
import Layout from './components/layout/Layout';
import PublicLayout from './components/layout/PublicLayout';

// Public Pages
import Home from './pages/public/Home';
import Features from './pages/public/Features';
import HowItWorks from './pages/public/HowItWorks';
import HowToUse from './pages/public/HowToUse';
import WhyUs from './pages/public/WhyUs';
import Signup from './pages/public/Signup';

// Auth & Dashboard Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import LeavePolicies from './pages/LeavePolicies';
import OrgChart from './pages/OrgChart';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import TeamDirectory from './pages/TeamDirectory';
import TeamReports from './pages/TeamReports';
import WorkforceAnalytics from './pages/WorkforceAnalytics';
import OrgDirectory from './pages/OrgDirectory';
import Shifts from './pages/Shifts';
import Holidays from './pages/Holidays';
import AttendanceRegister from './pages/AttendanceRegister';
import CompanyReports from './pages/CompanyReports';
import OrgSetup from './pages/OrgSetup';
import Notifications from './pages/Notifications';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Public Routes with Shared Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/why-us" element={<WhyUs />} />
        </Route>

        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="org-chart" element={<OrgChart />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="leave-policies" element={<LeavePolicies />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="team-directory" element={<TeamDirectory />} />
          <Route path="team-reports" element={<TeamReports />} />
          <Route path="workforce-analytics" element={<WorkforceAnalytics />} />
          <Route path="org-directory" element={<OrgDirectory />} />
          <Route path="org-setup" element={<ProtectedRoute allowedRoles={['HR Admin']}><OrgSetup /></ProtectedRoute>} />
          <Route path="shifts" element={<ProtectedRoute allowedRoles={['HR Admin']}><Shifts /></ProtectedRoute>} />
          <Route path="holidays" element={<Holidays />} />
          <Route path="attendance-register" element={<ProtectedRoute allowedRoles={['HR Admin', 'Manager', 'Leadership']}><AttendanceRegister /></ProtectedRoute>} />
          <Route path="company-reports" element={<ProtectedRoute allowedRoles={['HR Admin', 'Leadership']}><CompanyReports /></ProtectedRoute>} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
