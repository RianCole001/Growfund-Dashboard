import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminAuth, setAdminAuth] = useState({
    loggedIn: false,
    user: null,
    token: null,
  });

  // Load admin auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    const userData = localStorage.getItem('admin_data');
    
    if (token && userData) {
      try {
        setAdminAuth({
          loggedIn: true,
          user: JSON.parse(userData),
          token: token,
        });
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_data');
      }
    }
  }, []);

  const loginAdmin = (token, userData) => {
    localStorage.setItem('admin_access_token', token);
    localStorage.setItem('admin_data', JSON.stringify(userData));
    setAdminAuth({
      loggedIn: true,
      user: userData,
      token: token,
    });
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_data');
    localStorage.removeItem('admin_refresh_token');
    setAdminAuth({
      loggedIn: false,
      user: null,
      token: null,
    });
  };

  return (
    <AdminAuthContext.Provider value={{ adminAuth, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export default AdminAuthContext;
