import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Eye, Wallet, BarChart3, Minus, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeParseDate, formatDate } from '../utils/dateUtils';

export default function Portfolio({ investments = [], balance = 0, prices = {}, loading = false, onSellCrypto }) {
  const isDemoMode = !!localStorage.getItem('demo_access_token');
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'crypto', 'plans'
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [sellLoading, setSellLoading] = useState(false);
  const [priceUpdateTrigger, setPriceUpdateTrigger] = useState(0);
  const [backendPortfolio, setBackendPortfolio] = useState(null); // live portfolio from backend

  // Fetch live portfolio from backend
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { userAuthAPI } = await import('../services/api');
        const res = await userAuthAPI.getCryptoPortfolio();
        if (res.data) setBackendPortfolio(res.data);
      } catch {}
    };
    fetchPortfolio();
  }, [investments]);

  // Listen for admin price changes
  useEffect(() => {
    const handleAdminPriceUpdate = () => {
      setPriceUpdateTrigger(prev => prev + 1);
    };
    
    window.addEventListener('adminPriceUpdate', handleAdminPriceUpdate);
    window.addEventListener('storage', handleAdminPriceUpdate);

    return () => {
      window.removeEventListener('adminPriceUpdate', handleAdminPriceUpdate);
      window.removeEventListener('storage', handleAdminPriceUpdate);
    };
  }, []);

  // Get admin-controlled sell price
  const getSellPrice = useCallback((coin) => {
    // Prefer backend portfolio sell price if available
    if (backendPortfolio) {
      const holding = (backendPortfolio.holdings || backendPortfolio).find?.(h => h.coin === coin || h.symbol === coin);
      if (holding?.sell_price) return parseFloat(holding.sell_price);
    }
    const adminPrices = JSON.parse(localStorage.getItem('admin_crypto_prices') || '{}');
    if (adminPrices[coin] && adminPrices[coin].sellPrice) {
      return adminPrices[coin].sellPrice;
    }
    return (prices[coin]?.price || 0) * 0.97;
  }, [prices, backendPortfolio]);

  // Get current price — backend first, then admin-controlled, then live market
  const getCurrentPrice = useCallback((coin) => {
    // Use backend live price if available
    if (backendPortfolio) {
      const holding = (backendPortfolio.holdings || backendPortfolio).find?.(h => h.coin === coin || h.symbol === coin);
      if (holding?.current_price) return parseFloat(holding.current_price);
    }
    if (coin === 'EXACOIN' || coin === 'OPTCOIN') {
      const adminPrices = JSON.parse(localStorage.getItem('admin_crypto_prices') || '{}');
      if (adminPrices[coin] && adminPrices[coin].price) {
        return parseFloat(adminPrices[coin].price) || 0;
      }
      if (coin === 'EXACOIN') return 62.00;
      if (coin === 'OPTCOIN') return 85.30;
    }
    return parseFloat(prices[coin]?.price) || 0;
  }, [prices, backendPortfolio]);

  // Get full coin name from backend portfolio or fallback to symbol
  const getCoinName = useCallback((coin) => {
    if (backendPortfolio) {
      const holding = (backendPortfolio.holdings || backendPortfolio).find?.(h => h.coin === coin || h.symbol === coin);
      if (holding?.name) return holding.name;
    }
    return coin;
  }, [backendPortfolio]);

  // Calculate portfolio data
  const portfolioData = useMemo(() => {
    // Group investments by type
    const cryptoInvestments = investments.filter(inv => 
      inv.investment_type === 'crypto' || inv.coin
    );
    const capitalPlans = investments.filter(inv => 
      inv.investment_type === 'capital_plan' || 
      (inv.plan_type && (inv.plan_type === 'basic' || inv.plan_type === 'standard' || inv.plan_type === 'advance'))
    );
    const realEstateInvestments = investments.filter(inv => 
      inv.investment_type === 'real_estate' || 
      inv.asset === 'Real Estate' || 
      inv.plan === 'Real Estate'
    );

    // Calculate crypto holdings
    const cryptoHoldings = {};
    cryptoInvestments.forEach(inv => {
      const coin = inv.asset_name || inv.coin;
      
      if (!cryptoHoldings[coin]) {
        cryptoHoldings[coin] = {
          coin,
          name: getCoinName(coin),
          totalInvested: 0,
          quantity: 0,
          transactions: [],
          totalPurchaseValue: 0,
          averagePurchasePrice: 0,
          investmentIds: []
        };
      }
      // Ensure amounts are properly converted to numbers
      const amount = parseFloat(inv.amount) || 0;
      const quantity = parseFloat(inv.quantity) || 0;
      const purchasePrice = parseFloat(inv.priceAtPurchase || inv.price_at_purchase) || 0;
      
      cryptoHoldings[coin].totalInvested += amount;
      cryptoHoldings[coin].investmentIds.push(inv.id); // Store investment ID
      
      // Add quantity if it exists and is a valid number
      if (quantity > 0) {
        cryptoHoldings[coin].quantity += quantity;
        // Track purchase value for average price calculation
        if (purchasePrice > 0) {
          cryptoHoldings[coin].totalPurchaseValue += (quantity * purchasePrice);
        } else {
          // If no purchase price, use the invested amount
          cryptoHoldings[coin].totalPurchaseValue += amount;
        }
      }
      cryptoHoldings[coin].transactions.push(inv);
    });

    // Add current values and P&L
    Object.keys(cryptoHoldings).forEach(coin => {
      const holding = cryptoHoldings[coin];
      const currentPrice = getCurrentPrice(coin);
      const quantity = parseFloat(holding.quantity) || 0;
      const totalInvested = parseFloat(holding.totalInvested) || 0;
      
      // Calculate average purchase price
      if (quantity > 0 && holding.totalPurchaseValue > 0) {
        holding.averagePurchasePrice = holding.totalPurchaseValue / quantity;
      } else if (quantity > 0 && totalInvested > 0) {
        // Fallback: use total invested / quantity
        holding.averagePurchasePrice = totalInvested / quantity;
      } else {
        holding.averagePurchasePrice = 0;
      }
      
      holding.currentPrice = currentPrice;
      holding.currentValue = quantity * currentPrice;
      holding.profitLoss = holding.currentValue - totalInvested;
      holding.profitLossPercent = totalInvested > 0 ? ((holding.profitLoss / totalInvested) * 100) : 0;
    });

    // Calculate totals
    const totalCryptoInvested = Object.values(cryptoHoldings).reduce((sum, h) => sum + (parseFloat(h.totalInvested) || 0), 0);
    const totalCryptoValue = Object.values(cryptoHoldings).reduce((sum, h) => sum + (parseFloat(h.currentValue) || 0), 0);
    const totalCapitalPlans = capitalPlans.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const totalRealEstate = realEstateInvestments.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    
    const totalInvested = totalCryptoInvested + totalCapitalPlans + totalRealEstate;
    const totalPortfolioValue = totalCryptoValue + totalCapitalPlans + totalRealEstate + (parseFloat(balance) || 0);
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
  }, [investments, balance, prices, getCurrentPrice, getCoinName, priceUpdateTrigger]);

  const openSellModal = (holding) => {
    setSelectedHolding(holding);
    setSellAmount('');
    setSellModalOpen(true);
  };

  const closeSellModal = () => {
    setSellModalOpen(false);
    setSelectedHolding(null);
    setSellAmount('');
    setSellLoading(false);
  };

  const handleSellCrypto = async () => {
    if (!selectedHolding || !sellAmount) {
      toast.error('Please enter a valid amount to sell');
      return;
    }

    const sellQuantity = parseFloat(sellAmount);
    if (isNaN(sellQuantity) || sellQuantity <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (sellQuantity > (selectedHolding.quantity || 0)) {
      toast.error('Cannot sell more than you own');
      return;
    }

    try {
      setSellLoading(true);
      const sellPrice = getSellPrice(selectedHolding.coin);
      const sellValue = sellQuantity * sellPrice;

      if (isDemoMode) {
        // Use demo sell function
        await onSellCrypto({
          coin: selectedHolding.coin,
          quantity: sellQuantity,
          price: sellPrice,
          amount: sellValue
        });
        toast.success(`Successfully sold ${sellQuantity} ${selectedHolding.coin} for $${sellValue.toFixed(2)}`);
      } else {
        // Use real API
        if (onSellCrypto) {
          await onSellCrypto({
            investment_id: selectedHolding.investmentIds[0], // Use first investment ID (FIFO)
            coin: selectedHolding.coin,
            quantity: sellQuantity,
            price: sellPrice
          });
          toast.success(`Successfully sold ${sellQuantity} ${selectedHolding.coin} for $${sellValue.toFixed(2)}`);
        }
      }

      closeSellModal();
    } catch (error) {
      console.error('Error selling crypto:', error);
      toast.error(error.message || 'Failed to sell cryptocurrency');
    } finally {
      setSellLoading(false);
    }
  };

  // Pie chart data for allocation
  const allocationData = [
    { name: 'Crypto', value: portfolioData.totals.totalCryptoValue, color: '#10B981' },
    { name: 'Capital Plans', value: portfolioData.totals.totalCapitalPlans, color: '#059669' },
    { name: 'Real Estate', value: portfolioData.totals.totalRealEstate, color: '#047857' },
    { name: 'Cash', value: portfolioData.totals.balance, color: '#065F46' }
  ].filter(item => item.value > 0);

  // Calculate expected returns projection
  const expectedReturnsData = useMemo(() => {
    const projectionMonths = 12; // Project 12 months ahead
    const monthlyData = [];
    
    // Current date as starting point
    const startDate = new Date();
    
    for (let month = 0; month <= projectionMonths; month++) {
      const projectionDate = new Date(startDate);
      projectionDate.setMonth(startDate.getMonth() + month);
      
      let totalProjectedValue = portfolioData.totals.balance; // Start with cash balance
      
      // Calculate crypto projections (assume 5% monthly growth average)
      const cryptoGrowthRate = 0.05;
      const projectedCryptoValue = portfolioData.totals.totalCryptoValue * Math.pow(1 + cryptoGrowthRate, month);
      totalProjectedValue += projectedCryptoValue;
      
      // Calculate capital plan projections
      portfolioData.capitalPlans.forEach(plan => {
        const planAmount = parseFloat(plan.amount) || 0;
        let monthlyRate = 0.20; // Default 20%
        
        // Determine rate based on plan type
        if (plan.plan_type === 'standard' || plan.plan === 'Standard') {
          monthlyRate = 0.30;
        } else if (plan.plan_type === 'advance' || plan.plan === 'Advance') {
          monthlyRate = plan.rate ? (parseFloat(plan.rate) / 100) : 0.40; // Use stored rate or default 40%
        }
        
        // Calculate months since investment
        const investmentDate = safeParseDate(plan.created_at || plan.date);
        const monthsSinceInvestment = Math.max(0, 
          (projectionDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        
        const projectedPlanValue = planAmount * Math.pow(1 + monthlyRate, monthsSinceInvestment);
        totalProjectedValue += projectedPlanValue;
      });
      
      // Calculate real estate projections
      portfolioData.realEstateInvestments.forEach(investment => {
        const investmentAmount = parseFloat(investment.amount) || 0;
        let monthlyRate = 0.20; // Default 20%
        
        // Determine rate based on property type
        if (investment.name && investment.name.includes('Premium')) {
          monthlyRate = 0.30;
        } else if (investment.name && investment.name.includes('Luxury')) {
          monthlyRate = 0.50;
        }
        
        // Calculate months since investment
        const investmentDate = safeParseDate(investment.created_at || investment.date);
        const monthsSinceInvestment = Math.max(0,
          (projectionDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        
        const projectedRealEstateValue = investmentAmount * Math.pow(1 + monthlyRate, monthsSinceInvestment);
        totalProjectedValue += projectedRealEstateValue;
      });
      
      monthlyData.push({
        month: month,
        date: projectionDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        totalValue: Math.round(totalProjectedValue),
        cryptoValue: Math.round(projectedCryptoValue),
        capitalValue: Math.round(portfolioData.capitalPlans.reduce((sum, plan) => {
          const planAmount = parseFloat(plan.amount) || 0;
          let monthlyRate = 0.20;
          if (plan.plan_type === 'standard' || plan.plan === 'Standard') monthlyRate = 0.30;
          else if (plan.plan_type === 'advance' || plan.plan === 'Advance') {
            monthlyRate = plan.rate ? (parseFloat(plan.rate) / 100) : 0.40;
          }
          const investmentDate = safeParseDate(plan.created_at || plan.date);
          const monthsSinceInvestment = Math.max(0,
            (projectionDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );
          return sum + (planAmount * Math.pow(1 + monthlyRate, monthsSinceInvestment));
        }, 0)),
        realEstateValue: Math.round(portfolioData.realEstateInvestments.reduce((sum, inv) => {
          const investmentAmount = parseFloat(inv.amount) || 0;
          let monthlyRate = 0.20;
          if (inv.name && inv.name.includes('Premium')) monthlyRate = 0.30;
          else if (inv.name && inv.name.includes('Luxury')) monthlyRate = 0.50;
          const investmentDate = safeParseDate(inv.created_at || inv.date);
          const monthsSinceInvestment = Math.max(0,
            (projectionDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );
          return sum + (investmentAmount * Math.pow(1 + monthlyRate, monthsSinceInvestment));
        }, 0))
      });
    }
    
    return monthlyData;
  }, [portfolioData, investments]);

  // Portfolio growth chart data
  const growthData = useMemo(() => {
    const sortedInvestments = [...investments].sort((a, b) => {
      try {
        const dateA = safeParseDate(a.created_at || a.date);
        const dateB = safeParseDate(b.created_at || b.date);
        return dateA - dateB;
      } catch {
        return 0;
      }
    });
    let runningTotal = 0;
    
    return sortedInvestments.map(inv => {
      runningTotal += inv.amount || 0;
      let formattedDate = 'N/A';
      try {
        const dateValue = inv.created_at || inv.date;
        if (dateValue) {
          formattedDate = formatDate(dateValue);
        }
      } catch {
        // ignore date formatting errors
      }
      
      return {
        date: formattedDate,
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
            <div key={i} className="bg-white border border-gray-200 p-6 rounded-lg animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-lg animate-pulse h-80" />
          <div className="bg-white border border-gray-200 p-6 rounded-lg animate-pulse h-80" />
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
              ${Math.round(portfolioData.totals.totalPortfolioValue).toLocaleString()}
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
            ${Math.round(portfolioData.totals.totalInvested).toLocaleString()}
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
            ${Math.round(portfolioData.totals.totalCryptoValue + portfolioData.totals.totalCapitalPlans + portfolioData.totals.totalRealEstate).toLocaleString()}
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
            {portfolioData.totals.totalProfitLoss >= 0 ? '+' : ''}${Math.round(portfolioData.totals.totalProfitLoss).toLocaleString()}
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
            ${Math.round(portfolioData.totals.balance).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ready to invest
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'crypto', label: 'Crypto Holdings', icon: TrendingUp },
            { key: 'plans', label: 'Investment Plans', icon: Target },
            { key: 'projections', label: 'Expected Returns', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key)}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
                  viewMode === tab.key
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
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
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
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
              <div className="h-64 flex items-center justify-center text-gray-600">
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
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Growth */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #16a34a', 
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
              <div className="h-64 flex items-center justify-center text-gray-600">
                No investment history yet
              </div>
            )}
          </div>

          {/* Expected Returns Projection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Expected Returns (12-Month Projection)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Projected portfolio growth based on historical returns and investment types
            </p>
            {expectedReturnsData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expectedReturnsData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRealEstate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #16a34a', 
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => {
                        const labels = {
                          totalValue: 'Total Portfolio',
                          capitalValue: 'Capital Plans',
                          realEstateValue: 'Real Estate',
                          cryptoValue: 'Crypto Holdings'
                        };
                        return [`$${value.toLocaleString()}`, labels[name] || name];
                      }}
                    />
                    
                    {/* Stack the areas */}
                    <Area 
                      type="monotone" 
                      dataKey="capitalValue" 
                      stackId="1"
                      stroke="#10B981" 
                      strokeWidth={1}
                      fill="url(#colorCapital)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="realEstateValue" 
                      stackId="1"
                      stroke="#F59E0B" 
                      strokeWidth={1}
                      fill="url(#colorRealEstate)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cryptoValue" 
                      stackId="1"
                      stroke="#8B5CF6" 
                      strokeWidth={1}
                      fill="url(#colorCrypto)" 
                    />
                    
                    {/* Total value line on top */}
                    <Area 
                      type="monotone" 
                      dataKey="totalValue" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fill="none"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No investments to project</p>
                  <p className="text-sm">Start investing to see expected returns</p>
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Capital Plans</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Real Estate</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Crypto</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-1 bg-blue-500 rounded mr-2" style={{borderStyle: 'dashed'}}></div>
                <span className="text-sm text-gray-700">Total Portfolio</span>
              </div>
            </div>
            
            {/* Projection Summary */}
            {expectedReturnsData.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Current Portfolio</div>
                  <div className="text-xl font-bold text-white">
                    ${portfolioData.totals.totalPortfolioValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">12-Month Projection</div>
                  <div className="text-xl font-bold text-green-600">
                    ${expectedReturnsData[expectedReturnsData.length - 1]?.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Expected Gain</div>
                  <div className="text-xl font-bold text-green-600">
                    +${((expectedReturnsData[expectedReturnsData.length - 1]?.totalValue || 0) - portfolioData.totals.totalPortfolioValue).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'projections' && (
        <div className="space-y-6">
          {/* Expected Returns Projection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Expected Returns (12-Month Projection)
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Projected portfolio growth based on historical returns and investment types. This projection assumes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Crypto Growth</div>
                <div className="text-lg font-bold text-green-600">5% Monthly</div>
                <div className="text-xs text-gray-500">Average market performance</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Capital Plans</div>
                <div className="text-lg font-bold text-green-600">20-60% Monthly</div>
                <div className="text-xs text-gray-500">Based on plan type</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Real Estate</div>
                <div className="text-lg font-bold text-green-600">20-50% Monthly</div>
                <div className="text-xs text-gray-500">Based on property type</div>
              </div>
            </div>
            
            {expectedReturnsData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expectedReturnsData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRealEstate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #16a34a', 
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => {
                        const labels = {
                          totalValue: 'Total Portfolio',
                          capitalValue: 'Capital Plans',
                          realEstateValue: 'Real Estate',
                          cryptoValue: 'Crypto Holdings'
                        };
                        return [`$${value.toLocaleString()}`, labels[name] || name];
                      }}
                    />
                    
                    {/* Stack the areas */}
                    <Area 
                      type="monotone" 
                      dataKey="capitalValue" 
                      stackId="1"
                      stroke="#10B981" 
                      strokeWidth={1}
                      fill="url(#colorCapital)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="realEstateValue" 
                      stackId="1"
                      stroke="#F59E0B" 
                      strokeWidth={1}
                      fill="url(#colorRealEstate)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cryptoValue" 
                      stackId="1"
                      stroke="#8B5CF6" 
                      strokeWidth={1}
                      fill="url(#colorCrypto)" 
                    />
                    
                    {/* Total value line on top */}
                    <Area 
                      type="monotone" 
                      dataKey="totalValue" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fill="none"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No investments to project</p>
                  <p className="text-sm">Start investing to see expected returns</p>
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-6 justify-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Capital Plans</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Real Estate</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Crypto</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-1 bg-blue-500 rounded mr-2" style={{borderStyle: 'dashed'}}></div>
                <span className="text-sm text-gray-700">Total Portfolio</span>
              </div>
            </div>
            
            {/* Projection Summary */}
            {expectedReturnsData.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Current Portfolio</div>
                  <div className="text-xl font-bold text-white">
                    ${portfolioData.totals.totalPortfolioValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">12-Month Projection</div>
                  <div className="text-xl font-bold text-green-600">
                    ${expectedReturnsData[expectedReturnsData.length - 1]?.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Expected Gain</div>
                  <div className="text-xl font-bold text-green-600">
                    +${((expectedReturnsData[expectedReturnsData.length - 1]?.totalValue || 0) - portfolioData.totals.totalPortfolioValue).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Disclaimer */}
            <div className="mt-6 bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <strong className="text-yellow-100">Important Disclaimer:</strong> These projections are estimates based on historical performance and assumed growth rates. Actual returns may vary significantly due to market conditions, economic factors, and investment risks. Past performance does not guarantee future results.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'crypto' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Crypto Holdings
            </h3>
            <p className="text-sm text-gray-600 mt-1">Your cryptocurrency investments and current values</p>
          </div>
          
          {portfolioData.cryptoHoldings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-600 mb-4">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No crypto holdings yet</p>
                <p className="text-sm">Start investing in cryptocurrencies to see your holdings here</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Holdings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Avg Buy Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Invested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {portfolioData.cryptoHoldings.map((holding, index) => (
                    <tr key={index} className="hover:bg-gray-50 border border-gray-200/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-white">{holding.name || holding.coin}</div>
                            <div className="text-xs text-gray-400">{holding.coin}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-mono">
                          {(typeof holding.quantity === 'number') 
                            ? holding.quantity.toFixed(6) 
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-gray-600">{holding.transactions.length} transactions</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">${holding.averagePurchasePrice.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Average purchase</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">${getCurrentPrice(holding.coin).toFixed(2)}</div>
                        <div className="text-xs text-gray-600">
                          {holding.coin === 'EXACOIN' || holding.coin === 'OPTCOIN' ? 'Admin controlled' : 'Market price'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">${Math.round(holding.currentValue).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">${Math.round(holding.totalInvested).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-400'}`}>
                          {holding.profitLoss >= 0 ? '+' : ''}${Math.round(holding.profitLoss).toLocaleString()}
                        </div>
                        <div className={`text-xs ${holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-400'}`}>
                          {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openSellModal(holding)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center shadow-lg transition-colors"
                          >
                            <Minus className="w-3 h-3 mr-1" />
                            Sell
                          </button>
                          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center shadow-lg">
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </button>
                        </div>
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
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Capital Investment Plans
                </h3>
                <p className="text-sm text-gray-600 mt-1">Your active capital growth investments</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioData.capitalPlans.map((plan, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-semibold text-gray-900">{plan.asset_name || plan.plan || plan.name}</div>
                        <div className="text-xs bg-green-500 text-white px-2 py-1 rounded shadow-lg">
                          {plan.monthly_rate || plan.growth_rate || plan.rate}% Monthly
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Invested</span>
                          <span className="text-sm font-medium text-white">${(plan.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Duration</span>
                          <span className="text-sm text-white">{plan.duration_months || plan.months || 'N/A'} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date</span>
                          <span className="text-sm text-white">
                            {(() => {
                              try {
                                const dateValue = plan.created_at || plan.date;
                                if (!dateValue) return 'N/A';
                                return formatDate(dateValue);
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </span>
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
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-500" />
                  Real Estate Investments
                </h3>
                <p className="text-sm text-gray-600 mt-1">Your real estate portfolio</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioData.realEstateInvestments.map((investment, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-semibold text-gray-900">{investment.asset_name || investment.name || 'Real Estate'}</div>
                        <div className="text-xs bg-green-500 text-white px-2 py-1 rounded shadow-lg">
                          {investment.monthly_rate || investment.rate || 'N/A'}% Monthly
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Invested</span>
                          <span className="text-sm font-medium text-white">${(investment.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Duration</span>
                          <span className="text-sm text-white">{investment.duration_months || investment.months || 'N/A'} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date</span>
                          <span className="text-sm text-white">
                            {(() => {
                              try {
                                const dateValue = investment.created_at || investment.date;
                                if (!dateValue) return 'N/A';
                                return formatDate(dateValue);
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {portfolioData.capitalPlans.length === 0 && portfolioData.realEstateInvestments.length === 0 && (
            <div className="bg-white p-12 rounded-lg text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-600 opacity-50" />
              <p className="text-gray-600 mb-2">No investment plans yet</p>
              <p className="text-sm text-gray-500">Start with Capital Plans or Real Estate to see your investments here</p>
            </div>
          )}
        </div>
      )}

      {/* Sell Crypto Modal */}
      {sellModalOpen && selectedHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={closeSellModal} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Sell {selectedHolding.coin}</h3>
                <button 
                  onClick={closeSellModal}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Holdings Info */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <div className="font-semibold text-gray-900">
                        {(typeof selectedHolding.quantity === 'number') 
                          ? `${selectedHolding.quantity.toFixed(6)} ${selectedHolding.coin}` 
                          : `0 ${selectedHolding.coin}`
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Sell Price:</span>
                      <div className="font-semibold text-gray-900">${getSellPrice(selectedHolding.coin).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Sell Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Sell
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.000001"
                      max={selectedHolding.quantity || 0}
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.000000"
                    />
                    <div className="absolute right-3 top-2 text-gray-600 text-sm">
                      {selectedHolding.coin}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => setSellAmount(
                        (typeof selectedHolding.quantity === 'number') 
                          ? (selectedHolding.quantity * 0.25).toFixed(6) 
                          : '0'
                      )}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => setSellAmount(
                        (typeof selectedHolding.quantity === 'number') 
                          ? (selectedHolding.quantity * 0.5).toFixed(6) 
                          : '0'
                      )}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setSellAmount(
                        (typeof selectedHolding.quantity === 'number') 
                          ? (selectedHolding.quantity * 0.75).toFixed(6) 
                          : '0'
                      )}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => setSellAmount(
                        (typeof selectedHolding.quantity === 'number') 
                          ? selectedHolding.quantity.toFixed(6) 
                          : '0'
                      )}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Sell Value Preview */}
                {sellAmount && !isNaN(parseFloat(sellAmount)) && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">You will receive:</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${(parseFloat(sellAmount) * getSellPrice(selectedHolding.coin)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeSellModal}
                    disabled={sellLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSellCrypto}
                    disabled={sellLoading || !sellAmount || parseFloat(sellAmount) <= 0}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sellLoading ? 'Selling...' : 'Confirm Sale'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


