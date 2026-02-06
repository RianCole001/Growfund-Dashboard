import React, { useState, useEffect } from 'react';

export default function Deposits({ onDeposit }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Cards');

  // Bank Cards
  const [cardIssuer, setCardIssuer] = useState('Visa');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [usingSavedCard, setUsingSavedCard] = useState(false);
  const [savedCardId, setSavedCardId] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved_cards');
      if (raw) setSavedCards(JSON.parse(raw));
    } catch (e) {}
  }, []);

  // PayPal
  const [paypalEmail, setPaypalEmail] = useState('');

  // Mobile money (M-Pesa / MOMO)
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');

  // Bank transfer
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Crypto
  const [cryptoAddr, setCryptoAddr] = useState('');
  const [cryptoCoin, setCryptoCoin] = useState('BTC');

  const resetForm = () => {
    setAmount(''); setCardIssuer('Visa'); setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCVV(''); setSaveCard(false); setUsingSavedCard(false); setSavedCardId(''); setPaypalEmail(''); setMobilePhone(''); setMobileProvider(''); setBankName(''); setAccountNumber(''); setAccountName(''); setCryptoAddr(''); setCryptoCoin('BTC');
  };

  const [showManage, setShowManage] = useState(false);

  const removeSavedCard = (id) => {
    if (!id) return;
    if (!window.confirm('Remove saved card?')) return;
    const next = savedCards.filter(s => s.id !== id);
    setSavedCards(next);
    try { localStorage.setItem('saved_cards', JSON.stringify(next)); } catch (e) {}
    if (savedCardId === id) { setSavedCardId(''); setUsingSavedCard(false); setCardName(''); setCardNumber(''); }
  };

  const validate = () => {
    const amt = Number(amount || 0);
    if (!amt || amt <= 0) return 'Enter a valid deposit amount';

    if (method === 'Bank Cards') {
      // If using saved card, we skip full number requirement (simulated)
      if (!cardName) return 'Enter cardholder name';
      if (!usingSavedCard) {
        if (!/^\d{12,19}$/.test(cardNumber.replace(/\s+/g, ''))) return 'Enter valid card number (12-19 digits)';
      }
      if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(cardExpiry)) return 'Enter expiry as MM/YY or MM/YYYY';
      if (!/^\d{3,4}$/.test(cardCVV)) return 'Enter CVV (3-4 digits)';
    }

    if (method === 'PayPal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) return 'Enter a valid PayPal email';
    }

    if (method === 'M-Pesa' || method === 'MOMO') {
      if (!/^\+?[0-9]{6,15}$/.test(mobilePhone)) return 'Enter a valid phone number with country code';
      if (!mobileProvider) return 'Select mobile money provider';
    }

    if (method === 'Bank Transfer') {
      if (!bankName) return 'Enter bank name';
      if (!accountNumber) return 'Enter account number';
      if (!accountName) return 'Enter account name';
    }

    if (method === 'Crypto') {
      if (!cryptoAddr) return 'Enter destination wallet address';
      if (!cryptoCoin) return 'Select crypto coin';
    }

    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    const amt = parseFloat(amount);
    const reference = `DEP-${Date.now()}`;
    const details = { reference };
    // attach method-specific details (do not store full sensitive card info in real app)
    if (method === 'Bank Cards') {
      details.card = { issuer: cardIssuer, name: cardName, last4: cardNumber.replace(/\s+/g, '').slice(-4), saved: saveCard || usingSavedCard, savedCardId: savedCardId || undefined };
      // persist saved card metadata if requested and not already using one
      if (saveCard && !usingSavedCard) {
        try {
          const id = `card-${Date.now()}`;
          const next = [{ id, issuer: cardIssuer, name: cardName, last4: (cardNumber.replace(/\s+/g, '').slice(-4)) }, ...savedCards];
          localStorage.setItem('saved_cards', JSON.stringify(next));
          setSavedCards(next);
        } catch (e) {}
      }
    }
    if (method === 'PayPal') details.paypal = { email: paypalEmail };
    if (method === 'M-Pesa' || method === 'MOMO') details.mobile = { phone: mobilePhone, provider: mobileProvider };
    if (method === 'Bank Transfer') details.bank = { bankName, accountNumber, accountName };
    if (method === 'Crypto') details.crypto = { coin: cryptoCoin, address: cryptoAddr };

    // simulate deposit success (in a real app you'd integrate with payment gateways)
    onDeposit({ amount: amt, method, details, date: new Date().toISOString(), reference });
    resetForm();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Deposit Funds</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300">Amount (USD)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="0.01" className="mt-1 w-full bg-gray-700 rounded p-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2">
            <option>Visa</option>
            <option>PayPal</option>
            <option>M-Pesa</option>
            <option>MOMO</option>
            <option>Bank Transfer</option>
            <option>Crypto</option>
          </select>
        </div>

        {/* Visa / Card form */}
        {method === 'Bank Cards' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-1/2">
                <label className="block text-sm text-gray-300">Card Type</label>
                <select value={cardIssuer} onChange={(e) => setCardIssuer(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2">
                  <option>Visa</option>
                  <option>MasterCard</option>
                  <option>American Express</option>
                  <option>Discover</option>
                </select>
              </div>

              <div className="w-1/2">
                <label className="block text-sm text-gray-300">Saved Card</label>
                <select value={savedCardId} onChange={(e) => {
                  const v = e.target.value;
                  setSavedCardId(v);
                  if (!v) { setUsingSavedCard(false); setCardName(''); setCardNumber(''); } else {
                    const found = savedCards.find(s => s.id === v);
                    if (found) {
                      setUsingSavedCard(true);
                      setCardIssuer(found.issuer);
                      setCardName(found.name);
                      setCardNumber('**** **** **** ' + found.last4);
                    }
                  }
                }} className="mt-1 w-full bg-gray-700 rounded p-2">
                  <option value="">-- Use saved card --</option>
                  {savedCards.map(c => (<option key={c.id} value={c.id}>{c.issuer} • **** {c.last4} ({c.name})</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300">Cardholder Name</label>
                <input value={cardName} onChange={(e) => setCardName(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Card Number</label>
                <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" className="mt-1 w-full bg-gray-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Expiry (MM/YY)</label>
                <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" className="mt-1 w-full bg-gray-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300">CVV</label>
                <input value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} placeholder="123" className="mt-1 w-full bg-gray-700 rounded p-2" />
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-2">
              <label className="flex items-center space-x-2 text-sm text-gray-300"><input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="form-checkbox" /> <span>Save this card for future use</span></label>
            </div>
          </div>
        )}

        {/* PayPal */}
        {method === 'PayPal' && (
          <div>
            <label className="block text-sm text-gray-300">PayPal Email</label>
            <input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="you@paypal.com" className="mt-1 w-full bg-gray-700 rounded p-2" />
            <div className="text-xs text-gray-400 mt-1">You will be redirected to PayPal to complete payment (simulated here).</div>
          </div>
        )}

        {/* Mobile money */}
        {(method === 'M-Pesa' || method === 'MOMO') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300">Phone (with country code)</label>
              <input value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} placeholder="+2547XXXXXXXX" className="mt-1 w-full bg-gray-700 rounded p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Provider</label>
              <select value={mobileProvider} onChange={(e) => setMobileProvider(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2">
                <option value="">Select provider</option>
                <option>Safaricom</option>
                <option>MTN</option>
                <option>Vodafone</option>
              </select>
            </div>
            <div className="sm:col-span-2 text-xs text-gray-400">After submitting, follow the provider's prompt to complete the transfer (simulated — funds will be credited).</div>
          </div>
        )}

        {/* Bank transfer */}
        {method === 'Bank Transfer' && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-300">Bank Name</label>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300">Account Number</label>
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Account Name</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
              </div>
            </div>
            <div className="text-xs text-gray-400">Use your bank app to transfer to our account; enter the reference above so we can reconcile (simulation).</div>
          </div>
        )}

        {/* Crypto deposit */}
        {method === 'Crypto' && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-300">Coin</label>
              <select value={cryptoCoin} onChange={(e) => setCryptoCoin(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2">
                <option>BTC</option>
                <option>ETH</option>
                <option>USDT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300">Destination Address</label>
              <input value={cryptoAddr} onChange={(e) => setCryptoAddr(e.target.value)} placeholder="Wallet address" className="mt-1 w-full bg-gray-700 rounded p-2" />
              <div className="text-xs text-gray-400 mt-1">Send the exact amount to this address on your wallet and include the reference in the memo (simulated).</div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button type="submit" className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Submit Deposit</button>
          <button type="button" onClick={resetForm} className="bg-gray-600 px-3 py-2 rounded">Reset</button>
        </div>
      </form>

      <div className="mt-4">
        <button onClick={() => setShowManage(s => !s)} className="text-sm text-blue-400">{showManage ? 'Hide' : 'Manage'} saved cards</button>
        {showManage && (
          <div className="mt-2 bg-gray-800 p-3 rounded">
            {savedCards.length === 0 ? (
              <div className="text-sm text-gray-300">No saved cards.</div>
            ) : (
              <ul className="space-y-2">
                {savedCards.map((c) => (
                  <li key={c.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                    <div className="text-sm">{c.issuer} • **** {c.last4} <span className="text-xs text-gray-400">({c.name})</span></div>
                    <div className="space-x-2">
                      <button onClick={() => { setSavedCardId(c.id); setUsingSavedCard(true); setCardIssuer(c.issuer); setCardName(c.name); setCardNumber('**** **** **** ' + c.last4); setShowManage(false); }} className="px-2 py-1 bg-gray-600 rounded text-sm">Use</button>
                      <button onClick={() => removeSavedCard(c.id)} className="px-2 py-1 bg-red-600 rounded text-sm">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
