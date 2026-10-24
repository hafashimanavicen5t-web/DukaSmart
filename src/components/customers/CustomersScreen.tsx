import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  FileText,
  Share2,
  Printer,
  X,
  Download,
} from 'lucide-react';
import {
  getAllCustomers,
  saveCustomer,
  recordCustomerPayment,
  getCustomerSales,
  getCustomerPayments,
} from '../../db/storage';
import { Customer, CustomerPayment, Sale, PaymentSplit } from '../../types';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import { exportCustomersCsv } from '../../utils/csvExport';
import { useLanguage } from '../../i18n/LanguageContext';

export const CustomersScreen: React.FC = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isRepaymentOpen, setIsRepaymentOpen] = useState(false);
  const [repaymentCustomer, setRepaymentCustomer] = useState<Customer | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentMethod, setRepaymentMethod] = useState<PaymentSplit['method']>('CASH');
  const [repaymentNotes, setRepaymentNotes] = useState('');
  const [repaymentError, setRepaymentError] = useState('');

  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [customerPaymentsList, setCustomerPaymentsList] = useState<CustomerPayment[]>([]);

  // Add/Edit Customer form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const refreshCustomers = () => {
    setCustomers(getAllCustomers());
  };

  useEffect(() => {
    refreshCustomers();
  }, []);

  const totalOutstanding = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormCreditLimit('');
    setFormNotes('');
    setFormError('');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phone || '');
    setFormCreditLimit(c.creditLimit ? String(c.creditLimit) : '');
    setFormNotes(c.notes || '');
    setFormError('');
    setIsAddEditOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Customer name is required.');
      return;
    }

    const limit = formCreditLimit ? Number(formCreditLimit) : undefined;
    const res = saveCustomer({
      id: editingCustomer?.id,
      name: formName.trim(),
      phone: formPhone.trim() || undefined,
      creditLimit: limit,
      notes: formNotes.trim() || undefined,
    });

    if (res.success) {
      setIsAddEditOpen(false);
      refreshCustomers();
    } else {
      setFormError(res.message || 'Failed to save customer.');
    }
  };

  const handleOpenRepayment = (c: Customer) => {
    setRepaymentCustomer(c);
    setRepaymentAmount(String(c.outstandingBalance));
    setRepaymentMethod('CASH');
    setRepaymentNotes('');
    setRepaymentError('');
    setIsRepaymentOpen(true);
  };

  const handleRecordRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentCustomer) return;
    setRepaymentError('');

    const amt = Math.round(Number(repaymentAmount) || 0);
    if (amt <= 0) {
      setRepaymentError('Repayment amount must be greater than zero.');
      return;
    }

    if (amt > repaymentCustomer.outstandingBalance) {
      setRepaymentError(
        `Repayment cannot exceed the customer's outstanding balance of ${formatUGX(
          repaymentCustomer.outstandingBalance
        )}.`
      );
      return;
    }

    const res = recordCustomerPayment({
      customerId: repaymentCustomer.id,
      amount: amt,
      paymentMethod: repaymentMethod,
      notes: repaymentNotes.trim() || undefined,
    });

    if (res.success) {
      setIsRepaymentOpen(false);
      refreshCustomers();
    } else {
      setRepaymentError(res.message || 'Failed to record repayment.');
    }
  };

  const handleOpenStatement = (c: Customer) => {
    setStatementCustomer(c);
    const sales = getCustomerSales(c.id);
    const payments = getCustomerPayments(c.id);
    setCustomerSales(sales);
    setCustomerPaymentsList(payments);
    setIsStatementOpen(true);
  };

  const handleShareStatement = (customer: Customer) => {
    const textLines = [
      `*DukaSmart UG — ${t.customerStatementTitle}*`,
      `Customer: *${customer.name}*`,
      customer.phone ? `Phone: ${customer.phone}` : '',
      `${t.outstandingDebt}: *${formatUGX(customer.outstandingBalance)}*`,
      `Date: ${new Date().toLocaleDateString('en-UG')}`,
      `---------------------------------`,
      `Please pass by the duka or clear via mobile money.`,
      `\n${t.thankYouMessage}`,
    ].filter(Boolean);

    const shareText = textLines.join('\n');

    if (navigator.share) {
      navigator.share({ title: `Statement - ${customer.name}`, text: shareText }).catch(() => {});
    } else {
      let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      if (customer.phone) {
        const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
        url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareText)}`;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-4">
      {/* Top Banner & Debt Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>{t.customerLedgerTitle}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.customerLedgerDesc}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportCustomersCsv(customers)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export Customer Debts to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.csv}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addCustomerBtn}</span>
            </button>
          </div>
        </div>

        {/* Total Outstanding Card */}
        <div className="bg-amber-500 text-emerald-950 p-4 rounded-2xl border border-amber-600 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-950/80">
            {t.totalOwedToDuka}
          </span>
          <div className="text-xl sm:text-2xl font-black font-tabular mt-1">
            {formatUGX(totalOutstanding)}
          </div>
          <span className="text-[11px] font-medium text-amber-950/70 mt-1">
            {t.acrossDebtors} ({customers.filter((c) => c.outstandingBalance > 0).length})
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCustomersPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{t.noCustomersFound}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCustomers.map((c) => {
            const hasDebt = c.outstandingBalance > 0;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl p-4 border flex flex-col justify-between transition hover:shadow-xs ${
                  hasDebt ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">{c.name}</h3>
                      {c.phone ? (
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">No phone</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        {t.outstandingDebt}
                      </span>
                      <span
                        className={`text-base font-bold font-tabular ${
                          hasDebt ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {formatUGX(c.outstandingBalance)}
                      </span>
                    </div>
                  </div>

                  {c.creditLimit && (
                    <div className="mt-2 text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-100">
                      <span>{t.creditLimitLabel}:</span>
                      <strong className="font-tabular text-slate-700">{formatUGX(c.creditLimit)}</strong>
                    </div>
                  )}

                  {c.notes && (
                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                {/* Customer card actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenStatement(c)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                      title={t.viewStatementBtn}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShareStatement(c)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                      title={t.shareStatementBtn}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1"
                    >
                      {t.edit}
                    </button>
                  </div>

                  {hasDebt && (
                    <button
                      onClick={() => handleOpenRepayment(c)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                    >
                      {t.payDebtBtn}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Repayment Modal */}
      {isRepaymentOpen && repaymentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t.repaymentModalTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{repaymentCustomer.name}</p>
              </div>
              <button
                onClick={() => setIsRepaymentOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center text-xs">
              <span className="font-medium text-amber-950">{t.outstandingDebt}:</span>
              <strong className="text-amber-900 font-tabular text-sm">
                {formatUGX(repaymentCustomer.outstandingBalance)}
              </strong>
            </div>

            {repaymentError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {repaymentError}
              </div>
            )}

            <form onSubmit={handleRecordRepayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.repaymentAmount} *
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'MTN_MOMO', 'AIRTEL_MONEY'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setRepaymentMethod(method)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        repaymentMethod === method
                          ? 'bg-emerald-800 text-white border-emerald-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method === 'CASH'
                        ? t.methodCash
                        : method === 'MTN_MOMO'
                        ? t.methodMomo
                        : t.methodAirtel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.restockNote}
                </label>
                <input
                  type="text"
                  value={repaymentNotes}
                  onChange={(e) => setRepaymentNotes(e.target.value)}
                  placeholder="e.g. Paid part of debt"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRepaymentOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  {t.confirmRepaymentBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Statement Drawer */}
      {isStatementOpen && statementCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t.customerStatementTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {statementCustomer.name} · {statementCustomer.phone || 'No phone'}
                </p>
              </div>
              <button
                onClick={() => setIsStatementOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Debt Header */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center text-xs shrink-0">
              <span className="font-bold text-amber-950">{t.outstandingDebt}:</span>
              <strong className="text-amber-900 font-tabular text-base">
                {formatUGX(statementCustomer.outstandingBalance)}
              </strong>
            </div>

            {/* Transaction Ledger */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t.creditSalesAndRepayments}
              </h4>

              {customerSales.length === 0 && customerPaymentsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t.noCustomerRecords}
                </div>
              ) : (
                <>
                  {customerSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-tabular">
                            {sale.saleNumber}
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                            {t.methodCredit}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {formatDateTime(sale.timestamp)}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-rose-600 font-tabular block">
                          +{formatUGX(sale.totalAmount)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Paid: {formatUGX(sale.amountPaid)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {customerPaymentsList.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-900">{t.payDebtBtn}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                            {payment.paymentMethod}
                          </span>
                        </div>
                        {payment.notes && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{payment.notes}</p>
                        )}
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {formatDateTime(payment.timestamp)}
                        </span>
                      </div>
                      <div className="text-right shrink-0 font-bold text-emerald-700 font-tabular">
                        -{formatUGX(payment.amount)}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => handleShareStatement(statementCustomer)}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareStatementBtn}</span>
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

      {/* Add / Edit Customer Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingCustomer ? t.editCustomerBtn : t.addCustomerBtn}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mukasa James, Sarah Namubiru"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +256 772 123 456"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.creditLimitLabel} (UGX)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formCreditLimit}
                  onChange={(e) => setFormCreditLimit(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Address
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Bodaboda rider, neighbor"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
