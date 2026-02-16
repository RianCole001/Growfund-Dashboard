import React, { useState, useEffect } from 'react';
import { Search, Check, X, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAuthAPI } from '../services/api';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  // Fetch deposits from backend
  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint when backend is ready
      // const response = await adminAuthAPI.getDeposits();
      // setDeposits(response.data);
      
      // Mock data for now
      setDeposits([
        {
          id: 1,
          user: 'john@example.com',
          user_id: 101,
          amount: 500,
          method: 'Bank Transfer',
          reference: 'DEP-2024-001',
          status: 'pending',
          created_at: '2024-02-16T10:30:00Z',
          proof_url: null
        },
        {
          id: 2,
          user: 'jane@example.com',
          user_id: 102,
          amount: 1000,
          method: 'Credit Card',
          reference: 'DEP-2024-002',
          status: 'pending',
          created_at: '2024-02-16T11:15:00Z',
          proof_url: null
        }
      ]);
    } catch (error) {
      toast.error('Failed to load deposits');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId) => {
    setActionLoading({ ...actionLoading, [depositId]: 'approving' });
    try {
      // TODO: Replace with actual API endpoint
      // await adminAuthAPI.approveDeposit(depositId);
      
      // Update local state
      setDeposits(deposits.map(dep => 
        dep.id === depositId ? { ...dep, status: 'approved' } : dep
      ));
      
      toast.success('Deposit approved successfully');
    } catch (error) {
      toast.error('Failed to approve deposit');
      console.error(error);
    } finally {
      setActionLoading({ ...actionLoading, [depositId]: null });
    }
  };

  const handleReject = async (depositId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setActionLoading({ ...actionLoading, [depositId]: 'rejecting' });
    try {
      // TODO: Replace with actual API endpoint
      // await adminAuthAPI.rejectDeposit(depositId, reason);
      
      // Update local state
      setDeposits(deposits.map(dep => 
        dep.id === depositId ? { ...dep, status: 'rejected', rejection_reason: reason } : dep
      ));
      
      toast.success('Deposit rejected');
    } catch (error) {
      toast.error('Failed to reject deposit');
      console.error(error);
    } finally {
      setActionLoading({ ...actionLoading, [depositId]: null });
    }
  };

  const filteredDeposits = deposits.filter(dep => {
    const matchesSearch = dep.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         dep.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || dep.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const approvedCount = deposits.filter(d => d.status === 'approved').length;
  const totalPending = deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Deposit Management</h2>
        <p className="text-sm text-gray-400 mt-1">Review and approve user deposits</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-900/30 to-gray-800 p-6 rounded-lg border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Pending Deposits</div>
              <div className="text-3xl font-bold text-white">{pendingCount}</div>
              <div className="text-sm text-yellow-400 mt-1">${totalPending.toLocaleString()} total</div>
            </div>
            <Clock className="w-12 h-12 text-yellow-500/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-gray-800 p-6 rounded-lg border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Approved Today</div>
              <div className="text-3xl font-bold text-white">{approvedCount}</div>
            </div>
            <Check className="w-12 h-12 text-green-500/30" />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Deposits</div>
              <div className="text-3xl font-bold text-white">{deposits.length}</div>
            </div>
            <DollarSign className="w-12 h-12 text-blue-500/30" />
          </div>
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

      {/* Deposits Table */}
      {filteredDeposits.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'No deposits match your filters' 
              : 'No deposits yet. Deposit requests will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{deposit.user}</div>
                      <div className="text-xs text-gray-400">ID: {deposit.user_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-400">${deposit.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {deposit.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-300">{deposit.reference}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(deposit.status)}`}>
                        {deposit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {deposit.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(deposit.id)}
                            disabled={actionLoading[deposit.id]}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>{actionLoading[deposit.id] === 'approving' ? 'Approving...' : 'Approve'}</span>
                          </button>
                          <button
                            onClick={() => handleReject(deposit.id)}
                            disabled={actionLoading[deposit.id]}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>{actionLoading[deposit.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}</span>
                          </button>
                        </div>
                      )}
                      {deposit.status === 'approved' && (
                        <span className="text-green-400 text-xs">✓ Approved</span>
                      )}
                      {deposit.status === 'rejected' && (
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
