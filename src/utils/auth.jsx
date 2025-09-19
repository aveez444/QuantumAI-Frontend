// src/utils/auth.js
import api from './api';

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Try to blacklist the refresh token on the server
      await api.post('api/token/blacklist/', { refresh: refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Continue with client-side cleanup even if server call fails
  } finally {
    // Clear all client-side storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
    
    // Clear any cookies that might exist
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};