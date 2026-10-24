export type Language = 'en' | 'rw';

export interface Translations {
  // Common & Navigation
  appTitle: string;
  demoBadge: string;
  offlineReady: string;
  offlineSaved: string;
  installApp: string;
  androidApk: string;
  newSale: string;
  newSalePos: string;
  recordExpense: string;
  settings: string;
  cancel: string;
  save: string;
  close: string;
  edit: string;
  delete: string;
  done: string;
  confirm: string;
  csv: string;
  exportCsv: string;
  language: string;
  switchLanguage: string;
  english: string;
  kinyarwanda: string;

  // Tabs
  tabDashboard: string;
  tabProducts: string;
  tabSales: string;
  tabCustomers: string;
  tabReports: string;

  // Dashboard
  welcomeTitle: string;
  welcomeDesc: string;
  addFirstProduct: string;
  loadSampleData: string;
  filterToday: string;
  filterYesterday: string;
  filterWeek: string;
  filterMonth: string;
  filterAll: string;
  lowStockAlert: string;
  restockBtn: string;
  itemsLeft: string;
  totalSales: string;
  grossSalesLabel: string;
  discountLabel: string;
  grossProfit: string;
  cogsLabel: string;
  operatingExpenses: string;
  runningCostsLabel: string;
  netOperatingProfit: string;
  netProfitDesc: string;
  cashCollected: string;
  cashCollectedDesc: string;
  mobileMoneyCollected: string;
  mobileMoneyDesc: string;
  totalCustomerDebts: string;
  customerDebtsDesc: string;
  inventoryStatus: string;
  manageStock: string;
  activeProductsCount: string;
  stockValuationCost: string;
  recentSalesTitle: string;
  allSalesLink: string;
  noSalesYet: string;
  paidBadge: string;
  voidedBadge: string;
  debtBadge: string;

  // Products
  productInventory: string;
  itemsCount: string;
  productSubtitle: string;
  addProduct: string;
  editProduct: string;
  searchProductsPlaceholder: string;
  filterAllActive: string;
  filterLowStock: string;
  filterOutOfStock: string;
  filterArchived: string;
  categoryLabel: string;
  allCategories: string;
  noProductsFound: string;
  productName: string;
  productNamePlaceholder: string;
  categoryPlaceholder: string;
  skuLabel: string;
  costPrice: string;
  sellingPrice: string;
  stockQty: string;
  lowStockThreshold: string;
  supplierLabel: string;
  allowDecimals: string;
  createProductBtn: string;
  saveChangesBtn: string;
  restockProductTitle: string;
  currentStockLabel: string;
  qtyToAdd: string;
  purchaseUnitCost: string;
  purchaseCostNote: string;
  restockNote: string;
  confirmRestockBtn: string;
  stockAuditLog: string;
  noMovementsYet: string;
  stockBeforeAfter: string;
  minAlert: string;
  estProfitUnit: string;
  marginLabel: string;
  archiveProduct: string;
  restoreProduct: string;

  // Sales & POS
  newSaleRegisterTab: string;
  transactionsHistoryTab: string;
  currentCart: string;
  clearCart: string;
  cartEmpty: string;
  cartEmptyHelp: string;
  eachLabel: string;
  walkInCustomer: string;
  paymentMethod: string;
  methodCash: string;
  methodMomo: string;
  methodAirtel: string;
  methodCredit: string;
  methodSplit: string;
  splitTotalLabel: string;
  subtotalLabel: string;
  totalAmountLabel: string;
  completeSaleBtn: string;
  completedSalesTitle: string;
  saleReceiptTitle: string;
  shareReceiptBtn: string;
  printBtn: string;
  thankYouMessage: string;
  voidSaleTitle: string;
  voidReasonLabel: string;
  confirmVoidBtn: string;
  quickAddCustomer: string;
  quickCustName: string;
  quickCustPhone: string;
  saveAndSelect: string;

  // Customers & Debt
  customerLedgerTitle: string;
  customerLedgerDesc: string;
  totalOwedToDuka: string;
  acrossDebtors: string;
  searchCustomersPlaceholder: string;
  noCustomersFound: string;
  addCustomerBtn: string;
  editCustomerBtn: string;
  outstandingDebt: string;
  creditLimitLabel: string;
  payDebtBtn: string;
  viewStatementBtn: string;
  shareStatementBtn: string;
  repaymentModalTitle: string;
  repaymentAmount: string;
  confirmRepaymentBtn: string;
  customerStatementTitle: string;
  creditSalesAndRepayments: string;
  noCustomerRecords: string;

  // Expenses
  expensesTitle: string;
  expensesSubtitle: string;
  totalRecordedExpenses: string;
  recordNewExpense: string;
  expenseDescLabel: string;
  paidViaLabel: string;
  expenseReceiptRef: string;
  noExpensesYet: string;
  catRent: string;
  catTransport: string;
  catElectricity: string;
  catWages: string;
  catPackaging: string;
  catRepairs: string;
  catLicences: string;
  catOther: string;

  // Reports
  reportsTitle: string;
  reportsSubtitle: string;
  plSummary: string;
  plDesc: string;
  lessDiscounts: string;
  netSalesRevenue: string;
  lessCogs: string;
  lessExpenses: string;
  plDisclaimer: string;
  cashFlowChannels: string;
  physicalCashInHand: string;
  uncollectedDebts: string;
  topProductsTitle: string;
  topProductsDesc: string;
  inventoryCapitalValuation: string;
  totalPhysicalUnits: string;
  capitalInvested: string;
  expectedRetailValue: string;
  potentialProfit: string;
  expensesByCategory: string;

  // Settings
  settingsTitle: string;
  shopProfileSection: string;
  shopNameLabel: string;
  ownerNameLabel: string;
  phoneLabel: string;
  locationLabel: string;
  allowNegativeStockLabel: string;
  saveProfileBtn: string;
  profileSavedMsg: string;
  backupSectionTitle: string;
  backupSectionDesc: string;
  downloadBackupBtn: string;
  restoreBackupBtn: string;
  resetAllDataBtn: string;
  loadDemoDataBtn: string;
  selectLanguageTitle: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'DukaSmart UG',
    demoBadge: 'Demo',
    offlineReady: '100% Offline-Ready',
    offlineSaved: 'Offline (Saved Locally)',
    installApp: 'Install App',
    androidApk: 'Android APK',
    newSale: 'New Sale',
    newSalePos: 'New Sale POS',
    recordExpense: '+ Record Expense',
    settings: 'Settings & Backup',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    done: 'Done',
    confirm: 'Confirm',
    csv: 'CSV',
    exportCsv: 'Export CSV',
    language: 'Language',
    switchLanguage: 'Ururimi / Language',
    english: 'English',
    kinyarwanda: 'Ikinyarwanda',

    tabDashboard: 'Dashboard',
    tabProducts: 'Products',
    tabSales: 'Sales',
    tabCustomers: 'Customers',
    tabReports: 'Reports',

    welcomeTitle: 'Welcome to DukaSmart UG!',
    welcomeDesc:
      'Your offline-first store assistant for recording sales, tracking stock, managing customer debts, and computing profits in UGX.',
    addFirstProduct: 'Add Your First Product',
    loadSampleData: 'Load Sample Duka Store Data',
    filterToday: 'Today',
    filterYesterday: 'Yesterday',
    filterWeek: 'Last 7 Days',
    filterMonth: 'This Month',
    filterAll: 'All Time',
    lowStockAlert: 'Low Stock Alert',
    restockBtn: 'Restock',
    itemsLeft: 'left',
    totalSales: 'Total Sales',
    grossSalesLabel: 'Gross',
    discountLabel: 'Disc',
    grossProfit: 'Gross Profit',
    cogsLabel: 'COGS',
    operatingExpenses: 'Expenses',
    runningCostsLabel: 'Shop running costs',
    netOperatingProfit: 'Est. Net Profit',
    netProfitDesc: 'Gross profit minus expenses',
    cashCollected: 'Cash In Hand Collected',
    cashCollectedDesc: 'Excludes unpaid credit sales',
    mobileMoneyCollected: 'Mobile Money (MoMo / Airtel)',
    mobileMoneyDesc: 'Recorded digital receipts',
    totalCustomerDebts: 'Total Customer Debts (Madeni)',
    customerDebtsDesc: 'Click to view customer list →',
    inventoryStatus: 'Inventory Status',
    manageStock: 'Manage Stock',
    activeProductsCount: 'Active Products',
    stockValuationCost: 'Stock Valuation (at Cost)',
    recentSalesTitle: 'Recent Sales',
    allSalesLink: 'All Sales',
    noSalesYet: 'No sales recorded yet. Tap "New Sale POS" above to begin.',
    paidBadge: 'Paid',
    voidedBadge: 'Voided',
    debtBadge: 'Debt',

    productInventory: 'Product Inventory',
    itemsCount: 'items',
    productSubtitle: 'Manage unit prices, costs, stock levels and stock movement history.',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    searchProductsPlaceholder: 'Search products by name, SKU or barcode...',
    filterAllActive: 'All Active',
    filterLowStock: 'Low Stock Alert',
    filterOutOfStock: 'Out of Stock',
    filterArchived: 'Archived',
    categoryLabel: 'Category',
    allCategories: 'All Categories',
    noProductsFound: 'No products match your criteria',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g. Sugar 1kg, Cooking Oil 1L, Sunlight Soap',
    categoryPlaceholder: 'e.g. Groceries, Drinks, Toiletries',
    skuLabel: 'SKU / Barcode (Optional)',
    costPrice: 'Cost Price (UGX)',
    sellingPrice: 'Selling Price (UGX)',
    stockQty: 'Current Stock Quantity',
    lowStockThreshold: 'Low Stock Alert Level',
    supplierLabel: 'Supplier / Distributor (Optional)',
    allowDecimals: 'Allow decimal quantities (e.g. 1.5 kg, 0.75 litre)',
    createProductBtn: 'Create Product',
    saveChangesBtn: 'Save Changes',
    restockProductTitle: 'Restock Product',
    currentStockLabel: 'Current Stock',
    qtyToAdd: 'Quantity to Add',
    purchaseUnitCost: 'Purchase Unit Cost (UGX)',
    purchaseCostNote: 'Update this if the supplier changed their purchase price.',
    restockNote: 'Note / Invoice Ref (Optional)',
    confirmRestockBtn: 'Confirm Restock',
    stockAuditLog: 'Stock Movement Audit Log',
    noMovementsYet: 'No movement logs recorded yet for this product.',
    stockBeforeAfter: 'Stock before',
    minAlert: 'Min alert',
    estProfitUnit: 'Est. Profit',
    marginLabel: 'margin',
    archiveProduct: 'Archive Product',
    restoreProduct: 'Restore Product',

    newSaleRegisterTab: 'New Sale POS',
    transactionsHistoryTab: 'Transactions History',
    currentCart: 'Current Sale Cart',
    clearCart: 'Clear All',
    cartEmpty: 'No items in cart',
    cartEmptyHelp: 'Tap any product on the left to add it to this sale.',
    eachLabel: 'each',
    walkInCustomer: 'Walk-in (Cash Sale)',
    paymentMethod: 'Payment Method',
    methodCash: 'Cash',
    methodMomo: 'MTN MoMo',
    methodAirtel: 'Airtel Money',
    methodCredit: 'Credit (Debt)',
    methodSplit: 'Split Pay',
    splitTotalLabel: 'Split Payment Total',
    subtotalLabel: 'Subtotal',
    totalAmountLabel: 'Total Amount',
    completeSaleBtn: 'Complete Sale',
    completedSalesTitle: 'Completed Sales & History',
    saleReceiptTitle: 'Sale Receipt',
    shareReceiptBtn: 'Share Receipt',
    printBtn: 'Print',
    thankYouMessage: 'Webale nnyo kukungula naffe!',
    voidSaleTitle: 'Void / Reverse Sale',
    voidReasonLabel: 'Reason for cancellation',
    confirmVoidBtn: 'Confirm Void',
    quickAddCustomer: '+ New',
    quickCustName: 'Customer Name',
    quickCustPhone: 'Phone (Optional)',
    saveAndSelect: 'Save & Select',

    customerLedgerTitle: 'Customer Credit Ledger (Madeni)',
    customerLedgerDesc: 'Track goods taken on credit, record repayments, and share WhatsApp statements.',
    totalOwedToDuka: 'Total Money Owed to Duka',
    acrossDebtors: 'Across debtor customers',
    searchCustomersPlaceholder: 'Search customers by name or phone number...',
    noCustomersFound: 'No customers found',
    addCustomerBtn: 'Add Customer',
    editCustomerBtn: 'Edit Customer',
    outstandingDebt: 'Outstanding Debt',
    creditLimitLabel: 'Credit Limit',
    payDebtBtn: 'Pay Debt',
    viewStatementBtn: 'View Customer Statement',
    shareStatementBtn: 'Share Statement on WhatsApp',
    repaymentModalTitle: 'Record Customer Repayment',
    repaymentAmount: 'Repayment Amount (UGX)',
    confirmRepaymentBtn: 'Confirm Repayment',
    customerStatementTitle: 'Customer Statement & Ledger',
    creditSalesAndRepayments: 'Credit Sales & Repayments History',
    noCustomerRecords: 'No transaction records found for this customer.',

    expensesTitle: 'Operating Expenses Tracker',
    expensesSubtitle: 'Track overhead costs (Rent, Yaka, Transport, Lunch, Wages) in UGX.',
    totalRecordedExpenses: 'Total Recorded Expenses',
    recordNewExpense: 'Record New Expense',
    expenseDescLabel: 'Description / Purpose',
    paidViaLabel: 'Paid Via',
    expenseReceiptRef: 'Receipt / Supplier Note (Optional)',
    noExpensesYet: 'No expenses recorded yet. Tap "+ Add Expense" above to record one.',
    catRent: 'Rent',
    catTransport: 'Transport',
    catElectricity: 'Electricity',
    catWages: 'Wages',
    catPackaging: 'Packaging',
    catRepairs: 'Repairs',
    catLicences: 'Licences',
    catOther: 'Other',

    reportsTitle: 'Business Performance & Profit Reports',
    reportsSubtitle: 'Real calculations from stored sales, costs of goods sold, and operating expenses.',
    plSummary: 'Profit & Loss Summary',
    plDesc: 'Cost of goods sold (COGS) is recorded from unit costs at time of sale.',
    lessDiscounts: 'Less: Customer Discounts Allowed',
    netSalesRevenue: 'Net Sales Revenue',
    lessCogs: 'Less: Cost of Goods Sold (Historical Purchase Cost)',
    lessExpenses: 'Less: Operating Expenses (Rent, transport, wages, electricity)',
    plDisclaimer:
      'Note: Figures are calculated directly from your local duka records as operational estimates to guide your business decisions, not audited statutory accounts.',
    cashFlowChannels: 'Cash Flow & Collection Channels',
    physicalCashInHand: 'Physical Cash In Hand',
    uncollectedDebts: 'Uncollected Customer Debts',
    topProductsTitle: 'Top Fast-Moving Products',
    topProductsDesc: 'Ranked by revenue contribution to your duka.',
    inventoryCapitalValuation: 'Inventory Valuation & Tied Capital',
    totalPhysicalUnits: 'Total Physical Units',
    capitalInvested: 'Capital Invested (at Cost)',
    expectedRetailValue: 'Expected Retail Value',
    potentialProfit: 'Potential Gross Profit',
    expensesByCategory: 'Operating Expenses by Category',

    settingsTitle: 'DukaSmart UG Settings & Profile',
    shopProfileSection: 'Store & Receipt Information',
    shopNameLabel: 'Shop / Business Name',
    ownerNameLabel: 'Owner / Attendant Name',
    phoneLabel: 'Phone (for Receipts & WhatsApp)',
    locationLabel: 'Location / Street Address',
    allowNegativeStockLabel: 'Allow sales if stock is zero (Allow negative inventory override)',
    saveProfileBtn: 'Save Profile',
    profileSavedMsg: 'Profile saved!',
    backupSectionTitle: 'Offline Database Backup & Restore',
    backupSectionDesc:
      'Your business data is stored locally on this device. Create periodic JSON backups to secure your records or transfer to another phone.',
    downloadBackupBtn: 'Download JSON Backup',
    restoreBackupBtn: 'Restore Backup File',
    resetAllDataBtn: 'Reset All Records',
    loadDemoDataBtn: 'Load Sample Duka Data',
    selectLanguageTitle: 'Hitamo Ururimi / Select Language',
  },

  rw: {
    appTitle: 'DukaSmart UG',
    demoBadge: 'Icyitegererezo',
    offlineReady: 'Ikorana nta Murandasi (100% Offline)',
    offlineSaved: 'Biri kuri Telefoni (Offline)',
    installApp: 'Shyira kuri Telefoni',
    androidApk: 'Android APK',
    newSale: 'Kugurisha',
    newSalePos: 'Kugurisha Bishya (POS)',
    recordExpense: '+ Andika Ayasohotse',
    settings: 'Igenamiterere & Kopi',
    cancel: 'Kureka',
    save: 'Kubika',
    close: 'Funga',
    edit: 'Hindura',
    delete: 'Gusiba',
    done: 'Byarangiye',
    confirm: 'Emeza',
    csv: 'CSV',
    exportCsv: 'Sohora CSV',
    language: 'Ururimi',
    switchLanguage: 'Ururimi / Language',
    english: 'English',
    kinyarwanda: 'Ikinyarwanda',

    tabDashboard: 'Ahabanza',
    tabProducts: 'Ububiko',
    tabSales: 'Kugurisha',
    tabCustomers: 'Abakiriya',
    tabReports: 'Raporo',

    welcomeTitle: 'Murakaza neza kuri DukaSmart UG!',
    welcomeDesc:
      'Porogaramu ifasha abacuruzi gucunga ububiko, kwandika ibigurishijwe, gukurikirana imyenda y\'abakiriya, no kubara inyungu mu mafaranga ya UGX nta murandasi.',
    addFirstProduct: 'Ongeramo Igicuruzwa cya Mbere',
    loadSampleData: 'Koresha Amakuru y\'Icyitegererezo',
    filterToday: 'Uyu munsi',
    filterYesterday: 'Ejo hashize',
    filterWeek: 'Iminsi 7 ishize',
    filterMonth: 'Uku kwezi',
    filterAll: 'Igihe cyose',
    lowStockAlert: 'Ibicuruzwa biri gushira mu bubiko',
    restockBtn: 'Kongeramo',
    itemsLeft: 'bisigaye',
    totalSales: 'Ibyagurishijwe Byose',
    grossSalesLabel: 'Ibyaguzwe',
    discountLabel: 'Igaban.',
    grossProfit: 'Inyungu y\'Ibanze',
    cogsLabel: 'Ikiguzi (COGS)',
    operatingExpenses: 'Amafaranga Yasohotse',
    runningCostsLabel: 'Ayakoreshejwe mu bucuruzi',
    netOperatingProfit: 'Inyungu Nyayo (Igereranyije)',
    netProfitDesc: 'Inyungu ikuweho ayasohotse',
    cashCollected: 'Amafaranga mu Ntoki Yakiriwe',
    cashCollectedDesc: 'Hatabariwemo imyenda itarishyurwa',
    mobileMoneyCollected: 'Amafaranga ya MoMo / Airtel',
    mobileMoneyDesc: 'Ayishyuwe kuri telefone',
    totalCustomerDebts: 'Imyenda Yose y\'Abakiriya (Madeni)',
    customerDebtsDesc: 'Kanda hano urebe urutonde rw\'abakiriya →',
    inventoryStatus: 'Imiterere y\'Ububiko',
    manageStock: 'Cunga Ububiko',
    activeProductsCount: 'Ibicuruzwa Biriho',
    stockValuationCost: 'Agaciro k\'Ububiko (Ku kiguzi)',
    recentSalesTitle: 'Ibyagurishijwe vuba',
    allSalesLink: 'Ibyagurishijwe Byose',
    noSalesYet: 'Nta byagurishijwe birandikwa. Kanda "Kugurisha Bishya" hejuru utangire.',
    paidBadge: 'Yishyuwe',
    voidedBadge: 'Yasheshwe',
    debtBadge: 'Umwenda',

    productInventory: 'Ibicuruzwa n\'Ububiko',
    itemsCount: 'ubwoko',
    productSubtitle: 'Cunga ibiciro byo kurangura, ibyo kugurisha, ingano iri mu bubiko n\'amateka yabwo.',
    addProduct: 'Ongeramo Igicuruzwa',
    editProduct: 'Hindura Igicuruzwa',
    searchProductsPlaceholder: 'Shakisha ku izina, SKU cyangwa barcode...',
    filterAllActive: 'Byose Biriho',
    filterLowStock: 'Biri Gushira',
    filterOutOfStock: 'Byashize',
    filterArchived: 'Ibyabitswe (Archived)',
    categoryLabel: 'Icyiciro',
    allCategories: 'Ibyiciro Byose',
    noProductsFound: 'Nta gicuruzwa gihuye n\'ibyo mushakishije',
    productName: 'Izina ry\'Igicuruzwa',
    productNamePlaceholder: 'urugero: Isukari 1kg, Amavuta 1L, Isabune',
    categoryPlaceholder: 'urugero: Ibiribwa, Ibinyobwa, Isuku',
    skuLabel: 'SKU / Barcode (Niba ihari)',
    costPrice: 'Igiciro cyo Kurangura (UGX)',
    sellingPrice: 'Igiciro cyo Kugurisha (UGX)',
    stockQty: 'Ingano iri mu bubiko ubu',
    lowStockThreshold: 'Ingano yo gutanga umuburo (Low Stock Alert)',
    supplierLabel: 'Umurangurizaho (Supplier) (Niba ahari)',
    allowDecimals: 'Kwemerera imibare ifite ibice (urugero: 1.5 kg, 0.75 litre)',
    createProductBtn: 'Bika Igicuruzwa',
    saveChangesBtn: 'Bika Impinduka',
    restockProductTitle: 'Kongera Ububiko bw\'Igicuruzwa',
    currentStockLabel: 'Ingano iriho ubu',
    qtyToAdd: 'Ingano yiyongeraho',
    purchaseUnitCost: 'Igiciro cyo Kurangura gishya (UGX)',
    purchaseCostNote: 'Hindura hano niba umurangurizaho yahinduye igiciro.',
    restockNote: 'Icyitonderwa / Nimero ya fagitire (Niba ihari)',
    confirmRestockBtn: 'Emeza Kongeramo',
    stockAuditLog: 'Amateka y\'Ibyinjiye n\'Ibyasohotse',
    noMovementsYet: 'Nta makuru y\'ibyinjiye n\'ibyasohotse kuri iki gicuruzwa.',
    stockBeforeAfter: 'Ibyari bihari',
    minAlert: 'Umuburo kuri',
    estProfitUnit: 'Inyungu kuri buri kimwe',
    marginLabel: 'ijanisha ry\'inyungu',
    archiveProduct: 'Bika Igicuruzwa',
    restoreProduct: 'Garura Igicuruzwa',

    newSaleRegisterTab: 'Kugurisha Bishya',
    transactionsHistoryTab: 'Amateka y\'Ibyagurishijwe',
    currentCart: 'Ibyo Ugiye Kugurisha',
    clearCart: 'Kwegeranya Byose',
    cartEmpty: 'Nta gicuruzwa kirashyirwamo',
    cartEmptyHelp: 'Kanda ku gicuruzwa ibumoso kugira ngo ucyongere hano.',
    eachLabel: 'kuri kimwe',
    walkInCustomer: 'Umukiriya Ushize (Kwishyura Ako Kanya)',
    paymentMethod: 'Uburyo bwo Kwishyura',
    methodCash: 'Mu Ntoki (Cash)',
    methodMomo: 'MTN MoMo',
    methodAirtel: 'Airtel Money',
    methodCredit: 'Umwenda (Credit)',
    methodSplit: 'Kugabanya (Split)',
    splitTotalLabel: 'Amafaranga yose agomba kwishyurwa',
    subtotalLabel: 'Igiteranyo cy\'ibanze',
    totalAmountLabel: 'Amafaranga Yose Hamwe',
    completeSaleBtn: 'Emeza Kugurisha',
    completedSalesTitle: 'Ibyagurishijwe Byose',
    saleReceiptTitle: 'Inyemezabwishyu yo Kugurisha',
    shareReceiptBtn: 'Sangiza Inyemezabwishyu',
    printBtn: 'Gucapa',
    thankYouMessage: 'Murakoze cyane guhahira iwacu! (Webale nnyo)',
    voidSaleTitle: 'Gusesa / Guhagarika Kugurisha',
    voidReasonLabel: 'Impamvu yo kubisesa',
    confirmVoidBtn: 'Emeza Gusesa',
    quickAddCustomer: '+ Mushya',
    quickCustName: 'Izina ry\'Umukiriya',
    quickCustPhone: 'Telefone (Niba ihari)',
    saveAndSelect: 'Bika & Hitamo',

    customerLedgerTitle: 'Igitabo cy\'Imyenda y\'Abakiriya (Madeni)',
    customerLedgerDesc: 'Kurikirana ibyafashwe ku mwenda, kwandika ibyishyuwe, no kohereza inyandiko kuri WhatsApp.',
    totalOwedToDuka: 'Amafaranga Yose Iduka Riberewemo',
    acrossDebtors: 'Kuri ba bakiriya bose bafite imyenda',
    searchCustomersPlaceholder: 'Shakisha umukiriya ku izina cyangwa telefone...',
    noCustomersFound: 'Nta mukiriya ubonetse',
    addCustomerBtn: 'Ongeramo Umukiriya',
    editCustomerBtn: 'Hindura Umukiriya',
    outstandingDebt: 'Umwenda Asigaranye',
    creditLimitLabel: 'Umupaka w\'Umwenda',
    payDebtBtn: 'Ishyura Umwenda',
    viewStatementBtn: 'Reba Inyandiko y\'Umukiriya',
    shareStatementBtn: 'Ohereza Inyandiko kuri WhatsApp',
    repaymentModalTitle: 'Kwandika Amafaranga Umukiriya Yishyuye',
    repaymentAmount: 'Amafaranga Yishyuwe (UGX)',
    confirmRepaymentBtn: 'Emeza Kwakira Amafaranga',
    customerStatementTitle: 'Inyandiko n\'Amateka y\'Umukiriya',
    creditSalesAndRepayments: 'Ibyo yatwaye ku mwenda n\'ibyo yishyuye',
    noCustomerRecords: 'Nta mateka y\'uyu mukiriya araboneka.',

    expensesTitle: 'Gukurikirana Amafaranga Yasohotse',
    expensesSubtitle: 'Andika ibyakoreshejwe (Ubukode, Yaka, Ingendo, Ibiryo, Imishahara) muri UGX.',
    totalRecordedExpenses: 'Amafaranga Yose Yasohotse',
    recordNewExpense: 'Andika Ayasohotse Mashya',
    expenseDescLabel: 'Icyakoreshejwe / Impamvu',
    paidViaLabel: 'Yishyuwe Binyuze Muri',
    expenseReceiptRef: 'Nimero ya Fagitire / Icyitonderwa (Niba ihari)',
    noExpensesYet: 'Nta mafaranga yasohotse arandikwa. Kanda "+ Andika Ayasohotse" hejuru.',
    catRent: 'Ubukode (Rent)',
    catTransport: 'Ugutwara / Ingendo',
    catElectricity: 'Amashanyarazi (Yaka)',
    catWages: 'Imishahara / Ibihembo',
    catPackaging: 'Ibirambirwamo / Ibipfunyika',
    catRepairs: 'Gusana / Ibisabwa',
    catLicences: 'Uruhushya / Imisoro',
    catOther: 'Ibindi',

    reportsTitle: 'Raporo y\'Ubucuruzi n\'Inyungu',
    reportsSubtitle: 'Ibarwa nyakuri rivuye ku byagurishijwe, ikiguzi cyo kurangura, n\'amafaranga yasohotse.',
    plSummary: 'Incamake y\'Inyungu n\'Igihombo (P&L)',
    plDesc: 'Ikiguzi cy\'ibicuruzwa (COGS) kibarirwa ku kiguzi cyo kurangura igihe byagurishwaga.',
    lessDiscounts: 'Gukuraho: Igabanyirizwa ryahawe abakiriya',
    netSalesRevenue: 'Amafaranga Nyayo Yinjiye mu Kugurisha',
    lessCogs: 'Gukuraho: Ikiguzi cyo Kurangura (COGS)',
    lessExpenses: 'Gukuraho: Amafaranga Yakoreshejwe mu Bucuruzi (Expenses)',
    plDisclaimer:
      'Icyitonderwa: Iyi mibare ibarwa nka raporo yo kuyobora ubucuruzi bwawe bwa buri munsi hashingiwe ku makuru winjije mu iduka, si imisoro yemejwe n\'inzego za leta.',
    cashFlowChannels: 'Aho Amafaranga Anyura',
    physicalCashInHand: 'Amafaranga Yakiriwe mu Ntoki (Cash)',
    uncollectedDebts: 'Imyenda y\'Abakiriya Itarishyurwa',
    topProductsTitle: 'Ibicuruzwa Bigurishwa Cyane',
    topProductsDesc: 'Bikurikirana hashingiwe ku mafaranga byinjirije iduka.',
    inventoryCapitalValuation: 'Agaciro k\'Ibicuruzwa Biri mu Bubiko',
    totalPhysicalUnits: 'Ingano y\'Ibicuruzwa Byose Hamwe',
    capitalInvested: 'Imari Ishyizwe mu Bubiko (Ku kiguzi)',
    expectedRetailValue: 'Agaciro bishobora kugurishwaho',
    potentialProfit: 'Inyungu Itegerejwe mu Bubiko',
    expensesByCategory: 'Amafaranga Yasohotse ku Byiciro',

    settingsTitle: 'Igenamiterere rya DukaSmart UG',
    shopProfileSection: 'Ibyerekeye Iduka n\'Inyemezabwishyu',
    shopNameLabel: 'Izina ry\'Iduka / Ubucuruzi',
    ownerNameLabel: 'Izina rya Nyiraryo / Umukozi',
    phoneLabel: 'Telefone (Igaragara kuri fagitire & WhatsApp)',
    locationLabel: 'Aho Iduka Riherereye / Aderesi',
    allowNegativeStockLabel: 'Kwemerera kugurisha nubwo igicuruzwa cyaba cyashize (Negative inventory)',
    saveProfileBtn: 'Bika Ibyerekeye Iduka',
    profileSavedMsg: 'Ibyerekeye iduka bibitswe neza!',
    backupSectionTitle: 'Gufata Kopi (Backup) no Kugarura Amakuru',
    backupSectionDesc:
      'Amakuru y\'ubucuruzi abikwa kuri iyi telefone. Fata kopi ya JSON buri gihe kugira ngo amakuru yawe adatakara cyangwa ushobore kuyimurira ku yindi telefone.',
    downloadBackupBtn: 'Kura Kopi ya JSON Kuri Telefoni',
    restoreBackupBtn: 'Garura Amakuru Uvanye Kuri Kopi',
    resetAllDataBtn: 'Gusiba Amakuru Yose',
    loadDemoDataBtn: 'Shyiramo Amakuru y\'Icyitegererezo',
    selectLanguageTitle: 'Hitamo Ururimi / Select Language',
  },
};
