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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('admin_access_token', response.data.access);
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
  register: (data) => userApi.post('/auth/register/', data),
  login: (email, password) => userApi.post('/auth/login/', { email, password }),
  verifyEmail: (token) => userApi.post('/auth/verify-email/', { token }),
  forgotPassword: (email) => userApi.post('/auth/forgot-password/', { email }),
  resetPassword: (token, password, password2) =>
    userApi.post('/auth/reset-password/', { token, password, password2 }),
  getCurrentUser: () => userApi.get('/auth/me/'),
  getProfile: () => userApi.get('/auth/profile/'),
  updateProfile: (data) => {
    // If data is FormData, don't set Content-Type (let browser set it)
    if (data instanceof FormData) {
      return userApi.put('/auth/profile/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Otherwise send as JSON
    return userApi.put('/auth/profile/', data);
  },
  getSettings: () => userApi.get('/auth/settings/'),
  updateSettings: (data) => userApi.put('/auth/settings/', data),
  changePassword: (oldPassword, newPassword, newPassword2) =>
    userApi.post('/auth/change-password/', { old_password: oldPassword, new_password: newPassword, new_password2: newPassword2 }),
  getBalance: () => userApi.get('/auth/balance/'),
  getReferrals: () => userApi.get('/auth/referrals/'),
  getReferralStats: () => userApi.get('/auth/referral-stats/'),
};

// Admin Auth API
export const adminAuthAPI = {
  login: (email, password) => adminApi.post('/auth/login/', { email, password }),
  getCurrentUser: () => adminApi.get('/auth/me/'),
  getAdminUsers: () => adminApi.get('/auth/admin/users/'),
  getUserDetail: (userId) => adminApi.get(`/auth/admin/users/${userId}/`),
  updateUser: (userId, data) => adminApi.put(`/auth/admin/users/${userId}/`, data),
  deleteUser: (userId) => adminApi.delete(`/auth/admin/users/${userId}/`),
  verifyUser: (userId, action = 'verify') => adminApi.post(`/auth/admin/users/${userId}/verify/`, { action }),
  suspendUser: (userId, action = 'suspend') => adminApi.post(`/auth/admin/users/${userId}/suspend/`, { action }),
  resetUserPassword: (userId, password) => adminApi.post(`/auth/admin/users/${userId}/reset-password/`, { password }),
};

// Investments API (user)
export const investmentsAPI = {
  getInvestments: () => userApi.get('/investments/'),
  createInvestment: (data) => userApi.post('/investments/', data),
  getInvestment: (id) => userApi.get(`/investments/${id}/`),
};

// Trading API (user)
export const tradingAPI = {
  createTrade: (data) => userApi.post('/investments/trades/', data),
  getTrades: () => userApi.get('/investments/trades/'),
  getTrade: (id) => userApi.get(`/investments/trades/${id}/`),
  closeTrade: (id, data) => userApi.post(`/investments/trades/${id}/close/`, data),
  updateTradePrice: (id, data) => userApi.post(`/investments/trades/${id}/update_price/`, data),
  getOpenTrades: () => userApi.get('/investments/trades/open_trades/'),
  getClosedTrades: () => userApi.get('/investments/trades/closed_trades/'),
  getTradeHistory: () => userApi.get('/investments/trades/history/'),
};

// Add trading methods to userAuthAPI for convenience
userAuthAPI.createTrade = (data) => tradingAPI.createTrade(data);
userAuthAPI.getTrades = () => tradingAPI.getTrades();
userAuthAPI.closeTrade = (id, data) => tradingAPI.closeTrade(id, data);
userAuthAPI.getOpenTrades = () => tradingAPI.getOpenTrades();
userAuthAPI.getClosedTrades = () => tradingAPI.getClosedTrades();
userAuthAPI.getTradeHistory = () => tradingAPI.getTradeHistory();

// Transactions API (user)
export const transactionsAPI = {
  getTransactions: () => userApi.get('/transactions/'),
  getTransaction: (id) => userApi.get(`/transactions/${id}/`),
};

// Referrals API (user)
export const referralsAPI = {
  getReferrals: () => userApi.get('/referrals/'),
};

// Notifications API (user)
export const notificationsAPI = {
  getNotifications: () => userApi.get('/notifications/'),
};

// Keep old authAPI for backward compatibility
export const authAPI = userAuthAPI;

export default userApi;
