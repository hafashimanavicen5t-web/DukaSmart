package com.dukasmart.ug.data.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "products",
    indices = [Index(value = ["sku"], unique = true)]
)
data class ProductEntity(
    @PrimaryKey val id: String,
    val name: String,
    val sku: String? = null,
    val category: String = "General",
    val costPrice: Long, // in UGX integer
    val sellingPrice: Long, // in UGX integer
    val stockQuantity: Double,
    val lowStockThreshold: Double = 5.0,
    val allowDecimal: Boolean = false,
    val supplier: String? = null,
    val isArchived: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "sales",
    indices = [Index(value = ["saleNumber"], unique = true), Index(value = ["timestamp"])]
)
data class SaleEntity(
    @PrimaryKey val id: String,
    val saleNumber: String,
    val timestamp: Long = System.currentTimeMillis(),
    val subtotal: Long,
    val discount: Long = 0L,
    val totalAmount: Long,
    val amountPaid: Long,
    val outstandingBalance: Long = 0L,
    val paymentStatus: String, // "PAID", "PARTIAL", "UNPAID", "VOIDED"
    val customerId: String? = null,
    val customerName: String? = null,
    val paymentMethodSummary: String, // e.g. "CASH", "MTN_MOMO", "SPLIT"
    val notes: String? = null,
    val isVoided: Boolean = false,
    val voidReason: String? = null
)

@Entity(
    tableName = "sale_items",
    foreignKeys = [
        ForeignKey(
            entity = SaleEntity::class,
            parentColumns = ["id"],
            childColumns = ["saleId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["saleId"]), Index(value = ["productId"])]
)
data class SaleItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val saleId: String,
    val productId: String,
    val productName: String,
    val quantity: Double,
    val unitCost: Long, // Historical cost in UGX at time of sale
    val unitPrice: Long, // Selling price in UGX
    val lineTotal: Long
)

@Entity(
    tableName = "customers",
    indices = [Index(value = ["name"])]
)
data class CustomerEntity(
    @PrimaryKey val id: String,
    val name: String,
    val phone: String? = null,
    val outstandingBalance: Long = 0L,
    val creditLimit: Long? = null,
    val notes: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "customer_payments",
    indices = [Index(value = ["customerId"]), Index(value = ["timestamp"])]
)
data class CustomerPaymentEntity(
    @PrimaryKey val id: String,
    val customerId: String,
    val customerName: String,
    val amount: Long, // in UGX integer
    val paymentMethod: String, // "CASH", "MTN_MOMO", "AIRTEL_MONEY"
    val notes: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "expenses",
    indices = [Index(value = ["category"]), Index(value = ["timestamp"])]
)
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val description: String,
    val category: String, // Rent, Transport, Electricity, Wages, Packaging, Repairs, Other
    val amount: Long, // in UGX integer
    val paymentMethod: String,
    val notes: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "inventory_movements",
    indices = [Index(value = ["productId"]), Index(value = ["timestamp"])]
)
data class InventoryMovementEntity(
    @PrimaryKey val id: String,
    val productId: String,
    val productName: String,
    val type: String, // "SALE", "RESTOCK", "RETURN", "CORRECTION", "INITIAL"
    val quantityChange: Double,
    val quantityBefore: Double,
    val quantityAfter: Double,
    val referenceId: String? = null,
    val note: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)
