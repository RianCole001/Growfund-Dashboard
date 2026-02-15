import React from 'react';

export default function QuickInvestButton({ onClick }) {
  return (
    <button onClick={onClick} className="fixed z-50 right-4 bottom-6 bg-blue-600 text-white p-4 rounded-full shadow-lg md:hidden">
      Invest
    </button>
  );
}
