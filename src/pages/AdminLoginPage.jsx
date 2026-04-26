// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminLoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem('scot_admin_auth', 'true');
      toast.success('Admin authenticated successfully');
      onLoginSuccess();
    } else {
      toast.error('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <div className="glass p-8 sm:p-10 w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/15 flex items-center justify-center mb-4 border border-accent-500/30">
            <ShieldCheckIcon className="w-8 h-8 text-accent-400" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">Admin Access</h1>
          <p className="text-sm text-slate-400 mt-1 text-center">Enter administrative credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">USERNAME</label>
            <input
              type="text"
              className="input w-full"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">PASSWORD</label>
            <input
              type="password"
              className="input w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3.5 mt-2">
            Access Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
