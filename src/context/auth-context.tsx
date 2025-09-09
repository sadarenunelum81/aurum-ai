"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChange, login as firebaseLogin, signup as firebaseSignup, logout as firebaseLogout, getUserProfile } from '@/lib/auth';
import type { User } from 'firebase/auth';
import type { SignupForm, LoginForm } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  login: (data: LoginForm) => Promise<User>;
  signup: (data: SignupForm) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (data: LoginForm) => {
    const userCredential = await firebaseLogin(data);
    return userCredential;
  };

  const signup = async (data: SignupForm) => {
    const userCredential = await firebaseSignup(data);
    return userCredential;
  };

  const logout = async () => {
    await firebaseLogout();
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
