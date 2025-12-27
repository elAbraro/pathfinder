import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
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
import './App.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/scholarships" element={<ScholarshipSearch />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/university/:id" element={<UniversityDetails />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/application/:uniId" element={
                <ProtectedRoute>
                  <ApplicationManager />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourceLibrary />
                </ProtectedRoute>
              } />
              <Route path="/scholarships" element={
                <ProtectedRoute>
                  <ScholarshipSearch />
                </ProtectedRoute>
              } />
              <Route path="/tools/brainstorm" element={
                <ProtectedRoute>
                  <AIBrainstorm />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/consultation" element={
                <ProtectedRoute>
                  <Consultation />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
