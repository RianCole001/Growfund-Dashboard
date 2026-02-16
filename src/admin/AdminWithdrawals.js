import React, { useState, useEffect } from 'react';
import { Search, Check, Clock, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setWithdrawals([
        {
          id: 1,
          user: 'john@example.com',
          user_id: 101,
          amount: 300,
          method: 'Bank Transfer',
          account_details: 'Account: ****1234',
          reference: 'WTH-2024-001',
          status: 'pending',
          created_at: '2024-02-16T09:00:00Z'
        },
        {
          id: 2,
          user: 'jane@example.com',
          user_id: 102,
          amount: 750,
          method: 'PayPal',
          account_details: 'jane@paypal.com',
          reference: 'WTH-2024-002',
          status: 'pending',
          created_at: '2024-02-16T10:30:00Z'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    setActionLoading({ ...actionLoading, [withdrawalId]: 'approving' });
    try {
      setWithdrawals(withdrawals.map(wth => 
        wth.id === withdrawalId ? { ...wth, status: 'approved' } : wth
      ));
      toast.success('Withdrawal approved successfully');
    } catch (error) {
      toast.error('Failed to approve withdrawal');
    } finally {
      setActionLoading({ ...actionLoading, [withdrawalId]: null });
    }
  };

  const handleReject = async (withdrawalId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setActionLoading({ ...actionLoading, [withdrawalId]: 'rejecting' });
    try {
      setWithdrawals(withdrawals.map(wth => 
        wth.id === withdrawalId ? { ...wth, status: 'rejected', rejection_reason: reason } : wth
      ));
      toast.success('Withdrawal rejected');
    } catch (error) {
      toast.error('Failed to reject withdrawal');
    } finally {
      setActionLoading({ ...actionLoading, [withdrawalId]: null });
    }
  };

  const handleProcess = async (withdrawalId) => {
    setActionLoading({ ...actionLoading, [withdrawalId]: 'processing' });
    try {
      setWithdrawals(withdrawals.map(wth => 
        wth.id === withdrawalId ? { ...wth, status: 'processing' } : wth
      ));
      toast.success('Withdrawal marked as processing');
    } catch (error) {
      toast.error('Failed to process withdrawal');
    } finally {
      setActionLoading({ ...actionLoading, [withdrawalId]: null });
    }
  };

  const filteredWithdrawals = withdrawals.filter(wth => {
    const matchesSearch = wth.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         wth.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || wth.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const processingCount = withdrawals.filter(w => w.status === 'processing').length;
  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
      approved: 'bg-green-900/30 text-green-400 border-green-500/30',
      rejected: 'bg-red-900/30 text-red-400 border-red-500/30'
    };
    return styles[status] || 'bg-gray-700 text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Withdrawal Management</h2>
        <p className="text-sm text-gray-400 mt-1">Review and process user withdrawals</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-900/30 to-gray-800 p-6 rounded-lg border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Pending Withdrawals</div>
              <div className="text-3xl font-bold text-white">{pendingCount}</div>
              <div className="text-sm text-red-400 mt-1">${totalPending.toLocaleString()} total</div>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-gray-800 p-6 rounded-lg border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Processing</div>
              <div className="text-3xl font-bold text-white">{processingCount}</div>
            </div>
            <Clock className="w-12 h-12 text-yellow-500/30" />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Withdrawals</div>
              <div className="text-3xl font-bold text-white">{withdrawals.length}</div>
            </div>
            <DollarSign className="w-12 h-12 text-blue-500/30" />
          </div>
        </div>
      </div>

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
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'pending', 'processing', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap ${
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

      {filteredWithdrawals.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'No withdrawals match your filters' 
              : 'No withdrawals yet. Withdrawal requests will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{withdrawal.user}</div>
                      <div className="text-xs text-gray-400">ID: {withdrawal.user_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-400">${withdrawal.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {withdrawal.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-300">{withdrawal.reference}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {withdrawal.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleProcess(withdrawal.id)}
                            disabled={actionLoading[withdrawal.id]}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2 py-1 rounded text-xs"
                          >
                            {actionLoading[withdrawal.id] === 'processing' ? 'Processing...' : 'Process'}
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.id)}
                            disabled={actionLoading[withdrawal.id]}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-2 py-1 rounded text-xs"
                          >
                            {actionLoading[withdrawal.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      )}
                      {withdrawal.status === 'processing' && (
                        <button
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={actionLoading[withdrawal.id]}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded-lg flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>{actionLoading[withdrawal.id] === 'approving' ? 'Approving...' : 'Complete'}</span>
                        </button>
                      )}
                      {withdrawal.status === 'approved' && (
                        <span className="text-green-400 text-xs">✓ Completed</span>
                      )}
                      {withdrawal.status === 'rejected' && (
                        <span className="text-red-400 text-xs">✗ Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
