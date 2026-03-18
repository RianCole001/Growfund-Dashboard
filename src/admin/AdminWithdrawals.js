import React, { useState, useEffect } from 'react';
import { Search, Check, Clock, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAuthAPI } from '../services/api';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { fetchWithdrawals(); }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await adminAuthAPI.getWithdrawals();
      setWithdrawals(response.data.data || response.data.results || []);
    } catch { toast.error('Failed to load withdrawals'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'approving' }));
    try {
      await adminAuthAPI.approveWithdrawal(id);
      setWithdrawals(w => w.map(x => x.id === id ? { ...x, status: 'approved' } : x));
      toast.success('Withdrawal approved');
    } catch { toast.error('Failed'); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setActionLoading(p => ({ ...p, [id]: 'rejecting' }));
    try {
      await adminAuthAPI.rejectWithdrawal(id, reason);
      setWithdrawals(w => w.map(x => x.id === id ? { ...x, status: 'rejected' } : x));
      toast.success('Withdrawal rejected');
    } catch { toast.error('Failed'); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleProcess = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'processing' }));
    try {
      setWithdrawals(w => w.map(x => x.id === id ? { ...x, status: 'processing' } : x));
      toast.success('Marked as processing');
    } catch { toast.error('Failed'); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const filtered = withdrawals.filter(w => {
    const s = w.user?.toLowerCase().includes(searchTerm.toLowerCase()) || w.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const f = filterStatus === 'all' || w.status === filterStatus;
    return s && f;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const processingCount = withdrawals.filter(w => w.status === 'processing').length;
  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0);

  const statusBadge = (status) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-600');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Withdrawal Management</h2>
          <p className="text-sm text-gray-500 mt-1">Review and process user withdrawals</p>
        </div>
        <button onClick={fetchWithdrawals} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Pending</div>
              <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
              <div className="text-xs text-red-500 mt-1">${totalPending.toLocaleString()} total</div>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Processing</div>
              <div className="text-2xl font-bold text-gray-900">{processingCount}</div>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">{withdrawals.length}</div>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search withdrawals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all','pending','processing','approved','rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
          {searchTerm || filterStatus !== 'all' ? 'No withdrawals match your filters' : 'No withdrawals yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User','Amount','Method','Reference','Date','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-gray-900">{w.user}</div>
                      <div className="text-xs text-gray-500">ID: {w.user_id}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-red-500">${w.amount?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{w.method}</td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">{w.reference}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(w.status)}`}>{w.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleProcess(w.id)} disabled={actionLoading[w.id]}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium">Process</button>
                          <button onClick={() => handleReject(w.id)} disabled={actionLoading[w.id]}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium">Reject</button>
                        </div>
                      )}
                      {w.status === 'processing' && (
                        <button onClick={() => handleApprove(w.id)} disabled={actionLoading[w.id]}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Check className="w-3 h-3" /> Complete
                        </button>
                      )}
                      {w.status === 'approved' && <span className="text-green-600 text-xs font-medium">✓ Completed</span>}
                      {w.status === 'rejected' && <span className="text-red-500 text-xs font-medium">✗ Rejected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((w) => (
              <div key={w.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{w.user}</div>
                    <div className="text-xs text-gray-500 font-mono">{w.reference}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(w.status)}`}>{w.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="bg-red-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="font-bold text-red-500">${w.amount?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500">Method</div>
                    <div className="font-medium text-gray-900">{w.method}</div>
                  </div>
                </div>
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleProcess(w.id)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-medium">Process</button>
                    <button onClick={() => handleReject(w.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-medium">Reject</button>
                  </div>
                )}
                {w.status === 'processing' && (
                  <button onClick={() => handleApprove(w.id)} className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-medium">Complete</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
