import React, { useState } from 'react';
import {
  X,
  Store,
  Database,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  Languages,
} from 'lucide-react';
import {
  getBusinessProfile,
  saveBusinessProfile,
  exportDatabaseJson,
  importDatabaseJson,
  seedSampleDemoData,
  resetToEmptyState,
} from '../../db/storage';
import { BusinessProfile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAndroidGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAndroidGuide,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<BusinessProfile>(getBusinessProfile());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveBusinessProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `DukaSmart_UG_Backup_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDatabaseJson(content);
        setRestoreMessage(res.message);
        if (res.success) {
          setProfile(getBusinessProfile());
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    const confirmPrompt =
      language === 'rw'
        ? 'Icyitonderwa: Ibi birasiba amakuru yose y\'ibicuruzwa, ibyagurishijwe, n\'imyenda y\'abakiriya. Urabyemeza koko?'
        : 'Warning: This will clear all transactions, products, and customer debts. Make sure you downloaded a backup first! Continue?';

    if (window.confirm(confirmPrompt)) {
      resetToEmptyState();
      setRestoreMessage(
        language === 'rw'
          ? 'Amakuru yose yasibwe neza. Porogaramu imeze nk\'inshya.'
          : 'Database reset to clean empty state.'
      );
    }
  };

  const handleLoadDemo = () => {
    const confirmPrompt =
      language === 'rw'
        ? 'Gushyiramo amakuru y\'icyitegererezo y\'iduka rya Uganda / Rwanda (ibicuruzwa, kugurisha, abakiriya)?'
        : 'Load sample demonstration duka products, sales, and customers?';

    if (window.confirm(confirmPrompt)) {
      seedSampleDemoData();
      setRestoreMessage(
        language === 'rw'
          ? 'Amakuru y\'icyitegererezo yashyizwemo neza.'
          : 'Sample demonstration data loaded.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl max-h-[88vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.settingsTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* Language Selector Section */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-emerald-800" />
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  {t.selectLanguageTitle}
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {language === 'rw' ? 'Ikinyarwanda' : 'English'}
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              {language === 'rw'
                ? 'Hitamo ururimi rwo gukoresha muri DukaSmart UG. Ururimi ruhita ruhinduka ako kanya.'
                : 'Choose your preferred language for DukaSmart UG. Language switches immediately across all screens.'}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                  language === 'en'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🇬🇧 English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('rw')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                  language === 'rw'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🇷🇼 Ikinyarwanda</span>
                {language === 'rw' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Shop Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.shopProfileSection}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.shopNameLabel}
              </label>
              <input
                type="text"
                required
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.ownerNameLabel}
                </label>
                <input
                  type="text"
                  value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.phoneLabel}
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.locationLabel}
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="allowNeg"
                checked={profile.allowNegativeStock}
                onChange={(e) => setProfile({ ...profile, allowNegativeStock: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="allowNeg" className="text-xs text-slate-700 cursor-pointer">
                {t.allowNegativeStockLabel}
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> {t.profileSavedMsg}
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                {t.saveProfileBtn}
              </button>
            </div>
          </form>

          {/* Native Android Project & APK Details Button */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-800" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Native Android Project & APK Build Guide
                </h4>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAndroidGuide();
                }}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition"
              >
                View Android Code & APK
              </button>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Complete native Kotlin, Jetpack Compose, Room database, DAOs, repositories, and Gradle files are generated and packaged for Android Studio.
            </p>
          </div>

          {/* Backup & Restore */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-600" />
              <span>{t.backupSectionTitle}</span>
            </h4>
            <p className="text-xs text-slate-500">
              {t.backupSectionDesc}
            </p>

            {restoreMessage && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-medium">
                {restoreMessage}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleExportBackup}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadBackupBtn}</span>
              </button>

              <label className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{t.restoreBackupBtn}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleLoadDemo}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.loadDemoDataBtn}</span>
              </button>

              <button
                onClick={handleResetData}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.resetAllDataBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
