import React, { useState } from 'react';
import { X, UserPlus, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

const INTEREST_OPTIONS = [
  'AI/ML',
  'Web Dev',
  'Cybersecurity',
  'Robotics',
  'Cloud Computing',
  'Cultural',
  'Music & Dance',
  'Sports & Athletics',
  'Hackathons',
  'Workshops',
  'Seminars',
  'VLSI & Hardware'
];

const DEPARTMENT_OPTIONS = [
  'Artificial Intelligence & Machine Learning',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Information Science & Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Cultural & Arts Council',
  'Sports & Athletics Board'
];

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess
}) => {
  const { register } = useAuth();
  const [role, setRole] = useState<'student' | 'organizer'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [usn, setUsn] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(DEPARTMENT_OPTIONS[0]);
  const [year, setYear] = useState<number>(1);
  const [interests, setInterests] = useState<string[]>(['AI/ML', 'Hackathons']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleInterest = (item: string) => {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !usn || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (interests.length === 0) {
      setError('Please pick at least one topic of interest for AI event matching.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await register({
      name,
      email,
      usn,
      password,
      department,
      year,
      interests,
      role
    });
    setLoading(false);

    if (res.success) {
      onRegisterSuccess();
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2 font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Create CampusMilan Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the centralized event discovery platform of Apex Institute
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              role === 'student'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Account
          </button>
          <button
            type="button"
            onClick={() => setRole('organizer')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              role === 'organizer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Organizer (Dept President)
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aarav Patel"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                USN (Seat Number) *
              </label>
              <input
                type="text"
                value={usn}
                onChange={e => setUsn(e.target.value)}
                placeholder="e.g. 1MS23CS012"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. aarav@campusmilan.edu"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {DEPARTMENT_OPTIONS.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Year of Study
              </label>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          {/* Multi-select Interests for AI Recommendation Engine */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Interests & Skill Topics (AI Match Engine) *
              </label>
              <span className="text-[10px] text-slate-400">
                {interests.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl max-h-36 overflow-y-auto">
              {INTEREST_OPTIONS.map(item => {
                const checked = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`text-left px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors flex items-center justify-between border ${
                      checked
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    {checked && <Check className="w-3 h-3 shrink-0 ml-1 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>Already registered? </span>
          <button
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
