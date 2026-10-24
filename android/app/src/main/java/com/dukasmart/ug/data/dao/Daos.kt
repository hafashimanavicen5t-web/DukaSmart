package com.dukasmart.ug.data.dao

import androidx.room.*
import com.dukasmart.ug.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products WHERE isArchived = 0 ORDER BY name ASC")
    fun getAllActiveProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE id = :id LIMIT 1")
    suspend fun getProductById(id: String): ProductEntity?

    @Query("SELECT * FROM products WHERE stockQuantity <= lowStockThreshold AND isArchived = 0")
    fun getLowStockProducts(): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity)

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Query("UPDATE products SET isArchived = 1, updatedAt = :now WHERE id = :productId")
    suspend fun archiveProduct(productId: String, now: Long = System.currentTimeMillis())

    @Query("UPDATE products SET isArchived = 0, updatedAt = :now WHERE id = :productId")
    suspend fun unarchiveProduct(productId: String, now: Long = System.currentTimeMillis())

    @Query("UPDATE products SET stockQuantity = stockQuantity + :change, updatedAt = :now WHERE id = :productId")
    suspend fun adjustStock(productId: String, change: Double, now: Long = System.currentTimeMillis())
}

@Dao
interface SaleDao {
    @Query("SELECT * FROM sales ORDER BY timestamp DESC")
    fun getAllSales(): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE id = :saleId LIMIT 1")
    suspend fun getSaleById(saleId: String): SaleEntity?

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertSale(sale: SaleEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSaleItems(items: List<SaleItemEntity>)

    @Query("SELECT * FROM sale_items WHERE saleId = :saleId")
    suspend fun getItemsForSale(saleId: String): List<SaleItemEntity>

    @Query("UPDATE sales SET isVoided = 1, voidReason = :reason, paymentStatus = 'VOIDED' WHERE id = :saleId")
    suspend fun markSaleVoided(saleId: String, reason: String)

    @Query("SELECT COUNT(*) FROM sales")
    suspend fun getSaleCount(): Int
}

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers ORDER BY name ASC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Query("SELECT * FROM customers WHERE id = :customerId LIMIT 1")
    suspend fun getCustomerById(customerId: String): CustomerEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Update
    suspend fun updateCustomer(customer: CustomerEntity)

    @Query("UPDATE customers SET outstandingBalance = outstandingBalance + :amount, updatedAt = :now WHERE id = :customerId")
    suspend fun increaseDebt(customerId: String, amount: Long, now: Long = System.currentTimeMillis())

    @Query("UPDATE customers SET outstandingBalance = outstandingBalance - :amount, updatedAt = :now WHERE id = :customerId")
    suspend fun reduceDebt(customerId: String, amount: Long, now: Long = System.currentTimeMillis())

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayment(payment: CustomerPaymentEntity)

    @Query("SELECT * FROM customer_payments WHERE customerId = :customerId ORDER BY timestamp DESC")
    fun getPaymentsForCustomer(customerId: String): Flow<List<CustomerPaymentEntity>>

    @Query("SELECT * FROM customer_payments ORDER BY timestamp DESC")
    fun getAllCustomerPayments(): Flow<List<CustomerPaymentEntity>>
}

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY timestamp DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)
}

@Dao
interface InventoryMovementDao {
    @Query("SELECT * FROM inventory_movements ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentMovements(limit: Int = 100): Flow<List<InventoryMovementEntity>>

    @Query("SELECT * FROM inventory_movements WHERE productId = :productId ORDER BY timestamp DESC")
    fun getMovementsForProduct(productId: String): Flow<List<InventoryMovementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMovement(movement: InventoryMovementEntity)
}
