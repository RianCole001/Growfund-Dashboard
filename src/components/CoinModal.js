import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function CoinModal({ coin, onClose, onBuy, onSell, balance = 0 }) {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [days, setDays] = useState(7);
  const [action, setAction] = useState('buy'); // 'buy' or 'sell'
  const [purchaseType, setPurchaseType] = useState('amount'); // 'amount' or 'quantity'
  const [inputValue, setInputValue] = useState('');
  const [calculatedValue, setCalculatedValue] = useState(0);
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
        console.error('Error fetching chart:', e);
      }
      setLoading(false);
    };
    fetchChart();
    return () => { mounted = false; };
  }, [coin, days]);

  // Calculate converted value when input changes
  useEffect(() => {
    const price = metrics.price || 0;
    if (!inputValue || !price) {
      setCalculatedValue(0);
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setCalculatedValue(0);
      return;
    }

    if (purchaseType === 'amount') {
      // Input is USD amount, calculate coins
      setCalculatedValue(value / price);
    } else {
      // Input is coin quantity, calculate USD
      setCalculatedValue(value * price);
    }
  }, [inputValue, purchaseType, metrics.price]);

  if (!coin) return null;

  const execute = () => {
    const value = parseFloat(inputValue || 0);
    setError('');

    if (!value || value <= 0) {
      setError(`Enter a valid ${purchaseType === 'amount' ? 'USD amount' : 'coin quantity'}`);
      return;
    }

    if (action === 'buy') {
      const usdAmount = purchaseType === 'amount' ? value : calculatedValue;
      if (usdAmount > balance) {
        setError(`Insufficient balance. Need $${usdAmount.toFixed(2)}, have $${balance.toFixed(2)}`);
        return;
      }
      if (onBuy) {
        onBuy({
          coin: coin.symbol,
          amount: usdAmount,
          quantity: purchaseType === 'quantity' ? value : calculatedValue,
          name: coin.name,
          price: metrics.price,
        });
        toast.success(`Purchased ${calculatedValue.toFixed(4)} ${coin.symbol} for $${usdAmount.toFixed(2)}`);
        setInputValue('');
      }
    } else {
      if (onSell) {
        const usdAmount = purchaseType === 'amount' ? value : calculatedValue;
        onSell({
          coin: coin.symbol,
          amount: usdAmount,
          quantity: purchaseType === 'quantity' ? value : calculatedValue,
          price: metrics.price,
        });
        toast.success(`Sold ${(purchaseType === 'quantity' ? value : calculatedValue).toFixed(4)} ${coin.symbol} for $${usdAmount.toFixed(2)}`);
        setInputValue('');
      }
    }
  };

  const price = metrics.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-gray-800 w-full md:w-3/5 max-w-4xl p-6 rounded-lg text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <div>
            <div className="text-2xl font-semibold">{coin.name} <span className="text-sm text-gray-300">({coin.symbol})</span></div>
            <div className="text-lg text-blue-400 font-bold mt-1">
              ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">Close</button>
        </div>

        {/* Chart Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-400">Timeframe:</span>
            {[1, 7, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  days === d ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          {loading ? (
            <div className="text-center p-10 text-gray-400">Loading chart...</div>
          ) : chartData.length === 0 ? (
            <div className="text-sm text-gray-300 p-4 bg-gray-700 rounded">No chart data available.</div>
          ) : (
            <div className="h-64 bg-gray-700 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Market Cap</div>
            <div className="text-lg font-semibold mt-1">
              ${metrics.market_cap ? (metrics.market_cap / 1e9).toFixed(2) + 'B' : '—'}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">24h Change</div>
            <div className={`text-lg font-semibold mt-1 ${metrics.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.change24h ? `${metrics.change24h > 0 ? '+' : ''}${metrics.change24h.toFixed(2)}%` : '—'}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Your Balance</div>
            <div className="text-lg font-semibold mt-1 text-green-400">
              ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Trading Section */}
        <div className="bg-gray-700 p-6 rounded-lg">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Action Selector */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">Action</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAction('buy')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    action === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setAction('sell')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    action === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Purchase Type Selector */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">Purchase Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPurchaseType('amount')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    purchaseType === 'amount' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  By USD
                </button>
                <button
                  onClick={() => setPurchaseType('quantity')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    purchaseType === 'quantity' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  By Coins
                </button>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                {purchaseType === 'amount' ? 'USD Amount' : `${coin.symbol} Quantity`}
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                placeholder={purchaseType === 'amount' ? 'Enter USD amount' : 'Enter coin quantity'}
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none transition"
                min="0"
                step={purchaseType === 'amount' ? '0.01' : '0.0001'}
              />
            </div>

            {/* Conversion Display */}
            {inputValue && calculatedValue > 0 && (
              <div className="bg-gray-600 p-4 rounded-lg">
                <div className="text-sm text-gray-300 mb-2">
                  {purchaseType === 'amount' ? 'You will receive' : 'Total USD value'}
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {purchaseType === 'amount'
                    ? `${calculatedValue.toFixed(4)} ${coin.symbol}`
                    : `$${calculatedValue.toFixed(2)}`
                  }
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  @ ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })} per {coin.symbol}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={execute}
              disabled={!inputValue || inputValue <= 0}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                action === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {action === 'buy' ? 'Buy' : 'Sell'} {coin.symbol}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
