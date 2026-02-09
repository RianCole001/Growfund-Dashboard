import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from 'lucide-react';

// Generate realistic candlestick data
function generateCandlestickData(periods = 50, basePrice = 100) {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  
  for (let i = periods; i >= 0; i--) {
    const date = new Date(now - i * 60 * 1000); // 1 minute intervals
    const volatility = 0.008;
    
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = open * (1 + change);
    
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    
    const volume = Math.random() * 1000000 + 500000;
    
    data.push({
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.round(volume),
      timestamp: date.getTime(),
      isGreen: close >= open
    });
    
    price = close;
  }
  
  return data;
}

export default function TradeNow({ balance = 0, onTrade }) {
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [timeframe, setTimeframe] = useState('1H');
  const [chartType, setChartType] = useState('line');
  const [liveData, setLiveData] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef(null);

  // Initialize market data
  const initialData = useMemo(() => {
    const periods = timeframe === '15M' ? 30 : timeframe === '1H' ? 60 : timeframe === '4H' ? 80 : 100;
    return generateCandlestickData(periods);
  }, [timeframe]);

  // Set initial data
  useEffect(() => {
    setLiveData(initialData);
  }, [initialData]);

  // Live price updates
  useEffect(() => {
    if (!isLive) return;

    intervalRef.current = setInterval(() => {
      setLiveData((prevData) => {
        if (prevData.length === 0) return prevData;

        const lastCandle = prevData[prevData.length - 1];
        const volatility = 0.008;
        const change = (Math.random() - 0.48) * volatility;
        
        const open = lastCandle.close;
        const close = open * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
        const volume = Math.random() * 1000000 + 500000;
        
        const now = new Date();
        const newCandle = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume: Math.round(volume),
          timestamp: now.getTime(),
          isGreen: close >= open
        };

        const maxPoints = timeframe === '15M' ? 30 : timeframe === '1H' ? 60 : timeframe === '4H' ? 80 : 100;
        const newData = [...prevData, newCandle];
        
        if (newData.length > maxPoints) {
          return newData.slice(newData.length - maxPoints);
        }
        
        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, timeframe]);

  const marketData = liveData;

  const currentPrice = marketData[marketData.length - 1]?.close || 100;
  const previousPrice = marketData[marketData.length - 2]?.close || 100;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  // Calculate session stats
  const sessionHigh = Math.max(...marketData.map(d => d.high));
  const sessionLow = Math.min(...marketData.map(d => d.low));
  const sessionOpen = marketData[0]?.open || currentPrice;
  const sessionChange = ((currentPrice - sessionOpen) / sessionOpen) * 100;

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (tradeType === 'buy' && parseFloat(amount) > balance) {
      alert('Insufficient balance');
      return;
    }

    const tradeData = {
      type: tradeType,
      amount: parseFloat(amount),
      price: currentPrice,
      date: new Date().toISOString(),
      name: 'Market Trade'
    };

    if (onTrade) {
      onTrade(tradeData);
    }

    setAmount('');
    alert(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${amount} at market price`);
  };

  const setQuickAmount = (percentage) => {
    const quickAmount = (balance * percentage / 100).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">Trade Now</h2>
          <p className="text-sm text-gray-400 mt-1">Execute market orders instantly</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Available Balance</div>
          <div className="text-lg sm:text-xl font-bold text-green-400">${balance.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Market Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg shadow-lg border border-gray-800">
          {/* TradingView-style Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold">MARKET/USD</h3>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{timeframe}</span>
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
                  <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {isPositive ? '+' : ''}{sessionChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType(chartType === 'candlestick' ? 'line' : 'candlestick')}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                title={chartType === 'candlestick' ? 'Switch to Line' : 'Switch to Candlestick'}
              >
                {chartType === 'candlestick' ? <Activity className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center space-x-1 px-3 py-2 rounded font-semibold text-xs transition-all ${
                  isLive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></div>
                <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
              </button>
            </div>
          </div>

          {/* Market Stats Bar */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800/50 border-b border-gray-800 text-xs">
            <div>
              <div className="text-gray-500 mb-1">Open</div>
              <div className="font-semibold">${sessionOpen.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">High</div>
              <div className="font-semibold text-green-400">${sessionHigh.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Low</div>
              <div className="font-semibold text-red-400">${sessionLow.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Close</div>
              <div className="font-semibold">${currentPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex space-x-1">
              {['15M', '1H', '4H', '1D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'candlestick' ? (
                  <ComposedChart data={marketData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6B7280" 
                      style={{ fontSize: '11px' }}
                      interval="preserveStartEnd"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      yAxisId="price"
                      stroke="#6B7280" 
                      style={{ fontSize: '11px' }}
                      domain={['auto', 'auto']}
                      tick={{ fill: '#9CA3AF' }}
                      orientation="right"
                    />
                    <YAxis 
                      yAxisId="volume"
                      orientation="left"
                      stroke="#6B7280"
                      style={{ fontSize: '11px' }}
                      tick={{ fill: '#9CA3AF' }}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      labelStyle={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '8px' }}
                      itemStyle={{ color: '#F3F4F6', fontSize: '12px', fontWeight: '600' }}
                      formatter={(value, name) => {
                        if (name === 'volume') return [value.toLocaleString(), 'Volume'];
                        return [`$${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)];
                      }}
                    />
                    <Bar 
                      yAxisId="volume"
                      dataKey="volume" 
                      fill="url(#volumeGradient)" 
                      opacity={0.3}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="high"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="low"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="close"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                ) : (
                  <AreaChart data={marketData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6B7280" 
                      style={{ fontSize: '11px' }}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      style={{ fontSize: '11px' }}
                      tick={{ fill: '#9CA3AF' }}
                      orientation="right"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '1px solid #374151', 
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke={isPositive ? "#10B981" : "#EF4444"} 
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                      dot={false}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trading Panel - Takes 1 column */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Place Order</h3>
          
          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setTradeType('buy')}
              className={`py-3 rounded-lg font-bold transition-all ${
                tradeType === 'buy'
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`py-3 rounded-lg font-bold transition-all ${
                tradeType === 'sell'
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => setQuickAmount(percent)}
                className="bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Order Type</span>
              <span className={`font-bold ${tradeType === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {tradeType.toUpperCase()}
              </span>
            </div>
            <div className="h-px bg-gray-600"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Market Price</span>
              <span className="font-semibold">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-600"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Amount</span>
              <span className="font-bold text-lg">${amount || '0.00'}</span>
            </div>
            <div className="h-px bg-gray-600"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Balance After</span>
              <span className="font-semibold">
                ${tradeType === 'buy' 
                  ? (balance - (parseFloat(amount) || 0)).toFixed(2)
                  : (balance + (parseFloat(amount) || 0)).toFixed(2)
                }
              </span>
            </div>
          </div>

          {/* Warning for insufficient balance */}
          {tradeType === 'buy' && amount && parseFloat(amount) > balance && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
              <div className="text-red-400 text-sm font-semibold">Insufficient Balance</div>
              <div className="text-red-300 text-xs mt-1">
                You need ${(parseFloat(amount) - balance).toFixed(2)} more
              </div>
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleTrade}
            disabled={!amount || parseFloat(amount) <= 0 || (tradeType === 'buy' && parseFloat(amount) > balance)}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
              tradeType === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
            }`}
          >
            {tradeType === 'buy' ? 'Execute Buy Order' : 'Execute Sell Order'}
          </button>

          {/* Info Text */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Orders are executed at current market price
          </div>
        </div>
      </div>
    </div>
  );
}
