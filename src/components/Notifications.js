import React, { useState, useEffect } from 'react';
import { Bell, X, TrendingUp, TrendingDown, DollarSign, Gift, AlertCircle, Info } from 'lucide-react';

export default function Notifications({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Admin notifications - these would come from backend admin panel
  useEffect(() => {
    // Simulate loading admin notifications
    const loadAdminNotifications = async () => {
      try {
        setLoading(true);
        
        // In real app, this would be an API call to get admin notifications
        // For now, we'll show a message that notifications come from admin
        const adminNotifications = [
          {
            id: 1,
            type: 'admin',
            title: 'Welcome to GrowFund',
            message: 'Welcome to our investment platform! Start exploring our features.',
            icon: 'Info',
            color: 'blue',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            from_admin: true
          },
          {
            id: 2,
            type: 'admin',
            title: 'Platform Update',
            message: 'We have updated our security features for better protection.',
            icon: 'AlertCircle',
            color: 'green',
            time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            read: false,
            from_admin: true
          }
        ];
        
        setNotifications(adminNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdminNotifications();
  }, []);

  const markAsRead = (id) => {
    try {
      const updated = notifications.map(n => 
        n && n.id === id ? { ...n, read: true } : n
      ).filter(Boolean); // Remove any null/undefined items
      setNotifications(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      const updated = notifications.map(n => n ? { ...n, read: true } : null).filter(Boolean);
      setNotifications(updated);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = (id) => {
    try {
      const updated = notifications.filter(n => n && n.id !== id);
      setNotifications(updated);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        setNotifications([]);
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  const getTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return 'Unknown';
      
      const now = new Date();
      const time = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(time.getTime())) return 'Unknown';
      
      const diff = Math.floor((now - time) / 1000);

      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return time.toLocaleDateString();
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return 'Unknown';
    }
  };

  // Safe filter function
  const filteredNotifications = React.useMemo(() => {
    try {
      if (!Array.isArray(notifications)) return [];
      
      const validNotifications = notifications.filter(n => n && n.id);
      
      if (filter === 'all') return validNotifications;
      if (filter === 'unread') return validNotifications.filter(n => !n.read);
      return validNotifications.filter(n => n.type === filter);
    } catch (error) {
      console.error('Error filtering notifications:', error);
      return [];
    }
  }, [notifications, filter]);

  const unreadCount = React.useMemo(() => {
    try {
      if (!Array.isArray(notifications)) return 0;
      return notifications.filter(n => n && !n.read).length;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
  }, [notifications]);

  // Icon mapping to prevent component crashes
  const getIconComponent = (iconName) => {
    const iconMap = {
      'TrendingUp': TrendingUp,
      'TrendingDown': TrendingDown,
      'DollarSign': DollarSign,
      'Gift': Gift,
      'AlertCircle': AlertCircle,
      'Info': Info,
      'Bell': Bell
    };
    
    return iconMap[iconName] || Info; // Default to Info icon if not found
  };

  const colorClasses = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <div className="relative bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Admin Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 p-4 border-b border-gray-700 overflow-x-auto">
          {['all', 'unread', 'admin'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <button
              onClick={markAllAsRead}
              className="text-sm text-green-400 hover:text-green-300 font-semibold"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-sm text-red-400 hover:text-red-300 font-semibold"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-400 text-center">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">No notifications from admin</p>
              <p className="text-sm text-gray-500 text-center mt-1">
                {filter === 'unread' ? 'All caught up!' : 'Admin notifications will appear here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredNotifications.map((notification) => {
                if (!notification || !notification.id) return null;
                
                const IconComponent = getIconComponent(notification.icon);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-700/50 transition-colors ${
                      !notification.read ? 'bg-gray-700/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full ${colorClasses[notification.color] || 'bg-gray-600'} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-white text-sm">
                              {notification.title || 'Notification'}
                            </h4>
                            {notification.from_admin && (
                              <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {notification.message || 'No message'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.time)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-green-400 hover:text-green-300 font-semibold"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-xs text-red-400 hover:text-red-300 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
