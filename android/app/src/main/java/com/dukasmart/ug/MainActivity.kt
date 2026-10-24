package com.dukasmart.ug

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.dukasmart.ug.ui.navigation.AppBottomNavigation
import com.dukasmart.ug.ui.navigation.AppNavGraph
import com.dukasmart.ug.ui.theme.DukaSmartUGTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as DukaSmartApplication

        setContent {
            DukaSmartUGTheme {
                val navController = rememberNavController()

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        AppBottomNavigation(navController = navController)
                    }
                ) { innerPadding ->
                    AppNavGraph(
                        navController = navController,
                        app = app,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}
