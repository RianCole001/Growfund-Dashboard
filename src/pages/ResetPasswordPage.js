import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAuthAPI } from '../services/api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password !== password2) { toast.error('Passwords do not match'); return; }
    if (!token) { toast.error('Invalid or missing reset token'); return; }

    setLoading(true);
    try {
      await userAuthAPI.resetPassword(token, password);
      toast.success('Password reset successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Reset Password</h2>
        <p className="text-gray-600 text-sm mb-6">Enter your new password below.</p>

        {!token ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            Invalid reset link. Please request a new one.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none text-gray-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Confirm Password</label>
              <input
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
