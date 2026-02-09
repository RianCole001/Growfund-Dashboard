import React, { useState, useEffect } from 'react';
import { Bell, X, Check, TrendingUp, TrendingDown, DollarSign, Gift, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function Notifications({ onClose }) {
  const storage = require('../utils/storage').default;
  const [notifications, setNotifications] = useState(storage.get('notifications', []));
  const [filter, setFilter] = useState('all');

  // Mock notifications - in real app, these would come from backend
  useEffect(() => {
    if (notifications.length === 0) {
      const mockNotifications = [
        {
          id: 1,
          type: 'price',
          title: 'Price Alert',
          message: 'Bitcoin reached your target price of $65,000',
          icon: TrendingUp,
          color: 'green',
          time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 2,
          type: 'transaction',
          title: 'Deposit Successful',
          message: 'Your deposit of $1,000 has been credited',
          icon: DollarSign,
          color: 'blue',
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: 3,
          type: 'referral',
          title: 'New Referral',
          message: 'John Doe signed up using your referral link',
          icon: Gift,
          color: 'purple',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: 4,
          type: 'alert',
          title: 'Market Alert',
          message: 'High volatility detected in your portfolio',
          icon: AlertCircle,
          color: 'yellow',
          time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: 5,
          type: 'info',
          title: 'New Feature',
          message: 'Check out our new TradingView-style charts',
          icon: Info,
          color: 'blue',
          time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];
      setNotifications(mockNotifications);
      storage.set('notifications', mockNotifications);
    }
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    storage.set('notifications', updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    storage.set('notifications', updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    storage.set('notifications', updated);
  };

  const clearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
      storage.set('notifications', []);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

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
            <Bell className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
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
          {['all', 'unread', 'price', 'transaction', 'referral', 'alert', 'info'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
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
              className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
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
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">No notifications</p>
              <p className="text-sm text-gray-500 text-center mt-1">
                {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-700/50 transition-colors ${
                      !notification.read ? 'bg-gray-700/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full ${colorClasses[notification.color]} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-white text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.time)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
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
