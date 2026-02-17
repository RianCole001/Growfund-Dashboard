import React, { useState } from 'react';
import { useDemo } from '../demo/DemoContext';
import { Play, Square, Info, User, Lock, Unlock } from 'lucide-react';

export default function DemoToggle() {
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemo();
  const [showInfo, setShowInfo] = useState(false);

  const handleToggle = () => {
    if (isDemoMode) {
      disableDemoMode();
    } else {
      enableDemoMode();
    }
  };

  return (
    <>
      {/* Demo Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2">
          {/* Info Button */}
          <button
            onClick={() => setShowInfo(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
            title="Demo Mode Info"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg ${
              isDemoMode
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            }`}
          >
            {isDemoMode ? (
              <>
                <Square className="w-4 h-4" />
                <span>Exit Demo</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Try Demo</span>
              </>
            )}
          </button>
        </div>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="mt-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold animate-pulse">
            🎭 DEMO MODE ACTIVE
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-500" />
                Demo Mode
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Unlock className="w-4 h-4 mr-2 text-green-600" />
                  <span className="font-semibold text-green-800">Demo Mode Features</span>
                </div>
                <ul className="space-y-1 text-green-700">
                  <li>• Full platform functionality</li>
                  <li>• $15,750 demo balance</li>
                  <li>• Sample investments & transactions</li>
                  <li>• Real-time price simulations</li>
                  <li>• All features unlocked</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Lock className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-semibold text-blue-800">Demo Credentials</span>
                </div>
                <div className="text-blue-700 font-mono text-xs bg-blue-100 p-2 rounded">
                  <div>Email: demo@growfund.com</div>
                  <div>Password: demo123</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Info className="w-4 h-4 mr-2 text-amber-600" />
                  <span className="font-semibold text-amber-800">Important Notes</span>
                </div>
                <ul className="space-y-1 text-amber-700">
                  <li>• Demo data is not real</li>
                  <li>• No actual money involved</li>
                  <li>• Data resets on page refresh</li>
                  <li>• Perfect for testing features</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowInfo(false);
                  if (!isDemoMode) enableDemoMode();
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                {isDemoMode ? 'Continue Demo' : 'Start Demo'}
              </button>
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}