package com.dukasmart.ug.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dukasmart.ug.DukaSmartApplication
import com.dukasmart.ug.data.model.ProductEntity
import com.dukasmart.ug.domain.FinancialCalculator

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AndroidDashboardScreen(
    app: DukaSmartApplication,
    onNavigate: (String) -> Unit
) {
    val products by app.productRepository.activeProducts.collectAsState(initial = emptyList())
    val lowStock by app.productRepository.lowStockProducts.collectAsState(initial = emptyList())
    val sales by app.saleRepository.allSales.collectAsState(initial = emptyList())
    val customers by app.customerRepository.allCustomers.collectAsState(initial = emptyList())

    val totalDebt = customers.sumOf { it.outstandingBalance }
    val totalSalesAmt = sales.filter { !it.isVoided }.sumOf { it.totalAmount }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("DukaSmart UG — Dashboard", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Total Sales", style = MaterialTheme.typography.labelMedium)
                        Text(
                            FinancialCalculator.formatUGX(totalSalesAmt),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("${sales.size} total transactions", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(modifier = Modifier.weight(1f)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Customer Debts", style = MaterialTheme.typography.labelSmall)
                            Text(
                                FinancialCalculator.formatUGX(totalDebt),
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFB45309)
                            )
                        }
                    }

                    Card(modifier = Modifier.weight(1f)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Active Products", style = MaterialTheme.typography.labelSmall)
                            Text("${products.size} items", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            if (lowStock.isNotEmpty()) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                "⚠️ Low Stock Alert (${lowStock.size} items)",
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF78350F)
                            )
                            Text(
                                lowStock.joinToString { "${it.name} (${it.stockQuantity})" },
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF92400E)
                            )
                        }
                    }
                }
            }

            item {
                Text(
                    "Recent Transactions",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            items(sales.take(5)) { sale ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(sale.saleNumber, fontWeight = FontWeight.Bold)
                            Text(
                                if (sale.customerName != null) sale.customerName else "Cash Customer",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        Text(
                            FinancialCalculator.formatUGX(sale.totalAmount),
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AndroidProductsScreen(app: DukaSmartApplication) {
    val products by app.productRepository.activeProducts.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Inventory Products (${products.size})") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(products) { product ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(product.name, fontWeight = FontWeight.Bold)
                            Text(
                                "${product.stockQuantity} left",
                                fontWeight = FontWeight.Bold,
                                color = if (product.stockQuantity <= product.lowStockThreshold) Color.Red else MaterialTheme.colorScheme.primary
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Selling: ${FinancialCalculator.formatUGX(product.sellingPrice)}", style = MaterialTheme.typography.bodySmall)
                            Text("Cost: ${FinancialCalculator.formatUGX(product.costPrice)}", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AndroidSalesScreen(app: DukaSmartApplication) {
    val sales by app.saleRepository.allSales.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sales & POS Register") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(sales) { sale ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(sale.saleNumber, fontWeight = FontWeight.Bold)
                            Text(
                                FinancialCalculator.formatUGX(sale.totalAmount),
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text("Paid: ${sale.paymentMethodSummary} · Status: ${sale.paymentStatus}", style = MaterialTheme.typography.bodySmall)
                        if (sale.outstandingBalance > 0) {
                            Text("Debt: ${FinancialCalculator.formatUGX(sale.outstandingBalance)}", color = Color(0xFFB45309), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AndroidCustomersScreen(app: DukaSmartApplication) {
    val customers by app.customerRepository.allCustomers.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customers & Debt Ledger") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(customers) { customer ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(customer.name, fontWeight = FontWeight.Bold)
                            Text(customer.phone ?: "No phone", style = MaterialTheme.typography.bodySmall)
                        }
                        Text(
                            FinancialCalculator.formatUGX(customer.outstandingBalance),
                            fontWeight = FontWeight.Bold,
                            color = if (customer.outstandingBalance > 0) Color(0xFFB45309) else MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AndroidReportsScreen(app: DukaSmartApplication) {
    val sales by app.saleRepository.allSales.collectAsState(initial = emptyList())
    val expenses by app.expenseRepository.allExpenses.collectAsState(initial = emptyList())

    val totalSales = sales.filter { !it.isVoided }.sumOf { it.totalAmount }
    val totalExpenses = expenses.sumOf { it.amount }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Business Reports & Profit") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Total Revenue", style = MaterialTheme.typography.labelSmall)
                    Text(FinancialCalculator.formatUGX(totalSales), fontWeight = FontWeight.Bold, fontSize = 20.sp)
                }
            }
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Total Operating Expenses", style = MaterialTheme.typography.labelSmall)
                    Text(FinancialCalculator.formatUGX(totalExpenses), fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.Red)
                }
            }
        }
    }
}
