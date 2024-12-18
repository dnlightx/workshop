import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const testUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      coins: 100,
      is_premium: false,
      created_at: new Date().toISOString()
    };
    setUser(testUser);
    
    axios.defaults.headers.common['Authorization'] = 'Bearer test-token';
  }, []);

  const login = async (credentials) => {
    try {
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
