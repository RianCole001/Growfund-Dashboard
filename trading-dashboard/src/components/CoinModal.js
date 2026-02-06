import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CoinModal({ coin, onClose, onBuy, onSell, balance = 0 }) {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [days, setDays] = useState(7);
  const [action, setAction] = useState('buy'); // 'buy' or 'sell'
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchChart = async () => {
      if (!coin) return;
      setLoading(true);
      try {
        const coingecko = require('../utils/coingecko').default;
        const data = await coingecko.fetchCoinMarketChart(coin.symbol, days);
        if (!mounted) return;
        const points = (data.prices || []).map((p) => ({ date: new Date(p[0]).toLocaleDateString(), price: p[1] }));
        setChartData(points);
        setMetrics({
          price: data.current_price || (data.prices && data.prices.length ? data.prices[data.prices.length - 1][1] : undefined),
          market_cap: data.market_cap || undefined,
          change24h: data.change24h || undefined,
        });
      } catch (e) {
        // ignore
      }
      setLoading(false);
    };
    fetchChart();
    return () => { mounted = false; };
  }, [coin, days]);

  if (!coin) return null;

  const execute = () => {
    const amt = Number(amount || 0);
    setError('');
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (action === 'buy' && amt > balance) { setError('Insufficient balance for buy'); return; }
    if (action === 'buy') {
      if (onBuy) onBuy({ coin: coin.symbol, amount: amt, name: coin.name });
    } else {
      if (onSell) onSell({ coin: coin.symbol, amount: amt });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-gray-800 w-11/12 md:w-3/5 max-w-3xl p-4 rounded-lg text-white">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-lg font-semibold">{coin.name} <span className="text-sm text-gray-300">({coin.symbol})</span></div>
            <div className="text-sm text-gray-400">Price: ${metrics.price ? metrics.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="bg-gray-700 px-3 py-1 rounded">Close</button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`px-2 py-1 rounded ${days === 1 ? 'bg-blue-600' : 'bg-gray-700'} cursor-pointer`} onClick={() => setDays(1)}>1d</div>
            <div className={`px-2 py-1 rounded ${days === 7 ? 'bg-blue-600' : 'bg-gray-700'} cursor-pointer`} onClick={() => setDays(7)}>7d</div>
            <div className={`px-2 py-1 rounded ${days === 30 ? 'bg-blue-600' : 'bg-gray-700'} cursor-pointer`} onClick={() => setDays(30)}>30d</div>
          </div>
          {loading ? (
            <div className="text-center p-10">Loading chart...</div>
          ) : chartData.length === 0 ? (
            <div className="text-sm text-gray-300">No chart data available.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-300">Market Cap</div>
            <div className="font-medium">${metrics.market_cap ? metrics.market_cap.toLocaleString() : '—'}</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-300">24h Change</div>
            <div className={`font-medium ${metrics.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{metrics.change24h ? `${metrics.change24h.toFixed(2)}%` : '—'}</div>
          </div>

          <div className="bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-300">Quick Actions</div>
            <div className="mt-1 space-y-2">
              <div className="flex items-center space-x-2">
                <label className={`px-2 py-1 rounded cursor-pointer ${action === 'buy' ? 'bg-blue-600' : 'bg-gray-600'}`} onClick={() => setAction('buy')}>Buy</label>
                <label className={`px-2 py-1 rounded cursor-pointer ${action === 'sell' ? 'bg-yellow-500' : 'bg-gray-600'}`} onClick={() => setAction('sell')}>Sell</label>
              </div>
              <div className="flex items-center space-x-2">
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" placeholder="Amount USD" className="bg-gray-600 px-2 py-1 rounded text-black w-32" />
                <button onClick={execute} className="bg-green-600 px-3 py-1 rounded">Execute</button>
              </div>
              <div className="text-xs text-red-400 mt-1">{error}</div>
              <div className="text-xs text-gray-400 mt-1">Balance: ${balance.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
