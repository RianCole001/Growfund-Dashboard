import { useState, useEffect } from 'react';

const DEMO_STORAGE_KEYS = {
  investments: 'demo_investments',
  transactions: 'demo_transactions',
  balance: 'demo_balance',
  prices: 'demo_crypto_prices',
  profile: 'demo_profile'
};

export const useDemoData = () => {
  // Initialize demo data from localStorage or defaults
  const getStoredData = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  const saveData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      // ignore
    }
  };

  // Default demo data
  const defaultInvestments = [
    {
      id: 1,
      coin: 'EXACOIN',
      amount: 1000,
      quantity: 16.67, // Updated quantity for $60 price: 1000 / 60 = 16.67
      price_at_purchase: 60.00,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      type: 'crypto'
    },
    {
      id: 2,
      coin: 'BTC',
      amount: 5000,
      quantity: 0.077,
      price_at_purchase: 64900.00,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      type: 'crypto'
    },
    {
      id: 3,
      coin: 'ETH',
      amount: 2000,
      quantity: 0.625,
      price_at_purchase: 3200.00,
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      type: 'crypto'
    },
    {
      id: 4,
      plan_type: 'basic',
      amount: 3000,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      type: 'capital_plan',
      period_months: 12,
      growth_rate: 15
    }
  ];

  const defaultTransactions = [
    {
      id: 1,
      type: 'Crypto Purchase',
      amount: 1000,
      asset: 'EXACOIN',
      quantity: 16.67, // Updated quantity for $60 price: 1000 / 60 = 16.67
      price: 60.00,
      status: 'completed',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'Crypto Purchase',
      amount: 5000,
      asset: 'BTC',
      quantity: 0.077,
      price: 64900.00,
      status: 'completed',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'Deposit',
      amount: 10000,
      status: 'completed',
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const defaultPrices = {
    EXACOIN: { price: 62.00, change24h: 3.33, change7d: 12.80, change30d: 89.50 },
    OPTCOIN: { price: 85.30, change24h: 12.40, change7d: 8.60, change30d: 25.70 },
    BTC: { price: 64444.00, change24h: 2.10, change7d: -1.50, change30d: 8.70 },
    ETH: { price: 3200.00, change24h: 1.80, change7d: 3.20, change30d: 15.40 },
    BNB: { price: 420.00, change24h: 0.50, change7d: 2.10, change30d: 10.20 },
    ADA: { price: 1.25, change24h: -0.80, change7d: 1.50, change30d: 5.30 },
    SOL: { price: 120.00, change24h: 3.20, change7d: 5.80, change30d: 20.10 },
    DOT: { price: 6.40, change24h: -1.20, change7d: 0.50, change30d: 3.80 },
    USDT: { price: 1.00, change24h: 0.01, change7d: 0.02, change30d: 0.05 }
  };

  const defaultProfile = {
    name: 'Demo User',
    email: 'demo@growfund.com',
    phone: '+1234567890',
    country: 'United States',
    verified: true
  };

  // State management
  const [demoInvestments, setDemoInvestments] = useState(() => 
    getStoredData(DEMO_STORAGE_KEYS.investments, defaultInvestments)
  );
  
  const [demoTransactions, setDemoTransactions] = useState(() => 
    getStoredData(DEMO_STORAGE_KEYS.transactions, defaultTransactions)
  );
  
  const [demoBalance, setDemoBalance] = useState(() => 
    getStoredData(DEMO_STORAGE_KEYS.balance, 10000)
  );
  
  const [demoPrices, setDemoPrices] = useState(() => 
    getStoredData(DEMO_STORAGE_KEYS.prices, defaultPrices)
  );
  
  const [demoProfile, setDemoProfile] = useState(() => 
    getStoredData(DEMO_STORAGE_KEYS.profile, defaultProfile)
  );

  // Auto-save to localStorage when data changes
  useEffect(() => {
    saveData(DEMO_STORAGE_KEYS.investments, demoInvestments);
  }, [demoInvestments]);

  useEffect(() => {
    saveData(DEMO_STORAGE_KEYS.transactions, demoTransactions);
  }, [demoTransactions]);

  useEffect(() => {
    saveData(DEMO_STORAGE_KEYS.balance, demoBalance);
  }, [demoBalance]);

  useEffect(() => {
    saveData(DEMO_STORAGE_KEYS.prices, demoPrices);
  }, [demoPrices]);

  useEffect(() => {
    saveData(DEMO_STORAGE_KEYS.profile, demoProfile);
  }, [demoProfile]);

  // Demo actions
  const addDemoInvestment = (investment) => {
    const newInvestment = {
      ...investment,
      id: Date.now(),
      date: new Date().toISOString(),
      status: 'active'
    };
    setDemoInvestments(prev => [...prev, newInvestment]);
    
    // Add corresponding transaction
    const transaction = {
      id: Date.now() + 1,
      type: investment.coin ? 'Crypto Purchase' : 'Investment',
      amount: investment.amount,
      asset: investment.coin || investment.plan_type,
      quantity: investment.quantity,
      price: investment.price_at_purchase,
      status: 'completed',
      date: new Date().toISOString()
    };
    setDemoTransactions(prev => [...prev, transaction]);
    
    // Deduct from balance
    setDemoBalance(prev => Math.max(0, prev - investment.amount));
  };

  const addDemoTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString(),
      status: 'completed'
    };
    setDemoTransactions(prev => [...prev, newTransaction]);
    
    // Update balance based on transaction type
    if (transaction.type === 'Deposit') {
      setDemoBalance(prev => prev + transaction.amount);
    } else if (transaction.type === 'Withdrawal') {
      setDemoBalance(prev => Math.max(0, prev - transaction.amount));
    }
  };

  const sellDemoCrypto = (coin, quantity, sellPrice) => {
    // Find and update the investment
    setDemoInvestments(prev => {
      return prev.map(inv => {
        if (inv.coin === coin && inv.status === 'active') {
          const remainingQuantity = inv.quantity - quantity;
          if (remainingQuantity <= 0) {
            return { ...inv, status: 'sold', quantity: 0 };
          } else {
            return { ...inv, quantity: remainingQuantity };
          }
        }
        return inv;
      });
    });

    // Add sell transaction
    const sellAmount = quantity * sellPrice;
    const transaction = {
      id: Date.now(),
      type: 'Crypto Sale',
      amount: sellAmount,
      asset: coin,
      quantity: quantity,
      price: sellPrice,
      status: 'completed',
      date: new Date().toISOString()
    };
    setDemoTransactions(prev => [...prev, transaction]);
    
    // Add to balance
    setDemoBalance(prev => prev + sellAmount);
  };

  const resetDemoData = () => {
    setDemoInvestments(defaultInvestments);
    setDemoTransactions(defaultTransactions);
    setDemoBalance(10000);
    setDemoPrices(defaultPrices);
    setDemoProfile(defaultProfile);
  };

  const updateDemoPrices = (newPrices) => {
    setDemoPrices(prev => ({ ...prev, ...newPrices }));
  };

  return {
    // Data
    demoInvestments,
    demoTransactions,
    demoBalance,
    demoPrices,
    demoProfile,
    
    // Actions
    addDemoInvestment,
    addDemoTransaction,
    sellDemoCrypto,
    resetDemoData,
    updateDemoPrices,
    
    // Setters for direct updates
    setDemoInvestments,
    setDemoTransactions,
    setDemoBalance,
    setDemoPrices,
    setDemoProfile
  };
};