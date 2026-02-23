import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBell({ unreadCount, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors group"
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      <Bell className={`w-5 h-5 transition-colors ${
        unreadCount > 0 ? 'text-green-400' : 'text-gray-300'
      } ${loading ? 'animate-pulse' : ''}`} />
      
      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* Pulse Animation for New Notifications */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 rounded-full animate-ping opacity-75"></span>
      )}
      
      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications'}
      </div>
    </button>
  );
}