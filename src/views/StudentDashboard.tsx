import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Layers,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  TrendingUp,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { DepartmentGrid } from '../components/DepartmentGrid.tsx';
import { EventCard } from '../components/EventCard.tsx';
import { CollegeEvent, RecommendationResult } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface StudentDashboardProps {
  onOpenQR: (event: CollegeEvent) => void;
  onOpenFeedback: (event: CollegeEvent) => void;
  activeSubTab?: 'all' | 'recommended';
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Categories' },
  { id: 'Hackathons', label: 'Hackathons' },
  { id: 'Workshops', label: 'Workshops' },
  { id: 'Cultural', label: 'Cultural' },
  { id: 'Seminars', label: 'Seminars' },
  { id: 'Sports', label: 'Sports' }
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenQR,
  onOpenFeedback,
  activeSubTab = 'all'
}) => {
  const { user, token } = useAuth();
  const [currentView, setCurrentView] = useState<'all' | 'recommended'>(activeSubTab);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [recommendedResults, setRecommendedResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Filters
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');

  // Load events
  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedDepartments.length > 0) {
      params.set('departments', selectedDepartments.join(','));
    }
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (selectedStatus !== 'all') {
      params.set('status', selectedStatus);
    }
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    params.set('sortBy', sortBy);

    fetch(`/api/events?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(err => console.error('Error fetching events:', err))
      .finally(() => setLoading(false));
  };

  // Load AI Recommendations
  const fetchRecommendations = () => {
    if (!token) return;
    setLoadingRecs(true);
    fetch('/api/events/recommended', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setRecommendedResults(data.recommendations);
        }
      })
      .catch(err => console.error('Error fetching recommendations:', err))
      .finally(() => setLoadingRecs(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDepartments, selectedCategory, selectedStatus, searchQuery, sortBy]);

  useEffect(() => {
    if (token) {
      fetchRecommendations();
    }
  }, [token]);

  const handleToggleDepartment = (deptName: string) => {
    setSelectedDepartments(prev => {
      if (prev.includes(deptName)) {
        return prev.filter(d => d !== deptName);
      } else {
        return [...prev, deptName];
      }
    });
  };

  const handleClearAllDepts = () => {
    setSelectedDepartments([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Student Welcome Banner with Interest Profile */}
      {user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Student Hub</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">{user.department}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80 tabular-nums">Year {user.year}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-indigo-200 mt-1">
              USN: <span className="font-mono font-bold text-white">{user.usn}</span> · AI Match Engine tuned to your interests
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-indigo-300 font-semibold mr-1">Your Skills:</span>
            {user.interests.map((interest, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 rounded-md text-white transition-colors"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENT LOGOS GRID (2 per row on mobile/tablet, as requested) */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <DepartmentGrid
          selectedDepartments={selectedDepartments}
          onToggleDepartment={handleToggleDepartment}
          onClearAll={handleClearAllDepts}
        />
      </section>

      {/* View Switcher: All Events vs AI Recommended For You */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setCurrentView('all')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Campus Events ({events.length})</span>
          </button>

          <button
            onClick={() => setCurrentView('recommended')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'recommended'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Recommended For You (AI TF-IDF)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search title, venue, speaker..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* FILTER STRIP (Categories, Status, Sort) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary filters: Status and Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span className="text-[11px] text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Events</option>
              <option value="open">Open Only</option>
              <option value="closed">Closed / Past</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span className="text-[11px] text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="trending">Popular / Trending</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN VIEW: AI RECOMMENDED OR ALL EVENTS */}
      {currentView === 'recommended' ? (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950">
              <span className="font-bold block text-sm">
                How CampusMilan AI Computes Your Event Matches
              </span>
              <p className="mt-0.5 text-indigo-800 leading-relaxed">
                Using <strong>TF-IDF vectorization and cosine similarity</strong>, we calculate the overlap between your department, year, and selected skills (
                {user ? user.interests.join(', ') : 'AI/ML, Web Dev'}
                ) against the title, description, and keywords of each campus event.
              </p>
            </div>
          </div>

          {loadingRecs ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Vectorizing documents and computing cosine similarity scores...</p>
            </div>
          ) : recommendedResults.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No matching events found for current interest vectors. Try updating your interests or selecting another department.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedResults.map(res => (
                <EventCard
                  key={res.event._id}
                  event={res.event}
                  matchPercentage={res.matchPercentage}
                  relevanceReason={res.relevanceReason}
                  matchedKeywords={res.matchedKeywords}
                  onOpenQR={onOpenQR}
                  onOpenFeedback={onOpenFeedback}
                  onRegisterSuccess={fetchEvents}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ALL EVENTS GRID */
        <div>
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading campus events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <p className="text-sm font-bold text-slate-700">No events matched your current filters.</p>
              <p className="mt-1">Try selecting fewer department tags or clearing the search keyword.</p>
              <button
                onClick={() => {
                  setSelectedDepartments([]);
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard
                  key={event._id}
                  event={event}
                  onOpenQR={onOpenQR}
                  onOpenFeedback={onOpenFeedback}
                  onRegisterSuccess={fetchEvents}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
