import React from 'react';

export default function Sidebar({ page, setPage, onClose }) {
  const items = ['Dashboard', 'Profile', 'Crypto', 'Investments', 'Real Estate', 'Balances', 'Deposits', 'Withdrawals', 'Transactions'];
  return (
    <div className="text-white">
      <div className="mb-4">
        <div className="text-2xl font-bold text-blue-400">GrowFund</div>
      </div>
      <nav className="flex flex-col space-y-2">
        {items.map((item) => (
          <button key={item} onClick={() => { setPage(item); onClose && onClose(); }} className={`text-left p-2 rounded ${page === item ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'}`}>
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}
