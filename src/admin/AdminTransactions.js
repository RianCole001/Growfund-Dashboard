import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';

export default function AdminTransactions() {
  const [transactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         txn.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalVolume = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          <p className="text-sm text-gray-400 mt-1">Monitor all platform transactions</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-sm text-gray-400 mb-2">Total Volume</div>
          <div className="text-3xl font-bold text-white">${totalVolume.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-sm text-gray-400 mb-2">Completed</div>
          <div className="text-3xl font-bold text-green-400">{completedCount}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-sm text-gray-400 mb-2">Pending</div>
          <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdraw">Withdraw</option>
              <option value="Invest">Invest</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-400">No transactions yet. Transactions will appear here.</p>
      </div>
    </div>
  );
}
