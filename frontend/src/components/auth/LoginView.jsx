import React, { useState } from 'react';
import {
  RiLockLine,
  RiMailLine,
  RiAlertLine,
  RiCloseLine,
  RiUserAddLine,
  RiEyeLine,
  RiEyeOffLine
} from '@remixicon/react';
import { learnerApi } from '../../api';

const LoginView = ({ onSuccess, onSwitchToRegister, onGoHome, intendedNotice, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsNotFound(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address (e.g. officer@nic.in or officer@gmail.com)');
      return;
    }

    if (!password) {
      setError('Please enter your account password');
      return;
    }

    setLoading(true);
    try {
      const data = await learnerApi.login(cleanEmail, password);

      if (data.success && data.user) {
        onSuccess(data.user);
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (err) {
      const msg = err.message || '';
      const notFound = msg.toLowerCase().includes('not exist') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('register first');
      
      setIsNotFound(notFound);
      if (notFound) {
        setError('This account does not exist in our database. Please register to create an account.');
      } else {
        setError(msg || 'Login failed. Please verify your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Top Banner Notice if redirected by Auth Gate */}
      {intendedNotice && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-1.5">
          <RiLockLine size={16} />
          <span>{intendedNotice}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row w-full bg-white">
        
        {/* =========================================================================
            LEFT 50% PANEL: Official Infographic Banner
           ========================================================================= */}
        <div className="lg:w-1/2 bg-gradient-to-br from-[#072C68] via-[#0A387E] to-[#0D47A1] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <img
            src="https://portal.igotkarmayogi.gov.in/auth/resources/h8uo2/login/sunbird/img/How_to_Login_V2.png"
            alt="login process"
            className="h-full object-cover"
          />
        </div>

        {/* =========================================================================
            RIGHT 50% PANEL: Strict Email & Password Authentication Form Card
           ========================================================================= */}
        <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          {/* Help Button in Top Right */}
          <div className="absolute top-6 right-6">
            <span
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
              title="Support & Help"
            >
              ?
            </span>
          </div>

          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Karmayogi Bharat Emblem */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-[#F37023] font-hindi">कर्मयोगी</span>
                <span className="text-2xl font-black text-[#0B5C9E] font-hindi">भारत</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 font-hindi">
                — लोकहितं मम करणीयम् —
              </p>
              <h1 className="text-lg font-bold text-slate-800 pt-2">
                Civil Servant Sign In
              </h1>
              <p className="text-xs text-slate-500">
                Enter your registered official email and password to proceed
              </p>
            </div>

            {/* Error Message Callout */}
            {error && (
              <div className={`p-4 rounded-xl text-xs font-semibold border ${
                isNotFound
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <RiAlertLine size={18} className={`shrink-0 mt-0.5 ${isNotFound ? 'text-amber-600' : 'text-red-500'}`} />
                    <div>
                      <p className="font-bold text-sm leading-tight">{isNotFound ? 'Account Not Found' : 'Authentication Error'}</p>
                      <p className="mt-1 text-xs opacity-90">{error}</p>
                    </div>
                  </div>
                  <button onClick={() => { setError(''); setIsNotFound(false); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <RiCloseLine size={16} />
                  </button>
                </div>

                {/* Direct Action prompt to Register when account does not exist */}
                {isNotFound && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800">New to iGOT Karmayogi?</span>
                    <button
                      type="button"
                      onClick={() => onSwitchToRegister(email)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F37023] hover:bg-[#D95B12] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      <RiUserAddLine size={14} />
                      <span>Register Account Now →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Main Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Registered Email Address <span className="text-red-500">*</span>
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
                      if (error) { setError(''); setIsNotFound(false); }
                    }}
                    placeholder="e.g. raj.shah@nic.in"
                    className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <RiLockLine size={17} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) { setError(''); setIsNotFound(false); }
                    }}
                    placeholder="Enter your account password"
                    className="w-full h-11 pl-10 pr-10 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
                    required
                    autoComplete="current-password"
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

              {/* Simulated reCAPTCHA Container */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captchaVerified}
                    onChange={(e) => setCaptchaVerified(e.target.checked)}
                    className="w-5 h-5 text-[#0B5C9E] rounded border-slate-300 focus:ring-[#0B5C9E]"
                  />
                  <span className="text-xs font-medium text-slate-700">I'm not a robot</span>
                </label>
                <div className="text-right text-[10px] text-slate-400">
                  <span className="block font-bold">reCAPTCHA</span>
                  <span>Privacy - Terms</span>
                </div>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0073BC] hover:bg-[#0B5C9E] text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Bottom Link to Register */}
            <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
              <span>Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => onSwitchToRegister(email)}
                className="font-bold text-[#0073BC] hover:underline cursor-pointer"
              >
                Register here
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginView;
