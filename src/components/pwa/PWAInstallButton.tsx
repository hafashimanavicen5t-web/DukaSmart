import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { useLanguage } from '../../i18n/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { t, language } = useLanguage();

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition active:scale-95"
        title={t.installApp}
      >
        <Download className="w-3.5 h-3.5 text-emerald-950" />
        <span>{t.installApp}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{language === 'rw' ? 'Kuri iOS' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">{t.installApp} (iPhone / iPad)</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                {language === 'rw' ? (
                  <>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">1</span>
                      <p>Kanda kuri <strong>Share</strong> mu mbuga ya Safari.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">2</span>
                      <p>Manuka hasi uhitemo <strong>Add to Home Screen</strong>.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">3</span>
                      <p>Kanda <strong>Add</strong> kugira ngo ukoreshe DukaSmart UG nta murandasi igihe cyose!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">1</span>
                      <p>Tap the <strong>Share</strong> icon in Safari toolbar.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">2</span>
                      <p>Scroll down and select <strong>Add to Home Screen</strong>.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">3</span>
                      <p>Tap <strong>Add</strong> to use DukaSmart UG completely offline anytime!</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-800 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                {t.done}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
