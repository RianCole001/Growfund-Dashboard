import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto text-center p-8">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-400 mb-4">
          Welcome to GrowFund
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Build wealth with smart investing — crypto, capital plans, and real estate.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            to="/register" 
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-semibold mb-2">Crypto Trading</h3>
            <p className="text-gray-400 text-sm">Trade EXA coin and grow your digital assets</p>
          </div>
          
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-xl font-semibold mb-2">Capital Plans</h3>
            <p className="text-gray-400 text-sm">Invest in structured plans with guaranteed returns</p>
          </div>
          
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="text-xl font-semibold mb-2">Real Estate</h3>
            <p className="text-gray-400 text-sm">Diversify with real estate investment opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
}