import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  DollarSign,
  Target,
  Shield,
  Clock,
  Zap,
  Settings,
  Maximize2,
  RefreshCw
} from 'lucide-react';

// TradingView Chart Component
const TradingViewChart = ({ symbol, interval = '15' }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous widget
    if (widgetRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create TradingView widget
    const script = document.createElemen