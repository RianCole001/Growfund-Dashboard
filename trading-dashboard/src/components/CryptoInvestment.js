import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const coins = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64444 },
  { symbol: 'ETH', name: 'Ethereum', price: 3200 },
  { symbol: 'BNB', name: 'Binance Coin', price: 420 },
  { symbol: 'ADA', name: 'Cardano', price: 1.25 },
  { symbol: 'SOL', name: 'Solana', price: 120 },
  { symbol: 'DOT', name: 'Polkadot', price: 6.4 },
];

function makeSparkline(price) {
  const base = price || 100;
  const res = Array.from({ length: 10 }).map((_, i) => ({ v: Math.max(0.1, base * (1 + (Math.sin(i) * 0.02) + (Math.random() - 0.5) * 0.01)) }));
  return res;
}

export default function CryptoInvestment({ onSelectCoin, prices = {}, loading = false, onViewCoin }) {
  if (loading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Crypto Market</h2>
        <ul className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex justify-between items-center p-3 bg-gray-700 rounded animate-pulse" style={{ height: 56 }} />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Crypto Market</h2>
      <ul className="space-y-2">
        {coins.map((c) => {
          const market = prices[c.symbol] || {};
          const price = market.price || c.price;
          const change = market.change24h;
          const spark = makeSparkline(price);
          return (
            <li key={c.symbol} className="flex justify-between items-center p-3 bg-gray-700 rounded hover:bg-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-12">
                  <div className="font-medium">{c.symbol}</div>
                  <div className="text-xs text-gray-400">{c.name}</div>
                </div>
                <div className="w-28">
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={spark}>
                      <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{change ? `${change.toFixed(2)}%` : ''}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => onSelectCoin(c)} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Invest</button>
                  <button onClick={() => onViewCoin && onViewCoin(c)} className="bg-gray-600 px-2 py-1 rounded">View</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
