import React, { useState } from 'react';
import { RiAlertLine, RiCloseLine } from '@remixicon/react';
import { learnerApi } from '../../api';

const RegisterView = ({ onSuccess, onSwitchToLogin, onGoHome }) => {
  const [jurisdiction, setJurisdiction] = useState('Center'); // 'Center' | 'State'
  const [ministry, setMinistry] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const ministries = [
    'Ministry of Personnel, Public Grievances and Pensions',
    'Ministry of Finance',
    'Ministry of Home Affairs',
    'Ministry of Housing and Urban Affairs',
    'Ministry of Electronics and Information Technology (MeitY)',
    'Ministry of Education',
    'Ministry of Railways'
  ];

  const designations = [
    'Joint Secretary',
    'Director / Deputy Secretary',
    'Under Secretary',
    'Section Officer',
    'Assistant Section Officer (ASO)',
    'Senior Technical Officer',
    'Executive Engineer'
  ];

  const handleSendOtp = () => {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid official government email (e.g. officer@nic.in or @gov.in)');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpCode('789012'); // Simulation for testing convenience
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!ministry) {
      setError('Please select your Ministry or Department');
      return;
    }
    if (!designation) {
      setError('Please select your Designation');
      return;
    }
    if (!email) {
      setError('Please enter your government email address');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.trim() || ('+91-' + Math.floor(1000000000 + Math.random() * 9000000000));
      const cleanName = name.trim() || (email.split('@')[0].toUpperCase() + ` (${designation})`);

      const data = await learnerApi.login(
        cleanPhone,
        cleanName,
        email.trim().toLowerCase()
      );

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
      <div className="flex-1 flex flex-col lg:flex-row w-full bg-white ">
        
        {/* =========================================================================
            LEFT 50% PANEL: 4-Node Interactive Radial Infographic (signup.png)
           ========================================================================= */}
        <div className="flex flex-col justify-between overflow-hidden w-screen lg:w-1/2">
          <img src="https://portal.igotkarmayogi.gov.in/assets/instances/eagle/banners/home/9/Sticky%20Notes.png" alt="signup banner" className="h-full w-full"></img>
        </div>

        {/* =========================================================================
            RIGHT 50% PANEL: Multi-Step Registration Form (signup.png)
           ========================================================================= */}
        <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white ">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header with Back Arrow */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSwitchToLogin}
                className="text-xl text-slate-700 hover:text-slate-900 cursor-pointer font-bold"
                title="Back to Login"
              >
                ←
              </button>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Register
              </h2>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center justify-between py-2">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-[#F37023] text-white font-black text-sm flex items-center justify-center mx-auto shadow-xs">
                  1
                </div>
                <span className="text-[11px] font-bold text-[#0B5C9E] mt-1 block">Step - 1</span>
              </div>

              <div className="flex-1 h-1 bg-[#0B5C9E] mx-4 rounded-full" />

              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center mx-auto">
                  2
                </div>
                <span className="text-[11px] font-medium text-slate-400 mt-1 block">Step - 2</span>
              </div>
            </div>

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

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Center / State Toggle Pill Group */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Center/State <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setJurisdiction('Center')}
                    className={`border rounded-lg p-2.5 flex items-center gap-3 cursor-pointer transition-all ${
                      jurisdiction === 'Center'
                        ? 'border-[#0B5C9E] bg-blue-50/50 text-[#0B5C9E] font-bold'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jurisdiction"
                      checked={jurisdiction === 'Center'}
                      onChange={() => setJurisdiction('Center')}
                      className="w-4 h-4 text-[#0B5C9E]"
                    />
                    <span className="text-sm">Center</span>
                  </label>

                  <label
                    onClick={() => setJurisdiction('State')}
                    className={`border rounded-lg p-2.5 flex items-center gap-3 cursor-pointer transition-all ${
                      jurisdiction === 'State'
                        ? 'border-[#0B5C9E] bg-blue-50/50 text-[#0B5C9E] font-bold'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jurisdiction"
                      checked={jurisdiction === 'State'}
                      onChange={() => setJurisdiction('State')}
                      className="w-4 h-4 text-[#0B5C9E]"
                    />
                    <span className="text-sm">State</span>
                  </label>
                </div>
              </div>

              {/* Ministry / Department Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ministry/Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select ministry</option>
                  {ministries.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Organisation Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Organisation <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-[#0073BC] hover:underline cursor-pointer">
                    Request for help
                  </span>
                </div>
                <input
                  type="text"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. Karmayogi Bharat SPV / Attached Office"
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none"
                />
              </div>

              {/* Designation Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select designation</option>
                  {designations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Dashed Border Container for Gov Email & OTP */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Government Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your government email address"
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Not able to proceed? <strong className="text-[#0B5C9E] cursor-pointer">Click here</strong> to view Nodal Officers.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2 bg-[#0B5C9E] hover:bg-[#0A387E] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>

                {otpSent && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Next Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-11 bg-[#0073BC] hover:bg-[#0B5C9E] text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? 'Completing Registration...' : 'Next'}
                </button>
              </div>
            </form>

            {/* Bottom Sign In Link */}
            <div className="text-center pt-2 text-xs text-slate-600">
              <span>Already have an account? </span>
              <button
                onClick={onSwitchToLogin}
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
