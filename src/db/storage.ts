import {
  Product,
  InventoryMovement,
  Sale,
  Customer,
  CustomerPayment,
  Expense,
  BusinessProfile,
  FinancialSummary,
  PaymentSplit,
} from '../types';
import { generateSaleNumber } from '../utils/formatters';

const STORAGE_KEYS = {
  PRODUCTS: 'dukasmart_products_v1',
  MOVEMENTS: 'dukasmart_movements_v1',
  SALES: 'dukasmart_sales_v1',
  CUSTOMERS: 'dukasmart_customers_v1',
  CUSTOMER_PAYMENTS: 'dukasmart_customer_payments_v1',
  EXPENSES: 'dukasmart_expenses_v1',
  PROFILE: 'dukasmart_profile_v1',
  SALE_SEQUENCE: 'dukasmart_sale_seq_v1',
  DEMO_FLAG: 'dukasmart_is_demo_v1',
};

// Event bus for reactive UI updates
const DB_CHANGE_EVENT = 'dukasmart_db_changed';

export function notifyDbChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT));
  }
}

export function subscribeDbChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(DB_CHANGE_EVENT, callback);
  return () => window.removeEventListener(DB_CHANGE_EVENT, callback);
}

// Low-level safe storage access
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// -------------------------------------------------------------
// Initial Default Business Profile
// -------------------------------------------------------------
export const DEFAULT_PROFILE: BusinessProfile = {
  businessName: 'St. Jude General Duka & Grocery',
  ownerName: 'Kato Ronald',
  phone: '+256 772 458 920',
  address: 'Kalerwe Market, Gayaza Rd, Kampala',
  currency: 'UGX',
  allowNegativeStock: false,
  receiptFooterMessage: 'Webale nnyo kukungula naffe! (Thank you for shopping with us)',
};

export function getBusinessProfile(): BusinessProfile {
  return getItem<BusinessProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  setItem(STORAGE_KEYS.PROFILE, profile);
  notifyDbChange();
}

// -------------------------------------------------------------
// Products
// -------------------------------------------------------------
export function getAllProducts(includeArchived: boolean = false): Product[] {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (includeArchived) return products;
  return products.filter((p) => !p.isArchived);
}

export function getProductById(id: string): Product | undefined {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  return products.find((p) => p.id === id);
}

export function saveProduct(productInput: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'> & { id?: string }): { success: boolean; message?: string; product?: Product } {
  // Validate
  if (!productInput.name.trim()) {
    return { success: false, message: 'Product name cannot be empty.' };
  }
  if (productInput.sellingPrice < 0 || productInput.costPrice < 0) {
    return { success: false, message: 'Prices must be zero or positive.' };
  }
  if (productInput.sellingPrice < productInput.costPrice) {
    // Warning but allowable or alert
  }
  if (productInput.stockQuantity < 0) {
    return { success: false, message: 'Initial stock quantity cannot be negative.' };
  }

  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const now = new Date().toISOString();

  if (productInput.id) {
    // Update existing product
    const index = products.findIndex((p) => p.id === productInput.id);
    if (index === -1) {
      return { success: false, message: 'Product not found.' };
    }

    const existing = products[index];
    const stockDiff = productInput.stockQuantity - existing.stockQuantity;

    const updatedProduct: Product = {
      ...existing,
      ...productInput,
      id: existing.id,
      isArchived: existing.isArchived,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    products[index] = updatedProduct;
    setItem(STORAGE_KEYS.PRODUCTS, products);

    // If stock quantity was adjusted manually in edit, record inventory movement
    if (stockDiff !== 0) {
      recordInventoryMovement({
        productId: existing.id,
        productName: existing.name,
        type: 'CORRECTION',
        quantityChange: stockDiff,
        quantityBefore: existing.stockQuantity,
        quantityAfter: productInput.stockQuantity,
        note: `Manual stock adjustment from ${existing.stockQuantity} to ${productInput.stockQuantity}`,
      });
    }

    notifyDbChange();
    return { success: true, product: updatedProduct };
  } else {
    // Create new product
    const newId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newProduct: Product = {
      id: newId,
      name: productInput.name.trim(),
      sku: productInput.sku?.trim() || undefined,
      category: productInput.category || 'General',
      costPrice: Math.round(productInput.costPrice),
      sellingPrice: Math.round(productInput.sellingPrice),
      stockQuantity: productInput.stockQuantity,
      lowStockThreshold: productInput.lowStockThreshold || 5,
      allowDecimal: Boolean(productInput.allowDecimal),
      supplier: productInput.supplier?.trim() || undefined,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    products.unshift(newProduct);
    setItem(STORAGE_KEYS.PRODUCTS, products);

    if (newProduct.stockQuantity > 0) {
      recordInventoryMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'INITIAL',
        quantityChange: newProduct.stockQuantity,
        quantityBefore: 0,
        quantityAfter: newProduct.stockQuantity,
        note: 'Initial opening stock',
      });
    }

    notifyDbChange();
    return { success: true, product: newProduct };
  }
}

export function restockProduct(productId: string, quantityToAdd: number, newCostPrice?: number, note?: string): { success: boolean; message?: string } {
  if (quantityToAdd <= 0) {
    return { success: false, message: 'Restock quantity must be greater than zero.' };
  }

  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return { success: false, message: 'Product not found.' };
  }

  const qtyBefore = product.stockQuantity;
  const qtyAfter = qtyBefore + quantityToAdd;
  product.stockQuantity = qtyAfter;
  product.updatedAt = new Date().toISOString();

  if (newCostPrice !== undefined && newCostPrice >= 0) {
    product.costPrice = Math.round(newCostPrice);
  }

  setItem(STORAGE_KEYS.PRODUCTS, products);

  recordInventoryMovement({
    productId: product.id,
    productName: product.name,
    type: 'RESTOCK',
    quantityChange: quantityToAdd,
    quantityBefore: qtyBefore,
    quantityAfter: qtyAfter,
    note: note || `Restocked ${quantityToAdd} units`,
  });

  notifyDbChange();
  return { success: true };
}

export function archiveProduct(productId: string): { success: boolean; message?: string } {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return { success: false, message: 'Product not found.' };
  }

  product.isArchived = true;
  product.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.PRODUCTS, products);
  notifyDbChange();
  return { success: true };
}

export function unarchiveProduct(productId: string): { success: boolean; message?: string } {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return { success: false, message: 'Product not found.' };
  }

  product.isArchived = false;
  product.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.PRODUCTS, products);
  notifyDbChange();
  return { success: true };
}

// -------------------------------------------------------------
// Inventory Movements
// -------------------------------------------------------------
export function getAllMovements(limit: number = 200): InventoryMovement[] {
  const movements = getItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
  return movements.slice(0, limit);
}

export function getProductMovements(productId: string): InventoryMovement[] {
  const movements = getItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
  return movements.filter((m) => m.productId === productId);
}

function recordInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'timestamp'>): void {
  const movements = getItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
  const record: InventoryMovement = {
    ...movement,
    id: 'mov_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
  };
  movements.unshift(record);
  setItem(STORAGE_KEYS.MOVEMENTS, movements);
}

// -------------------------------------------------------------
// Sales & Atomic Checkout
// -------------------------------------------------------------
export function getAllSales(): Sale[] {
  return getItem<Sale[]>(STORAGE_KEYS.SALES, []);
}

export function getSaleById(id: string): Sale | undefined {
  const sales = getAllSales();
  return sales.find((s) => s.id === id);
}

export interface CheckoutInput {
  items: {
    productId: string;
    quantity: number;
    customPrice?: number;
  }[];
  discount: number;
  paymentSplits: PaymentSplit[];
  customerId?: string;
  notes?: string;
}

export function processSale(input: CheckoutInput): { success: boolean; message?: string; sale?: Sale } {
  if (!input.items || input.items.length === 0) {
    return { success: false, message: 'No items in cart to checkout.' };
  }

  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const profile = getBusinessProfile();
  const allowNegative = profile.allowNegativeStock;

  // 1. Validate all items and stock
  const saleItems: Sale['items'] = [];
  let subtotal = 0;

  for (const item of input.items) {
    if (item.quantity <= 0) {
      return { success: false, message: 'Item quantity must be greater than zero.' };
    }

    const prod = products.find((p) => p.id === item.productId);
    if (!prod) {
      return { success: false, message: `Product ${item.productId} was not found.` };
    }

    if (!allowNegative && prod.stockQuantity < item.quantity) {
      return {
        success: false,
        message: `Insufficient stock for "${prod.name}". Available: ${prod.stockQuantity}, requested: ${item.quantity}.`,
      };
    }

    const unitPrice = item.customPrice !== undefined ? Math.round(item.customPrice) : prod.sellingPrice;
    const unitCost = prod.costPrice;
    const lineTotal = Math.round(item.quantity * unitPrice);

    subtotal += lineTotal;
    saleItems.push({
      productId: prod.id,
      productName: prod.name,
      quantity: item.quantity,
      unitCost,
      unitPrice,
      lineTotal,
    });
  }

  const discount = Math.max(0, Math.round(input.discount || 0));
  if (discount > subtotal) {
    return { success: false, message: 'Discount cannot be greater than the sale subtotal.' };
  }

  const totalAmount = subtotal - discount;

  // 2. Validate Payment Splits
  const totalPaid = input.paymentSplits.reduce((acc, split) => acc + (split.amount || 0), 0);
  const outstandingBalance = Math.max(0, totalAmount - totalPaid);

  let paymentStatus: Sale['paymentStatus'] = 'PAID';
  if (outstandingBalance > 0) {
    if (totalPaid === 0) {
      paymentStatus = 'UNPAID';
    } else {
      paymentStatus = 'PARTIAL';
    }

    // A sale with credit/debt MUST have an associated customer!
    if (!input.customerId) {
      return {
        success: false,
        message: `Credit sale of ${formatUGXNumber(outstandingBalance)} requires selecting or registering a customer.`,
      };
    }
  }

  // Find customer if provided
  const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  let customer: Customer | undefined;
  if (input.customerId) {
    customer = customers.find((c) => c.id === input.customerId);
    if (!customer) {
      return { success: false, message: 'Selected customer not found.' };
    }
  }

  // 3. Atomically deduct inventory
  for (const item of saleItems) {
    const prod = products.find((p) => p.id === item.productId)!;
    const qtyBefore = prod.stockQuantity;
    const qtyAfter = qtyBefore - item.quantity;
    prod.stockQuantity = qtyAfter;
    prod.updatedAt = new Date().toISOString();

    recordInventoryMovement({
      productId: prod.id,
      productName: prod.name,
      type: 'SALE',
      quantityChange: -item.quantity,
      quantityBefore: qtyBefore,
      quantityAfter: qtyAfter,
      note: `Sold in receipt`,
    });
  }
  setItem(STORAGE_KEYS.PRODUCTS, products);

  // 4. Update customer outstanding balance if credit was used
  if (customer && outstandingBalance > 0) {
    customer.outstandingBalance = Math.round(customer.outstandingBalance + outstandingBalance);
    customer.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // 5. Generate receipt number & save Sale
  const currentSeq = getItem<number>(STORAGE_KEYS.SALE_SEQUENCE, 100);
  const nextSeq = currentSeq + 1;
  setItem(STORAGE_KEYS.SALE_SEQUENCE, nextSeq);

  const saleId = 'sale_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newSale: Sale = {
    id: saleId,
    saleNumber: generateSaleNumber(nextSeq),
    timestamp: new Date().toISOString(),
    items: saleItems,
    subtotal,
    discount,
    totalAmount,
    amountPaid: totalPaid,
    outstandingBalance,
    paymentStatus,
    paymentSplits: input.paymentSplits,
    customerId: customer?.id,
    customerName: customer?.name,
    notes: input.notes?.trim() || undefined,
    isVoided: false,
  };

  const sales = getAllSales();
  sales.unshift(newSale);
  setItem(STORAGE_KEYS.SALES, sales);

  notifyDbChange();
  return { success: true, sale: newSale };
}

/**
 * Void/Reverse a completed sale safely (prevents double counting, restores stock, reverses credit)
 */
export function voidSale(saleId: string, reason: string): { success: boolean; message?: string } {
  if (!reason.trim()) {
    return { success: false, message: 'Please provide a reason for cancelling this sale.' };
  }

  const sales = getAllSales();
  const sale = sales.find((s) => s.id === saleId);
  if (!sale) {
    return { success: false, message: 'Sale not found.' };
  }
  if (sale.isVoided) {
    return { success: false, message: 'Sale is already voided.' };
  }

  // 1. Mark sale as voided
  sale.isVoided = true;
  sale.voidReason = reason.trim();
  sale.paymentStatus = 'VOIDED';

  // 2. Restore inventory atomically
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  for (const item of sale.items) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      const qtyBefore = prod.stockQuantity;
      const qtyAfter = qtyBefore + item.quantity;
      prod.stockQuantity = qtyAfter;
      prod.updatedAt = new Date().toISOString();

      recordInventoryMovement({
        productId: prod.id,
        productName: prod.name,
        type: 'RETURN',
        quantityChange: item.quantity,
        quantityBefore: qtyBefore,
        quantityAfter: qtyAfter,
        referenceId: sale.id,
        note: `Restocked from voided sale ${sale.saleNumber}: ${reason}`,
      });
    }
  }
  setItem(STORAGE_KEYS.PRODUCTS, products);

  // 3. Reverse customer credit balance if any
  if (sale.customerId && sale.outstandingBalance > 0) {
    const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const customer = customers.find((c) => c.id === sale.customerId);
    if (customer) {
      customer.outstandingBalance = Math.max(0, customer.outstandingBalance - sale.outstandingBalance);
      customer.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
    }
  }

  setItem(STORAGE_KEYS.SALES, sales);
  notifyDbChange();
  return { success: true };
}

// -------------------------------------------------------------
// Customers & Debt Management
// -------------------------------------------------------------
export function getAllCustomers(): Customer[] {
  return getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
}

export function getCustomerById(id: string): Customer | undefined {
  const customers = getAllCustomers();
  return customers.find((c) => c.id === id);
}

export function saveCustomer(input: {
  id?: string;
  name: string;
  phone?: string;
  creditLimit?: number;
  notes?: string;
}): { success: boolean; message?: string; customer?: Customer } {
  if (!input.name.trim()) {
    return { success: false, message: 'Customer name is required.' };
  }

  const customers = getAllCustomers();
  const now = new Date().toISOString();

  if (input.id) {
    const index = customers.findIndex((c) => c.id === input.id);
    if (index === -1) return { success: false, message: 'Customer not found.' };

    customers[index] = {
      ...customers[index],
      name: input.name.trim(),
      phone: input.phone?.trim() || undefined,
      creditLimit: input.creditLimit !== undefined ? Math.round(input.creditLimit) : undefined,
      notes: input.notes?.trim() || undefined,
      updatedAt: now,
    };
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
    notifyDbChange();
    return { success: true, customer: customers[index] };
  } else {
    const newCustomer: Customer = {
      id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: input.name.trim(),
      phone: input.phone?.trim() || undefined,
      outstandingBalance: 0,
      creditLimit: input.creditLimit ? Math.round(input.creditLimit) : undefined,
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    customers.unshift(newCustomer);
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
    notifyDbChange();
    return { success: true, customer: newCustomer };
  }
}

export function recordCustomerPayment(input: {
  customerId: string;
  amount: number;
  paymentMethod: PaymentSplit['method'];
  notes?: string;
}): { success: boolean; message?: string; payment?: CustomerPayment } {
  const amount = Math.round(Number(input.amount) || 0);
  if (amount <= 0) {
    return { success: false, message: 'Payment amount must be greater than zero.' };
  }

  const customers = getAllCustomers();
  const customer = customers.find((c) => c.id === input.customerId);
  if (!customer) {
    return { success: false, message: 'Customer not found.' };
  }

  if (amount > customer.outstandingBalance) {
    return {
      success: false,
      message: `Repayment amount (${formatUGXNumber(amount)}) cannot exceed outstanding debt of ${formatUGXNumber(customer.outstandingBalance)}.`,
    };
  }

  // Atomically reduce customer balance
  customer.outstandingBalance = Math.round(customer.outstandingBalance - amount);
  customer.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.CUSTOMERS, customers);

  // Record payment log
  const payments = getItem<CustomerPayment[]>(STORAGE_KEYS.CUSTOMER_PAYMENTS, []);
  const newPayment: CustomerPayment = {
    id: 'cpay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    customerId: customer.id,
    customerName: customer.name,
    amount,
    paymentMethod: input.paymentMethod,
    notes: input.notes?.trim() || undefined,
    timestamp: new Date().toISOString(),
  };

  payments.unshift(newPayment);
  setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, payments);

  notifyDbChange();
  return { success: true, payment: newPayment };
}

export function getCustomerPayments(customerId?: string): CustomerPayment[] {
  const payments = getItem<CustomerPayment[]>(STORAGE_KEYS.CUSTOMER_PAYMENTS, []);
  if (customerId) {
    return payments.filter((p) => p.customerId === customerId);
  }
  return payments;
}

export function getCustomerSales(customerId: string): Sale[] {
  const sales = getAllSales();
  return sales.filter((s) => s.customerId === customerId);
}

// -------------------------------------------------------------
// Expenses
// -------------------------------------------------------------
export function getAllExpenses(): Expense[] {
  return getItem<Expense[]>(STORAGE_KEYS.EXPENSES, []);
}

export function saveExpense(input: {
  id?: string;
  description: string;
  category: Expense['category'];
  amount: number;
  paymentMethod: PaymentSplit['method'];
  notes?: string;
}): { success: boolean; message?: string; expense?: Expense } {
  if (!input.description.trim()) {
    return { success: false, message: 'Expense description is required.' };
  }
  const amount = Math.round(Number(input.amount) || 0);
  if (amount <= 0) {
    return { success: false, message: 'Expense amount must be greater than zero.' };
  }

  const expenses = getAllExpenses();

  if (input.id) {
    const index = expenses.findIndex((e) => e.id === input.id);
    if (index === -1) return { success: false, message: 'Expense not found.' };

    expenses[index] = {
      ...expenses[index],
      description: input.description.trim(),
      category: input.category,
      amount,
      paymentMethod: input.paymentMethod,
      notes: input.notes?.trim() || undefined,
    };
    setItem(STORAGE_KEYS.EXPENSES, expenses);
    notifyDbChange();
    return { success: true, expense: expenses[index] };
  } else {
    const newExpense: Expense = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      description: input.description.trim(),
      category: input.category,
      amount,
      paymentMethod: input.paymentMethod,
      notes: input.notes?.trim() || undefined,
      timestamp: new Date().toISOString(),
    };
    expenses.unshift(newExpense);
    setItem(STORAGE_KEYS.EXPENSES, expenses);
    notifyDbChange();
    return { success: true, expense: newExpense };
  }
}

export function deleteExpense(expenseId: string): { success: boolean } {
  let expenses = getAllExpenses();
  expenses = expenses.filter((e) => e.id !== expenseId);
  setItem(STORAGE_KEYS.EXPENSES, expenses);
  notifyDbChange();
  return { success: true };
}

// -------------------------------------------------------------
// Financial Calculations Engine & Filtering
// -------------------------------------------------------------
export type TimeFilterPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'all';

function isWithinPeriod(isoString: string, period: TimeFilterPeriod): boolean {
  if (period === 'all') return true;
  const date = new Date(isoString);
  const now = new Date();

  if (period === 'today') {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  if (period === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  if (period === 'week') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    return date >= sevenDaysAgo && date <= now;
  }

  if (period === 'month') {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  return true;
}

export function calculateFinancialSummary(period: TimeFilterPeriod = 'today'): FinancialSummary {
  const sales = getAllSales();
  const expenses = getAllExpenses();
  const customerPayments = getItem<CustomerPayment[]>(STORAGE_KEYS.CUSTOMER_PAYMENTS, []);
  const customers = getAllCustomers();
  const products = getAllProducts();

  // Filter sales for period that are NOT voided
  const filteredSales = sales.filter((s) => !s.isVoided && isWithinPeriod(s.timestamp, period));
  const filteredExpenses = expenses.filter((e) => isWithinPeriod(e.timestamp, period));
  const filteredRepayments = customerPayments.filter((p) => isWithinPeriod(p.timestamp, period));

  let grossSales = 0;
  let discounts = 0;
  let netSales = 0;
  let costOfGoodsSold = 0;
  let cashCollected = 0;
  let mobileMoneyCollected = 0;
  let creditSalesGenerated = 0;

  for (const sale of filteredSales) {
    grossSales += sale.subtotal;
    discounts += sale.discount;
    netSales += sale.totalAmount;

    // COGS based on unitCost at time of sale
    for (const item of sale.items) {
      costOfGoodsSold += Math.round(item.quantity * item.unitCost);
    }

    // Payment methods
    for (const split of sale.paymentSplits) {
      if (split.method === 'CASH') {
        cashCollected += split.amount;
      } else if (split.method === 'MTN_MOMO' || split.method === 'AIRTEL_MONEY') {
        mobileMoneyCollected += split.amount;
      } else if (split.method === 'CREDIT') {
        creditSalesGenerated += split.amount;
      }
    }
  }

  // Add customer repayments collected in this period
  for (const rep of filteredRepayments) {
    if (rep.paymentMethod === 'CASH') {
      cashCollected += rep.amount;
    } else if (rep.paymentMethod === 'MTN_MOMO' || rep.paymentMethod === 'AIRTEL_MONEY') {
      mobileMoneyCollected += rep.amount;
    }
  }

  const grossProfit = Math.round(netSales - costOfGoodsSold);
  const operatingExpenses = Math.round(filteredExpenses.reduce((acc, e) => acc + e.amount, 0));
  const netOperatingProfit = Math.round(grossProfit - operatingExpenses);

  // Total outstanding customer debt (current total balance across all customers)
  const creditOutstanding = Math.round(customers.reduce((acc, c) => acc + c.outstandingBalance, 0));

  // Inventory valuation & low stock count
  let inventoryValuation = 0;
  let lowStockCount = 0;
  for (const prod of products) {
    inventoryValuation += Math.round(prod.stockQuantity * prod.costPrice);
    if (prod.stockQuantity <= prod.lowStockThreshold) {
      lowStockCount++;
    }
  }

  return {
    grossSales: Math.round(grossSales),
    discounts: Math.round(discounts),
    netSales: Math.round(netSales),
    costOfGoodsSold: Math.round(costOfGoodsSold),
    grossProfit,
    operatingExpenses,
    netOperatingProfit,
    cashCollected: Math.round(cashCollected),
    mobileMoneyCollected: Math.round(mobileMoneyCollected),
    creditOutstanding,
    totalProducts: products.length,
    lowStockCount,
    inventoryValuation,
  };
}

function formatUGXNumber(num: number): string {
  return `UGX ${Math.round(num).toLocaleString('en-UG')}`;
}

// -------------------------------------------------------------
// Sample Data & Demo Mode (Required by Prompt)
// -------------------------------------------------------------
export function seedSampleDemoData(): void {
  const now = new Date();
  const todayISO = now.toISOString();

  // Create demo products requested in prompt:
  // Sugar 1kg: cost UGX 3,500, selling price UGX 4,000, stock 20.
  // Rice 1kg: cost UGX 3,000, selling price UGX 3,500, stock 15.
  // Cooking oil 1 litre: cost UGX 6,000, selling price UGX 7,000, stock 10.
  // Plus popular Ugandan retail kiosk staples:
  const demoProducts: Product[] = [
    {
      id: 'prod_sugar_1kg',
      name: 'Sugar (Kakira) 1kg',
      sku: 'SUG-001',
      category: 'Groceries',
      costPrice: 3500,
      sellingPrice: 4000,
      stockQuantity: 20,
      lowStockThreshold: 5,
      allowDecimal: false,
      supplier: 'Kakira Sugar Ltd',
      isArchived: false,
      createdAt: todayISO,
      updatedAt: todayISO,
    },
    {
      id: 'prod_rice_1kg',
      name: 'Super Rice 1kg',
      sku: 'RIC-002',
      category: 'Groceries',
      costPrice: 3000,
      sellingPrice: 3500,
      stockQuantity: 15,
      lowStockThreshold: 4,
      allowDecimal: false,
      supplier: 'Tororo Grain Millers',
      isArchived: false,
      createdAt: todayISO,
      updatedAt: todayISO,
    },
    {
      id: 'prod_oil_1l',
      name: 'Fortune Cooking Oil 1 Litre',
      sku: 'OIL-003',
      category: 'Edible Oils',
      costPrice: 6000,
      sellingPrice: 7000,
      stockQuantity: 10,
      lowStockThreshold: 3,
      allowDecimal: false,
      supplier: 'Bidco Uganda',
      isArchived: false,
      createdAt: todayISO,
      updatedAt: todayISO,
    },
    {
      id: 'prod_soap_bar',
      name: 'White Star Laundry Soap Bar',
      sku: 'SOP-004',
      category: 'Household',
      costPrice: 4500,
      sellingPrice: 5200,
      stockQuantity: 18,
      lowStockThreshold: 6,
      allowDecimal: false,
      supplier: 'Mukwano Industries',
      isArchived: false,
      createdAt: todayISO,
      updatedAt: todayISO,
    },
    {
      id: 'prod_salt_500g',
      name: 'Habari Iodized Salt 500g',
      sku: 'SLT-005',
      category: 'Groceries',
      costPrice: 1000,
      sellingPrice: 1300,
      stockQuantity: 3, // Low stock on purpose for testing warning
      lowStockThreshold: 5,
      allowDecimal: false,
      supplier: 'Kapa Salt Dist.',
      isArchived: false,
      createdAt: todayISO,
      updatedAt: todayISO,
    },
    {
      id: 'prod_posho_5kg',
      name: 'High Quality Maize Flour (Posho) 5kg',
      sku: 'PSH-006',
      category: 'Grains & Flours',
      costPrice: 11000,
      sellingPrice: 13500,
      stockQuantity: 8,
      lowStockThreshold: 4,
      allowDecimal: false,
      supplier: 'Bwaise Millers',
      isArchived: false,
      createdAt: todayISO,
      updatedAt: todayISO,
    },
  ];

  const demoCustomers: Customer[] = [
    {
      id: 'cust_mukasa',
      name: 'Mukasa James (Bodaboda Stage)',
      phone: '+256 702 334 112',
      outstandingBalance: 14000,
      creditLimit: 50000,
      notes: 'Pays every Friday afternoon',
      createdAt: todayISO,
      updatedAt: todayISO,
    },
    {
      id: 'cust_sarah',
      name: 'Mama Sarah (Salon Next Door)',
      phone: '+256 788 901 245',
      outstandingBalance: 8000,
      creditLimit: 30000,
      notes: 'Reliable neighbor customer',
      createdAt: todayISO,
      updatedAt: todayISO,
    },
  ];

  // Sample sales for today and yesterday to demonstrate dashboard and profit
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();

  const demoSales: Sale[] = [
    {
      id: 'sale_demo_101',
      saleNumber: 'DUKA-00101',
      timestamp: twoHoursAgo,
      items: [
        {
          productId: 'prod_sugar_1kg',
          productName: 'Sugar (Kakira) 1kg',
          quantity: 2,
          unitCost: 3500,
          unitPrice: 4000,
          lineTotal: 8000,
        },
        {
          productId: 'prod_oil_1l',
          productName: 'Fortune Cooking Oil 1 Litre',
          quantity: 1,
          unitCost: 6000,
          unitPrice: 7000,
          lineTotal: 7000,
        },
      ],
      subtotal: 15000,
      discount: 0,
      totalAmount: 15000,
      amountPaid: 15000,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      paymentSplits: [{ method: 'CASH', amount: 15000 }],
      notes: 'Walk-in customer',
      isVoided: false,
    },
    {
      id: 'sale_demo_102',
      saleNumber: 'DUKA-00102',
      timestamp: fourHoursAgo,
      items: [
        {
          productId: 'prod_rice_1kg',
          productName: 'Super Rice 1kg',
          quantity: 4,
          unitCost: 3000,
          unitPrice: 3500,
          lineTotal: 14000,
        },
      ],
      subtotal: 14000,
      discount: 0,
      totalAmount: 14000,
      amountPaid: 0,
      outstandingBalance: 14000,
      paymentStatus: 'UNPAID',
      paymentSplits: [{ method: 'CREDIT', amount: 14000 }],
      customerId: 'cust_mukasa',
      customerName: 'Mukasa James (Bodaboda Stage)',
      notes: 'Promised to clear on Friday',
      isVoided: false,
    },
    {
      id: 'sale_demo_103',
      saleNumber: 'DUKA-00103',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          productId: 'prod_posho_5kg',
          productName: 'High Quality Maize Flour (Posho) 5kg',
          quantity: 1,
          unitCost: 11000,
          unitPrice: 13500,
          lineTotal: 13500,
        },
      ],
      subtotal: 13500,
      discount: 500,
      totalAmount: 13000,
      amountPaid: 13000,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      paymentSplits: [{ method: 'MTN_MOMO', amount: 13000 }],
      notes: 'Paid via MoMo',
      isVoided: false,
    },
  ];

  const demoExpenses: Expense[] = [
    {
      id: 'exp_demo_1',
      description: 'Electricity Yaka token top-up',
      category: 'Electricity',
      amount: 15000,
      paymentMethod: 'AIRTEL_MONEY',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'exp_demo_2',
      description: 'Shop helper lunch and tea',
      category: 'Wages',
      amount: 5000,
      paymentMethod: 'CASH',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const demoMovements: InventoryMovement[] = [
    {
      id: 'mov_init_1',
      productId: 'prod_sugar_1kg',
      productName: 'Sugar (Kakira) 1kg',
      type: 'INITIAL',
      quantityChange: 22,
      quantityBefore: 0,
      quantityAfter: 22,
      note: 'Initial shop stock',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mov_sale_1',
      productId: 'prod_sugar_1kg',
      productName: 'Sugar (Kakira) 1kg',
      type: 'SALE',
      quantityChange: -2,
      quantityBefore: 22,
      quantityAfter: 20,
      note: 'Sold in DUKA-00101',
      timestamp: twoHoursAgo,
    },
  ];

  setItem(STORAGE_KEYS.PRODUCTS, demoProducts);
  setItem(STORAGE_KEYS.CUSTOMERS, demoCustomers);
  setItem(STORAGE_KEYS.SALES, demoSales);
  setItem(STORAGE_KEYS.EXPENSES, demoExpenses);
  setItem(STORAGE_KEYS.MOVEMENTS, demoMovements);
  setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, []);
  setItem(STORAGE_KEYS.SALE_SEQUENCE, 103);
  setItem(STORAGE_KEYS.DEMO_FLAG, true);

  notifyDbChange();
}

export function isDemoMode(): boolean {
  return getItem<boolean>(STORAGE_KEYS.DEMO_FLAG, false);
}

export function resetToEmptyState(): void {
  setItem(STORAGE_KEYS.PRODUCTS, []);
  setItem(STORAGE_KEYS.CUSTOMERS, []);
  setItem(STORAGE_KEYS.SALES, []);
  setItem(STORAGE_KEYS.EXPENSES, []);
  setItem(STORAGE_KEYS.MOVEMENTS, []);
  setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, []);
  setItem(STORAGE_KEYS.SALE_SEQUENCE, 100);
  setItem(STORAGE_KEYS.DEMO_FLAG, false);
  notifyDbChange();
}

// Check initial load: if completely empty, initialize with sample data so shopkeeper isn't faced with blank screens
export function ensureInitialData(): void {
  const products = getItem<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
  if (products === null) {
    seedSampleDemoData();
  }
}

// -------------------------------------------------------------
// Backup and Restore
// -------------------------------------------------------------
export function exportDatabaseJson(): string {
  const data = {
    dukasmart_version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    profile: getBusinessProfile(),
    products: getItem(STORAGE_KEYS.PRODUCTS, []),
    sales: getItem(STORAGE_KEYS.SALES, []),
    customers: getItem(STORAGE_KEYS.CUSTOMERS, []),
    customerPayments: getItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, []),
    expenses: getItem(STORAGE_KEYS.EXPENSES, []),
    movements: getItem(STORAGE_KEYS.MOVEMENTS, []),
    saleSequence: getItem(STORAGE_KEYS.SALE_SEQUENCE, 100),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseJson(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.products || !data.sales) {
      return { success: false, message: 'Invalid backup file structure.' };
    }

    if (data.profile) setItem(STORAGE_KEYS.PROFILE, data.profile);
    if (Array.isArray(data.products)) setItem(STORAGE_KEYS.PRODUCTS, data.products);
    if (Array.isArray(data.sales)) setItem(STORAGE_KEYS.SALES, data.sales);
    if (Array.isArray(data.customers)) setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
    if (Array.isArray(data.customerPayments)) setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, data.customerPayments);
    if (Array.isArray(data.expenses)) setItem(STORAGE_KEYS.EXPENSES, data.expenses);
    if (Array.isArray(data.movements)) setItem(STORAGE_KEYS.MOVEMENTS, data.movements);
    if (typeof data.saleSequence === 'number') setItem(STORAGE_KEYS.SALE_SEQUENCE, data.saleSequence);

    setItem(STORAGE_KEYS.DEMO_FLAG, false);
    notifyDbChange();
    return { success: true, message: 'Data backup restored successfully!' };
  } catch (err: unknown) {
    return { success: false, message: 'Failed to parse JSON file: ' + (err instanceof Error ? err.message : String(err)) };
  }
}
