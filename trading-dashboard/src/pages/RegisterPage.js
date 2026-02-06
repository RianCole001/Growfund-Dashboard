import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) return setError('All fields required');
    try {
      const res = await register({ name, email, password });
      // in demo we show verification token and redirect to verify
      if (res && res.verificationToken) {
        navigate(`/verify?token=${res.verificationToken}`);
      } else {
        // fallback: go to onboarding
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded">
        <h2 className="text-xl font-semibold text-blue-400 mb-4">Create an account</h2>
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-300">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-gray-700 p-2 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full bg-gray-700 p-2 rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full bg-gray-700 p-2 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Register</button>
            <Link to="/login" className="text-sm text-gray-300">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}