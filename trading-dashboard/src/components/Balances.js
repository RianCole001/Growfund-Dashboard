import React from 'react';

export default function Balances({ balance, investments }) {
  const investedTotal = investments.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Account Balances</h2>
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex justify-between"><span>Available Balance</span><strong>${balance.toLocaleString()}</strong></div>
        <div className="flex justify-between"><span>Total Invested</span><strong>${investedTotal.toLocaleString()}</strong></div>
        <div className="flex justify-between"><span>Investments</span><strong>{investments.length}</strong></div>
      </div>
    </div>
  );
}
