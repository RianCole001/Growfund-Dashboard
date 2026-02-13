import React, { useState } from 'react';
import { Save, Shield, DollarSign, Bell, Globe } from 'lucide-react';

export default function AdminSettings() {
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
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveDeposits: false,
    autoApproveWithdrawals: false,
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
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
