import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Wallet,
  Download,
} from 'lucide-react';
import {
  getAllExpenses,
  saveExpense,
  deleteExpense,
} from '../../db/storage';
import { Expense, ExpenseCategory, PaymentSplit } from '../../types';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import { exportExpensesCsv } from '../../utils/csvExport';
import { useLanguage } from '../../i18n/LanguageContext';

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpensesModal: React.FC<ExpensesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentSplit['method']>('CASH');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const refreshExpenses = () => {
    setExpenses(getAllExpenses());
  };

  useEffect(() => {
    if (isOpen) {
      refreshExpenses();
      setIsFormOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    Rent: t.catRent,
    Transport: t.catTransport,
    Electricity: t.catElectricity,
    Wages: t.catWages,
    Packaging: t.catPackaging,
    Repairs: t.catRepairs,
    Licences: t.catLicences,
    Other: t.catOther,
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setDescription('');
    setCategory('Electricity');
    setAmount('');
    setPaymentMethod('CASH');
    setNotes('');
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setDescription(exp.description);
    setCategory(exp.category);
    setAmount(String(exp.amount));
    setPaymentMethod(exp.paymentMethod);
    setNotes(exp.notes || '');
    setError('');
    setIsFormOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError(t.expenseDescLabel);
      return;
    }

    const parsedAmount = Math.round(Number(amount) || 0);
    if (parsedAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    const res = saveExpense({
      id: editingExpense?.id,
      description: description.trim(),
      category,
      amount: parsedAmount,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      setIsFormOpen(false);
      refreshExpenses();
    } else {
      setError(res.message || 'Failed to save expense.');
    }
  };

  const handleDeleteExpense = (expId: string) => {
    if (window.confirm('Delete this expense entry?')) {
      deleteExpense(expId);
      refreshExpenses();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[88vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.expensesTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.expensesSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExpensesCsv(expenses)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.csv}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Total Expense banner */}
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between text-xs shrink-0">
          <span className="font-semibold text-rose-900">{t.totalRecordedExpenses}:</span>
          <strong className="text-rose-700 font-tabular text-base font-bold">
            {formatUGX(totalExpenses)}
          </strong>
        </div>

        {/* Add/Edit Subform or List */}
        {isFormOpen ? (
          <form onSubmit={handleSaveExpense} className="space-y-3.5 overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-slate-800">
                {editingExpense ? t.edit : t.recordNewExpense}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-xs text-slate-500 hover:underline"
              >
                {t.cancel}
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.expenseDescLabel} *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Yaka token, boda transport, lunch"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.categoryLabel} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600 focus:bg-white font-medium"
                >
                  {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {EXPENSE_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount (UGX) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-tabular focus:outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.paidViaLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CASH', 'MTN_MOMO', 'AIRTEL_MONEY'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                      paymentMethod === m
                        ? 'bg-rose-700 text-white border-rose-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m === 'CASH' ? t.methodCash : m === 'MTN_MOMO' ? t.methodMomo : t.methodAirtel}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.expenseReceiptRef}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Token number, receipt number"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-xs"
              >
                {t.save}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-700">{t.expensesTitle}</span>
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.recordNewExpense}</span>
              </button>
            </div>

            {expenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {t.noExpensesYet}
              </div>
            ) : (
              expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs hover:border-rose-200 transition"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{exp.description}</span>
                      <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                        {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                      </span>
                    </div>
                    {exp.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{exp.notes}</p>
                    )}
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {formatDateTime(exp.timestamp)} · {exp.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-rose-600 font-tabular text-sm">
                      {formatUGX(exp.amount)}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(exp)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
                      title={t.edit}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
