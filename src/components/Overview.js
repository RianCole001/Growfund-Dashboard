import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { safeParseDate, formatDate } from '../utils/dateUtils';

export default function Overview({ balance, investments, prices, transactions = [], loading = false, onNavigate, userName = 'User' }) {
  const [priceUpdateTrigger, setPriceUpdateTrigger] = useState(0);

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

  const totalInvested = investments.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  // Calculate total profits from all investments
  const calculateTotalProfits = () => {
    let totalCurrentValue = 0;
    
    investments.forEach((inv) => {
      const isCrypto = inv.investment_type === 'crypto' || inv.coin;
      const key = inv.asset_name || inv.coin || inv.asset || inv.name || 'Other';
      const amount = parseFloat(inv.amount) || 0;
      const quantity = parseFloat(inv.quantity) || 0;
      const priceAtPurchase = parseFloat(inv.priceAtPurchase || inv.price_at_purchase) || 0;
      
      if (isCrypto) {
        // Get current price for crypto
        let currentPrice = 0;
        if (key === 'EXACOIN' || key === 'OPTCOIN') {
          const adminPrices = JSON.parse(localStorage.getItem('admin_crypto_prices') || '{}');
          if (adminPrices[key] && adminPrices[key].price) {
            currentPrice = parseFloat(adminPrices[key].price) || 0;
          } else {
            currentPrice = key === 'EXACOIN' ? 62.00 : 85.30;
          }
        } else {
          currentPrice = prices && prices[key] ? parseFloat(prices[key].price) || 0 : 0;
        }
        
        // Calculate current value based on quantity
        if (quantity > 0 && currentPrice > 0) {
          totalCurrentValue += quantity * currentPrice;
        } else if (priceAtPurchase > 0 && amount > 0 && currentPrice > 0) {
          const estimatedQuantity = amount / priceAtPurchase;
          totalCurrentValue += estimatedQuantity * currentPrice;
        } else {
          totalCurrentValue += amount; // Fallback to invested amount
        }
      } else {
        // For non-crypto investments (capital plans, real estate), use invested amount
        // In a real scenario, you'd calculate based on returns/time
        totalCurrentValue += amount;
      }
    });
    
    return totalCurrentValue - totalInvested;
  };

  const totalProfits = calculateTotalProfits();
  const profitPercentage = totalInvested > 0 ? ((totalProfits / totalInvested) * 100) : 0;

  // compute holdings grouped by asset key (coin or asset name)
  const holdingsMap = {};
  investments.forEach((i) => {
    // Handle different data structures (backend demo vs legacy)
    const key = i.asset_name || i.coin || i.asset || i.name || 'Other';
    const investmentName = i.asset_name || i.name || key;
    const isCrypto = i.investment_type === 'crypto' || i.coin;
    
    if (!holdingsMap[key]) {
      holdingsMap[key] = { 
        key, 
        invested: 0, 
        quantity: isCrypto ? 0 : null, // Only crypto has quantity
        latestPrice: 0, 
        name: investmentName, 
        coin: isCrypto ? key : null 
      };
    }
    
    // Ensure proper number conversion
    const amount = parseFloat(i.amount) || 0;
    const quantity = parseFloat(i.quantity) || 0;
    const priceAtPurchase = parseFloat(i.priceAtPurchase || i.price_at_purchase) || 0;
    
    holdingsMap[key].invested += amount;
    
    // Only add quantity for crypto investments
    if (isCrypto && quantity > 0) {
      if (holdingsMap[key].quantity === null) {
        holdingsMap[key].quantity = 0; // Convert null to 0 for crypto
      }
      holdingsMap[key].quantity += quantity;
    } else if (isCrypto && priceAtPurchase > 0 && amount > 0) {
      // Fallback: calculate quantity from amount and price at purchase
      if (holdingsMap[key].quantity === null) {
        holdingsMap[key].quantity = 0; // Convert null to 0 for crypto
      }
      holdingsMap[key].quantity += (amount / priceAtPurchase);
    } else if (isCrypto && amount > 0 && !quantity && !priceAtPurchase) {
      // Last resort: try to get current price to estimate quantity
      // This is for legacy data that might not have quantity or purchase price
      const currentPrice = prices && prices[key] ? parseFloat(prices[key].price) : 0;
      if (currentPrice > 0) {
        if (holdingsMap[key].quantity === null) {
          holdingsMap[key].quantity = 0;
        }
        // Use current price as estimate (not ideal but better than nothing)
        holdingsMap[key].quantity += (amount / currentPrice);
      }
    }
  });

  // attach latest prices and compute current values
  const holdings = Object.values(holdingsMap).map((h) => {
    let latest = 0;
    
    // Get current price - use admin price for EXACOIN and OPTCOIN if available
    if (h.coin === 'EXACOIN' || h.coin === 'OPTCOIN') {
      const adminPrices = JSON.parse(localStorage.getItem('admin_crypto_prices') || '{}');
      if (adminPrices[h.coin] && adminPrices[h.coin].price) {
        latest = parseFloat(adminPrices[h.coin].price) || 0;
      } else {
        // Fallback prices for admin-controlled coins
        if (h.coin === 'EXACOIN') latest = 62.00;
        if (h.coin === 'OPTCOIN') latest = 85.30;
      }
    } else {
      latest = h.coin && prices && prices[h.coin] ? parseFloat(prices[h.coin].price) || 0 : 0;
    }
    
    // For crypto: use quantity * latest price, for others: use invested amount
    const currentValue = (h.coin && h.quantity !== null && latest > 0) ? h.quantity * latest : h.invested;
    const roi = h.invested > 0 ? ((currentValue - h.invested) / h.invested) * 100 : 0;
    return { ...h, latest, currentValue, roi };
  }).sort((a, b) => b.currentValue - a.currentValue);

  // const currentCryptoValue = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
  // const totalPortfolio = balance + currentCryptoValue;
  // const totalProfit = currentCryptoValue - totalInvested;

  // const allocation = (() => {
  //   const map = {};
  //   investments.forEach((i) => {
  //     const key = i.plan === 'Real Estate' || i.asset ? 'Real Estate' : (i.coin ? 'Crypto' : 'Other');
  //     map[key] = (map[key] || 0) + (i.amount || 0);
  //   });
  //   return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  // })();

  const areaData = investments
    .slice()
    .reverse()
    .reduce((arr, inv) => {
      const d = formatDate(inv.created_at || inv.date);
      const last = arr.length ? arr[arr.length - 1].value : 0;
      const amount = parseFloat(inv.amount) || 0;
      arr.push({ date: d, value: last + amount });
      return arr;
    }, []);

  // const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Calculate portfolio change for periods using price change percentages
  // const portfolioChange = (periodKey) => {
  //   // periodKey is 'change24h' | 'change7d' | 'change30d'
  //   let prevTotal = 0;
  //   let currentTotal = 0;
  //   holdings.forEach((h) => {
  //     if (!h.coin) return; // skip non-crypto assets
  //     const p = prices && prices[h.coin] ? prices[h.coin] : null;
  //     const pct = p && p[periodKey] ? p[periodKey] : undefined;
  //     if (pct === undefined || pct === null) return;
  //     const latest = p.price;
  //     const prevPrice = latest / (1 + pct / 100);
  //     const prevValue = (h.quantity || 0) * prevPrice;
  //     const currValue = (h.quantity || 0) * latest;
  //     prevTotal += prevValue;
  //     currentTotal += currValue;
  //   });
  //   const diff = currentTotal - prevTotal;
  //   const pct = prevTotal ? ((diff / prevTotal) * 100) : 0;
  //   return { amount: diff, pct };
  // };

  // const ch24 = portfolioChange('change24h');
  // const ch7 = portfolioChange('change7d');
  // const ch30 = portfolioChange('change30d');

  // compute top movers from prices (global market list)
  const movers = Object.keys(prices || {}).map((k) => ({ symbol: k, price: prices[k].price, change24h: prices[k].change24h, change7d: prices[k].change7d, change30d: prices[k].change30d }));

  const [timeframe, setTimeframe] = useState('24h');
  const periodKey = timeframe === '24h' ? 'change24h' : timeframe === '7d' ? 'change7d' : 'change30d';

  const topGainers = movers.filter(m => m[periodKey] !== undefined).sort((a,b) => (b[periodKey]||0) - (a[periodKey]||0)).slice(0,5);
  // const topLosers = movers.filter(m => m[periodKey] !== undefined).sort((a,b) => (a[periodKey]||0) - (b[periodKey]||0)).slice(0,5);

  const balanceTransactions = transactions.filter(t => t.type === 'Deposit' || t.type === 'Withdraw').slice(0,5);

  if (typeof loading !== 'undefined' && loading) {
    // lightweight skeletons when loading
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 p-4 rounded-lg animate-pulse h-20" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-gray-200 p-4 rounded-lg h-64 animate-pulse" />
          <div className="bg-white border border-gray-200 p-4 rounded-lg h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {userName}!</h1>
        <p className="text-sm text-gray-600">Here's an overview of your portfolio journey</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-lg text-white">
          <div className="text-xs text-green-100 font-medium flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Investments
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1">{investments.length || 0}</div>
          <div className="text-xs text-green-100 mt-1">${Math.round(totalInvested).toLocaleString()}</div>
        </div>

        <div className="bg-white border border-gray-200 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-md">
          <div className="text-xs text-gray-600 font-medium flex items-center">
            <svg className="w-3 h-3 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            Balance
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">${Math.round(balance).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Available</div>
        </div>

        <div className="bg-white border border-gray-200 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-md">
          <div className="text-xs text-gray-600 font-medium flex items-center">
            <svg className={`w-3 h-3 mr-1 ${totalProfits >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
              {totalProfits >= 0 ? (
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
              ) : (
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd"/>
              )}
            </svg>
            Profits
          </div>
          <div className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 ${totalProfits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfits >= 0 ? '+' : ''}${Math.round(totalProfits).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalProfits >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-md">
          <div className="text-xs text-gray-600 font-medium flex items-center">
            <svg className="w-3 h-3 mr-1 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            Portfolio
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
            ${Math.round(totalInvested + totalProfits).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Value</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Recent Investments
          </h3>
          {transactions.length === 0 ? (
            <div className="text-sm text-gray-500">No recent investments.</div>
          ) : (
            <ul className="space-y-3">
              {transactions.slice(0, 6).map((t, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-all">
                  <div>
                    <div className="font-semibold text-gray-900">{t.asset || t.coin || t.type}</div>
                    <div className="text-xs text-gray-500">{formatDate(t.created_at || t.date)}</div>
                  </div>
                  <div className={`text-sm font-bold ${t.type === 'Withdraw' ? 'text-orange-600' : t.type === 'Deposit' ? 'text-green-600' : 'text-blue-600'}`}>${(t.amount || 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            Balance Details
          </h3>
          {balanceTransactions.length === 0 ? (
            <div className="text-sm text-green-100">No recent balance activity</div>
          ) : (
            <ul className="space-y-3 text-sm">
              {balanceTransactions.map((t, i) => (
                <li key={i} className="flex justify-between items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 p-3 rounded-lg border border-white/20 transition-all">
                  <div>
                    <div className="font-semibold text-white">{t.type}</div>
                    <div className="text-xs text-green-100">{formatDate(t.created_at || t.date)}</div>
                  </div>
                  <div className={`font-bold ${t.type === 'Withdraw' ? 'text-orange-200' : 'text-white'}`}>${(t.amount || 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <button onClick={() => (typeof onNavigate === 'function' ? onNavigate('Deposits') : null)} className="w-full bg-white hover:bg-green-50 text-green-600 px-4 py-3 rounded-lg font-bold transition-all shadow-md">
              💰 Deposit Funds
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Portfolio Growth
          </h3>
          {areaData.length === 0 ? (
            <div className="text-sm text-gray-500">No investment history yet.</div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={areaData}>
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #16a34a', borderRadius: '8px', color: '#111827' }} />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-sm font-bold mb-3 text-gray-700">Holdings Overview</h4>
            {holdings.length === 0 ? (
              <div className="text-sm text-gray-500">No holdings yet.</div>
            ) : (
              <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="text-left bg-gray-100">
                    <tr>
                      <th className="p-3 font-bold text-gray-700">Asset</th>
                      <th className="p-3 font-bold text-gray-700">Qty</th>
                      <th className="p-3 font-bold text-gray-700">Value</th>
                      <th className="p-3 font-bold text-gray-700">Invested</th>
                      <th className="p-3 font-bold text-gray-700">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr key={i} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                        <td className="p-3 text-gray-900 font-medium">{h.name} {h.coin ? <span className="text-xs text-gray-500">({h.coin})</span> : null}</td>
                        <td className="p-3 text-gray-700">
                          {(h.quantity !== null && h.quantity !== undefined && typeof h.quantity === 'number') ? h.quantity.toFixed(4) : '-'}
                        </td>
                        <td className="p-3 text-gray-900 font-bold">${Math.round(h.currentValue).toLocaleString()}</td>
                        <td className="p-3 text-gray-600">${Math.round(h.invested).toLocaleString()}</td>
                        <td className={`p-3 font-bold ${h.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{h.roi ? `${h.roi.toFixed(2)}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Top Movers ({timeframe})
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div className="space-x-2">
              <button className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === '24h' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setTimeframe('24h')}>24h</button>
              <button className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === '7d' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setTimeframe('7d')}>7d</button>
              <button className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === '30d' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setTimeframe('30d')}>30d</button>
            </div>
          </div>
          {topGainers.length === 0 ? (
            <div className="text-sm text-gray-500">No market data available.</div>
          ) : (
            <div className="space-y-3">
              {topGainers.map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-200 transition-all">
                  <div>
                    <div className="font-bold text-gray-900">{m.symbol}</div>
                    <div className="text-xs text-gray-600">${(m.price || 0).toLocaleString()}</div>
                  </div>
                  <div className={`font-bold text-lg ${m[periodKey] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m[periodKey] >= 0 ? '📈' : '📉'} {m[periodKey] ? `${m[periodKey].toFixed(2)}%` : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
