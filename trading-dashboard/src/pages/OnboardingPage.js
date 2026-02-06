import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const finish = () => {
    // Demo: onboarding complete, navigate to app
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-2xl w-full bg-gray-800 p-6 rounded">
        <h2 className="text-xl font-semibold text-blue-400 mb-3">Welcome{auth && auth.user ? `, ${auth.user.name || auth.user.email}` : ''}</h2>
        <p className="text-sm text-gray-300 mb-4">Complete a few quick steps to personalize your dashboard.</p>
        <ul className="text-sm text-gray-300 mb-4 space-y-2">
          <li>• Add profile details</li>
          <li>• Add a funding method</li>
          <li>• Confirm identity (KYC placeholder)</li>
        </ul>
        <div className="flex space-x-2">
          <button onClick={finish} className="bg-blue-600 px-4 py-2 rounded">Finish onboarding</button>
          <button onClick={() => navigate('/app')} className="bg-gray-600 px-4 py-2 rounded">Skip</button>
        </div>
      </div>
    </div>
  );
}