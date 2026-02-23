import React, { useState, useEffect } from 'react';
import { Copy, Users, DollarSign, Gift, Share2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { demoAwareAPI } from '../services/demoAwareAPI';
import { useSettings } from '../contexts/SettingsContext';

export default function Referrals() {
  const { settings } = useSettings();
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      setLoading(true);
      const response = await demoAwareAPI.getReferralStats();
      if (response.data) {
        setReferralStats(response.data);
      }
    } catch (error) {
      console.error('Error loading referral stats:', error);
      toast.error('Failed to load referral statistics');
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = async () => {
    try {
      setGenerating(true);
      const response = await demoAwareAPI.generateReferralCode();
      if (response.data) {
        setReferralStats(prev => ({
          ...prev,
          referral_code: response.data.referralCode,
          referral_link: response.data.referral_link || `${window.location.origin}/register?ref=${response.data.referralCode}`
        }));
        toast.success('New referral code generated!');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast.error('Failed to generate new referral code');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${type} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const shareReferralLink = () => {
    if (navigator.share && referralStats?.referral_link) {
      navigator.share({
        title: 'Join GrowFund',
        text: `Join GrowFund and get $${settings.referralBonus || 50} bonus!`,
        url: referralStats.referral_link,
      }).catch(() => {
        copyToClipboard(referralStats.referral_link, 'Referral link');
      });
    } else if (referralStats?.referral_link) {
      copyToClipboard(referralStats.referral_link, 'Referral link');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              <Users className="w-6 h-6 mr-2" />
              Referral Program
            </h2>
            <p className="text-purple-100 text-sm">
              Invite friends and earn ${settings.referralBonus || 50} for each successful referral!
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            <div className="text-xs text-purple-100 mb-1">Bonus Per Referral</div>
            <div className="text-xl font-bold text-white">${settings.referralBonus || 50}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Total Referrals</div>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {referralStats?.total_referrals || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Active: {referralStats?.active_referrals || 0}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Total Earned</div>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${(referralStats?.total_earned || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            This month: ${(referralStats?.this_month_earnings || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Pending Earnings</div>
            <Gift className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            ${(referralStats?.pending_earnings || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Pending: {referralStats?.pending_referrals || 0}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Conversion Rate</div>
            <Share2 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {referralStats?.total_referrals > 0 
              ? Math.round((referralStats.active_referrals / referralStats.total_referrals) * 100)
              : 0
            }%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Success rate
          </div>
        </div>
      </div>

      {/* Referral Tools */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-purple-500" />
          Your Referral Tools
        </h3>

        {/* Referral Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Your Referral Code</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 p-3 rounded-lg border border-gray-600">
                <div className="font-mono text-lg text-white">
                  {referralStats?.referral_code || 'Loading...'}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(referralStats?.referral_code, 'Referral code')}
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors"
                title="Copy code"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={generateNewCode}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-3 rounded-lg transition-colors"
                title="Generate new code"
              >
                <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Your Referral Link</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 p-3 rounded-lg border border-gray-600">
                <div className="text-sm text-white truncate">
                  {referralStats?.referral_link || 'Loading...'}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(referralStats?.referral_link, 'Referral link')}
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors"
                title="Copy link"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={shareReferralLink}
                className="bg-green-600 hover:bg-green-700 p-3 rounded-lg transition-colors"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-6 bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-3">How it Works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <div className="font-semibold text-white">Share Your Link</div>
                <div className="text-gray-400">Send your referral link to friends and family</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <div className="font-semibold text-white">They Sign Up</div>
                <div className="text-gray-400">Your friend creates an account using your link</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <div className="font-semibold text-white">You Both Earn</div>
                <div className="text-gray-400">You get ${settings.referralBonus || 50} bonus instantly!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      {referralStats?.referrals && referralStats.referrals.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Recent Referrals
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-sm text-gray-400 pb-2">User</th>
                  <th className="text-left text-sm text-gray-400 pb-2">Status</th>
                  <th className="text-left text-sm text-gray-400 pb-2">Earned</th>
                  <th className="text-left text-sm text-gray-400 pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {referralStats.referrals.slice(0, 5).map((referral, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 text-white">{referral.name || 'Anonymous'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        referral.status === 'active' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-3 text-green-400 font-semibold">
                      ${referral.earned || settings.referralBonus || 50}
                    </td>
                    <td className="py-3 text-gray-400 text-sm">
                      {new Date(referral.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}