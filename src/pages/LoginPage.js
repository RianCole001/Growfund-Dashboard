import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { demoAwareAPI } from '../services/demoAwareAPI';
import { useUserAuth } from '../auth/UserAuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useUserAuth();

  const from = location.state && location.state.from ? location.state.from.pathname : '/app';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await demoAwareAPI.login(email, password);
      
      // Store tokens with user prefix
      localStorage.setItem('user_access_token', response.data.tokens.access);
      localStorage.setItem('user_refresh_token', response.data.tokens.refresh);
      
      // Update auth context
      loginUser(response.data.tokens.access, response.data.user);
      toast.success('Login successful!');
      
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to login';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl font-semibold text-green-500 mb-4">Sign in to GrowFund</h2>
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="mt-1 w-full bg-gray-700 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none" 
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="mt-1 w-full bg-gray-700 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none" 
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:opacity-50 transition-colors font-semibold"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <Link to="/forgot" className="text-sm text-gray-300 hover:text-green-400 transition-colors">Forgot password?</Link>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Don't have an account? <Link to="/register" className="text-green-400 hover:text-green-300 transition-colors">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}