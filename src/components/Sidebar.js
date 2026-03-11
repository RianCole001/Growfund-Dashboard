import React from 'react';
import { X, Home, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, Settings, PieChart, LogOut, User, Bitcoin, BarChart3, Building, Users } from 'lucide-react';

export default function Sidebar({ page, setPage, onClose, onLogout, onOpenProfile }) {
  const items = [
    { name: 'Dashboard', icon: Home },
    { name: 'Portfolio', icon: PieChart },
    { name: 'Crypto', icon: Bitcoin },
    { name: 'Trade Now', icon: BarChart3 },
    { name: 'Capital Appreciation Plan', icon: TrendingUp },
    { name: 'Real Estate', icon: Building },
    { name: 'Balances', icon: Wallet },
    { name: 'Deposits', icon: ArrowDownCircle },
    { name: 'Withdrawals', icon: ArrowUpCircle },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <div className="text-gray-800 h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
          <div className="text-2xl font-bold text-green-600">GrowFund</div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1 flex-grow overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button 
              key={item.name} 
              onClick={() => { 
                setPage(item.name); 
                onClose && onClose(); 
              }} 
              className={`flex items-center space-x-3 text-left p-3 rounded-lg transition-all duration-200 ${
                page === item.name 
                  ? 'bg-green-600 text-white font-semibold shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
        <button 
          onClick={() => {
            onOpenProfile && onOpenProfile();
            onClose && onClose();
          }}
          className="w-full flex items-center space-x-3 text-left p-3 rounded-lg transition-all duration-200 text-green-600 hover:bg-green-50 font-medium"
        >
          <User className="w-5 h-5" />
          <span className="text-sm">Profile</span>
        </button>
        <button 
          onClick={() => {
            onLogout && onLogout();
            onClose && onClose();
          }}
          className="w-full flex items-center space-x-3 text-left p-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
        <div className="text-xs text-gray-500 text-center mt-3">
          © 2026 GrowFund
        </div>
      </div>
    </div>
  );
}
