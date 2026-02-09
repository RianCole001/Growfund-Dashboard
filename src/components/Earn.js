import React, { useState } from 'react';
import { Copy, Check, Users, DollarSign, Gift, TrendingUp, Share2, Award, Mail, Calendar } from 'lucide-react';

export default function Earn({ userEmail = 'user@example.com', onNotify = () => {} }) {
  const [copied, setCopied] = useState(false);
  
  // Generate referral code from email
  const generateReferralCode = (email) => {
    const base = email.split('@')[0].toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${base}${random}`;
  };

  const referralCode = generateReferralCode(userEmail);
  const referralLink = `https://growfund.com/signup?ref=${referralCode}`;

  // Mock data - in real app, this would come from backend
  const stats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarned: 2450.00,
    pendingEarnings: 350.00,
    thisMonthEarnings: 680.00
  };

  const referrals = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', earned: 250, date: '2026-01-15', invested: 5000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', earned: 180, date: '2026-01-20', invested: 3600 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'pending', earned: 0, date: '2026-02-05', invested: 0 },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', status: 'active', earned: 320, date: '2026-01-10', invested: 6400 }
  ];

  const rewardTiers = [
    { referrals: 5, bonus: 100, icon: Gift, color: 'from-blue-500 to-cyan-500', unlocked: stats.totalReferrals >= 5 },
    { referrals: 10, bonus: 250, icon: Award, color: 'from-purple-500 to-pink-500', unlocked: stats.totalReferrals >= 10 },
    { referrals: 25, bonus: 750, icon: TrendingUp, color: 'from-orange-500 to-red-500', unlocked: stats.totalReferrals >= 25 },
    { referrals: 50, bonus: 2000, icon: Users, color: 'from-green-500 to-emerald-500', unlocked: stats.totalReferrals >= 50 }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (typeof onNotify === 'function') {
      onNotify('Referral link copied to clipboard');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center mb-2">
              <Gift className="w-6 h-6 mr-2" />
              Earn & Refer
            </h2>
            <p className="text-blue-100 text-sm">Invite friends and earn rewards together</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
            <div className="text-xs text-blue-100 mb-1">Total Earned</div>
            <div className="text-xl sm:text-2xl font-bold text-white">${stats.totalEarned.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalReferrals}</div>
          <div className="text-sm text-gray-400">Referrals</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.activeReferrals}</div>
          <div className="text-sm text-gray-400">Active Users</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-400">This Month</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">${stats.thisMonthEarnings.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Earnings</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-400">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">${stats.pendingEarnings.toLocaleString()}</div>
          <div className="text-sm text-gray-400">To Claim</div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <Share2 className="w-5 h-5 mr-2 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Your Referral Link</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Referral Code</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-lg px-4 py-3 font-mono text-lg font-bold text-blue-400">
                {referralCode}
              </div>
              <button
                onClick={() => copyToClipboard(referralCode)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Referral Link</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 truncate">
                {referralLink}
              </div>
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong className="text-white">How it works:</strong> Share your referral link with friends. When they sign up and invest, you both earn rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center mb-6">
          <Award className="w-5 h-5 mr-2 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Reward Tiers</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewardTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={index}
                className={`relative rounded-lg p-5 border ${
                  tier.unlocked
                    ? 'bg-gray-700 border-green-500'
                    : 'bg-gray-700/50 border-gray-600'
                }`}
              >
                {tier.unlocked && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Unlocked
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3 ${!tier.unlocked && 'opacity-50'}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="text-xl font-bold text-white mb-1">{tier.referrals} Referrals</div>
                <div className="text-sm text-gray-400 mb-2">Bonus Reward</div>
                <div className="text-2xl font-bold text-green-400">${tier.bonus}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral List */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Your Referrals</h3>
          </div>
          <span className="text-sm text-gray-400">{referrals.length} total</span>
        </div>

        <div className="space-y-3">
          {referrals.map((referral) => (
            <div
              key={referral.id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {referral.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{referral.name}</div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Mail className="w-3 h-3 mr-1" />
                        {referral.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Invested</div>
                    <div className="font-semibold text-white">${referral.invested.toLocaleString()}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Earned</div>
                    <div className="font-semibold text-green-400">${referral.earned.toLocaleString()}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Joined
                    </div>
                    <div className="text-xs text-gray-300">{new Date(referral.date).toLocaleDateString()}</div>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        referral.status === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}
                    >
                      {referral.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {referrals.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <div className="text-gray-400 mb-2">No referrals yet</div>
            <div className="text-sm text-gray-500">Share your referral link to get started</div>
          </div>
        )}
      </div>

      {/* How to Earn Section */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How to Maximize Your Earnings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-3xl mb-2">1️⃣</div>
            <div className="font-semibold text-white mb-2">Share Your Link</div>
            <div className="text-sm text-gray-400">Copy and share your unique referral link with friends and family</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-3xl mb-2">2️⃣</div>
            <div className="font-semibold text-white mb-2">They Sign Up</div>
            <div className="text-sm text-gray-400">Your referrals create an account and start investing</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-3xl mb-2">3️⃣</div>
            <div className="font-semibold text-white mb-2">Earn Together</div>
            <div className="text-sm text-gray-400">You both receive rewards based on their investment activity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
