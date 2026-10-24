package com.dukasmart.ug

import android.app.Application
import com.dukasmart.ug.data.database.DukaSmartDatabase
import com.dukasmart.ug.data.repository.*

class DukaSmartApplication : Application() {

    val database by lazy { DukaSmartDatabase.getDatabase(this) }

    val productRepository by lazy { ProductRepository(database.productDao(), database.movementDao()) }
    val saleRepository by lazy { SaleRepository(database.saleDao(), database.productDao(), database.customerDao(), database.movementDao()) }
    val customerRepository by lazy { CustomerRepository(database.customerDao()) }
    val expenseRepository by lazy { ExpenseRepository(database.expenseDao()) }
    val reportsRepository by lazy { ReportsRepository(database.saleDao(), database.expenseDao(), database.customerDao(), database.productDao()) }

    override fun onCreate() {
        super.onCreate()
    }
}
