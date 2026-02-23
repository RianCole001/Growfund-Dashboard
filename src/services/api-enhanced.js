import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance for user requests
const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for admin requests
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API interceptors
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('user_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('user_access_token', response.data.access);
          userApi.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
          return userApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('user_access_token');
        localStorage.removeItem('user_refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Admin API interceptors
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      coTradeHistory: () => userApi.get('/investments/trades/history/'),
};

// Investments API (user)
export const investmentsAPI = {
  getInvestments: () => userApi.get('/investments/'),
  createInvestment: (data) => userApi.post('/investments/', data),
  getInvestment: (id) => userApi.get(`/investments/${id}/`),
};

// Transactions API (user)
export const transactionsAPI = {
  getTransactions: () => userApi.get('/transactions/'),
  getTransaction: (id) ta),
  getOpenTrades: () => userApi.get('/investments/trades/open_trades/'),
  getClosedTrades: () => userApi.get('/investments/trades/closed_trades/'),
  get adminApi.get('/settings/'),
  updatePlatformSettings: (data) => adminApi.put('/settings/', data),
};

// Trading API (user)
export const tradingAPI = {
  createTrade: (data) => userApi.post('/investments/trades/', data),
  getTrades: () => userApi.get('/investments/trades/'),
  getTrade: (id) => userApi.get(`/investments/trades/${id}/`),
  closeTrade: (id, data) => userApi.post(`/investments/trades/${id}/close/`, data),
  updateTradePrice: (id, data) => userApi.post(`/investments/trades/${id}/update_price/`, dats/'),
  getTransactions: () => adminApi.get('/admin/transactions/'),
  
  // Settings
  getPlatformSettings: () =>> adminApi.get('/admin/deposits/'),
  approveDeposit: (id, data) => adminApi.post(`/admin/deposits/${id}/approve/`, data),
  rejectDeposit: (id, data) => adminApi.post(`/admin/deposits/${id}/reject/`, data),
  
  getWithdrawals: () => adminApi.get('/admin/withdrawals/'),
  approveWithdrawal: (id, data) => adminApi.post(`/admin/withdrawals/${id}/approve/`, data),
  rejectWithdrawal: (id, data) => adminApi.post(`/admin/withdrawals/${id}/reject/`, data),
  
  getInvestments: () => adminApi.get('/admin/investmences: (data) => adminApi.post('/investments/admin/crypto-prices/bulk-update/', data),
  
  // Transaction Management
  getDeposits: () =,
  deleteNotification: (id) => adminApi.delete(`/notifications/admin/notifications/${id}/`),
  
  // Crypto Price Management
  getCryptoPrices: () => adminApi.get('/investments/admin/crypto-prices/'),
  updateCryptoPrice: (data) => adminApi.post('/investments/admin/crypto-prices/update/', data),
  toggleCryptoActive: (coin) => adminApi.post(`/investments/admin/crypto-prices/${coin}/toggle/`),
  getCryptoPriceHistory: (coin) => adminApi.get(`/investments/admin/crypto-prices/${coin}/history/`),
  bulkUpdateCryptoPriations/'),
  sendNotification: (data) => adminApi.post('/notifications/admin/send/', data): () => adminApi.get('/notifications/admin/notific suspendUser: (userId, action = 'suspend') => adminApi.post(`/auth/admin/users/${userId}/suspend/`, { action }),
  resetUserPassword: (userId, password) => adminApi.post(`/auth/admin/users/${userId}/reset-password/`, { password }),
  getSuspendedUsers: () => adminApi.get('/auth/admin/users/suspended/'),
  
  // Dashboard & Stats
  getDashboardStats: () => adminApi.get('/auth/admin/dashboard/'),
  getUserStats: () => adminApi.get('/auth/admin/users/stats/'),
  
  // Notifications Management
  getNotificationsApi.post(`/auth/admin/users/${userId}/verify/`, { action }),
 minAuthAPI = {
  login: (email, password) => adminApi.post('/auth/login/', { email, password }),
  getCurrentUser: () => adminApi.get('/auth/me/'),
  
  // User Management
  getAdminUsers: () => adminApi.get('/auth/admin/users/'),
  getUserDetail: (userId) => adminApi.get(`/auth/admin/users/${userId}/`),
  updateUser: (userId, data) => adminApi.put(`/auth/admin/users/${userId}/`, data),
  deleteUser: (userId) => adminApi.post(`/debug/admin/users/${userId}/delete/`),
  verifyUser: (userId, action = 'verify') => adminrApi.get(`/investments/${id}/`),
};

// Admin Auth API - Complete Integration
export const adithdraw/', { amount, method }),
  
  // Notifications
  getNotifications: () => userApi.get('/notifications/'),
  markNotificationRead: (id) => userApi.post(`/notifications/${id}/read/`),
  markAllNotificationsRead: () => userApi.post('/notifications/mark-all-read/'),
  deleteNotification: (id) => userApi.delete(`/notifications/${id}/delete/`),
  
  // Investments
  getInvestments: () => userApi.get('/investments/'),
  createInvestment: (data) => userApi.post('/investments/', data),
  getInvestment: (id) => usepost('/transactions/deposit/', { amount, method }),
  withdraw: (amount, method) => userApi.post('/transactions/woardStats: () => userApi.get('/auth/dashboard-stats/'),
  generateReferralCode: () => userApi.post('/auth/generate-referral-code/'),
  
  // Crypto & Trading
  getCryptoPrices: () => userApi.get('/crypto/prices/'),
  buyCrypto: (data) => userApi.post('/crypto/buy/', data),
  sellCrypto: (data) => userApi.post('/crypto/sell/', data),
  getCryptoPortfolio: () => userApi.get('/crypto/portfolio/'),
  
  // Transactions
  getTransactions: () => userApi.get('/transactions/'),
  deposit: (amount, method) => userApi./referrals/'),
  getReferralStats: () => userApi.get('/auth/referral-stats/'),
  getDashbent-Type': 'multipart/form-data',
        },
      });
    }
    return userApi.put('/auth/profile/', data);
  },
  getSettings: () => userApi.get('/auth/settings/'),
  updateSettings: (data) => userApi.put('/auth/settings/', data),
  changePassword: (oldPassword, newPassword, newPassword2) =>
    userApi.post('/auth/change-password/', { old_password: oldPassword, new_password: newPassword, new_password2: newPassword2 }),
  getBalance: () => userApi.get('/auth/balance/'),
  getReferrals: () => userApi.get('/auth instanceof FormData) {
      return userApi.put('/auth/profile/', data, {
        headers: {
          'Contter/', data),
  login: (email, password) => userApi.post('/auth/login/', { email, password }),
  verifyEmail: (token) => userApi.post('/auth/verify-email/', { token }),
  forgotPassword: (email) => userApi.post('/auth/forgot-password/', { email }),
  resetPassword: (token, password, password2) =>
    userApi.post('/auth/reset-password/', { token, password, password2 }),
  getCurrentUser: () => userApi.get('/auth/me/'),
  getProfile: () => userApi.get('/auth/profile/'),
  updateProfile: (data) => {
    if (data'/auth/regis;
          adminApi.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_data');
        window.location.href = '/admin';
      }
    }

    return Promise.reject(error);
  }
);

// User Auth API
export const userAuthAPI = {
  register: (data) => userApi.post(   refresh: refreshToken,
          });

          localStorage.setItem('admin_access_token', response.data.access)
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
         ken');
        if (refreshToken) {t._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_to{
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequesmise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  async (error) =>    }
    return config;
  },
  (error) => Pronfig.headers.Authorization = `Bearer ${token}`;
 