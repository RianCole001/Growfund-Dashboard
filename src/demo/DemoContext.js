import React, { createContext, useContext, useState, useEffect } from 'react';
import { demoAPI } from '../services/demoAPI';

const DemoContext = createContext();

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(0);
  const [demoInvestments, setDemoInvestments] = useState([]);
  const [demoTransactions, setDemoTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if demo mode is enabled on app start
  useEffect(() => {
    const demoMode = localStorage.getItem('demo_mode') || localStorage.getItem('demo_access_token');
    if (demoMode === 'true' || demoMode === 'demo_user_token') {
      setIsDemoMode(true);
      loadDemoData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load demo data from backend using new endpoints
  const loadDemoData = async () => {
    try {
      setLoading(true);

      // Auto-create account on first call, then fetch portfolio + transactions
      const [accountRes, portfolioRes, transactionsRes] = await Promise.all([
        demoAPI.getDemoAccount().catch(() => null),
        demoAPI.getDemoPortfolio().catch(() => null),
        demoAPI.getDemoTransactions({ limit: 50 }).catch(() => null),
      ]);

      // Account gives us the balance
      if (accountRes?.data?.success) {
        const acct = accountRes.data.data;
        setDemoBalance(parseFloat(acct.balance || acct.demo_balance || 0));
      }

      // Portfolio gives us investments with live prices
      if (portfolioRes?.data?.success) {
        const portfolio = portfolioRes.data.data;
        // Normalise: portfolio may have { balance, investments, ... }
        if (portfolio?.balance !== undefined) {
          setDemoBalance(parseFloat(portfolio.balance));
        }
        const investments = portfolio?.investments || portfolio?.holdings || [];
        setDemoInvestments(Array.isArray(investments) ? investments : []);
      }

      // Transactions
      if (transactionsRes?.data?.success) {
        const txData = transactionsRes.data.data;
        const txList = Array.isArray(txData) ? txData : (txData?.results || txData?.transactions || []);
        setDemoTransactions(txList);
      }
    } catch {
      // backend demo endpoints unavailable — keep existing local state
    } finally {
      setLoading(false);
    }
  };

  const enableDemoMode = async () => {
    try {
      setLoading(true);
      setIsDemoMode(true);
      localStorage.setItem('demo_access_token', 'demo_user_token');
      localStorage.setItem('demo_mode', 'true');

      // Seed default balance so demo works even without backend
      setDemoBalance(prev => prev > 0 ? prev : 10000);

      await loadDemoData();
    } catch {
      setDemoBalance(10000);
      setDemoInvestments([]);
      setDemoTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setDemoBalance(0);
    setDemoInvestments([]);
    setDemoTransactions([]);
    localStorage.removeItem('demo_access_token');
    localStorage.removeItem('demo_mode');
  };

  const demoDeposit = async (amount) => {
    const response = await demoAPI.demoDeposit(amount);
    if (response.data.success) {
      setDemoBalance(parseFloat(response.data.data.new_balance));
      await loadDemoData();
      return response.data;
    }
    throw new Error(response.data.error || 'Deposit failed');
  };

  const demoWithdraw = async (amount) => {
    const response = await demoAPI.demoWithdraw(amount);
    if (response.data.success) {
      setDemoBalance(parseFloat(response.data.data.new_balance));
      await loadDemoData();
      return response.data;
    }
    throw new Error(response.data.error || 'Withdrawal failed');
  };

  const demoBuyCrypto = async (cryptoData) => {
    // Never send price — backend fetches it server-side
    const response = await demoAPI.demoBuyCrypto({
      coin: cryptoData.coin,
      amount: cryptoData.amount,
    });
    if (response.data.success) {
      setDemoBalance(parseFloat(response.data.data.new_balance));
      await loadDemoData();
      return response.data;
    }
    throw new Error(response.data.error || 'Crypto purchase failed');
  };

  const demoSellCrypto = async (sellData) => {
    const response = await demoAPI.demoSellCrypto(sellData);
    if (response.data.success) {
      setDemoBalance(parseFloat(response.data.data.new_balance));
      await loadDemoData();
      return response.data;
    }
    throw new Error(response.data.error || 'Crypto sale failed');
  };

  // Capital plan investment — uses new /demo/capital-plan/ endpoint
  const demoCapitalPlan = async (plan_type, amount, months) => {
    const response = await demoAPI.demoCapitalPlan(plan_type, amount, months);
    if (response.data.success) {
      setDemoBalance(parseFloat(response.data.data.new_balance));
      await loadDemoData();
      return response.data;
    }
    throw new Error(response.data.error || 'Capital plan investment failed');
  };

  // Real estate investment — uses new /demo/real-estate/ endpoint
  const demoRealEstate = async (property_type, amount) => {
    const response = await demoAPI.demoRealEstate(property_type, amount);
    if (response.data.success) {
      setDemoBalance(parseFloat(response.data.data.new_balance));
      await loadDemoData();
      return response.data;
    }
    throw new Error(response.data.error || 'Real estate investment failed');
  };

  const resetDemoAccount = async () => {
    try {
      setLoading(true);
      const response = await demoAPI.resetDemoAccount();
      if (response.data.success) {
        await loadDemoData();
        return response.data;
      }
      throw new Error(response.data.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    demoBalance,
    demoInvestments,
    demoTransactions,
    loading,

    // Demo transaction functions
    demoDeposit,
    demoWithdraw,
    demoCapitalPlan,
    demoRealEstate,
    demoBuyCrypto,
    demoSellCrypto,
    resetDemoAccount,

    // Data refresh
    loadDemoData,

    // Setters for manual updates
    setDemoBalance,
    setDemoInvestments,
    setDemoTransactions,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};
