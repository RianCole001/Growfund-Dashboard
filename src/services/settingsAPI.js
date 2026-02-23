import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://growfun-backend.onrender.com' 
  : 'http://localhost:8000';

// Create axios instance for settings API (no auth required for public settings)
const settingsAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/settings`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Settings API functions
export const settingsService = {
  // Get public platform settings (no auth required)
  getPublicSettings: async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await settingsAPI.get(`/public/?t=${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public settings:', error);
      throw error;
    }
  },

  // Admin settings (requires admin auth)
  getAdminSettings: async () => {
    try {
      const token = localStorage.getItem('admin_access_token');
      const timestamp = new Date().getTime();
      const response = await settingsAPI.get(`/admin/settings/?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      throw error;
    }
  },

  updateAdminSettings: async (settings) => {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await settingsAPI.put('/admin/settings/', settings, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  }
};

export default settingsService;