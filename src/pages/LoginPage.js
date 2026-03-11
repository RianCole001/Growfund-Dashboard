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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-600 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your GrowFund account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition text-gray-800" 
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition text-gray-800" 
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="flex items-center justify-end">
            <Link to="/forgot" className="text-sm text-green-600 hover:text-green-700 transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition-colors font-semibold shadow-md"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}