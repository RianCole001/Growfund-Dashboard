import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { adminAuthAPI } from '../services/api';
import { useAdminAuth } from '../auth/AdminAuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAdminAuth();

  const handleAdminLogin = async (credentials) => {
    setLoading(true);
    try {
      // Try to login with backend
      const response = await adminAuthAPI.login(credentials.email, credentials.password);
      
      // Check if user is admin (staff or superuser)
      if (!response.data.user.is_staff && !response.data.user.is_superuser) {
        toast.error('Admin access required. Only staff members can access the admin panel.');
        return;
      }
      
      // Store tokens with admin prefix
      localStorage.setItem('admin_access_token', response.data.tokens.access);
      localStorage.setItem('admin_refresh_token', response.data.tokens.refresh);
      localStorage.setItem('admin_data', JSON.stringify(response.data.user));
      
      // Update auth context
      loginAdmin(response.data.tokens.access, response.data.user);
      
      toast.success('Welcome back, Admin!');
      
      // Redirect to admin panel
      navigate('/admin', { replace: true });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Invalid credentials';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-gray-400">Admin Portal Access</p>
            <p className="text-xs text-gray-500 mt-2">Authorized personnel only</p>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Admin Sign In</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              const password = e.target.password.value;
              
              if (!email || !password) {
                toast.error('Please fill in all fields');
                return;
              }
              
              handleAdminLogin({ email, password });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Admin Email</label>
                  <input 
                    name="email"
                    type="email"
                    placeholder="admin@growfund.com"
                    disabled={loading}
                    required
                    className="w-full bg-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 border border-gray-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Password</label>
                  <input 
                    name="password"
                    type="password"
                    placeholder="Enter your admin password"
                    disabled={loading}
                    required
                    className="w-full bg-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 border border-gray-500 focus:border-green-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Access Admin Panel'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={() => navigate('/')}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back to Main Site
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 This is a secure admin area. All access attempts are logged.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}