package com.dukasmart.ug.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.dukasmart.ug.DukaSmartApplication
import com.dukasmart.ug.ui.screens.*

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Dashboard", Icons.Default.Dashboard)
    object Products : Screen("products", "Products", Icons.Default.Inventory2)
    object Sales : Screen("sales", "Sales", Icons.Default.PointOfSale)
    object Customers : Screen("customers", "Customers", Icons.Default.People)
    object Reports : Screen("reports", "Reports", Icons.Default.Assessment)
}

@Composable
fun AppBottomNavigation(navController: NavHostController) {
    val items = listOf(
        Screen.Dashboard,
        Screen.Products,
        Screen.Sales,
        Screen.Customers,
        Screen.Reports
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar {
        items.forEach { screen ->
            NavigationBarItem(
                icon = { Icon(screen.icon, contentDescription = screen.title) },
                label = { Text(screen.title) },
                selected = currentRoute == screen.route,
                onClick = {
                    if (currentRoute != screen.route) {
                        navController.navigate(screen.route) {
                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }
    }
}

@Composable
fun AppNavGraph(
    navController: NavHostController,
    app: DukaSmartApplication,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route,
        modifier = modifier
    ) {
        composable(Screen.Dashboard.route) {
            AndroidDashboardScreen(app = app, onNavigate = { route -> navController.navigate(route) })
        }
        composable(Screen.Products.route) {
            AndroidProductsScreen(app = app)
        }
        composable(Screen.Sales.route) {
            AndroidSalesScreen(app = app)
        }
        composable(Screen.Customers.route) {
            AndroidCustomersScreen(app = app)
        }
        composable(Screen.Reports.route) {
            AndroidReportsScreen(app = app)
        }
    }
}
