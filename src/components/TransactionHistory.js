import React, { useState, useMemo } from 'react';
import { CSVLink } from 'react-csv';

export default function TransactionHistory({ transactions }) {
  const [filterType, setFilterType] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const types = ['All', 'Deposit', 'Withdraw', 'Invest'];

  const filtered = useMemo(() => transactions.filter((t) => {
    if (filterType !== 'All' && t.type !== filterType) return false;
    if (fromDate && new Date(t.date) < new Date(fromDate)) return false;
    if (toDate && new Date(t.date) > new Date(toDate)) return false;
    return true;
  }), [transactions, filterType, fromDate, toDate]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-blue-400">Transaction History</h3>
        <div className="flex items-center space-x-2">
          <CSVLink className="bg-blue-600 px-3 py-1 rounded" data={filtered} filename={`transactions-${Date.now()}.csv`}>Export CSV</CSVLink>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-gray-700 rounded p-2">
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-gray-700 rounded p-2" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-gray-700 rounded p-2" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-400">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Asset</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} className="odd:bg-gray-700 even:bg-gray-600">
                <td className="p-2">{new Date(t.date).toLocaleString()}</td>
                <td className="p-2">{t.type}</td>
                <td className="p-2">{t.asset || t.coin || '-'}</td>
                <td className="p-2">${(t.amount || 0).toLocaleString()}</td>
                <td className="p-2">{t.details || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
