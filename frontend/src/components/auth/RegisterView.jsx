import React, { useState } from 'react';
import {
  RiUserLine,
  RiMailLine,
  RiLockLine,
  RiAlertLine,
  RiCloseLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine
} from '@remixicon/react';
import { learnerApi } from '../../api';
import { useNavigate } from 'react-router-dom';

const RegisterView = ({ onSuccess, onSwitchToLogin, onGoHome, initialEmail = '' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please create a secure password (at least 6 characters)');
      return;
    }

    setLoading(true);
    try {
      const data = await learnerApi.register({
        name: cleanName,
        email: cleanEmail,
        password: password.trim()
      });

      if (data.success && data.user) {
        onSuccess(data.user);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Could not complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div className="flex-1 flex flex-col lg:flex-row w-full bg-white">

        {/* =========================================================================
            LEFT 50% PANEL: Official Karmayogi Onboarding Visual Banner
           ========================================================================= */}
        <div className="flex flex-col justify-between overflow-hidden w-full lg:w-1/2 bg-gradient-to-br from-[#072C68] via-[#0A387E] to-[#0D47A1] items-center justify-center">
          <img
            src="https://portal.igotkarmayogi.gov.in/assets/instances/eagle/banners/home/9/Sticky%20Notes.png"
            alt="signup banner"
            className="h-full object-cover"
          />
        </div>

        {/* =========================================================================
            RIGHT 50% PANEL: Streamlined Registration Form (Name, Email, Password)
           ========================================================================= */}
        <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">

            {/* Header with Back Arrow */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xl text-slate-700 hover:text-slate-900 cursor-pointer font-bold p-1 rounded-lg hover:bg-slate-100"
                title="Back to Sign In"
              >
                ←
              </button>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Register Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Join iGOT Karmayogi civil service capacity building platform
                </p>
              </div>
            </div>

            {/* Error Callout */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <RiAlertLine size={16} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </span>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 cursor-pointer">
                  <RiCloseLine size={16} />
                </button>
              </div>
            )}

            {/* Streamlined Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* 1. Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <RiUserLine size={17} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Raj Shah"
                    className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* 2. Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <RiMailLine size={17} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. raj.shah@nic.in"
                    className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Official government or personal email address
                </p>
              </div>

              {/* 3. Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <RiLockLine size={17} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Minimum 6 characters"
                    className="w-full h-11 pl-10 pr-10 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                  </button>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="bg-[#FFF9F4] border border-orange-200/80 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <RiCheckLine size={15} className="text-emerald-600 shrink-0" />
                  <span>Permanent access to official capacity courses</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <RiCheckLine size={15} className="text-emerald-600 shrink-0" />
                  <span>Personalized longitudinal growth analytics</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#F37023] hover:bg-[#D95B12] text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <span>Complete Registration</span>
                )}
              </button>
            </form>

            {/* Switch to Login Link */}
            <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-bold text-[#0073BC] hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterView;
