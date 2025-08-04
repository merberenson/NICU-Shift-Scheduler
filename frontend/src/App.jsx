import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoutes';

import LoginPage from './pages/Login';
import Register from './pages/register';
import Delete from './pages/Delete';
import { UpdateAvailability } from './pages/Update';
import { UpdateInfo } from './pages/UpdateInfo';

import LogoutPage from './pages/Logout';
import AdminMain from './pages/AdminMain';
import NurseMain from './pages/NurseMain';
import NotAuthorizedPage from './pages/NotAuthorized';
import PTORequestPage from './pages/PTORequestPage';
import NurseSchedule from './pages/NurseSchedule';
import AdminSchedule from './pages/AdminSchedule';
import AdminScheduleGenerator from './pages/AdminScheduleGenerator';
import AdminPTOManagement from './pages/AdminPTOManagement';
import AdminNurseManagement from './pages/AdminNurseManagement';
import AdminProfile from './pages/AdminProfile'; // NEW IMPORT
import AdminEmergencyDashboard from './pages/AdminEmergencyDashboard';
import AdminBlackoutManagement from './pages/AdminBlackoutManagement';
import NurseAbsenceReport from './pages/NurseAbsenceReport';

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
            <Route path="/admin/profile" element={<AdminProfile />} /> {/* NEW ROUTE */}
            <Route path="/teamschedule" element={<AdminSchedule />} />
            <Route path="/admin/generate-schedule" element={<AdminScheduleGenerator />} />
            <Route path="/admin/pto-management" element={<AdminPTOManagement />} />
            <Route path="/admin/nurses" element={<AdminNurseManagement />} />
            
            {/* EMERGENCY MANAGEMENT ROUTES */}
            <Route path="/admin/emergency" element={<AdminEmergencyDashboard />} />
            <Route path="/admin/blackouts" element={<AdminBlackoutManagement />} />
            
            <Route path="/delete" element={<Delete />} /> {/* for backward compatibility */}
          </Route>

          {/* Nurse-protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/" element={<NurseMain />} />
            <Route path="/pto" element={<PTORequestPage />} />
            <Route path="/schedule" element={<NurseSchedule />} />
            <Route path="/availability" element={<UpdateAvailability />} />
            <Route path="/updateInfo" element={<UpdateInfo />} />
            <Route path="/report-absence" element={<NurseAbsenceReport />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;