import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Users, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    targetUsers: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('admin_access_token') || localStorage.getItem('user_access_token');
      
      if (!token) {
        toast.error('Please login as admin to access notifications');
        setLoading(false);
        return;
      }
      
      const response = await fetch('https://growfun-backend.onrender.com/api/notifications/admin/notifications/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
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
      
      const token = localStorage.getItem('admin_access_token') || localStorage.getItem('user_access_token');
      
      if (!token) {
        toast.error('Please login as admin to send notifications');
        setLoading(false);
        return;
      }
      
      const requestBody = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        priority: newNotification.priority,
        target: newNotification.target,
        target_users: newNotification.target === 'specific_users' ? newNotification.targetUsers : ''
      };

      const response = await fetch('https://growfun-backend.onrender.com/api/notifications/admin/send/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications([result.data, ...notifications]);
        setShowCreateModal(false);
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          target: 'all',
          targetUsers: '',
          priority: 'normal'
        });
        toast.success(`Notification sent to ${result.data.sent_count} users!`);
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
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
      const token = localStorage.getItem('admin_access_token') || localStorage.getItem('user_access_token');
      
      if (!token) {
        toast.error('Please login as admin to delete notifications');
        return;
      }
      
      const response = await fetch(`https://growfun-backend.onrender.com/api/notifications/admin/notifications/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification deleted');
      } else {
        throw new Error(result.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-900 text-green-300';
      case 'warning':
        return 'bg-yellow-900 text-yellow-300';
      case 'error':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-blue-900 text-blue-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Send and manage user notifications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
        >
          <Send className="w-5 h-5 mr-2" />
          Send Notification
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Sent Notifications</h2>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-700 p-4 rounded-lg flex items-start justify-between"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      {notification.priority === 'high' && (
                        <span className="px-2 py-1 rounded text-xs bg-red-900 text-red-300">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Sent to {notification.sent_count || 0} users</span>
                      </div>
                      <div className="flex items-center">
                        <span className="capitalize">{notification.target.replace('_', ' ')}</span>
                      </div>
                      <div>
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="text-red-400 hover:text-red-300 p-2 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Send New Notification</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Enter notification message"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
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

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Send To
                </label>
                <select
                  value={newNotification.target}
                  onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Users Only</option>
                  <option value="specific_users">Specific Users</option>
                </select>
              </div>

              {/* Target Users (if specific_users selected) */}
              {newNotification.target === 'specific_users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User Emails (comma-separated)
                  </label>
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

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewNotification({
                    title: '',
                    message: '',
                    type: 'info',
                    target: 'all',
                    targetUsers: '',
                    priority: 'normal'
                  });
                }}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotification}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
