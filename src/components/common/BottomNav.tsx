import React from 'react';
import {
  LayoutDashboard,
  Package,
  CircleDollarSign,
  Users,
  BarChart3,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export type TabType = 'dashboard' | 'products' | 'sales' | 'customers' | 'reports';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  cartCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  cartCount = 0,
}) => {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: t.tabDashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'products' as TabType,
      label: t.tabProducts,
      icon: Package,
    },
    {
      id: 'sales' as TabType,
      label: t.tabSales,
      icon: CircleDollarSign,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'customers' as TabType,
      label: t.tabCustomers,
      icon: Users,
    },
    {
      id: 'reports' as TabType,
      label: t.tabReports,
      icon: BarChart3,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg safe-bottom">
      <div className="max-w-xl mx-auto grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-emerald-800 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Material 3 active pill indicator */}
              <div
                className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all ${
                  isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-emerald-950 text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-full px-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
