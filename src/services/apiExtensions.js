// API Extensions - Add these to your existing api.js file
// This file contains all missing API endpoints needed for full integration

import { adminApi, userApi } from './api';

// ============= ADMIN API EXTENSIONS =============

export const adminAPIExtensions = {
  // Notifications
  getNotifications: () => adminApi.get('/notifications/admin/notifications/'),
  sendNotification: (data) => adminApi.post('/notifications/admin/send/', data),
  deleteNotification: (id) => adminApi.delete(`/notifications/admin/notifications/${id}/`),
  
  // Dashboard Stats
  getDashboardStats: () => adminApi.get('/auth/admin/dashboard/'),
  getUserStats: () => adminApi.get('/auth/admin/users/stats/'),
  
  // Deposits Management
  getDeposits: () => adminApi.get('/admin/deposits/'),
  approveDeposit: (id) => adminApi.post(`/admin/deposits/${id}/approve/`),
  rejectDeposit: (id, reason) => adminApi.post(`/admin/deposits/${id}/reject/`, { reason }),
  
  // Withdrawals Management
  getWithdrawals: () => adminApi.get('/admin/withdrawals/'),
  approveWithdrawal: (id) => adminApi.post(`/admin/withdrawals/${id}/approve/`),
  rejectWithdrawal: (id, reason) => adminApi.post(`/admin/withdrawals/${id}/reject/`, { reason }),
  
  // Investments View
  getInvestments: () => adminApi.get('/admin/investments/'),
  
  // Transactions View
  getTransactions: () => adminApi.get('/admin/transactions/'),
  
  // Crypto Price Management
  getCryptoPrices: () => adminApi.get('/investments/admin/crypto-prices/'),
  updateCryptoPrice: (data) => adminApi.post('/investments/admin/crypto-prices/update/', data),
  bulkUpdatePrices: (data) => adminApi.post('/investments/admin/crypto-prices/bulk-update/', data),
  toggleCryptoActive: (coin) => adminApi.post(`/investments/admin/crypto-prices/${coin}/toggle/`),
  getPriceHistory: (coin) => adminApi.get(`/investments/admin/crypto-prices/${coin}/history/`),
};

// ============= USER API EXTENSIONS =============

exp