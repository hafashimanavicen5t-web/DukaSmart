import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const LanguageToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-lg bg-emerald-950/60 p-0.5 border border-emerald-700/60 shadow-xs"
      title="Hindura Ururimi / Switch Language"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
          language === 'en'
            ? 'bg-amber-400 text-emerald-950 shadow-xs'
            : 'text-emerald-200 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('rw')}
        className={`px-2 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
          language === 'rw'
            ? 'bg-amber-400 text-emerald-950 shadow-xs'
            : 'text-emerald-200 hover:text-white'
        }`}
      >
        RW
      </button>
    </div>
  );
};
