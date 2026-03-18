import React, { useState } from 'react';
import { ArrowUpCircle, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';
import { binaryOptionsAPI } from '../services/api';

export default function Withdrawals({ balance, onWithdraw }) {
  const { settings } = useSettings();
  const isDemoMode = !!localStorage.getItem('demo_access_token');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mobileProviders = [
    { id: 'MTN Mobile Money', name: 'MTN Mobile Money', icon: '📱' },
    { id: 'Vodafone Cash', name: 'Vodafone Cash', icon: '📱' },
    { id: 'AirtelTigo Money', name: 'AirtelTigo Money', icon: '📱' },
    { id: 'M-Pesa', name: 'M-Pesa', icon: '📱' },
    { id: 'Airtel Money', name: 'Airtel Money', icon: '📱' }
  ];

  const quickAmounts = [100, 500, 1000, 5000];

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    
    if (!amount || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amt < settings.minWithdrawal) {
      toast.error(`Minimum withdrawal is $${settings.minWithdrawal}`);
      return;
    }

    if (amt > settings.maxWithdrawal) {
      toast.error(`Maximum withdrawal is $${settings.maxWithdrawal}`);
      return;
    }

    if (amt > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!provider) {
      toast.error('Please select a mobile money provider');
      return;
    }

    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setSubmitting(true);
    try {
      await binaryOptionsAPI.momoWithdrawal(amt, phoneNumber);
      toast.success('Withdrawal request submitted successfully!');
      setAmount('');
      setPhoneNumber('');
      setProvider('');
      if (onWithdraw) onWithdraw({ amount: amt });
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Demo mode block */}
        {isDemoMode && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-8 text-center shadow-md">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Demo Account</h2>
            <p className="text-yellow-700 text-sm">
              Withdrawals are not available in demo mode. Demo funds are virtual and cannot be withdrawn.
            </p>
            <p className="text-yellow-600 text-xs mt-3">Switch to a real account to make withdrawals.</p>
          </div>
        )}

        {!isDemoMode && (<>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-2">
                <ArrowUpCircle className="w-7 h-7 mr-2 text-white" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h1>
              </div>
              <p className="text-sm sm:text-base text-green-100">Transfer money to your mobile money account</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20 text-center">
              <div className="text-xs text-green-100 mb-1">Available Balance</div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                ${parseFloat(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-b-xl shadow-xl p-6 sm:p-8">
          
          {/* Withdrawal Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={balance}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs sm:text-sm text-gray-500">
              <span>Min: ${settings.minWithdrawal}</span>
              <span>Max: ${Math.min(balance, settings.maxWithdrawal).toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-8">
            <label className="block text-sm text-gray-600 mb-3">Quick amounts</label>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  disabled={amt > balance}
                  className="bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-900 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Money Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Mobile Money Provider
            </label>
            <div className="space-y-3">
              {mobileProviders.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    provider === p.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={p.id}
                    checked={provider === p.id}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-2xl mx-3">{p.icon}</span>
                  <span className="text-base font-medium text-gray-900">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Money Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+233 24 123 4567"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the phone number registered with your mobile money account
            </p>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-yellow-900 mb-1">Important:</p>
                <p>Withdrawals are processed within 24 hours. Ensure your phone number is correct to avoid delays.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || !provider || !phoneNumber}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-colors shadow-md text-base mb-4"
          >
            {submitting ? 'Submitting...' : 'Submit Withdrawal'}
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors text-base"
          >
            Cancel
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-center text-gray-900 font-semibold mb-4">Secure & Encrypted Transactions</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center space-x-2 text-gray-700">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">256-Bit Encryption</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Trusted & Safe</span>
            </div>
          </div>
        </div>
        </>)}
      </div>
    </div>
  );
}
