import React, { useState, useEffect } from 'react';
import { Shield, Copy, Check, MapPin, Loader } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import useGeoLocation from '../hooks/useGeoLocation';
import toast from 'react-hot-toast';

export default function Deposits({ onDeposit }) {
  const { settings } = useSettings();
  const { detectedCountry, detecting } = useGeoLocation();
  const [amount, setAmount] = useState('');
  const [country, setCountry] = useState('Ghana');
  const [method, setMethod] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-set country once detection completes
  useEffect(() => {
    if (!detecting && detectedCountry) {
      setCountry(detectedCountry);
      setMethod('');
      setAutoDetected(true);
    }
  }, [detecting, detectedCountry]);

  // Form fields
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const countries = [
    { 
      name: 'Ghana', 
      code: 'GH', 
      flag: '🇬🇭', 
      currency: 'GHS',
      symbol: '₵',
      methods: [
        { id: 'Vodafone Cash', name: 'Vodafone Cash', icon: '📱', type: 'mobile' },
        { id: 'MTN Mobile Money', name: 'MTN Mobile Money', icon: '📱', type: 'mobile' },
        { id: 'AirtelTigo Money', name: 'AirtelTigo Money', icon: '📱', type: 'mobile' },
        { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦', type: 'bank' },
        { id: 'USDT Wallet', name: 'USDT Wallet', icon: '₿', type: 'crypto' }
      ]
    },
    { 
      name: 'Kenya', 
      code: 'KE', 
      flag: '🇰🇪', 
      currency: 'KES',
      symbol: 'KSh',
      methods: [
        { id: 'M-Pesa', name: 'M-Pesa', icon: '📱', type: 'mobile' },
        { id: 'Airtel Money', name: 'Airtel Money', icon: '📱', type: 'mobile' },
        { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦', type: 'bank' },
        { id: 'USDT Wallet', name: 'USDT Wallet', icon: '₿', type: 'crypto' }
      ]
    },
    { 
      name: 'Nigeria', 
      code: 'NG', 
      flag: '🇳🇬', 
      currency: 'NGN',
      symbol: '₦',
      methods: [
        { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦', type: 'bank' },
        { id: 'Paystack', name: 'Paystack', icon: '💳', type: 'card' },
        { id: 'Flutterwave', name: 'Flutterwave', icon: '💳', type: 'card' },
        { id: 'USDT Wallet', name: 'USDT Wallet', icon: '₿', type: 'crypto' }
      ]
    },
    { 
      name: 'Uganda', 
      code: 'UG', 
      flag: '🇺🇬', 
      currency: 'UGX',
      symbol: 'USh',
      methods: [
        { id: 'MTN Mobile Money', name: 'MTN Mobile Money', icon: '📱', type: 'mobile' },
        { id: 'Airtel Money', name: 'Airtel Money', icon: '📱', type: 'mobile' },
        { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦', type: 'bank' },
        { id: 'USDT Wallet', name: 'USDT Wallet', icon: '₿', type: 'crypto' }
      ]
    },
    { 
      name: 'Tanzania', 
      code: 'TZ', 
      flag: '🇹🇿', 
      currency: 'TZS',
      symbol: 'TSh',
      methods: [
        { id: 'Vodacom M-Pesa', name: 'Vodacom M-Pesa', icon: '📱', type: 'mobile' },
        { id: 'Airtel Money', name: 'Airtel Money', icon: '📱', type: 'mobile' },
        { id: 'Tigo Pesa', name: 'Tigo Pesa', icon: '📱', type: 'mobile' },
        { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦', type: 'bank' },
        { id: 'USDT Wallet', name: 'USDT Wallet', icon: '₿', type: 'crypto' }
      ]
    },
    { 
      name: 'Rwanda', 
      code: 'RW', 
      flag: '🇷🇼', 
      currency: 'RWF',
      symbol: 'RWF',
      methods: [
        { id: 'MTN Mobile Money', name: 'MTN Mobile Money', icon: '📱', type: 'mobile' },
        { id: 'Airtel Money', name: 'Airtel Money', icon: '📱', type: 'mobile' },
        { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦', type: 'bank' },
        { id: 'USDT Wallet', name: 'USDT Wallet', icon: '₿', type: 'crypto' }
      ]
    }
  ];

  const currentCountry = countries.find(c => c.name === country) || countries[0];
  const currentMethod = currentCountry.methods.find(m => m.id === method);

  // Platform wallet address
  const platformWallet = 'TNGbuN1FPWJDsxd9wtoyoAqeRvCVuPuDXm';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setMethod(''); // Reset method when country changes
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    
    if (!amount || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amt < settings.minDeposit) {
      toast.error(`Minimum deposit is $${settings.minDeposit}`);
      return;
    }

    if (amt > settings.maxDeposit) {
      toast.error(`Maximum deposit is $${settings.maxDeposit}`);
      return;
    }

    if (!method) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate based on method type
    if (currentMethod?.type === 'bank' && (!accountName || !accountNumber)) {
      toast.error('Please fill in all bank details');
      return;
    }

    if (currentMethod?.type === 'mobile' && !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    if (currentMethod?.type === 'crypto' && !walletAddress) {
      toast.error('Please enter your wallet address');
      return;
    }

    const reference = `DEP-${Date.now()}`;
    const details = { reference, method, country };

    if (currentMethod?.type === 'bank') {
      details.bank = { accountName, accountNumber };
    } else if (currentMethod?.type === 'mobile') {
      details.mobile = { phoneNumber };
    } else if (currentMethod?.type === 'crypto') {
      details.crypto = { walletAddress };
    }

    onDeposit({
      amount: amt,
      method,
      details,
      date: new Date().toISOString(),
      reference
    });

    // Reset form
    setAmount('');
    setAccountName('');
    setAccountNumber('');
    setPhoneNumber('');
    setWalletAddress('');
    
    toast.success('Deposit request submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl p-6 sm:p-8 text-center shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Deposit Funds</h1>
          <p className="text-sm sm:text-base text-green-100">Add funds to your account to start investing with GrowFund</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-b-xl shadow-xl p-6 sm:p-8">
          
          {/* Country Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Country
            </label>

            {/* Auto-detection status banner */}
            {detecting && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2">
                <Loader className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Detecting your location...</span>
              </div>
            )}
            {!detecting && autoDetected && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Location detected — showing payment methods for <strong>{country}</strong>. You can change this below.</span>
              </div>
            )}

            <select
              value={country}
              onChange={(e) => { handleCountryChange(e.target.value); setAutoDetected(false); }}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deposit Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deposit Amount
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all overflow-hidden">
              <span className="pl-4 pr-2 text-gray-500 text-lg font-semibold whitespace-nowrap shrink-0">
                {currentCountry.symbol}
              </span>
              <span className="text-gray-300 text-lg shrink-0">|</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="flex-1 bg-transparent text-gray-900 px-3 py-3 text-lg font-semibold focus:outline-none min-w-0"
              />
            </div>
          </div>

          {/* Select Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-3">
              {currentCountry.methods.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    method === pm.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={method === pm.id}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-2xl mx-3">{pm.icon}</span>
                  <span className="text-base font-medium text-gray-900">{pm.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Payment Details */}
          {currentMethod?.type === 'bank' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentMethod?.type === 'mobile' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {currentMethod?.type === 'card' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <p className="text-sm text-gray-700">
                You'll be redirected to our secure payment gateway to complete your card payment.
              </p>
            </div>
          )}

          {currentMethod?.type === 'crypto' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Wallet Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={platformWallet}
                      readOnly
                      className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-2.5 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(platformWallet)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg transition-colors flex-shrink-0"
                      title="Copy"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || !method}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-colors shadow-md text-base mb-4"
          >
            Submit Deposit
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
      </div>
    </div>
  );
}
