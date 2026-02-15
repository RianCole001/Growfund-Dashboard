import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CryptoCardSkeleton() {
  return (
    <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-20"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-600 rounded w-12"></div>
      </div>
      <div className="h-6 bg-gray-600 rounded w-24 mb-3"></div>
      <div className="flex space-x-2">
        <div className="flex-1 h-9 bg-gray-600 rounded-lg"></div>
        <div className="h-9 w-9 bg-gray-600 rounded-lg"></div>
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg animate-pulse">
          <div className="flex-1">
            <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-24"></div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
