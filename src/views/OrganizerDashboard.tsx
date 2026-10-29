import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Trash2,
  Edit,
  Camera,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Building,
  Video
} from 'lucide-react';
import { CollegeEvent, Registration, Feedback } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { PhotoUploadModal } from '../components/PhotoUploadModal.tsx';
import { DEPARTMENTS_DATA } from '../components/DepartmentGrid.tsx';

interface OrganizerDashboardProps {
  onOpenQR: (event: CollegeEvent) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ onOpenQR }) => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Event Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Workshops');
  const [department, setDepartment] = useState(user?.department || 'Artificial Intelligence & Machine Learning');
  const [date, setDate] = useState('2026-11-22');
  const [time, setTime] = useState('10:00 AM');
  const [venue, setVenue] = useState('Digital Innovation Hub, Seminar Hall');
  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [posterUrl, setPosterUrl] = useState('/src/assets/images/hackathon_poster_1792854205640.jpg');
  const [googleFormLink, setGoogleFormLink] = useState('https://forms.google.com');
  const [paymentLink, setPaymentLink] = useState('');
  const [deadline, setDeadline] = useState('2026-11-20');
  const [savingEvent, setSavingEvent] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected event for viewing registrations or photos
  const [selectedPhotoEvent, setSelectedPhotoEvent] = useState<CollegeEvent | null>(null);
  const [viewRegistrationsEvent, setViewRegistrationsEvent] = useState<CollegeEvent | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Feedback viewer
  const [viewFeedbackEvent, setViewFeedbackEvent] = useState<CollegeEvent | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFb, setLoadingFb] = useState(false);

  // Load Organizer's events
  const fetchMyEvents = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // If user is organizer, show events they organized or college-wide
          const myEvts = data.filter(
            e => user?.role === 'admin' || e.organizer_id === user?._id || e.department === user?.department
          );
          setEvents(myEvts);
        }
      })
      .catch(err => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyEvents();
  }, [token, user]);

  // Open Create Event Modal
  const handleOpenCreate = () => {
    setEditingEventId(null);
    setTitle('');
    setDescription('');
    setCategory('Workshops');
    setDepartment(user?.department || DEPARTMENTS_DATA[0].name);
    setDate('2026-11-25');
    setTime('10:30 AM');
    setVenue('Sir MV Auditorium / Tech Hub');
    setMode('offline');
    setPosterUrl('/src/assets/images/hackathon_poster_1792854205640.jpg');
    setGoogleFormLink('https://forms.google.com');
    setPaymentLink('');
    setDeadline('2026-11-22');
    setFormError('');
    setShowEventModal(true);
  };

  // Open Edit Event Modal
  const handleOpenEdit = (evt: CollegeEvent) => {
    setEditingEventId(evt._id);
    setTitle(evt.title);
    setDescription(evt.description);
    setCategory(evt.category);
    setDepartment(evt.department);
    setDate(evt.date);
    setTime(evt.time);
    setVenue(evt.venue);
    setMode(evt.mode);
    setPosterUrl(evt.poster_url);
    setGoogleFormLink(evt.google_form_link);
    setPaymentLink(evt.payment_link || '');
    setDeadline(evt.registration_deadline);
    setFormError('');
    setShowEventModal(true);
  };

  // Submit Create or Edit Event
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !time || !venue) {
      setFormError('Please fill out all required event details.');
      return;
    }

    try {
      setSavingEvent(true);
      setFormError('');

      const url = editingEventId ? `/api/events/${editingEventId}` : '/api/events';
      const method = editingEventId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          department,
          date,
          time,
          venue,
          mode,
          poster_url: posterUrl,
          google_form_link: googleFormLink,
          payment_link: paymentLink,
          registration_deadline: deadline,
          status: 'open'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event');
      }

      setShowEventModal(false);
      fetchMyEvents();
    } catch (err: any) {
      setFormError(err.message || 'Error saving event');
    } finally {
      setSavingEvent(false);
    }
  };

  // Toggle Registration Status (Open / Closed)
  const handleToggleStatus = async (evt: CollegeEvent) => {
    const nextStatus = evt.status === 'open' ? 'closed' : 'open';
    try {
      const res = await fetch(`/api/events/${evt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setEvents(prev =>
          prev.map(e => (e._id === evt._id ? { ...e, status: nextStatus } : e))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Open Registrations list
  const handleViewRegistrations = async (evt: CollegeEvent) => {
    setViewRegistrationsEvent(evt);
    setLoadingRegs(true);
    try {
      const res = await fetch(`/api/events/${evt._id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoadingRegs(false);
    }
  };

  // Open Feedback list
  const handleViewFeedback = async (evt: CollegeEvent) => {
    setViewFeedbackEvent(evt);
    setLoadingFb(true);
    try {
      const res = await fetch(`/api/events/${evt._id}/feedback`);
      const data = await res.json();
      setFeedbacks(data || []);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoadingFb(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            <span>Organizer Portal</span>
            <span>·</span>
            <span>{user?.department || 'Department Lead'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Department Events & Registrations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create events, toggle registrations, upload recap photos, and track attendee feedback.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Events Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Managed Events ({events.length})
          </span>
          <span className="text-xs text-slate-500">
            Student notifications fire automatically on publish
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading events console...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <p className="font-semibold text-slate-700">No events created yet.</p>
            <p className="mt-1">Click "Create New Event" to publish your department's upcoming program.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map(evt => (
              <div
                key={evt._id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={evt.poster_url}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-indigo-700">{evt.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">{evt.department}</span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          evt.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {evt.status === 'open' ? 'Registrations Open' : 'Closed'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums">{evt.date} ({evt.time})</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{evt.venue}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Stats & Organizer Action Controls */}
                <div className="flex items-center gap-2 flex-wrap lg:justify-end">
                  {/* Registrations count badge */}
                  <button
                    onClick={() => handleViewRegistrations(evt)}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-xs font-semibold text-slate-800 transition-colors flex items-center gap-1.5"
                    title="View Registered Students"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="tabular-nums">{evt.registration_count || 0}</span>
                    <span>Registrations</span>
                  </button>

                  {/* Feedback button */}
                  <button
                    onClick={() => handleViewFeedback(evt)}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 rounded-lg text-xs font-semibold text-slate-800 transition-colors flex items-center gap-1.5"
                    title="View Feedback & Sentiment"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="tabular-nums">{evt.average_rating || 5.0}</span>
                    <span>Reviews ({evt.feedback_count || 0})</span>
                  </button>

                  {/* Toggle Registration Status */}
                  <button
                    onClick={() => handleToggleStatus(evt)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
                      evt.status === 'open'
                        ? 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                    title="Toggle Open/Closed"
                  >
                    {evt.status === 'open' ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span>Open</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                        <span>Closed</span>
                      </>
                    )}
                  </button>

                  {/* Upload 1-2 Photos After Event */}
                  <button
                    onClick={() => setSelectedPhotoEvent(evt)}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1"
                    title="Upload Post-Event Photos for Homepage Carousel"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload Recap ({evt.photos?.length || 0})</span>
                  </button>

                  {/* QR Code view */}
                  <button
                    onClick={() => onOpenQR(evt)}
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                    title="Registration QR Code"
                  >
                    QR
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(evt)}
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteEvent(evt._id)}
                    className="p-2 border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              &times;
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingEventId ? 'Edit Event Details' : 'Create New College Event'}
              </h2>
              <p className="text-xs text-slate-500">
                Provide comprehensive information for college-wide discovery
              </p>
            </div>

            <form onSubmit={handleSubmitEvent} className="overflow-y-auto space-y-3.5 pr-1 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. U-Hack 2026: 24-Hour Hackathon"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description & Agenda *
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe event tracks, eligibility, mentors, and prize pools..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Hackathons">Hackathons</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Seminars">Seminars</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Host Department *
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    {DEPARTMENTS_DATA.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mode
                  </label>
                  <select
                    value={mode}
                    onChange={e => setMode(e.target.value as 'offline' | 'online')}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="offline">Offline (On-Campus)</option>
                    <option value="online">Online (Virtual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Venue *
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  placeholder="e.g. Auditorium 3, Sir MV Block"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Form Registration Link *
                  </label>
                  <input
                    type="url"
                    value={googleFormLink}
                    onChange={e => setGoogleFormLink(e.target.value)}
                    placeholder="https://docs.google.com/forms/..."
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={paymentLink}
                    onChange={e => setPaymentLink(e.target.value)}
                    placeholder="e.g. https://rzp.io/l/..."
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Poster Asset
                </label>
                <select
                  value={posterUrl}
                  onChange={e => setPosterUrl(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="/src/assets/images/hackathon_poster_1792854205640.jpg">
                    U-Hack Hackathon Cyber Poster
                  </option>
                  <option value="/src/assets/images/cultural_fest_poster_1792854206374.jpg">
                    Dhwanika Cultural Fest Poster
                  </option>
                  <option value="/src/assets/images/robotics_symposium_poster_1792854206316.jpg">
                    Robotics Symposium Tech Poster
                  </option>
                  <option value="/src/assets/images/sports_meet_poster_1792854207166.jpg">
                    Collegiate Sports Track Poster
                  </option>
                  <option value="/src/assets/images/campus_fest_hero_1792854205255.jpg">
                    Campus Life General Banner
                  </option>
                </select>
              </div>

              {formError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-medium">
                  {formError}
                </p>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs"
                >
                  {savingEvent ? 'Saving...' : editingEventId ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REGISTERED STUDENTS MODAL */}
      {viewRegistrationsEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-100 relative animate-in fade-in">
            <button
              onClick={() => setViewRegistrationsEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              &times;
            </button>

            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Registered Attendees ({registrations.length})
              </h2>
              <p className="text-xs text-slate-500 line-clamp-1">
                For: {viewRegistrationsEvent.title}
              </p>
            </div>

            <div className="overflow-y-auto flex-1 text-xs">
              {loadingRegs ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No student registrations yet for this event.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">USN</th>
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3">Registered At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map(r => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{r.student_name}</td>
                        <td className="py-2.5 px-3 font-mono text-indigo-700">{r.student_usn}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.student_department}</td>
                        <td className="py-2.5 px-3 text-slate-500 tabular-nums">
                          {new Date(r.registered_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW FEEDBACK & SENTIMENT MODAL */}
      {viewFeedbackEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-100 relative animate-in fade-in">
            <button
              onClick={() => setViewFeedbackEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              &times;
            </button>

            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Student Feedback & AI Sentiment Polarity
              </h2>
              <p className="text-xs text-slate-500 line-clamp-1">
                For: {viewFeedbackEvent.title}
              </p>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 text-xs">
              {loadingFb ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No student reviews submitted for this event yet.
                </div>
              ) : (
                feedbacks.map(fb => (
                  <div key={fb._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">{fb.student_name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="ml-1">{fb.rating}.0</span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            fb.sentiment === 'positive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fb.sentiment === 'negative'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {fb.sentiment.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-700">{fb.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST EVENT RECAP PHOTOS MODAL */}
      {selectedPhotoEvent && (
        <PhotoUploadModal
          event={selectedPhotoEvent}
          onClose={() => setSelectedPhotoEvent(null)}
          onPhotosUploaded={() => {
            fetchMyEvents();
            alert('Recap photos published! They are now visible on the public homepage carousel.');
          }}
        />
      )}
    </div>
  );
};
