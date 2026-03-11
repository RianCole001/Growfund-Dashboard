import React from 'react';
import { Wallet, TrendingUp, PieChart } from 'lucide-react';

export default function Balances({ balance, investments }) {
  // Ensure balance is a valid number
  const safeBalance = parseFloat(balance) || 0;
  
  // Calculate invested total with proper number handling
  const investedTotal = investments.reduce((s, i) => {
    const amount = parseFloat(i.amount) || 0;
    return s + amount;
  }, 0);
  
  const totalValue = safeBalance + investedTotal;
  
  // Format numbers properly to avoid display issues
  const formatCurrency = (num) => {
    const value = parseFloat(num) || 0;
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-green-600 flex items-center">
        <Wallet className="w-6 h-6 mr-2" />
        Account Balances
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Available Balance</span>
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-green-700">${formatCurrency(safeBalance)}</div>
          <div className="text-xs text-green-600 mt-1">Ready to invest</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Total Invested</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">${formatCurrency(investedTotal)}</div>
          <div className="text-xs text-blue-600 mt-1">{investments.length} active positions</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Total Portfolio</span>
            <PieChart className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-700">${formatCurrency(totalValue)}</div>
          <div className="text-xs text-purple-600 mt-1">Combined value</div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Balance Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Available Cash</span>
            <div className="text-right">
              <div className="font-semibold text-gray-800">${formatCurrency(safeBalance)}</div>
              <div className="text-xs text-gray-500">{totalValue > 0 ? ((safeBalance / totalValue) * 100).toFixed(1) : 0}% of total</div>
            </div>
          </div>
          <div className="h-px bg-gray-300"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Invested Assets</span>
            <div className="text-right">
              <div className="font-semibold text-gray-800">${formatCurrency(investedTotal)}</div>
              <div className="text-xs text-gray-500">{totalValue > 0 ? ((investedTotal / totalValue) * 100).toFixed(1) : 0}% of total</div>
            </div>
          </div>
          <div className="h-px bg-gray-300"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Investments</span>
            <div className="text-right">
              <div className="font-semibold text-gray-800">{investments.length}</div>
              <div className="text-xs text-gray-500">Positions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
