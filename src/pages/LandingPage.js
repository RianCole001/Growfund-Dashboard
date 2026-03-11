import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-3xl mx-auto text-center p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <TrendingUp className="w-16 h-16 text-green-600 mr-3" />
          <h1 className="text-6xl md:text-7xl font-bold text-green-600">
            GrowFund
          </h1>
        </div>
        
        {/* Welcome Message */}
        <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
          Welcome to Your Financial Future
        </p>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Start building wealth today with smart investing and secure portfolio management.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/register" 
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Sign In
          </Link>
        </div>
        
        {/* Subtle Footer Text */}
        <p className="mt-16 text-sm text-gray-500">
          Join thousands of investors growing their wealth with GrowFund
        </p>
      </div>
    </div>
  );
}