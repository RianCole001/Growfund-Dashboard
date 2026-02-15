import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Mail, Edit, Trash2, Eye, Lock, AlertCircle } from 'lucide-react';
import { adminAuthAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from API...');
      const response = await adminAuthAPI.getAdminUsers();
      
      // Log the full response for debugging
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      // Handle paginated response format: { count, next, previous, results }
      // OR custom format: { data, count }
      let userData = response.data.results || response.data.data || response.data;
      
      // Ensure userData is an array
      if (!Array.isArray(userData)) {
        console.warn('userData is not an array:', userData);
        console.warn('Response structure:', response.data);
        userData = [];
      }
      
      console.log('Users from API:', userData.length);
      console.log('Users data:', userData);
      
      // Transform backend data to match UI format
      const formattedUsers = userData.map((user, idx) => ({
        id: user.id || idx + 1,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        verified: user.is_verified,
        balance: user.balance || 0,
        invested: user.invested || 0,
        joined: user.date_joined ? new Date(user.date_joined).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: user.is_verified ? 'active' : 'pending',
        is_staff: user.is_staff
      }));
      
      console.log('Final formatted users count:', formattedUsers.length);
      console.log('Formatted users:', formattedUsers);
      setUsers(formattedUsers);
      
      if (formattedUsers.length === 0) {
        toast.info('No users found');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load users';
      toast.error(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalAction('view');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalAction('edit');
    setShowModal(true);
  };

  const handleVerifyUser = async (user) => {
    setActionLoading(true);
    try {
      const action = user.verified ? 'unverify' : 'verify';
      await adminAuthAPI.verifyUser(user.id, action);
      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user verification status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (user) => {
    if (!window.confirm(`Are you sure you want to suspend ${user.email}?`)) return;
    
    setActionLoading(true);
    try {
      await adminAuthAPI.suspendUser(user.id, 'suspend');
      toast.success('User suspended successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) return;
    
    setActionLoading(true);
    try {
      await adminAuthAPI.deleteUser(user.id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setActionLoading(true);
    try {
      await adminAuthAPI.resetUserPassword(selectedUser.id, newPassword);
      toast.success('Password reset successfully');
      setShowModal(false);
      setNewPassword('');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage all platform users ({users.length})</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            + Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'active', 'pending', 'suspended'].map(status => (
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

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Invested</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user.verified ? (
                          <UserCheck className="w-4 h-4 text-green-400" />
                        ) : (
                          <UserX className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.status === 'active' ? 'bg-green-900/30 text-green-400' :
                          user.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">${(user.balance || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">${(user.invested || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{user.joined || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" 
                          title="View"
                          disabled={actionLoading}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleVerifyUser(user)}
                          className={`p-2 rounded-lg transition-colors ${user.verified ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                          title={user.verified ? 'Unverify' : 'Verify'}
                          disabled={actionLoading}
                        >
                          {user.verified ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleSuspendUser(user)}
                          className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors" 
                          title="Suspend"
                          disabled={actionLoading}
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(user); setModalAction('reset-password'); setShowModal(true); }}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors" 
                          title="Reset Password"
                          disabled={actionLoading}
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors" 
                          title="Delete"
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Active Users</div>
          <div className="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Pending Verification</div>
          <div className="text-2xl font-bold text-yellow-400">{users.filter(u => !u.verified).length}</div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            {modalAction === 'view' && (
              <>
                <h3 className="text-xl font-bold text-white mb-4">User Details</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-semibold">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className={`font-semibold ${selectedUser.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedUser.verified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Balance</p>
                    <p className="text-white font-semibold">${(selectedUser.balance || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Joined</p>
                    <p className="text-white font-semibold">{selectedUser.joined}</p>
                  </div>
                </div>
              </>
            )}

            {modalAction === 'reset-password' && (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
                <p className="text-gray-400 mb-4">Set a new password for {selectedUser.email}</p>
                <input
                  type="password"
                  placeholder="New password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewPassword('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
              {modalAction === 'reset-password' && (
                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Resetting...' : 'Reset'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
