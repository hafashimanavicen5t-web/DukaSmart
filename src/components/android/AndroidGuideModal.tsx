import React, { useState } from 'react';
import {
  X,
  Smartphone,
  FileCode,
  Copy,
  Check,
  Terminal,
  Layers,
  Cpu,
  BookOpen,
} from 'lucide-react';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('Entities.kt');

  if (!isOpen) return null;

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleSnippets: Record<string, { title: string; language: string; code: string }> = {
    'Entities.kt': {
      title: 'Room Database Entities (Entities.kt)',
      language: 'kotlin',
      code: `package com.dukasmart.ug.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey val id: String,
    val name: String,
    val sku: String?,
    val category: String,
    val costPrice: Long, // in UGX integer
    val sellingPrice: Long, // in UGX integer
    val stockQuantity: Double,
    val lowStockThreshold: Double,
    val allowDecimal: Boolean,
    val supplier: String?,
    val isArchived: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "sales")
data class SaleEntity(
    @PrimaryKey val id: String,
    val saleNumber: String,
    val timestamp: Long,
    val subtotal: Long,
    val discount: Long,
    val totalAmount: Long,
    val amountPaid: Long,
    val outstandingBalance: Long,
    val paymentStatus: String, // PAID, PARTIAL, UNPAID, VOIDED
    val customerId: String?,
    val customerName: String?,
    val notes: String?,
    val isVoided: Boolean = false,
    val voidReason: String? = null
)

@Entity(tableName = "sale_items")
data class SaleItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val saleId: String,
    val productId: String,
    val productName: String,
    val quantity: Double,
    val unitCost: Long,
    val unitPrice: Long,
    val lineTotal: Long
)

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey val id: String,
    val name: String,
    val phone: String?,
    val outstandingBalance: Long = 0,
    val creditLimit: Long? = null,
    val notes: String?,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val description: String,
    val category: String,
    val amount: Long, // in UGX integer
    val paymentMethod: String,
    val timestamp: Long = System.currentTimeMillis(),
    val notes: String? = null
)

@Entity(tableName = "inventory_movements")
data class InventoryMovementEntity(
    @PrimaryKey val id: String,
    val productId: String,
    val productName: String,
    val type: String, // SALE, RESTOCK, RETURN, CORRECTION
    val quantityChange: Double,
    val quantityBefore: Double,
    val quantityAfter: Double,
    val referenceId: String?,
    val timestamp: Long = System.currentTimeMillis(),
    val note: String? = null
)`,
    },
    'Daos.kt': {
      title: 'Room DAOs (Daos.kt)',
      language: 'kotlin',
      code: `package com.dukasmart.ug.data.dao

import androidx.room.*
import com.dukasmart.ug.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products WHERE isArchived = 0 ORDER BY name ASC")
    fun getAllActiveProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE stockQuantity <= lowStockThreshold AND isArchived = 0")
    fun getLowStockProducts(): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity)

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Query("UPDATE products SET stockQuantity = stockQuantity + :qtyChange, updatedAt = :now WHERE id = :productId")
    suspend fun adjustStock(productId: String, qtyChange: Double, now: Long = System.currentTimeMillis())
}

@Dao
interface SaleDao {
    @Query("SELECT * FROM sales ORDER BY timestamp DESC")
    fun getAllSales(): Flow<List<SaleEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertSale(sale: SaleEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSaleItems(items: List<SaleItemEntity>)

    @Query("SELECT * FROM sale_items WHERE saleId = :saleId")
    suspend fun getItemsForSale(saleId: String): List<SaleItemEntity>

    @Transaction
    suspend fun executeSaleAtomic(
        sale: SaleEntity,
        items: List<SaleItemEntity>,
        productDao: ProductDao,
        customerDao: CustomerDao
    ) {
        insertSale(sale)
        insertSaleItems(items)
        for (item in items) {
            productDao.adjustStock(item.productId, -item.quantity)
        }
        if (sale.customerId != null && sale.outstandingBalance > 0) {
            customerDao.increaseDebt(sale.customerId, sale.outstandingBalance)
        }
    }
}

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers ORDER BY name ASC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Query("UPDATE customers SET outstandingBalance = outstandingBalance + :amount WHERE id = :customerId")
    suspend fun increaseDebt(customerId: String, amount: Long)

    @Query("UPDATE customers SET outstandingBalance = outstandingBalance - :amount WHERE id = :customerId")
    suspend fun reduceDebt(customerId: String, amount: Long)
}

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY timestamp DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)
}`,
    },
    'FinancialLogic.kt': {
      title: 'Financial & Profit Calculations (FinancialCalculations.kt)',
      language: 'kotlin',
      code: `package com.dukasmart.ug.domain

data class FinancialReport(
    val grossSales: Long,
    val discounts: Long,
    val netSales: Long,
    val costOfGoodsSold: Long,
    val grossProfit: Long,
    val operatingExpenses: Long,
    val netOperatingProfit: Long,
    val cashCollected: Long,
    val mobileMoneyCollected: Long,
    val customerDebtsOutstanding: Long
)

object FinancialCalculator {
    /**
     * Calculates Gross Sales, Net Sales, Gross Profit, and Net Operating Profit
     * using exact integer UGX amounts and historical purchase costs at the time of sale.
     */
    fun computeSummary(
        sales: List<SaleWithItems>,
        expenses: List<ExpenseEntity>,
        customerDebts: Long
    ): FinancialReport {
        var grossSales = 0L
        var discounts = 0L
        var cogs = 0L
        var cash = 0L
        var momo = 0L

        for (sale in sales) {
            if (sale.sale.isVoided) continue
            grossSales += sale.sale.subtotal
            discounts += sale.sale.discount

            for (item in sale.items) {
                cogs += (item.quantity * item.unitCost).toLong()
            }
        }

        val netSales = grossSales - discounts
        val grossProfit = netSales - cogs
        val operatingExpenses = expenses.sumOf { it.amount }
        val netOperatingProfit = grossProfit - operatingExpenses

        return FinancialReport(
            grossSales = grossSales,
            discounts = discounts,
            netSales = netSales,
            costOfGoodsSold = cogs,
            grossProfit = grossProfit,
            operatingExpenses = operatingExpenses,
            netOperatingProfit = netOperatingProfit,
            cashCollected = cash,
            mobileMoneyCollected = momo,
            customerDebtsOutstanding = customerDebts
        )
    }
}`,
    },
    'build.gradle.kts': {
      title: 'Gradle Configuration (app/build.gradle.kts)',
      language: 'kotlin',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.dukasmart.ug"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.dukasmart.ug"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
}`,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-800" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Native Android Studio & APK Deliverable
              </h2>
              <p className="text-xs text-slate-500">
                Kotlin · Jetpack Compose · Material 3 · Room SQLite Database · MVVM Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Quick instructions box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
            <h3 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-800" />
              <span>How to build your Debug APK in Android Studio:</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-emerald-900 font-medium">
              <li>Open Android Studio, select <strong>File &gt; Open...</strong> and choose the <code>android</code> folder in this project.</li>
              <li>Wait for Gradle Sync to finish downloading libraries (Room 2.6, Compose BOM, Coroutines).</li>
              <li>Run <code>./gradlew assembleDebug</code> in the terminal, or click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
              <li>The output APK will be at <code>android/app/build/outputs/apk/debug/app-debug.apk</code>. Transfer it to any Android phone via USB/WhatsApp to install directly!</li>
            </ol>
          </div>

          {/* Code Viewer Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {Object.keys(sampleSnippets).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedFile === key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{key}</span>
                </button>
              ))}
            </div>

            {/* Code Snippet Box */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-mono">{sampleSnippets[selectedFile].title}</span>
                <button
                  onClick={() => handleCopy(selectedFile, sampleSnippets[selectedFile].code)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                >
                  {copiedKey === selectedFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-xs font-mono overflow-x-auto max-h-64 text-emerald-300 leading-relaxed scrollbar-thin">
                {sampleSnippets[selectedFile].code}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-xl hover:bg-emerald-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
