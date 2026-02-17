// Demo System Test
// This file can be used to test demo functionality

import { demoData } from './demoData';
import { demoAPI } from './demoAPI';
import { demoAwareAPI } from '../services/demoAwareAPI';

// Test demo data integrity
export const testDemoData = () => {
  console.log('🧪 Testing Demo Data...');
  
  // Test user data
  console.assert(demoData.user.email === 'demo@growfund.com', 'Demo user email should be demo@growfund.com');
  console.assert(demoData.balance === 15750.00, 'Demo balance should be $15,750');
  console.assert(demoData.investments.length === 6, 'Should have 6 demo investments');
  console.assert(demoData.transactions.length === 10, 'Should have 10 demo transactions');
  console.assert(Object.keys(demoData.prices).length === 7, 'Should have 7 crypto prices');
  
  console.log('✅ Demo data integrity test passed!');
};

// Test demo API functionality
export const testDemoAPI = async () => {
  console.log('🧪 Testing Demo API...');
  
  try {
    // Test login
    const loginResult = await demoAPI.login('demo@growfund.com', 'demo123');
    console.assert(loginResult.data.user.email === 'demo@growfund.com', 'Demo login should work');
    
    // Test balance
    const balanceResult = await demoAPI.getBalance();
    console.assert(balanceResult.data.balance === 15750.00, 'Demo balance API should work');
    
    // Test investments
    const investmentsResult = await demoAPI.getInvestments();
    console.assert(investmentsResult.data.length === 6, 'Demo investments API should work');
    
    // Test deposit
    const depositResult = await demoAPI.deposit(1000);
    console.assert(depositResult.data.newBalance === 16750.00, 'Demo deposit should work');
    
    console.log('✅ Demo API test passed!');
  } catch (error) {
    console.error('❌ Demo API test failed:', error);
  }
};

// Test demo-aware API switching
export const testDemoAwareAPI = async () => {
  console.log('🧪 Testing Demo-Aware API...');
  
  try {
    // Enable demo mode in localStorage
    localStorage.setItem('demo_mode', 'true');
    
    // Test that demo-aware API uses demo data
    const balanceResult = await demoAwareAPI.getBalance();
    console.assert(balanceResult.data.balance === 15750.00, 'Demo-aware API should use demo data when in demo mode');
    
    // Clean up
    localStorage.removeItem('demo_mode');
    
    console.log('✅ Demo-aware API test passed!');
  } catch (error) {
    console.error('❌ Demo-aware API test failed:', error);
  }
};

// Run all tests
export const runAllDemoTests = async () => {
  console.log('🚀 Running Demo System Tests...');
  
  testDemoData();
  await testDemoAPI();
  await testDemoAwareAPI();
  
  console.log('🎉 All demo tests completed!');
};

// Export for use in browser console
window.demoTests = {
  testDemoData,
  testDemoAPI,
  testDemoAwareAPI,
  runAllDemoTests
};