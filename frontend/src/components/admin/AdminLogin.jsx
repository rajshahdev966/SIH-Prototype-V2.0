import React, { useState } from 'react';
import { RiAlertLine, RiCloseLine } from '@remixicon/react';
import { API_BASE_URL } from '../../config';
import igotLogo from '../../assets/igotLogo.svg';

const AdminLogin = ({ onLoginSuccess, onGoHome }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter administrative username and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Authentication failed');

      sessionStorage.setItem('sih_admin_token', data.token);
      sessionStorage.setItem('sih_admin_user', JSON.stringify(data.admin));
      onLoginSuccess(data.token, data.admin);
    } catch (err) {
      setError(err.message || 'Administrative login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Karmayogi Bharat Official Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img
              src={igotLogo}
              alt="iGOT Karmayogi Bharat"
              className="h-14 sm:h-16 w-auto max-w-[270px] object-contain cursor-pointer"
              onClick={onGoHome}
            />
          </div>

          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#0B5C9E] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Administrative Management Gateway
          </span>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            iGOT Admin Portal
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized administrative personnel only. Autonomous ingestion and course governance controls.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <RiAlertLine size={16} />
              <span>{error}</span>
            </span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 cursor-pointer">
              <RiCloseLine size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none transition-all font-mono"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0B5C9E] hover:bg-[#0A387E] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Access Admin Hub →'}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Protected by SHA-256 Session Tokens</span>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="text-[#0B5C9E] hover:underline font-semibold cursor-pointer"
            >
              ← Public Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
