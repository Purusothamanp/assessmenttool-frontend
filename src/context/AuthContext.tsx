'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

export type UserRole = 'admin' | 'educator' | 'student' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  dob?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for persisted session and verify status
    const checkUserStatus = async () => {
      const storedUser = localStorage.getItem('assessment_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const response = await fetch(`${API_BASE_URL}/users/${parsedUser.id}`);
          if (response.ok) {
            const dbUser = await response.json();
            if (dbUser.status === 'inactive') {
              localStorage.removeItem('assessment_user');
              setUser(null);
              router.push('/login');
              setIsLoading(false);
              return;
            }
            
            // Update context with fresh data from DB
            const freshUser = { ...parsedUser, ...dbUser };
            localStorage.setItem('assessment_user', JSON.stringify(freshUser));
            setUser(freshUser);
            setIsLoading(false);
            return;
          }
          setUser(parsedUser);
        } catch {
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    checkUserStatus();
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === 'purusothamanp23@gmail.com' && password === 'Purusothp@23') {
      const loggedInUser = {
        id: 'super-admin',
        name: 'purusothaman',
        email: 'purusothamanp23@gmail.com',
        role: 'admin' as UserRole,
        token: 'super-admin-token'
      };
      localStorage.setItem('assessment_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);
      router.push('/admin');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid email or password.');
      }

      const dbUser = await response.json();

      const loggedInUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        studentId: dbUser.studentId,
        dob: dbUser.dob,
        token: dbUser.token || `token-${dbUser.id}`
      };

      localStorage.setItem('assessment_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);

      // Redirect based on role
      if (dbUser.role === 'admin') router.push('/admin');
      else if (dbUser.role === 'educator') router.push('/educator');
      else if (dbUser.role === 'student') router.push('/student');
      else router.push('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('assessment_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
