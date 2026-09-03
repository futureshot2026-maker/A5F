package com.a5f.social

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.a5f.social.ui.nav.A5FNavGraph
import com.a5f.social.ui.theme.A5FSocialTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            A5FSocialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    A5FNavGraph()
                }
            }
        }
    }
}
