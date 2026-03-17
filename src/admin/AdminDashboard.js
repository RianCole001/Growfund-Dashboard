import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { adminAuthAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: 0, icon: Users, color: 'green' },
    { label: 'Active Users', value: 0, icon: Activity, color: 'blue' },
    { label: 'Total Balance', value: '$0', icon: DollarSign, color: 'emerald' },
    { label: 'Verified Users', value: 0, icon: TrendingUp, color: 'green' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAuthAPI.getAdminUsers();
      const users = response.data.results || response.data.data || [];
      if (!Array.isArray(users)) return;

      const totalUsers = users.length;
      const verifiedUsers = users.filter(u => u.is_verified).length;
      const activeUsers = users.filter(u => u.last_login_at).length;
      const totalBalance = users.reduce((sum, u) => sum + parseFloat(u.balance || 0), 0);

      setStats([
        { label: 'Total Users', value: totalUsers, icon: Users, color: 'green' },
        { label: 'Active Users', value: activeUsers, icon: Activity, color: 'blue' },
        { label: 'Total Balance', value: `$${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'emerald' },
        { label: 'Verified Users', value: verifiedUsers, icon: TrendingUp, color: 'green' },
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const colorMap = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Platform statistics and metrics</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Platform Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Last Updated</p>
            <p className="text-gray-900 font-semibold text-sm">{new Date().toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Status</p>
            <p className="text-green-600 font-semibold text-sm">✓ All Systems Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
