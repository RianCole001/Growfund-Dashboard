import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, Clock, Target, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAuthAPI } from '../services/api';

export default function OpenTrades({ onRefresh }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingTradeId, setClosingTradeId] = useState(null);
  const [closePrice, setClosePrice] = useState('');

  useEffect(() => {
    fetchOpenTrades();
    // Refresh every 5 seconds to update prices
    const interval = setInterval(fetchOpenTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOpenTrades = async () => {
    try {
      const response = await userAuthAPI.getOpenTrades();
      setTrades(response.data || []);
    } catch (error) {
      console.error('Error fetching open trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTrade = async (tradeId, currentPrice) => {
    if (!closePrice || parseFloat(closePrice) <= 0) {
      toast.error('Please enter a valid close price', {
        duration: 2000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #ef4444',
        },
      });
      return;
    }

    try {
      setClosingTradeId(tradeId);
      await userAuthAPI.closeTrade(tradeId, {
        exit_price: parseFloat(closePrice),
        close_reason: 'manual',
      });

      toast.success('Trade closed successfully', {
        duration: 2000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #10b981',
        },
      });

      setClosePrice('');
      setClosingTradeId(null);
      fetchOpenTrades();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error closing trade:', error);
      toast.error('Failed to close trade', {
        duration: 2000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #ef4444',
        },
      });
      setClosingTradeId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">No open trades</p>
        <p className="text-sm text-gray-500 mt-1">Open a trade to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
        Open Trades ({trades.length})
      </h3>

      <div className="space-y-3">
        {trades.map((trade) => {
          const isPositive = trade.profit_loss >= 0;
          const isExpired = trade.status === 'expired';
          const isClosed = trade.status !== 'open';

          return (
            <div
              key={trade.id}
              className={`bg-gray-700 rounded-lg p-4 border ${
                isExpired ? 'border-yellow-600' : 'border-gray-600'
              } hover:bg-gray-600 transition-colors`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Asset & Type */}
                <div>
                  <div className="text-xs text-gray-400 mb-1">Asset</div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                      trade.asset === 'gold' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`}>
                      {trade.asset === 'gold' ? '🥇' : '💵'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{trade.asset.toUpperCase()}</div>
                      <div className={`text-xs font-bold ${
                        trade.trade_type === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.trade_type === 'buy' ? '↑ BUY' : '↓ SELL'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prices */}
                <div>
                  <div className="text-xs text-gray-400 mb-1">Entry / Current</div>
                  <div className="font-semibold text-white">
                    ${trade.entry_price.toFixed(2)} / ${trade.current_price?.toFixed(2) || trade.entry_price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Qty: {parseFloat(trade.quantity).toFixed(4)}
                  </div>
                </div>

                {/* P&L */}
                <div>
                  <div className="text-xs text-gray-400 mb-1">Profit/Loss</div>
                  <div className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ${trade.profit_loss.toFixed(2)}
                  </div>
                  <div className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{trade.profit_loss_percentage.toFixed(2)}%
                  </div>
                </div>

                {/* Risk Management */}
                <div className="space-y-2">
                  {trade.stop_loss && (
                    <div className="flex items-center text-xs">
                      <Shield className="w-3 h-3 mr-1 text-red-400" />
                      <span className="text-gray-400">SL: ${trade.stop_loss.toFixed(2)}</span>
                    </div>
                  )}
                  {trade.take_profit && (
                    <div className="flex items-center text-xs">
                      <Target className="w-3 h-3 mr-1 text-green-400" />
                      <span className="text-gray-400">TP: ${trade.take_profit.toFixed(2)}</span>
                    </div>
                  )}
                  {trade.timeframe && (
                    <div className="flex items-center text-xs">
                      <Clock className="w-3 h-3 mr-1 text-blue-400" />
                      <span className="text-gray-400">{trade.timeframe}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Trade Section */}
              {!isClosed && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={closingTradeId === trade.id ? closePrice : ''}
                      onChange={(e) => setClosePrice(e.target.value)}
                      placeholder="Close price"
                      className="flex-1 bg-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={closingTradeId !== null && closingTradeId !== trade.id}
                    />
                    <button
                      onClick={() => handleCloseTrade(trade.id, trade.current_price)}
                      disabled={closingTradeId !== null && closingTradeId !== trade.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {closingTradeId === trade.id ? 'Closing...' : 'Close'}
                    </button>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {isClosed && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    trade.status === 'expired' ? 'bg-yellow-600 text-white' :
                    trade.status === 'stop_loss_hit' ? 'bg-red-600 text-white' :
                    trade.status === 'take_profit_hit' ? 'bg-green-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {trade.status === 'expired' ? '⏱️ Expired' :
                     trade.status === 'stop_loss_hit' ? '🛑 Stop Loss' :
                     trade.status === 'take_profit_hit' ? '✓ Take Profit' :
                     'Closed'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
