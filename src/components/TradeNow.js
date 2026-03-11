import React, { useState, useEffect, useRef, useReducer } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, Settings, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { binaryOptionsAPI } from '../services/api';

// Trade reducer for state management
const tradeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TRADES':
      return { ...state, activeTrades: action.payload };
    case 'ADD_TRADE':
      return {
        ...state,
        activeTrades: [...state.activeTrades, action.payload],
        tradeHistory: state.tradeHistory
      };
    case 'UPDATE_TRADE':
      return {
        ...state,
        activeTrades: state.activeTrades.map(trade =>
          trade.id === action.payload.id ? { ...trade, ...action.payload.updates } : trade
        )
      };
    case 'CLOSE_TRADE':
      const closedTrade = state.activeTrades.find(t => t.id === action.payload.id);
      return {
        ...state,
        activeTrades: state.activeTrades.filter(t => t.id !== action.payload.id),
        tradeHistory: closedTrade ? [{ ...closedTrade, ...action.payload.result }, ...state.tradeHistory] : state.tradeHistory
      };
    case 'SET_HISTORY':
      return { ...state, tradeHistory: action.payload };
    case 'UPDATE_PRICE':
      return { ...state, currentPrice: action.payload };
    case 'ADD_PRICE_POINT':
      return { ...state, priceHistory: [...state.priceHistory, action.payload].slice(-300) };
    default:
      return state;
  }
};

export default function TradeNow({ balance: initialBalance = 10000, onTrade, onBalanceUpdate }) {
  // State management
  const [tradeState, dispatch] = useReducer(tradeReducer, {
    activeTrades: [],
    tradeHistory: [],
    currentPrice: 75.50,
    priceHistory: []
  });

  const [selectedAsset, setSelectedAsset] = useState('OIL');
  const [tradeAmount, setTradeAmount] = useState(10);
  const [expiryTime, setExpiryTime] = useState(60); // seconds
  const [oneClickTrade, setOneClickTrade] = useState(false);
  const [activeTab, setActiveTab] = useState('open'); // 'open' or 'history'
  const [currentBalance, setCurrentBalance] = useState(initialBalance);
  const [assets, setAssets] = useState([]);
  const [prices, setPrices] = useState({});
  const [isDemo, setIsDemo] = useState(true); // Demo mode by default
  
  const canvasRef = useRef(null);

  // Fallback assets if API fails
  const fallbackAssets = [
    { symbol: 'OIL', name: 'Crude Oil', volatility: 0.02 },
    { symbol: 'GOLD', name: 'Gold', volatility: 0.015 },
    { symbol: 'EUR/USD', name: 'Euro/Dollar', volatility: 0.01 },
    { symbol: 'BTC', name: 'Bitcoin', volatility: 0.03 }
  ];

  const currentAsset = assets.find(a => a.symbol === selectedAsset) || fallbackAssets.find(a => a.symbol === selectedAsset) || fallbackAssets[0];

  // Expiry time options
  const expiryOptions = [
    { label: '15s', value: 15 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '15m', value: 900 },
    { label: '30m', value: 1800 },
    { label: '1h', value: 3600 }
  ];

  // Fetch assets on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await binaryOptionsAPI.getAssets();
        if (response.data.success && response.data.assets) {
          setAssets(response.data.assets);
          if (response.data.assets.length > 0) {
            setSelectedAsset(response.data.assets[0].symbol);
          }
        }
      } catch (error) {
        console.error('Failed to fetch assets, using fallback:', error);
        setAssets(fallbackAssets);
      }
    };
    fetchAssets();
  }, []);

  // Fetch balances on mount
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await binaryOptionsAPI.getUserStats();
        if (response.data.success) {
          // Update balance based on mode
          const balance = isDemo ? response.data.demo_balance : response.data.real_balance;
          setCurrentBalance(balance || initialBalance);
        }
      } catch (error) {
        console.warn('Failed to fetch balances from backend, using initial balance:', error);
        // Use initial balance as fallback
        setCurrentBalance(initialBalance);
      }
    };
    fetchBalances();
  }, [isDemo, initialBalance]);

  // Fetch prices continuously - NEVER STOP
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await binaryOptionsAPI.getAllPrices();
        if (response.data.success && response.data.prices) {
          setPrices(response.data.prices);
          
          // Update current price for selected asset
          if (response.data.prices[selectedAsset]) {
            const newPrice = parseFloat(response.data.prices[selectedAsset].price);
            dispatch({ type: 'UPDATE_PRICE', payload: newPrice });
            dispatch({ type: 'ADD_PRICE_POINT', payload: { time: Date.now(), price: newPrice } });
          }
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        // Fallback to mock prices if API fails
        generateMockPrice();
      }
    };

    // Generate mock price as fallback
    const generateMockPrice = () => {
      const lastPrice = tradeState.currentPrice;
      const volatility = currentAsset.volatility || 0.02;
      const change = (Math.random() - 0.5) * volatility;
      const newPrice = parseFloat((lastPrice + change).toFixed(2));
      
      dispatch({ type: 'UPDATE_PRICE', payload: newPrice });
      dispatch({ type: 'ADD_PRICE_POINT', payload: { time: Date.now(), price: newPrice } });
    };

    // Initial fetch
    fetchPrices();

    // Poll every 1 second - INDEPENDENT OF TRADES
    const priceInterval = setInterval(fetchPrices, 1000);

    return () => clearInterval(priceInterval);
  }, [selectedAsset, currentAsset.volatility, tradeState.currentPrice]);

  // Fetch active trades periodically
  useEffect(() => {
    const fetchActiveTrades = async () => {
      try {
        const response = await binaryOptionsAPI.getActiveTrades({ is_demo: isDemo });
        if (response.data.success && response.data.trades) {
          // Transform backend trades to match local format
          const transformedTrades = response.data.trades.map(trade => ({
            id: trade.id,
            asset: trade.asset?.symbol || trade.asset_symbol,
            direction: trade.direction,
            amount: parseFloat(trade.amount),
            strikePrice: parseFloat(trade.strike_price),
            expiryTime: new Date(trade.expires_at).getTime(),
            timeLeft: new Date(trade.expires_at).getTime() - Date.now(),
            status: trade.status,
            createdAt: new Date(trade.created_at).getTime()
          }));
          dispatch({ type: 'SET_ACTIVE_TRADES', payload: transformedTrades });
        }
      } catch (error) {
        // Silently fail - keep local trades
        console.warn('Failed to fetch active trades from backend:', error.message);
      }
    };

    fetchActiveTrades();
    const tradesInterval = setInterval(fetchActiveTrades, 5000); // Increased to 5s to reduce errors

    return () => clearInterval(tradesInterval);
  }, [isDemo]);

  // Fetch trade history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await binaryOptionsAPI.getTradeHistory({ limit: 20, is_demo: isDemo });
        if (response.data.success && response.data.results) {
          const transformedHistory = response.data.results.map(trade => ({
            id: trade.id,
            asset: trade.asset?.symbol || trade.asset_symbol,
            direction: trade.direction,
            amount: parseFloat(trade.amount),
            strikePrice: parseFloat(trade.strike_price),
            finalPrice: parseFloat(trade.final_price),
            profit: parseFloat(trade.profit),
            status: trade.status,
            closedAt: new Date(trade.closed_at).getTime()
          }));
          dispatch({ type: 'SET_HISTORY', payload: transformedHistory });
        }
      } catch (error) {
        // Silently fail - keep local history
        console.warn('Failed to fetch trade history from backend:', error.message);
      }
    };
    fetchHistory();
  }, [isDemo]);

  // Initialize price history with current price
  useEffect(() => {
    if (tradeState.priceHistory.length === 0) {
      let price = tradeState.currentPrice;
      const history = [];
      for (let i = 0; i < 100; i++) {
        price += (Math.random() - 0.5) * (currentAsset.volatility || 0.02);
        history.push({ time: Date.now() - (100 - i) * 1000, price: parseFloat(price.toFixed(2)) });
      }
      history.forEach(point => {
        dispatch({ type: 'ADD_PRICE_POINT', payload: point });
      });
    }
  }, [selectedAsset, currentAsset.volatility, tradeState.priceHistory.length, tradeState.currentPrice]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || tradeState.priceHistory.length < 2) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas completely
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Get price range
    const prices = tradeState.priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.beginPath();

    tradeState.priceHistory.forEach((point, index) => {
      const x = (index / (tradeState.priceHistory.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
    ctx.fill();

    // Draw strike price lines for active trades
    tradeState.activeTrades.forEach(trade => {
      const y = height - ((trade.strikePrice - minPrice) / priceRange) * height;
      ctx.strokeStyle = trade.direction === 'buy' ? '#2ecc71' : '#e74c3c';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw label
      ctx.fillStyle = trade.direction === 'buy' ? '#2ecc71' : '#e74c3c';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${trade.direction.toUpperCase()} $${trade.amount}`, 10, y - 5);
    });

    // Draw price labels
    ctx.fillStyle = '#d1d4dc';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * i;
      const y = height - (height / 5) * i;
      ctx.fillText(price.toFixed(2), width - 5, y - 5);
    }

  }, [tradeState.priceHistory, tradeState.activeTrades]);

  // Trade countdown timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = Date.now();
      
      tradeState.activeTrades.forEach(trade => {
        const timeLeft = Math.max(0, trade.expiryTime - now);
        
        if (timeLeft === 0 && trade.status === 'active') {
          // Trade expired - determine result
          const finalPrice = tradeState.currentPrice;
          const profit = trade.direction === 'buy' 
            ? (finalPrice > trade.strikePrice ? trade.amount * 0.85 : -trade.amount)
            : (finalPrice < trade.strikePrice ? trade.amount * 0.85 : -trade.amount);
          
          dispatch({
            type: 'CLOSE_TRADE',
            payload: {
              id: trade.id,
              result: {
                status: 'closed',
                finalPrice,
                profit,
                closedAt: now
              }
            }
          });

          // Show result notification
          if (profit > 0) {
            toast.success(`Trade won! +$${profit.toFixed(2)}`);
          } else {
            toast.error(`Trade lost! $${profit.toFixed(2)}`);
          }

          // Call parent callback
          if (onTrade) {
            onTrade({
              type: 'binary_option',
              asset: trade.asset,
              direction: trade.direction,
              amount: trade.amount,
              profit
            });
          }
        } else if (timeLeft > 0) {
          dispatch({
            type: 'UPDATE_TRADE',
            payload: {
              id: trade.id,
              updates: { timeLeft }
            }
          });
        }
      });
    }, 100);

    return () => clearInterval(timerInterval);
  }, [tradeState.activeTrades, tradeState.currentPrice, onTrade]);

  // Execute trade with backend API
  const executeTrade = async (direction) => {
    if (tradeAmount <= 0 || tradeAmount > currentBalance) {
      toast.error('Invalid trade amount or insufficient balance');
      return;
    }

    try {
      // Try backend API first
      const response = await binaryOptionsAPI.openTrade({
        asset_symbol: selectedAsset,
        direction: direction,
        amount: tradeAmount,
        expiry_seconds: expiryTime,
        is_demo: isDemo
      });

      if (response.data.success) {
        // Update balance from API response
        const newBalance = parseFloat(response.data.new_balance);
        setCurrentBalance(newBalance);
        
        // Notify parent component
        if (onBalanceUpdate) {
          onBalanceUpdate(newBalance);
        }

        // Transform and add trade to local state
        const trade = {
          id: response.data.trade.id,
          asset: response.data.trade.asset?.symbol || selectedAsset,
          direction: direction,
          amount: tradeAmount,
          strikePrice: parseFloat(response.data.trade.strike_price),
          expiryTime: new Date(response.data.trade.expires_at).getTime(),
          timeLeft: expiryTime * 1000,
          status: 'active',
          createdAt: Date.now()
        };

        dispatch({ type: 'ADD_TRADE', payload: trade });
        toast.success(`${direction.toUpperCase()} trade placed! New balance: $${newBalance.toFixed(2)}`);

        // Notify parent
        if (onTrade) {
          onTrade({
            type: 'binary_option',
            asset: selectedAsset,
            direction: direction,
            amount: tradeAmount,
            is_demo: isDemo
          });
        }
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      
      // Check if backend is unavailable (500, 404, network error)
      const isBackendUnavailable = !error.response || 
                                    error.response.status === 500 || 
                                    error.response.status === 404 ||
                                    error.code === 'ERR_NETWORK';
      
      if (isBackendUnavailable) {
        // Fallback to local demo mode
        console.warn('Backend unavailable, using local demo mode');
        toast.error('Backend unavailable - using demo mode', {
          icon: '⚠️',
          duration: 3000
        });
        
        // Deduct balance locally
        const newBalance = currentBalance - tradeAmount;
        setCurrentBalance(newBalance);
        
        if (onBalanceUpdate) {
          onBalanceUpdate(newBalance);
        }
        
        // Create local trade
        const trade = {
          id: Date.now(),
          asset: selectedAsset,
          direction: direction,
          amount: tradeAmount,
          strikePrice: tradeState.currentPrice,
          expiryTime: Date.now() + (expiryTime * 1000),
          timeLeft: expiryTime * 1000,
          status: 'active',
          createdAt: Date.now()
        };
        
        dispatch({ type: 'ADD_TRADE', payload: trade });
        toast.success(`${direction.toUpperCase()} trade placed (Demo)! New balance: $${newBalance.toFixed(2)}`);
        
        if (onTrade) {
          onTrade({
            type: 'binary_option',
            asset: selectedAsset,
            direction: direction,
            amount: tradeAmount,
            is_demo: true
          });
        }
      } else {
        // Show specific error from backend
        const errorMsg = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.response?.data?.detail ||
                        'Failed to open trade';
        toast.error(errorMsg);
      }
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0f0f0f] text-white flex flex-col">
      {/* Compact Top Bar */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-2 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center space-x-2">
            {/* Asset Selector */}
            <div className="relative">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="bg-[#2a2a2a] text-white px-2 py-1 pr-6 rounded text-xs font-semibold appearance-none cursor-pointer hover:bg-[#333] transition-colors focus:outline-none focus:ring-1 focus:ring-[#2ecc71]"
              >
                {assets.map(asset => (
                  <option key={asset.symbol} value={asset.symbol}>
                    {asset.symbol}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-400" />
            </div>

            {/* Current Price */}
            <div className="bg-[#2a2a2a] px-2 py-1 rounded">
              <span className="text-xs text-gray-400 mr-1">Price:</span>
              <span className="text-xs font-bold text-[#2ecc71]">
                ${tradeState.currentPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Account Balance */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <span className="text-xs text-gray-400 mr-1">{isDemo ? '🎮 Demo' : '💰 Real'}:</span>
              <span className="text-xs font-bold">${currentBalance.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setIsDemo(!isDemo)}
              className="bg-[#2a2a2a] hover:bg-[#333] text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
            >
              {isDemo ? 'Switch to Real' : 'Switch to Demo'}
            </button>
            <button className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-2 py-1 rounded text-xs font-semibold transition-colors flex items-center">
              <Plus className="w-3 h-3 mr-0.5" />
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed Height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full mx-auto p-1 sm:p-1.5">
          <div className="h-full grid grid-cols-1 xl:grid-cols-5 gap-1 sm:gap-1.5">
            {/* Chart & Trades Area - Takes more space on desktop */}
            <div className="xl:col-span-4 flex flex-col min-h-0 gap-1 sm:gap-1.5 order-1">
              {/* Chart */}
              <div className="bg-[#1a1a1a] rounded border border-[#2a2a2a] p-1 sm:p-1.5 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs sm:text-sm font-semibold">{selectedAsset} Live</h3>
                  <button className="p-0.5 hover:bg-[#2a2a2a] rounded transition-colors">
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={180} 
                  className="w-full rounded bg-[#1a1a1a]"
                  style={{ display: 'block', width: '100%', height: '180px' }}
                />
              </div>

              {/* Trades Panel - Hidden on mobile, shown on tablet+ */}
              <div className="hidden sm:flex bg-[#1a1a1a] rounded border border-[#2a2a2a] p-1 sm:p-1.5 flex-1 min-h-0 overflow-hidden flex-col">
                {/* Tabs */}
                <div className="flex space-x-2 border-b border-[#2a2a2a] mb-1.5 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('open')}
                    className={`pb-1 px-1 text-xs font-semibold transition-colors ${
                      activeTab === 'open'
                        ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Open ({tradeState.activeTrades.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-1 px-1 text-xs font-semibold transition-colors ${
                      activeTab === 'history'
                        ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    History ({tradeState.tradeHistory.length})
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {/* Open Trades */}
                  {activeTab === 'open' && (
                    <div className="space-y-1">
                      {tradeState.activeTrades.length === 0 ? (
                        <div className="text-center py-3 text-gray-400 text-xs">
                          No open trades
                        </div>
                      ) : (
                        tradeState.activeTrades.map(trade => (
                          <div key={trade.id} className="bg-[#2a2a2a] rounded p-1.5 flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${trade.direction === 'buy' ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                              <div>
                                <div className="text-xs font-semibold">{trade.asset}</div>
                                <div className="text-xs text-gray-400">
                                  ${trade.strikePrice.toFixed(2)} | ${trade.amount}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-bold ${trade.direction === 'buy' ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                                {trade.direction.toUpperCase()}
                              </div>
                              <div className="text-xs text-[#f1c40f] flex items-center">
                                <Clock className="w-2.5 h-2.5 mr-0.5" />
                                {formatTime(trade.timeLeft)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* History */}
                  {activeTab === 'history' && (
                    <div className="space-y-1">
                      {tradeState.tradeHistory.length === 0 ? (
                        <div className="text-center py-3 text-gray-400 text-xs">
                          No trade history
                        </div>
                      ) : (
                        tradeState.tradeHistory.slice(0, 10).map(trade => (
                          <div key={trade.id} className="bg-[#2a2a2a] rounded p-1.5 flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${trade.profit > 0 ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                              <div>
                                <div className="text-xs font-semibold">{trade.asset}</div>
                                <div className="text-xs text-gray-400">
                                  ${trade.strikePrice.toFixed(2)} → ${trade.finalPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-bold ${trade.profit > 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                                {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(trade.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trade Panel - Compact, better mobile layout */}
            <div className="xl:col-span-1 flex flex-col min-h-0 order-2">
              <div className="bg-[#1a1a1a] rounded border border-[#2a2a2a] p-1.5 sm:p-2 overflow-y-auto max-h-[calc(100vh-120px)] xl:max-h-none">
                <h3 className="text-xs font-semibold mb-1.5">Trade Panel</h3>

                {/* Amount Input */}
                <div className="mb-1.5">
                  <label className="block text-xs text-gray-400 mb-0.5">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2a2a2a] text-white pl-6 pr-2 py-1 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2ecc71]"
                      placeholder="10"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-0.5 mt-1">
                    {[10, 25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setTradeAmount(amount)}
                        className="bg-[#2a2a2a] hover:bg-[#333] text-xs py-0.5 rounded transition-colors"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expiry Time */}
                <div className="mb-1.5">
                  <label className="block text-xs text-gray-400 mb-0.5">Expiry</label>
                  <div className="grid grid-cols-4 gap-0.5">
                    {expiryOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setExpiryTime(option.value)}
                        className={`py-0.5 rounded font-semibold text-xs transition-colors ${
                          expiryTime === option.value
                            ? 'bg-[#2ecc71] text-white'
                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* One-Click Toggle */}
                <div className="mb-1.5 flex items-center justify-between bg-[#2a2a2a] p-1.5 rounded">
                  <span className="text-xs">One-Click</span>
                  <button
                    onClick={() => setOneClickTrade(!oneClickTrade)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      oneClickTrade ? 'bg-[#2ecc71]' : 'bg-[#444]'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                      oneClickTrade ? 'translate-x-4' : ''
                    }`} />
                  </button>
                </div>

                {/* Trade Buttons */}
                <div className="space-y-1">
                  <button
                    onClick={() => executeTrade('buy')}
                    className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white py-2 rounded font-bold text-xs transition-colors flex items-center justify-center"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    BUY
                  </button>
                  <button
                    onClick={() => executeTrade('sell')}
                    className="w-full bg-[#e74c3c] hover:bg-[#c0392b] text-white py-2 rounded font-bold text-xs transition-colors flex items-center justify-center"
                  >
                    <TrendingDown className="w-3 h-3 mr-1" />
                    SELL
                  </button>
                </div>

                {/* Payout Info */}
                <div className="mt-1.5 bg-[#2a2a2a] p-1.5 rounded">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-400">Payout</span>
                    <span className="text-[#f1c40f] font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Profit</span>
                    <span className="text-[#2ecc71] font-semibold">
                      ${(tradeAmount * 0.85).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-1.5 bg-[#2a2a2a] p-1.5 rounded">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Active</span>
                    <span className="text-[#2ecc71] font-semibold">{tradeState.activeTrades.length}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-0.5">
                    <span className="text-gray-400">History</span>
                    <span className="text-gray-400 font-semibold">{tradeState.tradeHistory.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Trades Section - Only visible on mobile */}
            <div className="sm:hidden bg-[#1a1a1a] rounded border border-[#2a2a2a] p-1.5 order-3">
              <div className="flex space-x-2 border-b border-[#2a2a2a] mb-1.5">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`pb-1 px-1 text-xs font-semibold transition-colors ${
                    activeTab === 'open'
                      ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Open ({tradeState.activeTrades.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-1 px-1 text-xs font-semibold transition-colors ${
                    activeTab === 'history'
                      ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History ({tradeState.tradeHistory.length})
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto">
                {activeTab === 'open' && (
                  <div className="space-y-1">
                    {tradeState.activeTrades.length === 0 ? (
                      <div className="text-center py-3 text-gray-400 text-xs">
                        No open trades
                      </div>
                    ) : (
                      tradeState.activeTrades.map(trade => (
                        <div key={trade.id} className="bg-[#2a2a2a] rounded p-1.5 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${trade.direction === 'buy' ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                            <div>
                              <div className="text-xs font-semibold">{trade.asset}</div>
                              <div className="text-xs text-gray-400">
                                ${trade.strikePrice.toFixed(2)} | ${trade.amount}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-bold ${trade.direction === 'buy' ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                              {trade.direction.toUpperCase()}
                            </div>
                            <div className="text-xs text-[#f1c40f] flex items-center">
                              <Clock className="w-2.5 h-2.5 mr-0.5" />
                              {formatTime(trade.timeLeft)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-1">
                    {tradeState.tradeHistory.length === 0 ? (
                      <div className="text-center py-3 text-gray-400 text-xs">
                        No trade history
                      </div>
                    ) : (
                      tradeState.tradeHistory.slice(0, 5).map(trade => (
                        <div key={trade.id} className="bg-[#2a2a2a] rounded p-1.5 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${trade.profit > 0 ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                            <div>
                              <div className="text-xs font-semibold">{trade.asset}</div>
                              <div className="text-xs text-gray-400">
                                ${trade.strikePrice.toFixed(2)} → ${trade.finalPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-bold ${trade.profit > 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                              {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
