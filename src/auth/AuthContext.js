import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(storage.get('auth', { loggedIn: false, lastLogin: null, user: null }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    storage.set('auth', auth);
  }, [auth]);

  // Simple demo-only user store: saves users locally.
  const loadUsers = () => storage.get('users', []);
  const saveUsers = (u) => storage.set('users', u);

  // Seed a demo user on first run so you can sign in immediately
  React.useEffect(() => {
    try {
      const users = loadUsers();
      if (!users || users.length === 0) {
        const demo = { name: 'Demo User', email: 'demo@growfund.test', password: 'Demo1234!', verified: true };
        saveUsers([demo]);
      }
    } catch (e) {}
  }, []);
  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const users = loadUsers();
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }
      const token = `verify-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const next = [{ name, email, password, verified: false, verificationToken: token }, ...users];
      saveUsers(next);
      // For demo we return the token so tests can verify immediately
      return { ok: true, verificationToken: token };
    } finally { setLoading(false); }
  };

  const verifyEmail = async (token) => {
    setLoading(true);
    try {
      const users = loadUsers();
      const idx = users.findIndex(u => u.verificationToken === token);
      if (idx === -1) throw new Error('Invalid token');
      users[idx].verified = true;
      delete users[idx].verificationToken;
      saveUsers(users);
      return { ok: true, email: users[idx].email };
    } finally { setLoading(false); }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const users = loadUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) throw new Error('Invalid credentials');
      const now = new Date().toISOString();
      const nextAuth = { loggedIn: true, lastLogin: now, user: { email: found.email, name: found.name, verified: !!found.verified } };
      setAuth(nextAuth);
      return { ok: true, user: nextAuth.user };
    } finally { setLoading(false); }
  };

  const logout = () => {
    setAuth({ loggedIn: false, lastLogin: null, user: null });
  };

  const forgotPassword = async (email) => {
    // demo: create token and store on user
    setLoading(true);
    try {
      const users = loadUsers();
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) throw new Error('No user with that email');
      const token = `reset-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      users[idx].resetToken = token;
      saveUsers(users);
      return { ok: true, token };
    } finally { setLoading(false); }
  };

  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      const users = loadUsers();
      const idx = users.findIndex(u => u.resetToken === token);
      if (idx === -1) throw new Error('Invalid token');
      users[idx].password = newPassword;
      delete users[idx].resetToken;
      saveUsers(users);
      return { ok: true };
    } finally { setLoading(false); }
  };

  return (
    <AuthContext.Provider value={{ auth, loading, register, login, logout, verifyEmail, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
