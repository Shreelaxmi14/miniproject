import React, { useState } from 'react';
import { X, ImagePlus, Loader2, Check, Sparkles } from 'lucide-react';
import { CollegeEvent } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PhotoUploadModalProps {
  event: CollegeEvent | null;
  onClose: () => void;
  onPhotosUploaded: () => void;
}

const PRESET_EVENT_PHOTOS = [
  {
    name: 'Campus Courtyard & Innovation Hub',
    url: '/src/assets/images/campus_fest_hero_1792854205255.jpg'
  },
  {
    name: 'Hackathon Coding Arena',
    url: '/src/assets/images/hackathon_poster_1792854205640.jpg'
  },
  {
    name: 'Annual Cultural Stage Performance',
    url: '/src/assets/images/cultural_fest_poster_1792854206374.jpg'
  },
  {
    name: 'Robotics Rover Lab Testing',
    url: '/src/assets/images/robotics_symposium_poster_1792854206316.jpg'
  },
  {
    name: 'Sports Stadium Athletic Sprint',
    url: '/src/assets/images/sports_meet_poster_1792854207166.jpg'
  }
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  event,
  onClose,
  onPhotosUploaded
}) => {
  const { token } = useAuth();
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!event) return null;

  const toggleSelect = (url: string) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(prev => prev.filter(u => u !== url));
    } else {
      if (selectedUrls.length >= 2) {
        setError('You can attach up to 2 photos per post-event recap.');
        return;
      }
      setError('');
      setSelectedUrls(prev => [...prev, url]);
    }
  };

  const handleAddCustom = () => {
    if (!customUrl.trim()) return;
    if (selectedUrls.length >= 2) {
      setError('Maximum 2 photos can be uploaded.');
      return;
    }
    setSelectedUrls(prev => [...prev, customUrl.trim()]);
    setCustomUrl('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUrls.length === 0) {
      setError('Please select at least 1 photo to attach.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const res = await fetch(`/api/events/${event._id}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ photos: selectedUrls })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to attach event photos');
      }

      onPhotosUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2 font-bold">
            <ImagePlus className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Upload Post-Event Recap Photos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            For: {event.title}
          </p>
          <p className="text-[11px] text-indigo-600 mt-1 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>These photos will appear on the public homepage carousel</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">
                Select from Campus Asset Library (Max 2):
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedUrls.length} / 2 Selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
              {PRESET_EVENT_PHOTOS.map(item => {
                const isChosen = selectedUrls.includes(item.url);
                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => toggleSelect(item.url)}
                    className={`relative rounded-lg overflow-hidden border-2 text-left group transition-all ${
                      isChosen ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[10px] text-white font-medium line-clamp-1">
                        {item.name}
                      </span>
                    </div>
                    {isChosen && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Paste Direct Image URL:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-medium">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading || selectedUrls.length === 0}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Publish to Public Carousel</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
