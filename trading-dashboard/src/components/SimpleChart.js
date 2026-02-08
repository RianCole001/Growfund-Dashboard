import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SimpleChart({ investments }) {
  // Convert investments into time-series totals per date
  const grouped = {};
  investments.forEach((inv) => {
    const d = new Date(inv.date).toLocaleDateString();
    grouped[d] = (grouped[d] || 0) + (inv.amount || 0);
  });
  const data = Object.keys(grouped).map((k) => ({ date: k, amount: grouped[k] }));
  if (data.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white text-center">No investments yet to show chart.</div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white h-56">
      <h3 className="text-md font-semibold mb-2 text-blue-400">Investments Over Time</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
          <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
