import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await verifyEmail(token);
        if (!mounted) return;
        setStatus('ok');
        setTimeout(() => navigate('/login'), 1500);
      } catch (e) {
        setStatus('error');
      }
    };
    if (token) run();
    return () => { mounted = false; };
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded text-center">
        {status === 'verifying' && <div>Verifying your email...</div>}
        {status === 'ok' && <div className="text-green-400">Email verified! Redirecting to login...</div>}
        {status === 'error' && <div className="text-red-400">Invalid or expired token.</div>}
      </div>
    </div>
  );
}