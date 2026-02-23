import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function SettingsDebug() {
  const { settings, loading } = useSettings();

  if (loading) {
    return <div className="text-white">Loading settings...</div>;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-4">Current Settings Debug</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold text-green-400">Capital Plan Minimums:</h4>
          <p>Basic: ${settings.capitalBasicMin}</p>
          <p>Standard: ${settings.capitalStandardMin}</p>
          <p>Advance: ${settings.capitalAdvanceMin}</p>
        </div>
        <div>
          <h4 className="font-semibold text-amber-400">Real Estate Minimums:</h4>
          <p>Starter: ${settings.realEstateStarterMin}</p>
          <p>Premium: ${settings.realEstatePremiumMin}</p>
          <p>Luxury: ${settings.realEstateLuxuryMin}</p>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-400">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}