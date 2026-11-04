import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_TEACHER = {
  id: 'tch-8821',
  fullName: 'Prof. Sarah Jenkins',
  email: 'sarah.jenkins@university.edu',
  activeLab: 'Lab 3 (Systems Lab)',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('examlan_teacher_auth');
      return saved ? JSON.parse(saved) : DEMO_TEACHER;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('examlan_teacher_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('examlan_teacher_auth');
    }
  }, [user]);

  // Check active session on server mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Server offline or proxy unavailable
      }
    };
    verifySession();
  }, []);

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const register = async ({ fullName, email, password }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
  };

  const quickDemoLogin = () => {
    setUser(DEMO_TEACHER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        demoTeacher: DEMO_TEACHER,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
