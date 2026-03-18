import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { binaryOptionsAPI } from '../services/api';

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | approved | declined | pending | error
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order-id');
    const token = params.get('token');

    if (!orderId || !token) {
      setStatus('error');
      return;
    }

    binaryOptionsAPI.expressPayCallback({ 'order-id': orderId, token })
      .then(res => {
        const { status: s, transaction: tx } = res.data;
        setStatus(s || 'error');
        setTransaction(tx || null);
      })
      .catch(() => setStatus('error'));
  }, []);

  const icon = { approved: '✅', declined: '❌', pending: '⏳', error: '⚠️', loading: null }[status];
  const color = { approved: 'text-green-400', declined: 'text-red-400', pending: 'text-yellow-400', error: 'text-red-400' }[status] || 'text-white';
  const msg = {
    approved: 'Payment approved! Your deposit is being processed.',
    declined: 'Payment was declined. Please try again.',
    pending: 'Payment is pending. We will notify you once confirmed.',
    error: 'Something went wrong. Please contact support.',
  }[status];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {status === 'loading' ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4" />
            <p className="text-gray-300">Verifying your payment…</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">{icon}</div>
            <h2 className={`text-2xl font-bold mb-2 ${color}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </h2>
            <p className="text-gray-300 mb-4">{msg}</p>
            {transaction && (
              <div className="bg-gray-700 rounded-xl p-4 text-left text-sm text-gray-300 mb-4 space-y-1">
                {transaction.reference && <div>Reference: <span className="text-white font-mono">{transaction.reference}</span></div>}
                {transaction.amount && <div>Amount: <span className="text-white font-bold">{transaction.amount}</span></div>}
              </div>
            )}
            <button
              onClick={() => navigate('/app')}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
