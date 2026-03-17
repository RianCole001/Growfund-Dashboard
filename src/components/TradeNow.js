import React, { useState, useEffect, useReducer } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { binaryOptionsAPI } from '../services/api';

// Pure SVG live line chart — no dependencies
function LiveLineChart({ points, activeTrades }) {
  const W = 600, H = 160;
  if (points.length < 2) {
    return (
      <div className="w-full rounded bg-[#111] flex items-center justify-center" style={{ height: H }}>
        <span className="text-xs text-gray-600">Waiting for live data...</span>
      </div>
    );
  }

  const prices = points.map(p => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const pad = 8;

  const toX = (i) => pad + (i / (points.length - 1)) * (W - pad * 2);
  const toY = (p) => H - pad - ((p - minP) / range) * (H - pad * 2);

  const polyline = points.map((p, i) => `${toX(i)},${toY(p.price)}`).join(' ');
  const areaPath = `M${toX(0)},${H} ` +
    points.map((p, i) => `L${toX(i)},${toY(p.price)}`).join(' ') +
    ` L${toX(points.length - 1)},${H} Z`;

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const isUp = last.price >= prev.price;
  const color = isUp ? '#2ecc71' : '#e74c3c';
  const dotX = toX(points.length - 1);
  const dotY = toY(last.price);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full rounded"
      style={{ height: H, display: 'block' }}
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1={pad} y1={pad + f * (H - pad * 2)} x2={W - pad} y2={pad + f * (H - pad * 2)}
          stroke="#2a2a2a" strokeWidth="1" />
      ))}

      {/* Strike price lines for active trades */}
      {activeTrades.map(t => {
        const sy = toY(t.strikePrice);
        if (sy < pad || sy > H - pad) return null;
        return (
          <g key={t.id}>
            <line x1={pad} y1={sy} x2={W - pad} y2={sy}
              stroke={t.direction === 'buy' ? '#2ecc71' : '#e74c3c'}
              strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            <text x={W - pad - 2} y={sy - 3} fill={t.direction === 'buy' ? '#2ecc71' : '#e74c3c'}
              fontSize="8" textAnchor="end">{t.direction.toUpperCase()} ${t.strikePrice.toFixed(2)}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#chartGrad)" />

      {/* Line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />

      {/* Live dot */}
      <circle cx={dotX} cy={dotY} r="4" fill={color} opacity="0.9" />
      <circle cx={dotX} cy={dotY} r="7" fill={color} opacity="0.2">
        <animate attributeName="r" values="4;9;4" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Current price label */}
      <rect x={dotX + 6} y={dotY - 8} width="52" height="14" rx="3" fill={color} opacity="0.9" />
      <text x={dotX + 32} y={dotY + 2} fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
        ${last.price.toFixed(2)}
      </text>

      {/* Min/Max labels */}
      <text x={pad + 2} y={toY(maxP) - 3} fill="#555" fontSize="8">${maxP.toFixed(2)}</text>
      <text x={pad + 2} y={toY(minP) + 10} fill="#555" fontSize="8">${minP.toFixed(2)}</text>
    </svg>
  );
}

const tradeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TRADES':
      return { ...state, activeTrades: action.payload };
    case 'ADD_TRADE':
      return { ...state, activeTrades: [...state.activeTrades, action.payload] };
    case 'UPDATE_TRADE':
      return { ...state, activeTrades: state.activeTrades.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t) };
    case 'CLOSE_TRADE': {
      const closed = state.activeTrades.find(t => t.id === action.payload.id);
      return {
        ...state,
        activeTrades: state.activeTrades.filter(t => t.id !== action.payload.id),
        tradeHistory: closed ? [{ ...closed, ...action.payload.result }, ...state.tradeHistory] : state.tradeHistory
      };
    }
    case 'SET_HISTORY':
      return { ...state, tradeHistory: action.payload };
    case 'UPDATE_PRICE':
      return { ...state, currentPrice: action.payload };
    default:
      return state;
  }
};

export default function TradeNow({ balance: initialBalance = 10000, onTrade, onBalanceUpdate }) {
  const [tradeState, dispatch] = useReducer(tradeReducer, {
    activeTrades: [], tradeHistory: [], currentPrice: 75.50
  });

  const [selectedAsset, setSelectedAsset] = useState('OIL');
  const [tradeAmount, setTradeAmount] = useState(10);
  const [expiryTime, setExpiryTime] = useState(60);
  const [oneClickTrade, setOneClickTrade] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [currentBalance, setCurrentBalance] = useState(initialBalance);
  const [assets, setAssets] = useState([]);
  const [isDemo, setIsDemo] = useState(true);
  // Live SVG chart — rolling price history
  const [priceHistory, setPriceHistory] = useState([]);
  const MAX_POINTS = 80;

  const fallbackAssets = [
    { symbol: 'OIL', name: 'Crude Oil', volatility: 0.02 },
    { symbol: 'GOLD', name: 'Gold', volatility: 0.015 },
    { symbol: 'EUR/USD', name: 'Euro/Dollar', volatility: 0.01 },
    { symbol: 'BTC', name: 'Bitcoin', volatility: 0.03 }
  ];

  const currentAsset = assets.find(a => a.symbol === selectedAsset) || fallbackAssets.find(a => a.symbol === selectedAsset) || fallbackAssets[0];

  const expiryOptions = [
    { label: '15s', value: 15 }, { label: '30s', value: 30 }, { label: '1m', value: 60 },
    { label: '5m', value: 300 }, { label: '15m', value: 900 }, { label: '30m', value: 1800 }, { label: '1h', value: 3600 }
  ];

  // Fetch assets on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await binaryOptionsAPI.getAssets();
        if (response.data.success && response.data.assets) {
          setAssets(response.data.assets);
          if (response.data.assets.length > 0) setSelectedAsset(response.data.assets[0].symbol);
        }
      } catch { setAssets(fallbackAssets); }
    };
    fetchAssets();
  }, []);

  // Fetch balance
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await binaryOptionsAPI.getUserStats();
        if (response.data.success) {
          setCurrentBalance((isDemo ? response.data.demo_balance : response.data.real_balance) || initialBalance);
        }
      } catch { setCurrentBalance(initialBalance); }
    };
    fetchBalances();
  }, [isDemo, initialBalance]);

  // Live price polling — pushes into rolling SVG chart history (1s)
  useEffect(() => {
    // Reset history when asset changes
    setPriceHistory([]);
    const fetchPrices = async () => {
      try {
        const response = await binaryOptionsAPI.getAllPrices();
        if (response.data.success && response.data.prices?.[selectedAsset]) {
          const price = parseFloat(response.data.prices[selectedAsset].price);
          dispatch({ type: 'UPDATE_PRICE', payload: price });
          setPriceHistory(prev => {
            const next = [...prev, { price, t: Date.now() }];
            return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
          });
        }
      } catch {
        // if backend unavailable, nudge price slightly so chart keeps moving
        setPriceHistory(prev => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1].price;
          const price = parseFloat((last + (Math.random() - 0.5) * 0.08).toFixed(2));
          dispatch({ type: 'UPDATE_PRICE', payload: price });
          const next = [...prev, { price, t: Date.now() }];
          return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
        });
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 1000);
    return () => clearInterval(interval);
  }, [selectedAsset]);
  useEffect(() => {
    const fetchActiveTrades = async () => {
      try {
        const response = await binaryOptionsAPI.getActiveTrades({ is_demo: isDemo });
        if (response.data.success && response.data.trades) {
          dispatch({ type: 'SET_ACTIVE_TRADES', payload: response.data.trades.map(t => ({
            id: t.id, asset: t.asset?.symbol || t.asset_symbol, direction: t.direction,
            amount: parseFloat(t.amount), strikePrice: parseFloat(t.strike_price),
            expiryTime: new Date(t.expires_at).getTime(),
            timeLeft: new Date(t.expires_at).getTime() - Date.now(),
            status: t.status, createdAt: new Date(t.created_at).getTime()
          })) });
        }
      } catch {}
    };
    fetchActiveTrades();
    const interval = setInterval(fetchActiveTrades, 5000);
    return () => clearInterval(interval);
  }, [isDemo]);

  // Trade history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await binaryOptionsAPI.getTradeHistory({ limit: 20, is_demo: isDemo });
        if (response.data.success && response.data.results) {
          dispatch({ type: 'SET_HISTORY', payload: response.data.results.map(t => ({
            id: t.id, asset: t.asset?.symbol || t.asset_symbol, direction: t.direction,
            amount: parseFloat(t.amount), strikePrice: parseFloat(t.strike_price),
            finalPrice: parseFloat(t.final_price), profit: parseFloat(t.profit),
            status: t.status, closedAt: new Date(t.closed_at).getTime()
          })) });
        }
      } catch {}
    };
    fetchHistory();
  }, [isDemo]);



  // Countdown timer — calls backend closeTrade when expiry hits 0
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      tradeState.activeTrades.forEach(async (trade) => {
        const timeLeft = Math.max(0, trade.expiryTime - now);
        if (timeLeft === 0 && trade.status === 'active') {
          // Mark as resolving immediately to prevent double-close
          dispatch({ type: 'UPDATE_TRADE', payload: { id: trade.id, updates: { status: 'resolving' } } });
          try {
            const res = await binaryOptionsAPI.closeTrade(trade.id);
            if (res.data.success) {
              const { trade: closed, new_balance } = res.data;
              const profit = parseFloat(closed.profit_loss);
              const finalPrice = parseFloat(closed.final_price);
              dispatch({ type: 'CLOSE_TRADE', payload: { id: trade.id, result: { status: 'closed', finalPrice, profit, closedAt: now } } });
              if (new_balance !== undefined) {
                setCurrentBalance(parseFloat(new_balance));
                if (onBalanceUpdate) onBalanceUpdate(parseFloat(new_balance));
              }
              profit > 0 ? toast.success(`Won! +${profit.toFixed(2)}`) : toast.error(`Lost! -${Math.abs(profit).toFixed(2)}`);
              if (onTrade) onTrade({ type: 'binary_option', asset: trade.asset, direction: trade.direction, amount: trade.amount, profit });
            }
          } catch {
            // Fallback: resolve locally if backend unreachable
            const finalPrice = tradeState.currentPrice;
            const profit = trade.direction === 'buy'
              ? (finalPrice > trade.strikePrice ? trade.amount * 0.85 : -trade.amount)
              : (finalPrice < trade.strikePrice ? trade.amount * 0.85 : -trade.amount);
            dispatch({ type: 'CLOSE_TRADE', payload: { id: trade.id, result: { status: 'closed', finalPrice, profit, closedAt: now } } });
            profit > 0 ? toast.success(`Won! +${profit.toFixed(2)}`) : toast.error(`Lost! -${Math.abs(profit).toFixed(2)}`);
            if (onTrade) onTrade({ type: 'binary_option', asset: trade.asset, direction: trade.direction, amount: trade.amount, profit });
          }
        } else if (timeLeft > 0 && trade.status === 'active') {
          dispatch({ type: 'UPDATE_TRADE', payload: { id: trade.id, updates: { timeLeft } } });
        }
      });
    }, 100);
    return () => clearInterval(interval);
  }, [tradeState.activeTrades, tradeState.currentPrice, onTrade, onBalanceUpdate]);

  const executeTrade = async (direction) => {
    if (tradeAmount <= 0 || tradeAmount > currentBalance) { toast.error('Invalid amount or insufficient balance'); return; }
    try {
      const response = await binaryOptionsAPI.openTrade({ asset_symbol: selectedAsset, direction, amount: tradeAmount, expiry_seconds: expiryTime, is_demo: isDemo });
      if (response.data.success) {
        const newBalance = parseFloat(response.data.new_balance);
        setCurrentBalance(newBalance);
        if (onBalanceUpdate) onBalanceUpdate(newBalance);
        const trade = { id: response.data.trade.id, asset: response.data.trade.asset?.symbol || selectedAsset, direction, amount: tradeAmount, strikePrice: parseFloat(response.data.trade.strike_price), expiryTime: new Date(response.data.trade.expires_at).getTime(), timeLeft: expiryTime * 1000, status: 'active', createdAt: Date.now() };
        dispatch({ type: 'ADD_TRADE', payload: trade });
        toast.success(`${direction.toUpperCase()} placed! Balance: ${newBalance.toFixed(2)}`);
        if (onTrade) onTrade({ type: 'binary_option', asset: selectedAsset, direction, amount: tradeAmount, is_demo: isDemo });
      }
    } catch (error) {
      const unavailable = !error.response || [500, 404].includes(error.response?.status) || error.code === 'ERR_NETWORK';
      if (unavailable) {
        const newBalance = currentBalance - tradeAmount;
        setCurrentBalance(newBalance);
        if (onBalanceUpdate) onBalanceUpdate(newBalance);
        const trade = { id: Date.now(), asset: selectedAsset, direction, amount: tradeAmount, strikePrice: tradeState.currentPrice, expiryTime: Date.now() + expiryTime * 1000, timeLeft: expiryTime * 1000, status: 'active', createdAt: Date.now() };
        dispatch({ type: 'ADD_TRADE', payload: trade });
        toast.success(`${direction.toUpperCase()} placed (Demo)!`);
        if (onTrade) onTrade({ type: 'binary_option', asset: selectedAsset, direction, amount: tradeAmount, is_demo: true });
      } else {
        toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to open trade');
      }
    }
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#0f0f0f] text-white flex flex-col">

      {/* Top Bar */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}
                className="bg-[#2a2a2a] text-white pl-2 pr-6 py-1.5 rounded text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2ecc71]">
                {(assets.length ? assets : fallbackAssets).map(a => (
                  <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-400" />
            </div>
            <div className="bg-[#2a2a2a] px-2 py-1.5 rounded shrink-0">
              <span className="text-xs font-bold text-[#2ecc71]">${tradeState.currentPrice.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-gray-400">{isDemo ? '🎮 Demo' : '💰 Real'}</div>
              <div className="text-xs font-bold">${currentBalance.toLocaleString()}</div>
            </div>
            <div className="sm:hidden text-xs font-bold text-[#2ecc71]">${currentBalance.toLocaleString()}</div>
            <button onClick={() => setIsDemo(!isDemo)}
              className="bg-[#2a2a2a] hover:bg-[#333] text-white px-2 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap">
              {isDemo ? 'Real' : 'Demo'}
            </button>
            <button className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-2 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-0.5">
              <Plus className="w-3 h-3" /><span className="hidden sm:inline">Deposit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0">

        {/* Chart + Trades (left/main column) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Live SVG Line Chart */}
          <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] p-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-300">{selectedAsset} · Live</span>
              <span className="text-xs text-gray-500">{priceHistory.length} pts</span>
            </div>
            <LiveLineChart points={priceHistory} activeTrades={tradeState.activeTrades} />
          </div>

          {/* Trades tabs — desktop only */}
          <div className="hidden lg:flex flex-col flex-1 min-h-0 bg-[#1a1a1a] overflow-hidden">
            <div className="flex gap-3 border-b border-[#2a2a2a] px-3 pt-2 flex-shrink-0">
              {['open', 'history'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-xs font-semibold transition-colors capitalize ${activeTab === tab ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]' : 'text-gray-400 hover:text-white'}`}>
                  {tab === 'open' ? `Open (${tradeState.activeTrades.length})` : `History (${tradeState.tradeHistory.length})`}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {activeTab === 'open' && (
                tradeState.activeTrades.length === 0
                  ? <div className="text-center py-6 text-gray-500 text-xs">No open trades</div>
                  : tradeState.activeTrades.map(t => (
                    <div key={t.id} className="bg-[#2a2a2a] rounded p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${t.direction === 'buy' ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                        <div>
                          <div className="text-xs font-semibold">{t.asset}</div>
                          <div className="text-xs text-gray-400">${t.strikePrice.toFixed(2)} · ${t.amount}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${t.direction === 'buy' ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>{t.direction.toUpperCase()}</div>
                        <div className="text-xs text-[#f1c40f] flex items-center justify-end gap-0.5"><Clock className="w-2.5 h-2.5" />{formatTime(t.timeLeft)}</div>
                      </div>
                    </div>
                  ))
              )}
              {activeTab === 'history' && (
                tradeState.tradeHistory.length === 0
                  ? <div className="text-center py-6 text-gray-500 text-xs">No history</div>
                  : tradeState.tradeHistory.slice(0, 20).map(t => (
                    <div key={t.id} className="bg-[#2a2a2a] rounded p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${t.profit > 0 ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                        <div>
                          <div className="text-xs font-semibold">{t.asset}</div>
                          <div className="text-xs text-gray-400">${t.strikePrice?.toFixed(2)} → ${t.finalPrice?.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className={`text-xs font-bold ${t.profit > 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                        {t.profit > 0 ? '+' : ''}${t.profit?.toFixed(2)}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Trade Panel (right on desktop, bottom on mobile) */}
        <div className="bg-[#1a1a1a] border-t lg:border-t-0 lg:border-l border-[#2a2a2a] flex-shrink-0 lg:w-56 xl:w-64 overflow-y-auto">

          {/* Mobile layout */}
          <div className="lg:hidden p-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Amount</label>
                <div className="flex items-center bg-[#2a2a2a] rounded overflow-hidden">
                  <DollarSign className="w-3 h-3 text-gray-400 ml-2 shrink-0" />
                  <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-transparent text-white px-1.5 py-1.5 text-xs font-bold focus:outline-none min-w-0" placeholder="10" />
                </div>
                <div className="grid grid-cols-4 gap-0.5 mt-1">
                  {[10, 25, 50, 100].map(a => (
                    <button key={a} onClick={() => setTradeAmount(a)}
                      className={`py-1 rounded text-xs transition-colors ${tradeAmount === a ? 'bg-[#2ecc71] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}>
                      ${a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Expiry</label>
                <div className="grid grid-cols-4 gap-0.5">
                  {expiryOptions.map(o => (
                    <button key={o.value} onClick={() => setExpiryTime(o.value)}
                      className={`py-1 rounded text-xs font-semibold transition-colors ${expiryTime === o.value ? 'bg-[#2ecc71] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => executeTrade('buy')}
                className="bg-[#2ecc71] hover:bg-[#27ae60] text-white py-3 rounded font-bold text-sm transition-colors flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" /> BUY
              </button>
              <button onClick={() => executeTrade('sell')}
                className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-3 rounded font-bold text-sm transition-colors flex items-center justify-center gap-1">
                <TrendingDown className="w-4 h-4" /> SELL
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#2a2a2a] rounded p-2">
                <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">Payout</span><span className="text-[#f1c40f] font-bold">85%</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Profit</span><span className="text-[#2ecc71] font-bold">${(tradeAmount * 0.85).toFixed(2)}</span></div>
              </div>
              <div className="bg-[#2a2a2a] rounded p-2">
                <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">Active</span><span className="text-[#2ecc71] font-bold">{tradeState.activeTrades.length}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">History</span><span className="text-gray-300 font-bold">{tradeState.tradeHistory.length}</span></div>
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:block p-3 space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Trade Panel</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Amount</label>
              <div className="flex items-center bg-[#2a2a2a] rounded overflow-hidden mb-1">
                <DollarSign className="w-3 h-3 text-gray-400 ml-2 shrink-0" />
                <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-transparent text-white px-2 py-1.5 text-xs font-bold focus:outline-none min-w-0" placeholder="10" />
              </div>
              <div className="grid grid-cols-4 gap-0.5">
                {[10, 25, 50, 100].map(a => (
                  <button key={a} onClick={() => setTradeAmount(a)}
                    className={`py-1 rounded text-xs transition-colors ${tradeAmount === a ? 'bg-[#2ecc71] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}>
                    ${a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Expiry</label>
              <div className="grid grid-cols-4 gap-0.5">
                {expiryOptions.map(o => (
                  <button key={o.value} onClick={() => setExpiryTime(o.value)}
                    className={`py-1 rounded text-xs font-semibold transition-colors ${expiryTime === o.value ? 'bg-[#2ecc71] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#2a2a2a] p-2 rounded">
              <span className="text-xs text-gray-300">One-Click</span>
              <button onClick={() => setOneClickTrade(!oneClickTrade)}
                className={`relative w-8 h-4 rounded-full transition-colors ${oneClickTrade ? 'bg-[#2ecc71]' : 'bg-[#444]'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${oneClickTrade ? 'translate-x-4' : ''}`} />
              </button>
            </div>
            <div className="space-y-1.5">
              <button onClick={() => executeTrade('buy')}
                className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white py-2.5 rounded font-bold text-sm transition-colors flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> BUY
              </button>
              <button onClick={() => executeTrade('sell')}
                className="w-full bg-[#e74c3c] hover:bg-[#c0392b] text-white py-2.5 rounded font-bold text-sm transition-colors flex items-center justify-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> SELL
              </button>
            </div>
            <div className="bg-[#2a2a2a] p-2 rounded space-y-1">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Payout</span><span className="text-[#f1c40f] font-bold">85%</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Profit</span><span className="text-[#2ecc71] font-bold">${(tradeAmount * 0.85).toFixed(2)}</span></div>
            </div>
            <div className="bg-[#2a2a2a] p-2 rounded space-y-1">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Active</span><span className="text-[#2ecc71] font-bold">{tradeState.activeTrades.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">History</span><span className="text-gray-300 font-bold">{tradeState.tradeHistory.length}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Trades Section */}
      <div className="lg:hidden bg-[#1a1a1a] border-t border-[#2a2a2a] flex-shrink-0" style={{ maxHeight: '35vh' }}>
        <div className="flex gap-3 border-b border-[#2a2a2a] px-3 pt-2">
          {['open', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-2 text-xs font-semibold transition-colors capitalize ${activeTab === tab ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]' : 'text-gray-400'}`}>
              {tab === 'open' ? `Open (${tradeState.activeTrades.length})` : `History (${tradeState.tradeHistory.length})`}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto p-2 space-y-1" style={{ maxHeight: 'calc(35vh - 36px)' }}>
          {activeTab === 'open' && (
            tradeState.activeTrades.length === 0
              ? <div className="text-center py-4 text-gray-500 text-xs">No open trades</div>
              : tradeState.activeTrades.map(t => (
                <div key={t.id} className="bg-[#2a2a2a] rounded p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.direction === 'buy' ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                    <div>
                      <div className="text-xs font-semibold">{t.asset}</div>
                      <div className="text-xs text-gray-400">${t.strikePrice.toFixed(2)} · ${t.amount}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${t.direction === 'buy' ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>{t.direction.toUpperCase()}</div>
                    <div className="text-xs text-[#f1c40f] flex items-center justify-end gap-0.5"><Clock className="w-2.5 h-2.5" />{formatTime(t.timeLeft)}</div>
                  </div>
                </div>
              ))
          )}
          {activeTab === 'history' && (
            tradeState.tradeHistory.length === 0
              ? <div className="text-center py-4 text-gray-500 text-xs">No history</div>
              : tradeState.tradeHistory.slice(0, 10).map(t => (
                <div key={t.id} className="bg-[#2a2a2a] rounded p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.profit > 0 ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`} />
                    <div>
                      <div className="text-xs font-semibold">{t.asset}</div>
                      <div className="text-xs text-gray-400">${t.strikePrice?.toFixed(2)} → ${t.finalPrice?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-bold ${t.profit > 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                    {t.profit > 0 ? '+' : ''}${t.profit?.toFixed(2)}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

    </div>
  );
}
