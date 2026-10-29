import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  QrCode,
  Bookmark,
  BookmarkCheck,
  Star,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Video,
  Building
} from 'lucide-react';
import { CollegeEvent } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface EventCardProps {
  event: CollegeEvent;
  matchPercentage?: number;
  relevanceReason?: string;
  matchedKeywords?: string[];
  isSaved?: boolean;
  isRegistered?: boolean;
  onOpenQR: (event: CollegeEvent) => void;
  onOpenFeedback: (event: CollegeEvent) => void;
  onToggleSave?: (eventId: string) => void;
  onRegisterSuccess?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  matchPercentage,
  relevanceReason,
  matchedKeywords,
  isSaved = false,
  isRegistered = false,
  onOpenQR,
  onOpenFeedback,
  onToggleSave,
  onRegisterSuccess
}) => {
  const { user, token } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [registeredState, setRegisteredState] = useState(isRegistered);
  const [savedState, setSavedState] = useState(isSaved);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isOpen = event.status === 'open';

  // Format event date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleRegisterDirect = async () => {
    if (!token) {
      setStatusMsg({ type: 'error', text: 'Please log in to register.' });
      return;
    }
    if (!isOpen) {
      setStatusMsg({ type: 'error', text: 'Registrations are closed for this event.' });
      return;
    }

    try {
      setRegistering(true);
      setStatusMsg(null);
      const res = await fetch(`/api/events/${event._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to register' });
      } else {
        setRegisteredState(true);
        setStatusMsg({ type: 'success', text: 'Registration confirmed!' });
        if (onRegisterSuccess) onRegisterSuccess();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Registration error' });
    } finally {
      setRegistering(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!token) {
      setStatusMsg({ type: 'error', text: 'Please log in to save events.' });
      return;
    }
    try {
      const res = await fetch(`/api/events/${event._id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSavedState(data.saved);
        if (onToggleSave) onToggleSave(event._id);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Poster Image Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        <img
          src={event.poster_url || '/src/assets/images/campus_fest_hero_1792854205255.jpg'}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            // Fallback image
            (e.target as HTMLImageElement).src = '/src/assets/images/campus_fest_hero_1792854205255.jpg';
          }}
        />

        {/* Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Status Badge */}
          <div className="pointer-events-auto">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 ${
                isOpen
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-200' : 'bg-slate-400'}`} />
              <span>{isOpen ? 'Registration Open' : 'Registration Closed'}</span>
            </span>
          </div>

          {/* Bookmark & Mode */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs flex items-center gap-1">
              {event.mode === 'online' ? <Video className="w-3 h-3 text-sky-600" /> : <Building className="w-3 h-3 text-indigo-600" />}
              <span className="capitalize">{event.mode}</span>
            </span>

            {user && (
              <button
                onClick={handleSaveToggle}
                className="p-1.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-700 hover:text-indigo-600 shadow-xs transition-colors"
                title={savedState ? 'Remove from Calendar' : 'Save to Calendar'}
              >
                {savedState ? (
                  <BookmarkCheck className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* AI Recommendation Banner if available */}
        {matchPercentage && matchPercentage >= 50 && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent p-2.5 text-white">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="tabular-nums">{matchPercentage}% Match</span>
              </span>
              <span className="text-[11px] text-slate-200 truncate max-w-[200px]">
                {relevanceReason}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata info line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 flex-wrap">
            <span className="font-semibold text-indigo-700">{event.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[170px]">{event.department}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
            {event.description}
          </p>

          {/* Matched keywords tags if AI matched */}
          {matchedKeywords && matchedKeywords.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-600 font-medium">
              <span>Matches:</span>
              {matchedKeywords.slice(0, 3).map((kw, idx) => (
                <span key={idx} className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">
                  #{kw}
                </span>
              ))}
            </div>
          )}

          {/* Info Rows */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-800">{formattedDate}</span>
              <span className="text-slate-300">|</span>
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="tabular-nums">{event.time}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {statusMsg && (
            <div
              className={`text-xs p-2 rounded-lg mb-2 flex items-center gap-1.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span className="line-clamp-1">{statusMsg.text}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {/* Google Form Link Button */}
            <a
              href={event.google_form_link || '#'}
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Google Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* In-app Direct Register Button if open */}
            {isOpen && (
              <button
                onClick={handleRegisterDirect}
                disabled={registering || registeredState}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors border ${
                  registeredState
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
                }`}
                title={registeredState ? 'Registered' : 'Quick Register in-app'}
              >
                {registeredState ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registered</span>
                  </>
                ) : (
                  <span>{registering ? 'Joining...' : 'Quick Join'}</span>
                )}
              </button>
            )}

            {/* QR Code trigger */}
            <button
              onClick={() => onOpenQR(event)}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
              title="Show Registration QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Feedback / Review Trigger */}
            <button
              onClick={() => onOpenFeedback(event)}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Reviews & Feedback"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="tabular-nums font-semibold">{event.average_rating || 5.0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
