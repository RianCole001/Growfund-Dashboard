import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview({ balance, investments, prices, transactions = [], loading = false, onNavigate, userName = 'User', profile = {} }) {
  const [profilePct, setProfilePct] = useState(0);
  const [profileData, setProfileData] = useState({});

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profileToUse = null) => {
    const dataToCheck = profileToUse || profile || {};
    setProfileData(dataToCheck);
    
    const profileFields = ['name', 'email', 'phone', 'location', 'occupation', 'company', 'website', 'bio', 'avatar'];
    const profileFilled = profileFields.reduce((s, k) => {
      const value = dataToCheck && dataToCheck[k];
      // Count as filled if it's not empty, not null, not undefined, and not just whitespace
      return s + (value && value.toString().trim() ? 1 : 0);
    }, 0);
    const pct = Math.round((profileFilled / profileFields.length) * 100);
    setProfilePct(pct);
  };

  // Recalculate when profile prop changes
  useEffect(() => {
    calculateProfileCompletion(profile);
  }, [profile]);

  // Listen for custom profile update event
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event && event.detail) {
        calculateProfileCompletion(event.detail);
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const totalInvested = investments.reduce((s, i) => s + (i.amount || 0), 0);

  // compute holdings grouped by asset key (coin or asset name)
  const holdingsMap = {};
  investments.forEach((i) => {
    const key = i.coin ? i.coin : (i.asset || i.name || 'Other');
    holdingsMap[key] = holdingsMap[key] || { key, invested: 0, quantity: 0, latestPrice: 0, name: i.name || key, coin: i.coin };
    holdingsMap[key].invested += (i.amount || 0);
    if (i.quantity) holdingsMap[key].quantity += i.quantity;
    else if (i.priceAtPurchase && i.amount) holdingsMap[key].quantity += (i.amount / i.priceAtPurchase);
  });

  // attach latest prices and compute current values
  const holdings = Object.values(holdingsMap).map((h) => {
    const latest = h.coin && prices && prices[h.coin] ? prices[h.coin].price : undefined;
    const currentValue = h.quantity && latest ? h.quantity * latest : h.invested;
    const roi = h.invested ? ((currentValue - h.invested) / h.invested) * 100 : 0;
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
      const d = new Date(inv.date).toLocaleDateString();
      const last = arr.length ? arr[arr.length - 1].value : 0;
      arr.push({ date: d, value: last + (inv.amount || 0) });
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
            <div key={i} className="bg-gray-800 p-4 rounded-lg animate-pulse h-20" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg h-64 animate-pulse" />
          <div className="bg-gray-800 p-4 rounded-lg h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-500">Welcome Back, {userName}!</h1>
        <p className="text-sm text-gray-400">Here's an overview of your portfolio journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-4 rounded-lg shadow-lg text-white">
          <div className="text-sm text-emerald-100 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Investments
          </div>
          <div className="text-3xl font-bold text-white">{investments.length || 0}</div>
          <div className="text-xs text-emerald-100 mt-2">${Math.round(totalInvested).toLocaleString()} invested • {investments.length} positions</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4 rounded-lg shadow-lg text-white">
          <div className="text-sm text-blue-100 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            Balance
          </div>
          <div className="text-3xl font-bold text-white">${Math.round(balance).toLocaleString()}</div>
          <div className="text-xs text-blue-100 mt-2">Available • Updated</div>
        </div>

        <div role="button" tabIndex={0} onClick={() => (typeof onNavigate === 'function' ? onNavigate('Profile', { openEdit: true }) : null)} className="bg-gradient-to-br from-orange-400 via-pink-500 to-red-600 p-4 rounded-lg shadow-lg text-white flex items-center justify-between cursor-pointer hover:from-orange-500 hover:via-pink-600 hover:to-red-700 transition-all transform hover:scale-105">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden mr-3 border-2 border-white/30">
              {profileData && profileData.avatar ? (
                <img src={profileData.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">{(profileData && profileData.name) ? profileData.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'JD'}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-orange-100 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                Profile
              </div>
              <div className="text-3xl font-bold text-white">{profilePct}%</div>
            </div>
          </div>
          <div>
            <button onClick={(e) => { e.stopPropagation(); if (typeof onNavigate === 'function') onNavigate('Profile', { openEdit: true }); }} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium transition-all border border-white/30">Edit</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 border border-gray-700 p-6 rounded-xl shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-green-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Recent Investments
          </h3>
          {transactions.length === 0 ? (
            <div className="text-sm text-gray-400">No recent investments.</div>
          ) : (
            <ul className="space-y-3">
              {transactions.slice(0, 6).map((t, i) => (
                <li key={i} className="flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 p-4 rounded-lg border border-gray-600 transition-all transform hover:scale-[1.02]">
                  <div>
                    <div className="font-semibold text-white">{t.asset || t.coin || t.type}</div>
                    <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`text-sm font-bold ${t.type === 'Withdraw' ? 'text-amber-400' : t.type === 'Deposit' ? 'text-green-400' : 'text-blue-400'}`}>${(t.amount || 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 p-6 rounded-xl shadow-xl text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            Balance Details
          </h3>
          {balanceTransactions.length === 0 ? (
            <div className="text-sm text-indigo-100">No recent balance activity</div>
          ) : (
            <ul className="space-y-3 text-sm">
              {balanceTransactions.map((t, i) => (
                <li key={i} className="flex justify-between items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 p-3 rounded-lg border border-white/20 transition-all">
                  <div>
                    <div className="font-semibold text-white">{t.type}</div>
                    <div className="text-xs text-indigo-200">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`font-bold ${t.type === 'Withdraw' ? 'text-amber-300' : 'text-green-300'}`}>${(t.amount || 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <button onClick={() => (typeof onNavigate === 'function' ? onNavigate('Deposits') : null)} className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 px-4 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg text-white">
              💰 Deposit Funds
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-800 p-6 rounded-xl shadow-xl text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Portfolio Growth
          </h3>
          {areaData.length === 0 ? (
            <div className="text-sm text-cyan-100">No investment history yet.</div>
          ) : (
            <div className="h-64 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={areaData}>
                  <XAxis dataKey="date" stroke="#ffffff" />
                  <YAxis stroke="#ffffff" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2', borderRadius: '8px', color: '#ffffff' }} />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-sm font-bold mb-3 text-cyan-100">Holdings Overview</h4>
            {holdings.length === 0 ? (
              <div className="text-sm text-cyan-200">No holdings yet.</div>
            ) : (
              <div className="overflow-x-auto bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <table className="w-full text-sm">
                  <thead className="text-left bg-white/20">
                    <tr>
                      <th className="p-3 font-bold text-cyan-100">Asset</th>
                      <th className="p-3 font-bold text-cyan-100">Qty</th>
                      <th className="p-3 font-bold text-cyan-100">Value</th>
                      <th className="p-3 font-bold text-cyan-100">Invested</th>
                      <th className="p-3 font-bold text-cyan-100">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                        <td className="p-3 text-white font-medium">{h.name} {h.coin ? <span className="text-xs text-cyan-200">({h.coin})</span> : null}</td>
                        <td className="p-3 text-cyan-100">{h.quantity ? h.quantity.toFixed(4) : '-'}</td>
                        <td className="p-3 text-white font-bold">${Math.round(h.currentValue).toLocaleString()}</td>
                        <td className="p-3 text-cyan-200">${Math.round(h.invested).toLocaleString()}</td>
                        <td className={`p-3 font-bold ${h.roi >= 0 ? 'text-green-300' : 'text-red-300'}`}>{h.roi ? `${h.roi.toFixed(2)}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-6 rounded-xl shadow-xl text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Top Movers ({timeframe})
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div className="space-x-2">
              <button className={`px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${timeframe === '24h' ? 'bg-white text-orange-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`} onClick={() => setTimeframe('24h')}>24h</button>
              <button className={`px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${timeframe === '7d' ? 'bg-white text-orange-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`} onClick={() => setTimeframe('7d')}>7d</button>
              <button className={`px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${timeframe === '30d' ? 'bg-white text-orange-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`} onClick={() => setTimeframe('30d')}>30d</button>
            </div>
          </div>
          {topGainers.length === 0 ? (
            <div className="text-sm text-orange-100">No market data available.</div>
          ) : (
            <div className="space-y-3">
              {topGainers.map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 p-3 rounded-lg border border-white/20 transition-all transform hover:scale-[1.02]">
                  <div>
                    <div className="font-bold text-white">{m.symbol}</div>
                    <div className="text-xs text-orange-200">${(m.price || 0).toLocaleString()}</div>
                  </div>
                  <div className={`font-bold text-lg ${m[periodKey] >= 0 ? 'text-green-300' : 'text-red-300'}`}>
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
