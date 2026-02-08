import React, { useState, useEffect } from 'react';

export default function InvestmentPlan({ initialCoin, onInvest, onCancel }) {
  const [coin, setCoin] = useState(initialCoin ? initialCoin.symbol : 'CUSTOM');
  const [amount, setAmount] = useState('');
  const [plan, setPlan] = useState('Lump-sum');

  useEffect(() => {
    if (initialCoin) setCoin(initialCoin.symbol);
  }, [initialCoin]);

  const submit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    onInvest({ coin: coin, amount: amt, plan, date: new Date().toISOString() });
    setAmount('');
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Investment Plan</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300">Coin / Asset</label>
          <input value={coin} onChange={(e) => setCoin(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Amount (USD)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="mt-1 w-full bg-gray-700 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Plan</label>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2">
            <option>Lump-sum</option>
            <option>Monthly</option>
            <option>Weekly</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Invest</button>
          <button type="button" onClick={onCancel} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
        </div>
      </form>
    </div>
  );
}
