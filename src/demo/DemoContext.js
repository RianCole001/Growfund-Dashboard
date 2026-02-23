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
  }, []);

  // Load demo data from backend
  const loadDemoData = async () => {
    try {
      setLoading(true);
      const [balanceRes, investmentsRes, transactionsRes] = await Promise.all([
        demoAPI.getDemoBalance(),
        demoAPI.getDemoInvestments(),
        demoAPI.getDemoTransactions()
      ]);

      if (balanceRes.data.success) {
        setDemoBalance(parseFloat(balanceRes.data.data.balance));
      }

      if (investmentsRes.data.success) {
        setDemoInvestments(investmentsRes.data.data);
      }

      if (transactionsRes.data.success) {
        setDemoTransactions(transactionsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableDemoMode = async () => {
    try {
      setLoading(true);
      setIsDemoMode(true);
      
      // Store demo mode in localStorage using the same token system as AppNew.js
      localStorage.setItem('demo_access_token', 'demo_user_token');
      localStorage.setItem('demo_mode', 'true');
      
      // Get or create demo account
      await demoAPI.getDemoAccount();
      
      // Load demo data
      await loadDemoData();
    } catch (error) {
      console.error('Error enabling demo mode:', error);
      // Fallback to default values
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
    
    // Clear demo data from localStorage
    localStorage.removeItem('demo_access_token');
    localStorage.removeItem('demo_mode');
  };

  // Demo transaction functions using backend API
  const demoDeposit = async (amount) => {
    try {
      const response = await demoAPI.demoDeposit(amount);
      if (response.data.success) {
        setDemoBalance(parseFloat(response.data.data.new_balance));
        await loadDemoData(); // Refresh all data
        return response.data;
      }
      throw new Error(response.data.error || 'Deposit failed');
    } catch (error) {
      throw error;
    }
  };

  const demoWithdraw = async (amount) => {
    try {
      const response = await demoAPI.demoWithdraw(amount);
      if (response.data.success) {
        setDemoBalance(parseFloat(response.data.data.new_balance));
        await loadDemoData(); // Refresh all data
        return response.data;
      }
      throw new Error(response.data.error || 'Withdrawal failed');
    } catch (error) {
      throw error;
    }
  };

  const demoBuyCrypto = async (cryptoData) => {
    try {
      const response = await demoAPI.demoBuyCrypto(cryptoData);
      if (response.data.success) {
        setDemoBalance(parseFloat(response.data.data.new_balance));
        await loadDemoData(); // Refresh all data
        return response.data;
      }
      throw new Error(response.data.error || 'Crypto purchase failed');
    } catch (error) {
      throw error;
    }
  };

  const demoSellCrypto = async (sellData) => {
    try {
      const response = await demoAPI.demoSellCrypto(sellData);
      if (response.data.success) {
        setDemoBalance(parseFloat(response.data.data.new_balance));
        await loadDemoData(); // Refresh all data
        return response.data;
      }
      throw new Error(response.data.error || 'Crypto sale failed');
    } catch (error) {
      throw error;
    }
  };

  const demoInvest = async (investmentData) => {
    try {
      const response = await demoAPI.demoInvest(investmentData);
      if (response.data.success) {
        setDemoBalance(parseFloat(response.data.data.new_balance));
        await loadDemoData(); // Refresh all data
        return response.data;
      }
      throw new Error(response.data.error || 'Investment failed');
    } catch (error) {
      throw error;
    }
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
    } catch (error) {
      throw error;
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
    demoInvest,
    demoBuyCrypto,
    demoSellCrypto,
    resetDemoAccount,
    
    // Data refresh
    loadDemoData,
    
    // Setters for manual updates (deprecated - use API functions)
    setDemoBalance,
    setDemoInvestments,
    setDemoTransactions
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};