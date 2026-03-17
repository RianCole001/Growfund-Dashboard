import React, { useState } from 'react';
import { TrendingUp, Search, Filter } from 'lucide-react';

export default function AdminInvestments() {
  const [investments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsset, setFilterAsset] = useState('all');

  const filtered = investments.filter(inv => {
    const s = inv.user?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.asset?.toLowerCase().includes(searchTerm.toLowerCase());
    const f = filterAsset === 'all' || inv.symbol === filterAsset;
    return s && f;
  });

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalCurrentValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const profitPct = totalInvested ? ((totalProfit / totalInvested) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Investment Management</h2>
        <p className="text-sm text-gray-500 mt-1">Monitor all user investments</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested', value: `$${totalInvested.toLocaleString()}`, color: 'text-gray-900' },
          { label: 'Current Value', value: `$${totalCurrentValue.toLocaleString()}`, color: 'text-blue-600' },
          { label: 'Profit / Loss', value: `$${Math.abs(totalProfit).toLocaleString()}`, color: totalProfit >= 0 ? 'text-green-600' : 'text-red-500' },
          { label: 'ROI', value: `${isFinite(profitPct) ? profitPct : 0}%`, color: totalProfit >= 0 ? 'text-green-600' : 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search investments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select value={filterAsset} onChange={(e) => setFilterAsset(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All Assets</option>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
              <option value="SOL">Solana</option>
              <option value="ADA">Cardano</option>
              <option value="RE">Real Estate</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
        No investments yet. User investments will appear here.
      </div>
    </div>
  );
}
