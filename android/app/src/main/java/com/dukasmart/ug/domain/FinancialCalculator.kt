package com.dukasmart.ug.domain

import com.dukasmart.ug.data.model.ExpenseEntity
import com.dukasmart.ug.data.model.SaleEntity
import com.dukasmart.ug.data.model.SaleItemEntity

data class SaleBundle(
    val sale: SaleEntity,
    val items: List<SaleItemEntity>
)

data class FinancialCalculationsResult(
    val grossSales: Long,
    val discounts: Long,
    val netSales: Long,
    val costOfGoodsSold: Long,
    val grossProfit: Long,
    val operatingExpenses: Long,
    val netOperatingProfit: Long,
    val cashCollected: Long,
    val mobileMoneyCollected: Long,
    val creditDebtsCreated: Long
)

object FinancialCalculator {

    /**
     * Calculates financial metrics using exact integer arithmetic (in UGX).
     * COGS uses historical unit cost recorded at the time of sale.
     */
    fun calculate(
        salesWithItems: List<SaleBundle>,
        expenses: List<ExpenseEntity>,
        repaymentsCash: Long = 0L,
        repaymentsMoMo: Long = 0L
    ): FinancialCalculationsResult {
        var grossSales = 0L
        var discounts = 0L
        var cogs = 0L
        var cash = 0L
        var momo = 0L
        var credit = 0L

        for (bundle in salesWithItems) {
            val sale = bundle.sale
            if (sale.isVoided) continue

            grossSales += sale.subtotal
            discounts += sale.discount

            for (item in bundle.items) {
                cogs += (item.quantity * item.unitCost).toLong()
            }

            if (sale.paymentMethodSummary.contains("CASH")) {
                cash += sale.amountPaid
            } else if (sale.paymentMethodSummary.contains("MOMO") || sale.paymentMethodSummary.contains("AIRTEL")) {
                momo += sale.amountPaid
            }

            if (sale.outstandingBalance > 0) {
                credit += sale.outstandingBalance
            }
        }

        cash += repaymentsCash
        momo += repaymentsMoMo

        val netSales = grossSales - discounts
        val grossProfit = netSales - cogs
        val totalExpenses = expenses.sumOf { it.amount }
        val netOperatingProfit = grossProfit - totalExpenses

        return FinancialCalculationsResult(
            grossSales = grossSales,
            discounts = discounts,
            netSales = netSales,
            costOfGoodsSold = cogs,
            grossProfit = grossProfit,
            operatingExpenses = totalExpenses,
            netOperatingProfit = netOperatingProfit,
            cashCollected = cash,
            mobileMoneyCollected = momo,
            creditDebtsCreated = credit
        )
    }

    /**
     * Formats integer UGX amount to string, e.g. 125000 -> "UGX 125,000"
     */
    fun formatUGX(amount: Long): String {
        return "UGX %,d".format(amount)
    }
}
