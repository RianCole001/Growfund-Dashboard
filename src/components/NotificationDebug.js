import React, { useState } from 'react';
import { userAuthAPI } from '../services/api';

export default function NotificationDebug() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testNotifications = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 Testing notification API...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('user_access_token');
      console.log('🔑 User token:', token ? `${token.substring(0, 20)}...` : 'No token found');
      
      // Test the API call
      const response = await userAuthAPI.getNotifications();
      console.log('📊 API Response:', response);
      
      setResult({
        success: true,
        data: response.data,
        message: 'API call successful'
      });
      
    } catch (error) {
      console.error('❌ API Error:', error);
      
      setResult({
        success: false,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        message: 'API call failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    const userToken = localStorage.getItem('user_access_token');
    const refreshToken = localStorage.getItem('user_refresh_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('🔍 Auth Check:');
    console.log('- User Token:', userToken ? 'Present' : 'Missing');
    console.log('- Refresh Token:', refreshToken ? 'Present' : 'Missing');
    console.log('- User Data:', userData ? JSON.parse(userData) : 'Missing');
    
    setResult({
      success: true,
      auth: {
        hasUserToken: !!userToken,
        hasRefreshToken: !!refreshToken,
        userData: userData ? JSON.parse(userData) : null
      },
      message: 'Auth check completed'
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 max-w-md">
      <h3 className="text-white font-bold mb-3">Notification Debug</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testNotifications}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
        >
          {loading ? 'Testing...' : 'Test Notifications API'}
        </button>
        
        <button
          onClick={checkAuth}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
        >
          Check Authentication
        </button>
      </div>
      
      {result && (
        <div className="bg-gray-700 p-3 rounded text-xs">
          <div className={`font-bold mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
            {result.message}
          </div>
          
          {result.data && (
            <div className="text-gray-300">
              <div>Success: {result.data.success ? 'Yes' : 'No'}</div>
              <div>Data Count: {result.data.data?.length || 0}</div>
              <div>Unread: {result.data.unread_count || 0}</div>
            </div>
          )}
          
          {result.auth && (
            <div className="text-gray-300">
              <div>User Token: {result.auth.hasUserToken ? '✅' : '❌'}</div>
              <div>Refresh Token: {result.auth.hasRefreshToken ? '✅' : '❌'}</div>
              <div>User Email: {result.auth.userData?.email || 'N/A'}</div>
            </div>
          )}
          
          {result.error && (
            <div className="text-red-400">
              <div>Error: {result.error}</div>
              <div>Status: {result.status}</div>
              {result.response && (
                <div>Response: {JSON.stringify(result.response, null, 2)}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}