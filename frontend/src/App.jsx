import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Lock, LogOut, Check, AlertCircle } from 'lucide-react';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import CreateVault from './components/CreateVault';
import ViewVault from './components/ViewVault';
import PublicAccess from './components/PublicAccess';

const API_BASE_URL = 'https://time-bound-digital-access-vault-s4k.vercel.app/api';
// const API_BASE_URL = "http://localhost:3000/api";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Auth Layout 
const AuthLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log(`${API_BASE_URL}/users/logout`);
      const response = await fetch(`${API_BASE_URL}/users/logout`, { method: 'POST', credentials: 'include' });
      const data = await response.json();
      console.log('Logout response:', data);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Digital Vault</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-white"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// Notification
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
      {message}
    </div>
  );
};

const App = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <BrowserRouter>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage showNotification={showNotification} /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage showNotification={showNotification} /></PublicRoute>} />

        {/* Public Share */}
        <Route path="/share/:shareId" element={<PublicAccess />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Dashboard showNotification={showNotification} />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <CreateVault showNotification={showNotification} />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vault/:vaultId"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <ViewVault showNotification={showNotification} />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;