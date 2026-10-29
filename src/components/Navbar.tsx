import React, { useState, useEffect } from 'react';
import {
  Bell,
  LogOut,
  Sparkles,
  ChevronDown,
  Layers,
  CalendarDays,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Notification } from '../types.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogin: (role?: 'student' | 'organizer') => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenLogin,
  onOpenRegister
}) => {
  const { user, token, logout, switchDemoRole } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  // Poll or load notifications for student
  useEffect(() => {
    if (!token || !user || user.role !== 'student') {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifs = () => {
      fetch('/api/student/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(err => console.error('Failed to load notifications:', err));
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [token, user]);

  const handleMarkNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/student/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* College Notice Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-3">
        <span className="font-semibold text-white tracking-wide">
          Apex Institute of Technology & Engineering
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300">Central Collegiate Event Portal & Management System</span>
        <div className="hidden sm:inline-flex items-center gap-1.5 ml-2">
          <span className="text-amber-400 font-bold">Demo Switcher:</span>
          <button
            onClick={() => switchDemoRole('student')}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded transition-colors"
          >
            Aarav (Student)
          </button>
          <button
            onClick={() => switchDemoRole('organizer')}
            className="text-[10px] bg-indigo-950 hover:bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded transition-colors"
          >
            Priya (Organizer)
          </button>
          <button
            onClick={() => switchDemoRole('admin')}
            className="text-[10px] bg-purple-950 hover:bg-purple-900 text-purple-200 px-2 py-0.5 rounded transition-colors"
          >
            Admin (Dean)
          </button>
        </div>
      </div>

      {/* Main Top Bar: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            CM
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
              Campus<span className="text-indigo-600">Milan</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
              Event Discovery & AI Hub
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('events')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-indigo-600 ${
              currentTab === 'events' ? 'text-indigo-600 font-bold' : ''
            }`}
          >
            All Events
          </button>

          <button
            onClick={() => onSelectTab('recommendations')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-indigo-600 flex items-center gap-1 ${
              currentTab === 'recommendations' ? 'text-indigo-600 font-bold' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Recommended</span>
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-indigo-600 flex items-center gap-1 ${
              currentTab === 'calendar' ? 'text-indigo-600 font-bold' : ''
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>My Calendar</span>
          </button>

          <button
            onClick={() => onSelectTab('gallery')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-indigo-600 ${
              currentTab === 'gallery' ? 'text-indigo-600 font-bold' : ''
            }`}
          >
            Past Gallery
          </button>

          {user?.role === 'organizer' && (
            <button
              onClick={() => onSelectTab('organizer')}
              className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 text-indigo-700 font-bold ${
                currentTab === 'organizer' ? 'underline underline-offset-4' : ''
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Organizer Console</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 text-purple-700 font-bold ${
                currentTab === 'admin' ? 'underline underline-offset-4' : ''
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell (for students) */}
          {user && user.role === 'student' && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown && unreadCount > 0) {
                    handleMarkNotificationsRead();
                  }
                }}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 px-4 z-50 text-xs animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="font-bold text-slate-900">Interest Notifications</span>
                    <button
                      onClick={handleMarkNotificationsRead}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-slate-400">
                      No notifications yet. You'll be notified when new events match your interests!
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.map(n => (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-lg border text-left ${
                            n.read
                              ? 'bg-white border-slate-100 text-slate-600'
                              : 'bg-indigo-50/60 border-indigo-100 text-indigo-950 font-medium'
                          }`}
                        >
                          <p className="text-xs leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block tabular-nums">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Logged In Profile OR Login CTA */}
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[140px]">
                  {user.name}
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  {user.role} {user.usn ? `· ${user.usn}` : ''}
                </span>
              </div>

              {/* Role Badge Button */}
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span className="capitalize">{user.role}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showDemoMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Active Role
                    </div>
                    <button
                      onClick={() => {
                        switchDemoRole('student');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">Aarav Patel</span>
                        <span className="text-[10px] text-slate-500">Student (CSE, 3rd Year)</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold">Student</span>
                    </button>

                    <button
                      onClick={() => {
                        switchDemoRole('organizer');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">Priya Sharma</span>
                        <span className="text-[10px] text-slate-500">AI&ML Dept President</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold">Organizer</span>
                    </button>

                    <button
                      onClick={() => {
                        switchDemoRole('admin');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">Dr. Ramesh Sharma</span>
                        <span className="text-[10px] text-slate-500">Dean / College Admin</span>
                      </div>
                      <span className="text-[10px] text-purple-600 font-bold">Admin</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        logout();
                        setShowDemoMenu(false);
                        onSelectTab('landing');
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  logout();
                  onSelectTab('landing');
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLogin('student')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Student Login
              </button>
              <button
                onClick={() => onOpenLogin('organizer')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
              >
                Organizer Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
