import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Globe, Palette, Shield, User, Mail, Phone, Key, Eye, EyeOff, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAuthAPI } from '../services/api';

export default function Settings({ profile, onSave, onNotify }) {
  const storage = require('../utils/storage').default;
  
  // Load settings from storage
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(storage.get('settings', {
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      priceAlerts: true,
      transactions: true,
      referrals: true,
      marketing: false
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30
    },
    privacy: {
      showProfile: true,
      showPortfolio: false,
      showActivity: false
    }
  }));

  // Fetch settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await userAuthAPI.getSettings();
        const backendSettings = response.data.data || response.data;
        
        const formattedSettings = {
          theme: backendSettings.theme || 'dark',
          currency: backendSettings.currency || 'USD',
          language: backendSettings.language || 'en',
          timezone: backendSettings.timezone || 'UTC',
          notifications: {
            email: backendSettings.email_notifications !== false,
            push: backendSettings.push_notifications !== false,
            priceAlerts: backendSettings.price_alerts !== false,
            transactions: backendSettings.transaction_alerts !== false,
            referrals: backendSettings.referral_alerts !== false,
            marketing: backendSettings.marketing_emails === true
          },
          security: {
            twoFactor: backendSettings.two_factor_enabled === true,
            loginAlerts: backendSettings.login_alerts !== false,
            sessionTimeout: backendSettings.session_timeout || 30
          },
          privacy: {
            showProfile: backendSettings.profile_visible !== false,
            showPortfolio: backendSettings.portfolio_visible === true,
            showActivity: backendSettings.activity_sharing === true
          }
        };
        
        setSettings(formattedSettings);
        storage.set('settings', formattedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'privacy', name: 'Privacy', icon: Shield }
  ];

  const updateSetting = async (category, key, value) => {
    try {
      const newSettings = {
        ...settings,
        [category]: typeof settings[category] === 'object' 
          ? { ...settings[category], [key]: value }
          : value
      };
      
      // Prepare data for backend
      const updateData = {
        theme: newSettings.theme,
        currency: newSettings.currency,
        language: newSettings.language,
        timezone: newSettings.timezone,
        email_notifications: newSettings.notifications.email,
        push_notifications: newSettings.notifications.push,
        price_alerts: newSettings.notifications.priceAlerts,
        transaction_alerts: newSettings.notifications.transactions,
        referral_alerts: newSettings.notifications.referrals,
        marketing_emails: newSettings.notifications.marketing,
        two_factor_enabled: newSettings.security.twoFactor,
        login_alerts: newSettings.security.loginAlerts,
        session_timeout: newSettings.security.sessionTimeout,
        profile_visible: newSettings.privacy.showProfile,
        portfolio_visible: newSettings.privacy.showPortfolio,
        activity_sharing: newSettings.privacy.showActivity
      };

      await userAuthAPI.updateSettings(updateData);
      setSettings(newSettings);
      storage.set('settings', newSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await userAuthAPI.changePassword(passwordForm.current, passwordForm.new, passwordForm.confirm);
      toast.success('Password changed successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const enable2FA = () => {
    // In real app, this would show QR code and verification
    updateSetting('security', 'twoFactor', !settings.security.twoFactor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3 text-white" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Settings</h2>
            <p className="text-blue-100 text-sm mt-1">Manage your account preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex overflow-x-auto border-b border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">General Preferences</h3>
                
                {/* Theme */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Palette className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="font-semibold text-white">Theme</div>
                        <div className="text-sm text-gray-400">Choose your display theme</div>
                      </div>
                    </div>
                    <select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', null, e.target.value)}
                      className="bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>

                {/* Currency */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-semibold text-white">Currency</div>
                        <div className="text-sm text-gray-400">Display currency preference</div>
                      </div>
                    </div>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', null, e.target.value)}
                      className="bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">Language</div>
                        <div className="text-sm text-gray-400">Interface language</div>
                      </div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', null, e.target.value)}
                      className="bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                </div>

                {/* Timezone */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="font-semibold text-white">Timezone</div>
                        <div className="text-sm text-gray-400">Your local timezone</div>
                      </div>
                    </div>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', null, e.target.value)}
                      className="bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                
                {Object.entries({
                  email: { label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                  push: { label: 'Push Notifications', desc: 'Browser push notifications', icon: Bell },
                  priceAlerts: { label: 'Price Alerts', desc: 'Get notified of price changes', icon: TrendingUp },
                  transactions: { label: 'Transaction Alerts', desc: 'Deposits, withdrawals, and trades', icon: DollarSign },
                  referrals: { label: 'Referral Updates', desc: 'New referrals and earnings', icon: User },
                  marketing: { label: 'Marketing Emails', desc: 'Promotions and updates', icon: Mail }
                }).map(([key, { label, desc, icon: Icon }]) => (
                  <div key={key} className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="font-semibold text-white">{label}</div>
                          <div className="text-sm text-gray-400">{desc}</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications[key]}
                          onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                
                {/* Two-Factor Authentication */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-semibold text-white">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-400">Add an extra layer of security</div>
                      </div>
                    </div>
                    <button
                      onClick={enable2FA}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        settings.security.twoFactor
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      {settings.security.twoFactor ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                </div>

                {/* Login Alerts */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-semibold text-white">Login Alerts</div>
                        <div className="text-sm text-gray-400">Get notified of new logins</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.loginAlerts}
                        onChange={(e) => updateSetting('security', 'loginAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Session Timeout */}
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-red-400" />
                      <div>
                        <div className="font-semibold text-white">Session Timeout</div>
                        <div className="text-sm text-gray-400">Auto-logout after inactivity</div>
                      </div>
                    </div>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-5 h-5 text-purple-400" />
                    <h4 className="font-semibold text-white">Change Password</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={changingPassword}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
                
                {Object.entries({
                  showProfile: { label: 'Public Profile', desc: 'Make your profile visible to others' },
                  showPortfolio: { label: 'Show Portfolio', desc: 'Display your portfolio publicly' },
                  showActivity: { label: 'Show Activity', desc: 'Share your trading activity' }
                }).map(([key, { label, desc }]) => (
                  <div key={key} className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="font-semibold text-white">{label}</div>
                          <div className="text-sm text-gray-400">{desc}</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy[key]}
                          onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-red-400 mb-2">Danger Zone</h4>
                  <p className="text-sm text-gray-400 mb-4">Irreversible actions that affect your account</p>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
