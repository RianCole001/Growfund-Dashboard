import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Settings, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAuthAPI } from '../services/api';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

export default function AdminPriceControl() {
  const [prices, setPrices] = useState({
    EXACOIN: { price: 60.00, change24h: 0, lastUpdated: new Date().toISOString(), sellPrice: 58.00 }
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
      const response = await adminAuthAPI.getCryptoPrices();
      if (response.data.success && response.data.data) {
        const pricesData = {};
        Object.entries(response.data.data).forEach(([coin, data]) => {
          pricesData[coin] = {
            id: data.id, price: parseFloat(data.buy_price), change24h: parseFloat(data.change_24h),
            lastUpdated: data.last_updated, sellPrice: parseFloat(data.sell_price),
            name: data.name, isActive: data.is_active,
            isAdminControlled: data.is_admin_controlled || coin === 'EXACOIN',
          };
        });
        setPrices(pricesData);
      }
    } catch { toast.error('Failed to load prices'); }
    finally { setLoading(false); }
  };

  const startEdit = (coin) => { setEditingPrice(coin); setNewPrice(prices[coin].price.toString()); setNewSellPrice(prices[coin].sellPrice.toString()); };
  const cancelEdit = () => { setEditingPrice(null); setNewPrice(''); setNewSellPrice(''); };

  const savePrice = async (coin) => {
    try {
      const buyPrice = parseFloat(newPrice);
      const sellPrice = parseFloat(newSellPrice);
      if (isNaN(sellPrice) || sellPrice <= 0) { toast.error('Invalid sell price'); return; }
      if (coin === 'EXACOIN') {
        if (isNaN(buyPrice) || buyPrice <= 0) { toast.error('Invalid buy price'); return; }
        if (sellPrice >= buyPrice) { toast.error('Sell price must be lower than buy price'); return; }
      }
      const oldPrice = prices[coin].price;
      const change24h = buyPrice ? ((buyPrice - oldPrice) / oldPrice) * 100 : 0;
      const requestData = { coin, sell_price: sellPrice };
      if (coin === 'EXACOIN' || buyPrice) { requestData.buy_price = buyPrice; requestData.change24h = change24h; }
      const response = await adminAuthAPI.updateCryptoPrice(requestData);
      if (response.data.success) {
        const updated = { ...prices, [coin]: { ...prices[coin], price: response.data.data.buy_price || prices[coin].price, sellPrice: response.data.data.sell_price, change24h: response.data.data.change24h || prices[coin].change24h, lastUpdated: response.data.data.updated_at } };
        setPrices(updated);
        toast.success(`${coin} price updated`);
      }
      cancelEdit();
    } catch { toast.error('Failed to update price'); }
  };

  const resetToMarket = async (coin) => {
    if (!window.confirm(`Reset ${coin} to market price?`)) return;
    const marketPrice = coin === 'EXACOIN' ? 62.50 : 60.00;
    const sellPrice = marketPrice * 0.97;
    const updated = { ...prices, [coin]: { ...prices[coin], price: marketPrice, sellPrice, change24h: ((marketPrice - prices[coin].price) / prices[coin].price) * 100, lastUpdated: new Date().toISOString() } };
    setPrices(updated);
    toast.success(`${coin} reset to market rate`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Price Control</h2>
          <p className="text-sm text-gray-500 mt-1">Manage cryptocurrency buy and sell prices</p>
        </div>
        <button onClick={loadCurrentPrices} disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(prices).map(([coin, data]) => (
          <div key={coin} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{coin}</h3>
                    <p className="text-xs text-gray-500">{data.name || coin} · {data.isAdminControlled ? 'Admin Controlled' : 'Market + Admin Sell'}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Updated: {new Date(data.lastUpdated).toLocaleString()}</div>
              </div>

              {editingPrice === coin ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(coin === 'EXACOIN' || data.isAdminControlled) && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Buy Price (USD)</label>
                        <input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Buy price" className={inputCls} />
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">Sell Price (USD)</label>
                      <input type="number" step="0.01" value={newSellPrice} onChange={(e) => setNewSellPrice(e.target.value)} placeholder="Sell price" className={inputCls} />
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-700">
                    Spread: ${(parseFloat(newPrice || 0) - parseFloat(newSellPrice || 0)).toFixed(2)} — keep sell price lower than buy price.
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => savePrice(coin)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={cancelEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Buy Price</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-xl font-bold text-gray-900">${data.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 mt-1">{data.isAdminControlled ? 'Admin set' : 'Live market'}</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Sell Price</span>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-xl font-bold text-gray-900">${data.sellPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 mt-1">Users sell at this</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Spread</span>
                        <DollarSign className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="text-xl font-bold text-gray-900">${(data.price - data.sellPrice).toFixed(2)}</div>
                      <div className="text-xs text-gray-400 mt-1">Platform profit/coin</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => startEdit(coin)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Settings className="w-4 h-4" /> Edit Prices
                    </button>
                    <button onClick={() => resetToMarket(coin)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      <RefreshCw className="w-4 h-4" /> Reset to Market
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${data.isActive ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    {data.isActive ? 'Active' : 'Inactive'} ·
                    24h: <span className={data.change24h >= 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                      {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 rounded-xl border border-green-200 p-5">
        <h3 className="font-semibold text-green-800 mb-3 text-sm">Price Control Guide</h3>
        <ul className="space-y-1.5 text-xs text-green-700">
          <li>• EXACOIN: Full admin control — set both buy and sell prices</li>
          <li>• Other coins: Buy price from live market, admin sets sell price only</li>
          <li>• Recommended spread: 3–5% for platform profitability</li>
          <li>• Price changes take effect immediately for all users</li>
        </ul>
      </div>
    </div>
  );
}
