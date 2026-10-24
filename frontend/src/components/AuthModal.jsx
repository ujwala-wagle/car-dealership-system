import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, User, Mail, Lock, Car } from 'lucide-react';

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
          setError(res.message || 'Login failed');
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
          setError(res.message || 'Registration failed');
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
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-8 shadow-2xl border border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg"
          aria-label="Close Modal"
        >
          ✕
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Sign In to Showroom' : 'Create an Account'}
            </h2>
            <p className="text-sm text-slate-400">
              {isLogin
                ? 'Access your inventory and manage purchases'
                : 'Join our premium car dealership platform'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Account Type / Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`py-2 px-3 text-sm rounded-xl font-medium border transition-all ${
                    formData.role === 'user'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400'
                  }`}
                >
                  Customer (User)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`py-2 px-3 text-sm rounded-xl font-medium border transition-all ${
                    formData.role === 'admin'
                      ? 'bg-amber-600/30 border-amber-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400'
                  }`}
                >
                  Dealership Admin
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 mt-4"
          >
            {loading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2">Quick Demo Accounts:</p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleFillDemo('admin')}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              Demo Admin
            </button>
            <button
              onClick={() => handleFillDemo('user')}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              Demo Customer
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up now"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
