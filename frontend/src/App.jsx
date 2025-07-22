import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import {Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/register';
import Delete from './pages/Delete';
import {UpdateAvailability, UpdateInfo} from './pages/Update';
import './App.css';

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/delete" element={<Delete />} />
      <Route path="/update" element={<UpdateAvailability />} />
      <Route path="/updateInfo" element={<UpdateInfo/>} />
    </Routes>
    </>
  );
}

export default App;
