import { Product, Sale, Customer, Expense } from '../types';
import { formatDateTime } from './formatters';

function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProductsCsv(products: Product[]) {
  const headers = ['Product ID', 'Name', 'SKU', 'Category', 'Cost Price (UGX)', 'Selling Price (UGX)', 'Stock Qty', 'Low Stock Alert', 'Supplier', 'Status'];
  const rows = products.map((p) => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    p.sku || '',
    `"${p.category.replace(/"/g, '""')}"`,
    p.costPrice,
    p.sellingPrice,
    p.stockQuantity,
    p.lowStockThreshold,
    `"${(p.supplier || '').replace(/"/g, '""')}"`,
    p.isArchived ? 'Archived' : 'Active',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`DukaSmart_Products_${dateStr}.csv`, csv);
}

export function exportSalesCsv(sales: Sale[]) {
  const headers = ['Sale Number', 'Date', 'Customer', 'Items Count', 'Subtotal (UGX)', 'Discount (UGX)', 'Total (UGX)', 'Paid (UGX)', 'Debt (UGX)', 'Status', 'Payment Methods'];
  const rows = sales.map((s) => [
    s.saleNumber,
    `"${formatDateTime(s.timestamp)}"`,
    `"${(s.customerName || 'Cash Sale').replace(/"/g, '""')}"`,
    s.items.reduce((acc, i) => acc + i.quantity, 0),
    s.subtotal,
    s.discount,
    s.totalAmount,
    s.amountPaid,
    s.outstandingBalance,
    s.paymentStatus,
    `"${s.paymentSplits.map((p) => `${p.method}: ${p.amount}`).join('; ')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`DukaSmart_Sales_Report_${dateStr}.csv`, csv);
}

export function exportCustomersCsv(customers: Customer[]) {
  const headers = ['Customer Name', 'Phone', 'Outstanding Debt (UGX)', 'Credit Limit (UGX)', 'Notes', 'Created At'];
  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    c.phone || '',
    c.outstandingBalance,
    c.creditLimit || 'No limit',
    `"${(c.notes || '').replace(/"/g, '""')}"`,
    `"${formatDateTime(c.createdAt)}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`DukaSmart_Customer_Debts_${dateStr}.csv`, csv);
}

export function exportExpensesCsv(expenses: Expense[]) {
  const headers = ['Date', 'Category', 'Description', 'Amount (UGX)', 'Payment Method', 'Notes'];
  const rows = expenses.map((e) => [
    `"${formatDateTime(e.timestamp)}"`,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount,
    e.paymentMethod,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`DukaSmart_Expenses_${dateStr}.csv`, csv);
}
