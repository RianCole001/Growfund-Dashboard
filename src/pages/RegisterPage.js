import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAuthAPI } from '../services/api';
import { settingsService } from '../services/settingsAPI';
import { Gift } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralBonus, setReferralBonus] = useState(null);
  const [referralBonusAmount, setReferralBonusAmount] = useState(50); // Default fallback
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get referral code from URL and fetch referral bonus amount
  useEffect(() => {
    // Fetch referral bonus amount from platform settings
    const fetchReferralBonus = async () => {
      try {
        const response = await settingsService.getPublicSettings();
        if (response.success) {
          const bonusAmount = parseFloat(response.data.referralBonus) || 50;
          setReferralBonusAmount(bonusAmount);
        }
      } catch (error) {
        console.error('Error fetching referral bonus:', error);
        // Keep default fallback value
      }
    };

    fetchReferralBonus();

    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      // Set referral bonus info (will be updated with actual amount once fetched)
      setReferralBonus({
        code: ref,
        bonus: referralBonusAmount,
        message: `You will receive $${referralBonusAmount} bonus when you complete registration!`
      });
    }
  }, [searchParams, referralBonusAmount]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (firstName.trim().length > 50) {
      newErrors.firstName = 'First name must not exceed 50 characters';
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must not exceed 50 characters';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (password.length > 128) {
      newErrors.password = 'Password must not exceed 128 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
    }

    // Confirm password validation
    if (!password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (password !== password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await userAuthAPI.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password2,
        referral_code: referralCode || undefined,
      });

      if (referralCode) {
        toast.success(`Registration successful! You earned $${referralBonusAmount} referral bonus! Please login.`);
      } else {
        toast.success('Registration successful! Please login with your credentials.');
      }
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      const errorData = err.response?.data || {};
      
      // Handle field-specific errors from backend
      if (typeof errorData === 'object') {
        // Check if errors are nested in an 'errors' object
        const errors = errorData.errors || errorData;
        
        const backendErrors = {};
        if (errors.first_name) backendErrors.firstName = errors.first_name[0];
        if (errors.last_name) backendErrors.lastName = errors.last_name[0];
        if (errors.email) backendErrors.email = errors.email[0];
        if (errors.password) backendErrors.password = errors.password[0];
        if (errors.password2) backendErrors.password2 = errors.password2[0];
        if (errors.referral_code) backendErrors.referralCode = errors.referral_code[0];
        
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
          const firstError = Object.values(backendErrors)[0];
          toast.error(firstError);
        } else {
          const errorMsg = errorData.error || errorData.detail || errorData.message || 'Registration failed';
          toast.error(errorMsg);
        }
      } else {
        toast.error(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: 'bg-gray-400' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) strength++;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500'];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength] || 'Very Weak',
      color: colors[strength] || 'bg-red-500'
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-600 mb-2">Create Account</h2>
          <p className="text-gray-600">Join GrowFund today</p>
        </div>
        
        {/* Referral Bonus Banner */}
        {referralBonus && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <Gift className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-700">Referral Bonus!</p>
              <p className="text-xs text-green-600">{referralBonus.message}</p>
              <p className="text-xs text-green-600 mt-1">Referrer: <span className="font-mono font-semibold">{referralBonus.code}</span></p>
            </div>
          </div>
        )}
        
        <form onSubmit={submit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">First Name</label>
            <input 
              type="text"
              value={firstName} 
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors({ ...errors, firstName: '' });
              }}
              className={`w-full bg-white border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition text-gray-800`}
              placeholder="John"
              required
            />
            {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Last Name</label>
            <input 
              type="text"
              value={lastName} 
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors({ ...errors, lastName: '' });
              }}
              className={`w-full bg-white border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition text-gray-800`}
              placeholder="Doe"
              required
            />
            {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
            <input 
              type="email"
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition text-gray-800`}
              placeholder="john@example.com"
              required
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
            <input 
              type="password"
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition text-gray-800`}
              placeholder="••••••••"
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Strength:</span>
                  <span className={`text-xs font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
              </div>
            )}
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            <p className="text-xs text-gray-500 mt-2">
              Must contain: uppercase, lowercase, number, special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Confirm Password</label>
            <input 
              type="password"
              value={password2} 
              onChange={(e) => {
                setPassword2(e.target.value);
                if (errors.password2) setErrors({ ...errors, password2: '' });
              }}
              className={`w-full bg-white border ${errors.password2 ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition text-gray-800`}
              placeholder="••••••••"
              required
            />
            {errors.password2 && <p className="text-red-600 text-xs mt-1">{errors.password2}</p>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold transition-colors mt-6 shadow-md"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
