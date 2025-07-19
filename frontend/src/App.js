import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoutes';

import LoginPage from './pages/Login';
import AdminMain from './pages/AdminMain';
import NurseMain from './pages/NurseMain';
import NotAuthorizedPage from './pages/NotAuthorized';
import LogoutPage from './pages/LogoutPage'; // ← NEW

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} /> {/* ← NEW */}
          <Route path="/unauthorized" element={<NotAuthorizedPage />} />

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminMain />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/" element={<NurseMain />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
