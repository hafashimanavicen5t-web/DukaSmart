package com.dukasmart.ug

import com.dukasmart.ug.data.model.ExpenseEntity
import com.dukasmart.ug.data.model.SaleEntity
import com.dukasmart.ug.data.model.SaleItemEntity
import com.dukasmart.ug.domain.FinancialCalculator
import com.dukasmart.ug.domain.SaleBundle
import org.junit.Assert.assertEquals
import org.junit.Test

class FinancialCalculationsTest {

    @Test
    fun testFinancialCalculations_GrossProfitAndNetOperatingProfit() {
        // Sale 1: 2 units of Sugar @ 4,000 UGX (cost 3,500 UGX) = 8,000 UGX subtotal, cost 7,000 UGX
        val sale1 = SaleEntity(
            id = "sale_1",
            saleNumber = "DUKA-001",
            timestamp = System.currentTimeMillis(),
            subtotal = 8000L,
            discount = 0L,
            totalAmount = 8000L,
            amountPaid = 8000L,
            outstandingBalance = 0L,
            paymentStatus = "PAID",
            paymentMethodSummary = "CASH"
        )
        val items1 = listOf(
            SaleItemEntity(
                id = 1,
                saleId = "sale_1",
                productId = "prod_sugar",
                productName = "Sugar 1kg",
                quantity = 2.0,
                unitCost = 3500L,
                unitPrice = 4000L,
                lineTotal = 8000L
            )
        )

        // Sale 2: 1 unit of Cooking Oil @ 7,000 UGX (cost 6,000 UGX), discount 500 UGX = 6,500 UGX total
        val sale2 = SaleEntity(
            id = "sale_2",
            saleNumber = "DUKA-002",
            timestamp = System.currentTimeMillis(),
            subtotal = 7000L,
            discount = 500L,
            totalAmount = 6500L,
            amountPaid = 0L,
            outstandingBalance = 6500L, // Credit sale
            paymentStatus = "UNPAID",
            paymentMethodSummary = "CREDIT",
            customerId = "cust_mukasa"
        )
        val items2 = listOf(
            SaleItemEntity(
                id = 2,
                saleId = "sale_2",
                productId = "prod_oil",
                productName = "Cooking oil 1L",
                quantity = 1.0,
                unitCost = 6000L,
                unitPrice = 7000L,
                lineTotal = 7000L
            )
        )

        // Operating Expenses: 3,000 UGX (Electricity)
        val expenses = listOf(
            ExpenseEntity(
                id = "exp_1",
                description = "Electricity Yaka",
                category = "Electricity",
                amount = 3000L,
                paymentMethod = "CASH"
            )
        )

        val bundles = listOf(
            SaleBundle(sale1, items1),
            SaleBundle(sale2, items2)
        )

        val result = FinancialCalculator.calculate(bundles, expenses)

        // Verifications
        // Gross sales = 8000 + 7000 = 15,000 UGX
        assertEquals(15000L, result.grossSales)

        // Discounts = 500 UGX
        assertEquals(500L, result.discounts)

        // Net sales = 15,000 - 500 = 14,500 UGX
        assertEquals(14500L, result.netSales)

        // COGS = (2 * 3500) + (1 * 6000) = 7,000 + 6,000 = 13,000 UGX
        assertEquals(13000L, result.costOfGoodsSold)

        // Gross profit = 14,500 - 13,000 = 1,500 UGX
        assertEquals(1500L, result.grossProfit)

        // Operating expenses = 3,000 UGX
        assertEquals(3000L, result.operatingExpenses)

        // Net operating profit estimate = 1,500 - 3,000 = -1,500 UGX
        assertEquals(-1500L, result.netOperatingProfit)

        // Cash collected = 8,000 UGX (excludes unpaid credit of 6,500 UGX)
        assertEquals(8000L, result.cashCollected)
        assertEquals(6500L, result.creditDebtsCreated)
    }

    @Test
    fun testCurrencyFormatting() {
        assertEquals("UGX 125,000", FinancialCalculator.formatUGX(125000L))
        assertEquals("UGX 3,500", FinancialCalculator.formatUGX(3500L))
        assertEquals("UGX 0", FinancialCalculator.formatUGX(0L))
    }
}
