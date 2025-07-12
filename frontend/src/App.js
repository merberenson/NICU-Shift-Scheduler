import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminMain from './pages/AdminMain';
import NurseMain from './pages/NurseMain';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="*" element={<ErrorPage />} />
        <Route path="/schedule" element={<AdminMain />} />
        <Route path="/main" element={<NurseMain />} />
      </Routes>
    </Router>
  );
}

export default App;
