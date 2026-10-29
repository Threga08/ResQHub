import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ReportComplaintPage } from './pages/ReportComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { EmergencyContactsPage } from './pages/EmergencyContactsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaintsPage } from './pages/AdminComplaintsPage';
import { AdminEmergenciesPage } from './pages/AdminEmergenciesPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { NotificationsPage } from './pages/NotificationsPage';

// New Feature Pages
import { GatePassPage } from './pages/GatePassPage';
import { AdminGatePassesPage } from './pages/AdminGatePassesPage';
import { NoticeBoardPage } from './pages/NoticeBoardPage';
import { FeeTrackerPage } from './pages/FeeTrackerPage';

// Protected Route wrapper with role check
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's home dashboard
    if (user.role === 'warden') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />

                {/* Student Routes */}
                <Route 
                  path="/student" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/report" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'warden']}>
                      <ReportComplaintPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-complaints" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MyComplaintsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/gate-pass" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <GatePassPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fees" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <FeeTrackerPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Warden / Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['warden']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/complaints" 
                  element={
                    <ProtectedRoute allowedRoles={['warden']}>
                      <AdminComplaintsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/emergencies" 
                  element={
                    <ProtectedRoute allowedRoles={['warden']}>
                      <AdminEmergenciesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics" 
                  element={
                    <ProtectedRoute allowedRoles={['warden']}>
                      <AdminAnalyticsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/gate-passes" 
                  element={
                    <ProtectedRoute allowedRoles={['warden']}>
                      <AdminGatePassesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/fees" 
                  element={
                    <ProtectedRoute allowedRoles={['warden']}>
                      <FeeTrackerPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Maintenance Staff Routes */}
                <Route 
                  path="/staff" 
                  element={
                    <ProtectedRoute allowedRoles={['staff']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/staff/tasks" 
                  element={
                    <ProtectedRoute allowedRoles={['staff']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Shared Module Routes across Roles */}
                <Route 
                  path="/notices" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'warden', 'staff']}>
                      <NoticeBoardPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Shared Detail & Notification Routes */}
                <Route 
                  path="/complaints/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'warden', 'staff']}>
                      <ComplaintDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'warden', 'staff']}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
