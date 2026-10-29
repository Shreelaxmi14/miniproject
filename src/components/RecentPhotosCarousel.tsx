import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';

interface CarouselPhoto {
  url: string;
  title: string;
  category: string;
  department: string;
  date: string;
}

interface RecentPhotosCarouselProps {
  photos: CarouselPhoto[];
}

export const RecentPhotosCarousel: React.FC<RecentPhotosCarouselProps> = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Default fallback items if list is empty
  const displayPhotos = photos.length > 0 ? photos : [
    {
      url: '/src/assets/images/campus_fest_hero_1792854205255.jpg',
      title: 'Apex Campus TechFest & Cultural Celebrations',
      category: 'Campus Life',
      department: 'University Central',
      date: '2026-10-20'
    },
    {
      url: '/src/assets/images/cultural_fest_poster_1792854206374.jpg',
      title: 'Dhwanika Annual Music & Arts Gala Highlights',
      category: 'Cultural',
      department: 'Cultural & Arts Council',
      date: '2026-10-15'
    },
    {
      url: '/src/assets/images/hackathon_poster_1792854205640.jpg',
      title: 'U-Hack 24-Hour Code Jam Showdown',
      category: 'Hackathons',
      department: 'Computer Science & Engineering',
      date: '2026-10-10'
    }
  ];

  useEffect(() => {
    if (isPaused || displayPhotos.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayPhotos.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, displayPhotos.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % displayPhotos.length);
  };

  const current = displayPhotos[currentIndex];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950 aspect-[21/9] sm:aspect-[16/7] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Image */}
      <div className="absolute inset-0">
        <img
          key={current.url}
          src={current.url}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/campus_fest_hero_1792854205255.jpg';
          }}
        />
        {/* Contrast Scrim per frontend-design guidelines */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white z-10 flex flex-col justify-end">
        <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Recent Event Recap & Highlights</span>
          <span className="text-white/40">·</span>
          <span className="text-white/80">{current.category}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/80">{current.department}</span>
        </div>

        <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white line-clamp-1 max-w-3xl">
          {current.title}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-xs text-white/70">
          <Calendar className="w-3.5 h-3.5" />
          <span className="tabular-nums">
            {new Date(current.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="text-white/40">·</span>
          <span>Verified Student Recap Submission</span>
        </div>
      </div>

      {/* Navigation Arrows */}
      {displayPhotos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
            {displayPhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-amber-400 w-5' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
