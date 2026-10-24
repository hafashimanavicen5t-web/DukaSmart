# DukaSmart UG — Native Android Studio & APK Setup Guide

This document describes how to build, test, and install **DukaSmart UG** on Android devices.

---

## 1. Project Architecture & Tech Stack

- **Platform:** Native Android (Min SDK 26 - Android 8.0 Oreo, Target SDK 34 - Android 14)
- **Programming Language:** Kotlin 1.9.22
- **UI Framework:** Jetpack Compose with Material 3 Design
- **Local Persistence:** Room SQLite (100% offline-first, Coroutines & Flow reactive streams)
- **Architecture:** MVVM (Model-View-ViewModel) with a strict Repository pattern
- **Currency:** Ugandan Shillings (UGX) using exact integer arithmetic (no floating point currency rounding issues)

---

## 2. Directory Structure

```
android/
├── build.gradle.kts           # Top-level Gradle script
├── settings.gradle.kts         # Subproject configuration
├── gradle.properties          # JVM memory and AndroidX properties
└── app/
    ├── build.gradle.kts       # App-level dependencies (Room, Compose, Coroutines)
    ├── proguard-rules.pro     # Code obfuscation and Room rules
    └── src/
        ├── main/
        │   ├── AndroidManifest.xml
        │   ├── res/values/
        │   │   ├── colors.xml  # Material 3 colors (#1B5E20 emerald green)
        │   │   ├── strings.xml # App name
        │   │   └── themes.xml  # Light/Dark themes
        │   └── java/com/dukasmart/ug/
        │       ├── DukaSmartApplication.kt  # Application class with repository DI
        │       ├── MainActivity.kt          # Compose host activity
        │       ├── data/
        │       │   ├── model/Entities.kt     # Room Entities (Product, Sale, Customer, Expense, Movement)
        │       │   ├── dao/Daos.kt           # Room DAOs with atomic transactions
        │       │   ├── database/DukaSmartDatabase.kt # Room database singleton with pre-seeded sample products
        │       │   └── repository/Repositories.kt    # Repositories for all domain areas
        │       ├── domain/
        │       │   └── FinancialCalculator.kt # Exact integer UGX financial and profit calculations
        │       └── ui/
        │           ├── navigation/NavGraph.kt # 5-tab Bottom Navigation
        │           ├── theme/Theme.kt         # Material 3 Theme setup
        │           ├── viewmodel/ViewModels.kt # ViewModels managing UI state
        │           └── screens/ComposeScreens.kt # Compose UI screens
        └── test/
            └── java/com/dukasmart/ug/
                └── FinancialCalculationsTest.kt # Automated unit tests for profit & COGS
```

---

## 3. Step-by-Step Android Studio Build Instructions

### Prerequisites
1. Download & Install [Android Studio](https://developer.android.com/studio) (Hedgehog, Iguana, or newer).
2. Ensure JDK 17 or higher is installed and configured in Android Studio (`Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK`).

### Opening the Project
1. Launch Android Studio.
2. Select **Open** (or `File > Open...`).
3. Browse to and select the `android` folder in this repository.
4. Android Studio will automatically run Gradle Sync to resolve Room, Compose, and AndroidX dependencies.

### Running Unit Tests
In Android Studio's terminal or Gradle tool window:
```bash
./gradlew testDebugUnitTest
```
Or right-click `FinancialCalculationsTest.kt` in the Project Explorer and click **Run 'FinancialCalculationsTest'**.

### Building the Debug APK
In Android Studio's terminal:
```bash
./gradlew assembleDebug
```
Alternatively, in the top menu bar, click:
**Build > Build Bundle(s) / APK(s) > Build APK(s)**

The compiled APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Installing the APK on a Physical Android Phone

1. **Via USB Debugging:**
   - Enable Developer Options and USB Debugging on your phone.
   - Connect phone to your PC via USB cable.
   - Click the green **Run (▶)** button in Android Studio or run:
     ```bash
     ./gradlew installDebug
     ```

2. **Direct APK Transfer (No PC Required):**
   - Copy `app-debug.apk` to your phone via WhatsApp, Telegram, Google Drive, or SD card.
   - Tap the APK file on your phone.
   - If prompted, tap **Allow install from unknown sources** in Android settings.
   - Tap **Install**. DukaSmart UG will open immediately and work 100% offline!

---

## 5. Summary of Implemented Features

1. **Dashboard:** Reactive KPIs (Sales, Cash collected, MoMo collected, Customer debt, Gross profit, Expenses, Est. Net Operating Profit), low stock warning alerts, date filters (Today, Yesterday, 7D, Month), recent transactions list.
2. **Product & Inventory Management:** Product CRUD with UGX pricing, cost tracking, stock tracking, decimal quantity support, low stock threshold alerts, stock movement audit trail, restock flow, and archive support.
3. **Sales & POS Checkout:** Fast product selection, multi-item cart, custom price overrides, UGX discount validation, payment method support (Cash, MTN MoMo, Airtel Money, Customer Credit, and Split Payments), atomic inventory deduction, and digital receipt generation.
4. **Voiding & Correction:** Safe voiding with reasons, atomic inventory return, and credit debt reversal without deleting transaction history.
5. **Customer Credit & Debt Ledger:** Customer register, credit debt tracking, partial and full repayments with balance verification, customer ledger statement, and 1-tap WhatsApp sharing.
6. **Operating Expenses Module:** Category tracking (Rent, Transport, Yaka electricity, Wages, Packaging, Repairs, Licences, Other) with audit trail.
7. **Business Reports:** P&L statement, margin percentages, best-selling products ranking, inventory tied-capital valuation, and payment channel distribution.
8. **Export & Backup:** Full CSV export for products, sales, debts, and expenses, plus complete JSON database backup and restore.
9. **Dual Architecture:** Native Android Kotlin/Room/Compose project in `/android/` alongside an offline-first PWA for instant cross-device access.
