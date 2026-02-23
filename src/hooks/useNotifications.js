import { useState, useEffect, useCallback } from 'react';
import { userAuthAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const response = await userAuthAPI.getNotifications();
      
      if (response.data.success) {
        const newNotifications = response.data.data || [];
        const newUnreadCount = response.data.unread_count || 0;
        
        // Check for new notifications (only if we have previous data)
        if (lastFetchTime && notifications.length > 0) {
          const newNotificationsSinceLastFetch = newNotifications.filter(notif => 
            new Date(notif.created_at) > lastFetchTime && !notif.read
          );
          
          // Show popup for new notifications
          newNotificationsSinceLastFetch.forEach(notif => {
            showNotificationPopup(notif);
          });
        }
        
        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
        setLastFetchTime(new Date());
        
        if (showToast) {
          toast.success('Notifications updated');
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (showToast) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [notifications, lastFetchTime]);

  // Show notification popup
  const showNotificationPopup = (notification) => {
    const getToastIcon = (type) => {
      switch (type) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        default: return '📢';
      }
    };

    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-600`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">{getToastIcon(notification.type)}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-300">
                {notification.message}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Admin Notification
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-600">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-right',
    });
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await userAuthAPI.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await userAuthAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await userAuthAPI.deleteNotification(id);
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Clear all notifications (for logout)
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setLastFetchTime(null);
  }, []);

  // Clear notifications when user changes (token changes)
  useEffect(() => {
    const currentToken = localStorage.getItem('user_access_token');
    const storedToken = localStorage.getItem('last_notification_token');
    
    // If token changed (different user logged in), clear notifications
    if (storedToken && currentToken !== storedToken) {
      clearNotifications();
    }
    
    // Store current token for next comparison
    if (currentToken) {
      localStorage.setItem('last_notification_token', currentToken);
    } else {
      localStorage.removeItem('last_notification_token');
    }
  }, [clearNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set up polling for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listen for page visibility changes to fetch when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    refreshNotifications: () => fetchNotifications(true)
  };
};