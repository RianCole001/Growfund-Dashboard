import React from 'react';
import { X, Home, User, Bitcoin, TrendingUp, Building, Wallet, ArrowDownCircle, ArrowUpCircle, List, BarChart3, Gift, Settings } from 'lucide-react';

export default function Sidebar({ page, setPage, onClose }) {
  const items = [
    { name: 'Dashboard', icon: Home },
    { name: 'Profile', icon: User },
    { name: 'Crypto', icon: Bitcoin },
    { name: 'Trade Now', icon: BarChart3 },
    { name: 'Earn', icon: Gift },
    { name: 'Capital Appreciation Plan', icon: TrendingUp },
    { name: 'Real Estate', icon: Building },
    { name: 'Balances', icon: Wallet },
    { name: 'Deposits', icon: ArrowDownCircle },
    { name: 'Withdrawals', icon: ArrowUpCircle },
    { name: 'Transactions', icon: List },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
          <div className="text-2xl font-bold text-blue-400">GrowFund</div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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
                  ? 'bg-blue-600 font-semibold shadow-md' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          © 2026 GrowFund
        </div>
      </div>
    </div>
  );
}
