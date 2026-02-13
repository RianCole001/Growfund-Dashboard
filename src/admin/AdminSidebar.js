import React from 'react';
import { X, LayoutDashboard, Users, TrendingUp, ArrowDownRight, ArrowUpRight, List, Settings } from 'lucide-react';

export default function AdminSidebar({ page, setPage, onClose }) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Users', icon: Users },
    { name: 'Investments', icon: TrendingUp },
    { name: 'Deposits', icon: ArrowDownRight },
    { name: 'Withdrawals', icon: ArrowUpRight },
    { name: 'Transactions', icon: List },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-blue-400">Admin Menu</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setPage(item.name);
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              page === item.name
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          GrowFund Admin v1.0
        </div>
      </div>
    </div>
  );
}
