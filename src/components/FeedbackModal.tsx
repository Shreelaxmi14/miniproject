import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, ThumbsUp, Minus, ThumbsDown, Loader2, Send } from 'lucide-react';
import { CollegeEvent, Feedback } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface FeedbackModalProps {
  event: CollegeEvent | null;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  event,
  onClose,
  onFeedbackSubmitted
}) => {
  const { user, token } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!event) return;
    setLoadingFeedbacks(true);
    fetch(`/api/events/${event._id}/feedback`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFeedbacks(data);
      })
      .catch(err => console.error('Failed to load feedbacks:', err))
      .finally(() => setLoadingFeedbacks(false));
  }, [event]);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment sharing your experience.');
      return;
    }
    if (!token) {
      setErrorMsg('Please log in to submit feedback.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await fetch(`/api/events/${event._id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setFeedbacks(prev => [data.feedback, ...prev]);
      setComment('');
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSentimentBadge = (sentiment: string) => {
    if (sentiment === 'positive') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
          <ThumbsUp className="w-3 h-3" />
          <span>Positive Experience</span>
        </span>
      );
    }
    if (sentiment === 'negative') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
          <ThumbsDown className="w-3 h-3" />
          <span>Critical Feedback</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
        <Minus className="w-3 h-3" />
        <span>Neutral Review</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Event Reviews & Sentiment
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
              {event.title}
            </h3>
            <p className="text-xs text-slate-500">
              Department: {event.department} · {event.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Submit form if student */}
          {user ? (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rate & Share Feedback</span>
              </h4>

              {/* Star Rating Picker */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-600">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 tabular-nums ml-1">
                  {rating} / 5 Stars
                </span>
              </div>

              {/* Comment text */}
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="How was the organization, speaker quality, or hands-on content? AI sentiment will classify your insights."
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />

              {errorMsg && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{errorMsg}</p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  AI will analyze sentiment automatically on submission
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Post Review</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-800">
              Please sign in as a student to submit a rating and feedback review for this event.
            </div>
          )}

          {/* Existing Feedbacks List */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Student Reviews ({feedbacks.length})</span>
              {feedbacks.length > 0 && (
                <span className="text-xs font-medium text-slate-500">
                  Avg Rating: {(feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)} / 5.0
                </span>
              )}
            </h4>

            {loadingFeedbacks ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No reviews yet. Be the first student to review this event!
              </div>
            ) : (
              <div className="space-y-3">
                {feedbacks.map(fb => (
                  <div
                    key={fb._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          {fb.student_name}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span>{fb.student_department}</span>
                          <span>·</span>
                          <span className="tabular-nums">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= fb.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        {renderSentimentBadge(fb.sentiment)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mt-2">
                      {fb.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
