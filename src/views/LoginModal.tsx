import React, { useState } from 'react';
import { X, Lock, Mail, Loader2, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  initialRole?: 'student' | 'organizer';
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  initialRole = 'student',
  onLoginSuccess
}) => {
  const { login, switchDemoRole } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide your Email/USN and Password.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
      onClose();
    } else {
      setError(res.error || 'Login failed. Please verify your credentials.');
    }
  };

  const handleQuickDemo = async (role: 'student' | 'organizer' | 'admin') => {
    setLoading(true);
    await switchDemoRole(role);
    setLoading(false);
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            CM
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Sign In to CampusMilan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access collegiate events, AI recommendations & department clubs
          </p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Test Access</span>
            </span>
            <span className="text-[10px] text-slate-400">Pre-seeded profiles</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-semibold text-slate-800 transition-colors flex flex-col items-center"
            >
              <span>Aarav (CSE)</span>
              <span className="text-[10px] text-indigo-600 font-normal">Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('organizer')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-semibold text-slate-800 transition-colors flex flex-col items-center"
            >
              <span>Priya (AI&ML)</span>
              <span className="text-[10px] text-indigo-600 font-normal">Organizer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-[11px] font-semibold text-slate-800 transition-colors flex flex-col items-center"
            >
              <span>Dr. Ramesh</span>
              <span className="text-[10px] text-purple-600 font-normal">Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email or USN (Seat Number)
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="e.g. 1MS23CS012 or aarav@campusmilan.edu"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>New to CampusMilan? </span>
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
