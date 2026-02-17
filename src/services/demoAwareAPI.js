import { userAuthAPI } from './api';
import { demoData } from '../demo/demoData';

// Check if demo mode is active
const isDemoMode = () => {
  return localStorage.getItem('demo_mode') === 'true';
};

// Demo-aware API wrapper - handles all operations in demo mode
class DemoAwareAPI {
  // Authentication - always use real API
  async login(email, password) {
    return userAuthAPI.login(email, password);
  }

  async register(userData) {
    return userAuthAPI.register(userData);
  }

  async getCurrentUser() {
    return userAuthAPI.getCurrentUser();
  }

  async getProfile() {
    return userAuthAPI.getProfile();
  }

  async updateProfile(profileData) {
    return userAuthAPI.updateProfile(profileData);
  }

  // Balance operations - use demo balance if in demo mode
  async getBalance() {
    if (isDemoMode()) {
      // Get demo balance from DemoContext (will be managed there)
      return { data: { balance: demoData.balance } };
    }
    return userAuthAPI.getBalance();
  }

  async deposit(amount, method = 'bank') {
    if (isDemoMode()) {
      // Demo deposit - handled by DemoContext
      return {
        data: {
          transaction: {
            id: Date.now(),
            type: 'Deposit',
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            status: 'Completed'
          },
          message: 'Demo deposit successful'
        }
      };
    }
    return userAuthAPI.deposit(amount, method);
  }

  async withdraw(amount, method = 'bank') {
    if (isDemoMode()) {
      // Demo withdrawal - handled by DemoContext
      return {
        data: {
          transaction: {
            id: Date.now(),
            type: 'Withdraw',
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            status: 'Completed'
          },
          message: 'Demo withdrawal successful'
        }
      };
    }
    return userAuthAPI.withdraw(amount, method);
  }

  // Transactions - use demo transactions if in demo mode
  async getTransactions() {
    if (isDemoMode()) {
      // Demo transactions managed by DemoContext
      return { data: [] };
    }
    return userAuthAPI.getTransactions();
  }

  // Investments - use demo investments if in demo mode
  async getInvestments() {
    if (isDemoMode()) {
      // Demo investments managed by DemoContext
      return { data: [] };
    }
    return userAuthAPI.getInvestments();
  }

  async createInvestment(investmentData) {
    if (isDemoMode()) {
      // Demo investment - handled by DemoContext
      return {
        data: {
          investment: {
            id: Date.now(),
            ...investmentData,
            date: new Date().toISOString(),
            status: 'Active'
          },
          message: 'Demo investment created successfully'
        }
      };
    }
    return userAuthAPI.createInvestment(investmentData);
  }

  // Crypto operations
  async buyCrypto(cryptoData) {
    if (isDemoMode()) {
      // Demo crypto purchase - handled by DemoContext
      return {
        data: {
          investment: {
            id: Date.now(),
            ...cryptoData,
            date: new Date().toISOString(),
            status: 'Active'
          },
          message: 'Demo crypto purchase successful'
        }
      };
    }
    return userAuthAPI.buyCrypto ? userAuthAPI.buyCrypto(cryptoData) : this.createInvestment(cryptoData);
  }

  async sellCrypto(sellData) {
    if (isDemoMode()) {
      // Demo crypto sale - handled by DemoContext
      return {
        data: {
          transaction: {
            id: Date.now(),
            type: 'Crypto Sale',
            ...sellData,
            date: new Date().toISOString(),
            status: 'Completed'
          },
          message: 'Demo crypto sale successful'
        }
      };
    }
    return userAuthAPI.sellCrypto ? userAuthAPI.sellCrypto(sellData) : { data: { success: true } };
  }

  async getCryptoPrices() {
    // Always use real crypto prices
    return userAuthAPI.getCryptoPrices ? userAuthAPI.getCryptoPrices() : { data: demoData.prices };
  }

  async getReferralStats() {
    return userAuthAPI.getReferralStats();
  }

  async generateReferralCode() {
    return userAuthAPI.generateReferralCode();
  }

  async getNotifications() {
    return userAuthAPI.getNotifications ? userAuthAPI.getNotifications() : { data: [] };
  }

  async markNotificationAsRead(notificationId) {
    return userAuthAPI.markNotificationAsRead ? userAuthAPI.markNotificationAsRead(notificationId) : { data: { success: true } };
  }

  async getCapitalPlans() {
    return userAuthAPI.getCapitalPlans ? userAuthAPI.getCapitalPlans() : { data: [] };
  }

  async getRealEstateOptions() {
    return userAuthAPI.getRealEstateOptions ? userAuthAPI.getRealEstateOptions() : { data: [] };
  }

  async getAdminStats() {
    return userAuthAPI.getAdminStats ? userAuthAPI.getAdminStats() : { data: {} };
  }

  async getAdminUsers() {
    return userAuthAPI.getAdminUsers ? userAuthAPI.getAdminUsers() : { data: [] };
  }

  // Utility methods
  isDemoMode() {
    return isDemoMode();
  }

  getTokenKey() {
    return 'user_access_token'; // Always use user tokens
  }

  getUserDataKey() {
    return 'user_data'; // Always use user data
  }
}

export const demoAwareAPI = new DemoAwareAPI();

// Export individual methods for backward compatibility
export const {
  login,
  register,
  getCurrentUser,
  getProfile,
  updateProfile,
  getBalance,
  deposit,
  withdraw,
  getTransactions,
  getInvestments,
  createInvestment,
  getCryptoPrices,
  getReferralStats,
  generateReferralCode,
  getNotifications,
  markNotificationAsRead,
  getCapitalPlans,
  getRealEstateOptions,
  getAdminStats,
  getAdminUsers
} = demoAwareAPI;