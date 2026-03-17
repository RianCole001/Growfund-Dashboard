import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { TrendingUp, Home, DollarSign, Calendar, Zap, Award, Info, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const plans = [
  { 
    id: 'RE_BASIC', 
    name: 'Starter Property', 
    details: 'Entry-level real estate with steady 20% monthly returns',
    min: 1000, // This will be overridden by settings
    rate: 20,
    icon: Home,
    color: 'from-green-400 to-green-600',
    badge: '🏠 Starter',
    settingsKey: 'realEstateStarterMin'
  },
  { 
    id: 'RE_STANDARD', 
    name: 'Premium Property', 
    details: 'Mid-tier real estate with 30% monthly returns',
    min: 5000, // This will be overridden by settings
    rate: 30,
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-600',
    badge: '🏢 Premium',
    settingsKey: 'realEstatePremiumMin'
  },
  { 
    id: 'RE_LUXURY', 
    name: 'Luxury Estate', 
    details: 'High-end real estate with premium 50% monthly returns',
    min: 20000, // This will be overridden by settings
    rate: 50,
    icon: Award,
    color: 'from-emerald-500 to-green-700',
    badge: '👑 Luxury',
    settingsKey: 'realEstateLuxuryMin'
  },
];

function computeProjection(principal, months, monthlyRate) {
  const arr = [];
  let value = Number(principal) || 0;
  
  for (let m = 0; m <= months; m++) {
    if (m === 0) {
      arr.push({ 
        month: m, 
        value: Math.round(value), 
        label: `M${m}`, 
        gain: 0,
        monthlyGain: 0
      });
      continue;
    }
    
    const monthlyGain = value * (monthlyRate / 100);
    value = value + monthlyGain;
    
    arr.push({ 
      month: m, 
      value: Math.round(value), 
      label: `M${m}`, 
      gain: Math.round(value - (Number(principal) || 0)),
      monthlyGain: Math.round(monthlyGain)
    });
  }
  return arr;
}

export default function RealEstate({ balance = 0, onInvest = () => {} }) {
  const { settings } = useSettings();
  
  const [selected, setSelected] = useState(plans[0].id);
  const [amount, setAmount] = useState(settings.minRealEstateInvestment || plans[0].min);
  const [months, setMonths] = useState(6);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const plan = plans.find((p) => p.id === selected);
  const PlanIcon = plan.icon;

  // Get the actual minimum investment for the selected plan
  const getMinInvestment = () => {
    return settings[plan.settingsKey] || plan.min;
  };

  const selectPlan = (id) => {
    const p = plans.find((pp) => pp.id === id);
    setSelected(id);
    const minInvestment = settings[p.settingsKey] || p.min;
    setAmount(Math.max(minInvestment, p.min));
  };

  // Update amount when settings change
  React.useEffect(() => {
    const minInvestment = getMinInvestment();
    if (amount < minInvestment) {
      setAmount(minInvestment);
    }
  }, [settings.realEstateStarterMin, settings.realEstatePremiumMin, settings.realEstateLuxuryMin]);

  const data = useMemo(() => computeProjection(amount, months, plan.rate), [amount, months, plan]);

  const projected = data[data.length - 1] || { value: 0, gain: 0 };
  const profit = projected.gain;
  const roiPct = ((profit / (Number(amount) || 1)) * 100).toFixed(1);

  const doInvest = () => {
    // Use platform settings for minimum investment
    const minInvestment = getMinInvestment();
    
    if (amount < minInvestment) {
      toast.error(`Minimum investment for ${plan.name} is $${minInvestment}`);
      return;
    }
    if (amount > balance) {
      alert('Insufficient balance');
      return;
    }
    
    const payload = { 
      type: 'real_estate',
      name: plan.name, 
      amount: Number(amount), 
      months,
      rate: plan.rate,
      date: new Date().toISOString(), 
      details: 'Real Estate - ' + plan.name 
    };
    onInvest(payload);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center mb-2">
              <Home className="w-6 h-6 mr-2" />
              Real Estate Investment
            </h2>
            <p className="text-green-100 text-sm">Build wealth through premium real estate with monthly compound returns</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
            <div className="text-xs text-green-100 mb-1">Available Balance</div>
            <div className="text-xl sm:text-2xl font-bold text-white">${Math.round(balance).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const CardIcon = p.icon;
          const isSelected = selected === p.id;
          const isHovered = hoveredPlan === p.id;
          
          return (
            <div 
              key={p.id} 
              onClick={() => selectPlan(p.id)}
              onMouseEnter={() => setHoveredPlan(p.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative bg-white border border-gray-200 rounded-lg p-5 cursor-pointer transition-all shadow-md transform ${
                isSelected 
                  ? 'ring-2 ring-green-500 shadow-lg scale-105' 
                  : 'hover:shadow-lg hover:scale-102'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 ${isSelected ? 'opacity-10' : ''} rounded-lg transition-opacity`}></div>
              
              <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {p.badge}
              </div>

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 shadow-md`}>
                  <CardIcon className="w-6 h-6 text-white" />
                </div>
                
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {p.rate}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Monthly Return</div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{p.details}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Min. ${(settings[p.settingsKey] || p.min).toLocaleString()}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); selectPlan(p.id); }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isSelected 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                Investment Amount
              </label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl p-4 text-2xl font-bold text-center focus:ring-2 focus:ring-green-500 focus:outline-none transition-all" 
              />
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-gray-500">Min: ${getMinInvestment().toLocaleString()}</span>
                <span className="text-gray-500">Max: ${balance.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setAmount(Math.round(balance * percent / 100))}
                    className="bg-white border border-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 text-gray-700 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                Investment Period
              </label>
              <input 
                type="range" 
                min={1} 
                max={60} 
                value={months} 
                onChange={(e) => setMonths(Number(e.target.value))} 
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" 
              />
              <div className="flex justify-between mt-3">
                <span className="text-2xl font-black text-green-600">{months}</span>
                <span className="text-sm text-gray-600">{months === 1 ? 'Month' : 'Months'}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Expected Returns</span>
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                +${profit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {roiPct}% ROI over {months} {months === 1 ? 'month' : 'months'}
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => setConfirmOpen(true)} 
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all shadow-md"
              >
                Invest ${Math.round(amount).toLocaleString()}
              </button>
              <button 
                onClick={() => { setAmount(plan.min); setMonths(6); }} 
                className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600">
                  <strong className="text-gray-900">Monthly Compounding:</strong> Returns are calculated and reinvested each month for exponential growth.
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Charts & Stats */}
          <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
            {/* Main Chart */}
            <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Growth Projection</h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '2px solid #16a34a', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Value']} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#16a34a" 
                      strokeWidth={3}
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Gains Chart */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Gains</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.slice(1)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Gain']} 
                    />
                    <Bar dataKey="monthlyGain" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Initial Investment</div>
                <div className="text-xl font-bold text-gray-900">${amount.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Final Value</div>
                <div className="text-xl font-bold text-green-600">${projected.value.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Total Gain</div>
                <div className="text-xl font-bold text-green-600">+${profit.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Investment</h3>
              <p className="text-sm text-gray-600">Review your real estate investment details</p>
            </div>
            
            <div className="space-y-3 mb-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Property</span>
                <span className="font-semibold text-gray-900">{plan.name}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-xl text-gray-900">${Number(amount).toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">{months} {months === 1 ? 'Month' : 'Months'}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Monthly Rate</span>
                <span className="font-semibold text-gray-900">{plan.rate}%</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Final Value</span>
                <span className="font-semibold text-green-600">${projected.value.toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Expected Gain</span>
                <span className="font-bold text-lg text-green-600">+${profit.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setConfirmOpen(false)} 
                className="flex-1 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={doInvest} 
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all transform hover:scale-105"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Disclaimer:</span> Projections are for illustrative purposes. Actual returns may vary based on market conditions.
        </p>
      </div>
    </div>
  );
}
