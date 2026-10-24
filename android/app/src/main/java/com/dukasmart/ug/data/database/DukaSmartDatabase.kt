package com.dukasmart.ug.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.dukasmart.ug.data.dao.*
import com.dukasmart.ug.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        ProductEntity::class,
        SaleEntity::class,
        SaleItemEntity::class,
        CustomerEntity::class,
        CustomerPaymentEntity::class,
        ExpenseEntity::class,
        InventoryMovementEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class DukaSmartDatabase : RoomDatabase() {

    abstract fun productDao(): ProductDao
    abstract fun saleDao(): SaleDao
    abstract fun customerDao(): CustomerDao
    abstract fun expenseDao(): ExpenseDao
    abstract fun movementDao(): InventoryMovementDao

    companion object {
        @Volatile
        private var INSTANCE: DukaSmartDatabase? = null

        fun getDatabase(context: Context): DukaSmartDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    DukaSmartDatabase::class.java,
                    "dukasmart_ug.db"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(DatabaseCallback())
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                // Seed initial sample data as requested in prompt Section 15
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        seedInitialProducts(database.productDao(), database.movementDao())
                    }
                }
            }
        }

        private suspend fun seedInitialProducts(
            productDao: ProductDao,
            movementDao: InventoryMovementDao
        ) {
            val sampleProducts = listOf(
                ProductEntity(
                    id = "prod_sugar_1kg",
                    name = "Sugar 1kg",
                    sku = "SUG-001",
                    category = "Groceries",
                    costPrice = 3500L,
                    sellingPrice = 4000L,
                    stockQuantity = 20.0,
                    lowStockThreshold = 5.0,
                    allowDecimal = false,
                    supplier = "Kakira Sugar"
                ),
                ProductEntity(
                    id = "prod_rice_1kg",
                    name = "Rice 1kg",
                    sku = "RIC-002",
                    category = "Groceries",
                    costPrice = 3000L,
                    sellingPrice = 3500L,
                    stockQuantity = 15.0,
                    lowStockThreshold = 4.0,
                    allowDecimal = false,
                    supplier = "Tororo Millers"
                ),
                ProductEntity(
                    id = "prod_oil_1l",
                    name = "Cooking oil 1 litre",
                    sku = "OIL-003",
                    category = "Edible Oils",
                    costPrice = 6000L,
                    sellingPrice = 7000L,
                    stockQuantity = 10.0,
                    lowStockThreshold = 3.0,
                    allowDecimal = false,
                    supplier = "Bidco Uganda"
                )
            )

            for (prod in sampleProducts) {
                productDao.insertProduct(prod)
                movementDao.insertMovement(
                    InventoryMovementEntity(
                        id = "mov_init_${prod.id}",
                        productId = prod.id,
                        productName = prod.name,
                        type = "INITIAL",
                        quantityChange = prod.stockQuantity,
                        quantityBefore = 0.0,
                        quantityAfter = prod.stockQuantity,
                        note = "Initial sample stock"
                    )
                )
            }
        }
    }
}
