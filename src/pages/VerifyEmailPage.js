import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAuthAPI } from '../services/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || localStorage.getItem('verification_token');
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await userAuthAPI.verifyEmail(token);
        if (!mounted) return;
        setStatus('ok');
        localStorage.removeItem('verification_token');
        toast.success('Email verified! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } catch (err) {
        if (!mounted) return;
        setStatus('error');
        toast.error('Invalid or expired token');
      }
    };

    run();
    return () => { mounted = false; };
  }, [token, navigate]);

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