import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from './useOnlineStatus';
import { useLanguage } from '../../i18n/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      {!isOnline ? (
        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.offlineSaved}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.offlineReady}</span>
        </span>
      )}
    </div>
  );
};
