import React, { createContext, useContext, useState } from 'react';
import { adminApi } from '../api/admin';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('sih_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('sih_admin_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const loginAdmin = (token, user) => {
    sessionStorage.setItem('sih_admin_token', token);
    sessionStorage.setItem('sih_admin_user', JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
  };

  const logoutAdmin = async () => {
    if (adminToken) {
      try {
        await adminApi.logout(adminToken);
      } catch (err) {
        console.warn('Admin logout notice:', err.message);
      }
    }
    sessionStorage.removeItem('sih_admin_token');
    sessionStorage.removeItem('sih_admin_user');
    setAdminToken('');
    setAdminUser(null);
  };

  return (
    <AdminContext.Provider value={{
      adminToken,
      adminUser,
      isAuthenticated: !!adminToken,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
