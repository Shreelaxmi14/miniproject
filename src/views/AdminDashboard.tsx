import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Calendar,
  Star,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import { AnalyticsCharts } from '../components/AnalyticsCharts.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { User, CollegeEvent, Feedback } from '../types.ts';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'events' | 'feedback'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // User management search & filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchAdminData = () => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/events', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/feedback', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([analyticsData, usersData, eventsData, feedbackData]) => {
        setAnalytics(analyticsData);
        if (Array.isArray(usersData)) setUsers(usersData);
        if (Array.isArray(eventsData)) setEvents(eventsData);
        if (Array.isArray(feedbackData)) setFeedbacks(feedbackData);
      })
      .catch(err => console.error('Failed to load admin data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Toggle user activation
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUsers(prev => prev.map(u => (u._id === userId ? { ...u, active: data.user.active } : u)));
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      console.error('Failed to toggle user:', err);
    }
  };

  // Moderate Event Approval
  const handleModerateEvent = async (eventId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      });
      if (res.ok) {
        setEvents(prev => prev.map(e => (e._id === eventId ? { ...e, approved } : e)));
      }
    } catch (err) {
      console.error('Failed to moderate event:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.usn.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading && !analytics) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading College Administration Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>College Administration Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            Institutional Event & Governance Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Oversee department activity, analyze attendee sentiment, and manage user accounts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1.5 px-3 rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Analytics & KPIs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-1.5 px-3 rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-1.5 px-3 rounded-lg transition-colors ${
              activeTab === 'events' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-1.5 px-3 rounded-lg transition-colors ${
              activeTab === 'feedback' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Feedback ({feedbacks.length})
          </button>
        </div>
      </div>

      {/* KPI METRIC STRIP */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Campus Events</span>
            <span className="text-2xl font-black text-slate-900 tabular-nums block mt-1">
              {analytics.totalEvents}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Across 8 Departments</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Registrations</span>
            <span className="text-2xl font-black text-indigo-600 tabular-nums block mt-1">
              {analytics.totalRegistrations}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              High Student Engagement
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Active Student Cohort</span>
            <span className="text-2xl font-black text-slate-900 tabular-nums block mt-1">
              {analytics.totalStudents}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Verified USN Credentials</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Average Event Satisfaction</span>
            <span className="text-2xl font-black text-amber-500 tabular-nums block mt-1">
              {analytics.avgRating} / 5.0
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">
              Lexicon Sentiment Polarity
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <AnalyticsCharts
            categoryCounts={analytics.categoryCounts}
            deptStats={analytics.deptStats}
            sentimentCounts={analytics.sentimentCounts}
            totalRegistrations={analytics.totalRegistrations}
          />
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search name, USN, email or dept..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="organizer">Organizers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50/50">
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">USN / Identifier</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Account Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-700">{u.usn}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'organizer'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.department}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          u.active ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {u.active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{u.active ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.active
                              ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EVENT MODERATION */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              College Events Moderation Queue ({events.length})
            </span>
            <span className="text-xs text-slate-500">
              Review and approve events across department societies
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {events.map(e => (
              <div key={e._id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700">{e.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600">{e.department}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{e.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{e.title}</h3>
                  <p className="text-slate-500 text-[11px]">
                    Organizer: {e.organizer_name} · Registrations: {e.registration_count || 0}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      e.approved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {e.approved ? 'Approved' : 'Under Review'}
                  </span>
                  <button
                    onClick={() => handleModerateEvent(e._id, !e.approved)}
                    className="px-3 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold"
                  >
                    {e.approved ? 'Revoke Approval' : 'Approve Event'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COLLEGE-WIDE FEEDBACK AUDIT */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Attendee Feedback & Lexicon Polarity
            </span>
            <span className="text-xs text-slate-500">
              Classified by AI into Positive / Neutral / Critical
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {feedbacks.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No feedback submitted yet.</div>
            ) : (
              feedbacks.map(fb => (
                <div key={fb._id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{fb.student_name}</span>
                      <span className="text-slate-400">({fb.student_department})</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 tabular-nums">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1">{fb.comment}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{fb.rating}.0</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        fb.sentiment === 'positive'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fb.sentiment === 'negative'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {fb.sentiment.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
