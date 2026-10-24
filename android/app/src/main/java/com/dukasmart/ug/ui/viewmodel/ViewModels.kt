package com.dukasmart.ug.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.dukasmart.ug.data.model.*
import com.dukasmart.ug.data.repository.*
import com.dukasmart.ug.domain.FinancialCalculator
import com.dukasmart.ug.domain.FinancialCalculationsResult
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val productRepository: ProductRepository,
    private val saleRepository: SaleRepository,
    private val customerRepository: CustomerRepository,
    private val expenseRepository: ExpenseRepository,
    private val reportsRepository: ReportsRepository
) : ViewModel() {

    val activeProducts = productRepository.activeProducts
    val lowStockProducts = productRepository.lowStockProducts
    val recentSales = saleRepository.allSales.map { it.take(5) }
    val allCustomers = customerRepository.allCustomers
    val expenses = expenseRepository.allExpenses

    private val _financials = MutableStateFlow<FinancialCalculationsResult?>(null)
    val financials: StateFlow<FinancialCalculationsResult?> = _financials.asStateFlow()

    init {
        refreshFinancials()
    }

    fun refreshFinancials() {
        viewModelScope.launch {
            val bundles = reportsRepository.getSalesBundles()
            val expList = expenses.first()
            val result = FinancialCalculator.calculate(bundles, expList)
            _financials.value = result
        }
    }
}

class ProductsViewModel(
    private val productRepository: ProductRepository
) : ViewModel() {
    val products = productRepository.activeProducts
    val lowStockProducts = productRepository.lowStockProducts

    fun addProduct(product: ProductEntity) {
        viewModelScope.launch {
            productRepository.addProduct(product)
        }
    }

    fun restock(productId: String, quantity: Double, newCost: Long? = null) {
        viewModelScope.launch {
            productRepository.restock(productId, quantity, newCost)
        }
    }

    fun archive(productId: String) {
        viewModelScope.launch {
            productRepository.archiveProduct(productId)
        }
    }
}

class SalesViewModel(
    private val saleRepository: SaleRepository,
    private val productRepository: ProductRepository,
    private val customerRepository: CustomerRepository
) : ViewModel() {
    val allSales = saleRepository.allSales
    val products = productRepository.activeProducts
    val customers = customerRepository.allCustomers

    fun completeSale(sale: SaleEntity, items: List<SaleItemEntity>) {
        viewModelScope.launch {
            saleRepository.executeSale(sale, items)
        }
    }

    fun voidSale(saleId: String, reason: String) {
        viewModelScope.launch {
            saleRepository.voidSale(saleId, reason)
        }
    }
}

class CustomersViewModel(
    private val customerRepository: CustomerRepository
) : ViewModel() {
    val customers = customerRepository.allCustomers

    fun addCustomer(customer: CustomerEntity) {
        viewModelScope.launch {
            customerRepository.addCustomer(customer)
        }
    }

    fun recordRepayment(customerId: String, name: String, amount: Long, method: String) {
        viewModelScope.launch {
            customerRepository.recordRepayment(customerId, name, amount, method)
        }
    }
}
