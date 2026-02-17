import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Eye, Wallet, BarChart3 } from 'lucide-react';

export default function Portfolio({ investments = [], balance = 0, prices = {}, loading = false }) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'crypto', 'plans'

  // Calculate portfolio data
  const portfolioData = useMemo(() => {
    // Group investments by type
    const cryptoInvestments = investments.filter(inv => inv.coin);
    const capitalPlans = investments.filter(inv => inv.plan_type && (inv.plan_type === 'basic' || inv.plan_type === 'standard' || inv.plan_type === 'advance'));
    const realEstateInvestments = investments.filter(inv => inv.asset === 'Real Estate' || inv.plan === 'Real Estate');

    // Calculate crypto holdings
    const cryptoHoldings = {};
    cryptoInvestments.forEach(inv => {
      const coin = inv.coin;
      if (!cryptoHoldings[coin]) {
        cryptoHoldings[coin] = {
          coin,
          totalInvested: 0,
          quantity: 0,
          transactions: []
        };
      }
      cryptoHoldings[coin].totalInvested += inv.amount || 0;
      cryptoHoldings[coin].quantity += inv.quantity || 0;
      cryptoHoldings[coin].transactions.push(inv);
    });

    // Add current values and P&L
    Object.keys(cryptoHoldings).forEach(coin => {
      const holding = cryptoHoldings[coin];
      const currentPrice = prices[coin]?.price || 0;
      holding.currentPrice = currentPrice;
      holding.currentValue = holding.quantity * currentPrice;
      holding.profitLoss = holding.currentValue - holding.totalInvested;
      holding.profitLossPercent = holding.totalInvested > 0 ? ((holding.profitLoss / holding.totalInvested) * 100) : 0;
    });

    // Calculate totals
    const totalCryptoInvested = Object.values(cryptoHoldings).reduce((sum, h) => sum + h.totalInvested, 0);
    const totalCryptoValue = Object.values(cryptoHoldings).reduce((sum, h) => sum + h.currentValue, 0);
    const totalCapitalPlans = capitalPlans.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalRealEstate = realEstateInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    
    const totalInvested = totalCryptoInvested + totalCapitalPlans + totalRealEstate;
    const totalPortfolioValue = totalCryptoValue + totalCapitalPlans + totalRealEstate + balance;
    const totalProfitLoss = totalCryptoValue - totalCryptoInvested;

    return {
      cryptoHoldings: Object.values(cryptoHoldings),
      capitalPlans,
      realEstateInvestments,
      totals: {
        totalInvested,
        totalPortfolioValue,
        totalProfitLoss,
        totalCryptoInvested,
        totalCryptoValue,
        totalCapitalPlans,
        totalRealEstate,
        balance
      }
    };
  }, [investments, balance, prices]);

  // Pie chart data for allocation
  const allocationData = [
    { name: 'Crypto', value: portfolioData.totals.totalCryptoValue, color: '#10B981' },
    { name: 'Capital Plans', value: portfolioData.totals.totalCapitalPlans, color: '#059669' },
    { name: 'Real Estate', value: portfolioData.totals.totalRealEstate, color: '#047857' },
    { name: 'Cash', value: portfolioData.totals.balance, color: '#065F46' }
  ].filter(item => item.value > 0);

  // Portfolio growth chart data
  const growthData = useMemo(() => {
    const sortedInvestments = [...investments].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningTotal = 0;
    
    return sortedInvestments.map(inv => {
      runningTotal += inv.amount || 0;
      return {
        date: new Date(inv.date).toLocaleDateString(),
        value: runningTotal,
        investment: inv.amount || 0
      };
    });
  }, [investments]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-lg animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg animate-pulse h-80" />
          <div className="bg-gray-800 p-6 rounded-lg animate-pulse h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center mb-2">
              <Wallet className="w-6 h-6 mr-2" />
              Portfolio & Assets
            </h2>
            <p className="text-green-100 text-sm">Track all your investments and holdings</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
            <div className="text-xs text-green-100 mb-1">Total Portfolio Value</div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              ${portfolioData.totals.totalPortfolioValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Invested</div>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${portfolioData.totals.totalInvested.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {investments.length} positions
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Current Value</div>
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${(portfolioData.totals.totalCryptoValue + portfolioData.totals.totalCapitalPlans + portfolioData.totals.totalRealEstate).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Excluding cash balance
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Profit/Loss</div>
            {portfolioData.totals.totalProfitLoss >= 0 ? 
              <TrendingUp className="w-5 h-5 text-green-500" /> : 
              <TrendingDown className="w-5 h-5 text-red-500" />
            }
          </div>
          <div className={`text-2xl font-bold ${portfolioData.totals.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolioData.totals.totalProfitLoss >= 0 ? '+' : ''}${portfolioData.totals.totalProfitLoss.toLocaleString()}
          </div>
          <div className={`text-xs mt-1 ${portfolioData.totals.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolioData.totals.totalInvested > 0 ? 
              `${((portfolioData.totals.totalProfitLoss / portfolioData.totals.totalInvested) * 100).toFixed(2)}%` : 
              '0.00%'
            }
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Available Cash</div>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${portfolioData.totals.balance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ready to invest
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'crypto', label: 'Crypto Holdings', icon: TrendingUp },
            { key: 'plans', label: 'Investment Plans', icon: Target }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key)}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
                  viewMode === tab.key
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Allocation */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              Portfolio Allocation
            </h3>
            {allocationData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No investments yet
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {allocationData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Growth */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Investment Growth
            </h3>
            {growthData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #10B981', 
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Total Invested']} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      fill="url(#colorGrowth)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No investment history yet
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'crypto' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Crypto Holdings
            </h3>
            <p className="text-sm text-gray-400 mt-1">Your cryptocurrency investments and current values</p>
          </div>
          
          {portfolioData.cryptoHoldings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No crypto holdings yet</p>
                <p className="text-sm">Start investing in cryptocurrencies to see your holdings here</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Holdings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Invested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {portfolioData.cryptoHoldings.map((holding, index) => (
                    <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-white">{holding.coin}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-mono">{holding.quantity.toFixed(6)}</div>
                        <div className="text-xs text-gray-400">{holding.transactions.length} transactions</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">${holding.currentPrice.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">${holding.currentValue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">${holding.totalInvested.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {holding.profitLoss >= 0 ? '+' : ''}${holding.profitLoss.toLocaleString()}
                        </div>
                        <div className={`text-xs ${holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center shadow-lg">
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === 'plans' && (
        <div className="space-y-6">
          {/* Capital Investment Plans */}
          {portfolioData.capitalPlans.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Capital Investment Plans
                </h3>
                <p className="text-sm text-gray-400 mt-1">Your active capital growth investments</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioData.capitalPlans.map((plan, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-semibold text-white">{plan.plan || plan.name}</div>
                        <div className="text-xs bg-green-500 text-white px-2 py-1 rounded shadow-lg">
                          {plan.growth_rate || plan.rate}% Monthly
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Invested</span>
                          <span className="text-sm font-medium text-white">${(plan.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Duration</span>
                          <span className="text-sm text-white">{plan.months || 'N/A'} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Date</span>
                          <span className="text-sm text-white">{new Date(plan.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real Estate Investments */}
          {portfolioData.realEstateInvestments.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-500" />
                  Real Estate Investments
                </h3>
                <p className="text-sm text-gray-400 mt-1">Your real estate portfolio</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioData.realEstateInvestments.map((investment, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-semibold text-white">{investment.name || 'Real Estate'}</div>
                        <div className="text-xs bg-green-500 text-white px-2 py-1 rounded shadow-lg">
                          {investment.rate || 'N/A'}% Monthly
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Invested</span>
                          <span className="text-sm font-medium text-white">${(investment.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Date</span>
                          <span className="text-sm text-white">{new Date(investment.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {portfolioData.capitalPlans.length === 0 && portfolioData.realEstateInvestments.length === 0 && (
            <div className="bg-gray-800 p-12 rounded-lg text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-400 mb-2">No investment plans yet</p>
              <p className="text-sm text-gray-500">Start with Capital Plans or Real Estate to see your investments here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}