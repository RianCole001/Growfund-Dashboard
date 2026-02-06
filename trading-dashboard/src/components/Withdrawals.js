import React, { useState } from 'react';

export default function Withdrawals({ balance, onWithdraw }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');

  const submit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Enter valid amount');
    if (amt > balance) return alert('Insufficient balance');
    onWithdraw({ amount: amt, method, date: new Date().toISOString() });
    setAmount('');
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Withdraw Funds</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300">Amount (USD)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="mt-1 w-full bg-gray-700 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2">
            <option>Bank Transfer</option>
            <option>Card (Visa/MasterCard)</option>
            <option>PayPal</option>
          </select>
        </div>
        <div>
          <button type="submit" className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700">Withdraw</button>
        </div>
      </form>
    </div>
  );
}
