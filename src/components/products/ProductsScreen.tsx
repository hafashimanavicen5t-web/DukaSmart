import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Package,
  History,
  Archive,
  Download,
  X,
  Edit2,
} from 'lucide-react';
import {
  getAllProducts,
  saveProduct,
  restockProduct,
  archiveProduct,
  unarchiveProduct,
  getProductMovements,
} from '../../db/storage';
import { Product, InventoryMovement } from '../../types';
import { formatUGX, formatQuantity, formatDateTime } from '../../utils/formatters';
import { exportProductsCsv } from '../../utils/csvExport';
import { useLanguage } from '../../i18n/LanguageContext';

interface ProductsScreenProps {
  onOpenNewSaleForProduct?: (product: Product) => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'archived'>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProductTarget, setRestockProductTarget] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockNewCost, setRestockNewCost] = useState('');
  const [restockNote, setRestockNote] = useState('');

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyTargetProduct, setHistoryTargetProduct] = useState<Product | null>(null);
  const [productMovements, setProductMovements] = useState<InventoryMovement[]>([]);

  // Form fields for Add/Edit
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Groceries');
  const [formCost, setFormCost] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formThreshold, setFormThreshold] = useState('5');
  const [formAllowDecimal, setFormAllowDecimal] = useState(false);
  const [formSupplier, setFormSupplier] = useState('');
  const [formError, setFormError] = useState('');

  const refreshProducts = () => {
    const list = getAllProducts(true);
    setProducts(list);
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const categories = Array.from(
    new Set(products.filter((p) => !p.isArchived).map((p) => p.category || 'General'))
  );

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'archived') {
      if (!p.isArchived) return false;
    } else {
      if (p.isArchived) return false;
    }

    if (stockFilter === 'low' && p.stockQuantity > p.lowStockThreshold) return false;
    if (stockFilter === 'out' && p.stockQuantity > 0) return false;

    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
      const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
      return matchName || matchSku || matchCat;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormCategory('Groceries');
    setFormCost('');
    setFormPrice('');
    setFormStock('');
    setFormThreshold('5');
    setFormAllowDecimal(false);
    setFormSupplier('');
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku || '');
    setFormCategory(p.category);
    setFormCost(String(p.costPrice));
    setFormPrice(String(p.sellingPrice));
    setFormStock(String(p.stockQuantity));
    setFormThreshold(String(p.lowStockThreshold));
    setFormAllowDecimal(Boolean(p.allowDecimal));
    setFormSupplier(p.supplier || '');
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Product name is required.');
      return;
    }

    const cost = Math.round(Number(formCost) || 0);
    const price = Math.round(Number(formPrice) || 0);
    const stock = Number(formStock) || 0;
    const threshold = Number(formThreshold) || 5;

    if (price < 0 || cost < 0) {
      setFormError('Cost and Selling price cannot be negative.');
      return;
    }

    if (stock < 0) {
      setFormError('Stock quantity cannot be negative.');
      return;
    }

    const res = saveProduct({
      id: editingProduct?.id,
      name: formName.trim(),
      sku: formSku.trim() || undefined,
      category: formCategory.trim() || 'General',
      costPrice: cost,
      sellingPrice: price,
      stockQuantity: stock,
      lowStockThreshold: threshold,
      allowDecimal: formAllowDecimal,
      supplier: formSupplier.trim() || undefined,
    });

    if (!res.success) {
      setFormError(res.message || 'Failed to save product.');
      return;
    }

    setIsAddEditModalOpen(false);
    refreshProducts();
  };

  const handleOpenRestock = (p: Product) => {
    setRestockProductTarget(p);
    setRestockQty('');
    setRestockNewCost(String(p.costPrice));
    setRestockNote('');
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductTarget) return;

    const qty = Number(restockQty);
    if (!qty || qty <= 0) {
      alert('Please enter a valid restock quantity greater than 0.');
      return;
    }

    const newCost = restockNewCost ? Number(restockNewCost) : undefined;
    const res = restockProduct(restockProductTarget.id, qty, newCost, restockNote);

    if (res.success) {
      setIsRestockModalOpen(false);
      refreshProducts();
    } else {
      alert(res.message || 'Failed to restock.');
    }
  };

  const handleOpenHistory = (p: Product) => {
    setHistoryTargetProduct(p);
    const movements = getProductMovements(p.id);
    setProductMovements(movements);
    setIsHistoryDrawerOpen(true);
  };

  const handleToggleArchive = (p: Product) => {
    if (p.isArchived) {
      unarchiveProduct(p.id);
    } else {
      const confirmArchive = window.confirm(
        `Archive "${p.name}"? Previous financial records remain intact.`
      );
      if (!confirmArchive) return;
      archiveProduct(p.id);
    }
    refreshProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-4">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <span>{t.productInventory}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {products.filter((p) => !p.isArchived).length} {t.itemsCount}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.productSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportProductsCsv(products)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export products to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.csv}</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchProductsPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'low', 'out', 'archived'] as const).map((filterKey) => {
              const labels = {
                all: t.filterAllActive,
                low: t.filterLowStock,
                out: t.filterOutOfStock,
                archived: t.filterArchived,
              };
              const isSelected = stockFilter === filterKey;
              return (
                <button
                  key={filterKey}
                  onClick={() => setStockFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labels[filterKey]}
                </button>
              );
            })}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">{t.categoryLabel}:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">{t.allCategories}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{t.noProductsFound}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((p) => {
            const isLow = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
            const isOut = p.stockQuantity <= 0;
            const profitMargin =
              p.sellingPrice > 0
                ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100)
                : 0;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-4 border transition hover:shadow-xs relative flex flex-col justify-between ${
                  p.isArchived
                    ? 'border-slate-200 opacity-60 bg-slate-50'
                    : isOut
                    ? 'border-rose-200 bg-rose-50/20'
                    : isLow
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top product row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5 leading-snug">
                        {p.name}
                      </h3>
                      {p.sku && (
                        <p className="text-[11px] text-slate-400 mt-0.5">SKU: {p.sku}</p>
                      )}
                    </div>

                    {/* Stock status indicator */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm sm:text-base font-bold font-tabular ${
                          isOut
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatQuantity(p.stockQuantity, p.allowDecimal)} {t.itemsLeft}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {t.minAlert}: {p.lowStockThreshold}
                      </span>
                    </div>
                  </div>

                  {/* Financial breakdown */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">{t.sellingPrice}</span>
                      <span className="font-bold text-slate-900 font-tabular text-sm">
                        {formatUGX(p.sellingPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">{t.costPrice}</span>
                      <span className="font-semibold text-slate-600 font-tabular text-sm">
                        {formatUGX(p.costPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      {t.estProfitUnit}: <strong className="text-emerald-700 font-tabular">{formatUGX(p.sellingPrice - p.costPrice)}</strong>
                    </span>
                    <span className="font-semibold text-slate-600">{profitMargin}% {t.marginLabel}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenHistory(p)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title={t.stockAuditLog}
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                      title={t.editProduct}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(p)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                      title={p.isArchived ? t.restoreProduct : t.archiveProduct}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenRestock(p)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg transition"
                  >
                    + {t.restockBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingProduct ? t.editProduct : t.addProduct}
              </h2>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t.productNamePlaceholder}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.categoryLabel}
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder={t.categoryPlaceholder}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.skuLabel}
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. SUG-001"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.costPrice} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="Purchase price in UGX"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.sellingPrice} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Customer price in UGX"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.stockQty} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={formAllowDecimal ? '0.1' : '1'}
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="Quantity in stock"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.lowStockThreshold}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.supplierLabel}
                </label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="e.g. Kakira Sugar Ltd"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="decimalCheck"
                  checked={formAllowDecimal}
                  onChange={(e) => setFormAllowDecimal(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="decimalCheck" className="text-xs text-slate-600 cursor-pointer">
                  {t.allowDecimals}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition"
                >
                  {editingProduct ? t.saveChangesBtn : t.createProductBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {isRestockModalOpen && restockProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.restockProductTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{restockProductTarget.name}</p>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="mt-4 space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between">
                <span className="text-slate-500">{t.currentStockLabel}:</span>
                <strong className="text-slate-900 font-tabular">
                  {formatQuantity(restockProductTarget.stockQuantity, restockProductTarget.allowDecimal)} {t.itemsLeft}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.qtyToAdd} *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step={restockProductTarget.allowDecimal ? '0.1' : '1'}
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.purchaseUnitCost}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={restockNewCost}
                  onChange={(e) => setRestockNewCost(e.target.value)}
                  placeholder="Unit cost in UGX"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {t.purchaseCostNote}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.restockNote}
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="e.g. Delivery from wholesaler"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition"
                >
                  {t.confirmRestockBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Movement History Drawer */}
      {isHistoryDrawerOpen && historyTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-700" />
                  <span>{t.stockAuditLog}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{historyTargetProduct.name}</p>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2.5 flex-1 pr-1">
              {productMovements.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  {t.noMovementsYet}
                </div>
              ) : (
                productMovements.map((mov) => {
                  const isPositive = mov.quantityChange > 0;
                  return (
                    <div
                      key={mov.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold font-tabular text-sm ${
                              isPositive ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+${mov.quantityChange}` : mov.quantityChange} units
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                            {mov.type}
                          </span>
                        </div>
                        {mov.note && <p className="text-[11px] text-slate-600 mt-0.5">{mov.note}</p>}
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {t.stockBeforeAfter}: {mov.quantityBefore} → {mov.quantityAfter}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 shrink-0">
                        {formatDateTime(mov.timestamp)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right shrink-0">
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
