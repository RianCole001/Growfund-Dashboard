export const demoData = {
  user: {
    id: 1,
    email: 'demo@growfund.com',
    first_name: 'John',
    last_name: 'Demo',
    is_verified: true,
    referralCode: 'DEMO2024',
    date_joined: '2024-01-01T00:00:00Z'
  },

  profile: {
    name: 'John Demo',
    email: 'demo@growfund.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    occupation: 'Software Developer',
    company: 'Tech Corp',
    website: 'https://johndemo.com',
    bio: 'Passionate investor exploring the world of digital assets and financial growth.',
    avatar: null
  },

  balance: 15750.00,

  investments: [
    {
      id: 1,
      coin: 'EXACOIN',
      amount: 5000,
      quantity: 83.333,
      priceAtPurchase: 60.00,
      date: '2024-02-10T10:30:00Z',
      status: 'Active'
    },
    {
      id: 2,
      plan: 'Capital Plan - Standard',
      plan_type: 'standard',
      amount: 3000,
      months: 12,
      growth_rate: 30,
      date: '2024-02-05T14:20:00Z',
      status: 'Active'
    },
    {
      id: 3,
      coin: 'BTC',
      amount: 2500,
      quantity: 0.0388,
      priceAtPurchase: 64400,
      date: '2024-02-01T09:15:00Z',
      status: 'Active'
    },
    {
      id: 4,
      plan: 'Capital Plan - Basic',
      plan_type: 'basic',
      amount: 1500,
      months: 6,
      growth_rate: 20,
      date: '2024-01-28T16:45:00Z',
      status: 'Active'
    },
    {
      id: 5,
      asset: 'Real Estate',
      name: 'Premium Property',
      amount: 8000,
      rate: 30,
      date: '2024-01-20T11:30:00Z',
      status: 'Active'
    },
    {
      id: 6,
      coin: 'ETH',
      amount: 1800,
      quantity: 0.5625,
      priceAtPurchase: 3200,
      date: '2024-01-15T13:20:00Z',
      status: 'Active'
    }
  ],

  transactions: [
    {
      id: 1,
      type: 'Investment',
      amount: 5000,
      asset: 'EXACOIN',
      date: '2024-02-10T10:30:00Z',
      status: 'Completed'
    },
    {
      id: 2,
      type: 'Deposit',
      amount: 10000,
      date: '2024-02-08T15:45:00Z',
      status: 'Completed'
    },
    {
      id: 3,
      type: 'Investment',
      amount: 3000,
      asset: 'Capital Plan - Standard',
      date: '2024-02-05T14:20:00Z',
      status: 'Completed'
    },
    {
      id: 4,
      type: 'Investment',
      amount: 2500,
      asset: 'BTC',
      date: '2024-02-01T09:15:00Z',
      status: 'Completed'
    },
    {
      id: 5,
      type: 'Deposit',
      amount: 5000,
      date: '2024-01-30T12:00:00Z',
      status: 'Completed'
    },
    {
      id: 6,
      type: 'Investment',
      amount: 1500,
      asset: 'Capital Plan - Basic',
      date: '2024-01-28T16:45:00Z',
      status: 'Completed'
    },
    {
      id: 7,
      type: 'Investment',
      amount: 8000,
      asset: 'Real Estate',
      date: '2024-01-20T11:30:00Z',
      status: 'Completed'
    },
    {
      id: 8,
      type: 'Investment',
      amount: 1800,
      asset: 'ETH',
      date: '2024-01-15T13:20:00Z',
      status: 'Completed'
    },
    {
      id: 9,
      type: 'Deposit',
      amount: 15000,
      date: '2024-01-10T10:00:00Z',
      status: 'Completed'
    },
    {
      id: 10,
      type: 'Withdraw',
      amount: 2000,
      date: '2024-01-05T14:30:00Z',
      status: 'Completed'
    }
  ],

  prices: {
    EXACOIN: {
      price: 60.00,
      change24h: 45.2,
      change7d: 12.8,
      change30d: 89.5
    },
    BTC: {
      price: 64444,
      change24h: 2.1,
      change7d: -1.5,
      change30d: 8.7
    },
    ETH: {
      price: 3200,
      change24h: 1.8,
      change7d: 3.2,
      change30d: 15.4
    },
    BNB: {
      price: 420,
      change24h: -0.5,
      change7d: 2.1,
      change30d: 12.3
    },
    ADA: {
      price: 1.25,
      change24h: 3.4,
      change7d: -2.1,
      change30d: 18.9
    },
    SOL: {
      price: 120,
      change24h: 5.2,
      change7d: 8.1,
      change30d: 25.6
    },
    DOT: {
      price: 6.4,
      change24h: -1.2,
      change7d: 4.5,
      change30d: 9.8
    }
  },

  notifications: [
    {
      id: 1,
      title: 'Investment Completed',
      message: 'Your EXACOIN investment of $5,000 has been successfully processed.',
      type: 'success',
      date: '2024-02-10T10:30:00Z',
      read: false
    },
    {
      id: 2,
      title: 'Deposit Confirmed',
      message: 'Your deposit of $10,000 has been credited to your account.',
      type: 'info',
      date: '2024-02-08T15:45:00Z',
      read: true
    },
    {
      id: 3,
      title: 'Monthly Returns',
      message: 'Your Capital Plan investment has generated $450 in returns this month.',
      type: 'success',
      date: '2024-02-01T00:00:00Z',
      read: true
    },
    {
      id: 4,
      title: 'Price Alert',
      message: 'EXACOIN has reached your target price of $60.',
      type: 'warning',
      date: '2024-01-28T09:15:00Z',
      read: true
    }
  ],

  referralStats: {
    referralCode: 'DEMO2024',
    totalReferrals: 12,
    totalEarnings: 2450.00,
    pendingEarnings: 150.00,
    referrals: [
      {
        id: 1,
        email: 'alice@example.com',
        joinDate: '2024-01-15T00:00:00Z',
        earnings: 250.00,
        status: 'Active'
      },
      {
        id: 2,
        email: 'bob@example.com',
        joinDate: '2024-01-20T00:00:00Z',
        earnings: 180.00,
        status: 'Active'
      },
      {
        id: 3,
        email: 'charlie@example.com',
        joinDate: '2024-02-01T00:00:00Z',
        earnings: 320.00,
        status: 'Active'
      },
      {
        id: 4,
        email: 'diana@example.com',
        joinDate: '2024-02-05T00:00:00Z',
        earnings: 95.00,
        status: 'Pending'
      }
    ]
  }
};

// Demo credentials for easy access
export const demoCredentials = {
  email: 'demo@growfund.com',
  password: 'demo123'
};

// Helper function to generate realistic price fluctuations
export const generatePriceUpdate = (currentPrice, volatility = 0.02) => {
  const change = (Math.random() - 0.5) * volatility;
  return Math.max(0.01, currentPrice * (1 + change));
};

// Helper function to add new demo transaction
export const createDemoTransaction = (type, amount, asset = null) => {
  return {
    id: Date.now(),
    type,
    amount: parseFloat(amount),
    asset,
    date: new Date().toISOString(),
    status: 'Completed'
  };
};

// Helper function to add new demo investment
export const createDemoInvestment = (investmentData) => {
  return {
    id: Date.now(),
    ...investmentData,
    date: new Date().toISOString(),
    status: 'Active'
  };
};