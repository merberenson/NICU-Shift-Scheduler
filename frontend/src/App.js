// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import ErrorPage from './pages/ErrorPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ScheduleView from './pages/ScheduleView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/schedule" element={<PrivateRoute><ScheduleView /></PrivateRoute>} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;

