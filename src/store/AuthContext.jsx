// src/store/AuthContext.jsx
// Global auth state provider. Wraps the entire app.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserRole } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,        setUser]    = useState(null);
  const [role,        setRole]    = useState('user');
  const [loading,     setLoading] = useState(true);
  const [authError,   setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const cachedRole = localStorage.getItem(`scot_role_${firebaseUser.uid}`);
          if (cachedRole) {
            setRole(cachedRole);
            setLoading(false);
          }

          const userRole = await getUserRole(firebaseUser.uid, firebaseUser.email);
          setRole(userRole);
          localStorage.setItem(`scot_role_${firebaseUser.uid}`, userRole);
          
          if (!cachedRole) {
            setLoading(false);
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setUser(firebaseUser);
          setRole('user');
          setLoading(false);
        }
      } else {
        setUser(null);
        setRole('user');
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    role,
    loading,
    authError,
    setAuthError,
    isAdmin: role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
