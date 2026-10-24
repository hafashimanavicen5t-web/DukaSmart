import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CircleDollarSign,
  AlertTriangle,
  Receipt,
  ArrowRight,
  Plus,
  Coins,
  Package,
  Wallet,
  UserCheck,
  Percent,
} from 'lucide-react';
import {
  calculateFinancialSummary,
  getAllProducts,
  getAllSales,
  TimeFilterPeriod,
  seedSampleDemoData,
} from '../../db/storage';
import { formatUGX, formatDateShort } from '../../utils/formatters';
import { Sale, Product } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface DashboardScreenProps {
  onNavigateTab: (tab: 'dashboard' | 'products' | 'sales' | 'customers' | 'reports') => void;
  onSelectSale: (sale: Sale) => void;
  onOpenNewSale: () => void;
  onOpenAddProduct: () => void;
  onOpenAddExpense: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTab,
  onSelectSale,
  onOpenNewSale,
  onOpenAddProduct,
  onOpenAddExpense,
}) => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<TimeFilterPeriod>('today');
  const [summary, setSummary] = useState(calculateFinancialSummary('today'));
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [allProductsCount, setAllProductsCount] = useState(0);

  const refreshData = () => {
    const sum = calculateFinancialSummary(period);
    setSummary(sum);

    const sales = getAllSales();
    setRecentSales(sales.slice(0, 5));

    const products = getAllProducts();
    setAllProductsCount(products.length);
    const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
    setLowStockProducts(lowStock);
  };

  useEffect(() => {
    refreshData();
  }, [period]);

  // Handle first-use empty state
  if (allProductsCount === 0 && recentSales.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t.welcomeTitle}</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            {t.welcomeDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onOpenAddProduct}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              {t.addFirstProduct}
            </button>
            <button
              onClick={() => {
                seedSampleDemoData();
                refreshData();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-sm transition"
            >
              {t.loadSampleData}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const periodLabels: Record<TimeFilterPeriod, string> = {
    today: t.filterToday,
    yesterday: t.filterYesterday,
    week: t.filterWeek,
    month: t.filterMonth,
    all: t.filterAll,
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-5">
      {/* Top Banner: Date Filter & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['today', 'yesterday', 'week', 'month'] as TimeFilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                period === p
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold transition"
          >
            {t.recordExpense}
          </button>
          <button
            onClick={onOpenNewSale}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newSalePos}</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                {t.lowStockAlert} ({lowStockProducts.length} {lowStockProducts.length === 1 ? 'item' : 'items'})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 line-clamp-1">
                {lowStockProducts.map((p) => `${p.name} (${p.stockQuantity} ${t.itemsLeft})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 transition"
          >
            {t.restockBtn}
          </button>
        </div>
      )}

      {/* Primary KPI Grid: Sales & Profit */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Net Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{periodLabels[period]} {t.totalSales}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 font-tabular">
            {formatUGX(summary.netSales)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t.grossSalesLabel}: {formatUGX(summary.grossSales)} · {t.discountLabel}: {formatUGX(summary.discounts)}
          </div>
        </div>

        {/* Estimated Gross Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t.grossProfit}</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 font-tabular">
            {formatUGX(summary.grossProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t.cogsLabel}: {formatUGX(summary.costOfGoodsSold)}
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t.operatingExpenses}</span>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600 font-tabular">
            {formatUGX(summary.operatingExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t.runningCostsLabel}
          </div>
        </div>

        {/* Estimated Net Operating Profit */}
        <div className="bg-emerald-900 text-white p-4 rounded-2xl border border-emerald-950 shadow-xs">
          <div className="flex items-center justify-between text-emerald-200 mb-1">
            <span className="text-xs font-medium">{t.netOperatingProfit}</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-300 font-tabular">
            {formatUGX(summary.netOperatingProfit)}
          </div>
          <div className="text-[11px] text-emerald-200 mt-1">
            {t.netProfitDesc}
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Cash vs MoMo vs Customer Debt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cash Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">{t.cashCollected}</span>
            <span className="text-base sm:text-lg font-bold text-slate-900 font-tabular mt-0.5 block">
              {formatUGX(summary.cashCollected)}
            </span>
            <span className="text-[11px] text-slate-500">{t.cashCollectedDesc}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Mobile Money Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">{t.mobileMoneyCollected}</span>
            <span className="text-base sm:text-lg font-bold text-slate-900 font-tabular mt-0.5 block">
              {formatUGX(summary.mobileMoneyCollected)}
            </span>
            <span className="text-[11px] text-slate-500">{t.mobileMoneyDesc}</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Outstanding Customer Debts */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition"
        >
          <div>
            <span className="text-xs text-slate-500 font-medium block">{t.totalCustomerDebts}</span>
            <span className="text-base sm:text-lg font-bold text-amber-700 font-tabular mt-0.5 block">
              {formatUGX(summary.creditOutstanding)}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">{t.customerDebtsDesc}</span>
          </div>
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Inventory Health & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inventory Overview Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>{t.inventoryStatus}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              {t.manageStock} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500 block mb-0.5">{t.activeProductsCount}</span>
              <span className="text-xl font-bold text-slate-900 font-tabular">{summary.totalProducts}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500 block mb-0.5">{t.stockValuationCost}</span>
              <span className="text-base font-bold text-slate-900 font-tabular">
                {formatUGX(summary.inventoryValuation)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" />
              <span>{t.recentSalesTitle}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              {t.allSalesLink} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              {t.noSalesYet}
            </div>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => onSelectSale(sale)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                    sale.isVoided
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-tabular">{sale.saleNumber}</span>
                      {sale.isVoided ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                          {t.voidedBadge}
                        </span>
                      ) : sale.paymentStatus === 'PAID' ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                          {t.paidBadge}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                          {t.debtBadge}: {formatUGX(sale.outstandingBalance)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {sale.customerName ? `${sale.customerName} · ` : ''}
                      {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900 font-tabular">{formatUGX(sale.totalAmount)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{formatDateShort(sale.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
