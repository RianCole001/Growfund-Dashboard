import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredWithdrawals = withdrawals.filter(wth => {
    const matchesSearch = wth.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         wth.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || wth.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const processingCount = withdrawals.filter(w => w.status === 'processing').length;
  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Withdrawal Management</h2>
        <p className="text-sm text-gray-400 mt-1">Review and process user withdrawals</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-900/30 to-gray-800 p-6 rounded-lg border border-red-500/30">
          <div className="text-sm text-gray-400 mb-2">Pending Withdrawals</div>
          <div className="text-3xl font-bold text-white">{pendingCount}</div>
          <div className="text-sm text-red-400 mt-1">${totalPending.toLocaleString()} total</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-gray-800 p-6 rounded-lg border border-yellow-500/30">
          <div className="text-sm text-gray-400 mb-2">Processing</div>
          <div className="text-3xl font-bold text-white">{processingCount}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Total Withdrawals</div>
          <div className="text-3xl font-bold text-white">{withdrawals.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search withdrawals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'pending', 'processing', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${
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
        <p className="text-gray-400">No withdrawals yet. Withdrawal requests will appear here.</p>
      </div>
    </div>
  );
}
