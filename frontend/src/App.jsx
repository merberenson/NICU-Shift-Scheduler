// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoutes';

import DeleteNurse from './pages/DeleteNurse';

import LoginPage from './pages/Login'; // Use your login here if customized
import Register from './pages/register';
import { UpdateAvailability } from './pages/Update';
import { UpdateInfo } from './pages/UpdateInfo';

import LogoutPage from './pages/Logout';
import AdminMain from './pages/AdminMain';
import NurseMain from './pages/NurseMain';
import NotAuthorizedPage from './pages/NotAuthorized';
import PTORequestPage from './pages/PTORequestPage';
import NurseSchedule from './pages/NurseSchedule';
import AdminSchedule from './pages/AdminSchedule';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/unauthorized" element={<NotAuthorizedPage />} />

          {/* Admin-protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminMain />} />
            <Route path="/teamschedule" element={<AdminSchedule />} />
            <Route path="/deletenurse" element={<DeleteNurse />} />
          </Route>

          {/* Nurse-protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/" element={<NurseMain />} />
            <Route path="/pto" element={<PTORequestPage />} />
            <Route path="/schedule" element={<NurseSchedule />} />

            {/* Your custom routes under nurse role */}
            <Route path="/availability" element={<UpdateAvailability />} />
            <Route path="/updateInfo" element={<UpdateInfo />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
