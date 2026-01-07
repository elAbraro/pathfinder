import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Search from './pages/Search';
import UniversityDetails from './pages/UniversityDetails';
import ApplicationManager from './pages/ApplicationManager';
import ResourceLibrary from './pages/ResourceLibrary';
import ScholarshipSearch from './pages/ScholarshipSearch';
import Payment from './pages/Payment';
import AIBrainstorm from './pages/AIBrainstorm';
import Consultation from './pages/Consultation';
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import CollaborationSpace from './pages/CollaborationSpace';
import NotificationsPage from './pages/NotificationsPage';
import Analytics from './pages/Analytics';
import './App.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/welcome" />;
  }

  if (allowedRoles && user.role !== 'superuser' && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'consultant' ? '/consultant/dashboard' : '/dashboard'} />;
  }

  return children;
};

// Redirect root based on auth status
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Home />; // Show original home if not logged in

  // Wait until we have a role if it's currently syncing
  if (!user.role) return <div className="p-10 text-center">Syncing profile...</div>;

  if (user.role === 'superuser' || user.role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to={user.role === 'consultant' ? '/consultant/dashboard' : '/dashboard'} />;
};



function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Layout>
              <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/scholarships" element={<ScholarshipSearch />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/university/:id" element={<UniversityDetails />} />

                {/* Home should also be accessible via /home if needed, but root is fine */}
                <Route path="/home" element={<Home />} />

                {/* Protected Routes - Student */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/application/:uniId" element={
                  <ProtectedRoute allowedRoles={['student', 'consultant', 'admin']}>
                    <ApplicationManager />
                  </ProtectedRoute>
                } />
                <Route path="/resources" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ResourceLibrary />
                  </ProtectedRoute>
                } />
                <Route path="/ai-brainstorm" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AIBrainstorm />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/consultation" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Consultation />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/collaboration" element={<ProtectedRoute><CollaborationSpace /></ProtectedRoute>} />
                <Route path="/collaboration/:userId" element={<ProtectedRoute><CollaborationSpace /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

                {/* Protected Routes - Consultant */}
                <Route path="/consultant/dashboard" element={
                  <ProtectedRoute allowedRoles={['consultant']}>
                    <ConsultantDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/consultant/profile" element={
                  <ProtectedRoute allowedRoles={['consultant']}>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
