import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';

export default function AdminInvestments() {
  const [investments] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsset, setFilterAsset] = useState('all');

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAsset === 'all' || inv.symbol === filterAsset;
    return matchesSearch && matchesFilter;
  });

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const profitPercentage = ((totalProfit / totalInvested) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Investment Management</h2>
        <p className="text-sm text-gray-400 mt-1">Monitor all user investments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-sm text-gray-400 mb-2">Total Invested</div>
          <div className="text-2xl font-bold text-white">${totalInvested.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-sm text-gray-400 mb-2">Current Value</div>
          <div className="text-2xl font-bold text-blue-400">${totalCurrentValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-sm text-gray-400 mb-2">Total Profit/Loss</div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(totalProfit).toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-sm text-gray-400 mb-2">ROI</div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {isFinite(profitPercentage) ? profitPercentage : 0}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
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

      {/* Empty State */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-400">No investments yet. User investments will appear here.</p>
      </div>
    </div>
  );
}
