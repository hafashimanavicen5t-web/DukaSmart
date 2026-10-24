package com.dukasmart.ug.data.repository

import com.dukasmart.ug.data.dao.*
import com.dukasmart.ug.data.model.*
import com.dukasmart.ug.domain.FinancialCalculator
import com.dukasmart.ug.domain.SaleBundle
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class ProductRepository(
    private val productDao: ProductDao,
    private val movementDao: InventoryMovementDao
) {
    val activeProducts: Flow<List<ProductEntity>> = productDao.getAllActiveProducts()
    val lowStockProducts: Flow<List<ProductEntity>> = productDao.getLowStockProducts()

    suspend fun addProduct(product: ProductEntity) {
        productDao.insertProduct(product)
        if (product.stockQuantity > 0) {
            movementDao.insertMovement(
                InventoryMovementEntity(
                    id = "mov_${System.currentTimeMillis()}",
                    productId = product.id,
                    productName = product.name,
                    type = "INITIAL",
                    quantityChange = product.stockQuantity,
                    quantityBefore = 0.0,
                    quantityAfter = product.stockQuantity,
                    note = "Initial stock"
                )
            )
        }
    }

    suspend fun updateProduct(product: ProductEntity) {
        productDao.updateProduct(product)
    }

    suspend fun restock(productId: String, quantity: Double, newCost: Long? = null, note: String? = null) {
        val prod = productDao.getProductById(productId) ?: return
        val before = prod.stockQuantity
        val after = before + quantity
        productDao.adjustStock(productId, quantity)

        movementDao.insertMovement(
            InventoryMovementEntity(
                id = "mov_${System.currentTimeMillis()}",
                productId = productId,
                productName = prod.name,
                type = "RESTOCK",
                quantityChange = quantity,
                quantityBefore = before,
                quantityAfter = after,
                note = note ?: "Restocked $quantity units"
            )
        )
    }

    suspend fun archiveProduct(productId: String) {
        productDao.archiveProduct(productId)
    }
}

class SaleRepository(
    private val saleDao: SaleDao,
    private val productDao: ProductDao,
    private val customerDao: CustomerDao,
    private val movementDao: InventoryMovementDao
) {
    val allSales: Flow<List<SaleEntity>> = saleDao.getAllSales()

    suspend fun executeSale(
        sale: SaleEntity,
        items: List<SaleItemEntity>
    ) {
        saleDao.insertSale(sale)
        saleDao.insertSaleItems(items)

        // Deduct stock atomically and write movements
        for (item in items) {
            val prod = productDao.getProductById(item.productId)
            val before = prod?.stockQuantity ?: 0.0
            val after = before - item.quantity

            productDao.adjustStock(item.productId, -item.quantity)

            movementDao.insertMovement(
                InventoryMovementEntity(
                    id = "mov_${System.currentTimeMillis()}_${item.productId}",
                    productId = item.productId,
                    productName = item.productName,
                    type = "SALE",
                    quantityChange = -item.quantity,
                    quantityBefore = before,
                    quantityAfter = after,
                    referenceId = sale.id,
                    note = "Sold in ${sale.saleNumber}"
                )
            )
        }

        // If credit, record customer debt
        if (sale.customerId != null && sale.outstandingBalance > 0) {
            customerDao.increaseDebt(sale.customerId, sale.outstandingBalance)
        }
    }

    suspend fun voidSale(saleId: String, reason: String) {
        val sale = saleDao.getSaleById(saleId) ?: return
        if (sale.isVoided) return

        saleDao.markSaleVoided(saleId, reason)
        val items = saleDao.getItemsForSale(saleId)

        // Return stock
        for (item in items) {
            val prod = productDao.getProductById(item.productId)
            val before = prod?.stockQuantity ?: 0.0
            val after = before + item.quantity

            productDao.adjustStock(item.productId, item.quantity)

            movementDao.insertMovement(
                InventoryMovementEntity(
                    id = "mov_ret_${System.currentTimeMillis()}_${item.productId}",
                    productId = item.productId,
                    productName = item.productName,
                    type = "RETURN",
                    quantityChange = item.quantity,
                    quantityBefore = before,
                    quantityAfter = after,
                    referenceId = sale.id,
                    note = "Voided sale: $reason"
                )
            )
        }

        // Reverse customer debt if applicable
        if (sale.customerId != null && sale.outstandingBalance > 0) {
            customerDao.reduceDebt(sale.customerId, sale.outstandingBalance)
        }
    }
}

class CustomerRepository(private val customerDao: CustomerDao) {
    val allCustomers: Flow<List<CustomerEntity>> = customerDao.getAllCustomers()

    suspend fun addCustomer(customer: CustomerEntity) {
        customerDao.insertCustomer(customer)
    }

    suspend fun recordRepayment(
        customerId: String,
        customerName: String,
        amount: Long,
        paymentMethod: String,
        notes: String? = null
    ) {
        customerDao.reduceDebt(customerId, amount)
        customerDao.insertPayment(
            CustomerPaymentEntity(
                id = "cpay_${System.currentTimeMillis()}",
                customerId = customerId,
                customerName = customerName,
                amount = amount,
                paymentMethod = paymentMethod,
                notes = notes
            )
        )
    }
}

class ExpenseRepository(private val expenseDao: ExpenseDao) {
    val allExpenses: Flow<List<ExpenseEntity>> = expenseDao.getAllExpenses()

    suspend fun addExpense(expense: ExpenseEntity) {
        expenseDao.insertExpense(expense)
    }

    suspend fun deleteExpense(expense: ExpenseEntity) {
        expenseDao.deleteExpense(expense)
    }
}

class ReportsRepository(
    private val saleDao: SaleDao,
    private val expenseDao: ExpenseDao,
    private val customerDao: CustomerDao,
    private val productDao: ProductDao
) {
    suspend fun getSalesBundles(): List<SaleBundle> {
        val sales = saleDao.getAllSales().first()
        return sales.map { sale ->
            val items = saleDao.getItemsForSale(sale.id)
            SaleBundle(sale, items)
        }
    }
}
