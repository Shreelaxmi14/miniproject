import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { RecentPhotosCarousel } from '../components/RecentPhotosCarousel.tsx';
import { EventCard } from '../components/EventCard.tsx';
import { CollegeEvent } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface LandingPageProps {
  onOpenLogin: (role?: 'student' | 'organizer') => void;
  onOpenRegister: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenQR: (event: CollegeEvent) => void;
  onOpenFeedback: (event: CollegeEvent) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onNavigateTab,
  onOpenQR,
  onOpenFeedback
}) => {
  const { user, switchDemoRole } = useAuth();
  const [highlights, setHighlights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events/public-highlights')
      .then(res => res.json())
      .then(data => setHighlights(data))
      .catch(err => console.error('Failed to load highlights:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = highlights?.stats || {
    totalEvents: 6,
    totalRegistrations: 28,
    departmentsCount: 8,
    satisfactionRate: '98%'
  };

  const trendingEvents: CollegeEvent[] = highlights?.trendingEvents || [];
  const carouselPhotos = highlights?.carouselPhotos || [];

  return (
    <div className="w-full space-y-12 pb-16">
      {/* 1. College Brand Banner Header */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Apex Institute Centralized Event Intelligence System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              CampusMilan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                Discover, Connect & Lead Campus Life
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              No more searching through scattered WhatsApp groups, posters, and notice boards.
              Discover all academic workshops, hackathons, cultural galas, and sports meets with
              TF-IDF AI recommendations tailored to your skills.
            </p>

            {/* TWO PROMINENT BUTTONS AS SPECIFIED IN USER BRIEF */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenLogin('student')}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Student Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenLogin('organizer')}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Organizer Login</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('events')}
                className="py-3 px-5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Browse Public Events
              </button>
            </div>

            {/* Demo Instant Test Access */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Quick Demo Access:</span>
              <button
                onClick={() => {
                  switchDemoRole('student');
                  onNavigateTab('events');
                }}
                className="text-indigo-600 hover:underline font-medium"
              >
                Student (Aarav)
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  switchDemoRole('organizer');
                  onNavigateTab('organizer');
                }}
                className="text-indigo-600 hover:underline font-medium"
              >
                Organizer (Priya)
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  switchDemoRole('admin');
                  onNavigateTab('admin');
                }}
                className="text-purple-600 hover:underline font-medium"
              >
                Admin (Dean)
              </button>
            </div>
          </div>

          {/* College Crest & Metric Strip */}
          <div className="w-full md:w-80 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-purple-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
                AIT
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Apex Institute of Technology
                </h4>
                <p className="text-[11px] text-slate-500">Autonomous · NAAC A++</p>
                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>CampusMilan Portal Active</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-xl font-black text-slate-900 tabular-nums block">
                  {stats.totalEvents}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Active Events
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-xl font-black text-indigo-600 tabular-nums block">
                  {stats.totalRegistrations}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Registrations
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-xl font-black text-slate-900 tabular-nums block">
                  {stats.departmentsCount}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Departments
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-xl font-black text-emerald-600 tabular-nums block">
                  {stats.satisfactionRate}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Attendee Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Auto-Sliding Carousel of Recent Event Photos (Uploaded by Organizers) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Campus Live: Recent Event Photos Carousel</span>
            </h2>
            <p className="text-xs text-slate-500">
              Auto-cycling highlights submitted by Department Presidents after recent conclaves
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('gallery')}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View Full Gallery</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <RecentPhotosCarousel photos={carouselPhotos} />
      </section>

      {/* 3. Trending & Featured Campus Events */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Trending Campus Events & Conclaves</span>
            </h2>
            <p className="text-xs text-slate-500">
              Top events with high student participation across technical, cultural, and sports councils
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('events')}
            className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            <span>Explore All Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingEvents.slice(0, 3).map(event => (
            <EventCard
              key={event._id}
              event={event}
              onOpenQR={onOpenQR}
              onOpenFeedback={onOpenFeedback}
              onRegisterSuccess={() => {}}
            />
          ))}
        </div>
      </section>

      {/* 4. Past Event Photo Gallery Below as specified */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="border-t border-slate-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Gallery of Past Events & Celebrations
              </h2>
              <p className="text-xs text-slate-500">
                Relive memories from student hackathons, symposiums, and cultural festivals
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Verified Post-Event Submissions
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                title: 'Campus TechFest & Hub Gathering',
                dept: 'Central College',
                img: '/src/assets/images/campus_fest_hero_1792854205255.jpg'
              },
              {
                title: 'U-Hack 24-Hour Code Jam',
                dept: 'CSE & AI',
                img: '/src/assets/images/hackathon_poster_1792854205640.jpg'
              },
              {
                title: 'Dhwanika Music Night Concert',
                dept: 'Cultural Council',
                img: '/src/assets/images/cultural_fest_poster_1792854206374.jpg'
              },
              {
                title: 'RoboNav Autonomous Rover Lab',
                dept: 'AI&ML Department',
                img: '/src/assets/images/robotics_symposium_poster_1792854206316.jpg'
              },
              {
                title: 'Inter-Collegiate Sports Track Meet',
                dept: 'Sports Board',
                img: '/src/assets/images/sports_meet_poster_1792854207166.jpg'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhotoModal(item.img)}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 cursor-pointer border border-slate-200 shadow-xs hover:shadow-md transition-all"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                  <span className="text-[10px] text-amber-300 font-semibold">{item.dept}</span>
                  <p className="text-xs text-white font-bold line-clamp-1">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Gallery Photo */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden bg-black relative">
            <img
              src={selectedPhotoModal}
              alt="Past event highlight"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
