import React from 'react';
import { ShoppingBag, Settings, Plus } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { LanguageToggle } from './LanguageToggle';
import { BusinessProfile } from '../../types';
import { isDemoMode } from '../../db/storage';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeaderProps {
  profile: BusinessProfile;
  onOpenSettings: () => void;
  onOpenNewSale: () => void;
  onOpenAndroidGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenSettings,
  onOpenNewSale,
  onOpenAndroidGuide,
}) => {
  const isDemo = isDemoMode();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            <ShoppingBag className="w-5 h-5 text-emerald-950" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                {t.appTitle}
              </span>
              {isDemo && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider bg-amber-400 text-emerald-950 px-1.5 py-0.5 rounded">
                  {t.demoBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200 truncate hidden xs:block">
              {profile.businessName} · {profile.address}
            </p>
          </div>
        </div>

        {/* Status & Actions Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle EN | RW */}
          <LanguageToggle />

          {/* Offline / Online indicator */}
          <div className="hidden md:block">
            <OfflineIndicator />
          </div>

          {/* Android Kotlin/APK guide trigger */}
          <button
            onClick={onOpenAndroidGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-100 bg-emerald-800/80 hover:bg-emerald-800 rounded-lg border border-emerald-700/60 transition"
            title="View native Android Kotlin & Compose code & APK instructions"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="hidden sm:inline">{t.androidApk}</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Quick Sale button */}
          <button
            onClick={onOpenNewSale}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-lg shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">{t.newSale}</span>
            <span className="xs:hidden">POS</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition"
            title={t.settings}
            aria-label={t.settings}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
