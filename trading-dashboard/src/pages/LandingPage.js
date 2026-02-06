import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const autoLogin = async () => {
    try {
      await login({ email: 'demo@growfund.test', password: 'Demo1234!' });
      navigate('/app');
    } catch (e) {
      // ignore — user may be missing (rare)
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-2xl text-center p-6 bg-gray-800 rounded">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">Welcome to GrowFund</h1>
        <p className="text-sm text-gray-300 mb-4">Build wealth with simple investing — crypto, real estate and more.</p>
        <div className="space-x-3">
          <Link to="/register" className="bg-blue-600 px-4 py-2 rounded">Get Started</Link>
          <Link to="/login" className="bg-gray-600 px-4 py-2 rounded">Sign in</Link>
        </div>

        <div className="mt-6 text-xs text-gray-400">This is a demo. Registration and login are simulated in-browser.</div>

        <div className="mt-4 bg-gray-700 p-3 rounded text-left text-sm">
          <div className="font-medium text-gray-200">Demo credentials</div>
          <div className="text-xs text-gray-300">Email: <span className="font-mono">demo@growfund.test</span></div>
          <div className="text-xs text-gray-300">Password: <span className="font-mono">Demo1234!</span></div>
          <div className="mt-2">
            <button onClick={autoLogin} className="bg-green-600 px-3 py-1 rounded">Auto login</button>
            <Link to="/login" className="ml-2 text-sm text-gray-300">Or sign in manually</Link>
          </div>
        </div>
      </div>
    </div>
  );
}