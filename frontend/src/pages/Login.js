import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    const adminUser = { username: 'Admin User', roles: ['admin'] };
    login(adminUser);
    navigate('/admin');
  };

  const handleUserLogin = () => {
    const regularUser = { username: 'Regular User', roles: ['user'] };
    login(regularUser);
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Choose Your Role</h1>
        <div className="space-y-4">
          <button
            onClick={handleAdminLogin}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login as Admin
          </button>
          <button
            onClick={handleUserLogin}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login as User
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;