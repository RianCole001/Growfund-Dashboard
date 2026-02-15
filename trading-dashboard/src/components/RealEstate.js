import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const plans = [
  { id: 'RE_PLOT', name: 'Residential Plots', details: 'Developed residential plots & land parcels', min: 3000, appRate: 0.035, rentYield: 0.00, expenseRate: 0.01 },
  { id: 'RE_MIX', name: 'Mixed-Use & Condos', details: 'Mixed-use developments and high-quality condos', min: 15000, appRate: 0.06, rentYield: 0.045, expenseRate: 0.02 },
  { id: 'RE_HOTEL', name: 'Hotel Development', details: 'Hotel & hospitality projects with premium returns', min: 50000, appRate: 0.12, rentYield: 0.08, expenseRate: 0.035 },
];

function computeProjection(principal, years, appRate, rentYield, expenseRate) {
  const arr = [];
  let propertyValue = Number(principal) || 0;
  let cumulativeNet = propertyValue; // initial capital in asset
  for (let y = 0; y <= years; y++) {
    if (y === 0) {
      arr.push({ year: y, propertyValue: Math.round(propertyValue), rentIncome: 0, expenses: 0, netCashflow: 0, totalNet: Math.round(cumulativeNet) });
      continue;
    }
    // appreciation
    propertyValue = propertyValue * (1 + appRate);
    const rentIncome = (Number(principal) || 0) * rentYield; // simplified constant rent on original capital
    const expenses = (Number(principal) || 0) * expenseRate;
    const netCashflow = rentIncome - expenses;
    cumulativeNet = Math.round(propertyValue + (arr.slice(0, y).reduce((s, r) => s + r.netCashflow, 0) + netCashflow));
    arr.push({ year: y, propertyValue: Math.round(propertyValue), rentIncome: Math.round(rentIncome), expenses: Math.round(expenses), netCashflow: Math.round(netCashflow), totalNet: cumulativeNet });
  }
  return arr;
}

export default function RealEstate({ onInvest = () => {} }) {
  const [selected, setSelected] = useState(plans[0].id);
  const [amount, setAmount] = useState(plans[0].min);
  const [years, setYears] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const plan = plans.find((p) => p.id === selected);

  // if user changes plan, adjust amount to min
  const selectPlan = (id) => {
    const p = plans.find((pp) => pp.id === id);
    setSelected(id);
    setAmount(p.min);
  };

  const data = useMemo(() => computeProjection(amount, years, plan.appRate, plan.rentYield, plan.expenseRate), [amount, years, plan]);

  const projected = data[data.length - 1] || { totalNet: 0, propertyValue: 0 };
  const profit = projected.totalNet - (Number(amount) || 0);
  const roiPct = ((profit / (Number(amount) || 1)) * 100).toFixed(1);

  const doInvest = () => {
    const payload = { asset: plan.id, name: plan.name, amount: Number(amount), date: new Date().toISOString(), details: 'Real Estate - ' + plan.name };
    onInvest(payload);
    setConfirmOpen(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-blue-400">Real Estate — Capital Growth & Income</h2>
          <p className="text-sm text-gray-400">Model returns, compare plans, and invest in curated real estate strategies.</p>
        </div>
        <div className="text-right text-sm text-gray-300">
          <div>Interested in a demo valuation? Use the simulator below.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 space-y-3">
          {plans.map((p) => (
            <div key={p.id} className={`p-3 rounded ${selected === p.id ? 'bg-gray-700 ring-2 ring-blue-500' : 'bg-gray-700'} `}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.details}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">Est. {Math.round(p.appRate * 100)}% p.a.</div>
                  <div className="text-xs text-gray-400">Min ${p.min.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-400">Rent yield {Math.round(p.rentYield * 100)}% • Expenses {Math.round(p.expenseRate * 100)}%</div>
                <div className="space-x-2">
                  <button onClick={() => selectPlan(p.id)} className={`px-2 py-1 rounded ${selected === p.id ? 'bg-blue-600' : 'bg-gray-700'}`}>Select</button>
                  <button onClick={() => { setSelected(p.id); setDetailOpen(true); }} className="px-2 py-1 rounded bg-gray-700">Details</button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gray-700 p-3 rounded">
            <label className="block text-sm text-gray-300">Investment amount</label>
            <input type="number" value={amount} min={plan.min} onChange={(e) => setAmount(Number(e.target.value))} className="mt-2 w-full bg-gray-800 rounded p-2" />
            <label className="block text-sm text-gray-300 mt-3">Duration (years)</label>
            <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2" />
            <div className="text-sm text-gray-300 mt-1">{years} year{years > 1 ? 's' : ''}</div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmOpen(true)} className="w-full bg-green-600 px-3 py-2 rounded">Invest ${Math.round(amount)}</button>
              <button onClick={() => { setAmount(plan.min); setYears(10); }} className="w-full bg-gray-700 px-3 py-2 rounded">Reset</button>
            </div>

            <div className="mt-4 text-sm text-gray-300">
              <div>Projected total: <strong>${projected.totalNet.toLocaleString()}</strong></div>
              <div>Estimated profit: <strong className={`${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${profit.toLocaleString()}</strong></div>
              <div>ROI: <strong>{roiPct}%</strong></div>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-gray-900 p-4 rounded">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                <Line type="monotone" dataKey="totalNet" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-300">Projected Value</div>
              <div className="text-lg font-bold">${projected.propertyValue.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-300">Projected Income (annual)</div>
              <div className="text-lg font-bold">${Math.round((Number(amount) || 0) * plan.rentYield).toLocaleString()}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-300">Net Profit</div>
              <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${profit.toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-4 bg-gray-800 p-3 rounded">
            <h4 className="text-sm text-gray-300 mb-2">Why invest in this plan?</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Diversification into real assets with steady income streams.</li>
              <li>• Combination of capital appreciation and rental yield.</li>
              <li>• Professional asset management and curated opportunities.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Details modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{plan.name} — Details</h3>
              <button onClick={() => setDetailOpen(false)} className="px-2 py-1 bg-gray-700 rounded">Close</button>
            </div>
            <div className="text-sm text-gray-300 space-y-3">
              <p>{plan.details}</p>
              <p><strong>Assumptions:</strong> {Math.round(plan.appRate * 100)}% annual appreciation, {Math.round(plan.rentYield * 100)}% rent yield, {Math.round(plan.expenseRate * 100)}% estimated expenses.</p>
              <div className="mt-3">
                <h4 className="font-semibold">Year-by-year breakdown</h4>
                <div className="overflow-auto mt-2">
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-400">
                      <tr>
                        <th className="p-2">Year</th>
                        <th className="p-2">Property Value</th>
                        <th className="p-2">Annual Rent</th>
                        <th className="p-2">Expenses</th>
                        <th className="p-2">Net Cashflow</th>
                        <th className="p-2">Total Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((r) => (
                        <tr key={r.year} className="odd:bg-gray-700 even:bg-gray-600">
                          <td className="p-2">{r.year}</td>
                          <td className="p-2">${r.propertyValue.toLocaleString()}</td>
                          <td className="p-2">${r.rentIncome.toLocaleString()}</td>
                          <td className="p-2">${r.expenses.toLocaleString()}</td>
                          <td className="p-2">${r.netCashflow.toLocaleString()}</td>
                          <td className="p-2">${r.totalNet.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setDetailOpen(false)} className="px-3 py-1 rounded bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-lg p-6 w-96 text-white">
            <h3 className="text-lg font-semibold mb-2">Confirm Real Estate Investment</h3>
            <div className="text-sm text-gray-300 mb-2">Plan: <strong className="text-white">{plan.name}</strong></div>
            <div className="text-sm text-gray-300">Amount: <strong className="text-white">${Number(amount).toLocaleString()}</strong></div>
            <div className="text-sm text-gray-300">Duration: <strong className="text-white">{years} year{years > 1 ? 's' : ''}</strong></div>
            <div className="text-sm text-gray-300 mt-3">Projected net value: <strong className="text-white">${projected.totalNet.toLocaleString()}</strong></div>
            <div className={`text-sm mt-1 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>Estimated profit: <strong className="text-white">${profit.toLocaleString()}</strong></div>

            <div className="mt-6 flex justify-end space-x-2">
              <button onClick={() => setConfirmOpen(false)} className="px-3 py-1 rounded bg-gray-700">Cancel</button>
              <button onClick={doInvest} className="px-3 py-1 rounded bg-green-600">Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
