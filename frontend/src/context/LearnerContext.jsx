import React, { createContext, useContext, useState, useEffect } from 'react';
import { learnerApi } from '../api/learner';

const LearnerContext = createContext(null);

export function LearnerProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sih_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (currentUser?.phone) {
      refreshProfile();
    } else {
      setProfileData(null);
    }
  }, [currentUser?.phone]);

  const refreshProfile = async () => {
    if (!currentUser?.phone) return;
    setLoadingProfile(true);
    try {
      const data = await learnerApi.getProfile(currentUser.phone);
      setProfileData(data);
    } catch (err) {
      console.warn('[LearnerContext] Failed to load profile:', err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const login = (user) => {
    localStorage.setItem('sih_current_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('sih_current_user');
    setCurrentUser(null);
    setProfileData(null);
  };

  return (
    <LearnerContext.Provider value={{
      currentUser,
      profileData,
      loadingProfile,
      isAuthenticated: !!currentUser,
      login,
      logout,
      refreshProfile
    }}>
      {children}
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
}
