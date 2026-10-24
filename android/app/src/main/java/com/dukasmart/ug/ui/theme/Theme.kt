package com.dukasmart.ug.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DukaGreen = Color(0xFF1B5E20)
val DukaGreenLight = Color(0xFF4C8C4A)
val DukaGreenDark = Color(0xFF003300)
val DukaGold = Color(0xFFE6A100)
val DukaBackground = Color(0xFFF8FAFC)
val DukaSurface = Color(0xFFFFFFFF)
val DukaOnPrimary = Color(0xFFFFFFFF)

private val LightColorScheme = lightColorScheme(
    primary = DukaGreen,
    onPrimary = DukaOnPrimary,
    primaryContainer = Color(0xFFA3F2A0),
    onPrimaryContainer = Color(0xFF002204),
    secondary = DukaGold,
    background = DukaBackground,
    surface = DukaSurface,
    onSurface = Color(0xFF0F172A)
)

private val DarkColorScheme = darkColorScheme(
    primary = DukaGreenLight,
    onPrimary = Color(0xFF00390A),
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFF8FAFC)
)

@Composable
fun DukaSmartUGTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
