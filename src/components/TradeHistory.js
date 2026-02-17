import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import { userAuthAPI } from '../services/api';

export default function TradeHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTradeHistory();
  }, []);

  const fetchTradeHistory = async () => {
    try {
      const response = await userAuthAPI.getTradeHistory();
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(trade => trade.close_reason === filter);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">No trade history</p>
        <p className="text-sm text-gray-500 mt-1">Your closed trades will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-400" />
          Trade History ({filteredHistory.length})
        </h3>
        <div className="flex space-x-2">
          {['all', 'manual', 'stop_loss', 'take_profit', 'expired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Asset</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Type</th>
              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Entry</th>
              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Exit</th>
              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Qty</th>
              <th className="text-right py-3 px-4 text-gray-400 font-semibold">P&L</th>
              <th className="text-right py-3 px-4 text-gray-400 font-semibold">%</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Reason</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Closed</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((trade) => {
              const profitLoss = parseFloat(trade.profit_loss || 0);
              const isProfit = profitLoss >= 0;
              const closeReasonLabel = {
                'manual': '👤 Manual',
                'stop_loss': '🛑 Stop Loss',
                'take_profit': '✓ Take Profit',
                'expired': '⏱️ Expired',
              }[trade.close_reason] || trade.close_reason;

              return (
                <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                        trade.asset === 'gold' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}>
                        {trade.asset === 'gold' ? '🥇' : '💵'}
                      </div>
                      <span className="font-semibold text-white">{trade.asset.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-1 font-semibold ${
                      trade.trade_type === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.trade_type === 'buy' ? (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          <span>BUY</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          <span>SELL</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    ${parseFloat(trade.entry_price || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    ${parseFloat(trade.exit_price || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {parseFloat(trade.quantity || 0).toFixed(4)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${
                    isProfit ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${
                    isProfit ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isProfit ? '+' : ''}{parseFloat(trade.profit_loss_percentage || 0).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {closeReasonLabel}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {new Date(trade.closed_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
