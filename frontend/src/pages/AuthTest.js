import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const checkStoredData = () => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('Stored user:', storedUser);
    console.log('Access token:', accessToken);
    console.log('Refresh token:', refreshToken);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Auth State:</h3>
        <p><strong>Is Loading:</strong> {isLoading ? 'true' : 'false'}</p>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={checkStoredData} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Check LocalStorage (see console)
        </button>
        <button onClick={clearStorage} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Clear LocalStorage & Reload
        </button>
        <button onClick={logout} style={{ padding: '5px 10px' }}>
          Logout
        </button>
      </div>

      <div>
        <a href="/dashboard">Go to Dashboard</a> | 
        <a href="/login">Go to Login</a> | 
        <a href="/">Go to Home</a>
      </div>
    </div>
  );
};

export default AuthTest;