import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LanguageProvider } from './context/LanguageContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import CompareDrawer from './components/CompareDrawer';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import UnitDetail from './pages/UnitDetail';
import RoomDetail from './pages/RoomDetail';
import ComparePage from './pages/ComparePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import './index.css';

// In production on Render, point axios at the backend service URL.
// Locally, Vite proxy handles /api -> localhost:5000 so no baseURL needed.
const apiBase = import.meta.env.VITE_API_BASE_URL;
if (apiBase) {
  axios.defaults.baseURL = `https://${apiBase}`;
}



function ProtectedRoute({ isAdmin, children }) {
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <CompareDrawer />
    </>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAdmin(true);
    }
  }, []);

  return (
    <LanguageProvider>
      <CompareProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/property/:id" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
            <Route path="/unit/:id" element={<PublicLayout><UnitDetail /></PublicLayout>} />
            <Route path="/room/:id" element={<PublicLayout><RoomDetail /></PublicLayout>} />
            <Route path="/compare" element={<PublicLayout><ComparePage /></PublicLayout>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin onLogin={() => setIsAdmin(true)} />} />
            <Route path="/admin" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <AdminDashboard onLogout={() => setIsAdmin(false)} />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <AdminDashboard onLogout={() => setIsAdmin(false)} />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CompareProvider>
    </LanguageProvider>
  );
}
