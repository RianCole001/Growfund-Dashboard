import React from 'react';
import { X, LayoutDashboard, Users, TrendingUp, ArrowDownRight, ArrowUpRight, List, Settings, Bell, DollarSign } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Users', icon: Users },
  { name: 'Price Control', icon: DollarSign },
  { name: 'Investments', icon: TrendingUp },
  { name: 'Deposits', icon: ArrowDownRight },
  { name: 'Withdrawals', icon: ArrowUpRight },
  { name: 'Transactions', icon: List },
  { name: 'Notifications', icon: Bell },
  { name: 'Settings', icon: Settings },
];

export default function AdminSidebar({ page, setPage, onClose }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-green-600">Navigation</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => { setPage(item.name); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
              page === item.name
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        GrowFund Admin v1.0
      </div>
    </div>
  );
}
