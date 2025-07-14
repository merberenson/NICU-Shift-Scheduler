import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminMain from './pages/AdminMain';
import NurseMain from './pages/NurseMain';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/schedule" element={<AdminMain />} />
        <Route path="/main" element={<NurseMain />} />
      </Routes>
    </Router>
  );
}

export default App;
