import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';

const coins = [
  { symbol: 'EXACOIN', name: 'ExaCoin', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.png', isHot: true },
  { symbol: 'OPTCOIN', name: 'OptCoin', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png', isHot: false },
  { symbol: 'BTC', name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'BNB', name: 'Binance Coin', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
  { symbol: 'ADA', name: 'Cardano', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
  { symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'DOT', name: 'Polkadot', icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
  { symbol: 'USDT', name: 'Tether', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
];

function makeSparkline(price) {
  const base = price || 100;
  const res = Array.from({ length: 10 }).map((_, i) => ({ v: Math.max(0.1, base * (1 + (Math.sin(i) * 0.02) + (Math.random() - 0.5) * 0.01)) }));
  return res;
}

export default function CryptoInvestment({ onSelectCoin, prices = {}, loading = false, onViewCoin }) {
  const [localPrices, setLocalPrices] = useState(prices);

  // Listen for admin price changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'admin_crypto_prices') {
        // Force re-render when admin prices change
        setLocalPrices({...prices});
      }
    };

    // Listen for localStorage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events from same tab (when admin updates prices)
    const handleAdminPriceUpdate = () => {
      setLocalPrices({...prices});
    };
    
    window.addEventListener('adminPriceUpdate', handleAdminPriceUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminPriceUpdate', handleAdminPriceUpdate);
    };
  }, [prices]);

  // Update local prices when props change
  useEffect(() => {
    setLocalPrices(prices);
  }, [prices]);

  // Get admin-controlled price for EXACOIN and OPTCOIN
  const getDisplayPrice = (symbol) => {
    if (symbol === 'EXACOIN' || symbol === 'OPTCOIN') {
      const adminPrices = JSON.parse(localStorage.getItem('admin_crypto_prices') || '{}');
      if (adminPrices[symbol] && adminPrices[symbol].price) {
        return parseFloat(adminPrices[symbol].price) || 0;
      }
      // Fallback prices for admin-controlled coins
      if (symbol === 'EXACOIN') return 62.00;
      if (symbol === 'OPTCOIN') return 85.30;
    }
    return localPrices[symbol]?.price || 0;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-400">Crypto Market</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 bg-gray-700 rounded-lg animate-pulse h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-white">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-green-500">Crypto Market</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Live cryptocurrency prices</p>
        </div>
        <div className="flex items-center text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Live
        </div>
      </div>

      {/* Desktop/Tablet View */}
      <div className="hidden md:block">
        <ul className="space-y-2">
          {coins.map((c) => {
            const market = localPrices[c.symbol] || {};
            const price = getDisplayPrice(c.symbol); // Use admin price for EXACOIN
            const change = market.change24h || 0;
            const spark = makeSparkline(price);
            const isPositive = change >= 0;
            
            return (
              <li key={c.symbol} className={`flex justify-between items-center p-4 rounded-lg hover:bg-gray-600 transition-colors relative ${
                c.isHot ? 'bg-gradient-to-r from-orange-900/30 to-gray-700 border-2 border-orange-500' : 'bg-gray-700'
              }`}>
                {c.isHot && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    🔥 HOT
                  </div>
                )}
                <div className="flex items-center space-x-4 flex-1">
                  <img 
                    src={c.icon} 
                    alt={c.name} 
                    className="w-10 h-10 rounded-full bg-white p-1"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="w-20">
                    <div className="font-semibold text-lg">{c.symbol}</div>
                    <div className="text-xs text-gray-400">{c.name}</div>
                  </div>
                  <div className="w-32 hidden lg:block">
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={spark}>
                        <Line type="monotone" dataKey="v" stroke={isPositive ? "#10B981" : "#EF4444"} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-lg">${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={`text-sm flex items-center justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {change ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '0.00%'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onSelectCoin({...c, price})} 
                      className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-lg"
                    >
                      Invest
                    </button>
                    <button 
                      onClick={() => onViewCoin && onViewCoin({...c, price})} 
                      className="bg-gray-600 p-2 rounded-lg hover:bg-gray-500 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile View - Card Grid */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {coins.map((c) => {
          const market = localPrices[c.symbol] || {};
          const price = getDisplayPrice(c.symbol); // Use admin price for EXACOIN
          const change = market.change24h || 0;
          const isPositive = change >= 0;
          
          return (
            <div key={c.symbol} className={`rounded-lg p-4 hover:bg-gray-600 transition-colors relative ${
              c.isHot ? 'bg-gradient-to-br from-orange-900/30 to-gray-700 border-2 border-orange-500' : 'bg-gray-700'
            }`}>
              {c.isHot && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  🔥 HOT
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src={c.icon} 
                    alt={c.name} 
                    className="w-10 h-10 rounded-full bg-white p-1"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <div className="font-semibold text-lg">{c.symbol}</div>
                    <div className="text-xs text-gray-400">{c.name}</div>
                  </div>
                </div>
                <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {change ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '0.00%'}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-2xl font-bold">${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => onSelectCoin({...c, price})} 
                  className="flex-1 bg-green-500 px-3 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-lg"
                >
                  Invest
                </button>
                <button 
                  onClick={() => onViewCoin && onViewCoin({...c, price})} 
                  className="bg-gray-600 p-2 rounded-lg hover:bg-gray-500 transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
