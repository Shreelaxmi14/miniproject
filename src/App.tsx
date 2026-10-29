import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './views/LandingPage.tsx';
import { StudentDashboard } from './views/StudentDashboard.tsx';
import { OrganizerDashboard } from './views/OrganizerDashboard.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';
import { CalendarView } from './views/CalendarView.tsx';
import { LoginModal } from './views/LoginModal.tsx';
import { RegisterModal } from './views/RegisterModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { CollegeEvent } from './types.ts';
import { Sparkles, Calendar, Layers, Image as ImageIcon } from 'lucide-react';

function CampusMilanApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');

  // Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState<'student' | 'organizer'>('student');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [qrModalEvent, setQrModalEvent] = useState<CollegeEvent | null>(null);
  const [feedbackModalEvent, setFeedbackModalEvent] = useState<CollegeEvent | null>(null);

  const handleOpenLogin = (role: 'student' | 'organizer' = 'student') => {
    setLoginInitialRole(role);
    setLoginModalOpen(true);
  };

  const handleOpenRegister = () => {
    setRegisterModalOpen(true);
  };

  const handleOpenQR = (event: CollegeEvent) => {
    setQrModalEvent(event);
  };

  const handleOpenFeedback = (event: CollegeEvent) => {
    setFeedbackModalEvent(event);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Universal 3-Zone Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'organizer' && user?.role !== 'organizer' && user?.role !== 'admin') {
            handleOpenLogin('organizer');
            return;
          }
          if (tab === 'admin' && user?.role !== 'admin') {
            handleOpenLogin('organizer');
            return;
          }
          setCurrentTab(tab);
        }}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenQR={handleOpenQR}
            onOpenFeedback={handleOpenFeedback}
          />
        )}

        {currentTab === 'events' && (
          <StudentDashboard
            onOpenQR={handleOpenQR}
            onOpenFeedback={handleOpenFeedback}
            activeSubTab="all"
          />
        )}

        {currentTab === 'recommendations' && (
          <StudentDashboard
            onOpenQR={handleOpenQR}
            onOpenFeedback={handleOpenFeedback}
            activeSubTab="recommended"
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            onOpenQR={handleOpenQR}
            onOpenFeedback={handleOpenFeedback}
          />
        )}

        {currentTab === 'gallery' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
                <ImageIcon className="w-4 h-4" />
                <span>Campus Life Archive</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Collegiate Past Events Photo Gallery
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                A visual archive of high-energy hackathons, cultural spectacles, sports championships, and research symposiums.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Apex Campus TechFest & Innovation Arena',
                  dept: 'Central College',
                  date: 'Oct 2026',
                  img: '/src/assets/images/campus_fest_hero_1792854205255.jpg',
                  desc: 'Over 800 students assembled for the annual technology exhibition across software, robotics and civil design.'
                },
                {
                  title: 'U-Hack 24-Hour Code Jam Showdown',
                  dept: 'CSE & AI Department',
                  date: 'Oct 2026',
                  img: '/src/assets/images/hackathon_poster_1792854205640.jpg',
                  desc: '45 collegiate teams coding through the night building generative AI tools and smart campus IoT gadgets.'
                },
                {
                  title: 'Dhwanika Annual Cultural Music & Arts Gala',
                  dept: 'Cultural Council',
                  date: 'Oct 2026',
                  img: '/src/assets/images/cultural_fest_poster_1792854206374.jpg',
                  desc: 'Acoustic night, band battles, and classical jugalbandi on the open-air amphitheater stage.'
                },
                {
                  title: 'RoboNav Autonomous Rover Demonstration',
                  dept: 'AI & Robotics Lab',
                  date: 'Sep 2026',
                  img: '/src/assets/images/robotics_symposium_poster_1792854206316.jpg',
                  desc: 'Hands-on edge computer vision deployment on autonomous rovers navigating obstacle tracks.'
                },
                {
                  title: 'Annual Inter-Collegiate Athletics Championship',
                  dept: 'Sports & Physical Ed',
                  date: 'Sep 2026',
                  img: '/src/assets/images/sports_meet_poster_1792854207166.jpg',
                  desc: 'Sprint relays, 5K track runs, and rolling trophy matches at the central athletic stadium.'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-indigo-700">{item.dept}</span>
                      <span className="tabular-nums">{item.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'organizer' && (
          <OrganizerDashboard onOpenQR={handleOpenQR} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 mt-16 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              CM
            </div>
            <span className="font-bold text-slate-800">CampusMilan</span>
            <span>·</span>
            <span>Apex Institute of Technology & Engineering Event Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">TF-IDF & Cosine Similarity Engine Active</span>
            <span>·</span>
            <span>Port 3000 Verified</span>
            <span>·</span>
            <span>NAAC A++ Autonomous Campus</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        initialRole={loginInitialRole}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => setRegisterModalOpen(true)}
        onLoginSuccess={() => {
          if (loginInitialRole === 'organizer') {
            setCurrentTab('organizer');
          } else {
            setCurrentTab('events');
          }
        }}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => setLoginModalOpen(true)}
        onRegisterSuccess={() => setCurrentTab('events')}
      />

      <QRCodeModal
        event={qrModalEvent}
        onClose={() => setQrModalEvent(null)}
      />

      <FeedbackModal
        event={feedbackModalEvent}
        onClose={() => setFeedbackModalEvent(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusMilanApp />
    </AuthProvider>
  );
}
