import React, { useState, useEffect, useRef, useReducer } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, ChevronDown, Plus } from 'lucide-react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import toast from 'react-hot-toast';
import { binaryOptionsAPI } from '../services/api';

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

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  // current open candle being built
  const currentCandleRef = useRef(null);
  // last known price for fallback ticks
  const lastPriceRef = useRef(75.50);

  const fallbackAssets = [
    { symbol: 'OIL', name: 'Crude Oil' },
    { symbol: 'GOLD', name: 'Gold' },
    { symbol: 'EUR/USD', name: 'Euro/Dollar' },
    { symbol: 'BTC', name: 'Bitcoin' }
  ];

  const expiryOptions = [
    { label: '15s', value: 15 }, { label: '30s', value: 30 }, { label: '1m', value: 60 },
    { label: '5m', value: 300 }, { label: '15m', value: 900 }, { label: '30m', value: 1800 }, { label: '1h', value: 3600 }
  ];

  // ── Chart init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#111' }, textColor: '#666' },
      grid: { vertLines: { color: '#1e1e1e' }, horzLines: { color: '#1e1e1e' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#222', textColor: '#666' },
      timeScale: { borderColor: '#222', timeVisible: true, secondsVisible: true },
      autoSize: true,
      height: 200,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#2ecc71', downColor: '#e74c3c',
      borderUpColor: '#2ecc71', borderDownColor: '#e74c3c',
      wickUpColor: '#2ecc71', wickDownColor: '#e74c3c',
    });

    chartRef.current = chart;
    seriesRef.current = series;
    currentCandleRef.current = null;

    // Seed 60 historical candles so chart isn't empty on load
    const now = Math.floor(Date.now() / 1000);
    let price = lastPriceRef.current;
    const seed = [];
    for (let i = 59; i >= 0; i--) {
      const t = now - i * 5; // 5-second candles
      const o = price;
      const c = parseFloat((o + (Math.random() - 0.49) * o * 0.002).toFixed(4));
      const h = parseFloat((Math.max(o, c) + Math.random() * o * 0.001).toFixed(4));
      const l = parseFloat((Math.min(o, c) - Math.random() * o * 0.001).toFixed(4));
      seed.push({ time: t, open: o, high: h, low: l, close: c });
      price = c;
    }
    series.setData(seed);
    lastPriceRef.current = price;
    currentCandleRef.current = seed[seed.length - 1];
    chart.timeScale().fitContent();

    return () => { if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; } };
  }, [selectedAsset]);
