import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Coins,
  Download,
  Layers,
  Package,
  Info,
} from 'lucide-react';
import {
  calculateFinancialSummary,
  getAllSales,
  getAllProducts,
  getAllExpenses,
  TimeFilterPeriod,
} from '../../db/storage';
import { formatUGX } from '../../utils/formatters';
import { exportSalesCsv } from '../../utils/csvExport';
import { useLanguage } from '../../i18n/LanguageContext';

export const ReportsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<TimeFilterPeriod>('month');
  const [summary, setSummary] = useState(calculateFinancialSummary('month'));

  const refreshSummary = () => {
    setSummary(calculateFinancialSummary(period));
  };

  useEffect(() => {
    refreshSummary();
  }, [period]);

  const sales = getAllSales().filter((s) => !s.isVoided);
  const products = getAllProducts();
  const expenses = getAllExpenses();

  const productSalesMap: Record<
    string,
    { name: string; quantity: number; revenue: number; profit: number }
  > = {};

  for (const s of sales) {
    for (const item of s.items) {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.lineTotal;
      productSalesMap[item.productId].profit += Math.round(
        item.quantity * (item.unitPrice - item.unitCost)
      );
    }
  }

  const bestSelling = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const expenseCatMap: Record<string, number> = {};
  for (const exp of expenses) {
    expenseCatMap[exp.category] = (expenseCatMap[exp.category] || 0) + exp.amount;
  }

  const totalStockUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
  const totalRetailValuation = products.reduce(
    (acc, p) => acc + p.stockQuantity * p.sellingPrice,
    0
  );
  const unrealizedProfit = totalRetailValuation - totalCostValuation;

  const netMargin = summary.netSales > 0
    ? Math.round((summary.netOperatingProfit / summary.netSales) * 100)
    : 0;

  const periodLabels: Record<TimeFilterPeriod, string> = {
    today: t.filterToday,
    yesterday: t.filterYesterday,
    week: t.filterWeek,
    month: t.filterMonth,
    all: t.filterAll,
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <span>{t.reportsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.reportsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['today', 'yesterday', 'week', 'month', 'all'] as TimeFilterPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  period === p
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportSalesCsv(sales)}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* Financial Statement / P&L Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t.plSummary} ({periodLabels[period]})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.plDesc}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
            {t.marginLabel}: {netMargin}%
          </span>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between py-1 text-slate-600">
            <span>{t.totalSales}</span>
            <span className="font-semibold text-slate-900 font-tabular">
              {formatUGX(summary.grossSales)}
            </span>
          </div>

          <div className="flex justify-between py-1 text-rose-600">
            <span>{t.lessDiscounts}</span>
            <span className="font-semibold font-tabular">-{formatUGX(summary.discounts)}</span>
          </div>

          <div className="flex justify-between py-2 border-y border-slate-100 font-bold text-slate-900">
            <span>{t.netSalesRevenue}</span>
            <span className="font-tabular">{formatUGX(summary.netSales)}</span>
          </div>

          <div className="flex justify-between py-1 text-slate-600">
            <span>{t.lessCogs}</span>
            <span className="font-semibold text-rose-600 font-tabular">
              -{formatUGX(summary.costOfGoodsSold)}
            </span>
          </div>

          <div className="flex justify-between py-2 bg-emerald-50/50 p-2 rounded-xl font-bold text-emerald-950">
            <span>{t.grossProfit}</span>
            <span className="font-tabular text-emerald-700">{formatUGX(summary.grossProfit)}</span>
          </div>

          <div className="flex justify-between py-1 text-slate-600">
            <span>{t.lessExpenses}</span>
            <span className="font-semibold text-rose-600 font-tabular">
              -{formatUGX(summary.operatingExpenses)}
            </span>
          </div>

          <div className="flex justify-between py-3 bg-emerald-900 text-white p-3 rounded-2xl font-bold text-base sm:text-lg">
            <div>
              <span>{t.netOperatingProfit}</span>
              <span className="block text-[11px] font-normal text-emerald-200">
                {t.netProfitDesc}
              </span>
            </div>
            <span className="text-amber-300 font-tabular">
              {formatUGX(summary.netOperatingProfit)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 text-slate-500 rounded-xl text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{t.plDisclaimer}</span>
        </div>
      </div>

      {/* Grid: Cash Collection Breakdown & Best Selling Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Flow & Collection Methods */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-700" />
              <span>{t.cashFlowChannels}</span>
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{t.physicalCashInHand}</span>
                <span className="text-[11px] text-slate-500">{t.cashCollectedDesc}</span>
              </div>
              <span className="font-bold text-slate-900 font-tabular text-sm">
                {formatUGX(summary.cashCollected)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{t.mobileMoneyCollected}</span>
                <span className="text-[11px] text-slate-500">{t.mobileMoneyDesc}</span>
              </div>
              <span className="font-bold text-slate-900 font-tabular text-sm">
                {formatUGX(summary.mobileMoneyCollected)}
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl flex items-center justify-between border border-amber-200">
              <div>
                <span className="font-bold text-amber-950 block">{t.uncollectedDebts}</span>
                <span className="text-[11px] text-amber-800">{t.totalCustomerDebts}</span>
              </div>
              <span className="font-bold text-amber-900 font-tabular text-sm">
                {formatUGX(summary.creditOutstanding)}
              </span>
            </div>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>{t.topProductsTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.topProductsDesc}
            </p>
          </div>

          {bestSelling.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t.noSalesYet}
            </div>
          ) : (
            <div className="space-y-2">
              {bestSelling.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900 truncate block">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-tabular">
                      {item.quantity} sold · {t.estProfitUnit}: {formatUGX(item.profit)}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-800 font-tabular shrink-0">
                    {formatUGX(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Inventory Valuation & Operating Expenses Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inventory Capital Valuation */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>{t.inventoryCapitalValuation}</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-0.5">{t.totalPhysicalUnits}</span>
              <strong className="text-base font-bold text-slate-900 font-tabular">
                {totalStockUnits.toLocaleString()}
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-0.5">{t.capitalInvested}</span>
              <strong className="text-base font-bold text-slate-900 font-tabular">
                {formatUGX(totalCostValuation)}
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-0.5">{t.expectedRetailValue}</span>
              <strong className="text-base font-bold text-slate-900 font-tabular">
                {formatUGX(totalRetailValuation)}
              </strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="text-emerald-800 block mb-0.5">{t.potentialProfit}</span>
              <strong className="text-base font-bold text-emerald-800 font-tabular">
                {formatUGX(unrealizedProfit)}
              </strong>
            </div>
          </div>
        </div>

        {/* Operating Expenses by Category */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-600" />
              <span>{t.expensesByCategory}</span>
            </h3>
          </div>

          {Object.keys(expenseCatMap).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t.noExpensesYet}
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {Object.entries(expenseCatMap).map(([category, amount]) => (
                <div
                  key={category}
                  className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-700">{category}</span>
                  <span className="font-bold text-rose-600 font-tabular">
                    {formatUGX(amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
