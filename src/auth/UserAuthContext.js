import React, { createContext, useContext, useState, useEffect } from 'react';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [userAuth, setUserAuth] = useState({
    loggedIn: false,
    user: null,
    token: null,
  });

  // Load user auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('user_access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUserAuth({
          loggedIn: true,
          user: JSON.parse(userData),
          token: token,
        });
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('user_access_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('user_access_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUserAuth({
      loggedIn: true,
      user: userData,
      token: token,
    });
  };

  const logoutUser = () => {
    localStorage.removeItem('user_access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_refresh_token');
    setUserAuth({
      loggedIn: false,
      user: null,
      token: null,
    });
  };

  return (
    <UserAuthContext.Provider value={{ userAuth, loginUser, logoutUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}

export default UserAuthContext;
