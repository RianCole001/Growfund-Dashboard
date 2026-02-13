import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function AdminDeposits() {
  const [deposits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDeposits = deposits.filter(dep => {
    const matchesSearch = dep.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         dep.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || dep.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const approvedCount = deposits.filter(d => d.status === 'approved').length;
  const totalPending = deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Deposit Management</h2>
        <p className="text-sm text-gray-400 mt-1">Review and approve user deposits</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-900/30 to-gray-800 p-6 rounded-lg border border-yellow-500/30">
          <div className="text-sm text-gray-400 mb-2">Pending Deposits</div>
          <div className="text-3xl font-bold text-white">{pendingCount}</div>
          <div className="text-sm text-yellow-400 mt-1">${totalPending.toLocaleString()} total</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-gray-800 p-6 rounded-lg border border-green-500/30">
          <div className="text-sm text-gray-400 mb-2">Approved Today</div>
          <div className="text-3xl font-bold text-white">{approvedCount}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Total Deposits</div>
          <div className="text-3xl font-bold text-white">{deposits.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deposits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-400">No deposits yet. Deposit requests will appear here.</p>
      </div>
    </div>
  );
}
