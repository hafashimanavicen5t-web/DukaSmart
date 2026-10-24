/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { BottomNav, TabType } from './components/common/BottomNav';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { ProductsScreen } from './components/products/ProductsScreen';
import { SalesScreen } from './components/sales/SalesScreen';
import { CustomersScreen } from './components/customers/CustomersScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { ExpensesModal } from './components/expenses/ExpensesModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AndroidGuideModal } from './components/android/AndroidGuideModal';
import {
  ensureInitialData,
  getBusinessProfile,
  subscribeDbChange,
} from './db/storage';
import { LanguageProvider } from './i18n/LanguageContext';
import { BusinessProfile, Sale } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [profile, setProfile] = useState<BusinessProfile>(getBusinessProfile());

  // Modals
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAndroidGuideOpen, setIsAndroidGuideOpen] = useState(false);

  // Selected sale to view in receipt modal
  const [selectedSaleToInspect, setSelectedSaleToInspect] = useState<Sale | null>(null);

  useEffect(() => {
    // Seed initial data if first time
    ensureInitialData();
    setProfile(getBusinessProfile());

    // Listen to changes across all storage operations
    const unsubscribe = subscribeDbChange(() => {
      setProfile(getBusinessProfile());
    });

    return () => unsubscribe();
  }, []);

  const handleSelectSaleFromDashboard = (sale: Sale) => {
    setSelectedSaleToInspect(sale);
    setActiveTab('sales');
  };

  const handleOpenNewSale = () => {
    setSelectedSaleToInspect(null);
    setActiveTab('sales');
  };

  const handleOpenAddProduct = () => {
    setActiveTab('products');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Application Bar */}
      <Header
        profile={profile}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNewSale={handleOpenNewSale}
        onOpenAndroidGuide={() => setIsAndroidGuideOpen(true)}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectSale={handleSelectSaleFromDashboard}
            onOpenNewSale={handleOpenNewSale}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenAddExpense={() => setIsExpensesModalOpen(true)}
          />
        )}

        {activeTab === 'products' && <ProductsScreen />}

        {activeTab === 'sales' && (
          <SalesScreen
            selectedSaleFromDashboard={selectedSaleToInspect}
            onClearSelectedSale={() => setSelectedSaleToInspect(null)}
          />
        )}

        {activeTab === 'customers' && <CustomersScreen />}

        {activeTab === 'reports' && <ReportsScreen />}
      </main>

      {/* Bottom Material 3 Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Expenses Modal */}
      <ExpensesModal
        isOpen={isExpensesModalOpen}
        onClose={() => setIsExpensesModalOpen(false)}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenAndroidGuide={() => setIsAndroidGuideOpen(true)}
      />

      {/* Android Kotlin & APK Guide Modal */}
      <AndroidGuideModal
        isOpen={isAndroidGuideOpen}
        onClose={() => setIsAndroidGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
