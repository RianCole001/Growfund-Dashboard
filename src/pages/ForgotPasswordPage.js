import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAuthAPI } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAuthAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success('Check your email for a reset link.');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Forgot Password</h2>
        <p className="text-gray-600 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm">
            If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
