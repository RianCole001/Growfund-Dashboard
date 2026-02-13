import React, { useState } from 'react';
import GoldChart from './GoldChart';
import TradingModal from './TradingModal';
import OpenTrades from './OpenTrades';
import TradeHistory from './TradeHistory';
import USDTChart from './USDTChart';

export default function TradeNow({ balance = 0, onTrade }) {
  const [selectedAsset, setSelectedAsset] = useState('gold');
  const [tradingModalOpen, setTradingModalOpen] = useState(false);
  const [showOpenTrades, setShowOpenTrades] = useState(false);
  const [showTradeHistory, setShowTradeHistory] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">Trade Now</h2>
          <p className="text-sm text-gray-400 mt-1">Execute market orders with advanced risk management</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Available Balance</div>
          <div className="text-lg sm:text-xl font-bold text-green-400">${balance.toLocaleString()}</div>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedAsset('gold')}
          className={`flex-1 py-3 rounded-lg font-bold transition-all ${
            selectedAsset === 'gold'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          🥇 Gold Trading
        </button>
        <button
          onClick={() => setSelectedAsset('usdt')}
          className={`flex-1 py-3 rounded-lg font-bold transition-all ${
            selectedAsset === 'usdt'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          💵 USDT Trading
        </button>
      </div>

      {/* Charts Section */}
      {selectedAsset === 'gold' ? (
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">Live Gold Market</h3>
          <GoldChart />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Live USDT Market</h3>
          <USDTChart />
        </div>
      )}

      {/* Quick Trade Button */}
      <button
        onClick={() => setTradingModalOpen(true)}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
          selectedAsset === 'gold'
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Open {selectedAsset === 'gold' ? 'Gold' : 'USDT'} Trade
      </button>

      {/* Trading Modal */}
      {tradingModalOpen && (
        <TradingModal
          asset={selectedAsset}
          currentPrice={selectedAsset === 'gold' ? 2050 : 1.0}
          onClose={() => setTradingModalOpen(false)}
          balance={balance}
          onTrade={() => {
            setTradingModalOpen(false);
            setShowOpenTrades(true);
          }}
        />
      )}

      {/* Open Trades Section */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-4">
        <button
          onClick={() => setShowOpenTrades(!showOpenTrades)}
          className="w-full text-left font-semibold text-white hover:text-blue-400 transition-colors mb-4"
        >
          {showOpenTrades ? '▼' : '▶'} Open Trades
        </button>
        {showOpenTrades && <OpenTrades onRefresh={() => {}} />}
      </div>

      {/* Trade History Section */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-4">
        <button
          onClick={() => setShowTradeHistory(!showTradeHistory)}
          className="w-full text-left font-semibold text-white hover:text-blue-400 transition-colors mb-4"
        >
          {showTradeHistory ? '▼' : '▶'} Trade History
        </button>
        {showTradeHistory && <TradeHistory />}
      </div>
    </div>
  );
}
