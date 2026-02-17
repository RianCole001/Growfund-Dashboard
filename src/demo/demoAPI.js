import { demoData, createDemoTransaction, createDemoInvestment } from './demoData';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class DemoAPI {
  constructor() {
    this.isDemo = true;
  }

  // Authentication
  async login(email, password) {
    await delay(800);
    
    if (email === 'demo@growfund.com' && password === 'demo123') {
      return {
        data: {
          user: demoData.user,
          tokens: {
            access: 'demo_token_12345',
            refresh: 'demo_refresh_12345'
          }
        }
      };
    }
    
    throw new Error('Invalid demo credentials. Use demo@growfund.com / demo123');
  }

  async register(userData) {
    await delay(1000);
    
    // Simulate successful registration
    return {
      data: {
        user: {
          ...demoData.user,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName
        },
        message: 'Demo account created successfully'
      }
    };
  }

  async getCurrentUser() {
    await delay(300);
    return { data: demoData.user };
  }

  async getProfile() {
    await delay(300);
    return { data: demoData.profile };
  }

  async updateProfile(profileData) {
    await delay(500);
    
    // Update demo profile
    const updatedProfile = { ...demoData.profile, ...profileData };
    Object.assign(demoData.profile, updatedProfile);
    
    return { data: updatedProfile };
  }

  // Balance and Transactions
  async getBalance() {
    await delay(200);
    return { data: { balance: demoData.balance } };
  }

  async deposit(amount, method = 'bank') {
    await delay(1000);
    
    const depositAmount = parseFloat(amount);
    demoData.balance += depositAmount;
    
    const transaction = createDemoTransaction('Deposit', depositAmount);
    demoData.transactions.unshift(transaction);
    
    return {
      data: {
        transaction,
        newBalance: demoData.balance,
        message: 'Deposit successful'
      }
    };
  }

  async withdraw(amount, method = 'bank') {
    await delay(1200);
    
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > demoData.balance) {
      throw new Error('Insufficient balance');
    }
    
    demoData.balance -= withdrawAmount;
    
    const transaction = createDemoTransaction('Withdraw', withdrawAmount);
    demoData.transactions.unshift(transaction);
    
    return {
      data: {
        transaction,
        newBalance: demoData.balance,
        message: 'Withdrawal successful'
      }
    };
  }

  async getTransactions() {
    await delay(300);
    return { data: demoData.transactions };
  }

  // Investments
  async getInvestments() {
    await delay(400);
    return { data: demoData.investments };
  }

  async createInvestment(investmentData) {
    await delay(800);
    
    const amount = parseFloat(investmentData.amount);
    
    if (amount > demoData.balance) {
      throw new Error('Insufficient balance');
    }
    
    // Deduct from balance
    demoData.balance -= amount;
    
    // Create investment
    const investment = createDemoInvestment(investmentData);
    demoData.investments.unshift(investment);
    
    // Create transaction record
    const transaction = createDemoTransaction(
      'Investment', 
      amount, 
      investmentData.coin || investmentData.plan || investmentData.name
    );
    demoData.transactions.unshift(transaction);
    
    return {
      data: {
        investment,
        transaction,
        newBalance: demoData.balance,
        message: 'Investment created successfully'
      }
    };
  }

  // Crypto prices
  async getCryptoPrices() {
    await delay(200);
    
    // Simulate small price fluctuations
    const updatedPrices = { ...demoData.prices };
    Object.keys(updatedPrices).forEach(symbol => {
      const change = (Math.random() - 0.5) * 0.01; // ±0.5% change
      updatedPrices[symbol] = {
        ...updatedPrices[symbol],
        price: Math.max(0.01, updatedPrices[symbol].price * (1 + change))
      };
    });
    
    return { data: updatedPrices };
  }

  // Referral system
  async getReferralStats() {
    await delay(300);
    return { data: demoData.referralStats };
  }

  async generateReferralCode() {
    await delay(500);
    
    const newCode = 'DEMO' + Math.random().toString(36).substr(2, 6).toUpperCase();
    demoData.user.referralCode = newCode;
    demoData.referralStats.referralCode = newCode;
    
    return { data: { referralCode: newCode } };
  }

  // Notifications
  async getNotifications() {
    await delay(200);
    return { data: demoData.notifications };
  }

  async markNotificationAsRead(notificationId) {
    await delay(100);
    
    const notification = demoData.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    return { data: { success: true } };
  }

  // Capital Plans
  async getCapitalPlans() {
    await delay(300);
    
    const plans = [
      {
        id: 1,
        name: 'Basic',
        rate: 20,
        minAmount: 100,
        description: 'Steady growth with 20% monthly returns'
      },
      {
        id: 2,
        name: 'Standard',
        rate: 30,
        minAmount: 500,
        description: 'Balanced growth with 30% monthly returns'
      },
      {
        id: 3,
        name: 'Advance',
        rate: 40,
        minAmount: 2000,
        description: 'Maximum growth with 40-60% monthly returns'
      }
    ];
    
    return { data: plans };
  }

  // Real Estate
  async getRealEstateOptions() {
    await delay(300);
    
    const options = [
      {
        id: 1,
        name: 'Starter Property',
        rate: 20,
        minAmount: 1000,
        description: 'Entry-level real estate investment'
      },
      {
        id: 2,
        name: 'Premium Property',
        rate: 30,
        minAmount: 5000,
        description: 'Mid-tier real estate investment'
      },
      {
        id: 3,
        name: 'Luxury Estate',
        rate: 50,
        minAmount: 20000,
        description: 'High-end real estate investment'
      }
    ];
    
    return { data: options };
  }

  // Admin functions (for demo admin panel)
  async getAdminStats() {
    await delay(400);
    
    return {
      data: {
        totalUsers: 1247,
        totalInvestments: 89650000,
        totalDeposits: 125000000,
        totalWithdrawals: 45000000,
        activeInvestments: 3456,
        pendingWithdrawals: 23,
        newUsersToday: 12,
        revenueToday: 45000
      }
    };
  }

  async getAdminUsers() {
    await delay(500);
    
    const users = [
      {
        id: 1,
        email: 'demo@growfund.com',
        name: 'John Demo',
        balance: 15750,
        totalInvested: 21800,
        joinDate: '2024-01-01',
        status: 'Active'
      },
      // Add more demo users...
    ];
    
    return { data: users };
  }
}

export const demoAPI = new DemoAPI();