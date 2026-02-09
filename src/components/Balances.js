import React from 'react';
import { Wallet, TrendingUp, PieChart } from 'lucide-react';

export default function Balances({ balance, investments }) {
  const investedTotal = investments.reduce((s, i) => s + (i.amount || 0), 0);
  const totalValue = balance + investedTotal;

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-400 flex items-center">
        <Wallet className="w-6 h-6 mr-2" />
        Account Balances
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-100">Available Balance</span>
            <Wallet className="w-5 h-5 text-blue-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">${balance.toLocaleString()}</div>
          <div className="text-xs text-blue-200 mt-1">Ready to invest</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-100">Total Invested</span>
            <TrendingUp className="w-5 h-5 text-green-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">${investedTotal.toLocaleString()}</div>
          <div className="text-xs text-green-200 mt-1">{investments.length} active positions</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-100">Total Portfolio</span>
            <PieChart className="w-5 h-5 text-purple-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-purple-200 mt-1">Combined value</div>
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Balance Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Available Cash</span>
            <div className="text-right">
              <div className="font-semibold">${balance.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{totalValue > 0 ? ((balance / totalValue) * 100).toFixed(1) : 0}% of total</div>
            </div>
          </div>
          <div className="h-px bg-gray-600"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Invested Assets</span>
            <div className="text-right">
              <div className="font-semibold">${investedTotal.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{totalValue > 0 ? ((investedTotal / totalValue) * 100).toFixed(1) : 0}% of total</div>
            </div>
          </div>
          <div className="h-px bg-gray-600"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Active Investments</span>
            <div className="text-right">
              <div className="font-semibold">{investments.length}</div>
              <div className="text-xs text-gray-500">Positions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
