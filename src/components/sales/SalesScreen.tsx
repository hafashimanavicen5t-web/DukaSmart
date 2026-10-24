import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Receipt,
  Share2,
  Printer,
  X,
  AlertCircle,
  Ban,
  User,
  CreditCard,
  Coins,
  Smartphone,
  Download,
} from 'lucide-react';
import {
  getAllProducts,
  getAllCustomers,
  getAllSales,
  processSale,
  voidSale,
  saveCustomer,
} from '../../db/storage';
import { Product, Sale, Customer, PaymentSplit } from '../../types';
import { formatUGX, formatQuantity, formatDateTime, formatDateShort } from '../../utils/formatters';
import { exportSalesCsv } from '../../utils/csvExport';
import { useLanguage } from '../../i18n/LanguageContext';

interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
}

interface SalesScreenProps {
  selectedSaleFromDashboard?: Sale | null;
  onClearSelectedSale?: () => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  selectedSaleFromDashboard,
  onClearSelectedSale,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'checkout' | 'history'>('checkout');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discountAmount, setDiscountAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  // Payment Options
  const [primaryPaymentMode, setPrimaryPaymentMode] = useState<
    'CASH' | 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CREDIT' | 'SPLIT'
  >('CASH');

  // Split payment state
  const [splitCash, setSplitCash] = useState('');
  const [splitMomo, setSplitMomo] = useState('');
  const [splitAirtel, setSplitAirtel] = useState('');
  const [splitCredit, setSplitCredit] = useState('');

  // Modals
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [saleToVoid, setSaleToVoid] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState('');

  // Quick Customer Creation
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [quickCustName, setQuickCustName] = useState('');
  const [quickCustPhone, setQuickCustPhone] = useState('');

  const [checkoutError, setCheckoutError] = useState('');

  const refreshData = () => {
    setProducts(getAllProducts(false));
    setCustomers(getAllCustomers());
    setSales(getAllSales());
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedSaleFromDashboard) {
      setActiveReceiptSale(selectedSaleFromDashboard);
      setActiveTab('history');
      if (onClearSelectedSale) onClearSelectedSale();
    }
  }, [selectedSaleFromDashboard]);

  // Cart calculations
  const subtotal = cart.reduce((acc, item) => {
    const price = item.customPrice !== undefined ? item.customPrice : item.product.sellingPrice;
    return acc + Math.round(item.quantity * price);
  }, 0);

  const discount = Math.min(subtotal, Math.max(0, Math.round(Number(discountAmount) || 0)));
  const totalAmount = Math.max(0, subtotal - discount);

  // Cart management
  const addToCart = (product: Product) => {
    setCheckoutError('');
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setCheckoutError(`Cannot add more than ${product.stockQuantity} in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stockQuantity <= 0) {
          setCheckoutError(`"${product.name}" is out of stock.`);
          return prev;
        }
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateCartQty = (productId: string, newQty: number) => {
    setCheckoutError('');
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find((i) => i.product.id === productId);
    if (item && newQty > item.product.stockQuantity) {
      setCheckoutError(`Only ${item.product.stockQuantity} units available.`);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount('');
    setSelectedCustomerId('');
    setSaleNotes('');
    setPrimaryPaymentMode('CASH');
    setSplitCash('');
    setSplitMomo('');
    setSplitAirtel('');
    setSplitCredit('');
    setCheckoutError('');
  };

  const handleQuickCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustName.trim()) return;
    const res = saveCustomer({
      name: quickCustName.trim(),
      phone: quickCustPhone.trim() || undefined,
    });
    if (res.success && res.customer) {
      refreshData();
      setSelectedCustomerId(res.customer.id);
      setIsQuickCustomerOpen(false);
      setQuickCustName('');
      setQuickCustPhone('');
    }
  };

  const handleProcessCheckout = () => {
    setCheckoutError('');
    if (cart.length === 0) {
      setCheckoutError(t.cartEmpty);
      return;
    }

    const splits: PaymentSplit[] = [];

    if (primaryPaymentMode === 'CASH') {
      splits.push({ method: 'CASH', amount: totalAmount });
    } else if (primaryPaymentMode === 'MTN_MOMO') {
      splits.push({ method: 'MTN_MOMO', amount: totalAmount });
    } else if (primaryPaymentMode === 'AIRTEL_MONEY') {
      splits.push({ method: 'AIRTEL_MONEY', amount: totalAmount });
    } else if (primaryPaymentMode === 'CREDIT') {
      splits.push({ method: 'CREDIT', amount: totalAmount });
    } else if (primaryPaymentMode === 'SPLIT') {
      const cashAmt = Math.round(Number(splitCash) || 0);
      const momoAmt = Math.round(Number(splitMomo) || 0);
      const airtelAmt = Math.round(Number(splitAirtel) || 0);
      const creditAmt = Math.round(Number(splitCredit) || 0);

      const splitTotal = cashAmt + momoAmt + airtelAmt + creditAmt;
      if (splitTotal !== totalAmount) {
        setCheckoutError(
          `${t.splitTotalLabel} (${formatUGX(splitTotal)}) must match sale total (${formatUGX(totalAmount)}).`
        );
        return;
      }

      if (cashAmt > 0) splits.push({ method: 'CASH', amount: cashAmt });
      if (momoAmt > 0) splits.push({ method: 'MTN_MOMO', amount: momoAmt });
      if (airtelAmt > 0) splits.push({ method: 'AIRTEL_MONEY', amount: airtelAmt });
      if (creditAmt > 0) splits.push({ method: 'CREDIT', amount: creditAmt });
    }

    const hasCredit = splits.some((s) => s.method === 'CREDIT');
    if (hasCredit && !selectedCustomerId) {
      setCheckoutError('Credit sales require selecting or registering a customer name.');
      return;
    }

    const itemsInput = cart.map((c) => ({
      productId: c.product.id,
      quantity: c.quantity,
      customPrice: c.customPrice,
    }));

    const result = processSale({
      items: itemsInput,
      discount,
      paymentSplits: splits,
      customerId: selectedCustomerId || undefined,
      notes: saleNotes.trim() || undefined,
    });

    if (!result.success) {
      setCheckoutError(result.message || 'Checkout failed.');
      return;
    }

    refreshData();
    clearCart();
    if (result.sale) {
      setActiveReceiptSale(result.sale);
    }
  };

  const handleOpenVoid = (sale: Sale) => {
    setSaleToVoid(sale);
    setVoidReason('');
    setVoidError('');
    setIsVoidModalOpen(true);
  };

  const handleConfirmVoid = () => {
    if (!saleToVoid) return;
    if (!voidReason.trim()) {
      setVoidError(t.voidReasonLabel);
      return;
    }

    const res = voidSale(saleToVoid.id, voidReason);
    if (!res.success) {
      setVoidError(res.message || 'Failed to void sale.');
      return;
    }

    setIsVoidModalOpen(false);
    setSaleToVoid(null);
    refreshData();
    if (activeReceiptSale?.id === saleToVoid.id) {
      setActiveReceiptSale(null);
    }
  };

  const handleShareReceipt = (sale: Sale) => {
    const textLines = [
      `*${sale.saleNumber} — DukaSmart UG*`,
      `Date: ${formatDateTime(sale.timestamp)}`,
      sale.customerName ? `Customer: ${sale.customerName}` : '',
      `------------------------`,
      ...sale.items.map((i) => `${i.quantity}x ${i.productName}: ${formatUGX(i.lineTotal)}`),
      `------------------------`,
      `Subtotal: ${formatUGX(sale.subtotal)}`,
      sale.discount > 0 ? `Discount: -${formatUGX(sale.discount)}` : '',
      `*Total: ${formatUGX(sale.totalAmount)}*`,
      `Amount Paid: ${formatUGX(sale.amountPaid)}`,
      sale.outstandingBalance > 0 ? `*Remaining Debt: ${formatUGX(sale.outstandingBalance)}*` : '',
      `Status: ${sale.paymentStatus}`,
      `\n${t.thankYouMessage}`,
    ].filter(Boolean);

    const shareText = textLines.join('\n');

    if (navigator.share) {
      navigator
        .share({
          title: `Receipt ${sale.saleNumber}`,
          text: shareText,
        })
        .catch(() => {});
    } else {
      const encoded = encodeURIComponent(shareText);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category || 'General')));

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-4">
      {/* Top Segmented Controls */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'checkout'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.newSaleRegisterTab} {cart.length > 0 && `(${cart.length})`}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'history'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.transactionsHistoryTab} ({sales.length})
          </button>
        </div>

        {activeTab === 'history' && (
          <button
            onClick={() => exportSalesCsv(sales)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export sales to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>
        )}
      </div>

      {activeTab === 'checkout' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column (7 cols): Product catalog search & quick add */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={t.searchProductsPlaceholder}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.allCategories}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedCategory === c
                          ? 'bg-emerald-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product POS Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[68vh] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const inCart = cart.find((i) => i.product.id === p.id);
                const isOutOfStock = p.stockQuantity <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition relative active:scale-95 min-h-[96px] ${
                      isOutOfStock
                        ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                        : inCart
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-emerald-700 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-tabular">
                        {inCart.quantity}
                      </span>
                    )}

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                        {p.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {formatQuantity(p.stockQuantity, p.allowDecimal)} {t.itemsLeft}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-emerald-800 font-tabular">
                        {formatUGX(p.sellingPrice)}
                      </span>
                      {!isOutOfStock && (
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                          +
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column (5 cols): Checkout Register Cart */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-md p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">{t.currentCart}</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  {t.clearCart}
                </button>
              )}
            </div>

            {checkoutError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">{t.cartEmptyHelp}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-slate-900 truncate">{item.product.name}</h4>
                      <span className="text-[11px] text-slate-500 font-tabular">
                        {formatUGX(item.customPrice || item.product.sellingPrice)} {t.eachLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-slate-900 font-tabular text-xs">
                          {formatQuantity(item.quantity, item.product.allowDecimal)}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 font-tabular w-20 text-right">
                        {formatUGX(
                          Math.round(
                            item.quantity * (item.customPrice || item.product.sellingPrice)
                          )
                        )}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Discount & Customer */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t.discountLabel} (UGX)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-tabular focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      {t.tabCustomers}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsQuickCustomerOpen(true)}
                      className="text-[10px] text-emerald-700 hover:underline font-semibold"
                    >
                      {t.quickAddCustomer}
                    </button>
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">{t.walkInCustomer}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.outstandingBalance > 0 ? `(${t.debtBadge}: ${formatUGX(c.outstandingBalance)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Methods Choice */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[11px]">
                  {(
                    [
                      { id: 'CASH', label: t.methodCash, icon: Coins },
                      { id: 'MTN_MOMO', label: t.methodMomo, icon: Smartphone },
                      { id: 'AIRTEL_MONEY', label: t.methodAirtel, icon: Smartphone },
                      { id: 'CREDIT', label: t.methodCredit, icon: User },
                      { id: 'SPLIT', label: t.methodSplit, icon: CreditCard },
                    ] as const
                  ).map((m) => {
                    const isSelected = primaryPaymentMode === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPrimaryPaymentMode(m.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Split payment sub-form */}
              {primaryPaymentMode === 'SPLIT' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
                  <span className="font-bold text-amber-900 block">
                    {t.splitTotalLabel}: {formatUGX(totalAmount)}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-medium">{t.methodCash} (UGX)</label>
                      <input
                        type="number"
                        min="0"
                        value={splitCash}
                        onChange={(e) => setSplitCash(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-medium">MTN MoMo (UGX)</label>
                      <input
                        type="number"
                        min="0"
                        value={splitMomo}
                        onChange={(e) => setSplitMomo(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-medium">Airtel Money (UGX)</label>
                      <input
                        type="number"
                        min="0"
                        value={splitAirtel}
                        onChange={(e) => setSplitAirtel(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-medium">{t.methodCredit} (UGX)</label>
                      <input
                        type="number"
                        min="0"
                        value={splitCredit}
                        onChange={(e) => setSplitCredit(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-tabular"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Totals & Checkout Button */}
              <div className="pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{t.subtotalLabel}</span>
                  <span className="font-tabular">{formatUGX(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>{t.discountLabel}</span>
                    <span className="font-tabular">-{formatUGX(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>{t.totalAmountLabel}</span>
                  <span className="text-emerald-800 font-tabular">{formatUGX(totalAmount)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleProcessCheckout}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                  cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>{t.completeSaleBtn} ({formatUGX(totalAmount)})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TRANSACTIONS HISTORY VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">{t.completedSalesTitle}</h2>
            <span className="text-xs text-slate-500">{sales.length} transactions</span>
          </div>

          {sales.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">{t.noSalesYet}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    sale.isVoided
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-emerald-200 hover:shadow-xs'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-tabular text-sm">
                        {sale.saleNumber}
                      </span>
                      {sale.isVoided ? (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                          {t.voidedBadge.toUpperCase()}
                        </span>
                      ) : sale.paymentStatus === 'PAID' ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {t.paidBadge.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          {t.debtBadge}: {formatUGX(sale.outstandingBalance)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {sale.customerName ? <strong>{sale.customerName} · </strong> : ''}
                      {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </p>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{formatDateTime(sale.timestamp)}</span>
                    </div>

                    {sale.isVoided && sale.voidReason && (
                      <p className="text-[11px] text-rose-700 mt-1 italic">
                        {sale.voidReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right pr-2">
                      <span className="text-sm font-bold text-slate-900 font-tabular block">
                        {formatUGX(sale.totalAmount)}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveReceiptSale(sale)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      title={t.saleReceiptTitle}
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {!sale.isVoided && (
                      <button
                        onClick={() => handleOpenVoid(sale)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition"
                        title={t.voidSaleTitle}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {activeReceiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {t.saleReceiptTitle}
              </span>
              <button
                onClick={() => setActiveReceiptSale(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">DukaSmart UG Store</h3>
              <p className="text-xs text-slate-500 font-tabular font-bold mt-0.5">
                {activeReceiptSale.saleNumber}
              </p>
              <p className="text-[11px] text-slate-400">{formatDateTime(activeReceiptSale.timestamp)}</p>
              {activeReceiptSale.customerName && (
                <p className="text-xs font-semibold text-emerald-800 mt-1">
                  Customer: {activeReceiptSale.customerName}
                </p>
              )}
            </div>

            {/* Line items */}
            <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
              {activeReceiptSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-slate-800 block truncate">
                      {item.productName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-tabular">
                      {item.quantity} x {formatUGX(item.unitPrice)}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 font-tabular">
                    {formatUGX(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t.subtotalLabel}</span>
                <span className="font-tabular">{formatUGX(activeReceiptSale.subtotal)}</span>
              </div>
              {activeReceiptSale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>{t.discountLabel}</span>
                  <span className="font-tabular">-{formatUGX(activeReceiptSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>{t.totalAmountLabel}</span>
                <span className="font-tabular">{formatUGX(activeReceiptSale.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paid</span>
                <span className="font-tabular">{formatUGX(activeReceiptSale.amountPaid)}</span>
              </div>
              {activeReceiptSale.outstandingBalance > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>{t.outstandingDebt}</span>
                  <span className="font-tabular">{formatUGX(activeReceiptSale.outstandingBalance)}</span>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-500 italic pt-1">
              {t.thankYouMessage}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleShareReceipt(activeReceiptSale)}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareReceiptBtn}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Sale Modal */}
      {isVoidModalOpen && saleToVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-rose-700 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                <span>{t.voidSaleTitle}</span>
              </h3>
              <button
                onClick={() => setIsVoidModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {voidError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {voidError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.voidReasonLabel} *
              </label>
              <input
                type="text"
                required
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Wrong quantity entered, customer returned goods"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                {t.confirmVoidBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Customer Creation Modal */}
      {isQuickCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t.addCustomerBtn}</h3>
              <button
                onClick={() => setIsQuickCustomerOpen(false)}
                className="p-1 rounded-full text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.quickCustName} *
                </label>
                <input
                  type="text"
                  required
                  value={quickCustName}
                  onChange={(e) => setQuickCustName(e.target.value)}
                  placeholder="e.g. Mama Sarah, Kato Ronald"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.quickCustPhone}
                </label>
                <input
                  type="tel"
                  value={quickCustPhone}
                  onChange={(e) => setQuickCustPhone(e.target.value)}
                  placeholder="e.g. +256 700 000 000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-xl"
                >
                  {t.saveAndSelect}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
