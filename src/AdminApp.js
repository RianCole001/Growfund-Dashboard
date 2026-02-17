import React, { useState, useEffect } from 'react';
import { Menu, TrendingUp, Users, DollarSign, Activity, Settings as SettingsIcon, Bell, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminAuthAPI } from './services/api';
import { useAdminAuth } from './auth/AdminAuthContext';

import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminInvestments from './admin/AdminInvestments';
import AdminTransactions from './admin/AdminTransactions';
import AdminDeposits from './admin/AdminDeposits';
import AdminWithdrawals from './admin/AdminWithdrawals';
import AdminSettings from './admin/AdminSettings';
import AdminNotifications from './admin/AdminNotifications';
import AdminSidebar from './admin/AdminSidebar';

export default function AdminApp() {
  const navigate = useNavigate();
  const storage = require('./utils/storage').default;
  const [page, setPage] = useState(storage.get('adminPage', 'Dashboard'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState(storage.get('adminAuth', { loggedIn: false }));
  const [showLoginGate, setShowLoginGate] = useState(!storage.get('adminAuth', { loggedIn: false }).loggedIn);
  const [loading, setLoading] = useState(false);
  const { loginAdmin, logoutAdmin } = useAdminAuth();

  const setPageAndPersist = (p) => { 
    setPage(p); 
    storage.set('adminPage', p); 
  };

  const handleAdminLogin = async (credentials) => {
    setLoading(true);
    try {
      // Try to login with backend
      const response = await adminAuthAPI.login(credentials.email, credentials.password);
      
      // Check if user is admin (staff or superuser)
      if (!response.data.user.is_staff && !response.data.user.is_superuser) {
        toast.error('Admin access required');
        return;
      }
      
      // Store tokens with admin prefix
      localStorage.setItem('admin_access_token', response.data.tokens.access);
      localStorage.setItem('admin_refresh_token', response.data.tokens.refresh);
      localStorage.setItem('admin_data', JSON.stringify(response.data.user));
      
      // Update auth context
      loginAdmin(response.data.tokens.access, response.data.user);
      
      const nextAuth = { 
        loggedIn: true, 
        user: response.data.user.email, 
        role: 'admin',
        userId: response.data.user.id
      };
      setAdminAuth(nextAuth);
      storage.set('adminAuth', nextAuth);
      setShowLoginGate(false);
      toast.success('Welcome back, Admin!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Invalid credentials';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_data');
    logoutAdmin();
    setAdminAuth({ loggedIn: false });
    storage.set('adminAuth', { loggedIn: false });
    setShowLoginGate(true);
    toast.success('Logged out successfully');
  };

  // Login Gate
  if (showLoginGate) {
    return (
      <>
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900 text-white min-h-screen font-sans flex items-center justify-center p-4"
        >
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-12 h-12 text-green-500 mr-3" />
              <h1 className="text-4xl font-bold text-green-500">GrowFund</h1>
            </div>
            <p className="text-gray-400">Admin Portal</p>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Admin Sign In</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              const password = e.target.password.value;
              handleAdminLogin({ email, password });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Email</label>
                  <input 
                    name="email"
                    type="email"
                    placeholder="admin@growfund.com"
                    disabled={loading}
                    className="w-full bg-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Password</label>
                  <input 
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full bg-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      {/* Admin Navigation Bar */}
      <header className="bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <span className="text-2xl font-bold text-green-500 flex items-center whitespace-nowrap">
                <TrendingUp className="w-6 h-6 mr-2" />
                GrowFund Admin
              </span>
              <nav className="hidden lg:flex space-x-1 flex-1 overflow-x-auto">
                {['Dashboard', 'Users', 'Investments', 'Deposits', 'Withdrawals', 'Transactions', 'Notifications', 'Settings'].map((item) => (
                  <button 
                    key={item} 
                    onClick={() => setPageAndPersist(item)} 
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 whitespace-nowrap ${
                      page === item
                        ? 'bg-green-500 text-white font-semibold shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <button className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                onClick={handleAdminLogout}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-300" />
              </button>

              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden bg-green-500 rounded-lg p-2 hover:bg-green-600 transition-colors shadow-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 lg:p-6">
        {page === 'Dashboard' && <AdminDashboard />}
        {page === 'Users' && <AdminUsers />}
        {page === 'Investments' && <AdminInvestments />}
        {page === 'Deposits' && <AdminDeposits />}
        {page === 'Withdrawals' && <AdminWithdrawals />}
        {page === 'Transactions' && <AdminTransactions />}
        {page === 'Notifications' && <AdminNotifications />}
        {page === 'Settings' && <AdminSettings />}

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              onClick={() => setSidebarOpen(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-gray-800 shadow-2xl">
              <div className="p-4 h-full">
                <AdminSidebar page={page} setPage={setPageAndPersist} onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
