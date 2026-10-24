export type PaymentMethodType = 'CASH' | 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CREDIT';

export interface PaymentSplit {
  method: PaymentMethodType;
  amount: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  costPrice: number; // in UGX integer
  sellingPrice: number; // in UGX integer
  stockQuantity: number;
  lowStockThreshold: number;
  allowDecimal: boolean;
  supplier?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InventoryMovementType = 'SALE' | 'RESTOCK' | 'CORRECTION' | 'RETURN' | 'INITIAL';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: InventoryMovementType;
  quantityChange: number; // positive for restock/return, negative for sale
  quantityBefore: number;
  quantityAfter: number;
  referenceId?: string; // saleId or restock receipt
  note?: string;
  timestamp: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number; // historical cost at sale time in UGX
  unitPrice: number; // selling price at sale time in UGX
  lineTotal: number; // quantity * unitPrice
}

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'VOIDED';

export interface Sale {
  id: string;
  saleNumber: string; // e.g. DUKA-00124
  timestamp: string;
  items: SaleItem[];
  subtotal: number;
  discount: number; // in UGX
  totalAmount: number; // subtotal - discount
  amountPaid: number;
  outstandingBalance: number;
  paymentStatus: PaymentStatus;
  paymentSplits: PaymentSplit[];
  customerId?: string;
  customerName?: string;
  notes?: string;
  isVoided?: boolean;
  voidReason?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  outstandingBalance: number; // in UGX
  creditLimit?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number; // in UGX
  paymentMethod: PaymentMethodType;
  notes?: string;
  referenceSaleId?: string;
  timestamp: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Transport'
  | 'Electricity'
  | 'Wages'
  | 'Packaging'
  | 'Repairs'
  | 'Licences'
  | 'Other';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number; // in UGX
  paymentMethod: PaymentMethodType;
  notes?: string;
  timestamp: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  currency: string; // default "UGX"
  allowNegativeStock: boolean;
  receiptFooterMessage: string;
}

export interface FinancialSummary {
  grossSales: number;
  discounts: number;
  netSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netOperatingProfit: number;
  cashCollected: number;
  mobileMoneyCollected: number;
  creditOutstanding: number;
  totalProducts: number;
  lowStockCount: number;
  inventoryValuation: number;
}
