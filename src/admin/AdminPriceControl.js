import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Settings, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPriceControl() {
  const [prices, setPrices] = useState({
    EXACOIN: {
      price: 60.00,
      change24h: 0,
      lastUpdated: new Date().toISOString(),
      sellPrice: 58.00 // Admin controlled sell price (slightly lower than buy price)
    }
  });
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newSellPrice, setNewSellPrice] = useState('');

  useEffect(() => {
    loadCurrentPrices();
  }, []);

  const loadCurrentPrices = async () => {
    try {
      setLoading(true);
      // In real app, this would fetch from backend
      // For now, load from localStorage or use default
      const savedPrices = localStorage.getItem('admin_crypto_prices');
      if (savedPrices) {
        setPrices(JSON.parse(savedPrices));
      }
    } catch (error) {
      console.error('Error loading prices:', error);
      toast.error('Failed to load current prices');
    } finally {
      setLoading(false);
    }
  };

  const startEditPrice = (coin) => {
    setEditingPrice(coin);
    setNewPrice(prices[coin].price.toString());
    setNewSellPrice(prices[coin].sellPrice.toString());
  };

  const cancelEdit = () => {
    setEditingPrice(null);
    setNewPrice('');
    setNewSellPrice('');
  };

  const savePrice = async (coin) => {
    try {
      const buyPrice = parseFloat(newPrice);
      const sellPrice = parseFloat(newSellPrice);

      if (isNaN(buyPrice) || buyPrice <= 0) {
        toast.error('Please enter a valid buy price');
        return;
      }

      if (isNaN(sellPrice) || sellPrice <= 0) {
        toast.error('Please enter a valid sell price');
        return;
      }

      if (sellPrice >= buyPrice) {
        toast.error('Sell price should be lower than buy price');
        return;
      }

      const oldPrice = prices[coin].price;
      const change24h = ((buyPrice - oldPrice) / oldPrice) * 100;

      const updatedPrices = {
        ...prices,
        [coin]: {
          ...prices[coin],
          price: buyPrice,
          sellPrice: sellPrice,
          change24h: change24h,
          lastUpdated: new Date().toISOString()
        }
      };

      setPrices(updatedPrices);
      
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('admin_crypto_prices', JSON.stringify(updatedPrices));
      
      // Also update the global prices for the frontend
      localStorage.setItem('crypto_prices', JSON.stringify({
        [coin]: {
          price: buyPrice,
          change24h: change24h,
          change7d: prices[coin].change7d || 0,
          change30d: prices[coin].change30d || 0
        }
      }));

      setEditingPrice(null);
      setNewPrice('');
      setNewSellPrice('');
      
      toast.success(`${coin} price updated successfully!`);
    } catch (error) {
      console.error('Error saving price:', error);
      toast.error('Failed to update price');
    }
  };

  const resetToMarketPrice = async (coin) => {
    if (window.confirm(`Reset ${coin} to market price? This will fetch the current market rate.`)) {
      try {
        // In real app, this would fetch from CoinGecko or other API
        // For demo, we'll just set a reasonable price
        const marketPrice = coin === 'EXACOIN' ? 62.50 : 60.00;
        const sellPrice = marketPrice * 0.97; // 3% lower for sell price
        
        const updatedPrices = {
          ...prices,
          [coin]: {
            ...prices[coin],
            price: marketPrice,
            sellPrice: sellPrice,
            change24h: ((marketPrice - prices[coin].price) / prices[coin].price) * 100,
            lastUpdated: new Date().toISOString()
          }
        };

        setPrices(updatedPrices);
        localStorage.setItem('admin_crypto_prices', JSON.stringify(updatedPrices));
        
        toast.success(`${coin} price reset to market rate`);
      } catch (error) {
        console.error('Error resetting price:', error);
        toast.error('Failed to reset price');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Price Control</h2>
          <p className="text-sm text-gray-400 mt-1">Manage cryptocurrency buy and sell prices</p>
        </div>
        <button 
          onClick={loadCurrentPrices}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Price Control Cards */}
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(prices).map(([coin, data]) => (
          <div key={coin} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{coin}</h3>
                    <p className="text-sm text-gray-400">ExaCoin - Platform Token</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">Last Updated</div>
                  <div className="text-sm text-gray-300">
                    {new Date(data.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </div>

              {editingPrice === coin ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Buy Price (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter buy price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sell Price (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSellPrice}
                        onChange={(e) => setNewSellPrice(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter sell price"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => savePrice(coin)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="text-xs text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-600/30">
                    <strong>Note:</strong> Sell price should be lower than buy price to ensure platform profitability. 
                    Current spread: ${(parseFloat(newPrice || 0) - parseFloat(newSellPrice || 0)).toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Buy Price</span>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        ${data.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Users purchase at this price
                      </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Sell Price</span>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        ${data.sellPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Users sell at this price
                      </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Spread</span>
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        ${(data.price - data.sellPrice).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Platform profit per coin
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => startEditPrice(coin)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Prices
                    </button>
                    <button
                      onClick={() => resetToMarketPrice(coin)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset to Market
                    </button>
                  </div>

                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm font-medium text-green-400">Price Impact</span>
                    </div>
                    <div className="text-xs text-green-300">
                      24h Change: <span className={`font-semibold ${data.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      This price will be visible to all users immediately
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-600/30">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Price Control Instructions</h3>
        <div className="space-y-2 text-sm text-blue-200">
          <p>• <strong>Buy Price:</strong> The price at which users can purchase the cryptocurrency</p>
          <p>• <strong>Sell Price:</strong> The price at which users can sell their holdings back to the platform</p>
          <p>• <strong>Spread:</strong> The difference between buy and sell prices (platform profit)</p>
          <p>• <strong>Recommended Spread:</strong> 3-5% to ensure platform profitability while remaining competitive</p>
          <p>• <strong>Price Updates:</strong> Changes take effect immediately for all users</p>
        </div>
      </div>
    </div>
  );
}