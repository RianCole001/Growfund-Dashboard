import React, { useState } from 'react';
import { Menu, TrendingUp, Bell, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './auth/AdminAuthContext';

import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminPriceControl from './admin/AdminPriceControl';
import AdminInvestments from './admin/AdminInvestments';
import AdminTransactions from './admin/AdminTransactions';
import AdminDeposits from './admin/AdminDeposits';
import AdminWithdrawals from './admin/AdminWithdrawals';
import AdminSettings from './admin/AdminSettings';
import AdminNotifications from './admin/AdminNotifications';
import AdminSidebar from './admin/AdminSidebar';

const NAV_ITEMS = ['Dashboard','Users','Price Control','Investments','Deposits','Withdrawals','Transactions','Notifications','Settings'];

export default function AdminApp() {
  const navigate = useNavigate();
  const storage = require('./utils/storage').default;
  const [page, setPage] = useState(storage.get('adminPage', 'Dashboard'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logoutAdmin } = useAdminAuth();

  const setPageAndPersist = (p) => { setPage(p); storage.set('adminPage', p); };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_data');
    logoutAdmin();
    storage.set('adminAuth', { loggedIn: false });
    toast.success('Logged out successfully');
    navigate('/admin/login', { replace: true });
  };

  const pages = {
    Dashboard: <AdminDashboard />,
    Users: <AdminUsers />,
    'Price Control': <AdminPriceControl />,
    Investments: <AdminInvestments />,
    Deposits: <AdminDeposits />,
    Withdrawals: <AdminWithdrawals />,
    Transactions: <AdminTransactions />,
    Notifications: <AdminNotifications />,
    Settings: <AdminSettings />,
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

        {/* Top Nav */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-green-600 p-1.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">GrowFund <span className="text-green-600">Admin</span></span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => setPageAndPersist(item)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    page === item
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleAdminLogout}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 sm:p-6">
          {pages[page]}
        </main>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
              <div className="p-4 h-full">
                <AdminSidebar page={page} setPage={setPageAndPersist} onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
