import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Clock, Target, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAuthAPI } from '../services/api';

export default function TradingModal({ asset, currentPrice, onClose, balance, onTrade }) {
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const assetName = asset === 'gold' ? 'Gold (GOLD/USD)' : 'USDT (USDT/USD)';
  const totalCost = (parseFloat(quantity) || 0) * currentPrice;
  const canAfford = totalCost <= balance;

  const timeframeOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (tradeType === 'buy' && !canAfford) {
      newErrors.quantity = `Insufficient balance. Need $${totalCost.toFixed(2)}, have $${balance.toFixed(2)}`;
    }

    if (stopLoss && parseFloat(stopLoss) <= 0) {
      newErrors.stopLoss = 'Stop loss must be greater than 0';
    }

    if (takeProfit && parseFloat(takeProfit) <= 0) {
      newErrors.takeProfit = 'Take profit must be greater than 0';
    }

    // Validate stop loss and take profit logic
    if (tradeType === 'buy') {
      if (stopLoss && parseFloat(stopLoss) >= currentPrice) {
        newErrors.stopLoss = 'Stop loss must be below entry price';
      }
      if (takeProfit && parseFloat(takeProfit) <= currentPrice) {
        newErrors.takeProfit = 'Take profit must be above entry price';
      }
    } else {
      if (stopLoss && parseFloat(stopLoss) <= currentPrice) {
        newErrors.stopLoss = 'Stop loss must be above entry price';
      }
      if (takeProfit && parseFloat(takeProfit) >= currentPrice) {
        newErrors.takeProfit = 'Take profit must be below entry price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTrade = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const tradeData = {
        asset: asset,
        trade_type: tradeType,
        entry_price: currentPrice,
        quantity: parseFloat(quantity),
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        take_profit: takeProfit ? parseFloat(takeProfit) : null,
        timeframe: timeframe || null,
      };

      // Call API to create trade
      const response = await userAuthAPI.createTrade(tradeData);

      toast.success(`${tradeType.toUpperCase()} trade opened successfully!`, {
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #10b981',
        },
      });

      if (onTrade) {
        onTrade(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Error creating trade:', error);
      toast.error(error.response?.data?.error || 'Failed to create trade', {
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #ef4444',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const setQuickQuantity = (percentage) => {
    const maxQuantity = (balance / currentPrice) * (percentage / 100);
    setQuantity(maxQuantity.toFixed(4));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              asset === 'gold' ? 'bg-yellow-600' : 'bg-blue-600'
            }`}>
              {asset === 'gold' ? '🥇' : '💵'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{assetName}</h2>
              <p className="text-sm text-gray-400">Current Price: ${currentPrice.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trade Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Trade Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTradeType('buy')}
                className={`py-3 rounded-lg font-bold transition-all ${
                  tradeType === 'buy'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                BUY
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`py-3 rounded-lg font-bold transition-all ${
                  tradeType === 'sell'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <TrendingDown className="w-5 h-5 inline mr-2" />
                SELL
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.0000"
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-lg font-semibold focus:ring-2 focus:outline-none ${
                errors.quantity ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.quantity && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.quantity}
              </p>
            )}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => setQuickQuantity(percent)}
                  className="bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Stop Loss (Optional)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder={tradeType === 'buy' ? 'Below entry price' : 'Above entry price'}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-lg font-semibold focus:ring-2 focus:outline-none ${
                errors.stopLoss ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.stopLoss && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.stopLoss}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {tradeType === 'buy'
                ? 'Price at which trade closes if market goes down'
                : 'Price at which trade closes if market goes up'}
            </p>
          </div>

          {/* Take Profit */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Take Profit (Optional)
            </label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={tradeType === 'buy' ? 'Above entry price' : 'Below entry price'}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-lg font-semibold focus:ring-2 focus:outline-none ${
                errors.takeProfit ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.takeProfit && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.takeProfit}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {tradeType === 'buy'
                ? 'Price at which trade closes if market goes up'
                : 'Price at which trade closes if market goes down'}
            </p>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Trade Duration (Optional)
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">No expiry</option>
              {timeframeOptions.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Trade will automatically close after selected duration
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Entry Price</span>
              <span className="font-semibold">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-600"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quantity</span>
              <span className="font-semibold">{parseFloat(quantity || 0).toFixed(4)}</span>
            </div>
            <div className="h-px bg-gray-600"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Cost</span>
              <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
            <div className="h-px bg-gray-600"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Available Balance</span>
              <span className="font-semibold">${balance.toFixed(2)}</span>
            </div>
            {tradeType === 'buy' && !canAfford && (
              <div className="mt-3 bg-red-900/30 border border-red-600 rounded-lg p-3">
                <div className="text-red-400 text-sm font-semibold">Insufficient Balance</div>
                <div className="text-red-300 text-xs mt-1">
                  You need ${(totalCost - balance).toFixed(2)} more
                </div>
              </div>
            )}
          </div>

          {/* Execute Button */}
          <button
            onClick={handleTrade}
            disabled={loading || !quantity || parseFloat(quantity) <= 0 || (tradeType === 'buy' && !canAfford)}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
              tradeType === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
            }`}
          >
            {loading ? 'Opening Trade...' : `Open ${tradeType.toUpperCase()} Trade`}
          </button>

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong className="text-blue-400">Note:</strong> Your trade will be monitored for stop loss and take profit levels. If either is hit, the trade will automatically close.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
