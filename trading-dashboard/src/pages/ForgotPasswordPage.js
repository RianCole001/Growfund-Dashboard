import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const { forgotPassword } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword(email);
      setMsg(`Recovery token generated (demo): ${res.token}`);
    } catch (err) {
      setMsg(err.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded">
        <h2 className="text-lg text-blue-400 mb-2">Forgot password</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full bg-gray-700 p-2 rounded" />
          </div>
          <div><button className="bg-blue-600 px-3 py-2 rounded">Generate recovery token</button></div>
        </form>
        {msg && <div className="mt-3 text-xs text-gray-300">{msg}</div>}
      </div>
    </div>
  );
}