import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, RefreshCw } from 'lucide-react';
import { adminAuthAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminAuthAPI.getTransactions();
      setTransactions(response.data.data || response.data.results || []);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  const filtered = transactions.filter(txn => {
    const s = txn.user?.toLowerCase().includes(searchTerm.toLowerCase()) || txn.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const t = filterType === 'all' || txn.type === filterType;
    const f = filterStatus === 'all' || txn.status === filterStatus;
    return s && t && f;
  });

  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0);
  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor all platform transactions</p>
        </div>
        <button onClick={fetchTransactions} disabled={loading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Volume', value: `$${totalVolume.toLocaleString()}`, color: 'text-gray-900' },
          { label: 'Completed', value: completedCount, color: 'text-green-600' },
          { label: 'Pending', value: pendingCount, color: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="all">All Types</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdraw">Withdraw</option>
                <option value="Invest">Invest</option>
                <option value="Sell">Sell</option>
              </select>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? 'No transactions yet.' : null}
      </div>
    </div>
  );
}
