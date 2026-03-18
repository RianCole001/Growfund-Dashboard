import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import toast from 'react-hot-toast';
import { binaryOptionsAPI } from '../services/api';

export default function TradeNow({ onBalanceUpdate }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [tradeAmount, setTradeAmount] = useState(10);
  const [expiryTime, setExpiryTime] = useState(60);
  const [isDemo, setIsDemo] = useState(false);
  const [balances, setBalances] = useState({ real_balance: 0, demo_balance: 10000 });
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('open');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [openingTrade, setOpeningTrade] = useState(false);
  const [resultOverlay, setResultOverlay] = useState(null); // { status, profit_loss, final_price }

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const priceIntervalRef = useRef(null);
  const countdownIntervalsRef = useRef({});

  const expiryOptions = [
    { label: '30s', value: 30 }, { label: '1m', value: 60 },
    { label: '5m', value: 300 }, { label: '15m', value: 900 },
    { label: '30m', value: 1800 }, { label: '1h', value: 3600 },
  ];

  // ── Fetch balances ──────────────────────────────────────────────────────────
  const fetchBalances = useCallback(async () => {
    try {
      const res = await binaryOptionsAPI.getBalances();
      setBalances(res.data);
      if (onBalanceUpdate) onBalanceUpdate(res.data);
    } catch (e) {
      console.error('Failed to fetch balances', e);
    }
  }, [onBalanceUpdate]);

  // ── Fetch assets ────────────────────────────────────────────────────────────
  useEffect(() => {
    binaryOptionsAPI.getAssets()
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.data || []);
        setAssets(list);
        if (list.length > 0 && !selectedAsset) setSelectedAsset(list[0].symbol);
      })
      .catch(() => {
        // fallback
        const fallback = [
          { symbol: 'BTC', name: 'Bitcoin', min_trade_amount: 1, max_trade_amount: 10000 },
          { symbol: 'ETH', name: 'Ethereum', min_trade_amount: 1, max_trade_amount: 10000 },
          { symbol: 'GOLD', name: 'Gold', min_trade_amount: 1, max_trade_amount: 10000 },
        ];
        setAssets(fallback);
        setSelectedAsset('BTC');
      });
    fetchBalances();
  }, [fetchBalances]);

  // ── Fetch active trades ─────────────────────────────────────────────────────
  const fetchActiveTrades = useCallback(async () => {
    try {
      const res = await binaryOptionsAPI.getActiveTrades({ is_demo: isDemo });
      const trades = Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.trades || []);
      setActiveTrades(trades);
      // Start countdowns for any trade that doesn't have one yet
      (Array.isArray(trades) ? trades : []).forEach(t => startCountdown(t));
    } catch (e) {
      console.error('Failed to fetch active trades', e);
    }
  }, [isDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch trade history ─────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await binaryOptionsAPI.getTradeHistory({ is_demo: isDemo, limit: 50, offset: 0 });
      setTradeHistory(Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.trades || []));
      if (res.data.summary) setHistorySummary(res.data.summary);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  }, [isDemo]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await binaryOptionsAPI.getUserStats(isDemo);
      setStats(res.data);
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  }, [isDemo]);

  // Re-fetch everything when demo/real mode switches
  useEffect(() => {
    fetchBalances();
    fetchActiveTrades();
    fetchHistory();
    fetchStats();
  }, [isDemo, fetchBalances, fetchActiveTrades, fetchHistory, fetchStats]);

  // ── Chart init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current || !selectedAsset) return;
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#111' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#1e1e1e' }, horzLines: { color: '#1e1e1e' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#222' },
      timeScale: { borderColor: '#222', timeVisible: true, secondsVisible: true },
      autoSize: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Generate synthetic candles as a baseline so the chart is never blank
    const generateSyntheticCandles = (basePrice, count = 100) => {
      const now = Math.floor(Date.now() / 1000);
      const candles = [];
      let price = basePrice || 100;
      for (let i = count; i >= 0; i--) {
        const t = now - i * 60;
        const change = (Math.random() - 0.48) * price * 0.008;
        const open = price;
        const close = Math.max(0.01, price + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.003);
        const low = Math.min(open, close) * (1 - Math.random() * 0.003);
        candles.push({ time: t, open: parseFloat(open.toFixed(4)), high: parseFloat(high.toFixed(4)), low: parseFloat(low.toFixed(4)), close: parseFloat(close.toFixed(4)) });
        price = close;
      }
      return candles;
    };

    // Load historical candles from backend, fall back to synthetic data
    const loadChart = async () => {
      // Try to get current price first so synthetic candles use a realistic base
      let basePrice = 100;
      try {
        const priceRes = await binaryOptionsAPI.getAssetPrice(selectedAsset);
        basePrice = parseFloat(priceRes.data?.price || priceRes.data?.data?.price || 100) || 100;
        setCurrentPrice(basePrice);
      } catch {}

      try {
        const res = await binaryOptionsAPI.getChartData(selectedAsset, '1m', 100);
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.candles || []);
        const candles = raw.map(c => ({
          time: typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
        })).filter(c => c.time && !isNaN(c.open));

        if (candles.length > 0) {
          const seen = new Set();
          const unique = candles.filter(c => { if (seen.has(c.time)) return false; seen.add(c.time); return true; });
          unique.sort((a, b) => a.time - b.time);
          series.setData(unique);
        } else {
          series.setData(generateSyntheticCandles(basePrice, 100));
        }
      } catch {
        series.setData(generateSyntheticCandles(basePrice, 100));
      }
      chart.timeScale().fitContent();
    };

    loadChart();

    return () => { if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; } };
  }, [selectedAsset]);

  // ── Price polling ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedAsset) return;
    if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);

    const poll = async () => {
      try {
        const res = await binaryOptionsAPI.getAssetPrice(selectedAsset);
        const price = parseFloat(res.data?.price || res.data?.data?.price || 0);
        if (!price) return;
        setCurrentPrice(price);
        // Update chart with latest tick
        if (seriesRef.current) {
          const now = Math.floor(Date.now() / 1000);
          // Round to nearest minute so ticks aggregate into candles
          const candleTime = now - (now % 60);
          seriesRef.current.update({
            time: candleTime,
            open: price, high: price, low: price, close: price,
          });
        }
      } catch (e) {}
    };

    poll();
    priceIntervalRef.current = setInterval(poll, 2500);
    return () => clearInterval(priceIntervalRef.current);
  }, [selectedAsset]);

  // ── Countdown per trade ─────────────────────────────────────────────────────
  const startCountdown = useCallback((trade) => {
    if (countdownIntervalsRef.current[trade.id]) return; // already running

    const tick = () => {
      setActiveTrades(prev => {
        const idx = prev.findIndex(t => t.id === trade.id);
        if (idx === -1) return prev;
        const remaining = prev[idx].time_remaining - 1;
        if (remaining <= 0) {
          clearInterval(countdownIntervalsRef.current[trade.id]);
          delete countdownIntervalsRef.current[trade.id];
          closeTrade(trade.id);
          return prev.filter(t => t.id !== trade.id);
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], time_remaining: remaining };
        return updated;
      });
    };

    countdownIntervalsRef.current[trade.id] = setInterval(tick, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Close trade ─────────────────────────────────────────────────────────────
  const closeTrade = useCallback(async (tradeId, retries = 3) => {
    try {
      const res = await binaryOptionsAPI.closeTrade(tradeId);
      const { trade, new_balance } = res.data;

      // Update balances
      setBalances(prev => isDemo
        ? { ...prev, demo_balance: new_balance }
        : { ...prev, real_balance: new_balance }
      );
      if (onBalanceUpdate) onBalanceUpdate({ new_balance });

      // Show result overlay
      setResultOverlay({
        status: trade.status,
        profit_loss: trade.profit_loss,
        final_price: trade.final_price,
        strike_price: trade.strike_price,
      });
      setTimeout(() => setResultOverlay(null), 4000);

      fetchHistory();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.error || '';
      // Backend says "Trade expires in Xs" — retry after that delay
      const match = msg.match(/(\d+)s/);
      if (match && retries > 0) {
        const wait = (parseInt(match[1]) + 1) * 1000;
        setTimeout(() => closeTrade(tradeId, retries - 1), wait);
      } else {
        console.error('Failed to close trade', err);
      }
    }
  }, [isDemo, onBalanceUpdate, fetchHistory, fetchStats]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup all countdowns on unmount
  useEffect(() => {
    return () => {
      Object.values(countdownIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // ── Open trade ──────────────────────────────────────────────────────────────
  const openTrade = async (direction) => {
    if (!selectedAsset) return;
    const asset = assets.find(a => a.symbol === selectedAsset);
    const min = asset?.min_trade_amount || 1;
    const max = asset?.max_trade_amount || 10000;
    const balance = isDemo ? balances.demo_balance : balances.real_balance;

    if (tradeAmount < min) { toast.error(`Minimum trade amount is $${min}`); return; }
    if (tradeAmount > max) { toast.error(`Maximum trade amount is $${max}`); return; }
    if (tradeAmount > balance) { toast.error('Insufficient balance'); return; }

    setOpeningTrade(true);
    try {
      const res = await binaryOptionsAPI.openTrade({
        asset_symbol: selectedAsset,
        direction,
        amount: tradeAmount,
        expiry_seconds: expiryTime,
        is_demo: isDemo,
      });

      const { trade, new_balance } = res.data;

      // Update balance
      setBalances(prev => isDemo
        ? { ...prev, demo_balance: new_balance }
        : { ...prev, real_balance: new_balance }
      );

      // Add to active trades with time_remaining
      const newTrade = { ...trade, time_remaining: trade.expiry_seconds || expiryTime };
      setActiveTrades(prev => [newTrade, ...prev]);
      startCountdown(newTrade);

      toast.success(
        `Trade opened! Entry: $${trade.strike_price} | Payout: ${trade.adjusted_payout_percentage}%`
      );
      setActiveTab('open');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to open trade');
    } finally {
      setOpeningTrade(false);
    }
  };

  const currentBalance = isDemo ? balances.demo_balance : balances.real_balance;
  const selectedAssetObj = Array.isArray(assets) ? assets.find(a => a.symbol === selectedAsset) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">

      {/* Result Overlay */}
      {resultOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className={`rounded-2xl p-8 text-center shadow-2xl border-2 ${
            resultOverlay.status === 'won' ? 'bg-gray-900 border-green-500' : 'bg-gray-900 border-red-500'
          }`}>
            <div className="text-6xl mb-3">{resultOverlay.status === 'won' ? '🏆' : '💸'}</div>
            <div className={`text-3xl font-bold mb-2 ${resultOverlay.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
              {resultOverlay.status === 'won' ? 'You Won!' : 'You Lost'}
            </div>
            <div className={`text-2xl font-bold ${resultOverlay.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {resultOverlay.profit_loss >= 0 ? '+' : ''}${parseFloat(resultOverlay.profit_loss || 0).toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Entry: ${parseFloat(resultOverlay.strike_price || 0).toFixed(2)} → Exit: ${parseFloat(resultOverlay.final_price || 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {/* Asset selector */}
          <select
            value={selectedAsset || ''}
            onChange={e => setSelectedAsset(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {(Array.isArray(assets) ? assets : []).map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</option>
            ))}
          </select>
          {currentPrice && (
            <span className="text-lg font-bold text-white">${parseFloat(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          )}
        </div>

        {/* Demo / Real toggle */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsDemo(false)}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${!isDemo ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Real
          </button>
          <button
            onClick={() => setIsDemo(true)}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${isDemo ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Demo
          </button>
        </div>

        {/* Balance */}
        <div className="text-right">
          <div className="text-xs text-gray-400">{isDemo ? 'Demo' : 'Real'} Balance</div>
          <div className="text-lg font-bold text-white">${parseFloat(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="w-full" style={{ height: 260 }} />

      {/* Trade controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Amount */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Amount ($)</label>
          <input
            type="number"
            value={tradeAmount}
            onChange={e => setTradeAmount(parseFloat(e.target.value) || 0)}
            min={selectedAssetObj?.min_trade_amount || 1}
            max={selectedAssetObj?.max_trade_amount || 10000}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {selectedAssetObj && (
            <div className="text-xs text-gray-500 mt-1">
              Min: ${selectedAssetObj.min_trade_amount} / Max: ${selectedAssetObj.max_trade_amount}
            </div>
          )}
        </div>

        {/* Expiry */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Expiry</label>
          <div className="flex flex-wrap gap-1">
            {expiryOptions.map(o => (
              <button
                key={o.value}
                onClick={() => setExpiryTime(o.value)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  expiryTime === o.value ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buy / Sell */}
        <div className="flex gap-2 items-end">
          <button
            onClick={() => openTrade('buy')}
            disabled={openingTrade}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            Buy / Call
          </button>
          <button
            onClick={() => openTrade('sell')}
            disabled={openingTrade}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <TrendingDown className="w-5 h-5" />
            Sell / Put
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {['open', 'history', 'stats'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); if (tab === 'history') fetchHistory(); if (tab === 'stats') fetchStats(); }}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? 'border-b-2 border-green-500 text-green-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'open' ? `Open Trades (${activeTrades.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Open trades */}
        {activeTab === 'open' && (
          <div className="space-y-3">
            {activeTrades.length === 0 && (
              <div className="text-center text-gray-500 py-12">No active trades. Open one above.</div>
            )}
            {(Array.isArray(activeTrades) ? activeTrades : []).map(trade => (
              <div key={trade.id} className={`bg-gray-800 rounded-xl p-4 border ${
                trade.direction === 'buy' ? 'border-green-700' : 'border-red-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{trade.asset_symbol}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      trade.direction === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.direction === 'buy' ? '▲ BUY' : '▼ SELL'}
                    </span>
                    {trade.is_demo && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">DEMO</span>}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold">
                    <Clock className="w-4 h-4" />
                    {Math.floor((trade.time_remaining || 0) / 60).toString().padStart(2, '0')}:{((trade.time_remaining || 0) % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs">Entry Price</div>
                    <div className="text-white font-semibold">${parseFloat(trade.strike_price || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Amount</div>
                    <div className="text-white font-semibold">${parseFloat(trade.amount || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Potential Profit</div>
                    <div className="text-green-400 font-semibold">+${parseFloat(trade.potential_profit || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Payout: {trade.adjusted_payout_percentage}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Summary bar */}
            {historySummary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Wagered', value: `$${parseFloat(historySummary.total_wagered || 0).toFixed(2)}` },
                  { label: 'Won', value: `$${parseFloat(historySummary.total_won || 0).toFixed(2)}`, color: 'text-green-400' },
                  { label: 'Net P&L', value: `${historySummary.net_pnl >= 0 ? '+' : ''}$${parseFloat(historySummary.net_pnl || 0).toFixed(2)}`, color: historySummary.net_pnl >= 0 ? 'text-green-400' : 'text-red-400' },
                  { label: 'W/L', value: `${historySummary.win_count}W / ${historySummary.loss_count}L` },
                ].map(s => (
                  <div key={s.label} className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400">{s.label}</div>
                    <div className={`font-bold text-sm ${s.color || 'text-white'}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {tradeHistory.length === 0 && (
              <div className="text-center text-gray-500 py-12">No trade history yet.</div>
            )}
            {(Array.isArray(tradeHistory) ? tradeHistory : []).map(trade => (
              <div key={trade.id} className={`bg-gray-800 rounded-xl p-4 border ${
                trade.status === 'won' ? 'border-green-800' : trade.status === 'lost' ? 'border-red-800' : 'border-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{trade.asset_symbol}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      trade.direction === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.direction === 'buy' ? '▲ BUY' : '▼ SELL'}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    trade.status === 'won' ? 'text-green-400' : trade.status === 'lost' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {trade.status === 'won' ? `+$${parseFloat(trade.profit_loss || 0).toFixed(2)}` :
                     trade.status === 'lost' ? `-$${Math.abs(parseFloat(trade.profit_loss || 0)).toFixed(2)}` :
                     trade.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-2">
                  <div>Entry: <span className="text-white">${parseFloat(trade.strike_price || 0).toFixed(2)}</span></div>
                  <div>Exit: <span className="text-white">${parseFloat(trade.final_price || 0).toFixed(2)}</span></div>
                  <div>Amount: <span className="text-white">${parseFloat(trade.amount || 0).toFixed(2)}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Trades', value: stats.total_trades },
              { label: 'Wins', value: stats.total_wins, color: 'text-green-400' },
              { label: 'Losses', value: stats.total_losses, color: 'text-red-400' },
              { label: 'Win Rate', value: `${parseFloat(stats.win_rate || 0).toFixed(1)}%`, color: parseFloat(stats.win_rate) >= 50 ? 'text-green-400' : 'text-red-400' },
              { label: 'Net Profit', value: `${stats.net_profit >= 0 ? '+' : ''}$${parseFloat(stats.net_profit || 0).toFixed(2)}`, color: stats.net_profit >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Win Streak', value: stats.current_win_streak },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color || 'text-white'}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'stats' && !stats && (
          <div className="text-center text-gray-500 py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
            Loading stats...
          </div>
        )}
      </div>
    </div>
  );
}
