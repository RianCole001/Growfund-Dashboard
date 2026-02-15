import React, { useState } from 'react';
import { ArrowUpCircle, DollarSign, Check, Shield, CreditCard, Building, Smartphone, AlertCircle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import toast from 'react-hot-toast';

export default function Withdrawals({ balance, onWithdraw }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank');
  const [step, setStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Bank details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [swiftCode, setSwiftCode] = useState('');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');

  // PayPal
  const [paypalEmail, setPaypalEmail] = useState('');

  // Mobile Money
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');

  const quickAmounts = [100, 500, 1000, 5000];

  const withdrawalMethods = [
    { id: 'Bank', name: 'Bank Transfer', icon: Building, desc: '1-3 business days', fee: '0%' },
    { id: 'Card', name: 'Debit Card', icon: CreditCard, desc: 'Instant', fee: '2%' },
    { id: 'PayPal', name: 'PayPal', icon: DollarSign, desc: 'Instant', fee: '1.5%' },
    { id: 'Mobile', name: 'Mobile Money', icon: Smartphone, desc: 'Instant', fee: '1%' }
  ];

  const validateStep2 = () => {
    if (method === 'Bank') {
      if (!bankName) return 'Please enter bank name';
      if (!accountNumber) return 'Please enter account number';
      if (!accountName) return 'Please enter account name';
    } else if (method === 'Card') {
      if (!cardNumber || cardNumber.length < 13) return 'Please enter valid card number';
      if (!cardName) return 'Please enter cardholder name';
    } else if (method === 'PayPal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) return 'Please enter valid PayPal email';
    } else if (method === 'Mobile') {
      if (!/^\+?[0-9]{6,15}$/.test(mobilePhone)) return 'Please enter valid phone number';
      if (!mobileProvider) return 'Please select provider';
    }
    return null;
  };

  const calculateFee = () => {
    const amt = parseFloat(amount) || 0;
    const methodData = withdrawalMethods.find(m => m.id === method);
    const feePercent = parseFloat(methodData?.fee) || 0;
    return (amt * feePercent) / 100;
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amt = parseFloat(amount);
    const fee = calculateFee();
    const total = amt + fee;

    if (total > balance) {
      alert('Insufficient balance (including fees)');
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      const error = validateStep2();
      if (error) {
        alert(error);
        return;
      }
      setStep(3);
      return;
    }

    // Final submission
    const details = { method };
    if (method === 'Bank') {
      details.bank = { bankName, accountNumber, accountName, swiftCode };
    } else if (method === 'Card') {
      details.card = { last4: cardNumber.slice(-4), name: cardName };
    } else if (method === 'PayPal') {
      details.paypal = { email: paypalEmail };
    } else if (method === 'Mobile') {
      details.mobile = { phone: mobilePhone, provider: mobileProvider };
    }

    onWithdraw({
      amount: amt,
      fee,
      total,
      method,
      details,
      date: new Date().toISOString(),
      reference: `WD-${Date.now()}`
    });

    // Reset
    setAmount('');
    setMethod('Bank');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setSwiftCode('');
    setCardNumber('');
    setCardName('');
    setPaypalEmail('');
    setMobilePhone('');
    setMobileProvider('');
    setStep(1);
  };

  const fee = calculateFee();
  const total = (parseFloat(amount) || 0) + fee;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowUpCircle className="w-8 h-8 mr-3 text-white" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h2>
              <p className="text-orange-100 text-sm mt-1">Transfer money to your account</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
            <div className="text-xs text-orange-100 mb-1">Available</div>
            <div className="text-xl sm:text-2xl font-bold text-white">${balance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'Amount' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Confirm' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s.num ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs mt-2 ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  step > s.num ? 'bg-orange-600' : 'bg-gray-700'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Amount & Method */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                How much would you like to withdraw?
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  max={balance}
                  className="w-full bg-gray-700 text-white rounded-lg pl-12 pr-4 py-4 text-2xl font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500">Min: $10</span>
                <span className="text-gray-500">Max: ${balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">Quick amounts</label>
              <div className="grid grid-cols-4 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    disabled={amt > balance}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Methods */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Select Withdrawal Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {withdrawalMethods.map((wm) => {
                  const Icon = wm.icon;
                  return (
                    <div
                      key={wm.id}
                      onClick={() => setMethod(wm.id)}
                      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
                        method === wm.id ? 'ring-2 ring-orange-500 bg-gray-600' : 'hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          method === wm.id ? 'bg-orange-600' : 'bg-gray-600'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{wm.name}</div>
                          <div className="text-xs text-gray-400">{wm.desc} • Fee: {wm.fee}</div>
                        </div>
                        {method === wm.id && <Check className="w-5 h-5 text-orange-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Processing Time:</strong> Withdrawals are processed within the timeframe shown. Fees may apply based on the method selected.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Withdrawal Details</h3>
              <div className="text-2xl font-bold text-orange-400">${parseFloat(amount).toLocaleString()}</div>
            </div>

            {/* Bank Transfer Form */}
            {method === 'Bank' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Your Bank Name"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="1234567890"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">SWIFT/BIC Code (Optional)</label>
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="ABCDUS33XXX"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Card Form */}
            {method === 'Card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s+/g, ''))}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* PayPal Form */}
            {method === 'PayPal' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">PayPal Email</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            )}

            {/* Mobile Money Form */}
            {method === 'Mobile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    placeholder="+254712345678"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Provider</label>
                  <select
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="">Select provider</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Airtel">Airtel Money</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Review Withdrawal
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Review Withdrawal</h3>
              <p className="text-gray-400">Please confirm the details below</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-600">
                <span className="text-gray-400">Amount</span>
                <span className="text-2xl font-bold text-white">${parseFloat(amount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-600">
                <span className="text-gray-400">Method</span>
                <span className="text-white font-semibold">{withdrawalMethods.find(m => m.id === method)?.name}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-600">
                <span className="text-gray-400">Processing Fee</span>
                <span className="text-white">${fee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-white">Total Deducted</span>
                <span className="text-2xl font-bold text-orange-400">${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                By confirming, you authorize this withdrawal. Funds will be transferred to your selected account.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg transition-colors"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
