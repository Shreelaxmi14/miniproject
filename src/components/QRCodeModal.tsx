import React, { useEffect, useState } from 'react';
import { X, QrCode, ExternalLink, Download, Loader2, Check } from 'lucide-react';
import { CollegeEvent } from '../types.ts';

interface QRCodeModalProps {
  event: CollegeEvent | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ event, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event) return;
    setLoading(true);

    fetch(`/api/events/${event._id}/qrcode`)
      .then(res => res.json())
      .then(data => {
        setQrDataUrl(data.qrDataUrl);
      })
      .catch(err => {
        console.error('Failed to load QR code:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [event]);

  if (!event) return null;

  const registrationLink = event.google_form_link || `https://forms.google.com`;

  const copyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-5 h-5" />
          </div>

          <h3 className="text-base font-bold text-slate-900 line-clamp-2 px-2">
            {event.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Scan to open official Google Forms Registration
          </p>

          <div className="my-5 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center min-h-[220px]">
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Generating high-res QR code...</span>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${event.title}`}
                className="w-48 h-48 rounded-lg shadow-xs"
              />
            ) : (
              <p className="text-xs text-rose-500">Failed to render QR Code</p>
            )}
          </div>

          <div className="space-y-2">
            <a
              href={registrationLink}
              target="_blank"
              rel="noreferrer noopener"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Open Google Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Copy Form Link'}</span>
              </button>

              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`${event.title.replace(/\s+/g, '_')}_QRCode.png`}
                  className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  title="Download QR Image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
