import React, { useState, useEffect } from 'react';
import { Send, Bell, Users, AlertCircle, CheckCircle, X, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info', // info, success, warning, error
    target: 'all', // all, specific_users, verified_users
    targetUsers: '',
    priority: 'normal' // low, normal, high
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await adminAuthAPI.getNotifications();
      // setNotifications(response.data);
      
      // Mock data for now
      setNotifications([
        {
          id: 1,
          title: 'Welcome to GrowFund',
          message: 'Thank you for joining our investment platform. Start your journey today!',
          type: 'success',
          target: 'all',
          priority: 'normal',
          sent_count: 156,
          created_at: '2024-02-16T10:00:00Z',
          status: 'sent'
        },
        {
          id: 2,
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur on Sunday from 2-4 AM UTC.',
          type: 'warning',
          target: 'all',
          priority: 'high',
          sent_count: 156,
          created_at: '2024-02-15T14:30:00Z',
          status: 'sent'
        }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await adminAuthAPI.createNotification(newNotification);
      
      // Mock success
      const mockNotification = {
        id: Date.now(),
        ...newNotification,
        sent_count: newNotification.target === 'all' ? 156 : 0,
        created_at: new Date().toISOString(),
        status: 'sent'
      };
      
      setNotifications([mockNotification, ...notifications]);
      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        targetUsers: '',
        priority: 'normal'
      });
      
      toast.success('Notification sent successfully!');
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      // TODO: Replace with actual API call
      // await adminAuthAPI.deleteNotification(id);
      
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-900/30 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-900/30 text-red-400 border-red-500/30';
      default: return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'low': return 'bg-gray-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-sm text-gray-400 mt-1">Send notifications to users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Create Notification</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Sent</div>
              <div className="text-2xl font-bold text-white">{notifications.reduce((sum, n) => sum + (n.sent_count || 0), 0)}</div>
            </div>
            <Send className="w-8 h-8 text-blue-500/30" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Active Notifications</div>
              <div className="text-2xl font-bold text-white">{notifications.length}</div>
            </div>
            <Bell className="w-8 h-8 text-green-500/30" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">High Priority</div>
              <div className="text-2xl font-bold text-white">{notifications.filter(n => n.priority === 'high').length}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500/30" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first notification to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 sm:p-6 hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded text-white ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3 line-clamp-2">{notification.message}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {notification.sent_count} recipients
                            </span>
                            <span>Target: {notification.target.replace('_', ' ')}</span>
                            <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Notification</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification message..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target</label>
                    <select
                      value={newNotification.target}
                      onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Users</option>
                      <option value="verified_users">Verified Users</option>
                      <option value="specific_users">Specific Users</option>
                    </select>
                  </div>
                </div>

                {newNotification.target === 'specific_users' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">User Emails (comma separated)</label>
                    <input
                      type="text"
                      value={newNotification.targetUsers}
                      onChange={(e) => setNewNotification({ ...newNotification, targetUsers: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user1@example.com, user2@example.com"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNotification}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Notification'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}