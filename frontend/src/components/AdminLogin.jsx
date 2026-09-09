import { API_BASE_URL } from '../config';
﻿import React, { useState } from 'react';

const AdminLogin = ({ onLoginSuccess }) => {
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
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Security Shield Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg border border-red-500/30">
            🛡️
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/60">
            Restricted Access
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">
            iGOT Admin Gateway
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized administrative personnel only. Autonomous ingestion and course governance controls.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Administrative Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <span>Unlock Admin Gateway →</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          <p className="text-slate-500">Authorized personnel only. Contact system administrator for access.</p>
          <a href="/" className="inline-block mt-3 text-slate-400 hover:text-slate-200 underline font-medium">
            ← Return to Public Learner Portal
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
