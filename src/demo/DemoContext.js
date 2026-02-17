import React, { createContext, useContext, useState, useEffect } from 'react';
import { demoData } from './demoData';

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

  // Initialize demo data when demo mode is enabled
  useEffect(() => {
    if (isDemoMode) {
      initializeDemoData();
    }
  }, [isDemoMode]);

  const initializeDemoData = () => {
    setDemoBalance(demoData.balance);
    setDemoInvestments([]);
    setDemoTransactions([]);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setDemoBalance(demoData.balance);
    setDemoInvestments([]);
    setDemoTransactions([]);
    // Store demo mode in localStorage
    localStorage.setItem('demo_mode', 'true');
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setDemoBalance(0);
    setDemoInvestments([]);
    setDemoTransactions([]);
    // Clear demo data from localStorage
    localStorage.removeItem('demo_mode');
  };

  // Check if demo mode is enabled on app start
  useEffect(() => {
    const demoMode = localStorage.getItem('demo_mode');
    if (demoMode === 'true') {
      setIsDemoMode(true);
      setDemoBalance(demoData.balance);
      setDemoInvestments([]);
      setDemoTransactions([]);
    }
  }, []);

  // Demo balance management functions
  const demoDeposit = async (amount) => {
    const depositAmount = parseFloat(amount);
    const newBalance = demoBalance + depositAmount;
    setDemoBalance(newBalance);
    
    const transaction = {
      id: Date.now(),
      type: 'Deposit',
      amount: depositAmount,
      date: new Date().toISOString(),
      status: 'Completed'
    };
    
    setDemoTransactions(prev => [transaction, ...prev]);
    return { success: true, newBalance, transaction };
  };

  const demoWithdraw = async (amount) => {
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > demoBalance) {
      throw new Error('Insufficient balance');
    }
    
    const newBalance = demoBalance - withdrawAmount;
    setDemoBalance(newBalance);
    
    const transaction = {
      id: Date.now(),
      type: 'Withdraw',
      amount: withdrawAmount,
      date: new Date().toISOString(),
      status: 'Completed'
    };
    
    setDemoTransactions(prev => [transaction, ...prev]);
    return { success: true, newBalance, transaction };
  };

  const demoInvest = async (investmentData) => {
    const investAmount = parseFloat(investmentData.amount);
    if (investAmount > demoBalance) {
      throw new Error('Insufficient balance');
    }
    
    const newBalance = demoBalance - investAmount;
    setDemoBalance(newBalance);
    
    const investment = {
      id: Date.now(),
      ...investmentData,
      amount: investAmount,
      date: new Date().toISOString(),
      status: 'Active'
    };
    
    setDemoInvestments(prev => [investment, ...prev]);
    
    const transaction = {
      id: Date.now() + 1,
      type: 'Investment',
      amount: investAmount,
      asset: investmentData.coin || investmentData.plan || investmentData.name || 'Investment',
      date: new Date().toISOString(),
      status: 'Completed'
    };
    
    setDemoTransactions(prev => [transaction, ...prev]);
    return { success: true, newBalance, investment, transaction };
  };

  const demoBuyCrypto = async (cryptoData) => {
    const { coin, amount, price } = cryptoData;
    const investAmount = parseFloat(amount);
    const coinPrice = parseFloat(price);
    
    if (investAmount > demoBalance) {
      throw new Error('Insufficient balance');
    }
    
    const quantity = investAmount / coinPrice;
    const newBalance = demoBalance - investAmount;
    setDemoBalance(newBalance);
    
    const investment = {
      id: Date.now(),
      coin: coin,
      amount: investAmount,
      quantity: quantity,
      priceAtPurchase: coinPrice,
      date: new Date().toISOString(),
      status: 'Active',
      type: 'crypto'
    };
    
    setDemoInvestments(prev => [investment, ...prev]);
    
    const transaction = {
      id: Date.now() + 1,
      type: 'Crypto Purchase',
      amount: investAmount,
      asset: coin,
      quantity: quantity,
      price: coinPrice,
      date: new Date().toISOString(),
      status: 'Completed'
    };
    
    setDemoTransactions(prev => [transaction, ...prev]);
    return { success: true, newBalance, investment, transaction };
  };

  const demoSellCrypto = async (sellData) => {
    const { investmentId, amount, price } = sellData;
    const sellAmount = parseFloat(amount);
    const coinPrice = parseFloat(price);
    
    // Find the investment
    const investment = demoInvestments.find(inv => inv.id === investmentId);
    if (!investment) {
      throw new Error('Investment not found');
    }
    
    const sellValue = sellAmount * coinPrice;
    const newBalance = demoBalance + sellValue;
    setDemoBalance(newBalance);
    
    // Update or remove investment
    setDemoInvestments(prev => {
      return prev.map(inv => {
        if (inv.id === investmentId) {
          const newQuantity = inv.quantity - sellAmount;
          if (newQuantity <= 0) {
            return null; // Will be filtered out
          }
          return {
            ...inv,
            quantity: newQuantity,
            amount: newQuantity * inv.priceAtPurchase
          };
        }
        return inv;
      }).filter(Boolean);
    });
    
    const transaction = {
      id: Date.now(),
      type: 'Crypto Sale',
      amount: sellValue,
      asset: investment.coin,
      quantity: sellAmount,
      price: coinPrice,
      date: new Date().toISOString(),
      status: 'Completed'
    };
    
    setDemoTransactions(prev => [transaction, ...prev]);
    return { success: true, newBalance, transaction };
  };

  const value = {
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    demoBalance,
    demoInvestments,
    demoTransactions,
    
    // Demo transaction functions
    demoDeposit,
    demoWithdraw,
    demoInvest,
    demoBuyCrypto,
    demoSellCrypto,
    
    // Setters for manual updates
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