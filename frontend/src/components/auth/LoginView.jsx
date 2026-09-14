import React, { useState } from 'react';
import {
  RiLockLine,
  RiCursorLine,
  RiShieldKeyholeLine,
  RiAlertLine,
  RiCloseLine
} from '@remixicon/react';
import { learnerApi } from '../../api';

const LoginView = ({ onSuccess, onSwitchToRegister, onGoHome, intendedNotice }) => {
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [passwordOrOtp, setPasswordOrOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailOrPhone.trim()) {
      setError('Please enter your government email or registered mobile number');
      return;
    }

    if (loginMode === 'password' && !passwordOrOtp) {
      setError('Please enter your account password');
      return;
    }

    setLoading(true);
    try {
      // Authenticate with backend learner endpoint
      // Supports phone number as primary ID, plus name/email
      const cleanInput = emailOrPhone.trim();
      const isEmail = cleanInput.includes('@');
      const phoneParam = isEmail ? ('+91-' + Math.abs(cleanInput.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString().slice(0, 10)) : cleanInput;

      const data = await learnerApi.login(
        phoneParam,
        isEmail ? cleanInput.split('@')[0].toUpperCase() : 'Officer ' + cleanInput.slice(-4),
        isEmail ? cleanInput : (cleanInput + '@gov.in')
      );

      if (data.success && data.user) {
        onSuccess(data.user);
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans ">
      {/* Top Banner Notice if redirected by Auth Gate */}
      {intendedNotice && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-1.5">
          <RiLockLine size={16} />
          <span>{intendedNotice}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row w-full bg-white">
        
        {/* =========================================================================
            LEFT 50% PANEL: Official Infographic Guide (Matching login.png)
           ========================================================================= */}
        <div className="lg:w-1/2 bg-gradient-to-br from-[#072C68] via-[#0A387E] to-[#0D47A1] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Circuit / Hexagonal Watermark Overlay */}
         <img src="https://portal.igotkarmayogi.gov.in/auth/resources/h8uo2/login/sunbird/img/How_to_Login_V2.png" alt="login process" className='h-full object-cover'/>


        </div>

        {/* =========================================================================
            RIGHT 50% PANEL: Clean Authentication Form Card (Matching login.png)
           ========================================================================= */}
        <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          {/* Help Button in Top Right */}
          <div className="absolute top-6 right-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer" title="Support & Help">
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
            </div>

            {/* Error Message Callout */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <RiAlertLine size={16} />
                  <span>{error}</span>
                </span>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 cursor-pointer">
                  <RiCloseLine size={16} />
                </button>
              </div>
            )}

            {/* Login Type Radio Pill Selector */}
            <div className="flex items-center justify-center gap-8 py-2 text-sm font-semibold text-slate-700 border-b border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="loginMode"
                  checked={loginMode === 'password'}
                  onChange={() => setLoginMode('password')}
                  className="w-4 h-4 text-[#0B5C9E] focus:ring-[#0B5C9E]"
                />
                <span>Login with password</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="loginMode"
                  checked={loginMode === 'otp'}
                  onChange={() => setLoginMode('otp')}
                  className="w-4 h-4 text-[#0B5C9E] focus:ring-[#0B5C9E]"
                />
                <span>Login with OTP</span>
              </label>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email / Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. officer@gov.in or 9876543210"
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    {loginMode === 'password' ? 'Password' : 'Enter OTP'} <span className="text-red-500">*</span>
                  </label>
                  {loginMode === 'password' && (
                    <span className="text-xs font-semibold text-[#0073BC] hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  )}
                </div>

                <input
                  type={loginMode === 'password' ? 'password' : 'text'}
                  value={passwordOrOtp}
                  onChange={(e) => setPasswordOrOtp(e.target.value)}
                  placeholder={loginMode === 'password' ? '••••••••••••' : 'Enter 6-digit OTP'}
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {loginMode === 'otp' && !otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    if (emailOrPhone) {
                      setOtpSent(true);
                      setPasswordOrOtp('123456');
                    }
                  }}
                  className="text-xs font-bold text-[#0B5C9E] hover:underline block"
                >
                  Generate & Send OTP to {emailOrPhone || 'device'} →
                </button>
              )}

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
                className="w-full h-11 bg-[#0073BC] hover:bg-[#0B5C9E] text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 absolute">or</span>
            </div>

            {/* Login with Providers */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Login with Providers
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setEmailOrPhone('civilservant@nic.in');
                    setPasswordOrOtp('gov@2026');
                  }}
                  className="w-full h-11 bg-[#0073BC] hover:bg-[#0B5C9E] text-white font-medium text-sm px-4 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span>Select Provider (Parichay / Jan Parichay)</span>
                  <span>▾</span>
                </button>
              </div>
            </div>

            {/* Bottom Link to Register */}
            <div className="text-center pt-2 text-xs text-slate-600">
              <span>Don't have an account yet? </span>
              <button
                onClick={onSwitchToRegister}
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
