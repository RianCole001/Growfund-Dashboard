import React, { useState, useEffect } from 'react';
import { Save, Shield, DollarSign, Bell, Globe, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsService } from '../services/settingsAPI';
import { useSettings } from '../contexts/SettingsContext';

export default function AdminSettings() {
  const { forceRefresh } = useSettings();
  const [settings, setSettings] = useState({
    platformName: 'GrowFund',
    platformEmail: 'support@growfund.com',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdrawal: 50,
    maxWithdrawal: 50000,
    depositFee: 0,
    withdrawalFee: 2,
    referralBonus: 50,
    minCapitalPlanInvestment: 500,
    minRealEstateInvestment: 1000,
    minCryptoInvestment: 50,
    // Capital Plan Individual Minimums
    capitalBasicMin: 100,
    capitalStandardMin: 500,
    capitalAdvanceMin: 2000,
    // Real Estate Individual Minimums
    realEstateStarterMin: 1000,
    realEstatePremiumMin: 5000,
    realEstateLuxuryMin: 20000,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveDeposits: false,
    autoApproveWithdrawals: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAdminSettings();
      
      if (data.success) {
        // Map backend field names to frontend state
        const backendData = data.data;
        setSettings({
          platformName: backendData.platformName || 'GrowFund',
          platformEmail: backendData.platformEmail || 'support@growfund.com',
          minDeposit: parseFloat(backendData.minDeposit) || 100,
          maxDeposit: parseFloat(backendData.maxDeposit) || 100000,
          minWithdrawal: parseFloat(backendData.minWithdrawal) || 50,
          maxWithdrawal: parseFloat(backendData.maxWithdrawal) || 50000,
          depositFee: parseFloat(backendData.depositFee) || 0,
          withdrawalFee: parseFloat(backendData.withdrawalFee) || 2,
          referralBonus: parseFloat(backendData.referralBonus) || 50,
          minCapitalPlanInvestment: parseFloat(backendData.minCapitalPlanInvestment) || 500,
          minRealEstateInvestment: parseFloat(backendData.minRealEstateInvestment) || 1000,
          minCryptoInvestment: parseFloat(backendData.minCryptoInvestment) || 50,
          // Capital Plan Individual Minimums
          capitalBasicMin: parseFloat(backendData.capitalBasicMin) || 100,
          capitalStandardMin: parseFloat(backendData.capitalStandardMin) || 500,
          capitalAdvanceMin: parseFloat(backendData.capitalAdvanceMin) || 2000,
          // Real Estate Individual Minimums
          realEstateStarterMin: parseFloat(backendData.realEstateStarterMin) || 1000,
          realEstatePremiumMin: parseFloat(backendData.realEstatePremiumMin) || 5000,
          realEstateLuxuryMin: parseFloat(backendData.realEstateLuxuryMin) || 20000,
          maintenanceMode: backendData.maintenanceMode || false,
          emailNotifications: backendData.emailNotifications || true,
          smsNotifications: backendData.smsNotifications || false,
          autoApproveDeposits: backendData.autoApproveDeposits || false,
          autoApproveWithdrawals: backendData.autoApproveWithdrawals || false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      console.log('💾 Saving admin settings...');
      console.log('📊 Current settings state:', settings);
      
      // Map frontend state to backend field names (using camelCase for serializer)
      const backendData = {
        platformName: settings.platformName,
        platformEmail: settings.platformEmail,
        minDeposit: settings.minDeposit.toString(),
        maxDeposit: settings.maxDeposit.toString(),
        minWithdrawal: settings.minWithdrawal.toString(),
        maxWithdrawal: settings.maxWithdrawal.toString(),
        depositFee: settings.depositFee.toString(),
        withdrawalFee: settings.withdrawalFee.toString(),
        referralBonus: settings.referralBonus.toString(),
        minCapitalPlanInvestment: settings.minCapitalPlanInvestment.toString(),
        minRealEstateInvestment: settings.minRealEstateInvestment.toString(),
        minCryptoInvestment: settings.minCryptoInvestment.toString(),
        // Capital Plan Individual Minimums
        capitalBasicMin: settings.capitalBasicMin.toString(),
        capitalStandardMin: settings.capitalStandardMin.toString(),
        capitalAdvanceMin: settings.capitalAdvanceMin.toString(),
        // Real Estate Individual Minimums
        realEstateStarterMin: settings.realEstateStarterMin.toString(),
        realEstatePremiumMin: settings.realEstatePremiumMin.toString(),
        realEstateLuxuryMin: settings.realEstateLuxuryMin.toString(),
        maintenanceMode: settings.maintenanceMode,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        autoApproveDeposits: settings.autoApproveDeposits,
        autoApproveWithdrawals: settings.autoApproveWithdrawals,
      };

      console.log('📤 Sending to backend:', backendData);
      console.log('💰 Individual plan minimums being sent:');
      console.log('  - capitalBasicMin:', backendData.capitalBasicMin);
      console.log('  - capitalStandardMin:', backendData.capitalStandardMin);
      console.log('  - capitalAdvanceMin:', backendData.capitalAdvanceMin);
      console.log('  - realEstateStarterMin:', backendData.realEstateStarterMin);
      console.log('  - realEstatePremiumMin:', backendData.realEstatePremiumMin);
      console.log('  - realEstateLuxuryMin:', backendData.realEstateLuxuryMin);

      const data = await settingsService.updateAdminSettings(backendData);
      
      console.log('📥 Backend response:', data);
      
      if (data.success) {
        toast.success('Settings saved successfully!');
        console.log('✅ Settings saved successfully');
        
        // Refresh public settings for frontend components
        if (forceRefresh) {
          console.log('🔄 Forcing settings refresh...');
          forceRefresh();
        }
      } else {
        console.error('❌ Backend returned error:', data.message);
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
          <p className="text-sm text-gray-400 mt-1">Configure platform parameters</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Globe className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">General Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Support Email</label>
            <input
              type="email"
              value={settings.platformEmail}
              onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-white">Enable Maintenance Mode</span>
          </label>
        </div>
      </div>

      {/* Transaction Limits */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <DollarSign className="w-5 h-5 text-green-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Transaction Limits</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Minimum Deposit ($)</label>
            <input
              type="number"
              value={settings.minDeposit}
              onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Maximum Deposit ($)</label>
            <input
              type="number"
              value={settings.maxDeposit}
              onChange={(e) => setSettings({ ...settings, maxDeposit: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Minimum Withdrawal ($)</label>
            <input
              type="number"
              value={settings.minWithdrawal}
              onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Maximum Withdrawal ($)</label>
            <input
              type="number"
              value={settings.maxWithdrawal}
              onChange={(e) => setSettings({ ...settings, maxWithdrawal: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Deposit Fee (%)</label>
            <input
              type="number"
              value={settings.depositFee}
              onChange={(e) => setSettings({ ...settings, depositFee: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Withdrawal Fee (%)</label>
            <input
              type="number"
              value={settings.withdrawalFee}
              onChange={(e) => setSettings({ ...settings, withdrawalFee: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Investment Limits */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Investment Limits</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Minimum Crypto Investment ($)</label>
            <input
              type="number"
              value={settings.minCryptoInvestment}
              onChange={(e) => setSettings({ ...settings, minCryptoInvestment: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum amount for crypto purchases</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Minimum Capital Plan Investment ($)</label>
            <input
              type="number"
              value={settings.minCapitalPlanInvestment}
              onChange={(e) => setSettings({ ...settings, minCapitalPlanInvestment: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum amount for capital plan investments</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Minimum Real Estate Investment ($)</label>
            <input
              type="number"
              value={settings.minRealEstateInvestment}
              onChange={(e) => setSettings({ ...settings, minRealEstateInvestment: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum amount for real estate investments</p>
          </div>
        </div>
      </div>

      {/* Capital Plan Individual Minimums */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Capital Plan Minimums</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Basic Plan Minimum ($)</label>
            <input
              type="number"
              value={settings.capitalBasicMin}
              onChange={(e) => setSettings({ ...settings, capitalBasicMin: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum for Basic capital plan (20% monthly)</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Standard Plan Minimum ($)</label>
            <input
              type="number"
              value={settings.capitalStandardMin}
              onChange={(e) => setSettings({ ...settings, capitalStandardMin: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum for Standard capital plan (30% monthly)</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Advance Plan Minimum ($)</label>
            <input
              type="number"
              value={settings.capitalAdvanceMin}
              onChange={(e) => setSettings({ ...settings, capitalAdvanceMin: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum for Advance capital plan (40-60% monthly)</p>
          </div>
        </div>
      </div>

      {/* Real Estate Individual Minimums */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-amber-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Real Estate Property Minimums</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Starter Property Minimum ($)</label>
            <input
              type="number"
              value={settings.realEstateStarterMin}
              onChange={(e) => setSettings({ ...settings, realEstateStarterMin: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum for Starter Property (20% monthly)</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Premium Property Minimum ($)</label>
            <input
              type="number"
              value={settings.realEstatePremiumMin}
              onChange={(e) => setSettings({ ...settings, realEstatePremiumMin: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum for Premium Property (30% monthly)</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Luxury Estate Minimum ($)</label>
            <input
              type="number"
              value={settings.realEstateLuxuryMin}
              onChange={(e) => setSettings({ ...settings, realEstateLuxuryMin: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum for Luxury Estate (50% monthly)</p>
          </div>
        </div>
      </div>

      {/* Automation */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Automation & Security</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoApproveDeposits}
              onChange={(e) => setSettings({ ...settings, autoApproveDeposits: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-white">Auto-approve deposits under $1,000</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoApproveWithdrawals}
              onChange={(e) => setSettings({ ...settings, autoApproveWithdrawals: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-white">Auto-approve withdrawals under $500</span>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Bell className="w-5 h-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-white">Email Notifications</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-white">SMS Notifications</span>
          </label>
        </div>
      </div>

      {/* Referral Program */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Referral Program</h3>
        <div>
          <label className="text-sm text-gray-400 block mb-2">Referral Bonus ($)</label>
          <input
            type="number"
            value={settings.referralBonus}
            onChange={(e) => setSettings({ ...settings, referralBonus: Number(e.target.value) })}
            className="w-full md:w-1/2 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">Amount credited to referrer when referee makes first deposit</p>
        </div>
      </div>
    </div>
  );
}
