import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview({ balance, investments, prices, transactions = [], loading = false, onNavigate }) {
  const totalInvested = investments.reduce((s, i) => s + (i.amount || 0), 0);
  const storage = require('../utils/storage').default;
  const profileData = storage.get('profile', {});
  const profileFields = ['name','email','phone','location','occupation','company','website','bio','avatar'];
  const profileFilled = profileFields.reduce((s, k) => s + (profileData[k] ? 1 : 0), 0);
  const profilePct = Math.round((profileFilled / profileFields.length) * 100);

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

  const currentCryptoValue = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
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
  const portfolioChange = (periodKey) => {
    // periodKey is 'change24h' | 'change7d' | 'change30d'
    let prevTotal = 0;
    let currentTotal = 0;
    holdings.forEach((h) => {
      if (!h.coin) return; // skip non-crypto assets
      const p = prices && prices[h.coin] ? prices[h.coin] : null;
      const pct = p && p[periodKey] ? p[periodKey] : undefined;
      if (pct === undefined || pct === null) return;
      const latest = p.price;
      const prevPrice = latest / (1 + pct / 100);
      const prevValue = (h.quantity || 0) * prevPrice;
      const currValue = (h.quantity || 0) * latest;
      prevTotal += prevValue;
      currentTotal += currValue;
    });
    const diff = currentTotal - prevTotal;
    const pct = prevTotal ? ((diff / prevTotal) * 100) : 0;
    return { amount: diff, pct };
  };

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
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-sm text-gray-400">Here's an overview of your portfolio journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-300">Investments</div>
          <div className="text-2xl font-bold">{investments.length || 0}</div>
          <div className="text-xs text-gray-400 mt-2">${Math.round(totalInvested).toLocaleString()} invested • {investments.length} positions</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-300">Balance</div>
          <div className="text-2xl font-bold">${Math.round(balance).toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">Available • Updated</div>
        </div>

        <div role="button" tabIndex={0} onClick={() => (typeof onNavigate === 'function' ? onNavigate('Profile', { openEdit: true }) : null)} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-3">
              {profileData && profileData.avatar ? (
                <img src={profileData.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{(profileData && profileData.name) ? profileData.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'JD'}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-300">Profile</div>
              <div className="text-2xl font-bold">{profilePct}%</div>
            </div>
          </div>
          <div>
            <button onClick={(e) => { e.stopPropagation(); if (typeof onNavigate === 'function') onNavigate('Profile', { openEdit: true }); }} className="bg-gray-700 px-3 py-1 rounded text-sm">Edit</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3 text-blue-400">Recent Investments</h3>
          {transactions.length === 0 ? (
            <div className="text-sm text-gray-300">No recent investments.</div>
          ) : (
            <ul className="space-y-2">
              {transactions.slice(0, 6).map((t, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                  <div>
                    <div className="font-medium">{t.asset || t.coin || t.type}</div>
                    <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`text-sm ${t.type === 'Withdraw' ? 'text-yellow-300' : t.type === 'Deposit' ? 'text-green-300' : 'text-white'}`}>${(t.amount || 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3 text-blue-400">Balance Details</h3>
          {balanceTransactions.length === 0 ? (
            <div className="text-sm text-gray-300">No recent balance activity</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {balanceTransactions.map((t, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <div>
                    <div className="font-medium">{t.type}</div>
                    <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`font-medium ${t.type === 'Withdraw' ? 'text-yellow-300' : 'text-green-300'}`}>${(t.amount || 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <button onClick={() => (typeof onNavigate === 'function' ? onNavigate('Deposits') : null)} className="w-full bg-green-600 px-3 py-2 rounded">Deposit</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3 text-blue-400">Portfolio Growth</h3>
          {areaData.length === 0 ? (
            <div className="text-sm text-gray-300">No investment history yet.</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={areaData}>
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4">
            <h4 className="text-sm text-gray-300 mb-2">Holdings</h4>
            {holdings.length === 0 ? (
              <div className="text-sm text-gray-300">No holdings yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-400">
                    <tr>
                      <th className="p-2">Asset</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Current Value</th>
                      <th className="p-2">Invested</th>
                      <th className="p-2">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr key={i} className="odd:bg-gray-700 even:bg-gray-600">
                        <td className="p-2">{h.name} {h.coin ? <span className="text-xs text-gray-400">({h.coin})</span> : null}</td>
                        <td className="p-2">{h.quantity ? h.quantity.toFixed(4) : '-'}</td>
                        <td className="p-2">${Math.round(h.currentValue).toLocaleString()}</td>
                        <td className="p-2">${Math.round(h.invested).toLocaleString()}</td>
                        <td className={`p-2 ${h.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{h.roi ? `${h.roi.toFixed(2)}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg h-full">
          <h3 className="text-md font-semibold mb-3 text-blue-400">Top Movers ({timeframe})</h3>
          <div className="flex items-center justify-between mb-2">
            <div className="space-x-2">
              <button className={`px-2 py-1 rounded ${timeframe === '24h' ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => setTimeframe('24h')}>24h</button>
              <button className={`px-2 py-1 rounded ${timeframe === '7d' ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => setTimeframe('7d')}>7d</button>
              <button className={`px-2 py-1 rounded ${timeframe === '30d' ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => setTimeframe('30d')}>30d</button>
            </div>
          </div>
          {topGainers.length === 0 ? (
            <div className="text-sm text-gray-300">No market data available.</div>
          ) : (
            <div className="space-y-2">
              {topGainers.map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <div>
                    <div className="font-medium">{m.symbol}</div>
                    <div className="text-xs text-gray-400">${(m.price || 0).toLocaleString()}</div>
                  </div>
                  <div className={`font-medium ${m[periodKey] >= 0 ? 'text-green-400' : 'text-red-400'}`}>{m[periodKey] ? `${m[periodKey].toFixed(2)}%` : '—'}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
