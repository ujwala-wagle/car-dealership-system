import React, { useState } from 'react';
import { api } from '../services/api';
import { Shield, User, Mail, Lock, Car, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({
          email: formData.email,
          password: formData.password,
        });

        if (!res.success) {
          setError(res.message || 'Authentication failed. Please verify credentials.');
          setLoading(false);
          return;
        }

        onAuthSuccess(res.token, res.user);
        onClose();
      } else {
        const res = await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        if (!res.success) {
          setError(res.message || 'Registration failed. Email may already be in use.');
          setLoading(false);
          return;
        }

        // Auto login after register
        const loginRes = await api.login({
          email: formData.email,
          password: formData.password,
        });

        onAuthSuccess(loginRes.token, loginRes.user);
        onClose();
      }
    } catch (err) {
      setError('Unable to connect to dealership auth service. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    setError('');
    if (type === 'admin') {
      setIsLogin(true);
      setFormData({
        username: '',
        email: 'admin@dealership.com',
        password: 'AdminPassword123!',
        role: 'admin',
      });
    } else {
      setIsLogin(true);
      setFormData({
        username: '',
        email: 'customer@dealership.com',
        password: 'UserPassword123!',
        role: 'user',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0D121B] border border-[#1E2736] p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 font-display">
                AutoVanguard Portal
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-display tracking-tight">
              {isLogin ? 'Dealership & Client Access' : 'Create Client Profile'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#161D2B] transition-colors"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Quick Demo Access Switcher */}
        <div className="mb-5 p-3 rounded-xl bg-[#080B10] border border-[#1A2333]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Fast Evaluation Profiles</span>
            <span className="text-emerald-400 text-[9px] font-mono">1-CLICK FILL</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-2 px-3 rounded-lg bg-[#111723] hover:bg-[#182132] border border-amber-900/30 hover:border-amber-600/50 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-xs">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                admin@dealership.com
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="py-2 px-3 rounded-lg bg-[#111723] hover:bg-[#182132] border border-slate-700/40 hover:border-slate-500 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-slate-200 font-bold text-xs">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Private Buyer</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                customer@dealership.com
              </div>
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#1E2736] mb-5">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
              isLogin ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Sign In
            {isLogin && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
              !isLogin ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Register Account
            {!isLogin && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Full Name / Handle
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Vance"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@dealership.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Account Privilege Tier
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="user">Private Customer (Browse, Search, Purchase)</option>
                <option value="admin">Dealership Staff / Admin (Full Inventory Management)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span>{isLogin ? 'Enter Showroom' : 'Complete Registration'}</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#1E2736] text-center text-[10px] text-slate-500">
          AutoVanguard Motor Group Enterprise Security Protocol
        </div>
      </div>
    </div>
  );
}
