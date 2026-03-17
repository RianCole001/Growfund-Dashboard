import React, { useState, useEffect } from 'react';
import { Save, Shield, DollarSign, Bell, Globe, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsService } from '../services/settingsAPI';
import { useSettings } from '../contexts/SettingsContext';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
const labelCls = 'text-sm text-gray-600 block mb-1.5 font-medium';
const sectionCls = 'bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6';

export default function AdminSettings() {
  const { forceRefresh } = useSettings();
  const [settings, setSettings] = useState({
    platformName: 'GrowFund', platformEmail: 'support@growfund.com',
    minDeposit: 100, maxDeposit: 100000, minWithdrawal: 50, maxWithdrawal: 50000,
    depositFee: 0, withdrawalFee: 2, referralBonus: 50,
    minCapitalPlanInvestment: 500, minRealEstateInvestment: 1000, minCryptoInvestment: 50,
    capitalBasicMin: 100, capitalStandardMin: 500, capitalAdvanceMin: 2000,
    realEstateStarterMin: 1000, realEstatePremiumMin: 5000, realEstateLuxuryMin: 20000,
    maintenanceMode: false, emailNotifications: true, smsNotifications: false,
    autoApproveDeposits: false, autoApproveWithdrawals: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAdminSettings();
      if (data.success) {
        const b = data.data;
        setSettings({
          platformName: b.platformName || 'GrowFund',
          platformEmail: b.platformEmail || 'support@growfund.com',
          minDeposit: parseFloat(b.minDeposit) || 100,
          maxDeposit: parseFloat(b.maxDeposit) || 100000,
          minWithdrawal: parseFloat(b.minWithdrawal) || 50,
          maxWithdrawal: parseFloat(b.maxWithdrawal) || 50000,
          depositFee: parseFloat(b.depositFee) || 0,
          withdrawalFee: parseFloat(b.withdrawalFee) || 2,
          referralBonus: parseFloat(b.referralBonus) || 50,
          minCapitalPlanInvestment: parseFloat(b.minCapitalPlanInvestment) || 500,
          minRealEstateInvestment: parseFloat(b.minRealEstateInvestment) || 1000,
          minCryptoInvestment: parseFloat(b.minCryptoInvestment) || 50,
          capitalBasicMin: parseFloat(b.capitalBasicMin) || 100,
          capitalStandardMin: parseFloat(b.capitalStandardMin) || 500,
          capitalAdvanceMin: parseFloat(b.capitalAdvanceMin) || 2000,
          realEstateStarterMin: parseFloat(b.realEstateStarterMin) || 1000,
          realEstatePremiumMin: parseFloat(b.realEstatePremiumMin) || 5000,
          realEstateLuxuryMin: parseFloat(b.realEstateLuxuryMin) || 20000,
          maintenanceMode: b.maintenanceMode || false,
          emailNotifications: b.emailNotifications !== false,
          smsNotifications: b.smsNotifications || false,
          autoApproveDeposits: b.autoApproveDeposits || false,
          autoApproveWithdrawals: b.autoApproveWithdrawals || false,
        });
      }
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const backendData = Object.fromEntries(
        Object.entries(settings).map(([k, v]) => [k, typeof v === 'number' ? v.toString() : v])
      );
      const data = await settingsService.updateAdminSettings(backendData);
      if (data.success) {
        toast.success('Settings saved');
        if (forceRefresh) forceRefresh();
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));
  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Platform Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure platform parameters</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* General */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">General Settings</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Platform Name</label>
            <input type="text" value={settings.platformName} onChange={(e) => set('platformName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Support Email</label>
            <input type="email" value={settings.platformEmail} onChange={(e) => set('platformEmail', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
            <span className="text-sm text-gray-700">Enable Maintenance Mode</span>
          </label>
        </div>
      </div>

      {/* Transaction Limits */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Transaction Limits</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Min Deposit ($)', key: 'minDeposit' },
            { label: 'Max Deposit ($)', key: 'maxDeposit' },
            { label: 'Min Withdrawal ($)', key: 'minWithdrawal' },
            { label: 'Max Withdrawal ($)', key: 'maxWithdrawal' },
            { label: 'Deposit Fee (%)', key: 'depositFee' },
            { label: 'Withdrawal Fee (%)', key: 'withdrawalFee' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input type="number" value={settings[f.key]} onChange={(e) => set(f.key, Number(e.target.value))} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      {/* Investment Limits */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Investment Limits</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Min Crypto Investment ($)', key: 'minCryptoInvestment' },
            { label: 'Min Capital Plan ($)', key: 'minCapitalPlanInvestment' },
            { label: 'Min Real Estate ($)', key: 'minRealEstateInvestment' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input type="number" value={settings[f.key]} onChange={(e) => set(f.key, Number(e.target.value))} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      {/* Capital Plan Minimums */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Capital Plan Minimums</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Basic Plan ($)', key: 'capitalBasicMin', hint: '20% monthly' },
            { label: 'Standard Plan ($)', key: 'capitalStandardMin', hint: '30% monthly' },
            { label: 'Advance Plan ($)', key: 'capitalAdvanceMin', hint: '40-60% monthly' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input type="number" value={settings[f.key]} onChange={(e) => set(f.key, Number(e.target.value))} className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">{f.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real Estate Minimums */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Real Estate Property Minimums</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Starter Property ($)', key: 'realEstateStarterMin', hint: '20% monthly' },
            { label: 'Premium Property ($)', key: 'realEstatePremiumMin', hint: '30% monthly' },
            { label: 'Luxury Estate ($)', key: 'realEstateLuxuryMin', hint: '50% monthly' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input type="number" value={settings[f.key]} onChange={(e) => set(f.key, Number(e.target.value))} className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">{f.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Automation */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-900">Automation & Security</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'autoApproveDeposits', label: 'Auto-approve deposits under $1,000' },
            { key: 'autoApproveWithdrawals', label: 'Auto-approve withdrawals under $500' },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings[f.key]} onChange={() => toggle(f.key)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              <span className="text-sm text-gray-700">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Email Notifications' },
            { key: 'smsNotifications', label: 'SMS Notifications' },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings[f.key]} onChange={() => toggle(f.key)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              <span className="text-sm text-gray-700">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Referral */}
      <div className={sectionCls}>
        <h3 className="font-semibold text-gray-900 mb-4">Referral Program</h3>
        <div className="max-w-xs">
          <label className={labelCls}>Referral Bonus ($)</label>
          <input type="number" value={settings.referralBonus} onChange={(e) => set('referralBonus', Number(e.target.value))} className={inputCls} />
          <p className="text-xs text-gray-400 mt-1">Credited to referrer on first deposit</p>
        </div>
      </div>
    </div>
  );
}
