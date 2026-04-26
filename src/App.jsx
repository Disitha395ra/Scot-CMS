// src/App.jsx
// Root component: routing + layout + toast provider.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './store/AuthContext';
import ProtectedRoute   from './components/layout/ProtectedRoute';
import Navbar           from './components/layout/Navbar';

import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import BookingPage    from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPanel     from './pages/AdminPanel';
import AdminLoginPage from './pages/AdminLoginPage';

const Layout = ({ children }) => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-12">{children}</main>
      <footer className="w-full py-6 mt-auto text-center text-sm text-slate-400 border-t border-white/5 bg-[#0B0F19]/50 backdrop-blur-sm">
        <p>
          &copy; {currentYear} Scot Campus Class-Room Booking System. Developed by{' '}
          <a
            href="https://disitha-profile.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 transition-colors font-medium profile-link"
          >
            Disitha Ranasinghe
          </a>
        </p>
      </footer>
    </div>
  );
};

const AdminRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    sessionStorage.getItem('scot_admin_auth') === 'true'
  );

  if (!isAuthenticated) {
    return <AdminLoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout>
      <AdminPanel />
    </Layout>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color:      '#e2e8f0',
            border:     '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize:   '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          duration: 4000,
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected by Google Auth */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/book" element={
          <ProtectedRoute>
            <Layout><BookingPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <Layout><MyBookingsPage /></Layout>
          </ProtectedRoute>
        } />

        {/* Custom Admin Auth */}
        <Route path="/admin" element={<AdminRoute />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
