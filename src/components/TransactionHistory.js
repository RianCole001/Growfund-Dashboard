import React, { useState, useMemo } from 'react';
import { formatDate, safeParseDate } from '../utils/dateUtils';
import { CSVLink } from 'react-csv';
import { Download, Filter } from 'lucide-react';

export default function TransactionHistory({ transactions }) {
  const [filterType, setFilterType] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const types = ['All', 'Deposit', 'Withdraw', 'Invest'];

  const filtered = useMemo(() => transactions.filter((t) => {
    if (filterType !== 'All' && t.type !== filterType) return false;
    if (fromDate && safeParseDate(t.created_at || t.date) < new Date(fromDate)) return false;
    if (toDate && safeParseDate(t.created_at || t.date) > new Date(toDate)) return false;
    return true;
  }), [transactions, filterType, fromDate, toDate]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-lg sm:text-xl font-semibold text-green-600">Transaction History</h3>
        <CSVLink 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center" 
          data={filtered} 
          filename={`transactions-${Date.now()}.csv`}
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </CSVLink>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
        <div className="flex items-center space-x-2 flex-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <input 
          type="date" 
          value={fromDate} 
          onChange={(e) => setFromDate(e.target.value)} 
          className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
          placeholder="From"
        />
        <input 
          type="date" 
          value={toDate} 
          onChange={(e) => setToDate(e.target.value)} 
          className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
          placeholder="To"
        />
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Asset</th>
                <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-700 whitespace-nowrap">{formatDate(t.created_at || t.date)}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        t.type === 'Deposit' ? 'bg-green-100 text-green-700' :
                        t.type === 'Withdraw' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 hidden sm:table-cell">{t.asset || t.coin || '-'}</td>
                    <td className="p-3 text-right font-semibold text-gray-800">${(t.amount || 0).toLocaleString()}</td>
                    <td className="p-3 text-gray-600 text-xs hidden md:table-cell">{t.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
