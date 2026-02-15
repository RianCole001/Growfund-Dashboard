import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { adminAuthAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: 0, icon: Users, color: 'blue', change: '-' },
    { label: 'Active Users', value: 0, icon: Activity, color: 'green', change: '-' },
    { label: 'Total Invested', value: '$0', icon: TrendingUp, color: 'purple', change: '-' },
    { label: 'Verified Users', value: 0, icon: Users, color: 'orange', change: '-' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAuthAPI.getAdminUsers();
      
      // Extract users from paginated response
      const users = response.data.results || response.data.data || [];
      
      if (!Array.isArray(users)) {
        console.warn('Users data is not an array:', users);
        return;
      }

      // Calculate stats
      const totalUsers = users.length;
      const verifiedUsers = users.filter(u => u.is_verified).length;
      const activeUsers = users.filter(u => u.last_login_at).length;
      const totalBalance = users.reduce((sum, u) => sum + parseFloat(u.balance || 0), 0);

      setStats([
        { label: 'Total Users', value: totalUsers, icon: Users, color: 'blue', change: '-' },
        { label: 'Active Users', value: activeUsers, icon: Activity, color: 'green', change: '-' },
        { label: 'Total Balance', value: `$${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'purple', change: '-' },
        { label: 'Verified Users', value: verifiedUsers, icon: Users, color: 'orange', change: '-' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-400 mt-1">Platform statistics and metrics</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
              <span className="text-gray-400 text-sm font-semibold">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800 p-12 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      )}

      {/* Data Loaded State */}
      {!loading && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Platform Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Last Updated</p>
              <p className="text-white font-semibold">{new Date().toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-green-400 font-semibold">✓ All Systems Operational</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
