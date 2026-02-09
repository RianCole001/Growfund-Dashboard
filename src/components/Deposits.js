import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Check, Shield, Lock, Plus, Trash2, X, Smartphone, Building, Bitcoin } from 'lucide-react';

export default function Deposits({ onDeposit }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Card');
  const [step, setStep] = useState(1); // 1: Amount & Method, 2: Payment Details, 3: Confirmation

  // Card details
  const [cardType, setCardType] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);

  // PayPal
  const [paypalEmail, setPaypalEmail] = useState('');

  // Mobile Money
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');

  // Bank Transfer
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Crypto
  const [cryptoCoin, setCryptoCoin] = useState('BTC');
  const [cryptoAddress, setCryptoAddress] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved_cards');
      if (raw) setSavedCards(JSON.parse(raw));
    } catch (e) {}
  }, []);

  // Detect card type from number
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s+/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return '';
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s+/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '');
    if (value.length <= 16) {
      setCardNumber(formatCardNumber(value));
      setCardType(detectCardType(value));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setCardExpiry(value);
  };

  const quickAmounts = [50, 100, 500, 1000, 5000];

  const cardLogos = {
    visa: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
    mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    amex: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
    discover: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg'
  };

  const paymentMethods = [
    { id: 'Card', name: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
    { id: 'PayPal', name: 'PayPal', icon: DollarSign, desc: 'Fast & secure' },
    { id: 'M-Pesa', name: 'M-Pesa', icon: Smartphone, desc: 'Mobile money' },
    { id: 'MOMO', name: 'MTN MOMO', icon: Smartphone, desc: 'Mobile money' },
    { id: 'Bank', name: 'Bank Transfer', icon: Building, desc: 'Direct transfer' },
    { id: 'Crypto', name: 'Cryptocurrency', icon: Bitcoin, desc: 'BTC, ETH, USDT' }
  ];

  const validateStep2 = () => {
    if (method === 'Card') {
      if (!selectedSavedCard) {
        if (!cardName) return 'Please enter cardholder name';
        if (cardNumber.replace(/\s+/g, '').length < 13) return 'Please enter a valid card number';
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return 'Please enter expiry as MM/YY';
        if (cardCVV.length < 3) return 'Please enter a valid CVV';
      }
    } else if (method === 'PayPal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) return 'Please enter a valid PayPal email';
    } else if (method === 'M-Pesa' || method === 'MOMO') {
      if (!/^\+?[0-9]{6,15}$/.test(mobilePhone)) return 'Please enter a valid phone number';
      if (!mobileProvider) return 'Please select a provider';
    } else if (method === 'Bank') {
      if (!bankName) return 'Please enter bank name';
      if (!accountNumber) return 'Please enter account number';
      if (!accountName) return 'Please enter account name';
    } else if (method === 'Crypto') {
      if (!cryptoAddress) return 'Please enter wallet address';
      if (!cryptoCoin) return 'Please select cryptocurrency';
    }
    return null;
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
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
    const amt = parseFloat(amount);
    const reference = `DEP-${Date.now()}`;
    
    const details = { reference, method };

    // Save card if requested
    if (method === 'Card' && saveCard && !selectedSavedCard) {
      try {
        const id = `card-${Date.now()}`;
        const newCard = {
          id,
          type: cardType || 'card',
          name: cardName,
          last4: cardNumber.replace(/\s+/g, '').slice(-4),
          expiry: cardExpiry
        };
        const updated = [newCard, ...savedCards];
        localStorage.setItem('saved_cards', JSON.stringify(updated));
        setSavedCards(updated);
      } catch (e) {}
    }

    // Add method-specific details
    if (method === 'Card') {
      details.card = selectedSavedCard || {
        type: cardType,
        name: cardName,
        last4: cardNumber.replace(/\s+/g, '').slice(-4)
      };
    } else if (method === 'PayPal') {
      details.paypal = { email: paypalEmail };
    } else if (method === 'M-Pesa' || method === 'MOMO') {
      details.mobile = { phone: mobilePhone, provider: mobileProvider };
    } else if (method === 'Bank') {
      details.bank = { bankName, accountNumber, accountName };
    } else if (method === 'Crypto') {
      details.crypto = { coin: cryptoCoin, address: cryptoAddress };
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
    setMethod('Card');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardType('');
    setSaveCard(false);
    setSelectedSavedCard(null);
    setPaypalEmail('');
    setMobilePhone('');
    setMobileProvider('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setCryptoCoin('BTC');
    setCryptoAddress('');
    setStep(1);
  };

  const removeSavedCard = (id) => {
    if (window.confirm('Remove this card?')) {
      const updated = savedCards.filter(c => c.id !== id);
      setSavedCards(updated);
      localStorage.setItem('saved_cards', JSON.stringify(updated));
      if (selectedSavedCard?.id === id) {
        setSelectedSavedCard(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center">
          <DollarSign className="w-8 h-8 mr-3 text-white" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Deposit Funds</h2>
            <p className="text-green-100 text-sm mt-1">Add money to your account securely</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'Amount' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Confirm' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s.num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs mt-2 ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  step > s.num ? 'bg-green-600' : 'bg-gray-700'
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
                How much would you like to deposit?
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-700 text-white rounded-lg pl-12 pr-4 py-4 text-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">Quick amounts</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Select Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setMethod(pm.id)}
                      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
                        method === pm.id
                          ? 'ring-2 ring-green-500 bg-gray-600'
                          : 'hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          method === pm.id ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{pm.name}</div>
                          <div className="text-xs text-gray-400">{pm.desc}</div>
                        </div>
                        {method === pm.id && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Secure Payment:</strong> Your payment information is encrypted and secure. We never store your full card details.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Payment Method</h3>
              <div className="text-2xl font-bold text-green-400">${parseFloat(amount).toLocaleString()}</div>
            </div>

            {/* Saved Cards */}
            {savedCards.length > 0 && method === 'Card' && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Saved Cards
                </label>
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedSavedCard(card)}
                      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSavedCard?.id === card.id
                          ? 'ring-2 ring-green-500 bg-gray-600'
                          : 'hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">
                            {card.type && cardLogos[card.type] ? (
                              <img src={cardLogos[card.type]} alt={card.type} className="h-6" />
                            ) : (
                              <CreditCard className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">•••• {card.last4}</div>
                            <div className="text-sm text-gray-400">{card.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedSavedCard?.id === card.id && (
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSavedCard(card.id);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800 text-gray-400">Or use a new card</span>
                  </div>
                </div>
              </div>
            )}

            {/* New Card Form */}
            {!selectedSavedCard && method === 'Card' && (
              <div className="space-y-4">
                {/* Card Type Logos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    We Accept
                  </label>
                  <div className="flex items-center space-x-4">
                    {Object.entries(cardLogos).map(([type, logo]) => (
                      <div
                        key={type}
                        className={`w-16 h-10 bg-white rounded flex items-center justify-center p-2 transition-all ${
                          cardType === type ? 'ring-2 ring-green-500' : 'opacity-60'
                        }`}
                      >
                        <img src={logo} alt={type} className="max-h-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    {cardType && cardLogos[cardType] && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-6 bg-white rounded flex items-center justify-center p-1">
                        <img src={cardLogos[cardType]} alt={cardType} className="max-h-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">CVV</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardCVV}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) setCardCVV(value);
                        }}
                        placeholder="123"
                        maxLength="4"
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Save Card Checkbox */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">Save this card for future deposits</span>
                </label>
              </div>
            )}

            {/* PayPal Form */}
            {method === 'PayPal' && (
              <div className="space-y-4">
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    You'll be redirected to PayPal to complete your payment securely.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">PayPal Email</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* M-Pesa / MOMO Form */}
            {(method === 'M-Pesa' || method === 'MOMO') && (
              <div className="space-y-4">
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    You'll receive a prompt on your phone to complete the payment.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    placeholder="+254712345678"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +254 for Kenya)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Provider</label>
                  <select
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="">Select provider</option>
                    <option value="Safaricom">Safaricom</option>
                    <option value="MTN">MTN</option>
                    <option value="Vodafone">Vodafone</option>
                    <option value="Airtel">Airtel</option>
                  </select>
                </div>
              </div>
            )}

            {/* Bank Transfer Form */}
            {method === 'Bank' && (
              <div className="space-y-4">
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    Transfer funds directly from your bank account. Processing may take 1-3 business days.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Your Bank Name"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Crypto Form */}
            {method === 'Crypto' && (
              <div className="space-y-4">
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Important:</strong> Send only the selected cryptocurrency to the address below. Sending other coins may result in permanent loss.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Cryptocurrency</label>
                  <select
                    value={cryptoCoin}
                    onChange={(e) => setCryptoCoin(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="USDC">USD Coin (USDC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Wallet Address</label>
                  <input
                    type="text"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Double-check your address before proceeding</p>
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Review Deposit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Review Your Deposit</h3>
              <p className="text-gray-400">Please confirm the details below</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-600">
                <span className="text-gray-400">Amount</span>
                <span className="text-2xl font-bold text-white">${parseFloat(amount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-600">
                <span className="text-gray-400">Payment Method</span>
                <div className="flex items-center space-x-2">
                  {method === 'Card' && selectedSavedCard ? (
                    <>
                      {selectedSavedCard.type && cardLogos[selectedSavedCard.type] && (
                        <img src={cardLogos[selectedSavedCard.type]} alt={selectedSavedCard.type} className="h-6" />
                      )}
                      <span className="text-white">•••• {selectedSavedCard.last4}</span>
                    </>
                  ) : method === 'Card' ? (
                    <>
                      {cardType && cardLogos[cardType] && (
                        <img src={cardLogos[cardType]} alt={cardType} className="h-6" />
                      )}
                      <span className="text-white">•••• {cardNumber.replace(/\s+/g, '').slice(-4)}</span>
                    </>
                  ) : method === 'PayPal' ? (
                    <span className="text-white">{paypalEmail}</span>
                  ) : method === 'M-Pesa' || method === 'MOMO' ? (
                    <span className="text-white">{mobilePhone} ({mobileProvider})</span>
                  ) : method === 'Bank' ? (
                    <span className="text-white">{bankName} - {accountNumber}</span>
                  ) : method === 'Crypto' ? (
                    <span className="text-white">{cryptoCoin}</span>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-600">
                <span className="text-gray-400">Processing Fee</span>
                <span className="text-white">$0.00</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-green-400">${parseFloat(amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                By confirming, you authorize this deposit. Funds will be available in your account within minutes.
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
