import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  ExternalLink,
  QrCode,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  BellRing,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { CollegeEvent } from '../types.ts';

interface CalendarViewProps {
  onOpenQR: (event: CollegeEvent) => void;
  onOpenFeedback: (event: CollegeEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenQR, onOpenFeedback }) => {
  const { user, token } = useAuth();
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/student/calendar', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.calendarItems) {
          setCalendarItems(data.calendarItems);
        }
      })
      .catch(err => console.error('Error fetching calendar:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalendar();
  }, [token]);

  const calculateDaysLeft = (eventDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const evDate = new Date(eventDateStr);
    evDate.setHours(0, 0, 0, 0);
    const diffTime = evDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Student Academic Schedule & Bookmarks</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            My Event Calendar & Reminders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active saved events, verified registrations, and scheduled time reminders.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-xs text-indigo-900">
          <BellRing className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>In-app reminders notify you 24 hours prior to scheduled start</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Retrieving your saved events...</p>
        </div>
      ) : calendarItems.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-xs">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No events saved to your calendar yet</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            Browse campus events and click the bookmark icon on any card to track upcoming dates and get reminders.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {calendarItems.map(item => {
            const daysLeft = calculateDaysLeft(item.date);
            const isPast = daysLeft < 0;
            const isToday = daysLeft === 0;

            return (
              <div
                key={item._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                {/* Left: Date pill & Details */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Date badge */}
                  <div
                    className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                      isToday
                        ? 'bg-amber-500 text-white border-amber-600'
                        : isPast
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-black tabular-nums leading-none">
                      {new Date(item.date).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-indigo-700">{item.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">{item.department}</span>
                      <span className="text-slate-300">·</span>
                      {item.isRegistered && (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Registered</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums">{item.time}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.venue}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Countdown badge & Actions */}
                <div className="flex items-center gap-3 md:justify-end">
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md block ${
                        isToday
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : isPast
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-indigo-50 text-indigo-800'
                      }`}
                    >
                      {isToday
                        ? 'Happening Today!'
                        : isPast
                        ? 'Event Concluded'
                        : `${daysLeft} Days to go`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={item.google_form_link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span>Form</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => onOpenQR(item)}
                      className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {isPast && (
                      <button
                        onClick={() => onOpenFeedback(item)}
                        className="py-1.5 px-2.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Rate Event
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
