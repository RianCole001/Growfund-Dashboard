import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Bar, BarChart } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Target, Shield, Zap, Award, Info, X } from 'lucide-react';

const storage = require('../utils/storage').default;

export default function CapitalPlan({ investments = [], balance = 0, onInvest = () => {}, onNotify = () => {} }) {
  const plans = [
    { 
      key: 'basic', 
      name: 'Basic', 
      rate: 20, 
      min: 100, 
      desc: 'Steady growth with 20% monthly returns. Perfect for beginners.',
      icon: Shield,
      color: 'from-cyan-400 via-blue-500 to-blue-600',
      badge: '🛡️ Safe',
      features: ['20% Monthly', 'Low Risk', 'Flexible Terms']
    },
    { 
      key: 'standard', 
      name: 'Standard', 
      rate: 30, 
      min: 500, 
      desc: 'Balanced growth with 30% monthly returns. Most popular choice.',
      icon: Target,
      color: 'from-purple-400 via-pink-500 to-purple-600',
      badge: '⚡ Popular',
      features: ['30% Monthly', 'Balanced Risk', 'Monthly Reports']
    },
    { 
      key: 'advance', 
      name: 'Advance', 
      rate: 40, 
      min: 2000, 
      desc: 'Maximum growth with 40%, 50%, or 60% monthly returns.',
      icon: Zap,
      color: 'from-orange-400 via-red-500 to-pink-600',
      badge: '🚀 Premium',
      features: ['40-60% Monthly', 'High Returns', 'Priority Support']
    },
  ];

  const [selected, setSelected] = useState(plans[0].key);
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(6);
  const [advanceRate, setAdvanceRate] = useState(40);
  const [showOnboard, setShowOnboard] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const openHelp = () => setShowHelpModal(true);
  const closeHelp = () => setShowHelpModal(false);

  useEffect(() => {
    const seen = storage.get('seenCapitalOnboarding', false);
    setShowOnboard(!seen);
  }, []);

  const dismissOnboard = () => {
    storage.set('seenCapitalOnboarding', true);
    setShowOnboard(false);
    if (typeof onNotify === 'function') onNotify('Welcome to Capital Investment Plan');
  }; 

  const selectedPlan = plans.find((p) => p.key === selected);
  const Icon = selectedPlan.icon;
  
  // Get the growth rate for calculations
  const getGrowthRate = () => {
    if (selected === 'advance') return advanceRate;
    return selectedPlan.rate;
  };

  const data = useMemo(() => {
    const arr = [];
    let val = Number(amount) || 0;
    const growthRate = getGrowthRate() / 100;
    
    for (let m = 0; m <= months; m++) {
      if (m === 0) arr.push({ month: m, value: Math.round(val), label: `M${m}`, gain: 0 });
      else {
        const prevVal = val;
        val = val * (1 + growthRate);
        arr.push({ month: m, value: Math.round(val), label: `M${m}`, gain: Math.round(val - prevVal) });
      }
    }
    return arr;
  }, [amount, months, selected, advanceRate]);

  const finalValue = data[data.length - 1]?.value || 0;
  const totalGain = finalValue - amount;
  const percentageGain = amount > 0 ? ((totalGain / amount) * 100).toFixed(1) : 0;

  const openConfirm = (amt, plan) => {
    if (amt < plan.min) {
      alert(`Minimum investment for ${plan.name} plan is $${plan.min}`);
      return;
    }
    if (amt > balance) {
      alert('Insufficient balance');
      return;
    }
    const growthRate = selected === 'advance' ? advanceRate : plan.rate;
    const pay = { 
      amount: Number(amt || 0), 
      plan: plan.name, 
      plan_type: selected,
      name: `Capital Plan - ${plan.name}`, 
      months,
      growth_rate: growthRate
    };
    setConfirmData(pay);
    setConfirmOpen(true);
  };

  const doConfirmInvest = () => {
    if (!confirmData) return;
    onInvest({ ...confirmData, date: new Date().toISOString() });
    if (typeof onNotify === 'function') onNotify(`Invested ${Number(confirmData.amount).toLocaleString()} in ${confirmData.plan}`);
    setConfirmOpen(false);
    setConfirmData(null);
    setAmount(1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center mb-2">
              <TrendingUp className="w-6 h-6 mr-2" />
              Capital Investment Plan
            </h2>
            <p className="text-blue-100 text-sm">Grow your wealth with monthly compound returns</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
            <div className="text-xs text-blue-100 mb-1">Available Balance</div>
            <div className="text-xl sm:text-2xl font-bold text-white">${Math.round(balance).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Onboarding */}
      {showOnboard && (
        <div className="bg-blue-600 p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Info className="w-5 h-5 mr-2 text-blue-100" />
                <div className="font-semibold text-white">Getting Started</div>
              </div>
              <div className="text-sm text-blue-50 mb-3">
                Choose your investment plan, set your duration in months, and watch your money grow with monthly compound returns.
              </div>
              <button onClick={openHelp} className="text-sm font-medium text-blue-100 hover:text-white underline">
                Learn more about plans →
              </button>
            </div>
            <button 
              onClick={dismissOnboard} 
              className="ml-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const PlanIcon = p.icon;
          const isSelected = selected === p.key;
          const isHovered = hoveredPlan === p.key;
          
          return (
            <div 
              key={p.key} 
              onClick={() => setSelected(p.key)}
              onMouseEnter={() => setHoveredPlan(p.key)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative bg-gray-800 rounded-lg p-5 cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md hover:bg-gray-750'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 ${isSelected ? 'opacity-5' : ''} rounded-lg transition-opacity`}></div>
              
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {p.badge}
              </div>

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 shadow-md`}>
                  <PlanIcon className="w-6 h-6 text-white" />
                </div>
                
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                  <div className="text-3xl font-bold text-blue-400">
                    {p.key === 'advance' ? '40-60%' : p.rate}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Monthly Return</div>
                </div>

                <p className="text-sm text-gray-400 mb-4">{p.desc}</p>

                <div className="space-y-2 mb-4">
                  {p.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Min. ${p.min}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openConfirm(amount, p); }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {isSelected ? 'Invest Now' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Growth Visualization */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center mb-2">
              <Icon className="w-5 h-5 mr-2 text-blue-400" />
              Growth Projection
            </h3>
            <p className="text-sm text-gray-400">Monthly compound growth with {selectedPlan.name} Plan</p>
          </div>
          <div className="mt-4 sm:mt-0 bg-gray-700 px-5 py-3 rounded-lg border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Projected Value</div>
            <div className="text-xl font-bold text-white">${finalValue.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="label" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '2px solid #3B82F6', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                    formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Value']} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={4}
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(1)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="label" stroke="#9CA3AF" style={{ fontSize: '10px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Monthly Gain']} 
                  />
                  <Bar dataKey="gain" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-700/50 backdrop-blur-sm p-5 rounded-xl border border-gray-600">
              <label className="flex items-center text-sm font-semibold text-gray-300 mb-3">
                <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                Investment Amount
              </label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                className="w-full bg-gray-800 rounded-xl p-4 text-2xl font-bold text-center focus:ring-4 focus:ring-blue-500 focus:outline-none transition-all" 
              />
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-gray-500">Min: ${selectedPlan.min}</span>
                <span className="text-gray-500">Max: ${balance.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setAmount(Math.round(balance * percent / 100))}
                    className="bg-gray-600 hover:bg-blue-600 py-2 rounded-lg text-xs font-bold transition-all transform hover:scale-105"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/50 backdrop-blur-sm p-5 rounded-xl border border-gray-600">
              <label className="flex items-center text-sm font-semibold text-gray-300 mb-3">
                <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                Investment Period
              </label>
              <input 
                type="range" 
                min={1} 
                max={60} 
                value={months} 
                onChange={(e) => setMonths(Number(e.target.value))} 
                className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600" 
              />
              <div className="flex justify-between mt-3">
                <span className="text-2xl font-black text-purple-400">{months}</span>
                <span className="text-sm text-gray-400">{months === 1 ? 'Month' : 'Months'}</span>
              </div>
            </div>

            {selected === 'advance' && (
              <div className="bg-gray-700/50 backdrop-blur-sm p-5 rounded-xl border border-gray-600">
                <label className="flex items-center text-sm font-semibold text-gray-300 mb-3">
                  <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                  Growth Rate
                </label>
                <div className="flex gap-2">
                  {[40, 50, 60].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setAdvanceRate(rate)}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                        advanceRate === rate
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-700 border border-gray-600 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Expected Profit</span>
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                +${totalGain.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                {percentageGain}% growth over {months} {months === 1 ? 'month' : 'months'}
              </div>
            </div>

            <button 
              onClick={() => openConfirm(amount, selectedPlan)} 
              className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Invest ${Math.round(amount).toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-400" />
                Investment Plans Guide
              </h3>
              <button onClick={closeHelp} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {plans.map((plan) => {
                const PlanIcon = plan.icon;
                return (
                  <div key={plan.key} className="bg-gray-700 p-5 rounded-lg border border-gray-600">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                        <PlanIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg text-white">{plan.name}</h4>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-medium">{plan.badge}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{plan.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-600 text-white px-3 py-1 rounded font-medium">
                            {plan.key === 'advance' ? '40-60% Monthly Return' : `${plan.rate}% Monthly Return`}
                          </span>
                          <span className="text-xs bg-gray-600 text-gray-300 px-3 py-1 rounded">
                            Min. ${plan.min}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-blue-600/10 border border-blue-600/30 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Tip:</strong> Start with the Basic plan and scale up as you gain confidence. All returns are calculated with monthly compounding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Confirm Investment</h3>
              <p className="text-sm text-gray-400">Review your investment details</p>
            </div>
            
            <div className="space-y-3 mb-6 bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Plan</span>
                <span className="font-semibold text-white">{confirmData.plan}</span>
              </div>
              <div className="h-px bg-gray-600"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold text-xl text-white">${Number(confirmData.amount).toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-600"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Duration</span>
                <span className="font-semibold text-white">{confirmData.months} {confirmData.months === 1 ? 'Month' : 'Months'}</span>
              </div>
              <div className="h-px bg-gray-600"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Growth Rate</span>
                <span className="font-semibold text-white">{confirmData.growth_rate}% Monthly</span>
              </div>
              <div className="h-px bg-gray-600"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Projected Value</span>
                <span className="font-semibold text-green-400">${finalValue.toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-600"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Expected Gain</span>
                <span className="font-bold text-lg text-green-400">+${totalGain.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => { setConfirmOpen(false); setConfirmData(null); }} 
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={doConfirmInvest} 
                className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center bg-gray-800 p-4 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium">Disclaimer:</span> Projections are for illustrative purposes. Actual returns may vary based on market conditions.
        </p>
      </div>
    </div>
  );
}
