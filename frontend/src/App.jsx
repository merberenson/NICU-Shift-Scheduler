import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import {Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/register';
import './App.css';

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
    </>
  );
}

export default App;
