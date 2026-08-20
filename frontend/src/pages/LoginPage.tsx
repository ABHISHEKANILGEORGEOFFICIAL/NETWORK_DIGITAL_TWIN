import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, quickSwitchUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@nettwin.io');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await quickSwitchUser(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden px-4">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">NetTwin Platform</h1>
          <p className="text-xs text-slate-400 font-medium">
            Monitor • Simulate • Predict • Manage
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="admin@nettwin.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Digital Twin'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Switcher */}
        <div className="mt-8 pt-6 border-t border-surface-border">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-2 rounded-lg bg-slate-900 border border-surface-border hover:border-cyan-500/50 text-left transition-colors group"
            >
              <p className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400">Admin</p>
              <p className="text-[9px] text-slate-500">Full Control</p>
            </button>
            <button
              onClick={() => handleQuickDemo('engineer')}
              className="p-2 rounded-lg bg-slate-900 border border-surface-border hover:border-cyan-500/50 text-left transition-colors group"
            >
              <p className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400">Engineer</p>
              <p className="text-[9px] text-slate-500">NetOps Sim</p>
            </button>
            <button
              onClick={() => handleQuickDemo('viewer')}
              className="p-2 rounded-lg bg-slate-900 border border-surface-border hover:border-cyan-500/50 text-left transition-colors group"
            >
              <p className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400">Viewer</p>
              <p className="text-[9px] text-slate-500">SOC Read-Only</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
