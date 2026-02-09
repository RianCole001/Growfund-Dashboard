import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const storage = require('../utils/storage').default;

export default function CapitalPlan({ investments = [], balance = 0, onInvest = () => {}, onNotify = () => {} }) {
  const plans = [
    { key: 'starter', name: 'Starter', rate: 0.05, min: 100, desc: 'Low-risk starter plan to learn and grow your capital steadily.' },
    { key: 'intermediate', name: 'Intermediate', rate: 0.08, min: 500, desc: 'Balanced plan with higher potential returns for medium-term investors.' },
    { key: 'advanced', name: 'Advanced', rate: 0.12, min: 2000, desc: 'Aggressive growth plan for experienced investors seeking higher returns.' },
  ];

  const [selected, setSelected] = useState(plans[0].key);
  const [amount, setAmount] = useState(1000);
  const [years, setYears] = useState(5);
  const [showOnboard, setShowOnboard] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    const seen = storage.get('seenCapitalOnboarding', false);
    setShowOnboard(!seen);
  }, []);

  const dismissOnboard = () => {
    storage.set('seenCapitalOnboarding', true);
    setShowOnboard(false);
    if (typeof onNotify === 'function') onNotify('Welcome to Capital Appreciation Plan — onboarding dismissed');
  };

  // const openHelp = () => setShowHelpModal(true);
  // const closeHelp = () => setShowHelpModal(false); 

  const selectedPlan = plans.find((p) => p.key === selected);

  const data = useMemo(() => {
    const arr = [];
    let val = Number(amount) || 0;
    for (let y = 0; y <= years; y++) {
      if (y === 0) arr.push({ year: y, value: Math.round(val) });
      else {
        val = val * (1 + selectedPlan.rate);
        arr.push({ year: y, value: Math.round(val) });
      }
    }
    return arr;
  }, [amount, years, selectedPlan]);

  const openConfirm = (amt, plan) => {
    const pay = { amount: Number(amt || 0), plan: plan.name, name: `Capital Plan - ${plan.name}`, years };
    setConfirmData(pay);
    setConfirmOpen(true);
  };

  const doConfirmInvest = () => {
    if (!confirmData) return;
    onInvest({ ...confirmData, date: new Date().toISOString() });
    if (typeof onNotify === 'function') onNotify(`Confirmed investment $${Number(confirmData.amount).toLocaleString()} in ${confirmData.plan}`);
    setConfirmOpen(false);
    setConfirmData(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-blue-400">Capital Appreciation Plan</h2>
          <p className="text-sm text-gray-400">Choose a plan and simulate how your money could grow over time.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-300">Available balance</div>
          <div className="text-lg font-bold">${Math.round(balance).toLocaleString()}</div>
        </div>
      </div>

      {showOnboard && (
        <div className="bg-blue-600/80 p-4 rounded-lg text-sm text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">Getting started</div>
              <div className="mt-1">This short guide helps you pick a plan and simulate growth. Choose a plan, set your amount & duration, then confirm before investing.</div>
              <div className="mt-2 text-xs text-blue-100">Need more detail? <button onClick={openHelp} className="underline">Learn more</button></div>
            </div>
            <div className="ml-4 flex flex-col space-y-2">
              <button onClick={dismissOnboard} className="bg-white text-blue-600 px-3 py-1 rounded">Got it</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.key} className={`bg-gray-800 p-4 rounded-lg ${selected === p.key ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">{p.name}</div>
                <div className="text-xl font-bold">{Math.round(p.rate * 100)}% p.a.</div>
              </div>
              <div className="text-sm text-gray-400">Min ${p.min}</div>
            </div>
            <div className="text-sm text-gray-300 mt-3">{p.desc}</div>
            <ul className="text-xs text-gray-400 mt-3 space-y-1">
              <li>1. Set your starting capital</li>
              <li>2. Choose duration & contributions</li>
              <li>3. Monitor and adjust</li>
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setSelected(p.key)} className={`px-3 py-1 rounded ${selected === p.key ? 'bg-blue-600' : 'bg-gray-700'}`}>Select</button>
              <button onClick={() => { setSelected(p.key); openConfirm(amount, p); }} className="px-3 py-1 rounded bg-green-600">Invest Now</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-3 text-blue-400">Growth Projection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="bg-gray-700 p-4 rounded">
              <label className="block text-sm text-gray-300">Starting amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 w-full bg-gray-800 rounded p-2" />

              <label className="block text-sm text-gray-300 mt-3">Duration (years)</label>
              <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2" />
              <div className="text-sm text-gray-300 mt-1">{years} year{years > 1 ? 's' : ''}</div>

              <label className="block text-sm text-gray-300 mt-3">Selected plan</label>
              <div className="text-sm font-semibold mt-1">{selectedPlan.name} • {Math.round(selectedPlan.rate * 100)}% p.a.</div>

              <div className="mt-4">
                <button onClick={() => openConfirm(amount, selectedPlan)} className="w-full bg-blue-600 px-3 py-2 rounded">Invest ${Math.round(amount)}</button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">This is a simulation for illustrative purposes only. Actual returns may vary.</div>

      {confirmOpen && confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-lg p-6 w-96 text-white">
            <h3 className="text-lg font-semibold mb-2">Confirm Investment</h3>
            <div className="text-sm text-gray-300 mb-4">Plan: <strong className="text-white">{confirmData.plan}</strong></div>
            <div className="text-sm text-gray-300">Amount: <strong className="text-white">${Number(confirmData.amount).toLocaleString()}</strong></div>
            <div className="text-sm text-gray-300">Duration: <strong className="text-white">{confirmData.years} year{confirmData.years > 1 ? 's' : ''}</strong></div>
            <div className="text-sm text-gray-300 mt-3">Projected value: <strong className="text-white">${(data[data.length - 1] || {}).value ? Number(data[data.length - 1].value).toLocaleString() : '-'}</strong></div>
            <div className={`text-sm mt-1 ${(((data[data.length - 1] || {}).value || 0) - (confirmData.amount || 0)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>Estimated profit: <strong className="text-white">${Math.abs(((data[data.length - 1] || {}).value || 0) - (confirmData.amount || 0)).toLocaleString()}</strong></div>

            <div className="mt-6 flex justify-end space-x-2">
              <button onClick={() => { setConfirmOpen(false); setConfirmData(null); }} className="px-3 py-1 rounded bg-gray-700">Cancel</button>
              <button onClick={doConfirmInvest} className="px-3 py-1 rounded bg-green-600">Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

